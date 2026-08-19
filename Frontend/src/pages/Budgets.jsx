import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/budgets.css';

const API_BASE = 'http://localhost:4000/api/budgets';

const CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'ENTERTAINMENT',
  'UTILITIES',
  'HEALTH',
  'EDUCATION',
  'CLOTHING',
  'HOME',
  'TECHNOLOGY',
  'TRAVEL',
  'GIFTS',
  'OTHER'
];

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const ShieldAlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const WalletIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
    <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

function Budgets() {
  const getTodayMonthYear = () => {
    const d = new Date();
    const monthStr = String(d.getMonth() + 1).padStart(2, '0');
    return {
      iso: `${d.getFullYear()}-${monthStr}`,
      mes: d.getMonth() + 1,
      anio: d.getFullYear()
    };
  };

  const initialPeriod = getTodayMonthYear();
  const [periodISO, setPeriodISO] = useState(initialPeriod.iso);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [formData, setFormData] = useState({
    categoria: 'FOOD',
    limite: '',
    descripcion: ''
  });

  const getSelectedMonthYear = () => {
    if (!periodISO) return initialPeriod;
    const [y, m] = periodISO.split('-');
    return { mes: parseInt(m, 10), anio: parseInt(y, 10) };
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    fetchBudgetsAndAlerts();
  }, [periodISO]);

  const fetchBudgetsAndAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const { mes, anio } = getSelectedMonthYear();

      const [budgetsRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE}?mes=${mes}&anio=${anio}`),
        axios.get(`${API_BASE}/alerts?mes=${mes}&anio=${anio}`)
      ]);

      setBudgets(budgetsRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la API de presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (budgetToEdit = null) => {
    if (budgetToEdit) {
      setEditingBudgetId(budgetToEdit._id);
      setFormData({
        categoria: budgetToEdit.categoria,
        limite: budgetToEdit.limite,
        descripcion: budgetToEdit.descripcion || ''
      });
    } else {
      setEditingBudgetId(null);
      setFormData({
        categoria: 'FOOD',
        limite: '',
        descripcion: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBudgetId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { mes, anio } = getSelectedMonthYear();
      const payload = {
        categoria: formData.categoria,
        limite: parseFloat(formData.limite),
        mes,
        anio,
        descripcion: formData.descripcion
      };

      if (editingBudgetId) {
        await axios.put(`${API_BASE}/${editingBudgetId}`, payload);
        showToast('Presupuesto actualizado exitosamente', 'success');
      } else {
        await axios.post(API_BASE, payload);
        showToast('Presupuesto asignado exitosamente', 'success');
      }

      handleCloseModal();
      fetchBudgetsAndAlerts();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.errors?.[0]?.message || 'Error al guardar el presupuesto';
      showToast(errMsg, 'error');
    }
  };

  const handleDeleteBudget = async (id) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar este presupuesto?');
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE}/${id}`);
      showToast('Presupuesto eliminado exitosamente', 'success');
      fetchBudgetsAndAlerts();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Error al eliminar el presupuesto';
      showToast(errMsg, 'error');
    }
  };

  const formatMoney = (val) =>
    `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getCategorySpend = (catName) => {
    const alertMatch = alerts.find((a) => a.categoria.toUpperCase() === catName.toUpperCase());
    return alertMatch ? alertMatch.gastado : 0;
  };

  const activeAlerts = alerts.filter(
    (a) => a.nivel === 'advertencia' || a.nivel === 'critico' || a.porcentaje >= 80
  );

  return (
    <div className="budgets-container">
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? <CheckCircleIcon /> : <ShieldAlertIcon />}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <header className="budgets-topbar">
        <div className="brand">
          <div className="brand-mark">
            <WalletIcon />
          </div>
          <div>
            <h1>PocketFlow</h1>
            <p className="brand-sub">Presupuestos y Alertas Mensuales</p>
          </div>
        </div>

        <div className="budgets-actions">
          <div className="field">
            <label htmlFor="budget-period">Período de presupuesto</label>
            <input
              id="budget-period"
              type="month"
              value={periodISO}
              onChange={(e) => setPeriodISO(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <PlusIcon /> Asignar Presupuesto
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {activeAlerts.length > 0 && (
        <section className="alerts-banner-grid">
          {activeAlerts.map((alert, idx) => {
            const isCritical = alert.nivel === 'critico' || alert.porcentaje >= 100;
            return (
              <div
                key={idx}
                className={`alert-card ${isCritical ? 'critical' : 'warning'}`}
              >
                <div className="alert-icon">
                  {isCritical ? <ShieldAlertIcon /> : <AlertTriangleIcon />}
                </div>
                <div className="alert-content">
                  <h4>
                    {isCritical ? 'Presupuesto Excedido (100%+)' : 'Alerta de Límite (80%+)'}
                  </h4>
                  <p>{alert.mensaje}</p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section>
        <div className="budgets-section-header">
          <h2>Presupuestos Activos ({budgets.length})</h2>
        </div>

        {loading ? (
          <div className="empty-chart-state">Cargando presupuestos...</div>
        ) : budgets.length === 0 ? (
          <div className="empty-chart-state">
            No hay presupuestos asignados para este período. Haz clic en "Asignar Presupuesto" para comenzar.
          </div>
        ) : (
          <div className="budgets-grid">
            {budgets.map((b) => {
              const spent = getCategorySpend(b.categoria);
              const pct = Math.min(((spent / b.limite) * 100), 100);
              const realPct = (spent / b.limite) * 100;

              let statusClass = 'normal';
              let statusLabel = 'Normal';
              if (realPct >= 100) {
                statusClass = 'critical';
                statusLabel = 'Agotado (100%+)';
              } else if (realPct >= 80) {
                statusClass = 'warning';
                statusLabel = 'Advertencia (80%+)';
              }

              return (
                <div key={b._id} className="budget-card">
                  <div>
                    <div className="budget-card-header">
                      <span className="category-tag">{b.categoria}</span>
                      <span className={`status-badge ${statusClass}`}>{statusLabel}</span>
                    </div>

                    <div className="progress-container">
                      <div className="progress-labels">
                        <span>Gastado: <span className="progress-spent">{formatMoney(spent)}</span></span>
                        <span>Límite: {formatMoney(b.limite)}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${statusClass}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="budget-footer">
                    {b.descripcion && (
                      <div className="budget-description">
                        <span>"{b.descripcion}"</span>
                      </div>
                    )}

                    <div className="budget-footer-row">
                      <span className="budget-percentage-label">Usado: {realPct.toFixed(1)}%</span>
                      <div className="budget-card-actions">
                        <button
                          className="btn-edit-small"
                          onClick={() => handleOpenModal(b)}
                        >
                          <EditIcon /> Editar Límite
                        </button>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDeleteBudget(b._id)}
                        >
                          <TrashIcon /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBudgetId ? 'Editar Límite de Presupuesto' : 'Asignar Nuevo Presupuesto'}</h3>
              <button className="btn-close" onClick={handleCloseModal}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoria}
                  disabled={Boolean(editingBudgetId)}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Límite Mensual ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Ej. 500.00"
                  value={formData.limite}
                  onChange={(e) => setFormData({ ...formData, limite: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Descripción (Opcional)</label>
                <textarea
                  rows="3"
                  placeholder="Notas o detalles de este presupuesto..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingBudgetId ? 'Guardar Cambios' : 'Crear Presupuesto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Budgets;
