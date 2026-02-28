const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// GET /api/sections — all sections with nested tasks
router.get('/', async (req, res) => {
  try {
    const sections = await prisma.taskSection.findMany({
      orderBy: [{ display_order: 'asc' }, { created_at: 'asc' }],
      include: {
        tasks: { orderBy: [{ display_order: 'asc' }, { created_at: 'asc' }] },
      },
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sections
router.post('/', async (req, res) => {
  const { name, display_order } = req.body;
  try {
    const section = await prisma.taskSection.create({
      data: { name, display_order: display_order ?? 0 },
    });
    res.status(201).json({ ...section, tasks: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sections/:id
router.put('/:id', async (req, res) => {
  const { name, display_order } = req.body;
  try {
    const section = await prisma.taskSection.update({
      where: { id: req.params.id },
      data:  { name, display_order: display_order ?? 0 },
    });
    res.json(section);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sections/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.taskSection.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
