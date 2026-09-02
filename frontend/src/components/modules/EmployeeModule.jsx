import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/formatters';
import { Briefcase, UserCheck, Clock, CheckCircle2, UserX } from 'lucide-react';

export default function EmployeeModule() {
  const [employees, setEmployees] = useState([]);
  const [successMsg, setSuccessMsg] = useState(null);

  const loadData = async () => {
    try {
      const res = await api.getEmployees();
      if (res.success) setEmployees(res.employees);
    } catch (err) {
      console.error('Failed to load employees:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClockIn = async (id, name) => {
    try {
      await api.clockInEmployee(id);
      setSuccessMsg(`Absensi masuk ${name} berhasil dicatat.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Gagal mencatat absensi masuk');
    }
  };

  const handleClockOut = async (id, name) => {
    try {
      await api.clockOutEmployee(id);
      setSuccessMsg(`Absensi pulang ${name} berhasil dicatat.`);
      loadData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      alert('Gagal mencatat absensi pulang');
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-indigo">Modul #14</span>
            <span className="badge badge-success">{employees.length} Staf Karyawan</span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            👨‍💼 Data Karyawan, Gaji & Absensi Presensi
          </h2>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-responsive" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {employees.map(emp => (
          <div key={emp.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className="badge badge-indigo">{emp.employeeCode}</span>
                <span className={`badge ${emp.todayAttendance === 'HADIR' ? 'badge-success' : 'badge-warning'}`}>
                  {emp.todayAttendance}
                </span>
              </div>

              <h3 style={{ margin: '0 0 2px 0', fontSize: '1.1rem', fontWeight: 700 }}>{emp.name}</h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--emerald-500)', fontWeight: 600, marginBottom: '8px' }}>
                {emp.position} ({emp.department})
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>Gaji Pokok: <b>{formatRupiah(emp.basicSalary)}</b></div>
                <div>Komisi Penjualan: <b>{emp.commissionRate}%</b></div>
                <div>Jam Masuk / Keluar: <b>{emp.clockInTime || '-'} s/d {emp.clockOutTime || '-'}</b></div>
              </div>
            </div>

            <div style={{ paddingTop: '14px', marginTop: '14px', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleClockIn(emp.id, emp.name)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '6px 8px', fontSize: '0.75rem' }}
              >
                <Clock size={13} /> Clock-In
              </button>
              <button
                onClick={() => handleClockOut(emp.id, emp.name)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '6px 8px', fontSize: '0.75rem' }}
              >
                <CheckCircle2 size={13} /> Clock-Out
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
