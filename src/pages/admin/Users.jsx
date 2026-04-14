import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../hooks/useTier';
import { getBookingsForSalon } from '../../services/bookingService';
import { getDocuments, updateDocument, usersCol } from '../../firebase/firestore';
import { BOOKING_STATUS, RELIABILITY } from '../../constants';
import toast from 'react-hot-toast';

const Users = () => {
  const { salonId } = useAuth();
  const { hasFeature } = useTier();
  const [users, setUsers]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const canExport = hasFeature('export');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersData, bookingsData] = await Promise.all([getDocuments(usersCol()), getBookingsForSalon(salonId)]);
      setUsers(usersData.filter(u => u.role === 'client'));
      setBookings(bookingsData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const getUserBookings = (uid) => bookings.filter(b => b.clientId === uid);
  const getNoShows = (uid) => bookings.filter(b => b.clientId === uid && b.status === BOOKING_STATUS.NO_SHOW).length;

  const getScoreColor = (score) => score >= RELIABILITY.WARNING_THRESHOLD ? '#4A7C59' : score >= RELIABILITY.BLOCK_THRESHOLD ? '#B07D3A' : '#8B3A3A';
  const getScoreBg = (score) => score >= RELIABILITY.WARNING_THRESHOLD ? 'rgba(74,124,89,0.1)' : score >= RELIABILITY.BLOCK_THRESHOLD ? 'rgba(176,125,58,0.1)' : 'rgba(139,58,58,0.1)';

  const handleBlock = async (user) => {
    if (!window.confirm(`${user.blocked ? 'Odblokovať' : 'Zablokovať'} tohto klienta?`)) return;
    try {
      await updateDocument(usersCol(), user.uid, { blocked: !user.blocked });
      toast.success(user.blocked ? 'Klient odblokovaný.' : 'Klient zablokovaný.');
      loadData();
    } catch { toast.error('Chyba. Skús znova.'); }
  };

  const handleExport = () => {
    if (!canExport) { toast.error('Export je dostupný od plánu Starter.'); return; }
    const rows = [['Meno', 'Email', 'Rezervácie', 'No-show', 'Spoľahlivosť', 'Stav']];
    filtered.forEach(u => {
      const ub = getUserBookings(u.uid);
      rows.push([u.name, u.email, ub.length, getNoShows(u.uid), u.reliabilityScore ?? 100, u.blocked ? 'Blokovaný' : 'Aktívny']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'klienti.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const cardStyle = { background: '#FFFFFF', border: '1px solid #E2E2DE', borderRadius: '20px', padding: '22px 24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>Klienti</h2>
          </div>
          <button onClick={handleExport} style={{ padding: '10px 20px', background: canExport ? '#1C1C1B' : '#E2E2DE', color: canExport ? '#F5F0EA' : '#979086', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: canExport ? 'pointer' : 'not-allowed', fontFamily: 'Jost, sans-serif' }}>
            {canExport ? '↓ Export CSV' : '🔒 Export CSV'}
          </button>
        </div>

        {/* Hľadanie */}
        <div style={{ ...cardStyle, padding: '14px 20px', marginBottom: '20px' }}>
          <input type="text" placeholder="Hľadať klienta podľa mena alebo emailu..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: '#F5F0EA', border: '1px solid #E2E2DE', borderRadius: '10px', fontSize: '13px', color: '#1C1C1B', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor='#6A5D52'} onBlur={e => e.target.style.borderColor='#E2E2DE'} />
        </div>

        <p style={{ fontSize: '12px', color: '#979086', marginBottom: '16px' }}>{filtered.length} klientov</p>

        {loading && <div style={{ textAlign: 'center', padding: '40px' }}><p style={{ color: '#979086' }}>Načítavam...</p></div>}

        {!loading && filtered.length === 0 && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>Žiadni klienti</p>
            <p style={{ fontSize: '13px', color: '#979086' }}>Klienti sa zobrazia po prvej rezervácii.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map(user => {
            const userBookings = getUserBookings(user.uid);
            const noShows = getNoShows(user.uid);
            const score = user.reliabilityScore ?? 100;
            return (
              <div key={user.uid} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #B7AC9B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 600, color: '#F5F0EA', flexShrink: 0, fontFamily: 'Jost, sans-serif' }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: 500, color: '#1C1C1B', fontSize: '14px', fontFamily: 'Jost, sans-serif' }}>{user.name}</p>
                        {user.blocked && <span style={{ fontSize: '10px', color: '#8B3A3A', background: 'rgba(139,58,58,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Blokovaný</span>}
                        {score < RELIABILITY.BLOCK_THRESHOLD && !user.blocked && <span style={{ fontSize: '10px', color: '#B07D3A', background: 'rgba(176,125,58,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Rizikový</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: '#979086', marginBottom: '12px' }}>{user.email}</p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Rezervácie', value: userBookings.length, color: '#6A5D52', bg: 'rgba(106,93,82,0.08)' },
                          { label: 'No-show', value: noShows, color: noShows > 0 ? '#8B3A3A' : '#979086', bg: noShows > 0 ? 'rgba(139,58,58,0.08)' : '#F5F0EA' },
                          { label: 'Spoľahlivosť', value: `${score}%`, color: getScoreColor(score), bg: getScoreBg(score) },
                        ].map(stat => (
                          <div key={stat.label} style={{ padding: '8px 14px', background: stat.bg, borderRadius: '10px' }}>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: stat.color, fontFamily: 'Cormorant Garamond, serif', marginBottom: '2px' }}>{stat.value}</p>
                            <p style={{ fontSize: '10px', color: '#979086', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stat.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleBlock(user)} style={{ padding: '8px 16px', background: 'transparent', color: user.blocked ? '#6A5D52' : '#8B3A3A', border: `1px solid ${user.blocked ? '#E2E2DE' : '#8B3A3A'}`, borderRadius: '10px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, marginLeft: '16px' }}>
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
