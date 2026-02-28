const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

const withProgressPct = (goal) => {
  const target  = Number(goal.target_value);
  const current = Number(goal.current_value);
  const pct     = target === 0 ? 0 : Math.min((current / target) * 100, 100);
  return { ...goal, progress_pct: Math.round(pct * 100) / 100 };
};

// GET /api/goals?type=legacy|objectives2026
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const goals = await prisma.goal.findMany({
      where:   type ? { goal_type: type } : undefined,
      orderBy: type
        ? { created_at: 'asc' }
        : [{ goal_type: 'asc' }, { created_at: 'asc' }],
    });
    res.json(goals.map(withProgressPct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/goals
router.post('/', async (req, res) => {
  const { goal_type, title, description, target_value, current_value, linked_sector } = req.body;
  try {
    const goal = await prisma.goal.create({
      data: {
        goal_type,
        title,
        description:   description   || null,
        target_value,
        current_value: current_value ?? 0,
        linked_sector: linked_sector || null,
      },
    });
    res.status(201).json(withProgressPct(goal));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/goals/:id
router.put('/:id', async (req, res) => {
  const { goal_type, title, description, target_value, current_value, linked_sector } = req.body;
  try {
    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data: {
        goal_type,
        title,
        description:   description   || null,
        target_value,
        current_value: current_value ?? 0,
        linked_sector: linked_sector || null,
      },
    });
    res.json(withProgressPct(goal));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.goal.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
