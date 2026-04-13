// src/pages/admin/Services.jsx
import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { createService, getServices, updateService, deleteService } from '../../services/serviceService';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', price: '', duration: '', description: '' };

const Services = () => {
  const { salonId } = useAuth();
  const [services, setServices] = useState([]);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    const data = await getServices(salonId);
    setServices(data);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.duration) {
      toast.error('Vyplň názov, cenu a trvanie.');
      return;
    }
    setLoading(true);
    try {
      const data = {
        name:        form.name,
        price:       Number(form.price),
        duration:    Number(form.duration),
        description: form.description,
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
      loadServices();
    } catch {
      toast.error('Chyba. Skús znova.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setForm({
      name:        service.name,
      price:       String(service.price),
      duration:    String(service.duration),
      description: service.description || '',
    });
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
  };

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E2DE',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(28,28,27,0.04)',
  };

  const inputStyle = {
    width: '100%', padding: '13px 16px',
    background: '#F5F0EA',
    border: '1px solid #E2E2DE',
    borderRadius: '10px',
    fontSize: '14px', color: '#1C1C1B',
    outline: 'none', fontFamily: 'Jost, sans-serif',
    fontWeight: 300, transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block', fontSize: '10px', fontWeight: 500,
    color: '#979086', marginBottom: '7px',
    letterSpacing: '0.12em', textTransform: 'uppercase',
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#979086', marginBottom: '8px' }}>
              Správa
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#1C1C1B' }}>
              Služby
            </h2>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 20px',
                background: '#6A5D52', color: '#F5F0EA',
                border: 'none', borderRadius: '12px',
                fontSize: '12px', fontWeight: 500,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: 'Jost, sans-serif',
              }}
            >
              + Pridať
            </button>
          )}
        </div>

        {/* Formulár */}
        {showForm && (
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '24px' }}>
              {editId ? 'Upraviť službu' : 'Nová služba'}
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Názov služby *</label>
                <input
                  type="text" name="name"
                  placeholder="napr. Strihanie vlasov"
                  value={form.name} onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Cena (€) *</label>
                  <input
                    type="number" name="price"
                    placeholder="25" value={form.price}
                    onChange={handleChange} min="0"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Trvanie (min) *</label>
                  <input
                    type="number" name="duration"
                    placeholder="60" value={form.duration}
                    onChange={handleChange} min="5"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                    onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Popis</label>
                <textarea
                  name="description"
                  placeholder="Krátky popis služby..."
                  value={form.description} onChange={handleChange}
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={(e) => e.target.style.borderColor = '#6A5D52'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E2DE'}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit" disabled={loading}
                  style={{
                    padding: '12px 24px',
                    background: loading ? '#B7AC9B' : '#6A5D52',
                    color: '#F5F0EA', border: 'none',
                    borderRadius: '12px', fontSize: '12px',
                    fontWeight: 500, letterSpacing: '0.08em',
                    textTransform: 'uppercase', cursor: 'pointer',
                    fontFamily: 'Jost, sans-serif',
                  }}
                >
                  {loading ? 'Ukladám...' : editId ? 'Uložiť' : 'Vytvoriť'}
                </button>
                <button
                  type="button" onClick={handleCancel}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent', color: '#979086',
                    border: '1px solid #E2E2DE', borderRadius: '12px',
                    fontSize: '12px', fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                  }}
                >
                  Zrušiť
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Zoznam */}
        {services.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B', marginBottom: '8px' }}>
              Zatiaľ žiadne služby
            </p>
            <p style={{ fontSize: '13px', color: '#979086' }}>
              Klikni na "+ Pridať" a vytvor prvú službu.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {services.map((service) => (
              <div key={service.id} style={{
                ...cardStyle,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 24px',
              }}>
                <div>
                  <p style={{ fontWeight: 500, color: '#1C1C1B', marginBottom: '4px', fontSize: '15px', fontFamily: 'Jost, sans-serif' }}>
                    {service.name}
                  </p>
                  <p style={{ fontSize: '13px', color: '#979086' }}>
                    {service.duration} min
                  </p>
                  {service.description && (
                    <p style={{ fontSize: '12px', color: '#B7AC9B', marginTop: '3px' }}>
                      {service.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: '#1C1C1B' }}>
                    {service.price} €
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEdit(service)}
                      style={{
                        padding: '7px 14px',
                        background: 'transparent', color: '#6A5D52',
                        border: '1px solid #E2E2DE', borderRadius: '8px',
                        fontSize: '11px', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}
                    >
                      Upraviť
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      style={{
                        padding: '7px 14px',
                        background: 'transparent', color: '#8B3A3A',
                        border: '1px solid #8B3A3A', borderRadius: '8px',
                        fontSize: '11px', fontWeight: 500,
                        cursor: 'pointer', fontFamily: 'Jost, sans-serif',
                        letterSpacing: '0.06em', textTransform: 'uppercase',
                      }}
                    >
                      Vymazať
                    </button>
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