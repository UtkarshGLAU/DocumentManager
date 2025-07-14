// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();
const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://your-frontend-url.vercel.app'
    : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 100MB.' 
    });
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected file field.' 
    });
  }
  if (error.message.includes('Only specific file types are allowed')) {
    return res.status(400).json({ 
      error: 'File type not allowed. Please upload: images, PDFs, documents, or spreadsheets.' 
    });
  }
  
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const docRoutes = require("./routes/document");
app.use("/api/docs", docRoutes);

// Keep static file serving for backward compatibility with local files
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('MongoDB URI is required. Please set MONGO_URI or MONGODB_URI environment variable.');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  // Removed deprecated options - they're no longer needed in modern MongoDB driver
}).then(() => {
  console.log("MongoDB Connected");
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
