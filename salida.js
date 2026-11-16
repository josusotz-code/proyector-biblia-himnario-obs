const escena = document.getElementById("escena");
const elFondo = escena.querySelector(".fondo");
const elCab = escena.querySelector(".cabecera");
const elTexto = escena.querySelector(".texto");

if (new URLSearchParams(location.search).has("previa")) document.body.classList.add("vista-previa");

const ESTILO_BASE = {
  plantilla: "tercio", fondo: "", colorFondo: "#0b1220", oscurecer: 0.55,
  fuente: "Montserrat", escala: 1, colorTexto: "#ffffff", negrita: false, alinear: "center", vpos: "center",
  acento: "#d4a843", cabecera: true, sombra: true,
  colorCaja: "#0a0e18", opacidadCaja: 0.88, lado: "izq", animacion: "desvanecer"
};
let estilo = Object.assign({}, ESTILO_BASE);
let diapo = null;
let visible = false;
let cambio = null;

const FUENTES = {
  Montserrat: '"Montserrat", "Segoe UI", sans-serif',
  Lato: '"Lato", "Segoe UI", sans-serif',
  "Open Sans": '"Open Sans", "Segoe UI", sans-serif',
  Oswald: '"Oswald", "Arial Narrow", sans-serif',
  Merriweather: '"Merriweather", Georgia, serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
  Georgia: 'Georgia, "Times New Roman", serif',
  "Segoe UI": '"Segoe UI", Arial, sans-serif'
};
const VPOS = { arriba: "flex-start", center: "center", abajo: "flex-end" };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function rgba(hex, a) {
  const n = parseInt((hex || "#000000").slice(1), 16);
  return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

function aplicarEstilo(nuevo) {
  estilo = Object.assign({}, ESTILO_BASE, nuevo || estilo);
  escena.className = [
    "escena",
    "p-" + estilo.plantilla,
    "anim-" + estilo.animacion,
    "vpos-" + estilo.vpos,
    estilo.lado === "der" ? "lado-der" : "",
    estilo.fondo ? "" : "solido",
    estilo.cabecera ? "" : "sin-cabecera",
    visible ? "visible" : ""
  ].join(" ");
  const r = document.documentElement.style;
  r.setProperty("--acento", estilo.acento);
  r.setProperty("--color-texto", estilo.colorTexto);
  r.setProperty("--fuente", FUENTES[estilo.fuente] || FUENTES.Montserrat);
  r.setProperty("--peso", estilo.negrita ? 700 : 500);
  r.setProperty("--escala", estilo.escala);
  r.setProperty("--alinear", estilo.alinear);
  r.setProperty("--vpos", VPOS[estilo.vpos] || "center");
  r.setProperty("--opacidad-fondo", estilo.oscurecer);
  r.setProperty("--caja", rgba(estilo.colorCaja, estilo.opacidadCaja));
  r.setProperty("--sombra", estilo.sombra ? "0 3px 14px rgba(0, 0, 0, 0.6)" : "none");
  elFondo.style.backgroundImage = estilo.fondo ? 'url("' + estilo.fondo + '")' : "none";
  elFondo.style.backgroundColor = estilo.colorFondo;
}

function pintar() {
  if (!diapo) return;
  elCab.textContent = diapo.cabecera || "";
  elCab.style.display = diapo.cabecera ? "" : "none";
  let html = "";
  if (diapo.versiculos) {
    html = "<p>" + diapo.versiculos.map((v) =>
      (diapo.versiculos.length > 1 ? "<sup>" + v.n + "</sup>" : "") + esc(v.t)).join(" ") + "</p>";
  } else if (diapo.lineas) {
    html = "<p>" + diapo.lineas.map((l) => '<span class="linea">' + esc(l) + "</span>").join("") + "</p>";
  }
  if (diapo.cita) html += '<div class="cita">' + esc(diapo.cita) + "</div>";
  if (diapo.pie) html += '<div class="pie">' + esc(diapo.pie) + "</div>";
  elTexto.innerHTML = html;
  ajustar();
}

// Reduce el tamaño de letra hasta que el texto quepa en su caja.
function ajustar() {
  elTexto.style.fontSize = "";
  const caja = escena.querySelector(".caja");
  let tam = parseFloat(getComputedStyle(elTexto).fontSize);
  const cabe = () => elTexto.scrollHeight <= elTexto.clientHeight + 1 && caja.scrollHeight <= caja.clientHeight + 1;
  let i = 0;
  while (!cabe() && tam > 18 && i++ < 80) {
    tam -= 2;
    elTexto.style.fontSize = tam + "px";
  }
}

// Muestra una diapositiva con su estilo (Biblia e Himnos tienen estilos distintos).
function mostrar(nueva, nuevoEstilo) {
  clearTimeout(cambio);
  const poner = () => {
    diapo = nueva;
    visible = true;
    aplicarEstilo(nuevoEstilo);
    pintar();
  };
  if (visible && diapo && estilo.animacion !== "ninguna") {
    // Transición: desvanecer, cambiar texto y estilo, aparecer.
    escena.classList.remove("visible");
    visible = false;
    cambio = setTimeout(() => {
      poner();
      requestAnimationFrame(() => escena.classList.add("visible"));
    }, 300);
  } else {
    visible = false;
    poner();
    escena.classList.remove("visible");
    void escena.offsetWidth;
    escena.classList.add("visible");
  }
}

function ocultar() {
  clearTimeout(cambio);
  visible = false;
  escena.classList.remove("visible");
}

// Cada salida escucha un canal: "biblia", "himnos" o "todos" (lo último que se ponga al aire).
const CANAL = window.CANAL_SALIDA || "todos";
let canalActual = null; // canal de lo que se está mostrando
const esMio = (c) => CANAL === "todos" || c === CANAL;

const canal = Canal.crear((m) => {
  if (m.tipo === "mostrar") {
    if (!esMio(m.canal)) return;
    canalActual = m.canal;
    mostrar(m.diapo, m.estilo);
  } else if (m.tipo === "ocultar") {
    if (esMio(m.canal) && m.canal === canalActual) ocultar();
  } else if (m.tipo === "estilo") {
    // Cambio de diseño mientras algo está al aire: se aplica al momento.
    if (!esMio(m.canal) || m.canal !== canalActual) return;
    aplicarEstilo(m.estilo);
    if (m.diapo) diapo = m.diapo;
    pintar();
  } else if (m.tipo === "estado") {
    // Lo que está al aire en cada canal (al abrir o recargar esta salida).
    let c = CANAL;
    if (CANAL === "todos") {
      const otro = m.ultimo === "biblia" ? "himnos" : "biblia";
      c = m.canales[m.ultimo] && m.canales[m.ultimo].visible ? m.ultimo : otro;
    }
    const e = m.canales[c];
    canalActual = c;
    if (e && e.visible && e.diapo) mostrar(e.diapo, e.estilo);
    else { if (e) aplicarEstilo(e.estilo); ocultar(); }
  }
}, (s) => {
  // Al conectarse, pide al panel lo que está al aire.
  if (s === "conectado") canal.enviar({ tipo: "hola" });
});

aplicarEstilo();
if (document.fonts) document.fonts.ready.then(() => diapo && pintar());
// Para las pruebas fuera de OBS (canal local).
setTimeout(() => canal.enviar({ tipo: "hola" }), 300);
