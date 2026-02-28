const express = require('express');
const router  = express.Router();
const db      = require('../db');

const EMPTY_SNAPSHOT = {
  productivity_pct: 0, projects_pct: 0, satisfaction_pts: 0, week_tracker_pct: 0,
  wheel_career: 0, wheel_finance: 0, wheel_health: 0, wheel_spirituality: 0,
  wheel_social: 0, wheel_cultural: 0, wheel_recreation: 0, wheel_avg_score: 0,
  health_water_liters: 0, health_workout_minutes: 0, health_sleep_hours: 0,
  health_nutrition_score: 0, health_overall_score: 0, daily_satisfaction_score: 0,
};

// GET /api/snapshots — list all dates that have snapshots
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT snapshot_date FROM daily_snapshots ORDER BY snapshot_date DESC'
    );
    res.json(rows.map(r => r.snapshot_date));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/snapshots/:date — get snapshot for a date (returns defaults if none)
router.get('/:date', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM daily_snapshots WHERE snapshot_date = $1',
      [req.params.date]
    );
    res.json(rows[0] || { snapshot_date: req.params.date, ...EMPTY_SNAPSHOT });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/snapshots/:date — upsert snapshot
router.put('/:date', async (req, res) => {
  const {
    productivity_pct, projects_pct, satisfaction_pts, week_tracker_pct,
    wheel_career, wheel_finance, wheel_health, wheel_spirituality,
    wheel_social, wheel_cultural, wheel_recreation,
    health_water_liters, health_workout_minutes, health_sleep_hours,
    health_nutrition_score, health_overall_score,
    daily_satisfaction_score,
  } = req.body;

  try {
    const { rows } = await db.query(
      `INSERT INTO daily_snapshots (
         snapshot_date,
         productivity_pct, projects_pct, satisfaction_pts, week_tracker_pct,
         wheel_career, wheel_finance, wheel_health, wheel_spirituality,
         wheel_social, wheel_cultural, wheel_recreation,
         health_water_liters, health_workout_minutes, health_sleep_hours,
         health_nutrition_score, health_overall_score,
         daily_satisfaction_score
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       ON CONFLICT (snapshot_date) DO UPDATE SET
         productivity_pct         = EXCLUDED.productivity_pct,
         projects_pct             = EXCLUDED.projects_pct,
         satisfaction_pts         = EXCLUDED.satisfaction_pts,
         week_tracker_pct         = EXCLUDED.week_tracker_pct,
         wheel_career             = EXCLUDED.wheel_career,
         wheel_finance            = EXCLUDED.wheel_finance,
         wheel_health             = EXCLUDED.wheel_health,
         wheel_spirituality       = EXCLUDED.wheel_spirituality,
         wheel_social             = EXCLUDED.wheel_social,
         wheel_cultural           = EXCLUDED.wheel_cultural,
         wheel_recreation         = EXCLUDED.wheel_recreation,
         health_water_liters      = EXCLUDED.health_water_liters,
         health_workout_minutes   = EXCLUDED.health_workout_minutes,
         health_sleep_hours       = EXCLUDED.health_sleep_hours,
         health_nutrition_score   = EXCLUDED.health_nutrition_score,
         health_overall_score     = EXCLUDED.health_overall_score,
         daily_satisfaction_score = EXCLUDED.daily_satisfaction_score,
         updated_at               = now()
       RETURNING *`,
      [
        req.params.date,
        productivity_pct ?? 0, projects_pct ?? 0, satisfaction_pts ?? 0, week_tracker_pct ?? 0,
        wheel_career ?? 0, wheel_finance ?? 0, wheel_health ?? 0, wheel_spirituality ?? 0,
        wheel_social ?? 0, wheel_cultural ?? 0, wheel_recreation ?? 0,
        health_water_liters ?? 0, health_workout_minutes ?? 0, health_sleep_hours ?? 0,
        health_nutrition_score ?? 0, health_overall_score ?? 0,
        daily_satisfaction_score ?? 0,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
