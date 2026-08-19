import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/expenses.css';

const API_BASE = 'http://localhost:4000/api/expenses';

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
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
    <path d="M10 11v6"></path>
    <path d="M14 11v6"></path>
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const ShieldAlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const ReceiptIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"></path>
    <line x1="8" y1="7" x2="16" y2="7"></line>
    <line x1="8" y1="11" x2="16" y2="11"></line>
    <line x1="8" y1="15" x2="12" y2="15"></line>
  </svg>
);

const emptyForm = { monto: '', categoria: 'FOOD', fecha: '', descripcion: '' };

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: '2-digit' });
}

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [toasts, setToasts] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError('');
      const url = filterCategoria ? `${API_BASE}?categoria=${filterCategoria}` : API_BASE;
      const res = await axios.get(url);
      setExpenses(res.data.data || []);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la API de gastos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategoria]);

  const handleOpenModal = (expense = null) => {
    setFieldErrors({});
    if (expense) {
      setEditingId(expense._id);
      setFormData({
        monto: expense.monto,
        categoria: expense.categoria,
        fecha: new Date(expense.fecha).toISOString().slice(0, 10),
        descripcion: expense.descripcion || ''
      });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm, fecha: todayISO() });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSaving(true);

    const payload = {
      monto: parseFloat(formData.monto),
      categoria: formData.categoria,
      fecha: formData.fecha,
      descripcion: formData.descripcion.trim()
    };

    try {
      if (editingId) {
        await axios.put(`${API_BASE}/${editingId}`, payload);
        showToast('Gasto actualizado exitosamente', 'success');
      } else {
        await axios.post(API_BASE, payload);
        showToast('Gasto registrado exitosamente', 'success');
      }
      handleCloseModal();
      fetchExpenses();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors && errors.length) {
        const mapped = {};
        errors.forEach((fe) => { mapped[fe.field] = fe.message; });
        setFieldErrors(mapped);
      } else {
        showToast(err.response?.data?.error || 'Error al guardar el gasto', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmTarget) return;
    try {
      await axios.delete(`${API_BASE}/${confirmTarget._id}`);
      showToast('Gasto eliminado', 'success');
      fetchExpenses();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'No se pudo eliminar el gasto', 'error');
    } finally {
      setConfirmTarget(null);
    }
  };

  return (
    <div className="expenses-container">
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? <CheckCircleIcon /> : <ShieldAlertIcon />}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <header className="expenses-topbar">
        <div className="brand">
          <div className="brand-mark">
            <ReceiptIcon />
          </div>
          <div>
            <h1>PocketFlow</h1>
            <p className="brand-sub">Gestión de Gastos</p>
          </div>
        </div>

        <div className="expenses-actions">
          <div className="field">
            <label htmlFor="filter-categoria">Categoría</label>
            <select
              id="filter-categoria"
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
            >
              <option value="">Todas</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <PlusIcon /> Nuevo Gasto
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section>
        <div className="expenses-section-header">
          <h2>Gastos Registrados ({expenses.length})</h2>
        </div>

        <div className="ledger-wrap">
          {loading ? (
            <div className="empty-chart-state">Cargando gastos…</div>
          ) : expenses.length === 0 ? (
            <div className="empty-chart-state">
              No hay gastos registrados todavía. Haz clic en "Nuevo Gasto" para comenzar.
            </div>
          ) : (
            <div className="ledger-scroll">
              <table className="ledger">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th className="col-amount">Monto</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp._id}>
                      <td>{formatDate(exp.fecha)}</td>
                      <td><span className="badge-cat">{exp.categoria}</span></td>
                      <td className="desc-cell" title={exp.descripcion || ''}>{exp.descripcion || '—'}</td>
                      <td className="col-amount">{formatMoney(exp.monto)}</td>
                      <td>
                        <div className="row-actions">
                          <button className="btn-icon" onClick={() => handleOpenModal(exp)} aria-label="Editar">
                            <EditIcon />
                          </button>
                          <button className="btn-icon danger" onClick={() => setConfirmTarget(exp)} aria-label="Eliminar">
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Gasto' : 'Nuevo Gasto'}</h3>
              <button className="btn-close" onClick={handleCloseModal}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999.99"
                  required
                  placeholder="Ej. 25.50"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                />
                {fieldErrors.monto && <span className="field-error">{fieldErrors.monto}</span>}
              </div>

              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {fieldErrors.categoria && <span className="field-error">{fieldErrors.categoria}</span>}
              </div>

              <div className="form-group">
                <label>Fecha</label>
                <input
                  type="date"
                  required
                  max={todayISO()}
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
                {fieldErrors.fecha && <span className="field-error">{fieldErrors.fecha}</span>}
              </div>

              <div className="form-group">
                <label>Descripción (Opcional)</label>
                <textarea
                  rows="2"
                  maxLength={200}
                  placeholder="Ej. Almuerzo con el equipo"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
                {fieldErrors.descripcion && <span className="field-error">{fieldErrors.descripcion}</span>}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Guardando…' : editingId ? 'Guardar Cambios' : 'Crear Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="modal-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="modal-card" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Eliminar Gasto</h3>
              <button className="btn-close" onClick={() => setConfirmTarget(null)}>
                <XIcon />
              </button>
            </div>
            <p className="confirm-text">
              ¿Seguro que quieres eliminar <strong>{confirmTarget.categoria} · {formatMoney(confirmTarget.monto)}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmTarget(null)}>Cancelar</button>
              <button
                className="btn-primary"
                style={{ background: '#f87171', boxShadow: 'none' }}
                onClick={handleConfirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
