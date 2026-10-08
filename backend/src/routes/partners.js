const express = require('express');
const { all } = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const rows = await all(`SELECT
      partner,
      COUNT(*) AS total,
      SUM(status IN ('Sent', 'In Progress')) AS active,
      SUM(status IN ('Completed', 'Approved')) AS done
      FROM Tickets GROUP BY partner ORDER BY partner`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
