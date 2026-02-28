const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// GET /api/strategic-focus
router.get('/', async (req, res) => {
  try {
    const items = await prisma.strategicFocusItem.findMany({ orderBy: { display_order: 'asc' } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/strategic-focus
router.post('/', async (req, res) => {
  const { name, icon, color, value_pct, display_order } = req.body;
  try {
    const item = await prisma.strategicFocusItem.create({
      data: {
        name,
        icon:          icon          || '',
        color:         color         || '#10b981',
        value_pct:     value_pct     ?? 0,
        display_order: display_order ?? 0,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/strategic-focus/:id
router.put('/:id', async (req, res) => {
  const { name, icon, color, value_pct, display_order } = req.body;
  try {
    const item = await prisma.strategicFocusItem.update({
      where: { id: req.params.id },
      data: {
        name,
        icon:          icon          || '',
        color:         color         || '#10b981',
        value_pct:     value_pct     ?? 0,
        display_order: display_order ?? 0,
      },
    });
    res.json(item);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/strategic-focus/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.strategicFocusItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
