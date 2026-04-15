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

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Vyplň všetky polia.'); return; }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      navigate(ROUTES.HOME);
    } catch {
      setError('Nesprávny email alebo heslo.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0D2744', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FF929A', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.6rem', color: '#0D2744', fontWeight: 400 }}>B</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#E8F0F8', marginBottom: '8px', fontWeight: 400 }}>BeautyTime</h1>
          <p style={{ fontSize: '13px', color: '#7691AD' }}>Prihláste sa do svojho účtu</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#7691AD', marginBottom: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Email</label>
            <input type="email" name="email" placeholder="vas@email.com" value={form.email} onChange={handleChange}
              style={{ width: '100%', padding: '14px 18px', background: 'rgba(185,207,221,0.06)', border: '1px solid rgba(185,207,221,0.12)', borderRadius: '10px', fontSize: '14px', color: '#E8F0F8', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: '#7691AD', marginBottom: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Heslo</label>
            <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange}
              style={{ width: '100%', padding: '14px 18px', background: 'rgba(185,207,221,0.06)', border: '1px solid rgba(185,207,221,0.12)', borderRadius: '10px', fontSize: '14px', color: '#E8F0F8', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor='#FF929A'} onBlur={e => e.target.style.borderColor='rgba(185,207,221,0.12)'} />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#D4827A', marginBottom: '16px', padding: '12px 16px', background: 'rgba(212,130,122,0.08)', borderRadius: '8px', border: '1px solid rgba(212,130,122,0.2)' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#53728A' : '#FF929A', color: '#0D2744', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
            {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#7691AD' }}>
          Nemáte účet?{' '}
          <Link to={ROUTES.REGISTER} style={{ color: '#C8A1B1', fontWeight: 500 }}>Zaregistrujte sa</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
