import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../firebase/auth';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
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
    if (form.password !== form.confirmPassword) { setError('Heslá sa nezhodujú.'); return; }
    setLoading(true);
    try {
      await registerUser({ name: form.name, email: form.email, password: form.password, role: 'admin' });
      toast.success('Admin účet vytvorený!');
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8F0F8', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#0A1F36', fontWeight: 300 }}>B</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#0A1F36', marginBottom: '6px', fontFamily: 'Cormorant Garamond, serif' }}>BeautyTime</h1>
          <p style={{ fontSize: '11px', color: '#7691AD', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}>Salón — Prémiový prístup</p>
        </div>
        <div style={{ background: '#262624', border: '1px solid #3A3A38', borderRadius: '24px', padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#FF929A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Meno a priezvisko</label>
              <input type="text" name="name" placeholder="Jana Nováková" value={form.name} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#E8F0F8', border: '1px solid #3A3A38', borderRadius: '12px', fontSize: '14px', color: '#0A1F36', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#7691AD'} onBlur={(e) => e.target.style.borderColor = '#3A3A38'} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#FF929A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Email</label>
              <input type="email" name="email" placeholder="tvoj@email.com" value={form.email} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#E8F0F8', border: '1px solid #3A3A38', borderRadius: '12px', fontSize: '14px', color: '#0A1F36', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#7691AD'} onBlur={(e) => e.target.style.borderColor = '#3A3A38'} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#FF929A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Heslo</label>
              <input type="password" name="password" placeholder="min. 6 znakov" value={form.password} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#E8F0F8', border: '1px solid #3A3A38', borderRadius: '12px', fontSize: '14px', color: '#0A1F36', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#7691AD'} onBlur={(e) => e.target.style.borderColor = '#3A3A38'} />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#FF929A', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Potvrď heslo</label>
              <input type="password" name="confirmPassword" placeholder="zopakuj heslo" value={form.confirmPassword} onChange={handleChange}
                style={{ width: '100%', padding: '14px 18px', background: '#E8F0F8', border: '1px solid #3A3A38', borderRadius: '12px', fontSize: '14px', color: '#0A1F36', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
                onFocus={(e) => e.target.style.borderColor = '#7691AD'} onBlur={(e) => e.target.style.borderColor = '#3A3A38'} />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#FF929A', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#3A3A38' : 'linear-gradient(135deg, #D4C5B0, #A89070)', color: '#E8F0F8', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
              {loading ? 'Vytváram účet...' : 'Vytvoriť salón účet'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#FF929A' }}>
          Už máš účet?{' '}
          <Link to={ROUTES.LOGIN} style={{ color: '#7691AD', fontWeight: 500 }}>Prihlás sa</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
