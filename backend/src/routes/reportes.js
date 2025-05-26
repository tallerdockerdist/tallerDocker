const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/sala-mas-usada', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT salas.nombre AS sala, COUNT(*) AS total_prestamos
        FROM prestamos
        JOIN salas ON prestamos.sala_id = salas.id
        GROUP BY salas.id
        ORDER BY total_prestamos DESC
        LIMIT 1;
      `);
      res.json(rows[0]);
    } catch (err) {
      console.error('Error en sala-mas-usada:', err);
      res.status(500).json({ error: 'Error al obtener la sala más usada' });
    }
  });
  

router.get('/reporte-semanal', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT YEAR(fecha) AS año, WEEK(fecha, 1) AS semana, COUNT(*) AS total
      FROM prestamos
      GROUP BY año, semana
      ORDER BY año DESC, semana DESC;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el reporte semanal' });
  }
});

router.get('/reporte-mensual', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT YEAR(fecha) AS año, MONTH(fecha) AS mes, COUNT(*) AS total
      FROM prestamos
      GROUP BY año, mes
      ORDER BY año DESC, mes DESC;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el reporte mensual' });
  }
});

router.get('/ranking-estudiantes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT estudiantes.nombre AS estudiante, COUNT(*) AS total_prestamos
      FROM prestamos
      JOIN estudiantes ON prestamos.estudiante_id = estudiantes.id
      GROUP BY estudiante_id
      ORDER BY total_prestamos DESC;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ranking de estudiantes' });
  }
});

router.get('/uso-salas-por-mes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT salas.nombre AS sala, YEAR(fecha) AS año, MONTH(fecha) AS mes, COUNT(*) AS total
      FROM prestamos
      JOIN salas ON prestamos.sala_id = salas.id
      GROUP BY sala, año, mes
      ORDER BY sala, año DESC, mes DESC;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el uso por sala por mes' });
  }
});

router.post('/nuevo-prestamo', async (req, res) => {
  const { estudiante_id, sala_id, fecha } = req.body;

  if (!estudiante_id || !sala_id || !fecha) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const fechaInicio = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      return res.status(400).json({ error: 'No se permiten préstamos en fechas pasadas' });
    }

    const fechaFin = new Date(fechaInicio);
    fechaFin.setHours(fechaInicio.getHours() + 2);

    const [conflictos] = await pool.query(
      `
      SELECT * FROM prestamos
      WHERE sala_id = ? AND (
        (fecha >= ? AND fecha < ?) OR
        (? >= fecha AND ? < DATE_ADD(fecha, INTERVAL 2 HOUR))
      )
      `,
      [sala_id, fechaInicio, fechaFin, fechaInicio, fechaInicio]
    );

    if (conflictos.length > 0) {
      return res.status(400).json({ error: 'La sala ya está ocupada en ese horario' });
    }

    await pool.query(
      'INSERT INTO prestamos (estudiante_id, sala_id, fecha) VALUES (?, ?, ?)',
      [estudiante_id, sala_id, fechaInicio]
    );

    res.status(201).json({ message: 'Préstamo registrado correctamente' });

  } catch (err) {
    console.error('Error al registrar préstamo:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


router.post('/nuevo-estudiante', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });

  try {
    const [result] = await pool.query(
      'INSERT INTO estudiantes (nombre) VALUES (?)',
      [nombre]
    );
    res.status(201).json({ message: 'Estudiante registrado', id: result.insertId });
  } catch (err) {
    console.error('Error al registrar estudiante:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/salas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM salas');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener salas' });
  }
});

module.exports = router;

router.get('/estudiantes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM estudiantes');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener estudiantes:', err);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
});
