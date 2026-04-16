import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../services/serviceService';
import { saveNotificationPreferences, getNotificationPreferences } from '../../services/notificationService';
import { getDocuments } from '../../firebase/firestore';
import { collection } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [services, setServices]   = useState([]);
  const [enabled, setEnabled]     = useState(false);
  const [selected, setSelected]   = useState([]);
  const [allServices, setAllServices] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const salons = await getDocuments(collection(db, 'salons'));
      const allServices = [];
      await Promise.all(salons.map(async salon => {
        const sv = await getServices(salon.id);
        allServices.push(...sv);
      }));
      setServices(allServices);
      const prefs = await getNotificationPreferences(firebaseUser.uid);
      if (prefs) {
        setEnabled(prefs.enabled || false);
        setAllServices(prefs.services?.includes('all') || false);
        setSelected(prefs.services?.filter(s => s !== 'all') || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleService = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setAllServices(false);
  };

  const toggleAll = () => { setAllServices(!allServices); setSelected([]); };

  const handleSave = async () => {
    if (enabled && !allServices && selected.length === 0) { toast.error('Vyber aspoň jednu službu.'); return; }
    setSaving(true);
    try {
      await saveNotificationPreferences(firebaseUser.uid, { enabled, services: allServices ? ['all'] : selected, email: firebaseUser.email });
      toast.success('Nastavenia uložené!');
    } catch { toast.error('Chyba. Skús znova.'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ value, onChange }) => (
    <div onClick={onChange} style={{ width: '52px', height: '28px', borderRadius: '14px', background: value ? '#C8A882' : 'rgba(255,244,225,0.1)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '3px', left: value ? '27px' : '3px', width: '22px', height: '22px', borderRadius: '50%', background: '#383838', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', transition: 'left 0.2s' }} />
    </div>
  );

  const cardStyle = { background: '#383838', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };

  return (
    <div style={{ minHeight: '100vh', background: '#222222' }}>
      <header style={{ background: '#383838', borderBottom: '1px solid #E2E2DE', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 12px rgba(28,28,27,0.04)' }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#C8A882' }}>BeautyTime</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}>Dashboard</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}>Marketplace</button>
        </div>
      </header>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8A882', marginBottom: '10px' }}>Nastavenia</p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#FFF4E1', marginBottom: '8px' }}>Last Minute notifikácie</h2>
          <p style={{ fontSize: '14px', color: '#C8A882' }}>Dostávaj upozornenia keď salón pridá last minute termín pre tvoje obľúbené služby.</p>
        </div>

        {loading ? <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
          <>
            <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <p style={{ fontWeight: 500, color: '#FFF4E1', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>Povoliť notifikácie</p>
                <p style={{ fontSize: '13px', color: '#C8A882' }}>Notifikácie na {firebaseUser?.email}</p>
              </div>
              <Toggle value={enabled} onChange={() => setEnabled(!enabled)} />
            </div>

            {enabled && (
              <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8A882', marginBottom: '16px' }}>Pre ktoré služby?</p>
                <div onClick={toggleAll} style={{ padding: '14px 18px', borderRadius: '12px', border: `1.5px solid ${allServices ? '#C8A882' : 'rgba(255,244,225,0.1)'}`, background: allServices ? 'rgba(106,93,82,0.06)' : '#222222', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 500, color: '#FFF4E1', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>Všetky služby</p>
                    <p style={{ fontSize: '12px', color: '#C8A882', marginTop: '2px' }}>Upozorni ma na akýkoľvek last minute termín</p>
                  </div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${allServices ? '#C8A882' : '#7A6A52'}`, background: allServices ? '#C8A882' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {allServices && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#222222' }} />}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {services.map(service => {
                    const isSel = selected.includes(service.id);
                    return (
                      <div key={service.id} onClick={() => toggleService(service.id)} style={{ padding: '14px 18px', borderRadius: '12px', border: `1.5px solid ${isSel ? '#C8A882' : 'rgba(255,244,225,0.1)'}`, background: isSel ? 'rgba(106,93,82,0.06)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontWeight: 500, color: '#FFF4E1', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>{service.name}</p>
                          <p style={{ fontSize: '12px', color: '#C8A882', marginTop: '2px' }}>{service.duration} min · {service.price} €</p>
                        </div>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${isSel ? '#C8A882' : '#7A6A52'}`, background: isSel ? '#C8A882' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSel && <span style={{ color: '#222222', fontSize: '13px', lineHeight: 1 }}>✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {enabled && (
              <div style={{ background: 'rgba(106,93,82,0.06)', border: '1px solid rgba(106,93,82,0.15)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>💌</span>
                <div>
                  <p style={{ fontSize: '13px', color: '#C8A882', fontWeight: 500, marginBottom: '4px' }}>Ako to funguje?</p>
                  <p style={{ fontSize: '12px', color: '#C8A882', lineHeight: 1.6 }}>Keď admin označí termín ako Last Minute, dostaneš notifikáciu s priamym odkazom na rezerváciu.</p>
                </div>
              </div>
            )}

            <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '15px', background: saving ? '#7A6A52' : '#C8A882', color: '#222222', border: 'none', borderRadius: '14px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Jost, sans-serif' }}>
              {saving ? 'Ukladám...' : 'Uložiť nastavenia'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
