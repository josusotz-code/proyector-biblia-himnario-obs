// Índice de la Biblia y lectura de citas escritas a mano ("jn 3 16", "1 Co 13:4-7", "Salmo 23").

(function () {
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");

  // Abreviaturas comunes -> número de libro.
  const ALIAS = {
    gn: 1, gen: 1, ex: 2, lv: 3, lev: 3, nm: 4, num: 4, dt: 5, deut: 5, jos: 6, jue: 7, jc: 7, rt: 8,
    "1s": 9, "1sa": 9, "1sm": 9, "2s": 10, "2sa": 10, "2sm": 10, "1r": 11, "1re": 11, "2r": 12, "2re": 12,
    "1cr": 13, "2cr": 14, esd: 15, neh: 16, est: 17, job: 18, sal: 19, salmo: 19, ps: 19, sl: 19,
    pr: 20, prov: 20, ec: 21, ecl: 21, cnt: 22, cant: 22, ct: 22, cantares: 22, cantar: 22, is: 23, isa: 23, jer: 24, lm: 25, lam: 25,
    ez: 26, eze: 26, dn: 27, dan: 27, os: 28, jl: 29, am: 30, abd: 31, jon: 32, mi: 33, miq: 33, nah: 34,
    hab: 35, sof: 36, hag: 37, zac: 38, mal: 39, mt: 40, mat: 40, mr: 41, mc: 41, mar: 41, lc: 42, luc: 42,
    jn: 43, hch: 44, hech: 44, ro: 45, rom: 45, "1co": 46, "1cor": 46, "2co": 47, "2cor": 47, ga: 48, gal: 48,
    ef: 49, fil: 50, flp: 50, col: 51, "1ts": 52, "1tes": 52, "2ts": 53, "2tes": 53, "1ti": 54, "1tim": 54,
    "2ti": 55, "2tim": 55, tit: 56, flm: 57, he: 58, heb: 58, stg: 59, sant: 59, "1p": 60, "1pe": 60,
    "1ped": 60, "2p": 61, "2pe": 61, "2ped": 61, "1jn": 62, "2jn": 63, "3jn": 64, jud: 65, ap: 66, apoc: 66
  };

  function crearIndice(datos) {
    const libros = datos.books.map((b) => ({ id: b.id, nombre: b.name, clave: norm(b.name), capitulos: [] }));
    const porId = {};
    libros.forEach((l) => (porId[l.id] = l));
    for (const v of datos.scriptures) {
      const l = porId[v.bookId];
      (l.capitulos[v.chapter - 1] = l.capitulos[v.chapter - 1] || [])[v.verse - 1] = v.text.trim();
    }

    function buscarLibro(texto) {
      const k = norm(texto);
      if (!k) return null;
      if (ALIAS[k]) return porId[ALIAS[k]];
      return libros.find((l) => l.clave === k) || libros.find((l) => l.clave.startsWith(k)) || null;
    }

    // Devuelve { libro, cap, desde, hasta } o { error }.
    function leerCita(texto) {
      const m = texto.trim().match(/^([1-3]?\s*\.?\s*[^\d]+?)\s*(\d+)?(?:\s*[:.,\s]\s*(\d+))?(?:\s*-\s*(\d+))?\s*$/i);
      if (!m) return { error: "No entendí la cita." };
      const libro = buscarLibro(m[1]);
      if (!libro) return { error: "No encontré el libro «" + m[1].trim() + "»." };
      const cap = m[2] ? parseInt(m[2], 10) : 1;
      if (!libro.capitulos[cap - 1]) return { error: libro.nombre + " tiene " + libro.capitulos.length + " capítulos." };
      const total = libro.capitulos[cap - 1].length;
      let desde = m[3] ? parseInt(m[3], 10) : null;
      let hasta = m[4] ? parseInt(m[4], 10) : desde;
      if (desde && (desde < 1 || desde > total)) return { error: libro.nombre + " " + cap + " tiene " + total + " versículos." };
      if (hasta) hasta = Math.min(Math.max(hasta, desde), total);
      return { libro, cap, desde, hasta };
    }

    function referencia(libro, cap, desde, hasta) {
      let r = libro.nombre + " " + cap;
      if (desde) r += ":" + desde + (hasta && hasta !== desde ? "-" + hasta : "");
      return r;
    }

    return { libros, porId, buscarLibro, leerCita, referencia };
  }

  window.Biblia = { crearIndice, norm };
})();
