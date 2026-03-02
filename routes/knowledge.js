const express = require('express');
const router  = express.Router();
const prisma  = require('../lib/prisma');
const logger  = require('../lib/logger');

// GET /api/knowledge?type=quote|book|note
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const items = await prisma.knowledgeItem.findMany({
      where:   type ? { type } : undefined,
      orderBy: type
        ? { created_at: 'desc' }
        : [{ type: 'asc' }, { created_at: 'desc' }],
    });
    res.json(items);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/knowledge
router.post('/', async (req, res) => {
  const { type, quote_text, quote_author, book_title, book_author, book_status, note_title, note_content } = req.body;
  try {
    const item = await prisma.knowledgeItem.create({
      data: {
        type,
        quote_text:   quote_text   || null,
        quote_author: quote_author || null,
        book_title:   book_title   || null,
        book_author:  book_author  || null,
        book_status:  book_status  || null,
        note_title:   note_title   || null,
        note_content: note_content || null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/knowledge/:id
router.put('/:id', async (req, res) => {
  const { type, quote_text, quote_author, book_title, book_author, book_status, note_title, note_content } = req.body;
  try {
    const item = await prisma.knowledgeItem.update({
      where: { id: req.params.id },
      data: {
        type,
        quote_text:   quote_text   || null,
        quote_author: quote_author || null,
        book_title:   book_title   || null,
        book_author:  book_author  || null,
        book_status:  book_status  || null,
        note_title:   note_title   || null,
        note_content: note_content || null,
      },
    });
    res.json(item);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/knowledge/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.knowledgeItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    logger.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
