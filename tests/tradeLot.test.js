const mongoose = require('mongoose');
const Trade = require('../src/models/Trade');
const Lot = require('../src/models/Lot');
const { createTrade } = require('../src/controllers/tradeController');

describe('Trade and Lot Management', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test_stock_trading', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterEach(async () => {
    await Trade.deleteMany({});
    await Lot.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('FIFO Lot Processing', async () => {
    // Buy 100 shares
    await createTrade({
      body: {
        stock_name: 'Apple',
        quantity: 100,
        broker_name: 'Broker A',
        price: 150,
      },
    }, { status: () => ({ json: () => {} }) });

    // Buy 200 shares
    await createTrade({
      body: {
        stock_name: 'Apple',
        quantity: 200,
        broker_name: 'Broker B',
        price: 160,
      },
    }, { status: () => ({ json: () => {} }) });

    // Sell 150 shares
    await createTrade({
      body: {
        stock_name: 'Apple',
        quantity: -150,
        broker_name: 'Broker A',
        price: 170,
      },
    }, { status: () => ({ json: () => {} }) });

    const lots = await Lot.find({ method: 'FIFO', stock_name: 'Apple' });
    
    expect(lots.length).toBe(2);
    expect(lots[0].lot_status).toBe('FULLY_REALIZED'); // First 100 shares
    expect(lots[1].lot_status).toBe('PARTIALLY_REALIZED'); // 50 shares realized from 200
    expect(lots[1].realized_quantity).toBe(50);
  });

  test('LIFO Lot Processing', async () => {
    // Buy 100 shares
    await createTrade({
      body: {
        stock_name: 'Apple',
        quantity: 100,
        broker_name: 'Broker A',
        price: 150,
      },
    }, { status: () => ({ json: () => {} }) });

    // Buy 200 shares
    await createTrade({
      body: {
        stock_name: 'Apple',
        quantity: 200,
        broker_name: 'Broker B',
        price: 160,
      },
    }, { status: () => ({ json: () => {} }) });

    // Sell 150 shares
    await createTrade({
      body: {
        stock_name: 'Apple',
        quantity: -150,
        broker_name: 'Broker A',
        price: 170,
      },
    }, { status: () => ({ json: () => {} }) });

    const lots = await Lot.find({ method: 'LIFO', stock_name: 'Apple' });
    
    expect(lots.length).toBe(2);
    expect(lots[0].lot_status).toBe('PARTIALLY_REALIZED'); // Last 200 shares, 150 realized
    expect(lots[0].realized_quantity).toBe(150);
    expect(lots[1].lot_status).toBe('OPEN'); // First 100 shares untouched
  });
});