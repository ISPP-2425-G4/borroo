const axios = require('axios');

async function checkBackend() {
  try {
    const response = await axios.get('http://localhost:8000/app/');
    console.log('Backend está disponible');
  } catch (error) {
    console.error('No se pudo conectar al backend. Asegúrate de que el backend esté corriendo.');
    process.exit(1); // Detiene el proceso con un código de error
  }
}

checkBackend();
