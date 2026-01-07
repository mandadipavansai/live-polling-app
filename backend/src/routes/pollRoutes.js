const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

router.get('/history', pollController.getPollHistory);
router.delete('/history', pollController.clearHistory); // <--- NEW LINE

module.exports = router;