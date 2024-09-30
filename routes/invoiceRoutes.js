const express = require('express');
const { handleInvoiceAnalysis } = require('../controllers/invoiceController');

const router = express.Router();

// Define the route for analyzing invoices
router.post('/analyze-invoice', handleInvoiceAnalysis);

module.exports = router;
