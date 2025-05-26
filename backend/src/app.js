const express = require('express');
const cors = require('cors');
const app = express();
const reportesRouter = require('./routes/reportes');

app.use(cors());
app.use(express.json());
app.use('/api', reportesRouter);

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API corriendo en puerto ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('API de gestión de aulas funcionando.');
  });
  