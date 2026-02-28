const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/strategic-focus
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM strategic_focus_items ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/strategic-focus
router.post('/', async (req, res) => {
  const { name, icon, color, value_pct, display_order } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO strategic_focus_items (name, icon, color, value_pct, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, icon || '', color || '#10b981', value_pct ?? 0, display_order ?? 0]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/strategic-focus/:id
router.put('/:id', async (req, res) => {
  const { name, icon, color, value_pct, display_order } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE strategic_focus_items
       SET name = $1, icon = $2, color = $3, value_pct = $4, display_order = $5
       WHERE id = $6 RETURNING *`,
      [name, icon || '', color || '#10b981', value_pct ?? 0, display_order ?? 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/strategic-focus/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM strategic_focus_items WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
