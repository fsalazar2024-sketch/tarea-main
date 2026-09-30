LOAD DATA LOCAL INFILE 'catalog.csv'
INTO TABLE productos
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(id, nombre, precio, categoria, formato, stock, imagen, descripcion);