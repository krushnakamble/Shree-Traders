import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Stock from './pages/Stock';
import Customers from './pages/Customers';
import CustomerView from './pages/CustomerView';
import Dealers from './pages/Dealers';
import DealerView from './pages/DealerView';
import SettingsPage from './pages/Settings';
import Support from './pages/Support';

const GlobalFontZoom = () => {
  const [zoom, setZoom] = React.useState(1);
  React.useEffect(() => {
    document.documentElement.style.fontSize = `${zoom * 16}px`;
  }, [zoom]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 999999,
      display: 'flex',
      gap: '4px',
      background: 'rgba(255,255,255,0.95)',
      padding: '6px',
      borderRadius: '50px',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
      border: '1px solid #e2e8f0',
      backdropFilter: 'blur(8px)',
      alignItems: 'center'
    }}>
      <button 
        onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
        style={{ width: '30px', height: '30px', borderRadius: '4px', border: 'none', background: '#f1f5f9', color: '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >-</button>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>
        {Math.round(zoom * 100)}%
      </div>
      <button 
        onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
        style={{ width: '30px', height: '30px', borderRadius: '4px', border: 'none', background: '#e0e7ff', color: '#4338ca', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >+</button>
    </div>
  );
};

function App() {
  return (
    <>
      <GlobalFontZoom />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerView />} />
          <Route path="/dealers" element={<Dealers />} />
          <Route path="/dealers/:id" element={<DealerView />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/support" element={<Support />} />
          {/* Catch all unmatched routes and redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
