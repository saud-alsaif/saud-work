const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/tasks — create task (section_id in body)
router.post('/', async (req, res) => {
  const { section_id, title, type, bonus_weight, is_weekday_template, is_weekend_template, display_order } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO tasks
         (section_id, title, type, bonus_weight, is_weekday_template, is_weekend_template, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        section_id, title, type,
        type === 'bonus' ? (bonus_weight ?? 10) : null,
        is_weekday_template ?? false,
        is_weekend_template ?? false,
        display_order ?? 0,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req, res) => {
  const { title, type, bonus_weight, is_weekday_template, is_weekend_template, display_order } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE tasks
       SET title               = $1,
           type                = $2,
           bonus_weight        = $3,
           is_weekday_template = $4,
           is_weekend_template = $5,
           display_order       = $6
       WHERE id = $7 RETURNING *`,
      [
        title, type,
        type === 'bonus' ? (bonus_weight ?? 10) : null,
        is_weekday_template ?? false,
        is_weekend_template ?? false,
        display_order ?? 0,
        req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
