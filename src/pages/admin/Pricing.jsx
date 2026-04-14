import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { TIER_CONFIG, TIERS } from '../../constants/tiers';
import { updateSalonTier } from '../../services/tierService';
import toast from 'react-hot-toast';

const FEATURES = [
  { key: 'emailNotifications', label: 'Emailové notifikácie' },
  { key: 'analytics',          label: 'Pokročilá analytika' },
  { key: 'ratings',            label: 'Hodnotenia klientov' },
  { key: 'repeatBookings',     label: 'Opakované rezervácie' },
  { key: 'waitingList',        label: 'Čakacia listina' },
  { key: 'aiRecommendations',  label: 'AI odporúčania' },
  { key: 'export',             label: 'Export dát' },
  { key: 'multiSalon',         label: 'Multi-salón' },
  { key: 'marketplace',        label: 'Marketplace' },
  { key: 'lastMinute',         label: 'Last-minute sloty' },
];

const PricingPage = () => {
  const { salonId, userProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(null);
  const currentTier = userProfile?.tier || TIERS.FREE;

  useEffect(() => {
    const success = searchParams.get('success');
    const plan = searchParams.get('plan');
    const sid = searchParams.get('salonId');
    if (success && plan && sid) {
      updateSalonTier(sid, plan).then(() => {
        toast.success(`Platba prebehla! Plán ${TIER_CONFIG[plan]?.name} je aktívny.`);
        navigate('/admin/pricing');
      });
    }
    if (searchParams.get('cancelled')) {
      toast.error('Platba bola zrušená.');
      navigate('/admin/pricing');
    }
  }, []);

  const handleUpgrade = async (tier) => {
    if (tier === currentTier) return;
    if (tier === TIERS.FREE) {
      await updateSalonTier(salonId, TIERS.FREE);
      toast.success('Prešli ste na Free plán.');
      return;
    }
    setLoading(tier);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: tier, salonId, email: userProfile?.email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Chyba pri platbe.');
      }
    } catch {
      toast.error('Chyba pri platbe.');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [TIERS.FREE, TIERS.STARTER, TIERS.PRO, TIERS.BUSINESS];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '900px' }}>
        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Cenové plány</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Vyberte si plán</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-faint)', marginTop: '4px' }}>
            Váš aktuálny plán: <strong>{TIER_CONFIG[currentTier].name}</strong>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '40px' }}>
          {tiers.map((tier) => {
            const config = TIER_CONFIG[tier];
            const isCurrent = tier === currentTier;
            const isPro = tier === TIERS.PRO;

            return (
              <div key={tier} style={{ background: 'var(--bg-card)', border: `${isPro ? '2px' : '1px'} solid ${isPro ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '20px', padding: '24px 20px', position: 'relative', boxShadow: isPro ? '0 8px 32px rgba(106,93,82,0.12)' : '0 2px 12px rgba(28,28,27,0.04)' }}>
                {isPro && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'var(--text)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Odporúčame
                  </div>
                )}
                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>{config.name}</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)', marginBottom: '4px' }}>
                  {config.price === 0 ? 'Zadarmo' : `${config.price} €`}
                </p>
                {config.price > 0 && <p style={{ fontSize: '11px', color: 'var(--text-faint)', marginBottom: '16px' }}>/ mesiac</p>}
                <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                  <p>{config.maxBookingsPerMonth ? `${config.maxBookingsPerMonth} rezervácií/mes` : 'Neobmedzené'}</p>
                  <p style={{ marginTop: '4px' }}>{config.maxServices ? `${config.maxServices} služieb` : 'Neobmedzené služby'}</p>
                </div>
                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrent || loading === tier}
                  style={{ width: '100%', padding: '11px', background: isCurrent ? 'var(--bg-elevated)' : isPro ? 'var(--primary)' : 'transparent', color: isCurrent ? 'var(--text-faint)' : isPro ? 'var(--bg-elevated)' : 'var(--primary)', border: `1px solid ${isCurrent ? 'var(--border)' : 'var(--primary)'}`, borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: isCurrent ? 'default' : 'pointer', fontFamily: 'Jost, sans-serif' }}
                >
                  {isCurrent ? 'Aktuálny plán' : loading === tier ? 'Presmerovávam...' : tier === TIERS.FREE ? 'Prejsť na Free' : `Vybrať ${config.name}`}
                </button>
                {!isCurrent && tier !== TIERS.FREE && (
                  <p style={{ fontSize: '10px', color: 'var(--text-faint)', textAlign: 'center', marginTop: '8px' }}>
                    Apple Pay · Google Pay · Karta
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Funkcia</p>
            {tiers.map(t => (
              <p key={t} style={{ fontSize: '11px', fontWeight: 500, color: t === TIERS.PRO ? 'var(--primary)' : 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
                {TIER_CONFIG[t].name}
              </p>
            ))}
          </div>
          {FEATURES.map((feature, i) => (
            <div key={feature.key} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '14px 24px', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-elevated)', borderBottom: i < FEATURES.length - 1 ? '1px solid #F5F0EA' : 'none' }}>
              <p style={{ fontSize: '13px', color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{feature.label}</p>
              {tiers.map(t => (
                <p key={t} style={{ textAlign: 'center', fontSize: '14px', color: TIER_CONFIG[t].features[feature.key] ? '#4A7C59' : '#C4B49A', fontWeight: 500 }}>
                  {TIER_CONFIG[t].features[feature.key] ? '✓' : '—'}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PricingPage;
