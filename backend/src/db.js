const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'db',
  user: 'gestor',
  password: 'Passgestor1!',
  database: 'gestion_aulas',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
