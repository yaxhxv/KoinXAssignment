// routes/trade.js
const express = require('express');
const Trade = require('../models/Trade');
const router = express.Router();

router.post('/balance', async (req, res) => {
  const { timestamp } = req.body;

  if (!timestamp) {
    return res.status(400).json({ error: 'Timestamp is required' });
  }

  try {
    const trades = await Trade.find({
      utcTime: { $lte: new Date(timestamp) },
    });

    const balance = {};

    trades.forEach((trade) => {
      const [baseCoin, quoteCoin] = trade.market.split('/');
      const amount = trade.buySellAmount;

      if (!balance[baseCoin]) {
        balance[baseCoin] = 0;
      }
      if (!balance[quoteCoin]) {
        balance[quoteCoin] = 0;
      }

      if (trade.operation === 'Buy') {
        balance[baseCoin] += amount;
      } else if (trade.operation === 'Sell') {
        balance[baseCoin] -= amount;
      }
    });

    res.json(balance);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
