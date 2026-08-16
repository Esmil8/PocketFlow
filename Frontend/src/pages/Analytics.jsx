import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import '../styles/analytics.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const API_BASE = 'http://localhost:4000/api/analytics';

function Analytics() {
  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const [month, setMonth] = useState(todayISO());
  const [categories, setCategories] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [dailyAvg, setDailyAvg] = useState({ total: 0, dailyAverage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [month]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [catRes, monthRes, avgRes] = await Promise.all([
        axios.get(`${API_BASE}/categories?month=${month}`),
        axios.get(`${API_BASE}/months`),
        axios.get(`${API_BASE}/daily-average?month=${month}`)
      ]);

      setCategories(catRes.data.data || []);
      setMonthlyData(monthRes.data.data || []);
      setDailyAvg(avgRes.data.data || { total: 0, dailyAverage: 0 });
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con la API de analíticas.');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (val) =>
    `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const doughnutData = {
    labels: categories.map((c) => c.category),
    datasets: [
      {
        data: categories.map((c) => c.total),
        backgroundColor: [
          '#34D399', '#38BDF8', '#818CF8', '#F472B6', 
          '#FBBF24', '#A78BFA', '#4ADE80', '#FB923C'
        ],
        borderColor: '#121B2E',
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8C9AC2', boxWidth: 12, padding: 14 }
      }
    }
  };

  const barData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: 'Gasto total',
        data: monthlyData.map((m) => m.total),
        backgroundColor: '#34D399',
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        ticks: { color: '#8C9AC2' },
        grid: { display: false }
      },
      y: {
        ticks: { color: '#8C9AC2' },
        grid: { color: '#263352' }
      }
    }
  };

  return (
    <div className="analytics-container">
      <header className="analytics-topbar">
        <div className="brand">
          <span className="brand-mark">◧</span>
          <div>
            <h1>PocketFlow</h1>
            <p className="brand-sub">Módulo de analíticas y totalizadores</p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="period-selector">Período de análisis</label>
          <input
            id="period-selector"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="analytics-cards-grid">
        <div className="analytics-card">
          <span className="analytics-card__title">Total del Período</span>
          <span className="analytics-card__value">{formatMoney(dailyAvg.total)}</span>
          <span className="analytics-card__subtitle">Mes: {month}</span>
        </div>

        <div className="analytics-card">
          <span className="analytics-card__title">Promedio Diario</span>
          <span className="analytics-card__value">{formatMoney(dailyAvg.dailyAverage)}</span>
          <span className="analytics-card__subtitle">Gasto promedio por día</span>
        </div>

        <div className="analytics-card">
          <span className="analytics-card__title">Categorías Activas</span>
          <span className="analytics-card__value">{categories.length}</span>
          <span className="analytics-card__subtitle">Con movimientos registrados</span>
        </div>
      </section>

      <section className="charts-grid">
        <div className="chart-panel">
          <div className="chart-panel-header">
            <h2>Distribución por Categoría</h2>
          </div>
          <div className="chart-body">
            {categories.length > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <div className="empty-chart-state">Sin gastos en este período</div>
            )}
          </div>
        </div>

        <div className="chart-panel">
          <div className="chart-panel-header">
            <h2>Historial Mensual</h2>
          </div>
          <div className="chart-body">
            {monthlyData.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div className="empty-chart-state">Sin datos históricos</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analytics;