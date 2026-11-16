// CONFIGURACIÓN DE EJEMPLO
// 1. Copia este archivo y llama a la copia "config.js" (en esta misma carpeta).
// 2. Edita config.js con el Bloc de notas (o cualquier editor de texto) y guarda.
// 3. Recarga el panel y las salidas en OBS.
// config.js no se sube a GitHub (está en .gitignore), así tu contraseña queda solo en tu computadora.

window.PROYECTOR_CONFIG = {
  ejemplo: true, // <-- borra esta línea en tu config.js

  // Servidor WebSocket de OBS (OBS > Herramientas > Ajustes del servidor WebSocket).
  obs: {
    host: "localhost", // la computadora donde corre OBS. "localhost" = esta misma computadora
    puerto: 4455,      // el puerto que aparece en OBS (4455 por defecto)
    password: ""       // la contraseña del servidor WebSocket. Déjala vacía si desactivaste la autenticación
  },

  // Versión de la Biblia que se muestra junto a la cita (opcional).
  // Si la dejas vacía se usa la abreviatura que traiga el archivo de la Biblia.
  biblia: {
    abreviatura: ""    // por ejemplo "RVR1960", "NVI", "LBLA"
  },

  // Fondos para las plantillas "Pantalla completa" y "Texto + cámaras".
  // Copia tus imágenes a la carpeta "fondos" y agrega una línea por cada una.
  // La ruta es relativa a esta carpeta.
  fondos: [
    // { nombre: "Cruz", archivo: "fondos/cruz.jpg" },
    // { nombre: "Biblia abierta", archivo: "fondos/biblia.jpg" },
  ]
};
