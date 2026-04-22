import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  healthy: { bg: '#064e3b', text: '#6ee7b7' },
  low: { bg: '#78350f', text: '#fde68a' },
  out_of_stock: { bg: '#7f1d1d', text: '#fca5a5' },
};

const initialForm = {
  name: '', sku: '', category: '', description: '',
  quantity: '', minimumThreshold: 10, unitPrice: '',
};

const Inventory = () => {
  const { user } = useAuth();
  const canEdit = ['admin', 'manager'].includes(user?.role);
  const canAdjust = ['admin', 'manager', 'warehouse'].includes(user?.role);

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('stockStatus', statusFilter);
      const { data } = await API.get(`/products?${params}`);
      setProducts(data.data);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProducts, 300);
    return () => clearTimeout(t);
  }, [fetchProducts]);

  const openAdd = () => { setForm(initialForm); setEditId(null); setShowModal(true); };
  const openEdit = (p) => {
    setForm({
      name: p.name, sku: p.sku, category: p.category,
      description: p.description || '', quantity: p.quantity,
      minimumThreshold: p.minimumThreshold, unitPrice: p.unitPrice,
    });
    setEditId(p._id);
    setShowModal(true);
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await API.put(`/products/${editId}`, form);
        setMsg('Product updated.');
      } else {
        await API.post('/products', form);
        setMsg('Product added.');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error saving product.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this product from inventory?')) return;
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const handleAdjust = async () => {
    try {
      await API.patch(`/products/${adjustModal._id}/stock`, { adjustment: Number(adjustment), reason });
      setAdjustModal(null);
      setAdjustment('');
      setReason('');
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Stock adjustment failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.heading}>Inventory</h2>
          <p style={styles.sub}>{total} products total</p>
        </div>
        {canEdit && (
          <button onClick={openAdd} style={styles.addBtn}>+ Add Product</button>
        )}
      </div>

      {msg && <div style={styles.msgBar}>{msg} <button onClick={() => setMsg('')} style={styles.dismiss}>✕</button></div>}

      {/* Filters */}
      <div style={styles.filters}>
        <input
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option value="">All Status</option>
          <option value="healthy">Healthy</option>
          <option value="low">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Qty</th>
              <th style={styles.th}>Min</th>
              <th style={styles.th}>Price (₹)</th>
              <th style={styles.th}>Status</th>
              {(canEdit || canAdjust) && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={styles.center}>Loading...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={8} style={styles.center}>No products found.</td></tr>
            ) : (
              products.map((p) => {
                const sc = statusColors[p.stockStatus] || {};
                return (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>{p.name}</td>
                    <td style={{ ...styles.td, fontFamily: 'monospace', color: '#94a3b8' }}>{p.sku}</td>
                    <td style={styles.td}>{p.category}</td>
                    <td style={styles.td}>{p.quantity}</td>
                    <td style={styles.td}>{p.minimumThreshold}</td>
                    <td style={styles.td}>₹{Number(p.unitPrice).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={{ background: sc.bg, color: sc.text, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                        {p.stockStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    {(canEdit || canAdjust) && (
                      <td style={styles.td}>
                        <div style={styles.actions}>
                          {canAdjust && (
                            <button onClick={() => setAdjustModal(p)} style={styles.btnSm}>Adjust</button>
                          )}
                          {canEdit && (
                            <button onClick={() => openEdit(p)} style={{ ...styles.btnSm, background: '#1d4ed8' }}>Edit</button>
                          )}
                          {user?.role === 'admin' && (
                            <button onClick={() => handleDelete(p._id)} style={{ ...styles.btnSm, background: '#991b1b' }}>Del</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{editId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSubmit} style={styles.modalForm}>
              {[['name','Name'],['sku','SKU'],['category','Category'],['description','Description']].map(([field, label]) => (
                <div key={field} style={styles.field}>
                  <label style={styles.label}>{label}</label>
                  <input name={field} value={form[field]} onChange={handleFormChange} style={styles.input} required={field !== 'description'} />
                </div>
              ))}
              <div style={styles.row}>
                {[['quantity','Quantity','number'],['minimumThreshold','Min Threshold','number'],['unitPrice','Unit Price (₹)','number']].map(([field, label, type]) => (
                  <div key={field} style={{ flex: 1 }}>
                    <label style={styles.label}>{label}</label>
                    <input name={field} type={type} value={form[field]} onChange={handleFormChange} style={styles.input} required min={0} />
                  </div>
                ))}
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>{editId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '380px' }}>
            <h3 style={styles.modalTitle}>Adjust Stock — {adjustModal.name}</h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px' }}>
              Current qty: <strong style={{ color: '#f1f5f9' }}>{adjustModal.quantity}</strong>. Enter positive to add, negative to deduct.
            </p>
            <div style={styles.field}>
              <label style={styles.label}>Adjustment</label>
              <input type="number" value={adjustment} onChange={(e) => setAdjustment(e.target.value)} style={styles.input} placeholder="+10 or -5" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Reason</label>
              <input value={reason} onChange={(e) => setReason(e.target.value)} style={styles.input} placeholder="e.g. Stock count correction" />
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setAdjustModal(null)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleAdjust} style={styles.saveBtn}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '32px', maxWidth: '1300px', margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  heading: { color: '#f1f5f9', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
  sub: { color: '#64748b', fontSize: '14px', margin: 0 },
  addBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  msgBar: { background: '#1e3a5f', color: '#93c5fd', border: '1px solid #1d4ed8', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' },
  dismiss: { background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '16px' },
  filters: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchInput: { flex: 1, background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '9px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  select: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '9px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  tableWrap: { overflowX: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#0f172a' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #1e293b' },
  td: { padding: '12px 16px', color: '#cbd5e1', fontSize: '14px' },
  center: { padding: '40px', textAlign: 'center', color: '#475569' },
  actions: { display: 'flex', gap: '6px' },
  btnSm: { background: '#1e3a5f', color: '#93c5fd', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '560px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 24px' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
  input: { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  row: { display: 'flex', gap: '12px' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  cancelBtn: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
};

export default Inventory;
