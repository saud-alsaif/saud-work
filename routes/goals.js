const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/goals?type=legacy|objectives2026
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const { rows } = type
      ? await db.query('SELECT * FROM goals WHERE goal_type = $1 ORDER BY created_at ASC', [type])
      : await db.query('SELECT * FROM goals ORDER BY goal_type ASC, created_at ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  const { goal_type, title, description, target_value, current_value, linked_sector } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO goals (goal_type, title, description, target_value, current_value, linked_sector)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [goal_type, title, description || null, target_value, current_value ?? 0, linked_sector || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id
router.put('/:id', async (req, res) => {
  const { goal_type, title, description, target_value, current_value, linked_sector } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE goals
       SET goal_type = $1, title = $2, description = $3,
           target_value = $4, current_value = $5, linked_sector = $6
       WHERE id = $7 RETURNING *`,
      [goal_type, title, description || null, target_value, current_value ?? 0, linked_sector || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM goals WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
