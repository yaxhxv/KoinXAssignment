const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  utcTime: { type: Date, required: true },
  operation: { type: String, enum: ['Buy', 'Sell'], required: true },
  baseCoin: { type: String, required: true },
  quoteCoin: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('Trade', tradeSchema);
