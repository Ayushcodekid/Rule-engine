const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');  // Import the database connection
const rulesRouter = require('./routes/router');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();  // Use the function to connect to MongoDB

// Routes
app.use('/api/rules', rulesRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
