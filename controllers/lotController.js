const Lot = require('../models/Lot');

// Get all lots
exports.getAllLots = async (req, res) => {
  try {
    const { method, stock_name } = req.query;
    const query = {};
    if (method) query.method = method;
    if (stock_name) query.stock_name = stock_name;
    
    const lots = await Lot.find(query).sort({ timestamp: -1 });
    res.json(lots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lots', error: err.message });
  }
};

// Get lot by ID
exports.getLotById = async (req, res) => {
  try {
    const lot = await Lot.findOne({ lot_id: req.params.id });
    if (!lot) {
      return res.status(404).json({ message: 'Lot not found' });
    }
    res.json(lot);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lot', error: err.message });
  }
};