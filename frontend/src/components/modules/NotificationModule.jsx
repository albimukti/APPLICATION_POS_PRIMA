import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Bell, AlertTriangle, CheckCircle2, Gift, Clock, Sliders } from 'lucide-react';

export default function NotificationModule() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res.success) setNotifications(res.notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'STOCK_ALERT': return <AlertTriangle size={20} style={{ color: '#fb7185' }} />;
      case 'TRANSACTION': return <CheckCircle2 size={20} style={{ color: '#34d399' }} />;
      case 'PROMO': return <Gift size={20} style={{ color: '#fbbf24' }} />;
      case 'SHIFT': return <Clock size={20} style={{ color: '#818cf8' }} />;
      case 'MODULE': return <Sliders size={20} style={{ color: '#06b6d4' }} />;
      default: return <Bell size={20} style={{ color: 'var(--emerald-500)' }} />;
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #15</span>
            <span className="badge badge-success">{notifications.filter(n => !n.isRead).length} Belum Dibaca</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
             Pusat Pemberitahuan & Notifikasi Sistem
          </h2>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => !n.isRead && handleMarkRead(n.id)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: n.isRead ? 'var(--bg-secondary)' : 'rgba(99, 102, 241, 0.08)',
              border: n.isRead ? '1px solid var(--border-glass)' : '1px solid var(--indigo-500)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--bg-tertiary)' }}>
              {getIcon(n.type)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {n.title}
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatDate(n.createdAt)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
