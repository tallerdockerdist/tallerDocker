CREATE DATABASE IF NOT EXISTS gestion_aulas;
USE gestion_aulas;

CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE salas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE prestamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  estudiante_id INT NOT NULL,
  sala_id INT NOT NULL,
  fecha DATETIME NOT NULL,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
  FOREIGN KEY (sala_id) REFERENCES salas(id)
);

INSERT INTO estudiantes (nombre) VALUES 
  ('Jesus Marquez'), ('Esmeralda Rojas'), ('Azucena Olmedo');

INSERT INTO salas (nombre) VALUES 
  ('BINF 1'), ('BINF 2'), ('BINF 3'), ('BINF 4'), ('BINF 5'), ('BINF 6'), ('BINF 7'), ('BINF 8'), ('BINF 9'), ('BINF 10');

INSERT INTO prestamos (estudiante_id, sala_id, fecha) VALUES
  (1, 1, '2025-05-01 10:00:00'),
  (2, 1, '2025-05-01 12:00:00'),
  (3, 2, '2025-05-02 09:00:00'),
  (1, 1, '2025-05-03 11:00:00'),
  (2, 2, '2025-05-05 13:00:00'),
  (1, 3, '2025-05-06 14:00:00'),
  (3, 1, '2025-05-07 15:00:00'),
  (1, 1, '2025-05-08 16:00:00'),
  (1, 2, '2025-05-10 17:00:00');
