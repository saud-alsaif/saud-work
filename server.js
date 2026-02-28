require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
