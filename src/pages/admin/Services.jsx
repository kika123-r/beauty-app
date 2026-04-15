import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useTier } from '../../hooks/useTier';
import { createService, getServices, updateService, deleteService } from '../../services/serviceService';
import { uploadServiceImage } from '../../services/uploadService';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', price: '', duration: '', description: '', imageUrl: '' };

const Services = () => {
  const { salonId } = useAuth();
  const { tier, config, hasFeature } = useTier();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    const data = await getServices(salonId);
    setServices(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const maxServices = config.maxServices;
  const atLimit = maxServices !== null && services.length >= maxServices;

  const handleAddClick = () => {
    if (atLimit && !editId) {
      toast.error(`Váš plán umožňuje max. ${maxServices} služieb. Upgradujte plán.`);
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) {
      toast.error('Vyplň názov, cenu a trvanie.');
      return;
    }
    if (atLimit && !editId) {
      toast.error(`Limit ${maxServices} služieb dosiahnutý.`);
      return;
    }
    setLoading(true);
    try {
      let imageUrl = form.imageUrl;
      const serviceId = editId || `service_${Date.now()}`;
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadServiceImage(salonId, serviceId, imageFile);
        setUploading(false);
      }
      const data = {
        name:        form.name,
        price:       Number(form.price),
        duration:    Number(form.duration),
        description: form.description,
        imageUrl,
      };
      if (editId) {
        await updateService(salonId, editId, data);
        toast.success('Služba upravená!');
      } else {
        await createService(salonId, data);
        toast.success('Služba vytvorená!');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(false);
      setImageFile(null);
      setImagePreview(null);
      loadServices();
    } catch {
      toast.error('Chyba. Skús znova.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setForm({ name: service.name, price: String(service.price), duration: String(service.duration), description: service.description || '' });
    setEditId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vymazať túto službu?')) return;
    await deleteService(salonId, id);
    toast.success('Služba vymazaná.');
    loadServices();
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };
  const inputStyle = { width: '100%', padding: '13px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', outline: 'none', fontFamily: 'Jost, sans-serif', fontWeight: 300, transition: 'border-color 0.2s', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-faint)', marginBottom: '7px', letterSpacing: '0.12em', textTransform: 'uppercase' };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Služby</h2>
          </div>
          {!showForm && (
            <button
              onClick={handleAddClick}
              style={{ padding: '10px 20px', background: atLimit ? 'var(--border)' : 'var(--primary)', color: atLimit ? 'var(--text-faint)' : 'var(--bg-elevated)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
            >
              + Pridať
            </button>
          )}
        </div>

        {/* Tier info banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: atLimit ? 'rgba(139,58,58,0.1)' : 'rgba(74,124,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              {atLimit ? '⚠️' : '✓'}
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>
                {services.length} / {maxServices === null ? '∞' : maxServices} služieb
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>Plán {config.name}</p>
            </div>
          </div>
          {atLimit && (
            <button
              onClick={() => navigate('/admin/pricing')}
              style={{ padding: '8px 16px', background: 'var(--primary-dark)', color: 'var(--text)', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
            >
              Upgradovať →
            </button>
          )}
        </div>

        {/* Upgrade gate — plná obrazovka ak je na limite a skúša pridať */}
        {atLimit && showForm && !editId && (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '48px 32px', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #A89070)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🔒</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--text)', marginBottom: '8px' }}>Limit služieb dosiahnutý</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-faint)', marginBottom: '24px', lineHeight: 1.6 }}>
              Váš plán <strong>{config.name}</strong> umožňuje maximálne <strong>{maxServices} služieb</strong>.<br />Upgradujte plán pre neobmedzené služby.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => navigate('/admin/pricing')} style={{ padding: '12px 24px', background: 'var(--primary-dark)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Upgradovať plán →
              </button>
              <button onClick={handleCancel} style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                Zavrieť
              </button>
            </div>
          </div>
        )}

        {/* Formulár */}
        {showForm && (!atLimit || editId) && (
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '24px' }}>
              {editId ? 'Upraviť službu' : 'Nová služba'}
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Fotografia služby</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {imagePreview && <img src={imagePreview} alt="preview" style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--border)' }} />}
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} style={{ fontSize: '13px', color: 'var(--primary)', fontFamily: 'Jost, sans-serif' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Názov služby *</label>
                <input type="text" name="name" placeholder="napr. Strihanie vlasov" value={form.name} onChange={handleChange} style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Cena (€) *</label>
                  <input type="number" name="price" placeholder="25" value={form.price} onChange={handleChange} min="0" style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Trvanie (min) *</label>
                  <input type="number" name="duration" placeholder="60" value={form.duration} onChange={handleChange} min="5" style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Popis</label>
                <textarea name="description" placeholder="Krátky popis služby..." value={form.description} onChange={handleChange} rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border)'} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: loading ? 'var(--text-faint)' : 'var(--primary)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  {loading ? 'Ukladám...' : editId ? 'Uložiť' : 'Vytvoriť'}
                </button>
                <button type="button" onClick={handleCancel} style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  Zrušiť
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Zoznam */}
        {services.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '8px' }}>Zatiaľ žiadne služby</p>
            <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Klikni na "+ Pridať" a vytvor prvú službu.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map((service) => (
              <div key={service.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px' }}>
                <div>
                  <p style={{ fontWeight: 500, color: 'var(--text)', marginBottom: '4px', fontSize: '15px', fontFamily: 'Jost, sans-serif' }}>{service.name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>{service.duration} min</p>
                  {service.description && <p style={{ fontSize: '12px', color: 'var(--text-faint)', marginTop: '3px' }}>{service.description}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)' }}>{service.price} €</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(service)} style={{ padding: '7px 14px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Upraviť</button>
                    <button onClick={() => handleDelete(service.id)} style={{ padding: '7px 14px', background: 'transparent', color: '#DFA0AA', border: '1px solid #8B3A3A', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Vymazať</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Services;
