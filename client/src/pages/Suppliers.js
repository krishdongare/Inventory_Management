import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const initForm = { name: '', contactPerson: '', email: '', phone: '', notes: '', address: { street: '', city: '', state: '', pincode: '', country: 'India' } };

const Suppliers = () => {
  const { user } = useAuth();
  const canEdit = ['admin', 'manager'].includes(user?.role);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [editId, setEditId] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await API.get('/suppliers');
    setSuppliers(data.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [key]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const openAdd = () => { setForm(initForm); setEditId(null); setShowModal(true); };
  const openEdit = (s) => {
    setForm({ name: s.name, contactPerson: s.contactPerson || '', email: s.email || '', phone: s.phone || '', notes: s.notes || '', address: s.address || initForm.address });
    setEditId(s._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) await API.put(`/suppliers/${editId}`, form);
    else await API.post('/suppliers', form);
    setShowModal(false);
    fetch();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this supplier?')) { await API.delete(`/suppliers/${id}`); fetch(); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.heading}>Suppliers</h2>
          <p style={styles.sub}>{suppliers.length} active suppliers</p>
        </div>
        {canEdit && <button onClick={openAdd} style={styles.addBtn}>+ Add Supplier</button>}
      </div>

      {loading ? <p style={{ color: '#64748b' }}>Loading...</p> : (
        <div style={styles.grid}>
          {suppliers.map((s) => (
            <div key={s._id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.avatar}>{s.name[0].toUpperCase()}</div>
                <div>
                  <p style={styles.cardName}>{s.name}</p>
                  {s.contactPerson && <p style={styles.cardSub}>{s.contactPerson}</p>}
                </div>
              </div>
              {s.email && <p style={styles.info}>✉️ {s.email}</p>}
              {s.phone && <p style={styles.info}>📞 {s.phone}</p>}
              {s.address?.city && <p style={styles.info}>📍 {s.address.city}, {s.address.state}</p>}
              {canEdit && (
                <div style={styles.cardActions}>
                  <button onClick={() => openEdit(s)} style={styles.btnSm}>Edit</button>
                  {user?.role === 'admin' && <button onClick={() => handleDelete(s._id)} style={{ ...styles.btnSm, background: '#7f1d1d', color: '#fca5a5' }}>Delete</button>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{editId ? 'Edit Supplier' : 'Add Supplier'}</h3>
            <form onSubmit={handleSubmit} style={styles.mForm}>
              {[['name','Company Name',true],['contactPerson','Contact Person',false],['email','Email',false],['phone','Phone',false]].map(([field,label,req]) => (
                <div key={field}>
                  <label style={styles.label}>{label}</label>
                  <input name={field} value={form[field]} onChange={handleChange} style={styles.input} required={req} />
                </div>
              ))}
              <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0', fontWeight: '600' }}>Address</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {['street','city','state','pincode'].map(f => (
                  <div key={f}>
                    <label style={styles.label}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                    <input name={`address.${f}`} value={form.address[f]} onChange={handleChange} style={styles.input} />
                  </div>
                ))}
              </div>
              <div>
                <label style={styles.label}>Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} style={{ ...styles.input, height: '70px', resize: 'vertical' }} />
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>{editId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  heading: { color: '#f1f5f9', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
  sub: { color: '#64748b', fontSize: '14px', margin: 0 },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' },
  card: { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' },
  avatar: { width: '42px', height: '42px', borderRadius: '10px', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 },
  cardName: { color: '#f1f5f9', fontWeight: '600', margin: '0 0 2px', fontSize: '15px' },
  cardSub: { color: '#64748b', fontSize: '13px', margin: 0 },
  info: { color: '#94a3b8', fontSize: '13px', margin: '4px 0' },
  cardActions: { display: 'flex', gap: '8px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #334155' },
  btnSm: { background: '#1e3a5f', color: '#93c5fd', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 20px' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '14px' },
  label: { color: '#94a3b8', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '5px' },
  input: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '9px 13px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' },
  cancelBtn: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
};

export default Suppliers;
