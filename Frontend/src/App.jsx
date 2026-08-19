import React, { useState } from 'react';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';

function App() {
  const [activeTab, setActiveTab] = useState('expenses');

  return (
    <div>
      <nav className="app-navbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px', color: '#34d399', lineHeight: 1 }}>◧</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 700, color: '#e9eefb' }}>
            PocketFlow
          </span>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Gastos
          </button>
          <button
            className={`nav-tab ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            Presupuestos y Alertas
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analíticas y Totalizadores
          </button>
        </div>
      </nav>

      {activeTab === 'expenses' && <Expenses />}
      {activeTab === 'budgets' && <Budgets />}
      {activeTab === 'analytics' && <Analytics />}
    </div>
  );
}

export default App;