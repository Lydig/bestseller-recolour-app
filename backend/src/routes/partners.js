const express = require('express');
const { all } = require('../db');

const router = express.Router();

// Always listed, even before they have tickets.
const KNOWN_PARTNERS = ['FastRetouch', 'PixelCraft', 'ColorLab', 'Internal'];

router.get('/', async (req, res, next) => {
  try {
    const rows = await all(`SELECT
      partner,
      COUNT(*) AS total,
      SUM(status IN ('Sent', 'In Progress')) AS active,
      SUM(status IN ('Completed', 'Approved')) AS done
      FROM Tickets GROUP BY partner`);
    const byName = new Map(rows.map((r) => [r.partner, r]));
    for (const partner of KNOWN_PARTNERS) {
      if (!byName.has(partner)) byName.set(partner, { partner, total: 0, active: 0, done: 0 });
    }
    res.json([...byName.values()].sort((a, b) => a.partner.localeCompare(b.partner)));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
