const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { initDatabase } = require('./database/init_db');

const authRoutes = require('./routes/authRoutes');
const settingRoutes = require('./routes/settingRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const noteRoutes = require('./routes/noteRoutes');
const storyRoutes = require('./routes/storyRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const eventRoutes = require('./routes/eventRoutes');
const secretRoutes = require('./routes/secretRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: [frontendOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/media', mediaRoutes); // Protected private media stream!
app.use('/api/notes', noteRoutes);
app.use('/api/story', storyRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/secret', secretRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Our Little World Backend is running smoothly ❤️' });
});

// Serve the Vite build when the backend is deployed as a single Render service.
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(frontendDist, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected server error occurred.',
  });
});

// Initialize database and launch server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`❤️  Our Little World API Server running on port ${PORT}`);
    console.log(`🔒  Private Media Protection: ENABLED`);
    console.log(`==================================================\n`);
  });
}).catch(err => {
  console.error('Failed to start server due to DB initialization failure:', err);
});
