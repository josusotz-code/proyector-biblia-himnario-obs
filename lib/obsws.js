// Cliente mínimo de obs-websocket v5 + canal local (BroadcastChannel) para pruebas fuera de OBS.
// Uso: const canal = Canal.crear(onMensaje, onEstado); canal.enviar({ tipo: "...", ... });

(function () {
  // ---- SHA-256 (necesario para la autenticación de obs-websocket) ----
  function sha256(bytes) {
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);
    const H = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    const len = bytes.length;
    const total = ((len + 9 + 63) >> 6) << 6;
    const m = new Uint8Array(total);
    m.set(bytes);
    m[len] = 0x80;
    const bits = len * 8;
    m[total - 4] = bits >>> 24; m[total - 3] = bits >>> 16; m[total - 2] = bits >>> 8; m[total - 1] = bits;
    m[total - 8] = Math.floor(len / 0x20000000);
    const w = new Uint32Array(64);
    const rotr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let i = 0; i < total; i += 64) {
      for (let t = 0; t < 16; t++) {
        w[t] = (m[i + t * 4] << 24) | (m[i + t * 4 + 1] << 16) | (m[i + t * 4 + 2] << 8) | m[i + t * 4 + 3];
      }
      for (let t = 16; t < 64; t++) {
        const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let t = 0; t < 64; t++) {
        const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    const out = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      out[i * 4] = H[i] >>> 24; out[i * 4 + 1] = H[i] >>> 16; out[i * 4 + 2] = H[i] >>> 8; out[i * 4 + 3] = H[i];
    }
    return out;
  }

  const utf8 = (s) => new TextEncoder().encode(s);
  const b64 = (bytes) => btoa(String.fromCharCode.apply(null, bytes));
  const authString = (password, salt, challenge) =>
    b64(sha256(utf8(b64(sha256(utf8(password + salt))) + challenge)));

  const APP = "proyector-biblia-himnario-obs";

  function crear(onMensaje, onEstado) {
    const cfg = (window.PROYECTOR_CONFIG && window.PROYECTOR_CONFIG.obs) || {};
    const origen = Math.random().toString(36).slice(2);
    const vistos = new Set();
    let ws = null;
    let listo = false;
    let reintento = null;

    function recibir(m) {
      if (!m || m.app !== APP || m.origen === origen || vistos.has(m.id)) return;
      vistos.add(m.id);
      if (vistos.size > 200) vistos.delete(vistos.values().next().value);
      onMensaje(m);
    }

    // Canal local: permite probar panel y salida en dos pestañas del mismo navegador.
    let bc = null;
    try {
      bc = new BroadcastChannel(APP);
      bc.onmessage = (e) => recibir(e.data);
    } catch (e) { /* no disponible */ }

    // Modo demostración (?demo en la dirección): no se conecta a OBS, solo entre pestañas.
    const demo = new URLSearchParams(location.search).has("demo");
    // En demo, respaldo para páginas abiertas como archivo (file://), donde BroadcastChannel
    // puede no funcionar: el evento "storage" avisa a las demás pestañas del navegador.
    if (demo) {
      window.addEventListener("storage", (e) => {
        if (e.key !== APP || !e.newValue) return;
        try { recibir(JSON.parse(e.newValue)); } catch (err) { /* mensaje inválido */ }
      });
    }

    function estado(s, detalle) {
      if (onEstado) onEstado(s, detalle);
    }

    function conectar() {
      clearTimeout(reintento);
      listo = false;
      estado("conectando");
      try {
        ws = new WebSocket("ws://" + (cfg.host || "localhost") + ":" + (cfg.puerto || 4455));
      } catch (e) {
        estado("error", String(e));
        reintento = setTimeout(conectar, 3000);
        return;
      }
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.op === 0) {
          const d = { rpcVersion: 1, eventSubscriptions: 1 }; // 1 = General (incluye CustomEvent)
          if (msg.d.authentication) {
            d.authentication = authString(cfg.password || "", msg.d.authentication.salt, msg.d.authentication.challenge);
          }
          ws.send(JSON.stringify({ op: 1, d }));
        } else if (msg.op === 2) {
          listo = true;
          estado("conectado");
        } else if (msg.op === 5 && msg.d.eventType === "CustomEvent") {
          recibir(msg.d.eventData);
        }
      };
      ws.onclose = (ev) => {
        listo = false;
        // 4009 = contraseña incorrecta
        estado(ev.code === 4009 ? "contraseña" : "desconectado", ev.code);
        reintento = setTimeout(conectar, ev.code === 4009 ? 10000 : 3000);
      };
      ws.onerror = () => {};
    }

    function enviar(datos) {
      const m = Object.assign({ app: APP, origen, id: origen + Date.now() + Math.random() }, datos);
      vistos.add(m.id);
      if (bc) bc.postMessage(m);
      if (demo) {
        try { localStorage.setItem(APP, JSON.stringify(m)); } catch (e) { /* sin almacenamiento */ }
      }
      if (ws && listo) {
        ws.send(JSON.stringify({
          op: 6,
          d: { requestType: "BroadcastCustomEvent", requestId: m.id, requestData: { eventData: m } }
        }));
      }
    }

    function peticion(requestType, requestData) {
      if (!ws || !listo) return;
      ws.send(JSON.stringify({ op: 6, d: { requestType, requestId: "r" + Date.now(), requestData } }));
    }

    if (demo) estado("demo");
    else conectar();
    return { enviar, peticion, conectado: () => listo };
  }

  window.Canal = { crear, _sha256: sha256, _authString: authString };
})();
