import { pool } from '../db.js';

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

export const calculateProductQuantity = async (
  productTypeId,
  materialTypeId,
  materialAmount,
  firstParameter,
  secondParameter,
) => {
  const isValid =
    isPositiveInteger(productTypeId) &&
    isPositiveInteger(materialTypeId) &&
    Number.isInteger(materialAmount) &&
    materialAmount >= 0 &&
    isPositiveNumber(firstParameter) &&
    isPositiveNumber(secondParameter);

  if (!isValid) {
    return -1;
  }

  const productType = await pool.query(
    'SELECT type_coefficient FROM product_type WHERE product_type_id = $1',
    [productTypeId],
  );
  const materialType = await pool.query(
    'SELECT loss_percent FROM material_type WHERE material_type_id = $1',
    [materialTypeId],
  );

  if (productType.rowCount === 0 || materialType.rowCount === 0) {
    return -1;
  }

  const typeCoefficient = Number(productType.rows[0].type_coefficient);
  const lossPercent = Number(materialType.rows[0].loss_percent);

  const materialPerProduct = firstParameter * secondParameter * typeCoefficient;
  const usableAmount = materialAmount * (1 - lossPercent / 100);

  return Math.floor(usableAmount / materialPerProduct);
};
