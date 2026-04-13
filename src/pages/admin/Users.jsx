// src/pages/admin/Users.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getBookingsForSalon } from '../../services/bookingService';
import { getDocuments, updateDocument, usersCol } from '../../firebase/firestore';
import { BOOKING_STATUS, RELIABILITY } from '../../constants';
import toast from 'react-hot-toast';

const Users = () => {
  const { salonId } = useAuth();
  const [users, setUsers]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersData, bookingsData] = await Promise.all([
        getDocuments(usersCol()),
        getBookingsForSalon(salonId),
      ]);
      setUsers(usersData.filter((u) => u.role === 'client'));
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = (uid) => bookings.filter((b) => b.clientId === uid);
  const getNoShows      = (uid) => bookings.filter((b) => b.clientId === uid && b.status === BOOKING_STATUS.NO_SHOW).length;

  const getScoreColor = (score) => {
    if (score >= RELIABILITY.WARNING_THRESHOLD) return '#4A7C59';
    if (score >= RELIABILITY.BLOCK_THRESHOLD)   return '#B07D3A';
    return '#8B3A3A';
  };

  const getScoreBg = (score) => {
    if (score >= RELIABILITY.WARNING_THRESHOLD) return 'rgba(74,124,89,0.1)';
    if (score >= RELIABILITY.BLOCK_THRESHOLD)   return 'rgba(176,125,58,0.1)';
    return 'rgba(139,58,58,0.1)';
  };

  const handleBlock = async (user) => {
    const action = user.blocked ? 'odblokovať' : 'zablokovať';
    if (!window.confirm(`Chceš ${action} tohto klienta?`)) return;
    try {
      await updateDocument(usersCol(), user.uid, { blocked: !user.blocked });
      toast.success(user.blocked ? 'Klient odblokovaný.' : 'Klient zablokovaný.');
      loadData();
    } catch {
      toast.error('Chyba. Skús znova.');
    }
  };

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E2DE',
    borderRadius: '20px',
    padding: '22px 24px',
    boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px' }}>

        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
            Správa
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>
            Klienti
          </h2>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>
              Zatiaľ žiadni klienti
            </p>
            <p style={{ fontSize: '13px', color: '#979086' }}>
              Klienti sa zobrazia po prvej rezervácii.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((user) => {
            const userBookings = getUserBookings(user.uid);
            const noShows      = getNoShows(user.uid);
            const score        = user.reliabilityScore ?? 100;

            return (
              <div key={user.uid} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>

                    {/* Avatar */}
                    <div style={{
                      width: '44px', height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #D4C5B0, #B7AC9B)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '15px', fontWeight: 600, color: '#F5F0EA',
                      flexShrink: 0, fontFamily: 'Jost, sans-serif',
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                      {/* Meno */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>
                          {user.name}
                        </p>
                        {user.blocked && (
                          <span style={{
                            fontSize: '10px', color: '#8B3A3A',
                            background: 'rgba(139,58,58,0.1)',
                            padding: '2px 8px', borderRadius: '20px',
                            fontWeight: 500, letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}>
                            Blokovaný
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#979086', marginBottom: '12px' }}>
                        {user.email}
                      </p>

                      {/* Štatistiky */}
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Rezervácie', value: userBookings.length, color: '#6A5D52' },
                          { label: 'No-show',    value: noShows,             color: noShows > 0 ? '#8B3A3A' : '#979086' },
                        ].map((stat) => (
                          <div key={stat.label} style={{
                            padding: '8px 14px',
                            background: '#F5F0EA',
                            borderRadius: '10px',
                          }}>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: stat.color, fontFamily: 'Cormorant Garamond, serif', marginBottom: '2px' }}>
                              {stat.value}
                            </p>
                            <p style={{ fontSize: '10px', color: '#979086', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {stat.label}
                            </p>
                          </div>
                        ))}
                        <div style={{
                          padding: '8px 14px',
                          background: getScoreBg(score),
                          borderRadius: '10px',
                        }}>
                          <p style={{ fontSize: '16px', fontWeight: 600, color: getScoreColor(score), fontFamily: 'Cormorant Garamond, serif', marginBottom: '2px' }}>
                            {score}%
                          </p>
                          <p style={{ fontSize: '10px', color: '#979086', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Spoľahlivosť
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Akcie */}
                  <button
                    onClick={() => handleBlock(user)}
                    style={{
                      padding: '8px 16px',
                      background: 'transparent',
                      color: user.blocked ? '#6A5D52' : '#8B3A3A',
                      border: `1px solid ${user.blocked ? '#E2E2DE' : '#8B3A3A'}`,
                      borderRadius: '10px',
                      fontSize: '11px', fontWeight: 500,
                      cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      flexShrink: 0, marginLeft: '16px',
                    }}
                  >
                    {user.blocked ? 'Odblokovať' : 'Zablokovať'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Users;