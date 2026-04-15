import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loginUser } from '../firebase/auth';
import { getSalonBySlug } from '../services/salonService';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';

const C = { green: '#6DB88A', brown: '#0D2744', cream: '#0D2744', pink: '#FF929A', muted: '#7691AD', border: 'rgba(185,207,221,0.12)' };

const SalonLogin = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, isAdmin } = useAuth();
  const [salon, setSalon]   = useState(null);
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSalonBySlug(slug).then(s => { if (!s) navigate('/'); else setSalon(s); });
  }, [slug]);

  useEffect(() => {
    if (firebaseUser) {
      if (isAdmin) navigate(ROUTES.ADMIN_DASHBOARD);
      else navigate(`/s/${slug}/dashboard`);
    }
  }, [firebaseUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Vyplň všetky polia.'); return; }
    setLoading(true);
    try {
      await loginUser(form.email, form.password);
    } catch { setError('Nesprávny email alebo heslo.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', fontFamily: 'Jost, sans-serif' }}>
      <style>{`* { box-sizing: border-box; } @media (max-width: 768px) { .login-panel { display: none !important; } .login-form-side { padding: 40px 24px !important; } }`}</style>

      {/* Ľavý panel */}
      <div className="login-panel" style={{ width: '45%', background: C.brown, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', border: `1px solid rgba(244,243,238,0.06)` }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', border: `1px solid rgba(244,243,238,0.06)` }} />
        <div>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244,243,238,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: C.cream }}>{salon?.name?.charAt(0) || 'B'}</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.8rem', color: C.cream, fontWeight: 400, lineHeight: 1.2, marginBottom: '16px' }}>{salon?.name || 'Salón'}</h1>
          {salon?.category && <p style={{ fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.pink, marginBottom: '24px' }}>{salon.category}</p>}
          {salon?.description && <p style={{ fontSize: '14px', color: 'rgba(244,243,238,0.5)', lineHeight: 1.8, maxWidth: '320px' }}>{salon.description}</p>}
        </div>
        <div>
          <div style={{ width: '40px', height: '1px', background: 'rgba(244,243,238,0.2)', marginBottom: '20px' }} />
          <p style={{ fontSize: '12px', color: 'rgba(244,243,238,0.3)', letterSpacing: '0.1em' }}>Powered by BeautyTime</p>
        </div>
      </div>

      {/* Pravá strana — formulár */}
      <div className="login-form-side" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 56px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: C.green, marginBottom: '12px' }}>Vitajte späť</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: C.brown, fontWeight: 400, marginBottom: '8px' }}>Prihláste sa</h2>
          <p style={{ fontSize: '13px', color: C.muted, marginBottom: '40px' }}>Pokračujte do vášho účtu</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: C.muted, marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="vas@email.com"
                style={{ width: '100%', padding: '14px 18px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', color: C.brown, outline: 'none', fontFamily: 'Jost, sans-serif', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor=C.brown} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: C.muted, marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Heslo</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••"
                style={{ width: '100%', padding: '14px 18px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', color: C.brown, outline: 'none', fontFamily: 'Jost, sans-serif', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor=C.brown} onBlur={e => e.target.style.borderColor=C.border} />
            </div>
            {error && <p style={{ fontSize: '13px', color: '#A05050', marginBottom: '16px', padding: '12px 16px', background: 'rgba(160,80,80,0.06)', borderRadius: '8px', border: '1px solid rgba(160,80,80,0.15)' }}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '15px', background: loading ? C.muted : C.brown, color: C.cream, border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif', transition: 'opacity 0.2s' }}>
              {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: C.muted, textAlign: 'center' }}>
              Nemáte účet?{' '}
              <span onClick={() => navigate(`/s/${slug}/register`)} style={{ color: C.brown, fontWeight: 500, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Zaregistrujte sa</span>
            </p>
            <p style={{ fontSize: '12px', textAlign: 'center' }}>
              <span onClick={() => navigate(`/s/${slug}`)} style={{ color: C.muted, cursor: 'pointer' }}>← Späť na stránku salóna</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonLogin;
