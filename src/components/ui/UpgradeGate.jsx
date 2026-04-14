import { useNavigate } from 'react-router-dom';
import { TIER_CONFIG } from '../../constants/tiers';

const UpgradeGate = ({ feature, requiredTier, currentTier, children, inline = false }) => {
  const navigate = useNavigate();
  const required = TIER_CONFIG[requiredTier];

  if (inline) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ opacity: 0.4, pointerEvents: 'none', userSelect: 'none' }}>{children}</div>
        <div
          onClick={() => navigate('/admin/pricing')}
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '8px', background: 'rgba(245,240,234,0.85)' }}
        >
          <span style={{ fontSize: '10px', fontWeight: 500, color: '#6A5D52', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#F5F0EA', border: '1px solid #D4C5B0', borderRadius: '8px', padding: '4px 10px' }}>
            {required?.name}+
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '40px 32px', textAlign: 'center', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '22px' }}>🔒</span>
      </div>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#1C1C1B', marginBottom: '8px' }}>
        {feature}
      </h3>
      <p style={{ fontSize: '13px', color: '#979086', marginBottom: '8px', lineHeight: 1.6 }}>
        Táto funkcia je dostupná od plánu
      </p>
      <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 500, color: '#6A5D52', background: 'rgba(106,93,82,0.1)', padding: '4px 14px', borderRadius: '20px', marginBottom: '24px', letterSpacing: '0.08em' }}>
        {required?.name} · {required?.price} € / mes
      </span>
      <div>
        <button
          onClick={() => navigate('/admin/pricing')}
          style={{ padding: '12px 28px', background: '#1C1C1B', color: '#F5F0EA', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
        >
          Upgradovať plán →
        </button>
      </div>
    </div>
  );
};

export default UpgradeGate;
