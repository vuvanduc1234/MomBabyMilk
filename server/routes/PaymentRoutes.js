const express = require('express');
const router = express.Router();
const { momoNotify, vnpayReturn } = require('../controllers/CheckoutController');

/**
 * Payment callbacks - redirect to CheckoutController
 * These routes maintain backward compatibility with payment gateway configurations
 */

// MOMO IPN Callback
router.post('/momo-ipn', momoNotify);

// VNPAY Return URL
router.get('/vnpay-return', vnpayReturn);

module.exports = router;
