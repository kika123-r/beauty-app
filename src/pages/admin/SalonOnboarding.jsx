// src/pages/admin/SalonOnboarding.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createSalon } from '../../services/salonService';
import { ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const SalonOnboarding = () => {
  const { firebaseUser, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({
    name:        '',
    address:     '',
    phone:       '',
    description: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.phone) {
      toast.error('Vyplň názov, adresu a telefón.');
      return;
    }
    setLoading(true);
    try {
      await createSalon(firebaseUser.uid, form);
      await refreshProfile();
      toast.success('Salón vytvorený!');
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch {
      toast.error('Chyba pri vytváraní salóna.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: '#FFFFFF',
    border: '1px solid #E2E2DE',
    borderRadius: '12px',
    fontSize: '14px', color: '#1C1C1B',
    outline: 'none', fontFamily: 'Jost, sans-serif',
    fontWeight: 300, transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '10px', fontWeight: 500,
    color: '#979086', marginBottom: '8px',
    letterSpacing: '0.12em', textTransform: 'uppercase',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F5F0EA' }}>

      {/* Ľavá strana */}
      <div style={{
        display: 'none',
        flex: 1,
        background: 'linear-gradient(to bottom, rgba(28,28,27,0.1), rgba(28,28,27,0.5)), url("https://i.pinimg.com/736x/b2/ca/85/b2ca85fb32d35db4e02584175487f894.jpg") center center / cover no-repeat',
        position: 'relative',
        overflow: 'hidden',
      }} className="login-left">
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: '280px', height: '380px',
          border: '1.5px solid rgba(245,240,234,0.3)',
          borderRadius: '140px 140px 0 0',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%', left: '0', right: '0',
          textAlign: 'center', padding: '0 40px',
        }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2.2rem', color: '#F5F0EA',
            fontWeight: 300, lineHeight: 1.3, marginBottom: '12px',
          }}>
            Váš salón.<br />Váš príbeh.
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(245,240,234,0.7)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Premium Beauty Platform
          </p>
        </div>
      </div>

      {/* Pravá strana */}
      <div style={{
        flex: 1, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #D4C5B0, #A89070)',
              margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#F5F0EA', fontWeight: 300 }}>B</span>
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: '#1C1C1B', marginBottom: '8px' }}>
              Vitaj v BeautyTime
            </h1>
            <p style={{ fontSize: '13px', color: '#979086', letterSpacing: '0.06em' }}>
              Nastav svoj salón — trvá to menej ako minútu
            </p>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '36px' }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                flex: 1, height: '3px',
                borderRadius: '2px',
                background: s <= step ? '#6A5D52' : '#E2E2DE',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          {/* Formulár */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E2DE',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 24px rgba(28,28,27,0.06)',
          }}>

            {step === 1 && (
              <>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '24px' }}>
                  Základné informácie
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Názov salóna *</label>
                  <input
                    type="text" name="name"
                    placeholder="napr. Salón Klaudia"
                    value={form.name} onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Adresa *</label>
                  <input
                    type="text" name="address"
                    placeholder="napr. Hlavná 12, Bratislava"
                    value={form.address} onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                  />
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Telefón *</label>
                  <input
                    type="tel" name="phone"
                    placeholder="+421 900 123 456"
                    value={form.phone} onChange={handleChange}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                  />
                </div>

                <button
                  onClick={() => {
                    if (!form.name || !form.address || !form.phone) {
                      toast.error('Vyplň všetky povinné polia.');
                      return;
                    }
                    setStep(2);
                  }}
                  style={{
                    width: '100%', padding: '15px',
                    background: '#6A5D52', color: '#F5F0EA',
                    border: 'none', borderRadius: '12px',
                    fontSize: '12px', fontWeight: 500,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                  }}
                >
                  Pokračovať →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '24px' }}>
                  Popis salóna
                </p>

                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Popis (nepovinné)</label>
                  <textarea
                    name="description"
                    placeholder="Krátky popis tvojho salóna — čo ponúkate, vaša filozofia..."
                    value={form.description} onChange={handleChange}
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                  />
                </div>

                {/* Súhrn */}
                <div style={{
                  background: '#F5F0EA',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                }}>
                  <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#979086', marginBottom: '10px' }}>
                    Súhrn
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1C1C1B', marginBottom: '4px', fontFamily: 'Jost, sans-serif' }}>
                    {form.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#979086', marginBottom: '2px' }}>{form.address}</p>
                  <p style={{ fontSize: '13px', color: '#979086' }}>{form.phone}</p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      padding: '15px 20px',
                      background: 'transparent', color: '#979086',
                      border: '1px solid #E2E2DE', borderRadius: '12px',
                      fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}
                  >
                    ← Späť
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '15px',
                      background: loading ? '#B7AC9B' : '#6A5D52',
                      color: '#F5F0EA', border: 'none',
                      borderRadius: '12px', fontSize: '12px',
                      fontWeight: 500, letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Jost, sans-serif',
                    }}
                  >
                    {loading ? 'Vytváram...' : 'Vytvoriť salón'}
                  </button>
                </div>
              </>
            )}

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
            <span style={{ fontSize: '10px', color: '#B7AC9B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Premium Beauty
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E2E2DE' }} />
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left { display: flex !important; }
        }
      `}</style>

    </div>
  );
};

export default SalonOnboarding;