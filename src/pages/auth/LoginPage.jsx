import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../firebase/auth';
import { ROUTES } from '../../constants';

const C = { bg: '#2D2D2D', card: '#383838', milk: '#FFF4E1', muted: '#C8B89A', faint: '#7A6A52', accent: '#C8A882', border: 'rgba(255,244,225,0.1)' };

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Vyplň všetky polia.'); return; }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
      navigate(ROUTES.HOME);
    } catch { setError('Nesprávny email alebo heslo.'); }
    finally { setLoading(false); }
  };

  const inp = { width: '100%', padding: '14px 18px', background: 'rgba(255,244,225,0.06)', border: `1px solid ${C.border}`, borderRadius: '6px', fontSize: '14px', color: C.milk, outline: 'none', fontFamily: 'Raleway, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.2s' };
  const lbl = { display: 'block', fontSize: '11px', fontWeight: 600, color: C.faint, marginBottom: '8px', letterSpacing: '0.15em', textTransform: 'uppercase' };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Raleway, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: C.milk, fontWeight: 300, marginBottom: '8px' }}>BeautyTime</div>
          <p style={{ fontSize: '13px', color: C.faint, letterSpacing: '0.05em' }}>Prihláste sa do svojho účtu</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={lbl}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="vas@email.com" style={inp}
              onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.border} />
          </div>
          <div style={{ marginBottom: '28px' }}>
            <label style={lbl}>Heslo</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" style={inp}
              onFocus={e => e.target.style.borderColor=C.accent} onBlur={e => e.target.style.borderColor=C.border} />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#C87070', marginBottom: '16px', padding: '12px 16px', background: 'rgba(200,112,112,0.08)', borderRadius: '6px', border: '1px solid rgba(200,112,112,0.2)' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? C.faint : C.accent, color: C.bg, border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Raleway, sans-serif' }}>
            {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: `1px solid ${C.border}`, textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: C.faint }}>
            Nemáte účet?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: C.accent, fontWeight: 500 }}>Zaregistrujte sa</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
