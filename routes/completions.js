const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

const toDateStr = (d) =>
  d instanceof Date ? d.toISOString().slice(0, 10) : d;

const flattenCompletion = (c) => {
  const { task, snapshot_date, ...rest } = c;
  return {
    snapshot_date: toDateStr(snapshot_date),
    ...rest,
    ...(task ? {
      title:               task.title,
      type:                task.type,
      bonus_weight:        task.bonus_weight,
      section_id:          task.section_id,
      is_weekday_template: task.is_weekday_template,
      is_weekend_template: task.is_weekend_template,
    } : {}),
  };
};

// GET /api/completions/week/:date
router.get('/week/:date', async (req, res) => {
  try {
    const d = new Date(req.params.date + 'T00:00:00Z');
    const dow = d.getUTCDay();
    const start = new Date(d);
    start.setUTCDate(d.getUTCDate() - dow);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    const completions = await prisma.taskCompletion.findMany({
      where: {
        snapshot_date: { gte: start, lte: end },
      },
      include: { task: true },
      orderBy: [{ snapshot_date: 'asc' }, { task: { display_order: 'asc' } }],
    });
    res.json(completions.map(flattenCompletion));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/completions/:date
router.get('/:date', async (req, res) => {
  try {
    const completions = await prisma.taskCompletion.findMany({
      where:   { snapshot_date: new Date(req.params.date) },
      include: { task: true },
      orderBy: { task: { display_order: 'asc' } },
    });
    res.json(completions.map(flattenCompletion));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/completions/:date/:taskId — upsert completion status
router.put('/:date/:taskId', async (req, res) => {
  const { completed } = req.body;
  const { date, taskId } = req.params;
  const snapshotDate = new Date(date);

  try {
    // Ensure daily_snapshot row exists first
    await prisma.dailySnapshot.upsert({
      where:  { snapshot_date: snapshotDate },
      update: {},
      create: { snapshot_date: snapshotDate },
    });

    const completion = await prisma.taskCompletion.upsert({
      where:  { snapshot_date_task_id: { snapshot_date: snapshotDate, task_id: taskId } },
      update: { completed: completed ?? false },
      create: { snapshot_date: snapshotDate, task_id: taskId, completed: completed ?? false },
    });
    res.json({ ...completion, snapshot_date: toDateStr(completion.snapshot_date) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
