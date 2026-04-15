import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { TIER_CONFIG, TIERS } from '../../constants/tiers';
import toast from 'react-hot-toast';

const C = { green: '#6D6943', brown: '#48372F', cream: '#F4F3EE', pink: '#C8A1B1', muted: '#9B8E7E', border: '#E8E4DC', white: '#142F52', sidebar: '#2C2218' };

const NAV_ITEMS = [
  { label: 'Dashboard',        path: ROUTES.ADMIN_DASHBOARD },
  { label: 'Rezervácie',       path: ROUTES.ADMIN_BOOKINGS },
  { label: 'Služby',           path: ROUTES.ADMIN_SERVICES },
  { label: 'Časové sloty',     path: ROUTES.ADMIN_SLOTS },
  { label: 'Pracovníci',       path: '/admin/workers' },
  { label: 'Opakované sloty',  path: '/admin/recurring' },
  { label: 'Klienti',          path: ROUTES.ADMIN_USERS },
  { label: 'Analytika',        path: ROUTES.ADMIN_ANALYTICS },
  { label: 'Cenové plány',     path: '/admin/pricing' },
  { label: 'Nastavenia',       path: '/admin/settings' },
];

const TIER_BADGE = {
  free:     { bg: 'rgba(155,142,126,0.15)', color: C.muted },
  starter:  { bg: 'rgba(109,105,67,0.2)',   color: '#A8A56A' },
  pro:      { bg: 'rgba(200,161,177,0.2)',  color: C.pink },
  business: { bg: 'rgba(244,243,238,0.1)',  color: C.cream },
};

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
  const tierBadge = TIER_BADGE[tier] || TIER_BADGE.free;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.cream, fontFamily: 'Jost, sans-serif' }}>
      <style>{`
        * { box-sizing: border-box; }
        @media (min-width: 768px) {
          .admin-sidebar { transform: translateX(0) !important; }
          .admin-main { margin-left: 260px; }
        }
        .nav-link-item { transition: all 0.15s; }
        .nav-link-item:hover { background: rgba(244,243,238,0.08) !important; }
      `}</style>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: '260px', background: C.sidebar, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s ease', boxShadow: '4px 0 32px rgba(0,0,0,0.15)' }}>

        {/* Logo */}
        <div style={{ padding: '28px 24px', borderBottom: '1px solid rgba(244,243,238,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: C.cream }}>B</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: C.cream, lineHeight: 1 }}>BeautyTime</p>
              <p style={{ fontSize: '9px', color: 'rgba(244,243,238,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: '3px' }}>Admin panel</p>
            </div>
          </div>

          {/* Tier badge */}
          <div style={{ background: tierBadge.bg, borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(244,243,238,0.3)', marginBottom: '3px' }}>Váš plán</p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: tierBadge.color }}>{tierConfig.name} {tierConfig.price > 0 ? `· ${tierConfig.price} €` : '· Free'}</p>
            </div>
            {tier === TIERS.FREE && (
              <NavLink to="/admin/pricing" style={{ fontSize: '10px', color: C.pink, fontWeight: 500, textDecoration: 'none', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                Upgrade →
              </NavLink>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <p style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(244,243,238,0.25)', marginBottom: '8px', paddingLeft: '12px' }}>Navigácia</p>
          {NAV_ITEMS.map(item => (
            <NavLink key={item.path} to={item.path} end={item.path === ROUTES.ADMIN_DASHBOARD} onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '10px', marginBottom: '2px',
                fontSize: '13px', fontWeight: isActive ? 500 : 400,
                color: isActive ? C.cream : 'rgba(244,243,238,0.5)',
                background: isActive ? 'rgba(244,243,238,0.1)' : 'transparent',
                textDecoration: 'none', letterSpacing: '0.02em', fontFamily: 'Jost, sans-serif',
                borderLeft: isActive ? `2px solid ${C.green}` : '2px solid transparent',
              })}>
              <span>{item.label}</span>
              {item.path === '/admin/pricing' && tier === TIERS.FREE && (
                <span style={{ fontSize: '9px', background: C.pink, color: C.white, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>NEW</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(244,243,238,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: C.cream, flexShrink: 0 }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: C.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.name}</p>
              <p style={{ fontSize: '11px', color: 'rgba(244,243,238,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userProfile?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(244,243,238,0.1)', borderRadius: '8px', fontSize: '11px', fontWeight: 500, color: 'rgba(244,243,238,0.35)', cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Jost, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.target.style.borderColor='rgba(244,243,238,0.25)'; e.target.style.color='rgba(244,243,238,0.6)'; }}
            onMouseLeave={e => { e.target.style.borderColor='rgba(244,243,238,0.1)'; e.target.style.color='rgba(244,243,238,0.35)'; }}>
            Odhlásiť sa
          </button>
        </div>
      </aside>

      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,34,24,0.6)', zIndex: 99 }} />}

      {/* Main */}
      <div className="admin-main" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ height: '60px', background: C.white, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 98, boxShadow: '0 1px 8px rgba(72,55,47,0.04)' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[0,1,2].map(i => <div key={i} style={{ width: '20px', height: '2px', background: C.brown, borderRadius: '1px' }} />)}
          </button>
          <span style={{ marginLeft: '16px', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: C.brown }}>BeautyTime</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '6px', background: tierBadge.bg, color: tierBadge.color || C.muted }}>
              {tierConfig.name}
            </span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
