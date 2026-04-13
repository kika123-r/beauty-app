// src/pages/client/Notifications.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getServices } from '../../services/serviceService';
import { saveNotificationPreferences, getNotificationPreferences } from '../../services/notificationService';
import { logoutUser } from '../../firebase/auth';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const SALON_ID = 'FBSMRSSCSSRZYNcufjCQWpLx0Od2';

const Notifications = () => {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();
  const [services, setServices]     = useState([]);
  const [enabled, setEnabled]       = useState(false);
  const [selected, setSelected]     = useState([]);
  const [allServices, setAllServices] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [servicesData, prefs] = await Promise.all([
        getServices(SALON_ID),
        getNotificationPreferences(firebaseUser.uid),
      ]);
      setServices(servicesData);
      if (prefs) {
        setEnabled(prefs.enabled || false);
        setAllServices(prefs.services?.includes('all') || false);
        setSelected(prefs.services?.filter((s) => s !== 'all') || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = (serviceId) => {
    if (selected.includes(serviceId)) {
      setSelected(selected.filter((s) => s !== serviceId));
    } else {
      setSelected([...selected, serviceId]);
    }
    setAllServices(false);
  };

  const toggleAll = () => {
    if (allServices) {
      setAllServices(false);
      setSelected([]);
    } else {
      setAllServices(true);
      setSelected([]);
    }
  };

  const handleSave = async () => {
    if (enabled && !allServices && selected.length === 0) {
      toast.error('Vyber aspoň jednu službu.');
      return;
    }
    setSaving(true);
    try {
      await saveNotificationPreferences(firebaseUser.uid, {
        enabled,
        services: allServices ? ['all'] : selected,
        email: firebaseUser.email,
      });
      toast.success('Nastavenia uložené!');
    } catch {
      toast.error('Chyba. Skús znova.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F5F0EA' }}>

      {/* Header */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E2DE',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0, zIndex: 100,
        boxShadow: '0 1px 12px rgba(28,28,27,0.04)',
      }}>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#6A5D52' }}>
          BeautyTime
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.CLIENT_DASHBOARD)}>
            Dashboard
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/marketplace')}>
            Marketplace
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Nadpis */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{
            fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#979086', marginBottom: '10px',
          }}>
            Nastavenia
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', marginBottom: '8px' }}>
            Last Minute notifikácie
          </h2>
          <p style={{ fontSize: '14px', color: '#979086' }}>
            Dostávaj upozornenia keď salón pridá last minute termín pre tvoje obľúbené služby.
          </p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}

        {!loading && (
          <>
            {/* Hlavný prepínač */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E2DE',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <p style={{ fontWeight: 500, color: '#1C1C1B', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>
                  Povoliť notifikácie
                </p>
                <p style={{ fontSize: '13px', color: '#979086' }}>
                  Notifikácie budú zasielané na {firebaseUser?.email}
                </p>
              </div>
              <div
                onClick={() => setEnabled(!enabled)}
                style={{
                  width: '52px', height: '28px',
                  borderRadius: '14px',
                  background: enabled ? '#6A5D52' : '#E2E2DE',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: enabled ? '27px' : '3px',
                  width: '22px', height: '22px',
                  borderRadius: '50%',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                  transition: 'left 0.2s',
                }} />
              </div>
            </div>

            {/* Výber služieb */}
            {enabled && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E2DE',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
              }}>
                <p style={{
                  fontSize: '10px', fontWeight: 500,
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: '#979086', marginBottom: '16px',
                }}>
                  Pre ktoré služby?
                </p>

                {/* Všetky služby */}
                <div
                  onClick={toggleAll}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: `1.5px solid ${allServices ? '#6A5D52' : '#E2E2DE'}`,
                    background: allServices ? 'rgba(106,93,82,0.06)' : '#F5F0EA',
                    cursor: 'pointer',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>
                      Všetky služby
                    </p>
                    <p style={{ fontSize: '12px', color: '#979086', marginTop: '2px' }}>
                      Upozorni ma na akýkoľvek last minute termín
                    </p>
                  </div>
                  <div style={{
                    width: '22px', height: '22px',
                    borderRadius: '50%',
                    border: `2px solid ${allServices ? '#6A5D52' : '#D4C5B0'}`,
                    background: allServices ? '#6A5D52' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}>
                    {allServices && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F5F0EA' }} />
                    )}
                  </div>
                </div>

                {/* Individuálne služby */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {services.map((service) => {
                    const isSelected = selected.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          border: `1.5px solid ${isSelected ? '#6A5D52' : '#E2E2DE'}`,
                          background: isSelected ? 'rgba(106,93,82,0.06)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>
                            {service.name}
                          </p>
                          <p style={{ fontSize: '12px', color: '#979086', marginTop: '2px' }}>
                            {service.duration} min · {service.price} €
                          </p>
                        </div>
                        <div style={{
                          width: '22px', height: '22px',
                          borderRadius: '6px',
                          border: `2px solid ${isSelected ? '#6A5D52' : '#D4C5B0'}`,
                          background: isSelected ? '#6A5D52' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s',
                        }}>
                          {isSelected && (
                            <span style={{ color: '#F5F0EA', fontSize: '13px', lineHeight: 1 }}>✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* Info karta */}
            {enabled && (
              <div style={{
                background: 'rgba(106,93,82,0.06)',
                border: '1px solid rgba(106,93,82,0.15)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>💌</span>
                <div>
                  <p style={{ fontSize: '13px', color: '#6A5D52', fontWeight: 500, marginBottom: '4px' }}>
                    Ako to funguje?
                  </p>
                  <p style={{ fontSize: '12px', color: '#979086', lineHeight: 1.6 }}>
                    Keď admin označí termín ako Last Minute, dostaneš email notifikáciu na {firebaseUser?.email} s priamym odkazom na rezerváciu.
                  </p>
                </div>
              </div>
            )}

            {/* Uložiť */}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                width: '100%',
                padding: '15px',
                background: saving ? '#B7AC9B' : '#6A5D52',
                color: '#F5F0EA',
                border: 'none',
                borderRadius: '14px',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Jost, sans-serif',
              }}
            >
              {saving ? 'Ukladám...' : 'Uložiť nastavenia'}
            </button>

          </>
        )}

      </div>
    </div>
  );
};

export default Notifications;