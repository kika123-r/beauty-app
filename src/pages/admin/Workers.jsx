import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../../services/workerService';
import { getServices } from '../../services/serviceService';
import { uploadWorkerImage } from '../../services/uploadService';
import { updateService } from '../../services/serviceService';
import { uploadServiceImage } from '../../services/uploadService';
import toast from 'react-hot-toast';

const Workers = () => {
  const { salonId } = useAuth();
  const [workers, setWorkers]   = useState([]);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', position: '', serviceIds: [], bio: '', photoUrl: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [w, sv] = await Promise.all([getWorkers(salonId), getServices(salonId)]);
    setWorkers(w); setServices(sv);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleService = (id) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter(s => s !== id)
        : [...prev.serviceIds, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.position) { toast.error('Vyplň meno a pozíciu.'); return; }
    setLoading(true);
    try {
      let photoUrl = form.photoUrl;
      const workerId = editId || `worker_${Date.now()}`;

      if (imageFile) {
        setUploading(true);
        photoUrl = await uploadWorkerImage(salonId, workerId, imageFile);
        setUploading(false);
      }

      if (editId) {
        await updateWorker(salonId, editId, { ...form, photoUrl });
        toast.success('Pracovník upravený!');
      } else {
        await createWorker(salonId, { ...form, photoUrl, id: workerId });
        toast.success('Pracovník pridaný!');
      }

      setForm({ name: '', position: '', serviceIds: [], bio: '', photoUrl: '' });
      setImageFile(null); setImagePreview(null); setEditId(null); setShowForm(false);
      loadData();
    } catch (err) { toast.error('Chyba. Skús znova.'); }
    finally { setLoading(false); }
  };

  const handleEdit = (worker) => {
    setForm({ name: worker.name, position: worker.position, serviceIds: worker.serviceIds || [], bio: worker.bio || '', photoUrl: worker.photoUrl || '' });
    setImagePreview(worker.photoUrl || null);
    setEditId(worker.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Vymazať pracovníka?')) return;
    await deleteWorker(salonId, id);
    toast.success('Pracovník vymazaný.'); loadData();
  };

  const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(28,28,27,0.04)' };
  const inputStyle = { width: '100%', padding: '13px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '14px', color: 'var(--text)', outline: 'none', fontFamily: 'Jost, sans-serif', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 500, color: 'var(--text-faint)', marginBottom: '7px', letterSpacing: '0.12em', textTransform: 'uppercase' };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '700px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '8px' }}>Správa</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: 'var(--text)' }}>Pracovníci</h2>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', background: 'var(--primary)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
              + Pridať
            </button>
          )}
        </div>

        {showForm && (
          <div style={{ ...cardStyle, marginBottom: '24px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '24px' }}>
              {editId ? 'Upraviť pracovníka' : 'Nový pracovník'}
            </p>
            <form onSubmit={handleSubmit}>
              {/* Foto */}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: imagePreview ? 'transparent' : 'linear-gradient(135deg, #D4C5B0, #B7AC9B)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {imagePreview ? <img src={imagePreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: 'var(--text)' }}>{form.name?.charAt(0) || '?'}</span>}
                </div>
                <div>
                  <label style={labelStyle}>Fotografia</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ fontSize: '13px', color: 'var(--primary)', fontFamily: 'Jost, sans-serif' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Meno *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Jana Nováková" style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
                <div>
                  <label style={labelStyle}>Pozícia *</label>
                  <input type="text" value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Kaderníčka" style={inputStyle} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Bio</label>
                <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Krátky popis..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Služby ktoré vykonáva</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {services.map(s => (
                    <div key={s.id} onClick={() => toggleService(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: form.serviceIds.includes(s.id) ? 'rgba(106,93,82,0.06)' : 'var(--bg-elevated)', border: `1px solid ${form.serviceIds.includes(s.id) ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', cursor: 'pointer' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${form.serviceIds.includes(s.id) ? 'var(--primary)' : 'var(--primary-light)'}`, background: form.serviceIds.includes(s.id) ? 'var(--primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {form.serviceIds.includes(s.id) && <span style={{ color: 'var(--text)', fontSize: '11px' }}>✓</span>}
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', fontFamily: 'Jost, sans-serif' }}>{s.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-faint)' }}>{s.duration} min · {s.price} €</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={loading || uploading} style={{ padding: '12px 24px', background: loading ? 'var(--text-faint)' : 'var(--primary)', color: 'var(--text)', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  {uploading ? 'Nahrávam...' : loading ? 'Ukladám...' : editId ? 'Uložiť' : 'Pridať pracovníka'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm({ name: '', position: '', serviceIds: [], bio: '', photoUrl: '' }); setImageFile(null); setImagePreview(null); }} style={{ padding: '12px 24px', background: 'transparent', color: 'var(--text-faint)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}>
                  Zrušiť
                </button>
              </div>
            </form>
          </div>
        )}

        {workers.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.3rem', color: 'var(--text)', marginBottom: '8px' }}>Zatiaľ žiadni pracovníci</p>
            <p style={{ fontSize: '13px', color: 'var(--text-faint)' }}>Pridajte pracovníkov a priraďte im služby.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workers.map(worker => (
              <div key={worker.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D4C5B0, #B7AC9B)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {worker.photoUrl ? <img src={worker.photoUrl} alt={worker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--text)' }}>{worker.name?.charAt(0)}</span>}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--text)', fontSize: '14px', fontFamily: 'Jost, sans-serif', marginBottom: '2px' }}>{worker.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '4px' }}>{worker.position}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(worker.serviceIds || []).map(sid => {
                        const s = services.find(sv => sv.id === sid);
                        return s ? <span key={sid} style={{ fontSize: '10px', color: 'var(--text-faint)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '8px' }}>{s.name}</span> : null;
                      })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEdit(worker)} style={{ padding: '7px 14px', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase' }}>Upraviť</button>
                  <button onClick={() => handleDelete(worker.id)} style={{ padding: '7px 14px', background: 'transparent', color: '#8B3A3A', border: '1px solid #8B3A3A', borderRadius: '8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Jost, sans-serif', textTransform: 'uppercase' }}>Vymazať</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Workers;
