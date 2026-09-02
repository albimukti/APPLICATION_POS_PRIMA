const express = require('express');
const router = express.Router();
const dataStore = require('../services/dataStore');
const { authenticateToken } = require('../middleware/auth');
const { requireModuleActive } = require('../middleware/moduleGuard');

// GET /api/loyalty/rewards
router.get('/rewards', authenticateToken, requireModuleActive('loyalty'), (req, res) => {
  res.json({
    success: true,
    rewards: dataStore.getLoyaltyRewards(),
    tiers: [
      { name: 'Bronze', minSpend: 0, multiplier: '1x', badgeColor: '#b45309' },
      { name: 'Silver', minSpend: 500000, multiplier: '1.2x', badgeColor: '#94a3b8' },
      { name: 'Gold', minSpend: 2000000, multiplier: '1.5x', badgeColor: '#eab308' },
      { name: 'Platinum', minSpend: 5000000, multiplier: '2.0x', badgeColor: '#a855f7' }
    ]
  });
});

// POST /api/loyalty/redeem
router.post('/redeem', authenticateToken, requireModuleActive('loyalty'), (req, res) => {
  try {
    const { customerId, rewardId } = req.body;
    if (!customerId || !rewardId) {
      return res.status(400).json({ success: false, message: 'ID member dan ID reward wajib disertakan' });
    }
    const result = dataStore.redeemReward(customerId, rewardId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
