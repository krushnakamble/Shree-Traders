import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, TrendingUp, Package, Users, Truck } from 'lucide-react';
import logo from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStat, setCurrentStat] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [sparkles, setSparkles] = useState([]);
  const [ripples, setRipples] = useState([]);
  const sparkleIdRef = React.useRef(0);
  const rippleIdRef = React.useRef(0);

  // Fixed constellation stars (seeded positions across screen)
  const stars = React.useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: ((i * 137.5) % 100),
    y: ((i * 73.1 + 15) % 90),
    size: 2 + (i % 3),
    color: ['#a5b4fc','#6ee7b7','#fde68a','#f9a8d4','#67e8f9'][i % 5],
  })), []);

  const stats = [
    { icon: <Package size={20} />, label: 'Stock Items', value: '500+', color: '#6366f1' },
    { icon: <Users size={20} />, label: 'Customers', value: '200+', color: '#10b981' },
    { icon: <Truck size={20} />, label: 'Dealers', value: '50+', color: '#f59e0b' },
    { icon: <TrendingUp size={20} />, label: 'Transactions', value: '1000+', color: '#ef4444' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentStat(s => (s + 1) % stats.length), 2500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const trailColors = ['#6366f1','#a5b4fc','#818cf8','#10b981','#06b6d4','#f59e0b','#ec4899','#fff'];
    const handleMouseMove = (e) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
      setMousePos({ x: e.clientX, y: e.clientY });
      // Spawn sparkle trail particles
      const id = sparkleIdRef.current++;
      const sparks = Array.from({ length: 3 }, (_, i) => ({
        id: `${id}-${i}`,
        x: e.clientX,
        y: e.clientY,
        size: 4 + Math.random() * 10,
        color: trailColors[Math.floor(Math.random() * trailColors.length)],
        angle: Math.random() * 360,
        vx: (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 60,
        born: Date.now(),
        lifetime: 500 + Math.random() * 300,
      }));
      setSparkles(prev => [...prev.slice(-40), ...sparks]);
    };
    // Click shockwave
    const handleClick = (e) => {
      const id = rippleIdRef.current++;
      setRipples(prev => [...prev, {
        id,
        x: e.clientX,
        y: e.clientY,
        born: Date.now(),
        color: ['#6366f1','#10b981','#f59e0b','#ec4899','#06b6d4'][id % 5],
      }]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  // Remove expired sparkles
  useEffect(() => {
    if (sparkles.length === 0) return;
    const raf = requestAnimationFrame(() => {
      const now = Date.now();
      setSparkles(prev => prev.filter(s => now - s.born < s.lifetime));
    });
    return () => cancelAnimationFrame(raf);
  }, [sparkles]);

  // Remove old ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const t = setTimeout(() => {
      const now = Date.now();
      setRipples(prev => prev.filter(r => now - r.born < 1200));
    }, 100);
    return () => clearTimeout(t);
  }, [ripples]);

  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${(i * 4.5) % 100}%`,
    size: `${4 + (i % 5) * 3}px`,
    delay: `${(i * 0.7) % 8}s`,
    duration: `${7 + (i % 6) * 1.5}s`,
    opacity: 0.15 + (i % 4) * 0.08,
    color: ['#6366f1','#818cf8','#a5b4fc','#10b981','#f59e0b','#06b6d4'][i % 6],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('कृपया सर्व माहिती भरा.'); return; }
    setIsLoading(true);
    try {
      const response = await fetch('https://shree-traders.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      if (data.success) {
        navigate('/stock', { state: { role: data.role, email: data.email } });
      } else {
        setError(data.message || 'चुकीची माहिती. पुन्हा प्रयत्न करा.');
      }
    } catch (err) {
      setError('Server शी कनेक्ट होता आले नाही. Backend चालू आहे का?');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Animated background orbs — move with mouse (parallax) */}
      <div style={{ ...styles.orb, ...styles.orb1, transform: `translate(${mouse.x * 40 - 20}px, ${mouse.y * 40 - 20}px) scale(1)` }} />
      <div style={{ ...styles.orb, ...styles.orb2, transform: `translate(${-mouse.x * 50 + 25}px, ${-mouse.y * 50 + 25}px) scale(1)` }} />
      <div style={{ ...styles.orb, ...styles.orb3, transform: `translate(${mouse.x * 30 - 15}px, ${-mouse.y * 30 + 15}px) scale(1)` }} />

      {/* Cursor spotlight — follows mouse */}
      <div style={{
        position: 'absolute',
        left: `${mouse.x * 100}%`,
        top: `${mouse.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
        transition: 'left 0.08s ease, top 0.08s ease',
      }} />

      {/* ✨ Sparkle cursor trail */}
      {sparkles.map(s => {
        const age = Date.now() - s.born;
        const progress = age / s.lifetime;
        const opacity = Math.max(0, 1 - progress);
        const tx = s.vx * progress;
        const ty = s.vy * progress + 30 * progress * progress; // gravity
        const scale = 1 - progress * 0.6;
        return (
          <div key={s.id} style={{
            position: 'fixed',
            left: s.x + tx,
            top: s.y + ty,
            width: `${s.size}px`,
            height: `${s.size}px`,
            borderRadius: s.size > 10 ? '50%' : '2px',
            background: s.color,
            opacity,
            transform: `translate(-50%,-50%) scale(${scale}) rotate(${s.angle + progress * 180}deg)`,
            boxShadow: `0 0 ${s.size * 2}px ${s.color}, 0 0 ${s.size * 4}px ${s.color}55`,
            pointerEvents: 'none',
            zIndex: 9999,
          }} />
        );
      })}

      {/* 3rd Animation: Floating Particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left,
          bottom: '-20px',
          width: p.size,
          height: p.size,
          borderRadius: '50%',
          background: p.color,
          opacity: p.opacity,
          filter: `blur(2px)`,
          boxShadow: `0 0 10px ${p.color}, 0 0 20px ${p.color}`,
          animation: `floatUp ${p.duration} ${p.delay} infinite linear`,
          zIndex: 0,
          pointerEvents: 'none',
        }} />
      ))}

      {/* 3D tilt container — reacts to mouse */}
      <div style={{
        ...styles.container,
        transform: `perspective(1200px) rotateY(${(mouse.x - 0.5) * 6}deg) rotateX(${(0.5 - mouse.y) * 4}deg)`,
        transition: 'transform 0.12s ease',
      }}>

        {/* ====== LEFT PANEL - BRAND ====== */}
        <div style={styles.leftPanel}>
          <div style={styles.leftInner}>

            {/* Logo & Brand */}
            <div style={styles.brandRow}>
              <div style={styles.logoCircle}>
                <img src={logo} alt="Shree Traders" style={styles.logoImg} />
              </div>
              <div>
                <div style={styles.brandName}>SHREE TRADERS</div>
                <div style={styles.brandSub}>Cloud ERP System</div>
              </div>
            </div>

            {/* Main Headline */}
            <h1 style={styles.headline}>
              <span style={styles.headlineAccent}>जोतिबा प्रसन्न</span>
            </h1>


            {/* Rotating Feature Stat */}
            <div style={styles.statCard}>
              {stats.map((s, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.statItem,
                    opacity: currentStat === i ? 1 : 0,
                    transform: currentStat === i ? 'translateY(0)' : 'translateY(12px)',
                    position: currentStat === i ? 'relative' : 'absolute',
                    transition: 'all 0.5s ease',
                  }}
                >
                  <div style={{ ...styles.statIcon, background: s.color + '22', color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={styles.statValue}>{s.value}</div>
                    <div style={styles.statLabel}>{s.label}</div>
                  </div>
                </div>
              ))}
              <div style={styles.statDots}>
                {stats.map((_, i) => (
                  <div key={i} style={{ ...styles.dot, background: currentStat === i ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
            </div>


            <div style={styles.leftFooter}>© 2026 Shree Traders — Solapur</div>
          </div>
        </div>

        {/* ====== RIGHT PANEL - FORM ====== */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>

            {/* Top label */}
            <div style={styles.formTop}>
              <span style={styles.welcomeLabel}>Welcome Back 👋</span>
              <h2 style={styles.formTitle}>Mr Krushna Kamble</h2>
              <p style={styles.formSub}>Sign in to your workspace to continue</p>
            </div>

            {/* Role Toggle */}
            <div style={styles.roleToggle}>
              <button
                type="button"
                style={{ ...styles.roleBtn, ...(role === 'admin' ? styles.roleBtnActive : {}) }}
                onClick={() => { setRole('admin'); setError(''); }}
              >
                <ShieldCheck size={16} />
                <span>Admin</span>
              </button>
              <button
                type="button"
                style={{ ...styles.roleBtn, ...(role === 'user' ? styles.roleBtnActiveUser : {}) }}
                onClick={() => { setRole('user'); setError(''); }}
              >
                <User size={16} />
                <span>User</span>
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={styles.errorBox}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Email */}
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>ईमेल पत्ता (Email)</label>
                <div style={{ ...styles.inputWrap, boxShadow: focusedField === 'email' ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none', borderColor: focusedField === 'email' ? '#6366f1' : '#e2e8f0' }}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    id="login-email"
                    placeholder="admin@shreetraders.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    style={styles.inputField}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={styles.fieldWrap}>
                <label style={styles.fieldLabel}>पासवर्ड (Password)</label>
                <div style={{ ...styles.inputWrap, boxShadow: focusedField === 'pass' ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none', borderColor: focusedField === 'pass' ? '#6366f1' : '#e2e8f0' }}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('pass')}
                    onBlur={() => setFocusedField(null)}
                    disabled={isLoading}
                    style={{ ...styles.inputField, paddingRight: '44px' }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                  <input type="checkbox" style={{ accentColor: '#6366f1', width: '16px', height: '16px' }} />
                  <span>लक्षात ठेव (Remember me)</span>
                </label>
                <button type="button" onClick={() => navigate('/support')} style={styles.forgotBtn}>
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <button type="submit" disabled={isLoading} style={{ ...styles.submitBtn, ...(role === 'admin' ? {} : styles.submitBtnUser) }}>
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={styles.spinner} /> Signing in...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    Mr Krushna Kamble <ArrowRight size={20} />
                  </span>
                )}
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  orb1: {
    width: '500px', height: '500px',
    background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
    top: '-150px', left: '-150px',
    animation: 'pulse 8s ease-in-out infinite',
  },
  orb2: {
    width: '400px', height: '400px',
    background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
    bottom: '-100px', right: '10%',
    animation: 'pulse 10s ease-in-out infinite reverse',
  },
  orb3: {
    width: '300px', height: '300px',
    background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
    top: '40%', left: '45%',
  },
  container: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    minHeight: '620px',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
    margin: '24px',
    position: 'relative',
    zIndex: 1,
  },
  // LEFT PANEL
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 100%)',
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  },
  leftInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    position: 'relative',
    zIndex: 1,
  },
  brandRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'white',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
    flexShrink: 0,
  },
  logoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  brandName: {
    fontSize: '1.1rem',
    fontWeight: 800,
    color: 'white',
    letterSpacing: '0.05em',
  },
  brandSub: {
    fontSize: '0.75rem',
    color: 'rgba(165,180,252,0.8)',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'white',
    lineHeight: 1.3,
    margin: 0,
  },
  headlineAccent: {
    background: 'linear-gradient(90deg, #a5b4fc, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headlineSub: {
    color: 'rgba(199,210,254,0.7)',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    margin: 0,
  },
  statCard: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '16px',
    padding: '20px 24px 14px',
    backdropFilter: 'blur(10px)',
    minHeight: '90px',
    position: 'relative',
    overflow: 'hidden',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  statIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: 900,
    color: 'white',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(199,210,254,0.7)',
    marginTop: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statDots: {
    display: 'flex',
    gap: '6px',
    marginTop: '12px',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    transition: 'background 0.4s',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  badge: {
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.35)',
    color: '#a5b4fc',
    padding: '6px 14px',
    borderRadius: '100px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  leftFooter: {
    color: 'rgba(148,163,184,0.5)',
    fontSize: '0.78rem',
    marginTop: '8px',
  },
  // RIGHT PANEL
  rightPanel: {
    flex: '0 0 460px',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  formCard: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  formTop: {
    marginBottom: '4px',
  },
  welcomeLabel: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  formTitle: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  formSub: {
    color: '#64748b',
    fontSize: '0.9rem',
    margin: 0,
  },
  roleToggle: {
    display: 'flex',
    background: '#e2e8f0',
    borderRadius: '12px',
    padding: '4px',
    gap: '4px',
  },
  roleBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    borderRadius: '9px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    fontFamily: "'Inter', sans-serif",
  },
  roleBtnActive: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
  },
  roleBtnActiveUser: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '0.875rem',
    animation: 'shake 0.4s ease',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fieldLabel: {
    fontSize: '0.83rem',
    fontWeight: 600,
    color: '#374151',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1.5px solid #e2e8f0',
    borderRadius: '12px',
    padding: '0 14px',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  inputIcon: {
    color: '#94a3b8',
    flexShrink: 0,
    marginRight: '10px',
  },
  inputField: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '0.95rem',
    color: '#0f172a',
    padding: '13px 0',
    fontFamily: "'Inter', sans-serif",
  },
  eyeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '6px',
    position: 'absolute',
    right: '12px',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    padding: 0,
    fontFamily: "'Inter', sans-serif",
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.25s ease',
    boxShadow: '0 6px 20px rgba(99,102,241,0.35)',
    fontFamily: "'Inter', sans-serif",
    marginTop: '4px',
  },
  submitBtnUser: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 6px 20px rgba(16,185,129,0.35)',
  },
  spinner: {
    display: 'inline-block',
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '-8px',
  },
  contactBtn: {
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    textDecoration: 'underline',
    fontFamily: "'Inter', sans-serif",
    padding: 0,
  },
  secureBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '-10px',
  },
};

// Inject keyframes
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8;} 50%{transform:scale(1.08);opacity:1;} }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shake { 0%,100%{transform:translateX(0);} 20%{transform:translateX(-6px);} 40%{transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} }
  @keyframes floatUp {
    0%   { transform: translateY(0px) scale(1);    opacity: 0.3; }
    25%  { transform: translateY(-25vh) scale(1.2); opacity: 0.5; }
    75%  { transform: translateY(-75vh) scale(0.9); opacity: 0.2; }
    100% { transform: translateY(-105vh) scale(0.5); opacity: 0; }
  }
  #login-email::placeholder, #login-password::placeholder { color: #cbd5e1; }
  @media (max-width: 768px) {
    .login-left-panel { display: none; }
    .login-right-panel { flex: 1 !important; padding: 24px !important; }
  }
`;
if (!document.getElementById('login-keyframes')) {
  styleTag.id = 'login-keyframes';
  document.head.appendChild(styleTag);
}

export default Login;
