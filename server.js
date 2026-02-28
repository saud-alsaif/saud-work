require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const morgan  = require('morgan');
const logger  = require('./lib/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Serve the dashboard HTML
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api/snapshots',       require('./routes/snapshots'));
app.use('/api/projects',        require('./routes/projects'));
app.use('/api/sections',        require('./routes/sections'));
app.use('/api/tasks',           require('./routes/tasks'));
app.use('/api/completions',     require('./routes/completions'));
app.use('/api/strategic-focus', require('./routes/strategic-focus'));
app.use('/api/goals',           require('./routes/goals'));
app.use('/api/knowledge',       require('./routes/knowledge'));

// Fallback: serve the dashboard for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_business.html'));
});

// Global error handler
app.use((err, req, res, _next) => {
  logger.error(`Unhandled error on ${req.method} ${req.path}:`, err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
