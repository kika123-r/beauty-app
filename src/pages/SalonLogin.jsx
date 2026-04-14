import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loginUser } from '../firebase/auth';
import { getSalonBySlug } from '../services/salonService';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import toast from 'react-hot-toast';

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
    } catch (err) {
      setError('Nesprávny email alebo heslo.');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '14px 18px', background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '12px', fontSize: '14px', color: '#1C1C1B', outline: 'none', fontFamily: 'Jost, sans-serif', fontWeight: 300, boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 500, color: '#979086', marginBottom: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0EA', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0EA', fontWeight: 300 }}>{salon?.name?.charAt(0) || 'B'}</span>
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#1C1C1B', marginBottom: '4px' }}>{salon?.name || 'Salón'}</h1>
          <p style={{ fontSize: '13px', color: '#979086' }}>Prihláste sa do svojho účtu</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="vas@email.com" style={inputStyle} onFocus={e => e.target.style.borderColor='#6A5D52'} onBlur={e => e.target.style.borderColor='#E2E2DE'} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Heslo</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="min. 6 znakov" style={inputStyle} onFocus={e => e.target.style.borderColor='#6A5D52'} onBlur={e => e.target.style.borderColor='#E2E2DE'} />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#8B3A3A', marginBottom: '16px', textAlign: 'center' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#B7AC9B' : '#6A5D52', color: '#F5F0EA', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
            {loading ? 'Prihlasujem...' : 'Prihlásiť sa'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#979086' }}>
          Nemáte účet?{' '}
          <span onClick={() => navigate(`/s/${slug}/register`)} style={{ color: '#6A5D52', fontWeight: 500, cursor: 'pointer' }}>Zaregistrujte sa</span>
        </p>
        <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px' }}>
          <span onClick={() => navigate(`/s/${slug}`)} style={{ color: '#B7AC9B', cursor: 'pointer' }}>← Späť na stránku salóna</span>
        </p>
      </div>
    </div>
  );
};

export default SalonLogin;
