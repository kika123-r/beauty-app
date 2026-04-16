import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await registerUser({ name: form.name, email: form.email, password: form.password, role: 'client' });
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#E4E0CC' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#E4E0CC', fontWeight: 300 }}>B</span>
            </div>
            <h1 style={{ fontSize: '1.8rem', color: '#2A1A10', marginBottom: '6px', fontFamily: 'Cormorant Garamond, serif' }}>BeautyTime</h1>
            <p style={{ fontSize: '13px', color: '#845F4A' }}>Vytvor si nový účet</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#845F4A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Meno a priezvisko</label>
              <input type="text" name="name" placeholder="Jana Nováková" value={form.name} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#FAFAF5', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '14px', color: '#2A1A10', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#DFA0AA'} onBlur={(e) => e.target.style.borderColor = 'rgba(90,60,40,0.18)'} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#845F4A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Email</label>
              <input type="email" name="email" placeholder="tvoj@email.com" value={form.email} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#FAFAF5', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '14px', color: '#2A1A10', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#DFA0AA'} onBlur={(e) => e.target.style.borderColor = 'rgba(90,60,40,0.18)'} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#845F4A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Heslo</label>
              <input type="password" name="password" placeholder="min. 6 znakov" value={form.password} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#FAFAF5', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '14px', color: '#2A1A10', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#DFA0AA'} onBlur={(e) => e.target.style.borderColor = 'rgba(90,60,40,0.18)'} />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#DFA0AA', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#8A7260' : '#DFA0AA', color: '#E4E0CC', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
              {loading ? 'Vytváram účet...' : 'Zaregistrovať sa'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#845F4A' }}>
            Už máš účet?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: '#DFA0AA', fontWeight: 500 }}>Prihlás sa</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
