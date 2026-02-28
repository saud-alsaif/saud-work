const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/sections — all sections with nested tasks
router.get('/', async (req, res) => {
  try {
    const sections = await db.query(
      'SELECT * FROM task_sections ORDER BY display_order ASC, created_at ASC'
    );
    const tasks = await db.query(
      'SELECT * FROM tasks ORDER BY display_order ASC, created_at ASC'
    );

    const tasksBySectionId = {};
    for (const task of tasks.rows) {
      if (!tasksBySectionId[task.section_id]) tasksBySectionId[task.section_id] = [];
      tasksBySectionId[task.section_id].push(task);
    }

    const result = sections.rows.map(s => ({
      ...s,
      tasks: tasksBySectionId[s.id] || [],
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sections
router.post('/', async (req, res) => {
  const { name, display_order } = req.body;
  try {
    const { rows } = await db.query(
      `INSERT INTO task_sections (name, display_order)
       VALUES ($1, $2) RETURNING *`,
      [name, display_order ?? 0]
    );
    res.status(201).json({ ...rows[0], tasks: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sections/:id
router.put('/:id', async (req, res) => {
  const { name, display_order } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE task_sections SET name = $1, display_order = $2
       WHERE id = $3 RETURNING *`,
      [name, display_order ?? 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sections/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM task_sections WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
