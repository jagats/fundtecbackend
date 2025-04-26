const express = require('express');
const router = express.Router();
const lotController = require('../controllers/lotController');

router.get('/', lotController.getAllLots);
router.get('/:id', lotController.getLotById);

module.exports = router;