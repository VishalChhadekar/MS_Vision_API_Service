const express = require('express');
require('dotenv').config();  // Load .env file
const invoiceRoutes = require('./routes/invoiceRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', invoiceRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
