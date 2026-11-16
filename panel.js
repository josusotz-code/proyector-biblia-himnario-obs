// Panel de control: Biblia, Himnos y Diseño. Envía lo que hay que mostrar a salida.html.

const $ = (id) => document.getElementById(id);
const CFG = window.PROYECTOR_CONFIG || { fondos: [] };

// ---------- Memoria local (solo comodidad; si falla, el panel funciona igual) ----------
const memoria = {
  leer(clave, defecto) {
    try { const v = localStorage.getItem("proyector." + clave); return v ? JSON.parse(v) : defecto; } catch (e) { return defecto; }
  },
  guardar(clave, valor) {
    try { localStorage.setItem("proyector." + clave, JSON.stringify(valor)); } catch (e) { /* sin memoria */ }
  }
};

// ---------- Estado general ----------
// Biblia e Himnos tienen cada uno su propio diseño.
const ESTILO_BASE = {
  plantilla: "tercio", fondo: "", colorFondo: "#0b1220", oscurecer: 0.55,
  fuente: "Montserrat", escala: 1, colorTexto: "#ffffff", negrita: false, alinear: "center", vpos: "center",
  acento: "#d4a843", cabecera: true, sombra: true, version: false,
  colorCaja: "#0a0e18", opacidadCaja: 0.88, lado: "izq", animacion: "desvanecer"
};
const DEFECTO = {
  biblia: Object.assign({}, ESTILO_BASE, { alinear: "left" }),
  himnos: Object.assign({}, ESTILO_BASE, { plantilla: "lateral" })
};
let estilos = memoria.leer("estilos", null);
if (!estilos) {
  // Primera vez con diseños separados: se parte del diseño anterior.
  const anterior = memoria.leer("estilo", {});
  estilos = {
    biblia: Object.assign({}, anterior, { plantilla: "tercio" }),
    himnos: Object.assign({}, anterior, { plantilla: "lateral" })
  };
}
estilos.biblia = Object.assign({}, DEFECTO.biblia, estilos.biblia);
estilos.himnos = Object.assign({}, DEFECTO.himnos, estilos.himnos);

const grupoDe = (diapo) => (diapo && diapo.tipo === "himno" ? "himnos" : "biblia");

// Biblia e Himnos son dos canales independientes: cada uno tiene lo suyo al aire
// y su propia salida (salida-biblia.html / salida-himnos.html).
const aire = {
  biblia: { visible: false, diapo: null, etiqueta: "" },
  himnos: { visible: false, diapo: null, etiqueta: "" }
};
let ultimo = "biblia"; // último canal puesto al aire (para salida.html "todos")
let pestana = "biblia";
let editando = "biblia"; // qué diseño se está editando en la pestaña Diseño
// Un panel recién abierto o recargado no sabe qué hay al aire: no debe decirle a las
// salidas "no hay nada" (eso borraría lo que se está mostrando). Solo informa su
// estado después de haber mostrado u ocultado algo.
let tieneEstado = false;

function enviarEstado() {
  if (!tieneEstado) return;
  const canales = {};
  ["biblia", "himnos"].forEach((c) => {
    canales[c] = { visible: aire[c].visible, diapo: aire[c].diapo, estilo: estilos[c] };
  });
  canal.enviar({ tipo: "estado", canales, ultimo });
}

const canal = Canal.crear((m) => {
  if (m.tipo === "hola") enviarEstado();
}, (s) => {
  $("estado").className = "estado " + (["conectado", "conectando", "demo"].includes(s) ? s : "error");
  $("estadoTexto").textContent = {
    demo: "Modo demostración: no se conecta a OBS. Abre salida.html?demo en otra pestaña para ver el resultado.",
    conectado: "Conectado a OBS.",
    conectando: "Conectando con OBS…",
    "contraseña": "OBS rechazó la contraseña. Revisa la contraseña en config.js.",
    desconectado: "Sin conexión con OBS. Revisa que OBS esté abierto y el servidor WebSocket activado.",
    error: "Sin conexión con OBS."
  }[s] || s;
  if (s === "conectado") enviarEstado();
});

function mostrar(diapo, etiqueta) {
  const c = grupoDe(diapo);
  aire[c] = { visible: true, diapo, etiqueta };
  ultimo = c;
  tieneEstado = true;
  canal.enviar({ tipo: "mostrar", canal: c, diapo, estilo: estilos[c] });
  pintarBarra();
}

function ocultar(c) {
  aire[c].visible = false;
  tieneEstado = true;
  canal.enviar({ tipo: "ocultar", canal: c });
  pintarBarra();
  $(c === "biblia" ? "versiculos" : "diapos").querySelectorAll("li.aire").forEach((li) => li.classList.remove("aire"));
}

function pintarBarra() {
  ["biblia", "himnos"].forEach((c) => {
    const nombre = c === "biblia" ? "Biblia" : "Himnos";
    const el = $("aire" + nombre);
    el.classList.toggle("activo", aire[c].visible);
    el.textContent = aire[c].visible ? aire[c].etiqueta : "Nada al aire";
    $("ocultar" + nombre).classList.toggle("apagado", !aire[c].visible);
  });
}

function marcarAire(lista, idx) {
  [...lista.children].forEach((li, i) => {
    li.classList.toggle("aire", i === idx);
    if (i === idx) li.scrollIntoView({ block: "nearest" });
  });
}

// ---------- Pestañas ----------
document.querySelectorAll(".pestanas button").forEach((b) => {
  b.onclick = () => {
    pestana = b.dataset.pestana;
    document.querySelectorAll(".pestanas button").forEach((x) => x.classList.toggle("activa", x === b));
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("activo", p.id === "p-" + pestana));
    if (pestana === "biblia") $("cita").focus();
    if (pestana === "himnos") $("buscaHimno").focus();
    // Diseño abre el de la última pestaña usada (Biblia o Himnos).
    if (pestana === "biblia" || pestana === "himnos") { editando = pestana; pintarDiseno(); }
  };
});
$("ocultarBiblia").onclick = () => ocultar("biblia");
$("ocultarHimnos").onclick = () => ocultar("himnos");

// =====================================================================
// BIBLIA
// =====================================================================
const biblia = Biblia.crearIndice(window.BIBLIA);
// Abreviatura de la versión (config.js > biblia.abreviatura, o la que traiga el archivo).
const VERSION_BIBLIA = (CFG.biblia && CFG.biblia.abreviatura) || window.BIBLIA.abbreviation || "";
$("textoVersion").textContent = VERSION_BIBLIA || "la versión";

// Aviso cuando todavía no se agregaron los datos propios.
const avisos = [];
if (window.BIBLIA.ejemplo) avisos.push("Biblia de ejemplo: agrega tu Biblia en datos/biblia.js.");
if (window.HIMNARIO_EJEMPLO) avisos.push("Himnario de ejemplo: agrega tu himnario en datos/himnario.js.");
if (!window.PROYECTOR_CONFIG || window.PROYECTOR_CONFIG.ejemplo) avisos.push("Usando config.ejemplo.js: cópialo como config.js y pon tu contraseña.");
if (avisos.length) {
  $("avisoDatos").hidden = false;
  $("avisoDatos").textContent = avisos.join(" ") + " (Ver README)";
}
const B = { libro: null, cap: 1, desde: null, hasta: null };

function cabeceraBiblia(libro, cap, desde, hasta) {
  return biblia.referencia(libro, cap, desde, hasta) + (estilos.biblia.version && VERSION_BIBLIA ? " · " + VERSION_BIBLIA : "");
}

function cargarCapitulo(libro, cap) {
  B.libro = libro;
  B.cap = cap;
  B.inicio = null;
  $("tituloCap").textContent = libro.nombre + " " + cap;
  const lista = $("versiculos");
  lista.innerHTML = "";
  libro.capitulos[cap - 1].forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = "<b>" + (i + 1) + "</b>";
    li.appendChild(document.createTextNode(t));
    li.onclick = (e) => {
      if (e.shiftKey && B.desde) {
        const a = Math.min(B.desde, i + 1), z = Math.max(B.desde, i + 1);
        mostrarVersiculos(a, z);
      } else {
        mostrarVersiculos(i + 1, i + 1);
      }
    };
    lista.appendChild(li);
  });
  lista.scrollTop = 0;
}

function mostrarVersiculos(desde, hasta) {
  const textos = B.libro.capitulos[B.cap - 1];
  B.desde = desde;
  B.hasta = hasta;
  const versiculos = [];
  for (let v = desde; v <= hasta; v++) versiculos.push({ n: v, t: textos[v - 1] });
  mostrar({ tipo: "biblia", cabecera: cabeceraBiblia(B.libro, B.cap, desde, hasta), versiculos }, biblia.referencia(B.libro, B.cap, desde, hasta));
  aire.biblia.cita = [B.libro, B.cap, desde, hasta];
  [...$("versiculos").children].forEach((li, i) => li.classList.toggle("aire", i + 1 >= desde && i + 1 <= hasta));
  const li = $("versiculos").children[desde - 1];
  if (li) li.scrollIntoView({ block: "nearest" });
}

function pasoVersiculo(d) {
  if (!B.libro) return;
  const total = B.libro.capitulos[B.cap - 1].length;
  if (!B.desde) return mostrarVersiculos(B.inicio || 1, B.inicio || 1);
  let v = d > 0 ? B.hasta + 1 : B.desde - 1;
  if (v > total) {
    if (!B.libro.capitulos[B.cap]) return;
    cargarCapitulo(B.libro, B.cap + 1);
    v = 1;
  } else if (v < 1) {
    if (B.cap === 1) return;
    cargarCapitulo(B.libro, B.cap - 1);
    v = B.libro.capitulos[B.cap - 1].length;
  }
  mostrarVersiculos(v, v);
}

function pasoCapitulo(d) {
  if (!B.libro || !B.libro.capitulos[B.cap - 1 + d]) return;
  cargarCapitulo(B.libro, B.cap + d);
  B.desde = B.hasta = null;
}

let recientes = memoria.leer("recientes", []);
function pintarRecientes() {
  const cont = $("recientes");
  cont.innerHTML = "";
  recientes.forEach((r) => {
    const b = document.createElement("button");
    b.textContent = r;
    b.onclick = () => { $("cita").value = r; irACita(r); };
    cont.appendChild(b);
  });
}

// Por defecto solo lleva a la cita: marca los versículos y el primer → pone al aire
// el primero de ellos. Con alAire = true (▶ de la lista del culto) la muestra completa.
function irACita(texto, alAire = false) {
  const c = biblia.leerCita(texto);
  $("errorCita").className = "aviso";
  $("errorCita").textContent = c.error || "";
  if (c.error) return;
  cerrarCatalogo();
  cargarCapitulo(c.libro, c.cap);
  B.desde = B.hasta = null;
  $("cita").blur(); // para que ← → funcionen enseguida
  if (!c.desde) return;
  const ref = biblia.referencia(c.libro, c.cap, c.desde, c.hasta);
  $("cita").value = ref;
  recientes = [ref].concat(recientes.filter((r) => r !== ref)).slice(0, 8);
  memoria.guardar("recientes", recientes);
  pintarRecientes();
  if (alAire) {
    mostrarVersiculos(c.desde, c.hasta);
    return;
  }
  B.inicio = c.desde;
  [...$("versiculos").children].forEach((li, i) => li.classList.toggle("marcado", i + 1 >= c.desde && i + 1 <= c.hasta));
  $("versiculos").children[c.desde - 1].scrollIntoView({ block: "center" });
}

$("formCita").onsubmit = (e) => { e.preventDefault(); irACita($("cita").value); };
$("capAnt").onclick = () => pasoCapitulo(-1);
$("capSig").onclick = () => pasoCapitulo(1);
$("vAnt").onclick = () => pasoVersiculo(-1);
$("vSig").onclick = () => pasoVersiculo(1);
pintarRecientes();

// ---------- Catálogo de libros ----------
const GRUPOS = [
  { nombre: "Pentateuco", desde: 1, hasta: 5, color: "#d97706" },
  { nombre: "Históricos", desde: 6, hasta: 17, color: "#ca8a04" },
  { nombre: "Poéticos", desde: 18, hasta: 22, color: "#16a34a" },
  { nombre: "Profetas mayores", desde: 23, hasta: 27, color: "#0891b2" },
  { nombre: "Profetas menores", desde: 28, hasta: 39, color: "#2563eb" },
  { nombre: "Evangelios", desde: 40, hasta: 43, color: "#dc2626" },
  { nombre: "Historia", desde: 44, hasta: 44, color: "#e11d48" },
  { nombre: "Cartas de Pablo", desde: 45, hasta: 57, color: "#9333ea" },
  { nombre: "Cartas generales", desde: 58, hasta: 65, color: "#c026d3" },
  { nombre: "Profecía", desde: 66, hasta: 66, color: "#db2777" }
];

function abrirCatalogo() {
  $("p-biblia").classList.add("con-catalogo");
  $("catalogo").hidden = false;
  verLibros();
}

function cerrarCatalogo() {
  $("p-biblia").classList.remove("con-catalogo");
  $("catalogo").hidden = true;
}

function verLibros() {
  $("catTitulo").textContent = "Elige un libro";
  $("catVolver").hidden = true;
  $("catCapitulos").hidden = true;
  const cont = $("catLibros");
  cont.hidden = false;
  cont.innerHTML = "";
  ["Antiguo Testamento", "Nuevo Testamento"].forEach((testamento, t) => {
    const h = document.createElement("h3");
    h.textContent = testamento;
    cont.appendChild(h);
    GRUPOS.filter((g) => (t === 0 ? g.hasta <= 39 : g.desde >= 40)).forEach((g) => {
      const grupo = document.createElement("div");
      grupo.className = "cat-grupo";
      grupo.innerHTML = "<h4></h4><div class='cat-botones'></div>";
      grupo.querySelector("h4").textContent = g.nombre;
      for (let id = g.desde; id <= g.hasta; id++) {
        const libro = biblia.porId[id];
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = libro.nombre;
        b.title = libro.nombre + " · " + libro.capitulos.length + " cap.";
        b.disabled = !libro.capitulos.length; // libro que no viene en el archivo
        b.style.setProperty("--color", g.color);
        if (B.libro === libro) b.classList.add("actual");
        b.onclick = () => verCapitulos(libro, g.color);
        grupo.lastChild.appendChild(b);
      }
      cont.appendChild(grupo);
    });
  });
  $("catalogo").scrollTop = 0;
}

function verCapitulos(libro, color) {
  // Un libro de un solo capítulo (Abdías, Judas…) se abre directo.
  if (libro.capitulos.length === 1) return elegirCapitulo(libro, 1);
  $("catTitulo").textContent = libro.nombre;
  $("catVolver").hidden = false;
  $("catLibros").hidden = true;
  const cont = $("catCapitulos");
  cont.hidden = false;
  cont.innerHTML = "";
  libro.capitulos.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = i + 1;
    b.style.borderColor = color;
    b.onclick = () => elegirCapitulo(libro, i + 1);
    cont.appendChild(b);
  });
  $("catalogo").scrollTop = 0;
}

function elegirCapitulo(libro, cap) {
  cerrarCatalogo();
  cargarCapitulo(libro, cap);
  B.desde = B.hasta = null;
  $("cita").value = libro.nombre + " " + cap;
  $("errorCita").textContent = "";
}

$("btnLibros").onclick = () => ($("catalogo").hidden ? abrirCatalogo() : cerrarCatalogo());
$("catVolver").onclick = verLibros;
$("catCerrar").onclick = cerrarCatalogo;

// =====================================================================
// HIMNOS
// =====================================================================
const HIMNOS = (window.HIMNOS || []).filter(Boolean);
HIMNOS.forEach((h) => (h._clave = Biblia.norm(h.titulo)));
const H = { himno: null, diapos: [], idx: -1 };

const opciones = Object.assign({ titulo: true, autores: true, coro: true, lineas: "4" }, memoria.leer("himnos", {}));
$("optTitulo").checked = opciones.titulo;
$("optAutores").checked = opciones.autores;
$("optCoro").checked = opciones.coro;
$("optLineas").value = opciones.lineas;

function buscarHimnos(q) {
  q = q.trim();
  if (!q) return HIMNOS;
  if (/^\d+$/.test(q)) {
    const n = parseInt(q, 10);
    return HIMNOS.filter((h) => h.numero === n).concat(HIMNOS.filter((h) => h.numero !== n && String(h.numero).startsWith(q)));
  }
  const k = Biblia.norm(q);
  return HIMNOS.filter((h) => h._clave.includes(k));
}

// Sin búsqueda, los himnos se ven de 100 en 100 (1–100, 101–200…).
let bloque = 0;
const BLOQUES = Math.ceil(Math.max(...HIMNOS.map((h) => h.numero)) / 100);

function pintarBloques() {
  const cont = $("bloques");
  cont.innerHTML = "";
  cont.hidden = !!$("buscaHimno").value.trim();
  for (let b = 0; b < BLOQUES; b++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = b * 100 + 1 + "–" + Math.min((b + 1) * 100, HIMNOS[HIMNOS.length - 1].numero);
    btn.classList.toggle("activo", b === bloque);
    btn.onclick = () => { bloque = b; pintarResultados(); $("resultados").scrollTop = 0; };
    cont.appendChild(btn);
  }
}

function pintarResultados() {
  pintarBloques();
  const lista = $("resultados");
  lista.innerHTML = "";
  const q = $("buscaHimno").value.trim();
  const encontrados = q ? buscarHimnos(q) : HIMNOS.filter((h) => Math.floor((h.numero - 1) / 100) === bloque);
  encontrados.forEach((h, i) => {
    const li = document.createElement("li");
    li.innerHTML = "<b>" + h.numero + "</b>";
    li.appendChild(document.createTextNode(h.titulo));
    li.onclick = () => abrirHimno(h);
    if (i === 0) li.classList.add("seleccion");
    lista.appendChild(li);
  });
}

const esCoro = (v) => /^coro/i.test(v.nombre);

function armarDiapos(h) {
  const versos = h.versos.filter((v) => v.lineas && v.lineas.length && !/^(autor|contramelod)/i.test(v.nombre));
  const coros = versos.filter(esCoro);
  let orden = versos;
  // Si hay un solo coro, se repite después de cada estrofa (como se canta).
  if ($("optCoro").checked && coros.length === 1) {
    orden = [];
    versos.filter((v) => !esCoro(v)).forEach((v) => {
      orden.push(v);
      if (!/^coda/i.test(v.nombre)) orden.push(coros[0]);
    });
    if (!orden.length) orden = coros;
  }

  const cabecera = h.numero + ". " + h.titulo;
  const porDiapo = parseInt($("optLineas").value, 10) || 999;
  const diapos = [];
  if ($("optTitulo").checked) {
    const diapo = { tipo: "himno", cabecera: "Himno " + h.numero, lineas: [h.titulo] };
    if ($("optAutores").checked) {
      if (h.intro) diapo.cita = h.intro;
      if (h.autores && h.autores.length) diapo.pie = h.autores.join(" · ");
    }
    diapos.push({ etiqueta: "Título", diapo });
  }
  orden.forEach((v) => {
    const nombre = !v.nombre ? "Estrofa" : /^\d/.test(v.nombre) ? "Estrofa " + parseInt(v.nombre, 10) : v.nombre;
    const partes = Math.ceil(v.lineas.length / porDiapo);
    for (let p = 0; p < partes; p++) {
      diapos.push({
        etiqueta: nombre + (partes > 1 ? " (" + (p + 1) + "/" + partes + ")" : ""),
        diapo: { tipo: "himno", cabecera, lineas: v.lineas.slice(p * porDiapo, (p + 1) * porDiapo) }
      });
    }
  });
  return diapos;
}

function abrirHimno(h) {
  H.himno = h;
  H.diapos = armarDiapos(h);
  H.idx = -1;
  $("tituloHimno").textContent = h.numero + ". " + h.titulo;
  $("resultados").hidden = true;
  $("bloques").hidden = true;
  $("himnoSel").hidden = false;
  bloque = Math.floor((h.numero - 1) / 100); // al volver, se queda en su grupo
  const lista = $("diapos");
  lista.innerHTML = "";
  H.diapos.forEach((d, i) => {
    const li = document.createElement("li");
    const et = document.createElement("span");
    et.className = "etiqueta";
    et.textContent = d.etiqueta;
    li.appendChild(et);
    li.appendChild(document.createTextNode(d.diapo.lineas.join("\n")));
    [d.diapo.cita, d.diapo.pie].filter(Boolean).forEach((t) => {
      const extra = document.createElement("small");
      extra.className = "extra";
      extra.textContent = t;
      li.appendChild(extra);
    });
    li.onclick = () => mostrarDiapo(i);
    lista.appendChild(li);
  });
  lista.scrollTop = 0;
}

function mostrarDiapo(i) {
  if (i < 0 || i >= H.diapos.length) return;
  H.idx = i;
  const d = H.diapos[i];
  mostrar(d.diapo, "Himno " + H.himno.numero + " · " + d.etiqueta);
  marcarAire($("diapos"), i);
}

function guardarOpciones() {
  memoria.guardar("himnos", { titulo: $("optTitulo").checked, autores: $("optAutores").checked, coro: $("optCoro").checked, lineas: $("optLineas").value });
  if (H.himno) abrirHimno(H.himno);
}

$("buscaHimno").oninput = pintarResultados;
$("buscaHimno").onkeydown = (e) => {
  if (e.key === "Enter") {
    const r = buscarHimnos($("buscaHimno").value);
    if (r[0]) { abrirHimno(r[0]); $("buscaHimno").blur(); }
  }
};
function verLista() {
  $("resultados").hidden = false;
  $("himnoSel").hidden = true;
  pintarBloques();
}
$("buscaHimno").onfocus = verLista;
$("volverHimnos").onclick = () => { verLista(); $("buscaHimno").focus(); };
$("hAnt").onclick = () => mostrarDiapo(H.idx - 1);
$("hSig").onclick = () => mostrarDiapo(H.idx + 1);
["optTitulo", "optAutores", "optCoro", "optLineas"].forEach((id) => ($(id).onchange = guardarOpciones));
pintarResultados();

// =====================================================================
// DISEÑO
// =====================================================================
function cambiarEstilo(cambios) {
  Object.assign(estilos[editando], cambios);
  memoria.guardar("estilos", estilos);
  // La cabecera de la Biblia depende de "Mostrar versión".
  const b = aire.biblia;
  if (b.diapo && b.cita) b.diapo.cabecera = cabeceraBiblia(...b.cita);
  // Se actualiza al momento la salida del canal que se está editando.
  if (aire[editando].visible) {
    canal.enviar({ tipo: "estilo", canal: editando, estilo: estilos[editando], diapo: aire[editando].diapo });
  }
  pintarDiseno();
}

function pintarDiseno() {
  const e = estilos[editando];
  document.querySelectorAll('input[name="grupoEstilo"]').forEach((r) => (r.checked = r.value === editando));
  $("grupoNombre").textContent = editando === "biblia" ? "la Biblia" : "los Himnos";
  document.querySelectorAll(".solo-biblia").forEach((el) => (el.hidden = editando !== "biblia"));
  document.querySelectorAll('input[name="plantilla"]').forEach((r) => (r.checked = r.value === e.plantilla));
  [...$("fondos").children].forEach((b) => b.classList.toggle("activo", b.dataset.archivo === e.fondo));
  $("fondos").firstChild.style.backgroundColor = e.colorFondo;
  ["colorFondo", "oscurecer", "fuente", "escala", "colorTexto", "acento", "alinear", "vpos",
    "colorCaja", "opacidadCaja", "lado", "animacion"].forEach((id) => ($(id).value = e[id]));
  ["negrita", "sombra", "cabecera"].forEach((id) => ($(id).checked = e[id]));
  $("mostrarVersion").checked = e.version;
}

document.querySelectorAll('input[name="grupoEstilo"]').forEach((r) => (r.onchange = () => { editando = r.value; pintarDiseno(); }));
$("restablecer").onclick = () => cambiarEstilo(Object.assign({}, DEFECTO[editando]));

[{ nombre: "Color sólido", archivo: "" }].concat(CFG.fondos || []).forEach((f) => {
  const b = document.createElement("button");
  b.dataset.archivo = f.archivo;
  b.textContent = f.nombre;
  if (f.archivo) b.style.backgroundImage = 'url("' + f.archivo + '")';
  b.onclick = () => cambiarEstilo({ fondo: f.archivo });
  $("fondos").appendChild(b);
});
document.querySelectorAll('input[name="plantilla"]').forEach((r) => (r.onchange = () => cambiarEstilo({ plantilla: r.value })));
// Elegir un color cambia el fondo a color sólido.
$("colorFondo").oninput = () => cambiarEstilo({ colorFondo: $("colorFondo").value, fondo: "" });
["oscurecer", "escala", "opacidadCaja"].forEach((id) => ($(id).oninput = () => cambiarEstilo({ [id]: parseFloat($(id).value) })));
["colorTexto", "acento", "colorCaja"].forEach((id) => ($(id).oninput = () => cambiarEstilo({ [id]: $(id).value })));
["fuente", "alinear", "vpos", "lado", "animacion"].forEach((id) => ($(id).onchange = () => cambiarEstilo({ [id]: $(id).value })));
["negrita", "sombra", "cabecera"].forEach((id) => ($(id).onchange = () => cambiarEstilo({ [id]: $(id).checked })));
$("mostrarVersion").onchange = () => cambiarEstilo({ version: $("mostrarVersion").checked });
pintarDiseno();

// =====================================================================
// CULTO: lista guardada de citas e himnos (una sola, en común)
// =====================================================================
let culto = memoria.leer("culto", []);
let cultoActual = -1;

function avisar(texto) {
  $("errorCita").className = "aviso ok";
  $("errorCita").textContent = texto;
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => { $("errorCita").textContent = ""; }, 2500);
}

function guardarCulto() {
  memoria.guardar("culto", culto);
  pintarCulto();
}

function agregarAlCulto(item) {
  culto.push(item);
  guardarCulto();
}

function nombreItem(item) {
  if (item.tipo === "biblia") return item.ref;
  const h = HIMNOS.find((x) => x.numero === item.numero);
  return item.numero + ". " + (h ? h.titulo : "");
}

function abrirItem(i, alAire) {
  const item = culto[i];
  cultoActual = i;
  pintarCulto();
  const tab = document.querySelector('[data-pestana="' + (item.tipo === "biblia" ? "biblia" : "himnos") + '"]');
  if (!alAire) tab.click();
  if (item.tipo === "biblia") {
    if (alAire) {
      // Al aire directo: toda la cita de una vez.
      irACita(item.ref, true);
    } else {
      irACita(item.ref);
    }
  } else {
    const h = HIMNOS.find((x) => x.numero === item.numero);
    if (!h) return;
    abrirHimno(h);
    $("buscaHimno").value = "";
    $("buscaHimno").blur(); // para que ← → pasen de estrofa enseguida
    if (alAire) mostrarDiapo(0);
  }
}

function pintarCulto() {
  const lista = $("listaCulto");
  lista.innerHTML = "";
  $("cuentaCulto").textContent = culto.length ? "(" + culto.length + ")" : "";
  $("cultoVacio").hidden = culto.length > 0;
  culto.forEach((item, i) => {
    const li = document.createElement("li");
    if (i === cultoActual) li.classList.add("actual");
    const tipo = document.createElement("span");
    tipo.className = "tipo " + item.tipo;
    tipo.textContent = item.tipo === "biblia" ? "Biblia" : "Himno";
    const nombre = document.createElement("span");
    nombre.className = "nombre";
    nombre.textContent = nombreItem(item);
    li.append(tipo, nombre);
    const boton = (txt, titulo, fn, clase) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mini" + (clase ? " " + clase : "");
      b.textContent = txt;
      b.title = titulo;
      b.onclick = (e) => { e.stopPropagation(); fn(); };
      li.appendChild(b);
    };
    boton("▶", "Poner al aire", () => abrirItem(i, true), "aire");
    boton("↑", "Subir", () => mover(i, -1));
    boton("↓", "Bajar", () => mover(i, 1));
    boton("✕", "Quitar de la lista", () => { culto.splice(i, 1); if (cultoActual >= i) cultoActual--; guardarCulto(); });
    li.onclick = () => abrirItem(i, false);
    lista.appendChild(li);
  });
}

function mover(i, d) {
  const j = i + d;
  if (j < 0 || j >= culto.length) return;
  [culto[i], culto[j]] = [culto[j], culto[i]];
  if (cultoActual === i) cultoActual = j;
  else if (cultoActual === j) cultoActual = i;
  guardarCulto();
}

$("guardarCita").onclick = () => {
  // Lo escrito en la caja; si no es válido, lo que está abierto en la lista de versículos.
  let ref = null;
  const c = biblia.leerCita($("cita").value);
  if (!c.error) ref = biblia.referencia(c.libro, c.cap, c.desde, c.hasta);
  else if (B.libro) ref = biblia.referencia(B.libro, B.cap, B.desde, B.hasta);
  if (!ref) { $("errorCita").className = "aviso"; $("errorCita").textContent = "Escribe una cita para guardarla."; return; }
  agregarAlCulto({ tipo: "biblia", ref });
  avisar("Guardado en el culto: " + ref);
};
$("guardarHimno").onclick = () => {
  if (!H.himno) return;
  agregarAlCulto({ tipo: "himno", numero: H.himno.numero });
  $("guardarHimno").textContent = "✓ Guardado";
  setTimeout(() => ($("guardarHimno").textContent = "+ Culto"), 1500);
};
// Se confirma con un segundo clic (los avisos del navegador no siempre salen dentro de OBS).
$("vaciarCulto").onclick = () => {
  const b = $("vaciarCulto");
  if (!culto.length) return;
  if (!b.dataset.confirmar) {
    b.dataset.confirmar = "1";
    b.textContent = "¿Seguro? Clic otra vez para vaciar";
    setTimeout(() => { delete b.dataset.confirmar; b.textContent = "Vaciar lista"; }, 3000);
    return;
  }
  delete b.dataset.confirmar;
  b.textContent = "Vaciar lista";
  culto = [];
  cultoActual = -1;
  guardarCulto();
};
pintarCulto();

// =====================================================================
// TECLADO: ← → para pasar, Esc para ocultar
// =====================================================================
document.addEventListener("keydown", (e) => {
  const escribiendo = e.target.tagName === "INPUT" && e.target.type === "text";
  if (e.key === "Escape") {
    // Esc oculta el canal de la pestaña abierta; Shift+Esc oculta los dos.
    e.preventDefault();
    if (e.shiftKey) { ocultar("biblia"); ocultar("himnos"); }
    else ocultar(pestana === "diseno" ? editando : pestana === "culto" ? ultimo : pestana);
    e.target.blur && e.target.blur();
    return;
  }
  if (escribiendo) return;
  const sig = ["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key);
  const ant = ["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key);
  if (!sig && !ant) return;
  e.preventDefault();
  if (pestana === "biblia") pasoVersiculo(sig ? 1 : -1);
  else if (pestana === "himnos" && H.himno) mostrarDiapo(H.idx + (sig ? 1 : -1));
});

$("cita").focus();
