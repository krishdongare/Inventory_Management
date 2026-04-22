import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'warehouse' });
  const { register, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  useEffect(() => () => clearError(), [clearError]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) navigate('/dashboard');
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.logo}>📦</span>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join InvenTrack</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              minLength={6}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="warehouse">Warehouse Staff</option>
              <option value="sales">Sales Manager</option>
              <option value="manager">Inventory Manager</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#1e293b',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    border: '1px solid #334155',
  },
  header: { textAlign: 'center', marginBottom: '28px' },
  logo: { fontSize: '36px' },
  title: { color: '#f1f5f9', margin: '8px 0 4px', fontSize: '24px', fontWeight: '700' },
  subtitle: { color: '#64748b', fontSize: '14px', margin: 0 },
  error: {
    background: '#7f1d1d',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    border: '1px solid #991b1b',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { color: '#94a3b8', fontSize: '13px', fontWeight: '500' },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: '15px',
    outline: 'none',
  },
  btn: {
    background: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
  footer: { textAlign: 'center', marginTop: '24px', color: '#64748b', fontSize: '14px' },
  link: { color: '#3b82f6', textDecoration: 'none', fontWeight: '500' },
};

export default Register;
