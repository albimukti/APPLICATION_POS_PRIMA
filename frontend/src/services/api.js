const API_BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('pos_token');
  const demoRole = localStorage.getItem('pos_demo_role');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(demoRole ? { 'x-demo-role': demoRole } : {}),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth (#13)
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  switchRole: (role) => request('/auth/switch-role', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Modules (#16)
  getModules: () => request('/modules'),
  toggleModule: (moduleId, isActive, reason) => request('/modules/toggle', { method: 'POST', body: JSON.stringify({ moduleId, isActive, reason }) }),
  applyPreset: (preset) => request('/modules/preset', { method: 'POST', body: JSON.stringify({ preset }) }),
  getModuleHistory: () => request('/modules/history'),
  getSnapshotUrl: (snapshotId) => `${API_BASE_URL}/modules/snapshot/${snapshotId}`,

  // Products (#3)
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },
  getProductCategories: () => request('/products/categories'),
  createProduct: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  // Transactions (#1)
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },
  getTransaction: (id) => request(`/transactions/${id}`),
  createTransaction: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  voidTransaction: (id, reason) => request(`/transactions/${id}/void`, { method: 'POST', body: JSON.stringify({ reason }) }),

  // Inventory (#2)
  getInventory: () => request('/inventory'),
  getInventoryLogs: () => request('/inventory/logs'),
  adjustStock: (data) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),

  // Customers (#4)
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Payments (#5)
  getPaymentMethods: () => request('/payments/methods'),
  togglePaymentMethod: (id) => request(`/payments/methods/${id}/toggle`, { method: 'PUT' }),

  // Promos (#6)
  getPromos: () => request('/promos'),
  validatePromo: (code, orderAmount) => request('/promos/validate', { method: 'POST', body: JSON.stringify({ code, orderAmount }) }),
  createPromo: (data) => request('/promos', { method: 'POST', body: JSON.stringify(data) }),
  togglePromo: (id) => request(`/promos/${id}/toggle`, { method: 'PUT' }),

  // Reports (#7)
  getReportSummary: () => request('/reports/summary'),
  getCashierPerformance: () => request('/reports/cashiers'),

  // Users (#8)
  getUsers: () => request('/users'),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  toggleUserStatus: (id) => request(`/users/${id}/toggle-status`, { method: 'PUT' }),

  // Shifts (#9)
  getActiveShift: () => request('/shifts/active'),
  getAllShifts: () => request('/shifts'),
  openShift: (startingCash, notes) => request('/shifts/open', { method: 'POST', body: JSON.stringify({ startingCash, notes }) }),
  closeShift: (shiftId, actualCash, notes) => request(`/shifts/${shiftId}/close`, { method: 'POST', body: JSON.stringify({ actualCash, notes }) }),

  // Receipts (#10)
  getReceiptTemplate: () => request('/receipts/template'),
  getReceiptData: (inv) => request(`/receipts/${inv}`),

  // Loyalty (#11)
  getLoyaltyRewards: () => request('/loyalty/rewards'),
  redeemLoyaltyReward: (customerId, rewardId) => request('/loyalty/redeem', { method: 'POST', body: JSON.stringify({ customerId, rewardId }) }),

  // Settings (#12)
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getBackupExportUrl: () => `${API_BASE_URL}/settings/backup/export`,

  // Employees (#14)
  getEmployees: () => request('/employees'),
  clockInEmployee: (id) => request(`/employees/${id}/clock-in`, { method: 'POST' }),
  clockOutEmployee: (id) => request(`/employees/${id}/clock-out`, { method: 'POST' }),

  // Notifications (#15)
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),

  // Audit Logs (Admin Only)
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  },
  createAuditLog: (data) => request('/audit-logs', { method: 'POST', body: JSON.stringify(data) }),
  clearAuditLogs: () => request('/audit-logs', { method: 'DELETE' }),

  // Approvals (Admin & Cashier RBAC)
  getApprovals: () => request('/approvals'),
  requestApproval: (data) => request('/approvals/request', { method: 'POST', body: JSON.stringify(data) }),
  approveRequest: (id, notes = '') => request(`/approvals/${id}/approve`, { method: 'POST', body: JSON.stringify({ notes }) }),
  rejectRequest: (id, reason = '') => request(`/approvals/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) })
};
