DROP TABLE IF EXISTS material_product, product, material, unit, product_type, material_type CASCADE;

CREATE TABLE material_type (
    material_type_id   SERIAL        PRIMARY KEY,
    material_type_name VARCHAR(100)  NOT NULL UNIQUE,
    loss_percent       NUMERIC(5,2)  NOT NULL CHECK (loss_percent >= 0 AND loss_percent < 100)
);

CREATE TABLE unit (
    unit_id   SERIAL      PRIMARY KEY,
    unit_name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE material (
    material_id       SERIAL        PRIMARY KEY,
    material_name     VARCHAR(150)  NOT NULL UNIQUE,
    material_type_id  INTEGER       NOT NULL REFERENCES material_type (material_type_id),
    unit_id           INTEGER       NOT NULL REFERENCES unit (unit_id),
    unit_price        NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    package_quantity  NUMERIC(12,3) NOT NULL CHECK (package_quantity > 0),
    stock_quantity    NUMERIC(12,3) NOT NULL CHECK (stock_quantity >= 0),
    min_quantity      NUMERIC(12,3) NOT NULL CHECK (min_quantity >= 0)
);

CREATE TABLE product_type (
    product_type_id   SERIAL       PRIMARY KEY,
    product_type_name VARCHAR(100) NOT NULL UNIQUE,
    type_coefficient  NUMERIC(5,2) NOT NULL CHECK (type_coefficient > 0)
);

CREATE TABLE product (
    product_id         SERIAL        PRIMARY KEY,
    product_article    VARCHAR(20)   NOT NULL UNIQUE,
    product_name       VARCHAR(150)  NOT NULL UNIQUE,
    product_type_id    INTEGER       NOT NULL REFERENCES product_type (product_type_id),
    min_partner_price  NUMERIC(12,2) NOT NULL CHECK (min_partner_price >= 0)
);

CREATE TABLE material_product (
    product_id         INTEGER       NOT NULL REFERENCES product (product_id) ON DELETE CASCADE,
    material_id        INTEGER       NOT NULL REFERENCES material (material_id),
    material_quantity  NUMERIC(12,4) NOT NULL CHECK (material_quantity > 0),
    PRIMARY KEY (product_id, material_id)
);

CREATE INDEX idx_material_material_type_id ON material (material_type_id);
CREATE INDEX idx_product_product_type_id   ON product (product_type_id);
CREATE INDEX idx_material_product_material_id ON material_product (material_id);