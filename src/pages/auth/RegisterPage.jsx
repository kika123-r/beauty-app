// src/pages/auth/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Vyplň všetky polia.'); return; }
    if (form.password.length < 6) { setError('Heslo musí mať aspoň 6 znakov.'); return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Účet vytvorený!');
      navigate(ROUTES.HOME);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Tento email už existuje.');
      } else {
        setError('Chyba pri registrácii. Skús znova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: '#FFFFFF',
    border: '1px solid #E2E2DE',
    borderRadius: '12px',
    fontSize: '14px', color: '#1C1C1B',
    outline: 'none', fontFamily: 'Jost, sans-serif',
    fontWeight: 300, transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '10px', fontWeight: 500,
    color: '#979086', marginBottom: '8px',
    letterSpacing: '0.12em', textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F0EA' }}>

      {/* Ľavá strana */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(to bottom, rgba(28,28,27,0.15), rgba(28,28,27,0.5)), url("https://i.pinimg.com/736x/b2/ca/85/b2ca85fb32d35db4e02584175487f894.jpg") center center / cover no-repeat',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left">

        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '280px', height: '380px',
          border: '1.5px solid rgba(245,240,234,0.3)',
          borderRadius: '140px 140px 0 0',
        }} />

        <div style={{
          position: 'absolute',
          bottom: '10%', left: '0', right: '0',
          textAlign: 'center', padding: '0 40px',
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '2.2rem', color: '#F5F0EA',
            fontWeight: 300, lineHeight: 1.3, marginBottom: '12px',
          }}>
            Začni svoju<br />beauty cestu.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(245,240,234,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Premium Beauty Experience
          </p>
        </div>
      </div>

      {/* Pravá strana */}
      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: '#F5F0EA',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4C5B0, #A89070)',
              margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0EA', fontWeight: 300 }}>B</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', color: '#1C1C1B', marginBottom: '6px', fontFamily: 'Cormorant Garamond, serif' }}>
              BeautyTime
            </h1>
            <p style={{ fontSize: '13px', color: '#979086', letterSpacing: '0.08em' }}>
              Vytvor si nový účet
            </p>
          </div>

          {/* Formulár */}
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Meno a priezvisko</label>
              <input
                type="text" name="name"
                placeholder="Jana Nováková"
                value={form.name} onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" name="email"
                placeholder="tvoj@email.com"
                value={form.email} onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Heslo</label>
              <input
                type="password" name="password"
                placeholder="min. 6 znakov"
                value={form.password} onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
              />
            </div>

            {/* Typ účtu */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Typ účtu</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { role: 'client', title: 'Klientka',   desc: 'Chcem rezervovať', icon: '👤' },
                  { role: 'admin',  title: 'Salón',       desc: 'Vlastním salón',   icon: '✂️' },
                ].map((opt) => (
                  <div
                    key={opt.role}
                    onClick={() => setForm({ ...form, role: opt.role })}
                    style={{
                      flex: 1, padding: '14px 12px',
                      borderRadius: '14px',
                      border: `1.5px solid ${form.role === opt.role ? '#6A5D52' : '#E2E2DE'}`,
                      background: form.role === opt.role ? 'rgba(106,93,82,0.06)' : '#FFFFFF',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{opt.icon}</div>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C1B', marginBottom: '2px', fontFamily: 'Jost, sans-serif' }}>
                      {opt.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#979086' }}>{opt.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#8B3A3A', marginBottom: '16px', textAlign: 'center' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#B7AC9B' : '#6A5D52',
                color: '#F5F0EA', border: 'none',
                borderRadius: '12px', fontSize: '12px',
                fontWeight: 500, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', fontFamily: 'Jost, sans-serif',
              }}
            >
              {loading ? 'Vytváram účet...' : 'Zaregistrovať sa'}
            </button>

          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#979086' }}>
            Už máš účet?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: '#6A5D52', fontWeight: 500 }}>
              Prihlás sa
            </Link>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
            <span style={{ fontSize: '10px', color: '#B7AC9B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Premium Beauty
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left { display: flex !important; }
        }
      `}</style>

    </div>
  );
};

export default RegisterPage;