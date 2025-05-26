const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  fetch(`${API_BASE_URL}/sala-mas-usada`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('sala-mas-usada').textContent =
        `${data.sala} (${data.total_prestamos} préstamos)`;
    })
    .catch(() => {
      document.getElementById('sala-mas-usada').textContent = 'Error al cargar';
    });
});

function mostrarReporte(tipo) {
  let url = '';
  let titulo = '';

  if (tipo === 'semanal') {
    url = `${API_BASE_URL}/reporte-semanal`;
    titulo = '📅 Reporte Semanal de Préstamos';
  } else if (tipo === 'mensual') {
    url = `${API_BASE_URL}/reporte-mensual`;
    titulo = '🗓️ Reporte Mensual de Préstamos';
  } else if (tipo === 'ranking') {
    url = `${API_BASE_URL}/ranking-estudiantes`;
    titulo = '🏆 Ranking de Estudiantes por Uso';
  }

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById('reporte-lista');
      lista.innerHTML = '';
      document.getElementById('reporte-titulo').textContent = titulo;

      data.forEach(item => {
        const li = document.createElement('li');
        if (tipo === 'semanal') {
          li.textContent = `Semana ${item.semana} - ${item.año}: ${item.total} préstamos`;
        } else if (tipo === 'mensual') {
          li.textContent = `Mes ${item.mes} - ${item.año}: ${item.total} préstamos`;
        } else if (tipo === 'ranking') {
          li.textContent = `${item.estudiante}: ${item.total_prestamos} préstamos`;
        }
        lista.appendChild(li);
      });
    })
    .catch(() => {
      document.getElementById('reporte-lista').innerHTML = '<li>Error al cargar el reporte</li>';
    });
}

function mostrarFormularioPrestamo() {
  document.getElementById('formulario-prestamo').style.display = 'block';
  document.getElementById('formulario-estudiante').style.display = 'none';
  document.getElementById('reporte-lista').innerHTML = '';
  document.getElementById('reporte-titulo').textContent = '';

  // Cargar salas
  fetch(`${API_BASE_URL}/salas`)
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('sala-id');
      select.innerHTML = '';
      data.forEach(sala => {
        const option = document.createElement('option');
        option.value = sala.id;
        option.textContent = `${sala.nombre} (ID: ${sala.id})`;
        select.appendChild(option);
      });
    });
}


document.getElementById('form-prestamo').addEventListener('submit', async (e) => {
  e.preventDefault();

  const estudiante_id = document.getElementById('estudiante-id').value;
  const sala_id = document.getElementById('sala-id').value;
  const fecha = document.getElementById('fecha').value;

  try {
    // 1. Validar si el estudiante existe
    const resEst = await fetch(`${API_BASE_URL}/estudiantes`);
    const estudiantes = await resEst.json();
    const existe = estudiantes.some(e => e.id == estudiante_id);

    if (!existe) {
      alert('⚠️ Estudiante no registrado');
      return;
    }

    // 2. Intentar registrar el préstamo
    const res = await fetch(`${API_BASE_URL}/nuevo-prestamo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estudiante_id, sala_id, fecha })
    });

    const contentType = res.headers.get('content-type');

    // 3. Parsear JSON solo si la respuesta tiene formato JSON
    const data = contentType && contentType.includes('application/json') ? await res.json() : {};

    if (!res.ok) {
      const mensaje = data?.error || `Error al registrar el préstamo (código ${res.status})`;
      alert(`⛔ ${mensaje}`);
      return;
    }

    // 4. Todo OK
    document.getElementById('mensaje-prestamo').textContent = data.message || 'Registrado exitosamente';
    alert('✅ Préstamo registrado correctamente');

  } catch (err) {
    alert('❌ Error de red o del servidor');
    console.error(err);
  }
});



function mostrarFormularioEstudiante() {
  document.getElementById('formulario-estudiante').style.display = 'block';
  document.getElementById('formulario-prestamo').style.display = 'none';
  document.getElementById('reporte-titulo').textContent = '';
  document.getElementById('reporte-lista').innerHTML = '';
}
document.getElementById('form-estudiante').addEventListener('submit', (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre-estudiante').value;

  fetch(`${API_BASE_URL}/nuevo-estudiante`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById('mensaje-estudiante').textContent = data.message || 'Registrado';
    })
    .catch(() => {
      document.getElementById('mensaje-estudiante').textContent = 'Error al registrar';
    });
});

function mostrarEstudiantes() {
  document.getElementById('lista-estudiantes').style.display = 'block';
  document.getElementById('reporte-titulo').textContent = '';
  document.getElementById('reporte-lista').innerHTML = '';
  document.getElementById('formulario-estudiante').style.display = 'none';
  document.getElementById('formulario-prestamo').style.display = 'none';

  fetch(`${API_BASE_URL}/estudiantes`)
    .then(res => res.json())
    .then(data => {
      const ul = document.getElementById('estudiantes-lista');
      ul.innerHTML = '';
      data.forEach(est => {
        const li = document.createElement('li');
        li.textContent = `ID: ${est.id} – ${est.nombre}`;
        ul.appendChild(li);
      });
    })
    .catch(err => {
      const ul = document.getElementById('estudiantes-lista');
      ul.innerHTML = '<li>Error al cargar estudiantes</li>';
    });
}
