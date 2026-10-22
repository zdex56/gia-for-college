import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

const materialSelect = `
  SELECT
    m.material_id AS "id",
    m.material_name AS "name",
    m.material_type_id AS "typeId",
    mt.material_type_name AS "typeName",
    m.unit_id AS "unitId",
    u.unit_name AS "unitName",
    m.unit_price AS "price",
    m.package_quantity AS "packageQuantity",
    m.stock_quantity AS "stockQuantity",
    m.min_quantity AS "minQuantity",
    COALESCE(ROUND(SUM(mp.material_quantity), 2), 0) AS "requiredQuantity"
  FROM material m
  JOIN material_type mt ON mt.material_type_id = m.material_type_id
  JOIN unit u ON u.unit_id = m.unit_id
  LEFT JOIN material_product mp ON mp.material_id = m.material_id`;

const materialGroup = `
  GROUP BY m.material_id, mt.material_type_name, u.unit_name`;

const toNumber = (value) => (value === '' || value === null || value === undefined ? NaN : Number(value));

const validateMaterial = (body) => {
  const name = String(body.name ?? '').trim();
  const typeId = toNumber(body.typeId);
  const unitId = toNumber(body.unitId);
  const price = toNumber(body.price);
  const packageQuantity = toNumber(body.packageQuantity);
  const stockQuantity = toNumber(body.stockQuantity);
  const minQuantity = toNumber(body.minQuantity);

  if (!name) {
    return { error: 'Введите наименование материала.' };
  }
  if (!Number.isInteger(typeId)) {
    return { error: 'Выберите тип материала из списка.' };
  }
  if (!Number.isInteger(unitId)) {
    return { error: 'Выберите единицу измерения из списка.' };
  }
  if (Number.isNaN(price) || price < 0) {
    return { error: 'Цена должна быть числом не меньше нуля. Введите цену, например 450.50.' };
  }
  if (Math.round(price * 100) !== Number((price * 100).toFixed(6))) {
    return { error: 'Цена указывается с точностью до сотых. Например, 450.50.' };
  }
  if (Number.isNaN(packageQuantity) || packageQuantity <= 0) {
    return { error: 'Количество в упаковке должно быть числом больше нуля.' };
  }
  if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
    return { error: 'Количество на складе не может быть отрицательным.' };
  }
  if (Number.isNaN(minQuantity) || minQuantity < 0) {
    return { error: 'Минимальное количество не может быть отрицательным.' };
  }

  return { values: [name, typeId, unitId, price, packageQuantity, stockQuantity, minQuantity] };
};

const handleSaveError = (error, res) => {
  if (error.code === '23505') {
    return res.status(409).json({ message: 'Материал с таким наименованием уже существует. Укажите другое наименование.' });
  }
  if (error.code === '23503') {
    return res.status(400).json({ message: 'Выбранный тип материала или единица измерения не найдены. Выберите значение из списка.' });
  }
  if (error.code === '22003') {
    return res.status(400).json({ message: 'Введённое число слишком велико. Уменьшите значение.' });
  }
  throw error;
};

router.get('/', async (req, res) => {
  const result = await pool.query(`${materialSelect} ${materialGroup} ORDER BY m.material_name`);
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query(`${materialSelect} WHERE m.material_id = $1 ${materialGroup}`, [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Материал не найден. Возможно, он был удалён. Вернитесь к списку материалов.' });
  }
  res.json(result.rows[0]);
});

router.get('/:id/products', async (req, res) => {
  const result = await pool.query(
    `SELECT p.product_id AS "id", p.product_name AS "name", mp.material_quantity AS "materialQuantity"
     FROM material_product mp
     JOIN product p ON p.product_id = mp.product_id
     WHERE mp.material_id = $1
     ORDER BY p.product_name`,
    [req.params.id],
  );
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { error, values } = validateMaterial(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  try {
    const result = await pool.query(
      `INSERT INTO material
         (material_name, material_type_id, unit_id, unit_price, package_quantity, stock_quantity, min_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING material_id AS "id"`,
      values,
    );
    res.status(201).json(result.rows[0]);
  } catch (saveError) {
    handleSaveError(saveError, res);
  }
});

router.put('/:id', async (req, res) => {
  const { error, values } = validateMaterial(req.body);
  if (error) {
    return res.status(400).json({ message: error });
  }
  try {
    const result = await pool.query(
      `UPDATE material
       SET material_name = $1, material_type_id = $2, unit_id = $3, unit_price = $4,
           package_quantity = $5, stock_quantity = $6, min_quantity = $7
       WHERE material_id = $8
       RETURNING material_id AS "id"`,
      [...values, req.params.id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Материал не найден. Возможно, он был удалён. Вернитесь к списку материалов.' });
    }
    res.json(result.rows[0]);
  } catch (saveError) {
    handleSaveError(saveError, res);
  }
});

export default router;
