require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const uploadRoute = require('./routes/upload');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api', uploadRoute);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
