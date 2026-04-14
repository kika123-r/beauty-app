import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { TIER_CONFIG, TIERS } from '../../constants/tiers';
import { updateSalonTier } from '../../services/tierService';
import toast from 'react-hot-toast';

const CHECK = '✓';
const CROSS = '—';

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
  const [loading, setLoading] = useState(null);
  const currentTier = userProfile?.tier || TIERS.FREE;

  const handleUpgrade = async (tier) => {
    if (tier === currentTier) return;
    setLoading(tier);
    try {
      await updateSalonTier(salonId, tier);
      toast.success(`Prešli ste na plán ${TIER_CONFIG[tier].name}!`);
      navigate('/admin');
    } catch {
      toast.error('Chyba pri zmene plánu.');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [TIERS.FREE, TIERS.STARTER, TIERS.PRO, TIERS.BUSINESS];

  return (
    <AdminLayout>
      <div style={{ maxWidth: '900px' }}>

        <div style={{ marginBottom: '36px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
            Cenové plány
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>
            Vyberte si plán
          </h2>
          <p style={{ fontSize: '14px', color: '#979086', marginTop: '4px' }}>
            Váš aktuálny plán: <strong>{TIER_CONFIG[currentTier].name}</strong>
          </p>
        </div>

        {/* Karty plánov */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '40px' }}>
          {tiers.map((tier) => {
            const config = TIER_CONFIG[tier];
            const isCurrent = tier === currentTier;
            const isPro = tier === TIERS.PRO;

            return (
              <div key={tier} style={{
                background: '#FFFFFF',
                border: `${isPro ? '2px' : '1px'} solid ${isPro ? '#6A5D52' : '#E2E2DE'}`,
                borderRadius: '20px',
                padding: '24px 20px',
                position: 'relative',
                boxShadow: isPro ? '0 8px 32px rgba(106,93,82,0.12)' : '0 2px 12px rgba(28,28,27,0.04)',
              }}>
                {isPro && (
                  <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: '#6A5D52', color: '#F5F0EA',
                    fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em',
                    padding: '4px 14px', borderRadius: '20px', textTransform: 'uppercase',
                  }}>
                    Odporúčame
                  </div>
                )}

                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
                  {config.name}
                </p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B', marginBottom: '4px' }}>
                  {config.price === 0 ? 'Zadarmo' : `${config.price} €`}
                </p>
                {config.price > 0 && (
                  <p style={{ fontSize: '11px', color: '#979086', marginBottom: '16px' }}>/ mesiac</p>
                )}

                <div style={{ fontSize: '12px', color: '#6A5D52', marginBottom: '20px', paddingTop: '12px', borderTop: '1px solid #F5F0EA' }}>
                  <p>{config.maxBookingsPerMonth ? `${config.maxBookingsPerMonth} rezervácií/mes` : 'Neobmedzené rezervácie'}</p>
                  <p style={{ marginTop: '4px' }}>{config.maxServices ? `${config.maxServices} služieb` : 'Neobmedzené služby'}</p>
                </div>

                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrent || loading === tier}
                  style={{
                    width: '100%', padding: '11px',
                    background: isCurrent ? '#F5F0EA' : isPro ? '#6A5D52' : 'transparent',
                    color: isCurrent ? '#979086' : isPro ? '#F5F0EA' : '#6A5D52',
                    border: `1px solid ${isCurrent ? '#E2E2DE' : '#6A5D52'}`,
                    borderRadius: '10px', fontSize: '11px', fontWeight: 500,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    cursor: isCurrent ? 'default' : 'pointer',
                    fontFamily: 'Jost, sans-serif',
                  }}
                >
                  {isCurrent ? 'Aktuálny plán' : loading === tier ? 'Meniam...' : 'Vybrať plán'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Tabuľka funkcií */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '16px 24px', borderBottom: '1px solid #F5F0EA', background: '#FAFAF8' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, color: '#979086', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Funkcia</p>
            {tiers.map(t => (
              <p key={t} style={{ fontSize: '11px', fontWeight: 500, color: t === TIERS.PRO ? '#6A5D52' : '#979086', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>
                {TIER_CONFIG[t].name}
              </p>
            ))}
          </div>

          {FEATURES.map((feature, i) => (
            <div key={feature.key} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              padding: '14px 24px',
              background: i % 2 === 0 ? '#FFFFFF' : '#FAFAF8',
              borderBottom: i < FEATURES.length - 1 ? '1px solid #F5F0EA' : 'none',
            }}>
              <p style={{ fontSize: '13px', color: '#1C1C1B', fontFamily: 'Jost, sans-serif' }}>{feature.label}</p>
              {tiers.map(t => (
                <p key={t} style={{
                  textAlign: 'center', fontSize: '14px',
                  color: TIER_CONFIG[t].features[feature.key] ? '#4A7C59' : '#C4B49A',
                  fontWeight: 500,
                }}>
                  {TIER_CONFIG[t].features[feature.key] ? CHECK : CROSS}
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
