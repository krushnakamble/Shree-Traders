import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, Plus, Trash2, Edit, DollarSign, Layers, Printer, MessageCircle, Phone, MapPin, Calendar, CreditCard, ShoppingBag, Wallet, TrendingUp, TrendingDown, Clock, ShieldCheck, ChevronRight, FileText, Send, AlertCircle, Package, Truck, Settings, HelpCircle, LogOut, Database } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import './Stock.css';
import logo from '../assets/logo.png';

function CustomerView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role = 'user', email = 'Demo User' } = location.state || {};

  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [billItems, setBillItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [paidNow, setPaidNow] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [cashPaymentAmount, setCashPaymentAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  const API_BASE = 'http://localhost:8080/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [custResp, prodResp, billsResp] = await Promise.all([
        fetch(`${API_BASE}/customers/${id}`),
        fetch(`${API_BASE}/products`),
        fetch(`${API_BASE}/bills/customer/${id}`)
      ]);
      if (!custResp.ok) throw new Error('ग्राहक सापडला नाही');
      const custData = await custResp.json();
      const prodData = await prodResp.json();
      const billsData = await billsResp.json() || [];
      setCustomer(custData);
      setProducts(prodData);
      setBills([...billsData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    } catch (err) { setFetchError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

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
  const currentBillAmount = billItems.reduce((acc, i) => acc + i.totalPrice, 0);
  const grandTotalPayable = summary.totalBaki + currentBillAmount;

  const addItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => p.id === parseInt(selectedProductId));
    if (!prod || prod.quantity < quantity) { alert('मालसाठा अपुरा आहे (Insufficient stock)'); return; }
    const qty = parseInt(quantity);
    const existing = billItems.findIndex(i => i.product.id === prod.id);
    let updated = [...billItems];
    if (existing > -1) {
      updated[existing].quantity += qty;
      updated[existing].totalPrice = updated[existing].quantity * prod.price;
    } else {
      updated.push({ product: { id: prod.id, name: prod.name }, quantity: qty, unitPrice: prod.price, totalPrice: prod.price * qty });
    }
    setBillItems(updated);
    setSelectedProductId(''); setQuantity(1);
  };

  const saveBill = async (total, paid) => {
    setIsSaving(true);
    try {
      const resp = await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: { id: parseInt(id) },
          totalAmount: total, paidAmount: paid, remarks,
          items: billItems.map(i => ({ product: { id: i.product.id }, quantity: i.quantity, unitPrice: i.unitPrice, totalPrice: i.totalPrice }))
        })
      });
      if (resp.ok) {
        setBillItems([]); setPaidNow(''); setRemarks('');
        setShowPaymentForm(false); setCashPaymentAmount('');
        await fetchData();
        alert('नोंद यशस्वी झाली!');
      }
    } catch (err) { alert('Network Error.'); } finally { setIsSaving(false); }
  };

  const sendOnWhatsApp = (msg) => {
    if (!customer?.phone) return;
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendCurrentBillOnWA = async () => {
    if (billItems.length === 0) return;

    let msg = `*प्रिय ${customer.name},*\n\n📋 *नवीन बिल तपशील:*\n`;
    billItems.forEach(i => { msg += `• ${i.product.name} (${i.quantity} नग) = ₹${i.totalPrice}\n`; });
    if (remarks) msg += `\n📝 *तपशील:* ${remarks}\n`;
    msg += `\n💰 *आजचे एकूण बिल:* ₹${currentBillAmount}\n📌 *मागील बाकी:* ₹${typeof summary !== 'undefined' && summary.closing ? summary.closing : 0}\n✅ *एकूण येणे:* ₹${currentBillAmount + (typeof summary !== 'undefined' && summary.closing ? summary.closing : 0) - (parseFloat(paidNow) || 0)}`;
    if (paidNow) msg += `\n✅ *आज जमा रक्कम:* ₹${paidNow}`;
    
    msg += `\n\n🙏 *धन्यवाद!*\n*- SHREE TRADERS -*`;
    sendOnWhatsApp(msg);
  };

  const sendStatementOnWA = () => {
    let msg = `*प्रिय ${customer.name},*\n\n📊 *खाते हिशोब सारांश (${selectedMonth === 'ALL' ? 'सर्व नोंदी' : selectedMonth}):*\n\n🔹 सुरुवातीची बाकी: ₹${summary.opening}\n🔹 एकूण खरेदी (+): ₹${summary.mDebit}\n🔹 एकूण जमा (-): ₹${summary.mCredit}\n🚩 *अखेरची येणे बाकी: ₹${summary.closing}*\n\nकृपया हिशोब तपासावा.\n🙏 *धन्यवाद!*\n*- भाग्यश्री ट्रेडर्स -*`;
    sendOnWhatsApp(msg);
  };

  if (loading) return <div className="loader-container"><Loader2 className="spin" size={64} /><p>डॅशबोर्ड लोड होत आहे...</p></div>;

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
        <header className="erp-header no-print">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="erp-btn outline" onClick={() => navigate('/customers', { state: { role, email } })} style={{ padding: '6px' }}><ArrowLeft size={16} /></button>
            <h1 className="erp-panel-title">ग्राहक स्टेटमेंट: {customer.name}</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="erp-btn outline" onClick={() => window.print()}><Printer size={16} /> प्रिंट करा</button>
            <button className="erp-btn success" onClick={sendStatementOnWA}><MessageCircle size={16} /> पाठवा</button>
          </div>
        </header>

        <div className="erp-content no-print">
          {/* PREMIUM STATS GRID */}
          <div className="stat-grid-modern">

            <div className="stat-card-modern">
              <div className="stat-icon" style={{ background: '#fee2e2', color: '#dc2626' }}><TrendingUp size={24} /></div>
              <div className="stat-info">
                <span className="label">एकूण विक्री (Debit)</span>
                <span className="value">₹{summary.mDebit.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card-modern">
              <div className="stat-icon" style={{ background: '#dcfce7', color: '#059669' }}><TrendingDown size={24} /></div>
              <div className="stat-info">
                <span className="label">एकूण जमा (Credit)</span>
                <span className="value">₹{summary.mCredit.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card-modern" style={{ background: 'var(--erp-primary)', color: 'white' }}>
              <div className="stat-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><Wallet size={24} /></div>
              <div className="stat-info">
                <span className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>एकूण बाकी</span>
                <span className="value" style={{ color: 'white' }}>₹{summary.closing.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* ACTION CENTER - NOW COLLAPSIBLE */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <button
              className={`erp-btn ${showEntryForm ? 'danger' : 'primary'}`}
              onClick={() => setShowEntryForm(!showEntryForm)}
              style={{ padding: '12px 24px', borderRadius: '50px', boxShadow: 'var(--shadow-md)' }}
            >
              {showEntryForm ? <ArrowLeft size={18} /> : <Plus size={18} />}
              {showEntryForm ? 'व्यवहार रद्द करा (Cancel)' : 'व्यवहार जोडा (Add Transaction)'}
            </button>
          </div>

          {showEntryForm && (
            <div className="panel-modern" style={{ marginBottom: '24px', border: '2px solid var(--erp-accent)' }}>
              <div className="action-tabs" style={{ margin: '24px 24px 0 24px' }}>
                <div className={`action-tab ${!showPaymentForm ? 'active' : ''}`} onClick={() => setShowPaymentForm(false)}>🛒 नवीन विक्री (New Sale)</div>
                <div className={`action-tab ${showPaymentForm ? 'active' : ''}`} onClick={() => setShowPaymentForm(true)}>💰 पैसे जमा (Receipt)</div>
              </div>

              <div style={{ padding: '24px' }}>
                {!showPaymentForm ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr auto', gap: '20px', alignItems: 'end' }}>
                    <div className="erp-input-group"><label>वस्तू निवडा (Select Product)</label><select className="erp-control" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} style={{ fontWeight: 600 }}><option value="">Select Item...</option>{products.map(p => (<option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>))}</select></div>
                    <div className="erp-input-group"><label>नग (Qty)</label><input className="erp-control" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} min="1" style={{ fontWeight: 600 }} /></div>
                    <div className="erp-input-group"><label>तपशील (Remarks)</label><input className="erp-control" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Entry notes..." /></div>
                    <button className="erp-btn primary" onClick={addItem} style={{ height: '46px', padding: '0 24px' }}><Plus size={20} /> जोडा</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 1.5fr auto', gap: '24px', alignItems: 'end' }}>
                    <div className="erp-input-group"><label>जमा रक्कम (Receipt Amount)</label><div style={{ position: 'relative' }}><span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#64748b' }}>₹</span><input className="erp-control" type="number" value={cashPaymentAmount} onChange={e => setCashPaymentAmount(e.target.value)} placeholder="0.00" style={{ paddingLeft: '28px', fontWeight: 900, fontSize: '1.4rem', color: 'var(--erp-success)' }} /></div></div>
                    <div className="erp-input-group"><label>पैसे मिळाल्याचे कारण / तपशील</label><input className="erp-control" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="e.g. Cash payment, Check, etc." style={{ height: '48px' }} /></div>
                    <button className="erp-btn success" onClick={() => saveBill(0, safeTotal(cashPaymentAmount))} style={{ height: '48px', padding: '0 32px' }}>जमा करा (Save)</button>
                  </div>
                )}

                {/* CURRENT BILL ITEMS - PROFESSIONAL INVOICE LOOK */}
                {!showPaymentForm && billItems.length > 0 && (
                  <div id="invoice-capture" style={{ marginTop: '30px', background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                    {/* Invoice Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: '24px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={logo} alt="Logo" style={{ width: '60px', height: '60px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        <div>
                          <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>SHREE TRADERS</h2>
                          <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>जुना सोमवंशी पेट्रोल पंप, अंबाजोगाई - 431517</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <h1 style={{ margin: 0, color: '#cbd5e1', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Invoice</h1>
                        <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold' }}>To: {customer.name}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Date: {new Date().toLocaleDateString('en-IN')}</div>
                      </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 8px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>आइटम तपशील (Item)</th>
                          <th style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>नग (Qty)</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>दर (Rate)</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>एकूण (Total)</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {billItems.map((item, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '16px 8px', fontWeight: 700, color: '#1e293b' }}>{item.product.name}</td>
                            <td style={{ padding: '16px 8px', textAlign: 'center' }}><span style={{ fontWeight: 800, color: '#334155' }}>{item.quantity}</span></td>
                            <td style={{ padding: '16px 8px', textAlign: 'right', color: '#64748b' }}>₹{item.unitPrice}</td>
                            <td style={{ padding: '16px 8px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₹{item.totalPrice.toLocaleString()}</td>
                            <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                              <button onClick={() => setBillItems(billItems.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#f8fafc', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div className="erp-input-group" style={{ width: '250px' }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>मिळालेली रक्कम (Paid Amount)</label>
                        <div style={{ position: 'relative', marginTop: '4px' }}>
                          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 900, color: '#64748b' }}>₹</span>
                          <input className="erp-control" type="number" value={paidNow} onChange={e => setPaidNow(e.target.value)} placeholder="0.00" style={{ paddingLeft: '28px', fontWeight: 900, fontSize: '1.2rem', borderColor: '#cbd5e1', boxShadow: 'none' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>आजचे एकूण बिल (Current Bill Total)</div>
                        <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#059669', lineHeight: '1', marginTop: '4px' }}>₹{currentBillAmount.toLocaleString()}</div>
                        
                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '8px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>जमा रक्कम (Paid)</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{safeTotal(paidNow).toLocaleString()}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>बाकी रक्कम (Remaining)</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#dc2626' }}>₹{Math.max(currentBillAmount - safeTotal(paidNow), 0).toLocaleString()}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                          <button className="erp-btn outline" onClick={sendCurrentBillOnWA} style={{ color: '#059669', borderColor: '#059669' }}><MessageCircle size={18} /> WhatsApp</button>
                          <button className="erp-btn primary" onClick={() => saveBill(currentBillAmount, safeTotal(paidNow))} style={{ padding: '0 40px', background: '#059669', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>विक्री पूर्ण करा (Complete)</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEDGER CARD - INDUSTRIAL DESIGN */}
          <div className="panel-modern">
            <div className="erp-card-header-clean">
              <div>
                <h3 className="erp-panel-title">व्यवहार इतिहास (Transaction Statement)</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                  <Calendar size={14} color="#64748b" />
                  <input type="date" className="erp-control" value={fromDate} onChange={e => setFromDate(e.target.value)} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.8rem', width: '110px' }} />
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  <input type="date" className="erp-control" value={toDate} onChange={e => setToDate(e.target.value)} style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.8rem', width: '110px' }} />
                </div>
                <select className="erp-control" value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setFromDate(''); setToDate(''); }} style={{ fontSize: '0.8rem' }}><option value="ALL">All Months</option>{availableMonths.map(m => <option key={m} value={m}>{m}</option>)}</select>
                <button className="erp-btn outline" onClick={() => { setFromDate(''); setToDate(''); setSelectedMonth('ALL'); }} style={{ padding: '8px' }} title="Reset Filters"><Clock size={16} /></button>
              </div>
            </div>
            <div className="erp-table-area" style={{ padding: '24px' }}>
              <div className="industrial-grid">
                <div className="grid-row header" style={{ gridTemplateColumns: '120px 1.5fr 100px 100px 100px 130px' }}>
                  <div>तारीख / ID</div>
                  <div>वस्तूचे नाव (Items)</div>
                  <div style={{ textAlign: 'center' }}>नग (Qty)</div>
                  <div style={{ textAlign: 'right' }}>विक्री (+)</div>
                  <div style={{ textAlign: 'right' }}>जमा (-)</div>
                  <div style={{ textAlign: 'right' }}>बाकी रक्कम</div>
                </div>
                {ledgerRows.map(b => (
                  <div key={b.id} className="grid-row" style={{ gridTemplateColumns: '120px 1.5fr 100px 100px 100px 130px' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{new Date(b.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>#{b.id}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {b.items && b.items.length > 0 ? (
                        <div>{b.items.map(i => i.product.name).join(', ')}</div>
                      ) : (
                        <div style={{ color: '#64748b' }}>{b.remarks || 'पेमेंट जमा'}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      {b.items && b.items.length > 0 ? (
                        <span className="status-pill credit" style={{ background: '#f1f5f9', color: '#475569' }}>
                          {b.items.reduce((acc, i) => acc + i.quantity, 0)} नग
                        </span>
                      ) : '-'}
                    </div>
                    <div style={{ textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>{b.totalAmount > 0 ? `₹${b.totalAmount.toLocaleString()}` : '-'}</div>
                    <div style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>{b.paidAmount > 0 ? `₹${b.paidAmount.toLocaleString()}` : '-'}</div>
                    <div style={{ textAlign: 'right', fontWeight: 900, color: b.bakiTracker > 0 ? '#ef4444' : '#0f172a' }}>₹{b.bakiTracker.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* VERY ADVANCE LEVEL PRINT VIEW */}
        <div className="print-only" style={{ padding: '40px', color: '#000', background: 'white', minHeight: '100vh', fontFamily: 'serif' }}>
          {/* OFFICIAL HEADER */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '4px solid #000', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <img src={logo} alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '3.5rem', fontWeight: 950, margin: 0, letterSpacing: '-2px' }}>भाग्यश्री ट्रेडर्स</h1>
                <p style={{ fontSize: '1.2rem', margin: '5px 0', textTransform: 'uppercase', letterSpacing: '4px', color: '#333' }}>सोलापूर मधील विश्वसनीय व्यापारी केंद्र</p>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>पत्ता: मु. पो. सोलापूर, महाराष्ट्र - ४१३००1</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.8rem', background: '#000', color: '#fff', padding: '10px 30px', margin: 0 }}>खाते हिशोब पत्रक</h2>
              <p style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                कालावधी: <strong>
                  {fromDate || toDate ? `${fromDate || 'सुरवातीपासून'} ते ${toDate || 'आजपर्यंत'}` : (selectedMonth !== 'ALL' ? selectedMonth : 'सर्व नोंदी')}
                </strong>
              </p>
              <p style={{ fontSize: '0.9rem' }}>वेळ: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

          {/* CUSTOMER & ACCOUNT SUMMARY GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '40px', marginTop: '40px' }}>
            <div style={{ border: '2px solid #000', padding: '24px', borderRadius: '4px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 800, color: '#666', marginBottom: '10px' }}>To (प्रति),</p>
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0', fontWeight: 900 }}>{customer.name}</h2>
              <p style={{ fontSize: '1.1rem', margin: '4px 0' }}>फोन: <strong>{customer.phone}</strong></p>
              <p style={{ fontSize: '1rem', margin: '4px 0' }}>पत्ता: {customer.address}</p>
              <p style={{ fontSize: '0.95rem', color: '#333', marginTop: '20px' }}>ग्राहक आयडी: <strong>#CUST-00{customer.id}</strong></p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#000', border: '2px solid #000' }}>
              <div style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>मागील येणे (Opening)</p>
                <h3 style={{ fontSize: '1.6rem', margin: '10px 0' }}>₹{summary.opening.toLocaleString()}/-</h3>
              </div>
              <div style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>एकूण विक्री (+)</p>
                <h3 style={{ fontSize: '1.6rem', margin: '10px 0', color: '#d00' }}>₹{summary.mDebit.toLocaleString()}/-</h3>
              </div>
              <div style={{ background: '#fff', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>एकूण जमा (-)</p>
                <h3 style={{ fontSize: '1.6rem', margin: '10px 0', color: '#080' }}>₹{summary.mCredit.toLocaleString()}/-</h3>
              </div>
              <div style={{ background: '#000', color: '#fff', padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>अखेरची बाकी (Total Baki)</p>
                <h3 style={{ fontSize: '1.8rem', margin: '10px 0', fontWeight: 900 }}>₹{summary.totalBaki.toLocaleString()}/-</h3>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', letterSpacing: '2px', textDecoration: 'underline' }}>तपशीलवार व्यवहार यादी (Transaction Audit Log)</h3>

            {/* Monthly Grouped Tables */}
            {Object.entries(
              ledgerRows.reduce((acc, row) => {
                const date = new Date(row.createdAt);
                const monthName = date.toLocaleDateString('mr-IN', { month: 'long', year: 'numeric' });
                if (!acc[monthName]) acc[monthName] = [];
                acc[monthName].push(row);
                return acc;
              }, {})
            ).map(([month, rows]) => (
              <div key={month} style={{ marginBottom: '30px' }}>
                <h4 style={{ background: '#f8fafc', padding: '8px 15px', borderLeft: '5px solid #000', marginBottom: '10px', fontSize: '1.1rem' }}>{month}</h4>
                <table className="erp-table" style={{ border: '2px solid #000', width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f0f0f0' }}>
                    <tr>
                      <th style={{ border: '1px solid #000', color: '#000', fontWeight: 900, padding: '10px', width: '90px' }}>दिनांक</th>
                      <th style={{ border: '1px solid #000', color: '#000', fontWeight: 900, padding: '10px' }}>वस्तूचे नाव (Items)</th>
                      <th style={{ border: '1px solid #000', textAlign: 'center', color: '#000', fontWeight: 900, padding: '10px', width: '60px' }}>नग (Qty)</th>
                      <th style={{ border: '1px solid #000', textAlign: 'right', color: '#000', fontWeight: 900, padding: '10px', width: '90px' }}>खरेदी (+)</th>
                      <th style={{ border: '1px solid #000', textAlign: 'right', color: '#000', fontWeight: 900, padding: '10px', width: '90px' }}>जमा (-)</th>
                      <th style={{ border: '1px solid #000', textAlign: 'right', color: '#000', fontWeight: 900, padding: '10px', width: '110px' }}>एकूण बाकी</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(b => (
                      <tr key={b.id}>
                        <td style={{ border: '1px solid #000', fontWeight: 800, padding: '8px', fontSize: '0.85rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td style={{ border: '1px solid #000', padding: '8px', fontSize: '0.9rem' }}>
                          {b.items && b.items.length > 0 ? (
                            <div style={{ fontWeight: 600 }}>{b.items.map(i => i.product.name).join(', ')}</div>
                          ) : (
                            <div style={{ color: '#444' }}>{b.remarks || 'पेमेंट जमा'}</div>
                          )}
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>रिफ: #{b.id}</div>
                        </td>
                        <td style={{ border: '1px solid #000', textAlign: 'center', fontWeight: 600, padding: '8px' }}>
                          {b.items && b.items.length > 0 ? b.items.reduce((acc, i) => acc + i.quantity, 0) : '-'}
                        </td>
                        <td style={{ border: '1px solid #000', textAlign: 'right', fontWeight: 700, padding: '8px' }}>{b.totalAmount > 0 ? b.totalAmount.toLocaleString() : '-'}</td>
                        <td style={{ border: '1px solid #000', textAlign: 'right', fontWeight: 700, padding: '8px' }}>{b.paidAmount > 0 ? b.paidAmount.toLocaleString() : '-'}</td>
                        <td style={{ border: '1px solid #000', textAlign: 'right', fontWeight: 950, fontSize: '0.95rem', background: '#f9f9f9', padding: '8px' }}>{b.bakiTracker.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '60px', borderTop: '2px solid #000', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', textAlign: 'left' }}>
            <div style={{ fontSize: '0.85rem' }}>
              <p>• संगणकीय प्रणालीद्वारे तयार केलेले स्टेटमेंट असल्याने सहीची आवश्यकता नाही.</p>
              <p>• काही त्रुटी आढळल्यास त्वरित संपर्क साधावा.</p>
              <p style={{ marginTop: '20px', fontWeight: 800 }}>हिशोब तपासल्याबद्दल धन्यवाद!</p>
            </div>
            <div style={{ textAlign: 'center', width: '250px' }}>
              <div style={{ height: '80px' }}></div>
              <p style={{ borderTop: '2px solid #000', paddingTop: '10px', fontWeight: 900 }}>अधिकृत स्वाक्षरी (Auth. Sign)</p>
              <p style={{ fontSize: '0.8rem' }}>भाग्यश्री ट्रेडर्स करिता</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CustomerView;
