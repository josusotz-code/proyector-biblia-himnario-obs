// Carga scripts en orden. Cada elemento puede ser una lista de alternativas:
// se usa la primera que exista (por ejemplo, tu config.js o, si no está, config.ejemplo.js).

(function () {
  function cargar(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => { s.remove(); reject(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  window.cargarScripts = async function (lista) {
    for (const item of lista) {
      const opciones = Array.isArray(item) ? item : [item];
      for (const src of opciones) {
        try {
          await cargar(src);
          break;
        } catch (e) {
          console.warn("No se encontró " + src);
        }
      }
    }
  };
})();
