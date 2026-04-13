// src/pages/auth/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../firebase/auth';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Vyplň email a heslo.'); return; }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      toast.success('Vitaj späť');
      navigate(ROUTES.HOME);
    } catch {
      setError('Nesprávny email alebo heslo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F0EA' }}>

      {/* Ľavá strana — dekoratívna */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(to bottom, rgba(28,28,27,0.15), rgba(28,28,27,0.4)), url("https://i.pinimg.com/736x/b2/ca/85/b2ca85fb32d35db4e02584175487f894.jpg") center center / cover no-repeat',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left">

        {/* Oblúk — dekorácia */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '280px', height: '380px',
          border: '1.5px solid rgba(245,240,234,0.4)',
          borderRadius: '140px 140px 0 0',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '220px', height: '300px',
          background: 'rgba(245,240,234,0.12)',
          borderRadius: '110px 110px 0 0',
        }} />

        {/* Kruhy */}
        <div style={{
          position: 'absolute', bottom: '15%', left: '15%',
          width: '180px', height: '180px',
          borderRadius: '50%',
          border: '1px solid rgba(245,240,234,0.25)',
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '10%',
          width: '80px', height: '80px',
          borderRadius: '50%',
          background: 'rgba(245,240,234,0.15)',
        }} />

        {/* Text */}
        <div style={{
          position: 'absolute',
          bottom: '10%', left: '0', right: '0',
          textAlign: 'center',
          padding: '0 40px',
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '2.2rem',
            color: '#F5F0EA',
            fontWeight: 300,
            lineHeight: 1.3,
            marginBottom: '12px',
          }}>
            Váš čas.<br />Vaša krása.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(245,240,234,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Premium Beauty Experience
          </p>
        </div>
      </div>

      {/* Pravá strana — formulár */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: '#F5F0EA',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
              Prihlás sa do svojho účtu
            </p>
          </div>

          {/* Formulár */}
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '10px', fontWeight: 500,
                color: '#979086', marginBottom: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>Email</label>
              <input
                type="email" name="email"
                placeholder="tvoj@email.com"
                value={form.email}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '14px 18px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E2DE',
                  borderRadius: '12px',
                  fontSize: '14px', color: '#1C1C1B',
                  outline: 'none', fontFamily: 'Jost, sans-serif',
                  fontWeight: 300,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '10px', fontWeight: 500,
                color: '#979086', marginBottom: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>Heslo</label>
              <input
                type="password" name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '14px 18px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E2DE',
                  borderRadius: '12px',
                  fontSize: '14px', color: '#1C1C1B',
                  outline: 'none', fontFamily: 'Jost, sans-serif',
                  fontWeight: 300,
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
              />
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
                width: '100%',
                padding: '15px',
                background: loading ? '#B7AC9B' : '#6A5D52',
                color: '#F5F0EA',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Jost, sans-serif',
              }}
            >
              {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
            </button>

          </form>

          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#979086' }}>
            Nemáš účet?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: '#6A5D52', fontWeight: 500 }}>
              Zaregistruj sa
            </Link>
          </p>

          {/* Dekoratívna linka */}
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

export default LoginPage;