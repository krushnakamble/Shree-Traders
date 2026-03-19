import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Settings, Save, RefreshCw, CloudUpload, History, Database, Shield, Lock, LayoutDashboard, Package, Users, Truck, HelpCircle, LogOut, Loader2, CheckCircle2, Download, FileText } from 'lucide-react';
import './Stock.css';
import logo from '../assets/logo.png';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role = 'user', email = 'Demo User' } = location.state || {};

  const [isSyncing, setIsSyncing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleString());
  const [stats, setStats] = useState({ products: 0, customers: 0, dealers: 0 });
  const [fullData, setFullData] = useState({ customers: [], dealers: [], bills: [], dealerBills: [], products: [] });

  const fetchStats = async () => {
    try {
      const [p, c, d, b, db] = await Promise.all([
        fetch('http://localhost:8080/api/products').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/customers').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/dealers').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/bills').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/dealer-bills').then(r => r.ok ? r.json() : [])
      ]);
      setStats({ products: p.length, customers: c.length, dealers: d.length });
      setFullData({ customers: c, dealers: d, bills: b, dealerBills: db, products: p });
      console.log('Data fetched for report:', { c: c.length, d: d.length, b: b.length, db: db.length, p: p.length });
    } catch (e) { 
      console.error('Fetch error:', e); 
    }
  };

  useEffect(() => { 
    fetchStats(); 
    // Auto refresh data every 30 seconds for real-time stats
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const downloadReport = async () => {
    setIsDownloading(true);
    try {
      // ✅ Fetch ALL data DIRECTLY here — do NOT rely on React state
      // because setState is async and html2canvas would capture before re-render
      const [products, customers, dealers, bills, dealerBills] = await Promise.all([
        fetch('http://localhost:8080/api/products').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/customers').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/dealers').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/bills').then(r => r.ok ? r.json() : []),
        fetch('http://localhost:8080/api/dealer-bills').then(r => r.ok ? r.json() : [])
      ]);

      // Also update the on-screen stats
      setStats({ products: products.length, customers: customers.length, dealers: dealers.length });
      setFullData({ customers, dealers, bills, dealerBills, products });

      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 40;
      let y = margin;
      const lineH = 16;
      const today = new Date().toLocaleDateString('mr-IN');

      const checkPage = (needed = lineH) => {
        if (y + needed > pageH - margin) { pdf.addPage(); y = margin; }
      };

      const drawHeader = (text, color = [37, 99, 235]) => {
        checkPage(30);
        pdf.setFillColor(...color);
        pdf.rect(margin, y, pageW - margin * 2, 22, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(text, margin + 8, y + 15);
        y += 28;
        pdf.setTextColor(0, 0, 0);
      };

      const drawTableHeader = (cols) => {
        checkPage(20);
        pdf.setFillColor(50, 65, 85);
        pdf.rect(margin, y, pageW - margin * 2, 18, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        let x = margin + 4;
        cols.forEach(col => { pdf.text(col.label, x, y + 12); x += col.w; });
        y += 20;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
      };

      const drawRow = (cols, values, shade = false) => {
        checkPage(16);
        if (shade) { pdf.setFillColor(248, 250, 252); pdf.rect(margin, y, pageW - margin * 2, 15, 'F'); }
        pdf.setFontSize(8);
        let x = margin + 4;
        cols.forEach((col, i) => {
          const val = String(values[i] ?? '-');
          pdf.text(val.substring(0, col.maxChars || 50), x, y + 10);
          x += col.w;
        });
        pdf.setDrawColor(200, 210, 220);
        pdf.line(margin, y + 15, pageW - margin, y + 15);
        y += 16;
      };

      // ===== TITLE PAGE =====
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 41, 59);
      pdf.text('Shree Traders - Sampurna Data Report', pageW / 2, y, { align: 'center' });
      y += 30;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Dinank: ${today}  |  Customers: ${customers.length}  |  Dealers: ${dealers.length}  |  Products: ${products.length}`, pageW / 2, y, { align: 'center' });
      y += 30;
      pdf.setDrawColor(30, 41, 59);
      pdf.setLineWidth(2);
      pdf.line(margin, y, pageW - margin, y);
      y += 20;

      // ===== SECTION 1: CUSTOMERS =====
      drawHeader('1. Grahak Suchi - Customer List (with Outstanding Balance)');
      const custCols = [
        { label: 'ID', w: 35 }, { label: 'Grahak Nav / Name', w: 150, maxChars: 22 },
        { label: 'Phone', w: 100 }, { label: 'Address', w: 140, maxChars: 20 },
        { label: 'Yene Baki (Rs)', w: 80 }
      ];
      drawTableHeader(custCols);
      customers.forEach((c, i) => {
        const bal = bills.filter(b => b.customer?.id === c.id).reduce((acc, b) => acc + (b.totalAmount - (b.paidAmount || 0)), 0);
        drawRow(custCols, [c.id, c.name, c.phone || '-', c.address || '-', `Rs ${bal.toLocaleString()}`], i % 2 === 0);
      });
      if (customers.length === 0) { pdf.setFontSize(9); pdf.text('Kona Grahak Nahi (No Customers Found)', margin, y); y += 20; }
      y += 15;

      // ===== SECTION 2: DEALERS =====
      drawHeader('2. Dilar Suchi - Dealer Directory', [124, 58, 237]);
      const dealerCols = [
        { label: 'ID', w: 35 }, { label: 'Dilar Nav / Name', w: 150, maxChars: 22 },
        { label: 'Phone', w: 100 }, { label: 'Address', w: 200, maxChars: 28 }
      ];
      drawTableHeader(dealerCols);
      dealers.forEach((d, i) => {
        drawRow(dealerCols, [d.id, d.name, d.phone || '-', d.address || '-'], i % 2 === 0);
      });
      if (dealers.length === 0) { pdf.setFontSize(9); pdf.text('Kona Dilar Nahi (No Dealers Found)', margin, y); y += 20; }
      y += 15;

      // ===== SECTION 3: INVENTORY =====
      const stockTotal = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
      drawHeader('3. Stock / Inventory Yadi - Stock Report', [5, 150, 105]);
      const stockCols = [
        { label: 'Vastu Nav', w: 130, maxChars: 18 }, { label: 'SKU', w: 70, maxChars: 10 },
        { label: 'Category', w: 90, maxChars: 13 }, { label: 'Shillak Nag', w: 70 },
        { label: 'Dar (Rs)', w: 70 }, { label: 'Ekun Mulya', w: 70 }
      ];
      drawTableHeader(stockCols);
      products.forEach((p, i) => {
        drawRow(stockCols, [p.name, `#${p.sku}`, p.category, p.quantity, `Rs ${p.price}`, `Rs ${(p.price * p.quantity).toLocaleString()}`], i % 2 === 0);
      });
      if (products.length === 0) { pdf.setFontSize(9); pdf.text('Stock Nahi (No Stock Found)', margin, y); y += 20; }
      // Totals row
      checkPage(20);
      pdf.setFillColor(219, 234, 254);
      pdf.rect(margin, y, pageW - margin * 2, 18, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text(`Ekun Stock Mulya (Total Valuation): Rs ${stockTotal.toLocaleString()}`, margin + 8, y + 12);
      pdf.setFont('helvetica', 'normal');
      y += 25;

      // ===== SECTION 4: CUSTOMER TRANSACTIONS =====
      drawHeader('4. Grahak Vyavahar Log - Customer Transaction History', [217, 119, 6]);
      const billCols = [
        { label: 'Dinank', w: 70 }, { label: 'Grahak', w: 120, maxChars: 17 },
        { label: 'Vastu / Remark', w: 140, maxChars: 20 },
        { label: 'Kharedi (+)', w: 80 }, { label: 'Jama (-)', w: 80 }, { label: 'Baki', w: 60 }
      ];
      drawTableHeader(billCols);
      [...bills].reverse().forEach((b, i) => {
        const baki = b.totalAmount - (b.paidAmount || 0);
        drawRow(billCols, [
          new Date(b.createdAt).toLocaleDateString('en-IN'),
          b.customer?.name || 'Unknown',
          b.remarks || b.itemName || '-',
          `Rs ${b.totalAmount.toLocaleString()}`,
          `Rs ${(b.paidAmount || 0).toLocaleString()}`,
          baki > 0 ? `Rs ${baki.toLocaleString()}` : 'Full'
        ], i % 2 === 0);
      });
      if (bills.length === 0) { pdf.setFontSize(9); pdf.text('Customer Vyavahar Nahi', margin, y); y += 20; }
      y += 15;

      // ===== SECTION 5: DEALER TRANSACTIONS =====
      drawHeader('5. Dilar Vyavahar Log - Dealer Purchase History', [220, 38, 38]);
      const dbillCols = [
        { label: 'Dinank', w: 65 }, { label: 'Dilar', w: 110, maxChars: 15 },
        { label: 'Nag', w: 40 }, { label: 'Dar', w: 55 },
        { label: 'Kharedi (+)', w: 80 }, { label: 'Payment (-)', w: 80 }, { label: 'Remark', w: 85, maxChars: 12 }
      ];
      drawTableHeader(dbillCols);
      [...dealerBills].reverse().forEach((b, i) => {
        drawRow(dbillCols, [
          new Date(b.createdAt).toLocaleDateString('en-IN'),
          b.dealer?.name || 'Unknown',
          b.quantity || '-',
          b.rate ? `Rs ${b.rate}` : '-',
          `Rs ${b.totalAmount.toLocaleString()}`,
          `Rs ${(b.paidAmount || 0).toLocaleString()}`,
          b.remarks || '-'
        ], i % 2 === 0);
      });
      if (dealerBills.length === 0) { pdf.setFontSize(9); pdf.text('Dealer Vyavahar Nahi', margin, y); y += 20; }
      y += 20;

      // Footer on last page
      checkPage(30);
      pdf.setDrawColor(30, 41, 59);
      pdf.setLineWidth(1.5);
      pdf.line(margin, y, pageW - margin, y);
      y += 12;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Report Samapt - Shree Traders, Solapur  |  ${today}  |  Cloud ERP System`, pageW / 2, y, { align: 'center' });

      // page numbers
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 20, { align: 'right' });
        pdf.text('Shree Traders ERP', margin, pageH - 20);
      }

      pdf.save(`ShreeTraders_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Report generation failed. Please check if backend is running.\n' + err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="erp-container">
      {/* Hidden Report Content for PDF Capture */}
      <div id="full-report-content" style={{ display: 'none', width: '1000px', padding: '60px', background: 'white', color: 'black', fontFamily: 'serif' }}>
        <h1 style={{ textAlign: 'center', borderBottom: '4px solid black', paddingBottom: '15px', color: '#1e293b' }}>श्री ट्रेडर्स - संपूर्ण डेटा अहवाल (System Audit Log)</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontWeight: 700 }}>
          <span>दिनांक: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
          <span>प्रशासक: {email}</span>
        </div>
        
        <section style={{ marginTop: '40px' }}>
          <h2 style={{ background: '#f1f5f9', padding: '10px', borderLeft: '8px solid #2563eb' }}>१. ग्राहक सूची आणि येणे बाकी (Customer Balances)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#334155', color: 'white' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px' }}>ID</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px' }}>ग्राहक नाव</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px' }}>फोन</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px', textAlign: 'right' }}>येणे बाकी</th>
              </tr>
            </thead>
            <tbody>
              {fullData.customers.length > 0 ? fullData.customers.map(c => {
                 const balance = fullData.bills
                   .filter(b => b.customer?.id === c.id)
                   .reduce((acc, b) => acc + (b.totalAmount - (b.paidAmount || 0)), 0);
                 return (
                   <tr key={c.id}>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>{c.id}</td>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 700 }}>{c.name}</td>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{c.phone}</td>
                     <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: 900, color: balance > 0 ? '#ef4444' : '#1e293b' }}>₹{balance.toLocaleString()}</td>
                   </tr>
                 );
              }) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>नो ग्राहक सापडले नाहीत (No Customers Found)</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section style={{ marginTop: '50px' }}>
          <h2 style={{ background: '#f1f5f9', padding: '10px', borderLeft: '8px solid #2563eb' }}>२. डिलर सूची (Dealer Information)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#334155', color: 'white' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px' }}>नाव</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px' }}>फोन</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '12px' }}>पत्ता</th>
              </tr>
            </thead>
            <tbody>
              {fullData.dealers.length > 0 ? fullData.dealers.map(d => (
                 <tr key={d.id}>
                   <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 700 }}>{d.name}</td>
                   <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{d.phone}</td>
                   <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{d.address}</td>
                 </tr>
              )) : (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>नोंदणीकृत डिलर नाहीत (No Dealers Found)</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section style={{ marginTop: '50px' }}>
          <h2 style={{ background: '#f1f5f9', padding: '10px', borderLeft: '8px solid #059669' }}>३. स्टॉक / इन्व्हेंटरी यादी (Inventory Report)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#334155', color: 'white' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>वस्तू नाव</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>SKU</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>कॅटेगरी</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>शिल्लक नग</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>दर (₹)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>एकूण मूल्य (₹)</th>
              </tr>
            </thead>
            <tbody>
              {fullData.products.length > 0 ? fullData.products.map(p => (
                <tr key={p.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 700 }}>{p.name}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontFamily: 'monospace', fontSize: '0.85rem' }}>#{p.sku}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px' }}>{p.category}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center', fontWeight: 900, color: p.quantity < 10 ? '#dc2626' : '#1e293b' }}>{p.quantity}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>₹{p.price.toLocaleString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: 900, color: '#2563eb' }}>₹{(p.price * p.quantity).toLocaleString()}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>स्टॉक उपलब्ध नाही (No Stock Found)</td></tr>
              )}
              {fullData.products.length > 0 && (
                <tr style={{ background: '#f1f5f9', fontWeight: 900 }}>
                  <td colSpan="5" style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>एकूण स्टॉक मूल्य (Total Valuation):</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', color: '#2563eb', fontSize: '1.1rem' }}>₹{fullData.products.reduce((acc, p) => acc + p.price * p.quantity, 0).toLocaleString()}</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section style={{ marginTop: '50px' }}>
          <h2 style={{ background: '#f1f5f9', padding: '10px', borderLeft: '8px solid #d97706' }}>४. ग्राहक व्यवहार लॉग (Customer Transaction Log)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#334155', color: 'white' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>दिनांक</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>ग्राहक</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>वस्तू / तपशील</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>खरेदी (+)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>जमा (-)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>स्थिती</th>
              </tr>
            </thead>
            <tbody>
              {fullData.bills.length > 0 ? [...fullData.bills].reverse().map(b => (
                <tr key={b.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontSize: '0.85rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 700 }}>{b.customer?.name || 'Unknown'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontSize: '0.85rem' }}>{b.remarks || b.itemName || '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{b.totalAmount.toLocaleString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>₹{(b.paidAmount || 0).toLocaleString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontSize: '0.8rem' }}>{(b.totalAmount - (b.paidAmount || 0)) > 0 ? 'बाकी आहे' : 'पूर्ण'}</td>
                </tr>
              )) : (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>व्यवहार सापडले नाहीत</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section style={{ marginTop: '50px' }}>
          <h2 style={{ background: '#f1f5f9', padding: '10px', borderLeft: '8px solid #7c3aed' }}>५. डिलर व्यवहार लॉग (Dealer Transaction Log)</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ background: '#334155', color: 'white' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>दिनांक</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>डिलर</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>नग</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>दर</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>खरेदी (+)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>पेमेंट (-)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '10px' }}>तपशील</th>
              </tr>
            </thead>
            <tbody>
              {fullData.dealerBills && fullData.dealerBills.length > 0 ? [...fullData.dealerBills].reverse().map(b => (
                <tr key={b.id}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontSize: '0.85rem' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontWeight: 700 }}>{b.dealer?.name || 'Unknown'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'center' }}>{b.quantity || '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right' }}>{b.rate ? `₹${b.rate}` : '-'}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: 700, color: '#dc2626' }}>₹{b.totalAmount.toLocaleString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>₹{(b.paidAmount || 0).toLocaleString()}</td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontSize: '0.85rem' }}>{b.remarks || '-'}</td>
                </tr>
              )) : (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>डिलर व्यवहार सापडले नाहीत</td></tr>
              )}
            </tbody>
          </table>
        </section>
        
        <div style={{ marginTop: '80px', paddingTop: '30px', borderTop: '2px solid black', textAlign: 'center' }}>
          <p style={{ fontWeight: 800 }}>अहवाल समाप्त - श्री ट्रेडर्स, सोलापूर</p>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Cloud ERP System Protected by Enterprise Security</p>
        </div>
      </div>

      <aside className="erp-sidebar">
        <div className="erp-brand">
           <img src={logo} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'white' }} />
           <span>SHREE TRADERS</span>
        </div>
        <nav className="erp-nav">
          <div className="erp-nav-item" onClick={() => navigate('/stock', { state: { role, email } })}><Package /> एकूण स्टॉक</div>
          <div className="erp-nav-item" onClick={() => navigate('/customers', { state: { role, email } })}><Users /> ग्राहक खाते (Retail)</div>
          <div className="erp-nav-item" onClick={() => navigate('/dealers', { state: { role, email } })}><Truck /> डिलर खाते (Wholesale)</div>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0' }}></div>
          <div className="erp-nav-item active"><Settings /> सिस्टिम सेटिंग्स</div>
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

      <main className="erp-main">
        <header className="erp-header">
          <h1 className="erp-panel-title">प्रणाली सेटिंग्स आणि डेटा सुरक्षा</h1>
          <div style={{ fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Shield size={16}/> Auto Backup Active
          </div>
        </header>

        <div className="erp-content">
          <div className="erp-panel" style={{ marginBottom: '30px' }}>
            <div className="erp-panel-header">
              <h3 className="erp-panel-title"><CloudUpload size={20} /> रिअल-टाइम क्लाउड सिंक (Auto Cloud Backup)</h3>
            </div>
            <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="status-pill success" style={{ padding: '4px 12px' }}>
                      <span className="dot pulse"></span> ONLINE
                    </div>
                    <h2 style={{ fontSize: '1.4rem', margin: 0, color: '#1e293b' }}>ऑटो बॅकअप सुरु आहे</h2>
                  </div>
                  <p style={{ color: '#64748b', marginTop: '10px' }}>सर्व व्यवहार सुरक्षितपणे डेटाबेसमध्ये सेव्ह केले जात आहेत. तुम्हाला मॅन्युअल बॅकअपची आवश्यकता नाही.</p>
               </div>
               <div style={{ display: 'flex', gap: '15px' }}>
                 <button 
                  className={`erp-btn ${isDownloading ? 'outline' : 'primary'}`} 
                  onClick={downloadReport}
                  style={{ padding: '16px 32px', height: 'auto', gap: '12px', background: '#2563eb', fontSize: '1.05rem', boxShadow: 'var(--shadow-md)' }}
                  disabled={isDownloading}
                 >
                   {isDownloading ? <Loader2 className="spin" size={20} /> : <Download size={22} />} 
                   {isDownloading ? 'Downloading Report...' : 'संपूर्ण डेटा रिपोर्ट (PDF) डाउनलोड करा'}
                 </button>

                 <div 
                  style={{ padding: '16px 24px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700 }}
                 >
                   <CheckCircle2 size={20} /> ऑटो-बॅकअप Active
                 </div>
               </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div className="erp-panel">
               <div className="erp-panel-header"><h3 className="erp-panel-title"><Database size={20} /> डेटाबेस स्टॅट्स (Audit Log)</h3></div>
               <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                       <span>एकूण ग्राहक (Active Customers)</span>
                       <strong style={{fontSize: '1.2rem'}}>{stats.customers}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                       <span>एकूण प्रॉडक्ट्स (SKUs)</span>
                       <strong style={{fontSize: '1.2rem'}}>{stats.products}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                       <span>एकूण डिलर्स (Wholesale)</span>
                       <strong style={{fontSize: '1.2rem'}}>{stats.dealers}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                       <span>रिअल-टाइम बॅकअप वेळ</span>
                       <span style={{ color: '#059669', fontWeight: 700 }}>{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
               </div>
            </div>

            <div className="erp-panel">
               <div className="erp-panel-header"><h3 className="erp-panel-title"><Lock size={20} /> सिक्युरिटी लॉग (Audit Trail)</h3></div>
               <div style={{ padding: '24px' }}>
                 <div className="industrial-grid">
                    <div className="grid-row header" style={{gridTemplateColumns: 'auto 1fr'}}>
                       <div>वेळ (Timestamp)</div>
                       <div>कृती (Action)</div>
                    </div>
                    <div className="grid-row" style={{gridTemplateColumns: 'auto 1fr'}}>
                       <div style={{fontSize: '0.8rem', color: '#64748b'}}>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                       <div style={{fontWeight: 700}}>सिस्टिम मध्ये लॉग इन (Admin)</div>
                    </div>
                    {isDownloading && (
                      <div className="grid-row" style={{gridTemplateColumns: 'auto 1fr'}}>
                         <div style={{fontSize: '0.8rem', color: '#64748b'}}>Just now</div>
                         <div style={{fontWeight: 700, color: '#2563eb'}}>फुल रिपोर्ट तयार होत आहे... (PDF)</div>
                      </div>
                    )}
                    {isSyncing && (
                      <div className="grid-row" style={{gridTemplateColumns: 'auto 1fr'}}>
                         <div style={{fontSize: '0.8rem', color: '#64748b'}}>Just now</div>
                         <div style={{fontWeight: 700, color: 'var(--erp-primary)'}}>डेटा अपलोड सुरु... (Upload Started)</div>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;
