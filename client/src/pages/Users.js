import React, { useState, useEffect } from 'react';
import API from '../utils/api';

const roleColors = { admin: '#7c3aed', manager: '#1d4ed8', warehouse: '#065f46', sales: '#92400e' };
const roleText = { admin: '#c4b5fd', manager: '#93c5fd', warehouse: '#6ee7b7', sales: '#fde68a' };

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', isActive: true });

  const fetch = async () => {
    setLoading(true);
    const { data } = await API.get('/users');
    setUsers(data.data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openEdit = (u) => {
    setForm({ name: u.name, role: u.role, isActive: u.isActive });
    setEditUser(u);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await API.put(`/users/${editUser._id}`, form);
    setEditUser(null);
    fetch();
  };

  const toggleActive = async (u) => {
    await API.put(`/users/${u._id}`, { isActive: !u.isActive });
    fetch();
  };

  return (
    <div style={styles.page}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={styles.heading}>User Management</h2>
        <p style={styles.sub}>{users.length} users registered</p>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              {['Name','Email','Role','Status','Last Login','Actions'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={styles.center}>Loading...</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} style={styles.tr}>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: roleColors[u.role] || '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '13px' }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    <span style={{ color: '#e2e8f0', fontWeight: '500' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ ...styles.td, color: '#64748b' }}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{ background: roleColors[u.role], color: roleText[u.role], padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: u.isActive ? '#10b981' : '#ef4444', fontWeight: '600', fontSize: '13px' }}>
                    {u.isActive ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td style={{ ...styles.td, fontSize: '12px', color: '#64748b' }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEdit(u)} style={styles.btnSm}>Edit</button>
                    <button onClick={() => toggleActive(u)} style={{ ...styles.btnSm, background: u.isActive ? '#7f1d1d' : '#064e3b', color: u.isActive ? '#fca5a5' : '#6ee7b7' }}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Edit User</h3>
            <form onSubmit={handleUpdate} style={styles.mForm}>
              <div>
                <label style={styles.label}>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.input} required />
              </div>
              <div>
                <label style={styles.label}>Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={styles.input}>
                  <option value="warehouse">Warehouse Staff</option>
                  <option value="sales">Sales Manager</option>
                  <option value="manager">Inventory Manager</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} id="active" />
                <label htmlFor="active" style={{ color: '#94a3b8', fontSize: '14px' }}>Active Account</label>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => setEditUser(null)} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.saveBtn}>Update</button>
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
  heading: { color: '#f1f5f9', fontSize: '24px', fontWeight: '700', margin: '0 0 4px' },
  sub: { color: '#64748b', fontSize: '14px', margin: 0 },
  tableWrap: { overflowX: 'auto', background: '#1e293b', borderRadius: '12px', border: '1px solid #334155' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#0f172a' },
  th: { padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #1e293b' },
  td: { padding: '12px 16px', color: '#cbd5e1', fontSize: '14px' },
  center: { padding: '40px', textAlign: 'center', color: '#475569' },
  btnSm: { background: '#1e3a5f', color: '#93c5fd', border: 'none', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' },
  modal: { background: '#1e293b', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px', border: '1px solid #334155' },
  modalTitle: { color: '#f1f5f9', fontSize: '20px', fontWeight: '700', margin: '0 0 20px' },
  mForm: { display: 'flex', flexDirection: 'column', gap: '16px' },
  label: { color: '#94a3b8', fontSize: '13px', fontWeight: '500', display: 'block', marginBottom: '5px' },
  input: { width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '9px 13px', color: '#f1f5f9', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn: { background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
};

export default Users;
