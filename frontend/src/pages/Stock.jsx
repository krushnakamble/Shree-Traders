import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Package, Plus, Search, Edit, Trash2, X, Wallet, ArrowRight, Loader2,
  Layers, DollarSign, AlertTriangle, Filter, CheckCircle, BarChart3,
  Tag, ShoppingCart, Users, Truck, LogOut, Settings, HelpCircle,
  LayoutDashboard, Database
} from 'lucide-react';
import './Stock.css';
import logo from '../assets/logo.png';

function Stock() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role = 'user', email = 'Demo User' } = location.state || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ name: '', category: '', sku: '', quantity: '', price: '' });

  const API_URL = 'http://localhost:8080/api/products';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const resp = await fetch(API_URL);
      const data = await resp.json();
      setProducts(data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => { setFormData({ name: '', category: '', sku: '', quantity: '', price: '' }); setEditingId(null); setShowForm(false); };

  const translateLastWord = async (text) => {
    const words = text.split(' ');
    if (text.endsWith(' ') && words.length >= 2) {
      const lastWord = words[words.length - 2];
      // Check if it's purely English text before translating
      if (!lastWord || !/^[A-Za-z]+$/.test(lastWord)) return text; 

      try {
        const res = await fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=mr-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`);
        const data = await res.json();
        if (data[0] === 'SUCCESS') {
          const translated = data[1][0][1][0];
          words[words.length - 2] = translated;
          return words.join(' ');
        }
      } catch (err) { console.error('Transliterator API error', err); }
    }
    return text;
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    
    // Auto-translate only for the "name" field on space press
    if (name === 'name' && value.endsWith(' ')) {
      setFormData(prev => ({ ...prev, [name]: value }));
      const marathiText = await translateLastWord(value);
      if (marathiText !== value) {
        setFormData(prev => ({ ...prev, [name]: marathiText }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = { ...formData, quantity: parseInt(formData.quantity) || 0, price: parseFloat(formData.price) || 0 };
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    try {
      setLoading(true);
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
      if (resp.ok) {
        alert(editingId ? 'माहिती अपडेट झाली!' : 'वस्तू यशस्वीरित्या जतन केली!');
        await fetchProducts(); resetForm();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्ही खात्रीने ही वस्तू डिलीट करू इच्छिता?')) return;
    try {
      const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (resp.ok) { alert('वस्तू डिलीट झाली.'); await fetchProducts(); }
    } catch (err) { console.error(err); }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = useMemo(() => {
    const totalVal = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
    const lowStockItems = products.filter(p => p.quantity < 10);
    const lowStock = lowStockItems.length;
    return { totalVal, lowStock, lowStockItems };
  }, [products]);

  if (loading && products.length === 0) return <div className="loader-container"><Loader2 className="spin" size={64} /><p>रिअल ERP सिस्टिम चालू होत आहे...</p></div>;

  return (
    <div className="erp-container">
      {/* PROFESSIONAL ENTERPRISE SIDEBAR - MARATHI */}
      <aside className="erp-sidebar">
        <div className="erp-brand">
           <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'white' }} />
           <span>SHREE TRADERS</span>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>K</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white' }}>Krushna Kamble</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{email}</div>
            </div>
          </div>
        </div>

        <nav className="erp-nav">
          <div className="erp-nav-item active" onClick={() => navigate('/stock', { state: { role, email } })}><Package /> एकूण स्टॉक</div>
          <div className="erp-nav-item" onClick={() => navigate('/customers', { state: { role, email } })}><Users /> ग्राहक खाते (Retail)</div>
          <div className="erp-nav-item" onClick={() => navigate('/dealers', { state: { role, email } })}><Truck /> डिलर खाते (Wholesale)</div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }}></div>
          <div className="erp-nav-item" onClick={() => navigate('/settings', { state: { role, email } })}><Settings /> सिस्टिम सेटिंग्स</div>
          <div className="erp-nav-item" onClick={() => navigate('/support', { state: { role, email } })}><HelpCircle /> सपोर्ट सेंटर</div>
        </nav>
        <div className="erp-user-box" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="erp-logout" onClick={() => navigate('/')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={16} /> लॉगआउट करा
          </button>
        </div>
      </aside>

      {/* MAIN ERP BODY */}
      <main className="erp-main">
        <header className="erp-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 className="erp-panel-title" style={{ fontSize: '1.6rem' }}>दैनंदिन स्टॉक</h1>
            <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '100px', fontWeight: 900, border: '1px solid currentColor' }}>LIVE DATABASE</span>
          </div>
          <div className="erp-search-container">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="वस्तूचे नाव किंवा कॅटेगरी शोधा..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="erp-btn primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? 'प्रपत्र बंद करा' : 'नवीन माल जमा (Add)'}
            </button>
          </div>
        </header>

        <div className="erp-content">
          {/* STATS STRIP IN MARATHI */}
          <div className="erp-stats">
            <div className="erp-stat-box">
              <span className="erp-stat-label">एकूण उत्पादने (Total Skus)</span>
              <span className="erp-stat-value">{products.length}</span>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>सिस्टिममध्ये नोंदणीकृत</div>
            </div>
            <div className="erp-stat-box" style={{ borderLeft: '4px solid #2563eb' }}>
              <span className="erp-stat-label">स्टॉक मूल्यांकन (Valuation)</span>
              <span className="erp-stat-value" style={{ color: '#2563eb' }}>₹{stats.totalVal.toLocaleString()}</span>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>एकूण स्टॉकची किंमत</div>
            </div>
            <div className="erp-stat-box" style={{ borderLeft: '4px solid #ef4444' }}>
              <span className="erp-stat-label">कमी स्टॉक अलर्ट्स</span>
              <span className="erp-stat-value" style={{ color: '#ef4444' }}>{stats.lowStock} <AlertTriangle size={24} style={{ verticalAlign: 'middle', marginLeft: '8px' }} /></span>
              <div style={{ fontSize: '0.7rem', color: '#ef4444', marginTop: '4px', fontWeight: 700 }}>१० पेक्षा कमी नग असलेल्या वस्तू</div>
              {stats.lowStock > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {stats.lowStockItems.slice(0, 5).map(item => (
                    <span key={item.id} style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', border: '1px solid #fca5a5' }}>
                      {item.name} ({item.quantity})
                    </span>
                  ))}
                  {stats.lowStockItems.length > 5 && (
                    <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold' }}>+{stats.lowStockItems.length - 5} अधिक...</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FORM AREA */}
          {showForm && (
            <div className="erp-panel" style={{ marginBottom: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
              <div className="erp-panel-header" style={{ background: '#f8fafc' }}><h3 className="erp-panel-title">{editingId ? 'माल माहिती दुरुस्ती (Update)' : 'नवीन माल मास्टर नोंदणी (New Product)'}</h3></div>
              <form onSubmit={handleSubmit}>
                <div className="erp-form-row">
                  <div className="erp-input-group"><label>वस्तूचे पूर्ण नाव (Product Name)</label><input className="erp-control" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="उदा. तांदूळ, तेल..." required /></div>
                  <div className="erp-input-group"><label>नग / शिल्लक क्वांटिटी</label><input className="erp-control" type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="०" required /></div>
                  <div className="erp-input-group"><label>विक्री दर (Unit Price)</label><input className="erp-control" type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" required /></div>
                  <button type="submit" className="erp-btn primary" style={{ height: '42px', marginTop: 'auto' }}>माहिती जतन करा (Save)</button>
                </div>
              </form>
            </div>
          )}

          {/* MASTER DATA TABLE */}
          <div className="erp-panel">
            <div className="erp-panel-header">
              <h3 className="erp-panel-title">एकूण माल</h3>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 700 }}>एकूण {filteredProducts.length} रेकॉर्ड्स सापडले</div>
            </div>
            <div className="erp-table-area">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>माल नाव</th>
                    <th style={{ textAlign: 'center' }}>शिल्लक स्टॉक (Balance)</th>
                    <th style={{ textAlign: 'right' }}>प्रति नग दर</th>
                    <th style={{ textAlign: 'right' }}>एकूण व्हॅल्यू</th>
                    <th style={{ textAlign: 'center' }}>ऍक्शन</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (<tr><td colSpan="5" className="table-loader">कोणताही डेटा उपलब्ध नाही. कृपया नवीन नोंद करा.</td></tr>) : (
                    filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 800, color: '#1e293b' }}>{p.name}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 950, fontSize: '1.2rem', color: p.quantity < 10 ? '#dc2626' : '#0f172a' }}>{p.quantity}</span>
                          <span style={{ marginLeft: '12px', fontSize: '0.65rem', fontWeight: 900, padding: '3px 8px', borderRadius: '100px', background: p.quantity < 10 ? '#fee2e2' : '#dcfce7', color: p.quantity < 10 ? '#dc2626' : '#15803d', border: '1px solid currentColor' }}>{p.quantity < 10 ? 'LOW STOCK' : 'AVAILABLE'}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>₹{p.price.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 950, color: '#2563eb', fontSize: '1.1rem' }}>₹{(p.price * p.quantity).toLocaleString()}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="erp-btn outline" onClick={() => { setEditingId(p.id); setFormData({ name: p.name, category: p.category, sku: p.sku, quantity: p.quantity.toString(), price: p.price.toString() }); setShowForm(true); }} style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', justifyContent: 'center' }} title="Edit"><Edit size={16} /></button>
                            <button className="erp-btn outline" onClick={() => handleDelete(p.id)} style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px', justifyContent: 'center', borderColor: '#fee2e2' }} title="Delete"><Trash2 size={16} color="#dc2626" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Stock;
