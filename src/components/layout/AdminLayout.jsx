import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { TIER_CONFIG, TIERS } from '../../constants/tiers';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard',       path: ROUTES.ADMIN_DASHBOARD },
  { label: 'Rezervácie',      path: ROUTES.ADMIN_BOOKINGS },
  { label: 'Služby',          path: ROUTES.ADMIN_SERVICES },
  { label: 'Časové sloty',    path: ROUTES.ADMIN_SLOTS },
  { label: 'Pracovníci',      path: '/admin/workers' },
  { label: 'Opakované sloty', path: '/admin/recurring' },
  { label: 'Klienti',         path: ROUTES.ADMIN_USERS },
  { label: 'Analytika',       path: ROUTES.ADMIN_ANALYTICS },
  { label: 'Cenové plány',    path: '/admin/pricing' },
  { label: 'Nastavenia',      path: '/admin/settings' },
];

const AdminLayout = ({ children }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    toast.success('Odhlásený');
    navigate(ROUTES.LOGIN);
  };

  const initials = userProfile?.name
    ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const tier = userProfile?.tier || TIERS.FREE;
  const tierConfig = TIER_CONFIG[tier];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAF8F4', fontFamily: 'Julius Sans One, sans-serif' }}>
      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar { transform: translateX(0) !important; }
          .admin-main { margin-left: 260px; }
        }
        .nav-item:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      {/* Sidebar — tmavý */}
      <aside className="admin-sidebar" style={{
        width: '260px',
        background: '#1C1C1A',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
        boxShadow: '4px 0 32px rgba(0,0,0,0.15)',
      }}>

        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#1C1C1A' }}>B</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#FAF8F4', lineHeight: 1 }}>BeautyTime</p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '3px' }}>Admin panel</p>
            </div>
          </div>

          {/* Tier badge */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '3px' }}>Váš plán</p>
              <p style={{ fontSize: '13px', color: '#C8A882' }}>{tierConfig?.name} {tierConfig?.price > 0 ? `· ${tierConfig.price} €` : '· Free'}</p>
            </div>
            {tier === TIERS.FREE && (
              <NavLink to="/admin/pricing" style={{ fontSize: '10px', color: '#C8A882', fontWeight: 400, textDecoration: 'none', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Upgrade →
              </NavLink>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <p style={{ fontSize: '9px', fontWeight: 400, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', marginBottom: '8px', paddingLeft: '12px' }}>Navigácia</p>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === ROUTES.ADMIN_DASHBOARD}
              onClick={() => setMenuOpen(false)}
              className="nav-item"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', marginBottom: '2px',
                fontSize: '12px', letterSpacing: '0.06em',
                color: isActive ? '#FAF8F4' : 'rgba(255,255,255,0.45)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                textDecoration: 'none',
                fontFamily: 'Julius Sans One, sans-serif',
                borderLeft: isActive ? '2px solid #C8A882' : '2px solid transparent',
                transition: 'all 0.15s',
              })}>
              <span>{item.label}</span>
              {item.path === '/admin/pricing' && tier === TIERS.FREE && (
                <span style={{ fontSize: '9px', background: '#C8A882', color: '#1C1C1A', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>NEW</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#C8A882', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#1C1C1A', flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '12px', color: '#FAF8F4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.name}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Julius Sans One, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.25)'; e.target.style.color = 'rgba(255,255,255,0.65)'; }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.35)'; }}>
            Odhlásiť sa
          </button>
        </div>
      </aside>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,28,26,0.5)', zIndex: 99 }} />}

      {/* Main — svetlý */}
      <div className="admin-main" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: '60px', background: '#FFFFFF', borderBottom: '1px solid rgba(28,28,26,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 98, boxShadow: '0 1px 8px rgba(28,28,26,0.04)' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px', borderRadius: '6px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '20px', height: '1.5px', background: '#1C1C1A', borderRadius: '1px' }} />)}
          </button>
          <span style={{ marginLeft: '16px', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#1C1C1A' }}>BeautyTime</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '6px', background: 'rgba(28,28,26,0.06)', color: 'rgba(28,28,26,0.5)' }}>
              {tierConfig?.name}
            </span>
          </div>
        </header>
        <main style={{ flex: 1, padding: '32px 24px', background: '#FAF8F4' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
