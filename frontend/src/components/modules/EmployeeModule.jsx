import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/formatters';
import Modal from '../common/Modal';
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  FileText,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  Sparkles,
  LayoutGrid,
  List,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  X,
  Printer,
  Building,
  Tag,
  Percent,
  User
} from 'lucide-react';

const DEPARTMENTS = ['Semua', 'Manajemen', 'Kasir', 'Dapur / Bar', 'Gudang', 'Operasional'];
const ATTENDANCE_STATUSES = [
  { value: 'ALL', label: 'Semua Status' },
  { value: 'HADIR', label: 'Hadir', badgeClass: 'badge-success' },
  { value: 'LIBUR', label: 'Libur / Off', badgeClass: 'badge-secondary' },
  { value: 'BELUM_ABSEN', label: 'Belum Absen', badgeClass: 'badge-warning' }
];

export default function EmployeeModule() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('Semua');
  const [selectedAttendance, setSelectedAttendance] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Toast message
  const [toast, setToast] = useState(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialForm = {
    employeeCode: '',
    name: '',
    position: '',
    department: 'Kasir',
    phone: '',
    email: '',
    basicSalary: '3800000',
    allowance: '500000',
    commissionRate: '1.5',
    todayAttendance: 'HADIR',
    bankAccount: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getEmployees();
      if (res && res.success && Array.isArray(res.employees)) {
        setEmployees(res.employees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch =
        (emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.employeeCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.position || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.phone || '').includes(searchQuery);

      const matchDept = selectedDept === 'Semua' || emp.department === selectedDept;
      const matchAttendance = selectedAttendance === 'ALL' || emp.todayAttendance === selectedAttendance;

      return matchSearch && matchDept && matchAttendance;
    });
  }, [employees, searchQuery, selectedDept, selectedAttendance]);

  // Statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const hadir = employees.filter(e => e.todayAttendance === 'HADIR').length;
    const libur = employees.filter(e => e.todayAttendance === 'LIBUR').length;
    const belum = employees.filter(e => e.todayAttendance === 'BELUM_ABSEN').length;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.basicSalary) || 0) + (Number(e.allowance) || 0), 0);
    return { total, hadir, libur, belum, totalPayroll };
  }, [employees]);

  // Handle Clock In
  const handleClockIn = async (id, name) => {
    try {
      const res = await api.clockInEmployee(id);
      showToast(`Absensi Masuk (${name}) berhasil dicatat pada ${res.employee.clockInTime}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Gagal mencatat absensi masuk', 'error');
    }
  };

  // Handle Clock Out
  const handleClockOut = async (id, name) => {
    try {
      const res = await api.clockOutEmployee(id);
      showToast(`Absensi Pulang (${name}) berhasil dicatat pada ${res.employee.clockOutTime}!`);
      loadData();
    } catch (err) {
      showToast(err.message || 'Gagal mencatat absensi pulang', 'error');
    }
  };

  // Open Form Modal for Create
  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      ...initialForm,
      employeeCode: `EMP-${String(employees.length + 1).padStart(3, '0')}`
    });
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      employeeCode: emp.employeeCode || '',
      name: emp.name || '',
      position: emp.position || '',
      department: emp.department || 'Kasir',
      phone: emp.phone || '',
      email: emp.email || '',
      basicSalary: String(emp.basicSalary || '3500000'),
      allowance: String(emp.allowance || '500000'),
      commissionRate: String(emp.commissionRate || '1.5'),
      todayAttendance: emp.todayAttendance || 'HADIR',
      bankAccount: emp.bankAccount || ''
    });
    setIsFormModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Nama karyawan wajib diisi', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, formData);
        showToast(`Data staf ${formData.name} berhasil diperbarui!`);
      } else {
        await api.createEmployee(formData);
        showToast(`Staf baru ${formData.name} berhasil ditambahkan ke sistem!`);
      }
      setIsFormModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan saat menyimpan data', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteEmployee = async (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data karyawan "${name}"?`)) {
      try {
        await api.deleteEmployee(id);
        showToast(`Data karyawan ${name} berhasil dihapus.`);
        loadData();
      } catch (err) {
        showToast(err.message || 'Gagal menghapus karyawan', 'error');
      }
    }
  };

  // Open Payslip Modal
  const handleOpenPayslip = (emp) => {
    setSelectedPayslipEmp(emp);
    setIsPayslipModalOpen(true);
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* TOAST ALERT */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 100,
          padding: '12px 20px',
          borderRadius: '12px',
          background: toast.type === 'error' ? 'linear-gradient(135deg, #ef4444, #b91c1c)' : 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          animation: 'slideInRight 0.25s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="glass-panel" style={{
        padding: '24px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(16, 185, 129, 0.06))'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="badge badge-indigo" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              Modul #14
            </span>
            <span className="badge badge-success" style={{ padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              SDM & Human Resources
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.625rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
             Manajemen Staf, Karyawan & Presensi
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Kelola data staf toko, shift presensi jam masuk/keluar, struktur departemen & estimasi penggajian
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary"
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px var(--emerald-glow)'
            }}
          >
            <Plus size={18} />
            <span>Tambah Staf Baru</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px'
      }}>
        {/* Card 1: Total Staf */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(99, 102, 241, 0.14)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6366f1'
          }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Staf
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {stats.total} Orang
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>
              100% Terdaftar Aktif
            </div>
          </div>
        </div>

        {/* Card 2: Hadir Hari Ini */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <UserCheck size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Hadir Hari Ini
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              {stats.hadir} Hadir
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
              Tingkat hadir: {stats.total > 0 ? Math.round((stats.hadir / stats.total) * 100) : 0}%
            </div>
          </div>
        </div>

        {/* Card 3: Libur / Belum Absen */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.14)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <Clock size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Libur / Belum Absen
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
              {stats.libur + stats.belum} Staf
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
              {stats.libur} Libur • {stats.belum} Menunggu
            </div>
          </div>
        </div>

        {/* Card 4: Estimasi Payroll */}
        <div className="glass-panel" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'rgba(14, 165, 233, 0.14)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0ea5e9'
          }}>
            <DollarSign size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Estimasi Payroll Bulanan
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {formatRupiah(stats.totalPayroll)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
              Gaji Pokok & Tunjangan
            </div>
          </div>
        </div>
      </div>

      {/* CONTROLS BAR: SEARCH, DEPT FILTER, ATTENDANCE FILTER, VIEW MODE */}
      <div className="glass-panel" style={{
        padding: '14px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        {/* Left: Search input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari staf (Nama, NIK, No. HP, Posisi)..."
            style={{ paddingLeft: '36px', height: '40px', fontSize: '0.84rem' }}
          />
        </div>

        {/* Middle: Department Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: selectedDept === dept ? 700 : 500,
                background: selectedDept === dept ? 'var(--emerald-500)' : 'var(--bg-tertiary)',
                color: selectedDept === dept ? '#ffffff' : 'var(--text-muted)',
                border: selectedDept === dept ? '1px solid var(--emerald-500)' : '1px solid var(--border-glass)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Right: Attendance Filter & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            className="input"
            value={selectedAttendance}
            onChange={(e) => setSelectedAttendance(e.target.value)}
            style={{ height: '40px', fontSize: '0.78rem', padding: '0 10px', minWidth: '130px' }}
          >
            {ATTENDANCE_STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-tertiary)',
            padding: '3px',
            borderRadius: '9px',
            border: '1px solid var(--border-glass)'
          }}>
            <button
              onClick={() => setViewMode('grid')}
              title="Tampilan Grid Kartu"
              style={{
                padding: '6px 9px',
                borderRadius: '6px',
                background: viewMode === 'grid' ? 'var(--bg-secondary)' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? 'var(--emerald-500)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel Rinci"
              style={{
                padding: '6px 9px',
                borderRadius: '6px',
                background: viewMode === 'table' ? 'var(--bg-secondary)' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? 'var(--emerald-500)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT: GRID CARDS OR TABLE */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Memuat data staf karyawan...</div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 700 }}>Tidak ada staf yang cocok</h3>
          <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Coba ubah kata kunci pencarian atau sesuaikan filter departemen di atas.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '18px'
        }}>
          {filteredEmployees.map(emp => {
            const isHadir = emp.todayAttendance === 'HADIR';
            const isLibur = emp.todayAttendance === 'LIBUR';

            return (
              <div
                key={emp.id}
                className="glass-panel"
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-lg)',
                  border: isHadir ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-glass)',
                  background: isHadir
                    ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.04), rgba(15, 23, 42, 0.4))'
                    : 'var(--bg-secondary)',
                  position: 'relative',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Top Badges & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-indigo" style={{ fontWeight: 700 }}>
                        {emp.employeeCode}
                      </span>
                      <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                        {emp.department}
                      </span>
                    </div>

                    <span className={`badge ${isHadir ? 'badge-success' : isLibur ? 'badge-secondary' : 'badge-warning'}`} style={{ fontWeight: 700 }}>
                      {isHadir ? '● HADIR' : isLibur ? '○ LIBUR' : '⏱ BELUM ABSEN'}
                    </span>
                  </div>

                  {/* Employee Identity Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <img
                      src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                      alt={emp.name}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        border: '2px solid var(--emerald-500)',
                        background: 'var(--bg-tertiary)',
                        objectFit: 'cover'
                      }}
                    />
                    <div>
                      <h3 style={{ margin: '0 0 3px 0', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {emp.name}
                      </h3>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--emerald-500)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Briefcase size={13} />
                        <span>{emp.position}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-glass)',
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={13} style={{ color: 'var(--emerald-500)' }} />
                      <span>{emp.phone || '-'}</span>
                    </div>
                    {emp.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} style={{ color: 'var(--indigo-400)' }} />
                        <span>{emp.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Financial Details & Shift Attendance */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    marginBottom: '14px',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Gaji Pokok:</div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatRupiah(emp.basicSalary)}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Komisi Penjualan:</div>
                      <div style={{ fontWeight: 800, color: '#38bdf8' }}>{emp.commissionRate}% per sales</div>
                    </div>
                  </div>

                  {/* Attendance Times */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div>Masuk: <b style={{ color: 'var(--text-main)' }}>{emp.clockInTime || '-'}</b></div>
                    <div>Pulang: <b style={{ color: 'var(--text-main)' }}>{emp.clockOutTime || '-'}</b></div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div style={{
                  paddingTop: '16px',
                  marginTop: '16px',
                  borderTop: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* Clock In / Clock Out Quick Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleClockIn(emp.id, emp.name)}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        borderColor: 'rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Clock size={13} style={{ color: '#10b981' }} />
                      <span>Clock-In</span>
                    </button>
                    <button
                      onClick={() => handleClockOut(emp.id, emp.name)}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <CheckCircle2 size={13} style={{ color: '#ef4444' }} />
                      <span>Clock-Out</span>
                    </button>
                  </div>

                  {/* Secondary Tools: Slip Gaji, Edit, Delete */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleOpenPayslip(emp)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '6px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      title="Lihat Slip Gaji"
                    >
                      <FileText size={13} />
                      <span>Slip Gaji</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(emp)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                      title="Edit Data Staf"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '0.72rem', color: '#ef4444' }}
                      title="Hapus Staf"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="glass-panel" style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '14px 16px' }}>NIK & Nama</th>
                <th style={{ padding: '14px 16px' }}>Departemen & Jabatan</th>
                <th style={{ padding: '14px 16px' }}>Status Presensi</th>
                <th style={{ padding: '14px 16px' }}>Jam Masuk / Keluar</th>
                <th style={{ padding: '14px 16px' }}>Gaji Pokok</th>
                <th style={{ padding: '14px 16px' }}>Komisi Sales</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => {
                const isHadir = emp.todayAttendance === 'HADIR';
                const isLibur = emp.todayAttendance === 'LIBUR';

                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={emp.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`}
                          alt={emp.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{emp.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.employeeCode} • {emp.phone || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--emerald-500)' }}>{emp.position}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{emp.department}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${isHadir ? 'badge-success' : isLibur ? 'badge-secondary' : 'badge-warning'}`}>
                        {isHadir ? 'HADIR' : isLibur ? 'LIBUR' : 'BELUM ABSEN'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.78rem' }}>
                      <div>In: <b>{emp.clockInTime || '-'}</b></div>
                      <div>Out: <b>{emp.clockOutTime || '-'}</b></div>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                      {formatRupiah(emp.basicSalary)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#38bdf8' }}>
                      {emp.commissionRate}%
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleClockIn(emp.id, emp.name)}
                          className="btn-icon btn-secondary"
                          title="Clock-In"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <Clock size={14} style={{ color: '#10b981' }} />
                        </button>
                        <button
                          onClick={() => handleOpenPayslip(emp)}
                          className="btn-icon btn-secondary"
                          title="Slip Gaji"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <FileText size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="btn-icon btn-secondary"
                          title="Edit"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                          className="btn-icon btn-secondary"
                          title="Hapus"
                          style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT KARYAWAN */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingEmployee ? `Edit Data Staf: ${editingEmployee.name}` : 'Tambah Staf Karyawan Baru'}
        icon={UserCheck}
        maxWidth="720px"
      >
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SECTION 1: IDENTITAS & JABATAN */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
              <User size={16} style={{ color: 'var(--emerald-500)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Identitas Staf & Posisi Kerja
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">
                  <Tag size={13} style={{ color: 'var(--text-muted)' }} />
                  <span>NIK / Kode Staf</span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><Tag size={15} /></div>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="EMP-001"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={13} style={{ color: 'var(--emerald-500)' }} />
                  <span>Nama Lengkap Staf <b style={{ color: '#ef4444' }}>*</b></span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><User size={15} /></div>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: Dimas Prasetyo"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">
                  <Building size={13} style={{ color: 'var(--indigo-400)' }} />
                  <span>Departemen / Divisi</span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><Building size={15} /></div>
                  <select
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Kasir">Kasir & Front Office</option>
                    <option value="Manajemen">Manajemen & Supervisor</option>
                    <option value="Dapur / Bar">Dapur, Kitchen & Barista</option>
                    <option value="Gudang">Logistik & Gudang</option>
                    <option value="Operasional">Operasional Umum</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Briefcase size={13} style={{ color: 'var(--emerald-500)' }} />
                  <span>Jabatan / Posisi <b style={{ color: '#ef4444' }}>*</b></span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><Briefcase size={15} /></div>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="Contoh: Senior Cashier & POS Lead"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: KONTAK */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
              <Phone size={16} style={{ color: 'var(--emerald-500)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kontak & Komunikasi
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">
                  <Phone size={13} style={{ color: 'var(--emerald-500)' }} />
                  <span>Nomor Telepon / WhatsApp</span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><Phone size={15} /></div>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-3456-7890"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={13} style={{ color: 'var(--indigo-400)' }} />
                  <span>Alamat Email</span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><Mail size={15} /></div>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@posprima.id"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: PENGGAJIAN & KOMISI */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-glass)' }}>
              <DollarSign size={16} style={{ color: 'var(--emerald-500)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Kompensasi, Gaji & Rekening Payroll
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={13} style={{ color: 'var(--emerald-500)' }} />
                  <span>Gaji Pokok (Rp) <b style={{ color: '#ef4444' }}>*</b></span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><DollarSign size={15} /></div>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value })}
                    placeholder="3500000"
                    required
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--emerald-500)', fontWeight: 700, marginTop: '2px' }}>
                  {formatRupiah(formData.basicSalary || 0)}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={13} style={{ color: 'var(--indigo-400)' }} />
                  <span>Tunjangan Harian (Rp)</span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><DollarSign size={15} /></div>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.allowance}
                    onChange={(e) => setFormData({ ...formData, allowance: e.target.value })}
                    placeholder="500000"
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                  {formatRupiah(formData.allowance || 0)}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Percent size={13} style={{ color: '#0ea5e9' }} />
                  <span>Komisi Sales (%)</span>
                </label>
                <div className="input-with-icon">
                  <div className="input-icon-left"><Percent size={15} /></div>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                    placeholder="1.5"
                  />
                </div>
                <span style={{ fontSize: '0.72rem', color: '#0ea5e9', fontWeight: 600, marginTop: '2px' }}>
                  {formData.commissionRate || 0}% per produk
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <CreditCard size={13} style={{ color: 'var(--text-muted)' }} />
                <span>Rekening Bank Payroll</span>
              </label>
              <div className="input-with-icon">
                <div className="input-icon-left"><CreditCard size={15} /></div>
                <input
                  type="text"
                  className="form-input"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="Contoh: BCA - 8820192831 a/n Dimas Prasetyo"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: STATUS PRESENSI HARI INI */}
          <div style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-glass)',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <label className="form-label">
              <Clock size={15} style={{ color: 'var(--emerald-500)' }} />
              <span>Status Presensi Shift Hari Ini</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { id: 'HADIR', label: ' HADIR', desc: 'Aktif bertugas shift hari ini', color: '#10b981', border: '#059669', bg: 'rgba(16, 185, 129, 0.12)' },
                { id: 'BELUM_ABSEN', label: ' BELUM ABSEN', desc: 'Menunggu waktu masuk shift', color: '#f59e0b', border: '#d97706', bg: 'rgba(245, 158, 11, 0.12)' },
                { id: 'LIBUR', label: ' LIBUR / OFF', desc: 'Hari libur atau cuti staf', color: 'var(--text-muted)', border: 'var(--border-glass-strong)', bg: 'var(--bg-secondary)' }
              ].map(status => {
                const isSelected = formData.todayAttendance === status.id;
                return (
                  <div
                    key={status.id}
                    onClick={() => setFormData({ ...formData, todayAttendance: status.id })}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${status.border}` : '1px solid var(--border-glass)',
                      background: isSelected ? status.bg : 'var(--bg-secondary)',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: isSelected ? status.color : 'var(--text-main)', marginBottom: '3px' }}>
                      {status.label}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {status.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-glass)'
          }}>
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              className="btn btn-secondary"
              style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <X size={16} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.875rem',
                boxShadow: '0 4px 14px var(--emerald-glow)'
              }}
            >
              <CheckCircle2 size={17} />
              <span>{isSubmitting ? 'Menyimpan Data...' : editingEmployee ? 'Simpan Perubahan' : 'Tambahkan Staf Sekarang'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: PREVIEW SLIP GAJI */}
      <Modal
        isOpen={isPayslipModalOpen}
        onClose={() => setIsPayslipModalOpen(false)}
        title="Ringkasan Slip Gaji & Payroll Staf"
        icon={FileText}
        maxWidth="500px"
      >
        {selectedPayslipEmp && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-glass)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{selectedPayslipEmp.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {selectedPayslipEmp.employeeCode} • {selectedPayslipEmp.position} ({selectedPayslipEmp.department})
                  </div>
                </div>
                <span className="badge badge-success">Periode Berjalan</span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rekening: <b>{selectedPayslipEmp.bankAccount || 'Tunai / Cash'}</b>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.84rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Gaji Pokok:</span>
                <span style={{ fontWeight: 700 }}>{formatRupiah(selectedPayslipEmp.basicSalary)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tunjangan Kehadiran & Uang Makan:</span>
                <span style={{ fontWeight: 700 }}>{formatRupiah(selectedPayslipEmp.allowance || 500000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Estimasi Komisi Penjualan ({selectedPayslipEmp.commissionRate}%):</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>{formatRupiah((selectedPayslipEmp.basicSalary * selectedPayslipEmp.commissionRate) / 100)}</span>
              </div>

              <div style={{
                marginTop: '8px',
                paddingTop: '10px',
                borderTop: '1px dashed var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Total Take Home Pay:</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--emerald-500)' }}>
                  {formatRupiah(
                    (Number(selectedPayslipEmp.basicSalary) || 0) +
                    (Number(selectedPayslipEmp.allowance) || 500000) +
                    ((selectedPayslipEmp.basicSalary * selectedPayslipEmp.commissionRate) / 100)
                  )}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={15} /> Cetak Slip
              </button>
              <button
                onClick={() => setIsPayslipModalOpen(false)}
                className="btn btn-primary"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
