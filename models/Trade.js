const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TradeSchema = new mongoose.Schema({
  trade_id: { type: String, required: true, unique: true, default: uuidv4 },
  stock_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  broker_name: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trade', TradeSchema);