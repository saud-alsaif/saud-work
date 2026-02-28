const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { created_at: 'asc' } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  const { name, description, category, status, progress_pct } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description:  description  || null,
        category:     category     || null,
        status:       status       || 'planning',
        progress_pct: progress_pct ?? 0,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  const { name, description, category, status, progress_pct } = req.body;
  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name,
        description:  description  || null,
        category:     category     || null,
        status,
        progress_pct: progress_pct ?? 0,
      },
    });
    res.json(project);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
