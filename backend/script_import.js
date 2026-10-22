import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readXlsxFile from 'read-excel-file/node';
import pg from 'pg';

const databaseDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../GIA/databaasee');
const importDir = path.join(databaseDir, 'import');

const readSheet = async (fileName) => {
  const rows = await readXlsxFile(path.join(importDir, fileName));
  return rows[0].data.slice(1);
};

const parsePercent = (text) => Number(String(text).replace('%', '').replace(',', '.').trim());

const insertAndMapIds = async (client, sql, items, keyOf, valuesOf) => {
  const ids = new Map();
  for (const item of items) {
    const result = await client.query(sql, valuesOf(item));
    ids.set(keyOf(item), result.rows[0].id);
  }
  return ids;
};

const run = async () => {
  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await client.connect();

  try {
    const materialTypes = await readSheet('Material_type_import.xlsx');
    const materials = await readSheet('Materials_import.xlsx');
    const productTypes = await readSheet('Product_type_import.xlsx');
    const products = await readSheet('Products_import.xlsx');
    const materialProducts = await readSheet('Material_products_import.xlsx');

    await client.query('BEGIN');
    await client.query(fs.readFileSync(path.join(databaseDir, 'schema.sql'), 'utf8'));

    const materialTypeIds = await insertAndMapIds(
      client,
      'INSERT INTO material_type (material_type_name, loss_percent) VALUES ($1, $2) RETURNING material_type_id AS id',
      materialTypes,
      (row) => row[0],
      (row) => [row[0], parsePercent(row[1])],
    );

    const unitNames = [...new Set(materials.map((row) => row[6]))];
    const unitIds = await insertAndMapIds(
      client,
      'INSERT INTO unit (unit_name) VALUES ($1) RETURNING unit_id AS id',
      unitNames,
      (name) => name,
      (name) => [name],
    );

    const materialIds = await insertAndMapIds(
      client,
      `INSERT INTO material (material_name, material_type_id, unit_id, unit_price, package_quantity, stock_quantity, min_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING material_id AS id`,
      materials,
      (row) => row[0],
      (row) => [row[0], materialTypeIds.get(row[1]), unitIds.get(row[6]), row[2], row[5], row[3], row[4]],
    );

    const productTypeIds = await insertAndMapIds(
      client,
      'INSERT INTO product_type (product_type_name, type_coefficient) VALUES ($1, $2) RETURNING product_type_id AS id',
      productTypes,
      (row) => row[0],
      (row) => [row[0], row[1]],
    );

    const productIds = await insertAndMapIds(
      client,
      `INSERT INTO product (product_article, product_name, product_type_id, min_partner_price)
       VALUES ($1, $2, $3, $4) RETURNING product_id AS id`,
      products,
      (row) => row[2],
      (row) => [row[0], row[2], productTypeIds.get(row[1]), row[3]],
    );

    for (const [materialName, productName, quantity] of materialProducts) {
      await client.query(
        'INSERT INTO material_product (product_id, material_id, material_quantity) VALUES ($1, $2, $3)',
        [productIds.get(productName), materialIds.get(materialName), quantity],
      );
    }

    await client.query('COMMIT');
    console.log('Импорт завершён');
    console.log(`Типы материалов: ${materialTypes.length}`);
    console.log(`Материалы: ${materials.length}`);
    console.log(`Типы продукции: ${productTypes.length}`);
    console.log(`Продукция: ${products.length}`);
    console.log(`Рецептуры: ${materialProducts.length}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Импорт отменён: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

run();