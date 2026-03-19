import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Truck, Plus, Search, Edit, Trash2, X, MapPin, Phone, Eye, ArrowRight, Loader2, Filter, LayoutDashboard, Package, Users, Settings, HelpCircle, LogOut, Database } from 'lucide-react';
import './Stock.css';
import logo from '../assets/logo.png';
 

function Dealers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role = 'user', email = 'Demo User' } = location.state || {};

  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const API_URL = 'https://shree-traders.onrender.com/api/dealers';

  const fetchDealers = async () => {
    setLoading(true);
    try {
      const resp = await fetch(API_URL);
      if (resp.ok) {
        const data = await resp.json();
        setDealers(data);
      } else {
        console.warn('API /api/dealers not found, using mockup');
        setDealers([]);
      }
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDealers(); }, []);

  const resetForm = () => { setFormData({ name: '', phone: '', address: '' }); setEditingId(null); setShowForm(false); };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
    } else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length !== 10) { alert('मोबाईल नंबर १० अंकी असावा (10 digits)'); return; }
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    try {
      setLoading(true);
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (resp.ok) {
        alert(editingId ? 'डिलर माहिती अपडेट झाली!' : 'नवीन डिलर नोंदणी यशस्वी!');
        await fetchDealers(); resetForm();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्ही खात्रीने हा डिलर डिलीट करू इच्छिता?')) return;
    try {
      const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (resp.ok) { alert('डिलर डिलीट झाला.'); await fetchDealers(); }
    } catch (err) { console.error(err); }
  };

  const filteredDealers = dealers.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || (d.phone && d.phone.includes(searchTerm)));

  if (loading && dealers.length === 0) return <div className="loader-container"><Loader2 className="spin" size={64} /><p>रिअल ERP सिस्टिम चालू होत आहे...</p></div>;

  return (
    <div className="erp-container">
      {/* ENTERPRISE SIDEBAR */}
      <aside className="erp-sidebar">
        <div className="erp-brand">
           <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'white' }} />
           <span>SHREE TRADERS</span>
        </div>
        <nav className="erp-nav">
          <div className="erp-nav-item" onClick={() => navigate('/stock', { state: { role, email } })}><Package /> एकूण स्टॉक</div>
          <div className="erp-nav-item" onClick={() => navigate('/customers', { state: { role, email } })}><Users /> ग्राहक खाते (Retail)</div>
          <div className="erp-nav-item active" onClick={() => navigate('/dealers', { state: { role, email } })}><Truck /> डिलर खाते (Wholesale)</div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }}></div>
          <div className="erp-nav-item" onClick={() => navigate('/settings', { state: { role, email } })}><Settings /> सिस्टिम सेटिंग्स</div>
          <div className="erp-nav-item"><HelpCircle /> सपोर्ट सेंटर</div>
        </nav>
        <div className="erp-user-box">
          <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>K</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Krushna Kamble</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{email}</div>
          </div>
          <LogOut size={16} style={{ cursor: 'pointer' }} onClick={() => navigate('/')} />
        </div>
      </aside>

      {/* MAIN ERP BODY */}
      <main className="erp-main">
        <header className="erp-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="erp-panel-title">डिलर / सप्लायर खाते मास्टर</h1>
            <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>WHOLESALE</span>
          </div>
          <div className="erp-search-container">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="डिलर नाव किंवा संपर्क शोधा..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="erp-btn primary" onClick={() => setShowForm(!showForm)} style={{ background: '#d97706' }}>
              {showForm ? <X size={18} /> : <Truck size={18} />} {showForm ? 'प्रपत्र बंद करा' : 'नवीन डिलर / पार्टी' }
            </button>
          </div>
        </header>

        <div className="erp-content">
          {/* STATS STRIP */}
          <div className="erp-stats">
            <div className="erp-stat-box">
              <span className="erp-stat-label">एकूण डिलर संख्या</span>
              <span className="erp-stat-value" style={{ color: '#d97706' }}>{dealers.length}</span>
            </div>
            <div className="erp-stat-box">
              <span className="erp-stat-label">डिलर पेमेंट स्टेटस</span>
              <span className="erp-stat-value" style={{ fontSize: '1.2rem', color: '#059669' }}>Up-to-Date</span>
            </div>
            <div className="erp-stat-box">
              <span className="erp-stat-label">एकूण देणी (Payables)</span>
              <span className="erp-stat-value">₹0.00</span>
            </div>
            <div className="erp-stat-box" style={{ borderLeft: '4px solid #d97706' }}>
              <span className="erp-stat-label">सिस्टिम वेळ</span>
              <span className="erp-stat-value" style={{ fontSize: '1.2rem' }}>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* FORM AREA */}
          {showForm && (
            <div className="erp-panel" style={{ marginBottom: '32px' }}>
              <div className="erp-panel-header"><h3 className="erp-panel-title">{editingId ? 'डिलर मास्टर दुरुस्ती' : 'नवीन डिलर नोंदणी (Dealer Master)'}</h3></div>
              <form onSubmit={handleSubmit}>
                <div className="erp-form-row">
                  <div className="erp-input-group"><label>डिलर / फर्म नाव (Business Name)</label><input className="erp-control" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="उदा. महालक्ष्मी एंटरप्राइजेज" required /></div>
                  <div className="erp-input-group"><label>मोबाईल / फॉर्म संपर्क</label><input className="erp-control" type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10 Digits" required /></div>
                  <div className="erp-input-group"><label>पत्ता (Market Location)</label><input className="erp-control" type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Dealers Address" required /></div>
                  <button type="submit" className="erp-btn primary" style={{ height: '42px', padding: '0 30px', background: '#d97706' }}>नोंदणी जतन करा</button>
                </div>
              </form>
            </div>
          )}

          {/* TABLE AREA */}
          <div className="erp-panel">
            <div className="erp-panel-header"><h3 className="erp-panel-title">डिलर मास्टर डेटाबेस (Wholesale Table)</h3></div>
            <div className="erp-table-area">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>डिलर नाव / फर्म ID</th>
                    <th>संपर्क तपशील</th>
                    <th>मार्केट लोकेशन / पत्ता</th>
                    <th style={{ textAlign: 'center' }}>कार्यवाही (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDealers.length === 0 ? (<tr><td colSpan="4" className="table-loader">कोणताही डिलर सापडला नाही.</td></tr>) : (
                    filteredDealers.map(d => (
                      <tr key={d.id}>
                        <td><div style={{ fontWeight: 800 }}>{d.name}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>DID: #{d.id}</div></td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Phone size={14} color="#64748b" /> {d.phone}</div></td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><MapPin size={14} /> {d.address}</div></td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="erp-btn primary" onClick={() => navigate(`/dealers/${d.id}`, { state: { role, email } })} style={{ padding: '8px 16px', fontSize: '0.75rem', background: '#d97706' }}>पेमेंट लेजर <ArrowRight size={14} /></button>
                            <button className="erp-btn outline" onClick={() => { setEditingId(d.id); setFormData({ name: d.name, phone: d.phone, address: d.address }); setShowForm(true); }} style={{ padding: '8px' }}><Edit size={16} /></button>
                            <button className="erp-btn outline" onClick={() => handleDelete(d.id)} style={{ padding: '8px' }}><Trash2 size={16} color="#dc2626" /></button>
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

export default Dealers;
