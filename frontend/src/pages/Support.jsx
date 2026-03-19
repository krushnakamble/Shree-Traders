import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Phone, Mail, MapPin, ArrowLeft, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import './Stock.css';
import logo from '../assets/logo.png';

function Support() {
  const navigate = useNavigate();

  return (
    <div className="erp-container" style={{ minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="bg-mesh"></div>
      
      <main style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
        <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="erp-btn outline" onClick={() => navigate(-1)} style={{ padding: '10px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="erp-panel-title" style={{ fontSize: '2rem' }}>सपोर्ट आणि सिस्टिम सहाय्य (Help Center)</h1>
            <p style={{ color: 'var(--text-muted)' }}>Shree Traders ERP Management System Support</p>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Admin Contact Info */}
          <div className="erp-panel" style={{ padding: '0' }}>
            <div className="erp-panel-header">
              <h3 className="erp-panel-title"><ShieldCheck size={20} /> ऍडमीन सोबत संपर्क साधा</h3>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', color: '#2563eb' }}>
                    <Phone size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>कस्टमर केअर / हेल्पलाईन</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>+91 98765 43210</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', color: '#2563eb' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ईमेल पत्ता</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>admin@shreetraders.com</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ padding: '12px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '12px', color: '#2563eb' }}>
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>मुख्य कार्यालय</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>Shree Traders, Market Yard, Solapur - 413005</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines/Working Hours */}
          <div className="erp-panel" style={{ padding: '0' }}>
            <div className="erp-panel-header">
              <h3 className="erp-panel-title"><Clock size={20} /> कार्यरत वेळ (Service Hours)</h3>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <span>सोमवार - शुक्रवार</span>
                  <strong style={{ color: '#2563eb' }}>10:00 AM - 06:00 PM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <span>शनिवार</span>
                  <strong style={{ color: '#2563eb' }}>10:00 AM - 02:00 PM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                  <span>रविवार</span>
                  <strong>सुट्टी (Closed)</strong>
                </div>
              </div>

              <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255, 193, 7, 0.05)', border: '1px dashed #f59e0b', borderRadius: '12px' }}>
                <div style={{ fontWeight: 800, color: '#d97706', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <HelpCircle size={18} /> सूचना (Instructions)
                </div>
                <p style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: '1.5' }}>
                  जर तुम्हाला सिस्टिम लॉग इन करण्यात अडचण येत असेल, तर कृपया तुमचा रजिस्टर ईमेल आयडी सोबत ठेवा. नवीन खात्यासाठी ऍडमीनला विनंती करा.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <div className="erp-brand" style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '15px' }}>
             <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'white' }} />
             <span style={{ fontSize: '1.5rem', marginLeft: '12px' }}>SHREE TRADERS</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>© 2026 SHREE TRADERS Cloud ERP. All Rights Reserved.</p>
        </div>
      </main>
    </div>
  );
}

export default Support;
