// HIMNARIO DE EJEMPLO: solo muestra el formato. No contiene himnos reales.
// Pon tu himnario en datos/himnario.js (ver README).
window.HIMNARIO_EJEMPLO = true;
window.HIMNOS = [
  {
    "numero": 1,
    "titulo": "Himno de ejemplo",
    "intro": "Una cita bíblica o frase que acompaña al himno. Sal. 100:1",
    "referencias": ["Sal. 100:1"],
    "autores": ["LETRA: Nombre del autor", "MÚSICA: Nombre del compositor"],
    "versos": [
      { "nombre": "1", "lineas": ["Primera línea de la estrofa uno", "segunda línea de la estrofa uno", "tercera línea de la estrofa uno", "cuarta línea de la estrofa uno"] },
      { "nombre": "Coro", "lineas": ["Primera línea del coro", "segunda línea del coro", "tercera línea del coro", "cuarta línea del coro"] },
      { "nombre": "2", "lineas": ["Primera línea de la estrofa dos", "segunda línea de la estrofa dos", "tercera línea de la estrofa dos", "cuarta línea de la estrofa dos"] },
      { "nombre": "3", "lineas": ["Primera línea de la estrofa tres", "segunda línea de la estrofa tres", "tercera línea de la estrofa tres", "cuarta línea de la estrofa tres"] }
    ]
  },
  {
    "numero": 2,
    "titulo": "Otro himno de ejemplo (sin coro)",
    "autores": ["LETRA Y MÚSICA: Nombre del autor"],
    "versos": [
      { "nombre": "1", "lineas": ["Las estrofas pueden tener", "cualquier número de líneas,", "el panel las divide", "si son muy largas."] },
      { "nombre": "2", "lineas": ["Segunda estrofa", "del himno de ejemplo."] }
    ]
  }
];
