const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/completions/week/:date — completions for all 7 days of the week
router.get('/week/:date', async (req, res) => {
  try {
    // Get Mon–Sun range for the week containing :date
    const { rows } = await db.query(
      `SELECT tc.snapshot_date, tc.task_id, tc.completed,
              t.title, t.type, t.bonus_weight, t.section_id
       FROM task_completions tc
       JOIN tasks t ON t.id = tc.task_id
       WHERE tc.snapshot_date BETWEEN
           (DATE $1 - EXTRACT(DOW FROM DATE $1)::int * INTERVAL '1 day')
           AND
           (DATE $1 - EXTRACT(DOW FROM DATE $1)::int * INTERVAL '1 day' + INTERVAL '6 days')
       ORDER BY tc.snapshot_date ASC, t.display_order ASC`,
      [req.params.date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/completions/:date — all completions for a date (with task info)
router.get('/:date', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT tc.task_id, tc.completed,
              t.title, t.type, t.bonus_weight, t.section_id,
              t.is_weekday_template, t.is_weekend_template
       FROM task_completions tc
       JOIN tasks t ON t.id = tc.task_id
       WHERE tc.snapshot_date = $1
       ORDER BY t.display_order ASC`,
      [req.params.date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/completions/:date/:taskId — upsert completion status
router.put('/:date/:taskId', async (req, res) => {
  const { completed } = req.body;
  const { date, taskId } = req.params;
  try {
    // Ensure daily_snapshot row exists first
    await db.query(
      `INSERT INTO daily_snapshots (snapshot_date) VALUES ($1)
       ON CONFLICT (snapshot_date) DO NOTHING`,
      [date]
    );

    const { rows } = await db.query(
      `INSERT INTO task_completions (snapshot_date, task_id, completed)
       VALUES ($1, $2, $3)
       ON CONFLICT (snapshot_date, task_id) DO UPDATE SET completed = EXCLUDED.completed
       RETURNING *`,
      [date, taskId, completed ?? false]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
