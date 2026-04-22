import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const StatCard = ({ label, value, color, sub }) => (
  <div style={{ ...styles.card, borderTop: `3px solid ${color}` }}>
    <p style={styles.cardLabel}>{label}</p>
    <p style={{ ...styles.cardValue, color }}>{value}</p>
    {sub && <p style={styles.cardSub}>{sub}</p>}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, alertsRes] = await Promise.all([
          API.get('/products/stats/summary'),
          API.get('/products/alerts/low-stock'),
        ]);
        setStats(statsRes.data.data);
        setAlerts(alertsRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCount = (status) =>
    stats?.stockBreakdown?.find((s) => s._id === status)?.count || 0;

  return (
    <div style={styles.page}>
      <div style={styles.welcome}>
        <h2 style={styles.heading}>Welcome back, {user?.name} 👋</h2>
        <p style={styles.sub}>Here's what's happening in your inventory today.</p>
      </div>

      {loading ? (
        <p style={styles.loading}>Loading stats...</p>
      ) : (
        <>
          <div style={styles.grid}>
            <StatCard
              label="Total Products"
              value={stats?.totalProducts ?? '—'}
              color="#3b82f6"
              sub={`${stats?.categories ?? 0} categories`}
            />
            <StatCard
              label="Healthy Stock"
              value={getCount('healthy')}
              color="#10b981"
              sub="Above minimum threshold"
            />
            <StatCard
              label="Low Stock"
              value={getCount('low')}
              color="#f59e0b"
              sub="At or below threshold"
            />
            <StatCard
              label="Out of Stock"
              value={getCount('out_of_stock')}
              color="#ef4444"
              sub="Requires immediate reorder"
            />
          </div>

          {/* Low Stock Alerts Panel */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>
                🔔 Low Stock Alerts
                {alerts.length > 0 && (
                  <span style={styles.badge}>{alerts.length}</span>
                )}
              </h3>
              <Link to="/inventory?stockStatus=low" style={styles.viewAll}>
                View All →
              </Link>
            </div>

            {alerts.length === 0 ? (
              <p style={styles.noAlerts}>✅ All products are well-stocked.</p>
            ) : (
              <div style={styles.alertList}>
                {alerts.slice(0, 6).map((p) => (
                  <div key={p._id} style={styles.alertRow}>
                    <div>
                      <p style={styles.alertName}>{p.name}</p>
                      <p style={styles.alertSku}>SKU: {p.sku}</p>
                    </div>
                    <div style={styles.alertRight}>
                      <span
                        style={{
                          ...styles.statusChip,
                          background: p.stockStatus === 'out_of_stock' ? '#7f1d1d' : '#78350f',
                          color: p.stockStatus === 'out_of_stock' ? '#fca5a5' : '#fde68a',
                        }}
                      >
                        {p.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                      </span>
                      <p style={styles.qty}>Qty: {p.quantity} / Min: {p.minimumThreshold}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  page: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  welcome: { marginBottom: '28px' },
  heading: { color: '#f1f5f9', fontSize: '24px', fontWeight: '700', margin: '0 0 6px' },
  sub: { color: '#64748b', fontSize: '15px', margin: 0 },
  loading: { color: '#64748b', textAlign: 'center', marginTop: '60px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  card: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '20px 24px',
  },
  cardLabel: { color: '#64748b', fontSize: '13px', fontWeight: '600', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  cardValue: { fontSize: '36px', fontWeight: '800', margin: '0 0 4px' },
  cardSub: { color: '#475569', fontSize: '13px', margin: 0 },
  section: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '12px',
    padding: '24px',
  },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { color: '#f1f5f9', fontSize: '17px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' },
  badge: {
    background: '#ef4444',
    color: '#fff',
    borderRadius: '999px',
    padding: '1px 9px',
    fontSize: '12px',
    fontWeight: '700',
  },
  viewAll: { color: '#3b82f6', textDecoration: 'none', fontSize: '14px', fontWeight: '500' },
  noAlerts: { color: '#10b981', fontSize: '14px' },
  alertList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  alertRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#0f172a',
    borderRadius: '8px',
    border: '1px solid #1e293b',
  },
  alertName: { color: '#e2e8f0', fontWeight: '600', margin: '0 0 2px', fontSize: '14px' },
  alertSku: { color: '#475569', fontSize: '12px', margin: 0 },
  alertRight: { textAlign: 'right' },
  statusChip: { borderRadius: '999px', padding: '3px 10px', fontSize: '11px', fontWeight: '700' },
  qty: { color: '#64748b', fontSize: '12px', margin: '4px 0 0' },
};

export default Dashboard;
