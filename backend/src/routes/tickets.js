const express = require('express');
const crypto = require('crypto');
const { run, get, all } = require('../db');

const router = express.Router();

const STATUSES = ['Pending', 'Sent', 'In Progress', 'Completed', 'Rejected', 'Approved'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', wrap(async (req, res) => {
  const { status } = req.query;
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }
  const rows = status
    ? await all('SELECT * FROM Tickets WHERE status = ? ORDER BY id DESC', [status])
    : await all('SELECT * FROM Tickets ORDER BY id DESC');
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const { photo_id, style, priority = 'Normal', partner } = req.body || {};
  if (!photo_id || !style || !partner) {
    return res.status(400).json({ error: 'photo_id, style and partner are required' });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `priority must be one of: ${PRIORITIES.join(', ')}` });
  }
  const { lastID } = await run(
    'INSERT INTO Tickets (photo_id, style, priority, partner) VALUES (?, ?, ?, ?)',
    [photo_id, style, priority, partner]
  );
  res.status(201).json(await get('SELECT * FROM Tickets WHERE id = ?', [lastID]));
}));

router.patch('/:id/status', wrap(async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${STATUSES.join(', ')}` });
  }
  const { changes } = await run('UPDATE Tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, req.params.id]);
  if (!changes) return res.status(404).json({ error: 'Ticket not found' });
  res.json(await get('SELECT * FROM Tickets WHERE id = ?', [req.params.id]));
}));

// Simulated partner integration: marks the ticket Sent and returns a receipt.
router.post('/:id/send', wrap(async (req, res) => {
  const ticket = await get('SELECT * FROM Tickets WHERE id = ?', [req.params.id]);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  await run("UPDATE Tickets SET status = 'Sent', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [ticket.id]);
  res.json({
    success: true,
    receipt: {
      receiptId: crypto.randomUUID(),
      partner: ticket.partner,
      sentAt: new Date().toISOString(),
    },
    ticket: await get('SELECT * FROM Tickets WHERE id = ?', [ticket.id]),
  });
}));

module.exports = router;
