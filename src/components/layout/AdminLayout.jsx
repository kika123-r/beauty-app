// src/components/layout/AdminLayout.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutUser } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import { TIER_CONFIG, TIERS } from '../../constants/tiers';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard',     path: ROUTES.ADMIN_DASHBOARD },
  { label: 'Rezervácie',    path: ROUTES.ADMIN_BOOKINGS },
  { label: 'Služby',        path: ROUTES.ADMIN_SERVICES },
  { label: 'Časové sloty',  path: ROUTES.ADMIN_SLOTS },
  { label: 'Klienti',       path: ROUTES.ADMIN_USERS },
  { label: 'Analytika',     path: ROUTES.ADMIN_ANALYTICS },
  { label: 'Cenové plány',  path: '/admin/pricing' },
  { label: 'Nastavenia',     path: '/admin/settings' },
];

const TIER_COLORS = {
  free:     { bg: '#F5F0EA', color: '#979086' },
  starter:  { bg: '#E8F4ED', color: '#4A7C59' },
  pro:      { bg: '#EDE8F5', color: '#6A5D9B' },
  business: { bg: '#1C1C1B', color: '#D4C5B0' },
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
    ? userProfile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const tier = userProfile?.tier || TIERS.FREE;
  const tierConfig = TIER_CONFIG[tier];
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.free;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F0EA' }}>

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          width: '260px',
          background: '#FFFFFF',
          borderRight: '1px solid #E2E2DE',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 100,
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: '4px 0 24px rgba(28,28,27,0.06)',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '32px 28px 24px', borderBottom: '1px solid #F5F0EA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4C5B0, #A89070)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#F5F0EA', fontWeight: 300 }}>B</span>
            </div>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#1C1C1B', lineHeight: 1 }}>BeautyTime</p>
              <p style={{ fontSize: '10px', color: '#979086', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>Admin panel</p>
            </div>
          </div>

          {/* Tier badge */}
          <div style={{
            marginTop: '16px', padding: '8px 12px',
            background: tierStyle.bg, borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: tierStyle.color, fontWeight: 500 }}>Váš plán</p>
              <p style={{ fontSize: '13px', fontWeight: 500, color: tierStyle.color, fontFamily: 'Jost, sans-serif', marginTop: '2px' }}>
                {tierConfig.name} {tierConfig.price > 0 ? `· ${tierConfig.price} €/mes` : '· Zadarmo'}
              </p>
            </div>
            {tier === TIERS.FREE && (
              <NavLink to="/admin/pricing" style={{ fontSize: '10px', color: '#6A5D52', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.05em' }}>
                Upgrade →
              </NavLink>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '20px 16px', overflowY: 'auto' }}>
          <p style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#B7AC9B', marginBottom: '12px', paddingLeft: '12px' }}>
            Navigácia
          </p>
          {NAV_ITEMS.map((item) => {
            const isPricing = item.path === '/admin/pricing';
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === ROUTES.ADMIN_DASHBOARD}
                onClick={() => setMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: '12px', marginBottom: '4px',
                  fontSize: '13px', fontWeight: isActive ? 500 : 400,
                  color: isActive ? '#1C1C1B' : isPricing ? '#6A5D52' : '#979086',
                  background: isActive ? '#F5F0EA' : 'transparent',
                  textDecoration: 'none', transition: 'all 0.15s',
                  letterSpacing: '0.02em', fontFamily: 'Jost, sans-serif',
                  borderLeft: isActive ? '2px solid #6A5D52' : '2px solid transparent',
                })}
              >
                <span>{item.label}</span>
                {isPricing && tier === TIERS.FREE && (
                  <span style={{ fontSize: '9px', background: '#6A5D52', color: '#F5F0EA', padding: '2px 6px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                    NEW
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #F5F0EA' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4C5B0, #B7AC9B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 600, color: '#F5F0EA',
              flexShrink: 0, fontFamily: 'Jost, sans-serif',
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#1C1C1B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Jost, sans-serif' }}>
                {userProfile?.name}
              </p>
              <p style={{ fontSize: '11px', color: '#979086', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px', background: 'transparent',
              border: '1px solid #E2E2DE', borderRadius: '10px',
              fontSize: '11px', fontWeight: 500, color: '#979086',
              cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'Jost, sans-serif', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.background = '#F5F0EA'; e.target.style.color = '#1C1C1B'; }}
            onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#979086'; }}
          >
            Odhlásiť sa
          </button>
        </div>
      </aside>

      {menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(28,28,27,0.4)', zIndex: 99 }} />
      )}

      {/* Main */}
      <div className="admin-main" style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          height: '64px', background: '#FFFFFF', borderBottom: '1px solid #E2E2DE',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 98,
          boxShadow: '0 1px 12px rgba(28,28,27,0.04)',
        }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: '#6A5D52', cursor: 'pointer', fontSize: '18px', padding: '4px 8px', borderRadius: '8px', transition: 'background 0.15s' }}
            onMouseEnter={(e) => e.target.style.background = '#F5F0EA'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            ☰
          </button>
          <span style={{ marginLeft: '16px', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: '#6A5D52' }}>BeautyTime</span>

          {/* Tier v headeri */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '8px',
              background: tierStyle.bg, color: tierStyle.color,
            }}>
              {tierConfig.name}
            </span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 24px' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar { transform: translateX(0) !important; }
          .admin-main { margin-left: 260px; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
