import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatRupiah, formatNumber, formatDate } from '../../utils/formatters';
import { TrendingUp, DollarSign, ShoppingBag, Download, Printer, UserCheck } from 'lucide-react';

export default function ReportModule() {
  const [summary, setSummary] = useState(null);
  const [cashierPerf, setCashierPerf] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const sRes = await api.getReportSummary();
        if (sRes.success) setSummary(sRes.summary);
        const cRes = await api.getCashierPerformance();
        if (cRes.success) setCashierPerf(cRes.performance);
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (!summary?.recentTransactions) return;
    const headers = ['Invoice,Tanggal,Kasir,Pelanggan,Metode,Total,Status'];
    const rows = summary.recentTransactions.map(t =>
      `"${t.invoiceNumber}","${t.createdAt}","${t.cashierName}","${t.customerName || 'Umum'}","${t.paymentMethod}",${t.totalAmount},"${t.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-penjualan-pos-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #7</span>
            <span className="badge badge-success">Finansial & Penjualan</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
             Laporan Penjualan & Analitik Keuangan
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} />
            <span>Ekspor CSV</span>
          </button>
          <button onClick={() => window.print()} className="btn btn-primary">
            <Printer size={16} />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL PENDAPATAN (OMSET)</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '4px' }}>
            {formatRupiah(summary?.totalRevenue || 0)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>ESTIMASI LABA KOTOR (GROSS PROFIT)</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
            {formatRupiah(summary?.grossProfit || 0)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>TOTAL STRUK TRANSAKSI</span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {summary?.totalTransactions || 0} Faktur
          </div>
        </div>
      </div>

      {/* Split: Payment Methods Breakdown & Cashier Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {/* Payment Methods Breakdown */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>
             Rekapitulasi per Metode Pembayaran
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {summary?.paymentBreakdown && Object.entries(summary.paymentBreakdown).map(([method, amount]) => (
              <div key={method} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{method}</span>
                <span style={{ fontWeight: 800, color: 'var(--emerald-500)' }}>{formatRupiah(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cashier Performance */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 700 }}>
            ‍ Kinerja Petugas Kasir
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cashierPerf.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={c.avatar} alt={c.name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.84rem' }}>{c.name}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.transactionCount} Transaksi</span>
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--emerald-500)' }}>
                  {formatRupiah(c.totalSales)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
