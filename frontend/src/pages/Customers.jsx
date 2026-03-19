import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Edit, Trash2, X, MapPin, Phone, Eye, UserCheck, ShieldCheck, Wallet, ArrowRight, Loader2, UserPlus, Filter, Download, LayoutDashboard, Package, Truck, Settings, HelpCircle, LogOut, Database } from 'lucide-react';
import './Stock.css'; 
import logo from '../assets/logo.png';

function Customers() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role = 'user', email = 'Demo User' } = location.state || {};

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const API_URL = 'https://shree-traders.onrender.com/api/customers';

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const resp = await fetch(API_URL);
      const data = await resp.json();
      setCustomers(data);
    } catch (err) { console.error('Error:', err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const resetForm = () => { setFormData({ name: '', phone: '', address: '' }); setEditingId(null); setShowForm(false); };

  const translateLastWord = async (text) => {
    const words = text.split(' ');
    if (text.endsWith(' ') && words.length >= 2) {
      const lastWord = words[words.length - 2];
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
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digits }));
    } else if ((name === 'name' || name === 'address') && value.endsWith(' ')) {
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
    if (formData.phone.length !== 10) { alert('मोबाईल नंबर १० अंकी असावा (10 digits)'); return; }
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    try {
      setLoading(true);
      const resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (resp.ok) {
        alert(editingId ? 'माहिती अपडेट झाली!' : 'नवीन ग्राहक नोंदणी यशस्वी!');
        await fetchCustomers(); resetForm();
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('तुम्ही खात्रीने हा ग्राहक डिलीट करू इच्छिता?')) return;
    try {
      const resp = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (resp.ok) { alert('ग्राहक डिलीट झाला.'); await fetchCustomers(); }
    } catch (err) { console.error(err); }
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.phone && c.phone.includes(searchTerm)));

  if (loading && customers.length === 0) return <div className="loader-container"><Loader2 className="spin" size={64} /><p>रिअल ERP सिस्टिम चालू होत आहे...</p></div>;

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
          <div className="erp-nav-item active" onClick={() => navigate('/customers', { state: { role, email } })}><Users /> ग्राहक खाते (Retail)</div>
          <div className="erp-nav-item" onClick={() => navigate('/dealers', { state: { role, email } })}><Truck /> डिलर खाते (Wholesale)</div>
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
            <h1 className="erp-panel-title">रिटेल ग्राहक खाते मास्टर</h1>
            <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>RETAIL</span>
          </div>
          <div className="erp-search-container">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="ग्राहक नाव किंवा मोबाईल शोधा..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="erp-btn primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? <X size={18} /> : <UserPlus size={18} />} {showForm ? 'प्रपत्र बंद करा' : 'नवीन ग्राहक' }
            </button>
          </div>
        </header>

        <div className="erp-content">
          {/* STATS STRIP */}
          <div className="erp-stats">
            <div className="erp-stat-box">
              <span className="erp-stat-label">एकूण सक्रीय ग्राहक</span>
              <span className="erp-stat-value">{customers.length}</span>
            </div>
            <div className="erp-stat-box">
              <span className="erp-stat-label">प्रमाणित खाती (Certified)</span>
              <span className="erp-stat-value">{customers.length}</span>
            </div>
            <div className="erp-stat-box">
              <span className="erp-stat-label">रिअल-टाइम बॅकअप</span>
              <span className="erp-stat-value" style={{ fontSize: '1.2rem', color: '#059669' }}>Cloud Active</span>
            </div>
            <div className="erp-stat-box" style={{ borderLeft: '4px solid #2563eb' }}>
              <span className="erp-stat-label">सिस्टिम वेळ</span>
              <span className="erp-stat-value" style={{ fontSize: '1.2rem' }}>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>

          {/* FORM AREA */}
          {showForm && (
            <div className="erp-panel" style={{ marginBottom: '32px' }}>
              <div className="erp-panel-header"><h3 className="erp-panel-title">{editingId ? 'ग्राहक माहिती दुरुस्ती' : 'नवीन ग्राहक नोंदणी (Customer Master)'}</h3></div>
              <form onSubmit={handleSubmit}>
                <div className="erp-form-row">
                  <div className="erp-input-group"><label>ग्राहकाचे नाव (Customer Name)</label><input className="erp-control" type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Full Name" required /></div>
                  <div className="erp-input-group"><label>मोबाईल नंबर (Contact)</label><input className="erp-control" type="text" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="10 Digits" required /></div>
                  <div className="erp-input-group"><label>पत्ता (Primary Address)</label><input className="erp-control" type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" required /></div>
                  <button type="submit" className="erp-btn primary" style={{ height: '42px', padding: '0 30px' }}>नोंदणी जतन करा</button>
                </div>
              </form>
            </div>
          )}

          {/* TABLE AREA */}
          <div className="erp-panel">
            <div className="erp-panel-header"><h3 className="erp-panel-title">ग्राहक डेटाबेस (Customer Master Table)</h3></div>
            <div className="erp-table-area">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>ग्राहक नाव / ID</th>
                    <th>संपर्क / मोबाईल</th>
                    <th>प्राथमिक पत्ता</th>
                    <th style={{ textAlign: 'center' }}>कार्यवाही (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (<tr><td colSpan="4" className="table-loader">कोणताही ग्राहक सापडला नाही.</td></tr>) : (
                    filteredCustomers.map(c => (
                      <tr key={c.id}>
                        <td><div style={{ fontWeight: 800 }}>{c.name}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>CID: #{c.id}</div></td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}><Phone size={14} color="#64748b" /> {c.phone}</div></td>
                        <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><MapPin size={14} /> {c.address}</div></td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="erp-btn primary" onClick={() => navigate(`/customers/${c.id}`, { state: { role, email } })} style={{ padding: '8px 16px', fontSize: '0.75rem' }}>LEGER पहा <ArrowRight size={14} /></button>
                            <button className="erp-btn outline" onClick={() => { setEditingId(c.id); setFormData({ name: c.name, phone: c.phone, address: c.address }); setShowForm(true); }} style={{ padding: '8px' }}><Edit size={16} /></button>
                            <button className="erp-btn outline" onClick={() => handleDelete(c.id)} style={{ padding: '8px' }}><Trash2 size={16} color="#dc2626" /></button>
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

export default Customers;
