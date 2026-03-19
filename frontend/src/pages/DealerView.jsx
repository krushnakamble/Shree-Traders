import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Truck, ArrowLeft, Loader2, Plus, Trash2, Edit, DollarSign, Layers, Printer, MessageCircle, Phone, MapPin, Calendar, CreditCard, ShoppingBag, Wallet, TrendingUp, TrendingDown, Clock, ShieldCheck, ChevronRight, FileText, Send, AlertCircle, Package, Settings, HelpCircle, LogOut, Database, Users } from 'lucide-react';
import './Stock.css';
import logo from '../assets/logo.png';

function DealerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role = 'user', email = 'Demo User' } = location.state || {};

  const [dealer, setDealer] = useState(null);
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [paidNow, setPaidNow] = useState('');
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [expenditure, setExpenditure] = useState('');
  const [remarks, setRemarks] = useState('');

  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const API_BASE = 'https://shree-traders.onrender.com/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dealerResp, billsResp] = await Promise.all([
        fetch(`${API_BASE}/dealers/${id}`),
        fetch(`${API_BASE}/dealer-bills/dealer/${id}`)
      ]);
      if (!dealerResp.ok) throw new Error('डिलर सापडला नाही');
      const dealerData = await dealerResp.json();
      const billsData = await billsResp.json() || [];
      setDealer(dealerData);
      setBills([...billsData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (err) { setFetchError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    const q = parseInt(quantity) || 0;
    const r = parseFloat(rate) || 0;
    const e = parseFloat(expenditure) || 0;
    if (q > 0 || r > 0 || e > 0) {
      setPurchaseAmount((q * r + e).toFixed(2));
    } else {
      setPurchaseAmount('');
    }
  }, [quantity, rate, expenditure]);

  const safeTotal = (val) => parseFloat(val) || 0;

  const processedData = useMemo(() => {
    let bakiTracker = 0;
    const all = bills.map(b => {
      const net = safeTotal(b.totalAmount) - safeTotal(b.paidAmount);
      bakiTracker += net;
      const date = new Date(b.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return { ...b, bakiTracker, monthKey };
    });
    const months = [...new Set(all.map(r => r.monthKey))].sort().reverse();
    const filtered = all.filter(r => {
      const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
      const isInMonth = selectedMonth === 'ALL' || r.monthKey === selectedMonth;
      const isInRange = (!fromDate || dateStr >= fromDate) && (!toDate || dateStr <= toDate);
      return isInMonth && isInRange;
    });

    const opening = all.filter(r => {
      const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
      const isBeforeMonth = selectedMonth !== 'ALL' && r.monthKey < selectedMonth;
      const isBeforeRange = fromDate && dateStr < fromDate;
      return isBeforeMonth || isBeforeRange;
    }).reduce((acc, r) => acc + (safeTotal(r.totalAmount) - safeTotal(r.paidAmount)), 0);

    const mDebit = filtered.reduce((acc, r) => acc + safeTotal(r.totalAmount), 0);
    const mCredit = filtered.reduce((acc, r) => acc + safeTotal(r.paidAmount), 0);
    return { ledgerRows: [...filtered].reverse(), availableMonths: months, summary: { opening, mDebit, mCredit, closing: opening + mDebit - mCredit, totalBaki: bakiTracker } };
  }, [bills, selectedMonth, fromDate, toDate]);

  const { ledgerRows, availableMonths, summary } = processedData;

  const saveTransaction = async (total, paid) => {
    if (total === 0 && paid === 0) return;
    setIsSaving(true);
    try {
      const resp = await fetch(`${API_BASE}/dealer-bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealer: { id: parseInt(id) },
          totalAmount: total, 
          paidAmount: paid, 
          quantity: parseInt(quantity) || 0,
          rate: parseFloat(rate) || 0,
          expenditure: parseFloat(expenditure) || 0,
          remarks: remarks || (total > 0 ? 'माल खरेदी' : 'पेमेंट जमा')
        })
      });
      if (resp.ok) {
        setPurchaseAmount(''); setPaidNow(''); setRemarks(''); setQuantity(''); setRate(''); setExpenditure('');
        setShowEntryForm(false);
        await fetchData();
        alert('डिलर व्यवहार नोंद यशस्वी!');
      }
    } catch (err) { alert('Network Error.'); } finally { setIsSaving(false); }
  };

  const handleDelete = async (tid) => {
    if (!window.confirm('व्यवहार काढून टाकायचा? (This will update total balance)')) return;
    try {
      const resp = await fetch(`${API_BASE}/dealer-bills/${tid}`, { method: 'DELETE' });
      if (resp.ok) await fetchData();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="loader-container"><Loader2 className="spin" size={64} /><p>डिलर लेजर लोड होत आहे...</p></div>;
  if (fetchError) return <div className="erp-container"><div className="erp-panel" style={{margin: '40px'}}><h2 style={{color: '#dc2626'}}>{fetchError}</h2><button className="erp-btn primary" onClick={() => navigate('/dealers')}>Back to Dealers</button></div></div>;

  return (
    <div className="erp-container">
      {/* ENTERPRISE SIDEBAR */}
      <aside className="erp-sidebar no-print">
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
        <header className="erp-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="erp-btn outline" onClick={() => navigate('/dealers', { state: { role, email } })} style={{ padding: '6px' }}><ArrowLeft size={16} /></button>
            <h1 className="erp-panel-title">डिलर लेजर: {dealer.name}</h1>
            <span style={{ fontSize: '0.75rem', background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>WHOLESALE</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="erp-btn outline" onClick={() => window.print()}><Printer size={16} /> प्रिंट स्टेटमेंट</button>
          </div>
        </header>

        <div className="erp-content no-print">
          {/* PREMIUM STATS GRID */}
          <div className="stat-grid-modern">

            <div className="stat-card-modern">
              <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><TrendingUp size={24} /></div>
              <div className="stat-info">
                <span className="label">एकूण खरेदी (Purchase)</span>
                <span className="value">₹{summary.mDebit.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#059669' }}><TrendingDown size={24} /></div>
              <div className="stat-info">
                <span className="label">एकूण पेमेंट (Paid)</span>
                <span className="value">₹{summary.mCredit.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card-modern" style={{ background: '#d97706', color: 'white' }}>
              <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><Wallet size={24} /></div>
              <div className="stat-info">
                <span className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>अखेरची देणी (Payables)</span>
                <span className="value" style={{ color: 'white' }}>₹{summary.closing.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ACTION CENTER */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              className={`erp-btn ${showEntryForm ? 'danger' : 'primary'}`}
              onClick={() => setShowEntryForm(!showEntryForm)}
              style={{ padding: '12px 24px', borderRadius: '50px', background: '#d97706', color: 'white', boxShadow: 'var(--shadow-md)' }}
            >
              {showEntryForm ? <ArrowLeft size={18} /> : <Plus size={18} />}
              {showEntryForm ? 'रद्द करा (Cancel)' : 'व्यवहार / पेमेंट जोडा'}
            </button>
          </div>

          {showEntryForm && (
            <div className="panel-modern" style={{ marginBottom: '24px', border: '2px solid #fcd34d' }}>
               <div className="action-tabs" style={{ margin: '24px 24px 0 24px' }}>
                 <div className={`action-tab ${!showPaymentForm ? 'active' : ''}`} style={!showPaymentForm ? {background: '#d97706', color: 'white'} : {}} onClick={() => setShowPaymentForm(false)}>🛒 स्टॉक खरेदी (Purchase)</div>
                 <div className={`action-tab ${showPaymentForm ? 'active' : ''}`} style={showPaymentForm ? {background: '#059669', color: 'white'} : {}} onClick={() => setShowPaymentForm(true)}>💰 डिलरला पेमेंट (Payment)</div>
               </div>

               <div style={{ padding: '24px' }}>
                 {!showPaymentForm ? (
                   <div style={{ display: 'grid', gridTemplateColumns: '100px 100px 100px 1.2fr 1fr 1.2fr auto', gap: '15px', alignItems: 'end' }}>
                     <div className="erp-input-group">
                        <label>नग (Qty)</label>
                        <input className="erp-control" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
                     </div>
                     <div className="erp-input-group">
                        <label>दर (Rate)</label>
                        <input className="erp-control" type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="0.00" />
                     </div>
                     <div className="erp-input-group">
                        <label>खर्च (Extra)</label>
                        <input className="erp-control" type="number" value={expenditure} onChange={e => setExpenditure(e.target.value)} placeholder="0.00" />
                     </div>
                     <div className="erp-input-group">
                        <label>एकूण खरेदी (Total)</label>
                        <input className="erp-control" type="number" value={purchaseAmount} readOnly style={{fontWeight: 900, background: '#f8fafc'}} />
                     </div>
                     <div className="erp-input-group">
                        <label>दिलेले पैसे</label>
                        <input className="erp-control" type="number" value={paidNow} onChange={e => setPaidNow(e.target.value)} placeholder="0.00" />
                     </div>
                     <div className="erp-input-group"><label>तपशील</label><input className="erp-control" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Entry notes..." /></div>
                     <button className="erp-btn primary" onClick={() => saveTransaction(safeTotal(purchaseAmount), safeTotal(paidNow))} style={{ height: '46px', padding: '0 20px', background: '#d97706' }} disabled={isSaving}>नोंदवा</button>
                   </div>
                 ) : (
                   <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.5fr auto', gap: '24px', alignItems: 'end' }}>
                     <div className="erp-input-group"><label>पेमेंट रक्कम (Payment to Dealer)</label><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#64748b' }}>₹</span><input className="erp-control" type="number" value={paidNow} onChange={e => setPaidNow(e.target.value)} placeholder="0.00" style={{ paddingLeft: '28px', fontWeight: 900, fontSize: '1.4rem', color: '#059669' }} /></div></div>
                     <div className="erp-input-group"><label>पेमेंट तपशील</label><input className="erp-control" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Bank Transfer, Cash, Check" style={{ height: '48px' }} /></div>
                     <button className="erp-btn success" onClick={() => saveTransaction(0, safeTotal(paidNow))} style={{ height: '48px', padding: '0 32px', background: '#059669' }} disabled={isSaving}>जमा करा (Save)</button>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* LEDGER CARD */}
          <div className="panel-modern">
            <div className="erp-card-header-clean">
              <div><h3 className="erp-panel-title">डिलर व्यवहार इतिहास (Wholesale Ledger)</h3></div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select className="erp-control" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ fontSize: '0.8rem' }}><option value="ALL">सर्व महिने</option>{availableMonths.map(m => <option key={m} value={m}>{m}</option>)}</select>
              </div>
            </div>
            <div className="erp-table-area" style={{ padding: '24px' }}>
               <div className="industrial-grid">
                 <div className="grid-row header" style={{ gridTemplateColumns: '120px 1.5fr 80px 100px 100px 120px 120px 150px 60px' }}>
                   <div>तारीख</div>
                   <div>तपशील</div>
                   <div style={{ textAlign: 'center' }}>नग (Qty)</div>
                   <div style={{ textAlign: 'right' }}>दर (Rate)</div>
                   <div style={{ textAlign: 'right' }}>इ. खर्च</div>
                   <div style={{ textAlign: 'right' }}>खरेदी (+)</div>
                   <div style={{ textAlign: 'right' }}>पेमेंट (-)</div>
                   <div style={{ textAlign: 'right' }}>देणी (Balance)</div>
                   <div style={{ textAlign: 'center' }}>X</div>
                 </div>
                 {ledgerRows.map(b => (
                   <div key={b.id} className="grid-row" style={{ gridTemplateColumns: '120px 1.5fr 80px 100px 100px 120px 120px 150px 60px' }}>
                     <div><div style={{ fontWeight: 800 }}>{new Date(b.createdAt).toLocaleDateString()}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>#DLR-{b.id}</div></div>
                     <div style={{ fontWeight: 600 }}>{b.remarks}</div>
                     <div style={{ textAlign: 'center' }}><span className="status-pill credit" style={{ background: '#f1f5f9', color: '#475569' }}>{b.quantity || '-'}</span></div>
                     <div style={{ textAlign: 'right' }}>{b.rate > 0 ? `₹${b.rate.toLocaleString()}` : '-'}</div>
                     <div style={{ textAlign: 'right' }}>{b.expenditure > 0 ? `₹${b.expenditure.toLocaleString()}` : '-'}</div>
                     <div style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{b.totalAmount > 0 ? `₹${b.totalAmount.toLocaleString()}` : '-'}</div>
                     <div style={{ textAlign: 'right', color: '#059669', fontWeight: 700 }}>{b.paidAmount > 0 ? `₹${b.paidAmount.toLocaleString()}` : '-'}</div>
                     <div style={{ textAlign: 'right', fontWeight: 900 }}>₹{b.bakiTracker.toLocaleString()}</div>
                     <div style={{ textAlign: 'center' }}><button onClick={() => handleDelete(b.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16}/></button></div>
                   </div>
                 ))}
                 {ledgerRows.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>कोणताही व्यवहार आढळला नाही.</div>}
               </div>
            </div>
          </div>
        </div>

        {/* PRINT VIEW */}
        <div className="print-only" style={{ padding: '40px', color: '#000', background: 'white', minHeight: '100vh', fontFamily: 'serif' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #000', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img src={logo} alt="Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0 }}>भाग्यश्री ट्रेडर्स</h1>
                <p style={{ fontSize: '1rem', margin: '5px 0' }}>डिलर / सप्लायर खाते स्टेटमेंट</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.5rem', background: '#000', color: '#fff', padding: '10px 20px', margin: 0 }}>डिलर लेजर स्टेटमेंट</h2>
              <p style={{ marginTop: '10px' }}>दिनांक: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
             <div style={{ border: '1px solid #000', padding: '20px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>Party / Dealer:</p>
                <h2 style={{ fontSize: '1.5rem', margin: '10px 0' }}>{dealer.name}</h2>
                <p>फोन: {dealer.phone}</p>
                <p>पत्ता: {dealer.address}</p>
             </div>
             <div style={{ background: '#000', color: '#fff', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem' }}>एकूण येणे बाकी (Final Payables):</p>
                <h1 style={{ fontSize: '2.5rem', margin: '10px 0' }}>₹{summary.totalBaki.toLocaleString()}/-</h1>
             </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '40px', border: '1px solid #000' }}>
            <thead>
               <tr style={{ background: '#f0f0f0' }}>
                 <th style={{ border: '1px solid #000', padding: '10px' }}>तारीख</th>
                 <th style={{ border: '1px solid #000', padding: '10px' }}>तपशील</th>
                 <th style={{ border: '1px solid #000', textAlign: 'center', padding: '10px' }}>नग</th>
                 <th style={{ border: '1px solid #000', textAlign: 'right', padding: '10px' }}>दर</th>
                 <th style={{ border: '1px solid #000', textAlign: 'right', padding: '10px' }}>खर्च</th>
                 <th style={{ border: '1px solid #000', textAlign: 'right', padding: '10px' }}>एकूण खरेदी</th>
                 <th style={{ border: '1px solid #000', textAlign: 'right', padding: '10px' }}>पेमेंट</th>
                 <th style={{ border: '1px solid #000', textAlign: 'right', padding: '10px' }}>एकूण बाकी</th>
               </tr>
            </thead>
            <tbody>
              {ledgerRows.map(b => (
                <tr key={b.id}>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #000', padding: '8px' }}>{b.remarks}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'center' }}>{b.quantity || '-'}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{b.rate > 0 ? b.rate.toLocaleString() : '-'}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{b.expenditure > 0 ? b.expenditure.toLocaleString() : '-'}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{b.totalAmount > 0 ? b.totalAmount.toLocaleString() : '-'}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right' }}>{b.paidAmount > 0 ? b.paidAmount.toLocaleString() : '-'}</td>
                  <td style={{ border: '1px solid #000', textAlign: 'right', padding: '8px', fontWeight: 900 }}>{b.bakiTracker.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{marginTop: '50px', display: 'flex', justifyContent: 'space-between'}}>
             <p>This is a computer generated statement.</p>
             <p style={{borderTop: '1px solid #000', width: '200px', textAlign: 'center'}}>Authorized Sign</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DealerView;
