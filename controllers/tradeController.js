const Trade = require('../models/Trade');
const Lot = require('../models/Lot');

// Create a single trade
exports.createTrade = async (req, res) => {
  try {
    const { stock_name, quantity, broker_name, price } = req.body;
    const amount = quantity * price;
    
    const trade = new Trade({
      stock_name,
      quantity,
      broker_name,
      price,
      amount,
    });

    await trade.save();

    // Process lots for both FIFO and LIFO
    if (quantity > 0) {
      // Create lots for buy trades
      await Promise.all([
        createLot(trade, 'FIFO'),
        createLot(trade, 'LIFO'),
      ]);
    } else {
      // Process sell trades
      await Promise.all([
        processLots(trade, 'FIFO'),
        processLots(trade, 'LIFO'),
      ]);
    }

    res.status(201).json(trade);
  } catch (err) {
    res.status(400).json({ message: 'Error creating trade', error: err.message });
  }
};

// Bulk create trades
exports.bulkCreateTrades = async (req, res) => {
  try {
    const tradesData = req.body;
    const trades = [];
    
    for (const tradeData of tradesData) {
      const { stock_name, quantity, broker_name, price } = tradeData;
      const amount = quantity * price;
      
      const trade = new Trade({
        stock_name,
        quantity,
        broker_name,
        price,
        amount,
      });
      
      await trade.save();
      trades.push(trade);

      // Process lots
      if (quantity > 0) {
        await Promise.all([
          createLot(trade, 'FIFO'),
          createLot(trade, 'LIFO'),
        ]);
      } else {
        await Promise.all([
          processLots(trade, 'FIFO'),
          processLots(trade, 'LIFO'),
        ]);
      }
    }

    res.status(201).json(trades);
  } catch (err) {
    res.status(400).json({ message: 'Error bulk creating trades', error: err.message });
  }
};

// Get all trades
exports.getAllTrades = async (req, res) => {
  try {
    const trades = await Trade.find().sort({ timestamp: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trades', error: err.message });
  }
};

// Get trade by ID
exports.getTradeById = async (req, res) => {
  try {
    const trade = await Trade.findOne({ trade_id: req.params.id });
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trade', error: err.message });
  }
};

// Update trade
exports.updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndUpdate(
      { trade_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json(trade);
  } catch (err) {
    res.status(400).json({ message: 'Error updating trade', error: err.message });
  }
};

// Delete trade
exports.deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findOneAndDelete({ trade_id: req.params.id });
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    // Delete associated lots
    await Lot.deleteMany({ trade_id: trade.trade_id });
    res.json({ message: 'Trade deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting trade', error: err.message });
  }
};

// Helper function to create lot
async function createLot(trade, method) {
  const lot = new Lot({
    trade_id: trade.trade_id,
    stock_name: trade.stock_name,
    lot_quantity: trade.quantity,
    method,
  });
  await lot.save();
}

// Helper function to process lots for sell trades
async function processLots(trade, method) {
  const { stock_name, quantity, trade_id } = trade;
  const sortOrder = method === 'FIFO' ? 'asc' : 'desc';
  const lots = await Lot.find({
    stock_name,
    method,
    lot_status: { $in: ['OPEN', 'PARTIALLY_REALIZED'] },
  }).sort({ timestamp: sortOrder });

  let remainingSellQuantity = Math.abs(quantity);

  for (const lot of lots) {
    if (remainingSellQuantity <= 0) break;

    const availableQuantity = lot.lot_quantity - lot.realized_quantity;
    const quantityToRealize = Math.min(availableQuantity, remainingSellQuantity);

    lot.realized_quantity += quantityToRealize;
    lot.realized_trade_id = trade_id;
    lot.lot_status = lot.realized_quantity === lot.lot_quantity 
      ? 'FULLY_REALIZED' 
      : 'PARTIALLY_REALIZED';

    remainingSellQuantity -= quantityToRealize;
    await lot.save();
  }

  if (remainingSellQuantity > 0) {
    throw new Error('Insufficient stock quantity to sell');
  }
}