const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const LotSchema = new mongoose.Schema({
  lot_id: { type: String, required: true, unique: true, default: uuidv4 },
  trade_id: { type: String, required: true },
  stock_name: { type: String, required: true },
  lot_quantity: { type: Number, required: true },
  realized_quantity: { type: Number, default: 0 },
  realized_trade_id: { type: String, default: null },
  lot_status: { 
    type: String, 
    enum: ['OPEN', 'PARTIALLY_REALIZED', 'FULLY_REALIZED'], 
    default: 'OPEN' 
  },
  method: { type: String, enum: ['FIFO', 'LIFO'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lot', LotSchema);