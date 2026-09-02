const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/approvals — Get list of approvals based on role
router.get('/', authenticateToken, (req, res) => {
  try {
    const list = dataStore.getApprovals(req.user);
    res.json({
      success: true,
      count: list.length,
      approvals: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/approvals/request — Submit a new approval request
router.post('/request', authenticateToken, (req, res) => {
  try {
    const { type, title, data, details, requiredRole } = req.body;
    const approval = dataStore.createApprovalRequest({
      type,
      title,
      requesterName: req.user.name,
      requesterRole: req.user.role,
      requesterId: req.user.id,
      data,
      details,
      requiredRole
    });
    res.status(201).json({ success: true, message: 'Permohonan persetujuan berhasil diajukan', approval });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/approvals/:id/approve — Approve request
router.post('/:id/approve', authenticateToken, (req, res) => {
  try {
    const { notes } = req.body;
    const approval = dataStore.approveRequest(req.params.id, req.user, notes);
    res.json({ success: true, message: 'Permohonan berhasil disetujui (APPROVED)', approval });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/approvals/:id/reject — Reject request
router.post('/:id/reject', authenticateToken, (req, res) => {
  try {
    const { reason } = req.body;
    const approval = dataStore.rejectRequest(req.params.id, req.user, reason);
    res.json({ success: true, message: 'Permohonan telah ditolak (REJECTED)', approval });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
