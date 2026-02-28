const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM projects ORDER BY created_at ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  const { name, description, category, status, progress_pct } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO projects (name, description, category, status, progress_pct)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description || null, category || null, status || 'planning', progress_pct ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const { name, description, category, status, progress_pct } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE projects
       SET name = $1, description = $2, category = $3, status = $4, progress_pct = $5
       WHERE id = $6 RETURNING *`,
      [name, description || null, category || null, status, progress_pct ?? 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
