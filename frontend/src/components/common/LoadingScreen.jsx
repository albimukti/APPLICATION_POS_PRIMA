import React from 'react';
import { ArrowUpRight, ShoppingBag } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <main className="loading-screen" aria-label="Memuat POS Prima" role="status">
      <div className="loading-screen__grid" />
      <div className="loading-screen__wash loading-screen__wash--top" />
      <div className="loading-screen__wash loading-screen__wash--bottom" />

      <section className="loading-screen__content">
        <div className="loading-screen__brand-row">
          <div className="loading-screen__mark" aria-hidden="true">
            <ShoppingBag size={27} strokeWidth={2.2} />
            <span className="loading-screen__mark-dot" />
          </div>
          <div>
            <p className="loading-screen__eyebrow">Retail workspace</p>
            <p className="loading-screen__brand">POS PRIMA</p>
          </div>
        </div>

        <div className="loading-screen__headline-wrap">
          <p className="loading-screen__kicker">Sistem sedang disiapkan</p>
          <h1>Semua transaksi,<br /><em>lebih prima.</em></h1>
          <p className="loading-screen__message">Menyiapkan ruang kerja Anda dengan aman.</p>
        </div>

        <div className="loading-screen__progress-wrap">
          <div className="loading-screen__progress-label">
            <span>Menghubungkan modul</span>
            <span className="loading-screen__arrow" aria-hidden="true"><ArrowUpRight size={15} /></span>
          </div>
          <div className="loading-screen__progress-track" aria-hidden="true">
            <div className="loading-screen__progress-bar" />
          </div>
        </div>
      </section>

      <p className="loading-screen__version">PRIMA OS <span>/</span> 01</p>
    </main>
  );
}
