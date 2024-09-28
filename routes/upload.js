const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const Trade = require('../models/Trade');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// POST /api/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const trades = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      try {
        const [baseCoin, quoteCoin] = row.Market.split('/');
        const trade = {
          userId: Number(row.User_ID),
          utcTime: new Date(row.UTC_Time),
          operation: row.Operation,
          baseCoin: baseCoin.trim(),
          quoteCoin: quoteCoin.trim(),
          amount: parseFloat(row['Buy/Sell Amount']),
          price: parseFloat(row.Price)
        };
        trades.push(trade);
      } catch (err) {
        console.error('Error parsing row:', err.message);
      }
    })
    .on('end', async () => {
      try {
        await Trade.insertMany(trades);
        // Optionally delete the file after processing
        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'Trades stored successfully!', count: trades.length });
      } catch (err) {
        console.error('Error inserting trades into DB:', err.message);
        res.status(500).json({ error: 'Error storing trades' });
      }
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err.message);
      res.status(500).json({ error: 'Error processing file' });
    });
});

module.exports = router;
