import React from 'react';
import Modal from './Modal';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Tindakan',
  message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
  note = null,
  loading = false
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="480px" icon={isDanger ? AlertTriangle : ShieldCheck}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: 'var(--text-main)', fontSize: '0.9375rem', lineHeight: '1.5', margin: 0 }}>
          {message}
        </p>

        {note && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: isDanger ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${isDanger ? 'rgba(244, 63, 94, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
            color: isDanger ? '#fb7185' : '#34d399',
            fontSize: '0.8125rem'
          }}>
            {note}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Memproses...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
