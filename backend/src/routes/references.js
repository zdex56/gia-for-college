import { Router } from 'express';
import { pool } from '../db.js';
import { calculateProductQuantity } from '../services/calculation.js';

const router = Router();

router.get('/material-types', async (req, res) => {
  const result = await pool.query(
    `SELECT material_type_id AS "id", material_type_name AS "name", loss_percent AS "lossPercent"
     FROM material_type ORDER BY material_type_name`,
  );
  res.json(result.rows);
});

router.get('/units', async (req, res) => {
  const result = await pool.query('SELECT unit_id AS "id", unit_name AS "name" FROM unit ORDER BY unit_name');
  res.json(result.rows);
});

router.get('/calculate', async (req, res) => {
  const { productTypeId, materialTypeId, materialAmount, firstParameter, secondParameter } = req.query;
  const quantity = await calculateProductQuantity(
    Number(productTypeId),
    Number(materialTypeId),
    Number(materialAmount),
    Number(firstParameter),
    Number(secondParameter),
  );
  res.json({ quantity });
});

export default router;
