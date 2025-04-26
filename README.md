# Stock Trading Web Portal Backend

## Overview
This is a Node.js backend for a Stock Trading Web Portal implementing trade management and lot tracking using FIFO and LIFO methods.

## Prerequisites
- Node.js (v22.13.1)
- MongoDB Atlas account
- npm

## Setup Instructions
1. Clone the repository:
```bash
git clone : https://github.com/jagats/fundtecbackend.git
cd stock-trading-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with:
```env
MONGODB_URI=mongodb+srv://jagatsinghsaatna:nZpiMuKfbVW8al4Y@cluster0.aeynocu.mongodb.net/stock_trading?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
```

4. Start the server:
```bash
npm start
```

## API Endpoints
### Trades
- `POST /api/trades` - Create a new trade
- `POST /api/trades/bulk` - Bulk create trades
- `GET /api/trades` - Get all trades
- `GET /api/trades/:id` - Get trade by ID
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade

### Lots
- `GET /api/lots` - Get all lots (optional query params: method, stock_name)
- `GET /api/lots/:id` - Get lot by ID

## Running Tests
```bash
npm test
```

## Deployment
1. Deploy to a platform like Render
2. Set environment variables in the deployment platform
3. Example deployment URL: `https://fundtecbackend-3.onrender.com`
4. Login credentials:
   - **Note**: This API does not implement authentication. No login credentials are required to access the endpoints. The API is openly accessible for testing purposes.

## Project Structure
```
backendfundtec/
├── controllers/
│   ├── tradeController.js
│   ├── lotController.js
├── models/
│   ├── Trade.js
│   ├── Lot.js
├── routes/
│   ├── tradeRoutes.js
│   ├── lotRoutes.js
├── index.js
├── tests/
│   ├── tradeLot.test.js
```