import React, { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  pending: '#78350f', confirmed: '#1e3a5f', processing: '#312e81',
  shipped: '#065f46', delivered: '#064e3b', cancelled: '#7f1d1d',
};
const statusText = {
  pending: '#fde68a', confirmed: '#93c5fd', processing: '#a5b4fc',
  shipped: '#6ee7b7', delivered: '#10b981', cancelled: '#fca5a5',
};

const Orders = () => {
  const { user } = useAuth();
  const canManage = ['admin', 'manager'].includes(user?.role);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await API.get(`/orders${params}`);
      setOrders(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/orders/${id}/status`, { status });
      fetchOrders();
      if (selected?._id === id) setSelected({ ...selected, status });
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.heading}>Orders</h2>
          <p style={styles.sub}>{orders.length} orders</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option value="">All Statuses</option>
          {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Order #</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Items</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={styles.center}>Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} style={styles.center}>No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o._id} style={styles.tr}>
                  <td style={{ ...styles.td, fontFamily: 'monospace', color: '#94a3b8', fontSize: '12px' }}>{o.orderNumber}</td>
                  <td style={styles.td}>
                    <p style={{ margin: 0, color: '#e2e8f0', fontWeight: '500' }}>{o.customer.name}</p>
                    <p style={{ margin: 0, color: '#475569', fontSize: '12px' }}>{o.customer.email}</p>
                  </td>
                  <td style={styles.td}>{o.items.length} item(s)</td>
                  <td style={styles.td}>₹{o.totalAmount.toLocaleString()}</td>
                  <td style={styles.td}>
                    <span style={{ background: statusColors[o.status], color: statusText[o.status], padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                      {o.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ ...styles.td, fontSize: '12px', color: '#64748b' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSelected(o)} style={styles.btnSm}>View</button>
                      {canManage && o.status !== 'delivered' && o.status !== 'cancelled' && (
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                          style={{ ...styles.btnSm, padding: '4px 6px', cursor: 'pointer', background: '#0f172a', color: '#94a3b8', border: '1px solid #334155', borderRadius: '6px' }}
                        >
                          {['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={styles.modalTitle}>{selected.orderNumber}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '20px' }}>✕</button>
            </div>
            <div style={styles.detailGrid}>
              <div>
                <p style={styles.detailLabel}>Customer</p>
                <p style={styles.detailValue}>{selected.customer.name}</p>
                <p style={{ ...styles.detailValue, fontSize: '13px', color: '#64748b' }}>{selected.customer.email}</p>
              </div>
              <div>
                <p style={styles.detailLabel}>Total</p>
                <p style={{ ...styles.detailValue, color: '#10b981', fontSize: '20px' }}>₹{selected.totalAmount.toLocaleString()}</p>
              </div>
            </div>
            <p style={styles.detailLabel}>Items</p>
            <div style={styles.itemsList}>
              {selected.items.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <span style={{ color: '#e2e8f0' }}>{item.productName}</span>
                  <span style={{ color: '#94a3b8' }}>x{item.quantity} @ ₹{item.unitPrice}</span>
                  <span style={{ color: '#10b981', fontWeight: '700' }}>₹{(item.quantity * item.unitPrice).toLocaleString()}</span>
                </div>
              ))}
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
  select: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '9px 14px', color: '#f1f5f9', fontSize: '14px', outline: 'none' },
  tableWrap: { overflowX: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#0f172a' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #1e293b' },
  td: { padding: '12px 16px', color: '#cbd5e1', fontSize: '14px' },
  center: { padding: '40px', textAlign: 'center', color: '#475569' },
  btnSm: { background: '#1e3a5f', color: '#93c5fd', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '520px', border: '1px solid #334155', maxHeight: '80vh', overflowY: 'auto' },
  modalTitle: { color: '#f1f5f9', fontSize: '18px', fontWeight: '700', margin: 0, fontFamily: 'monospace' },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  detailLabel: { color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' },
  detailValue: { color: '#f1f5f9', fontWeight: '600', margin: 0 },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#0f172a', borderRadius: '8px', fontSize: '14px' },
};

export default Orders;
