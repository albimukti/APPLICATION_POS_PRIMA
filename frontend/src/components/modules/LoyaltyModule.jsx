import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/formatters';
import { Star, Gift, Crown, CheckCircle2, Award } from 'lucide-react';

export default function LoyaltyModule() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getLoyaltyRewards();
        if (res.success) {
          setRewards(res.rewards);
          setTiers(res.tiers);
        }
      } catch (err) {
        console.error('Failed to load loyalty rewards:', err);
      }
    }
    loadData();
  }, []);

  const handleRedeem = async (reward) => {
    try {
      const res = await api.redeemLoyaltyReward('cust-1', reward.id);
      if (res.success) {
        setSuccessMsg(`${res.message}. Kode Voucher: ${res.voucherCode}`);
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menukarkan poin');
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #11</span>
            <span className="badge badge-warning">Reward Poin & Tier</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            ⭐ Program Loyalitas Pelanggan & Reward Poin
          </h2>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Membership Tiers Overview */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          👑 Tingkatan Keanggotaan (Membership Tiers)
        </h3>
        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {tiers.map(t => (
            <div key={t.name} style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: `1px solid ${t.badgeColor}44`,
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span className="badge" style={{ alignSelf: 'flex-start', background: `${t.badgeColor}22`, color: t.badgeColor, border: `1px solid ${t.badgeColor}66` }}>
                {t.name} Member
              </span>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                Multipler {t.multiplier}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Min. Akumulasi Belanja: {formatRupiah(t.minSpend)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700 }}>
          🎁 Katalog Hadiah & Penukaran Poin
        </h3>

        <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {rewards.map(r => (
            <div key={r.id} style={{
              padding: '18px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-warning">
                    ⭐ {r.pointsCost} Poin
                  </span>
                  <span className="badge badge-indigo">
                    Nilai: {formatRupiah(r.rewardValue)}
                  </span>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>{r.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{r.description}</p>
              </div>

              <button
                onClick={() => handleRedeem(r)}
                className="btn btn-primary"
                style={{ marginTop: '16px', width: '100%', fontSize: '0.8125rem' }}
              >
                Tukarkan Poin
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
