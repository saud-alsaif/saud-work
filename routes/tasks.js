const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const logger  = require('../lib/logger');

// POST /api/tasks — create task (section_id in body)
router.post('/', async (req, res) => {
  const { section_id, title, type, bonus_weight, is_weekday_template, is_weekend_template, display_order } = req.body;
  try {
    const task = await prisma.task.create({
      data: {
        section_id,
        title,
        type,
        bonus_weight:        type === 'bonus' ? (bonus_weight ?? 10) : null,
        is_weekday_template: is_weekday_template ?? false,
        is_weekend_template: is_weekend_template ?? false,
        display_order:       display_order ?? 0,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', async (req, res) => {
  const { title, type, bonus_weight, is_weekday_template, is_weekend_template, display_order } = req.body;
  try {
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title,
        type,
        bonus_weight:        type === 'bonus' ? (bonus_weight ?? 10) : null,
        is_weekday_template: is_weekday_template ?? false,
        is_weekend_template: is_weekend_template ?? false,
        display_order:       display_order ?? 0,
      },
    });
    res.json(task);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
