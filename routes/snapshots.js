const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

const EMPTY_SNAPSHOT = {
  productivity_pct: 0, projects_pct: 0, satisfaction_pts: 0, week_tracker_pct: 0,
  wheel_career: 0, wheel_finance: 0, wheel_health: 0, wheel_spirituality: 0,
  wheel_social: 0, wheel_cultural: 0, wheel_recreation: 0, wheel_avg_score: 0,
  health_water_liters: 0, health_workout_minutes: 0, health_sleep_hours: 0,
  health_nutrition_score: 0, health_overall_score: 0, daily_satisfaction_score: 0,
};

const toDateStr = (d) =>
  d instanceof Date ? d.toISOString().slice(0, 10) : d;

const withComputedFields = (s) => {
  const avg = (s.wheel_career + s.wheel_finance + s.wheel_health + s.wheel_spirituality +
               s.wheel_social + s.wheel_cultural + s.wheel_recreation) / 7;
  return {
    ...s,
    snapshot_date: toDateStr(s.snapshot_date),
    wheel_avg_score: Math.round(avg * 100) / 100,
  };
};

// GET /api/snapshots — list all dates
router.get('/', async (req, res) => {
  try {
    const rows = await prisma.dailySnapshot.findMany({
      select: { snapshot_date: true },
      orderBy: { snapshot_date: 'desc' },
    });
    res.json(rows.map(r => toDateStr(r.snapshot_date)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/snapshots/:date
router.get('/:date', async (req, res) => {
  try {
    const snapshot = await prisma.dailySnapshot.findUnique({
      where: { snapshot_date: new Date(req.params.date) },
    });
    res.json(snapshot ? withComputedFields(snapshot) : { snapshot_date: req.params.date, ...EMPTY_SNAPSHOT });
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

  const data = {
    productivity_pct:         productivity_pct ?? 0,
    projects_pct:             projects_pct ?? 0,
    satisfaction_pts:         satisfaction_pts ?? 0,
    week_tracker_pct:         week_tracker_pct ?? 0,
    wheel_career:             wheel_career ?? 0,
    wheel_finance:            wheel_finance ?? 0,
    wheel_health:             wheel_health ?? 0,
    wheel_spirituality:       wheel_spirituality ?? 0,
    wheel_social:             wheel_social ?? 0,
    wheel_cultural:           wheel_cultural ?? 0,
    wheel_recreation:         wheel_recreation ?? 0,
    health_water_liters:      health_water_liters ?? 0,
    health_workout_minutes:   health_workout_minutes ?? 0,
    health_sleep_hours:       health_sleep_hours ?? 0,
    health_nutrition_score:   health_nutrition_score ?? 0,
    health_overall_score:     health_overall_score ?? 0,
    daily_satisfaction_score: daily_satisfaction_score ?? 0,
  };

  try {
    const snapshot = await prisma.dailySnapshot.upsert({
      where:  { snapshot_date: new Date(req.params.date) },
      update: data,
      create: { snapshot_date: new Date(req.params.date), ...data },
    });
    res.json(withComputedFields(snapshot));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
