# Proyector Biblia e Himnario OBS

Panel gratuito para **OBS Studio** que muestra **versículos de la Biblia** y **letras de himnos** en tus transmisiones o en el proyector de la iglesia, con diseños que tú eliges y sin pagar por plantillas.

- 📖 **Biblia:** escribe "jn 3 16" y listo. Catálogo de libros y capítulos, citas recientes, rangos de versículos.
- 🎵 **Himnario:** busca por número o título; estrofas y coros en orden, con el coro repetido automáticamente.
- 📋 **Lista del culto:** prepara antes del servicio todas las citas e himnos en orden.
- 🎨 **Diseños:** tercio inferior, pantalla completa, texto + cámaras o solo texto; colores, letras, fondos y animaciones. La Biblia y los himnos tienen cada uno su propio diseño.
- 📺 **Dos salidas independientes:** puedes tener un versículo en las escenas de cámara y un himno en otra escena, sin que se estorben.
- ⌨️ **Teclado:** ← → para avanzar, Esc para ocultar.

> **Importante:** el código **no incluye** textos bíblicos ni himnarios; trae ejemplos para que veas cómo funciona. Los textos se descargan aparte: hay un **[paquete de datos listo](https://drive.google.com/file/d/1B8zye0bMZzDGIugql1sGbryPEalL_0mN/view?usp=sharing)** con la Reina-Valera 1960 y el Himnario Evangélico Presbiteriano, o puedes usar los archivos que tu iglesia ya tenga. Ver [Agregar tu Biblia y tu himnario](#4-agregar-tu-biblia-y-tu-himnario).

**¿Quieres verlo antes de instalar?** Abre la [demostración en línea](#demostración-sin-instalar) (funciona en el navegador, sin OBS).

---

## Índice

1. [Qué necesitas](#1-qué-necesitas)
2. [Descargar](#2-descargar)
3. [Conectar con OBS (contraseña)](#3-conectar-con-obs)
4. [Agregar tu Biblia y tu himnario](#4-agregar-tu-biblia-y-tu-himnario)
5. [Agregar el panel a OBS](#5-agregar-el-panel-a-obs)
6. [Agregar las salidas a tus escenas](#6-agregar-las-salidas-a-tus-escenas)
7. [Ejemplos según tu equipo](#7-ejemplos-según-tu-equipo)
8. [Cómo se usa](#8-cómo-se-usa)
9. [Diseño](#9-diseño)
10. [Problemas comunes](#10-problemas-comunes)
11. [Formato de los archivos de datos](#11-formato-de-los-archivos-de-datos)
12. [Para desarrolladores](#12-para-desarrolladores)

---

## 1. Qué necesitas

| | |
|---|---|
| **OBS Studio 28 o más reciente** | Ya trae el servidor WebSocket que usa el panel. Windows, macOS o Linux. |
| **Internet (recomendado)** | Solo para las tipografías de Google Fonts. Sin internet funciona igual, con letras del sistema. |
| **Tu Biblia y tu himnario** | En los formatos descritos abajo. Si ya usabas el *OBS Bible Plugin* de Firstfruits, sus archivos de Biblia funcionan tal cual. |

No hay que instalar nada más: son páginas web que OBS abre por dentro.

## 2. Descargar

- **Opción fácil:** en GitHub, botón verde **Code → Download ZIP**. Descomprime el ZIP en una carpeta fija, por ejemplo:
  - Windows: `C:\proyector-biblia-himnario-obs`
  - macOS: `/Users/TU_USUARIO/proyector-biblia-himnario-obs`
  - Linux: `/home/TU_USUARIO/proyector-biblia-himnario-obs`
- **Con git:** `git clone` del repositorio en esa carpeta.

> Elige una carpeta que no vayas a mover. OBS guarda la ruta, y si mueves la carpeta tendrás que volver a configurar el panel y las salidas.

Dentro verás:

```
panel.html            ← el panel de control
salida-biblia.html    ← salida que solo muestra la Biblia
salida-himnos.html    ← salida que solo muestra los himnos
salida.html           ← salida que muestra lo último (Biblia o himno)
config.ejemplo.js     ← configuración de ejemplo
datos/                ← aquí van tu Biblia y tu himnario
datos/ejemplo/        ← datos de ejemplo (no los borres)
fondos/               ← tus imágenes de fondo
```

## 3. Conectar con OBS

El panel y las salidas se comunican a través del **servidor WebSocket** de OBS.

1. En OBS: **Herramientas → Ajustes del servidor WebSocket**.
2. Marca **Habilitar servidor WebSocket**.
3. Deja **Habilitar autenticación** marcado (recomendado) y da clic en **Mostrar información de conexión** para ver el puerto y la contraseña.
4. En la carpeta del proyecto, **copia** `config.ejemplo.js` y nombra la copia **`config.js`**.
5. Abre `config.js` con el Bloc de notas (Windows), TextEdit en modo texto (macOS) o cualquier editor, y:
   - borra la línea `ejemplo: true,`
   - pon tu contraseña entre las comillas de `password: ""`
   - si el puerto no es 4455, cámbialo en `puerto`.

```js
obs: {
  host: "localhost",
  puerto: 4455,
  password: "LaContraseñaDeOBS"
},
```

**Variantes:**
- **Sin contraseña:** si desactivaste la autenticación en OBS, deja `password: ""`.
- **El panel está en otra computadora:** ver [Operador en otra computadora](#e-operador-en-otra-computadora-laptop-o-tablet).

`config.js` no se sube a GitHub (está en `.gitignore`), así que tu contraseña se queda en tu computadora.

## 4. Agregar tu Biblia y tu himnario

Copia tus archivos a la carpeta `datos` con estos nombres exactos:

| Archivo | Contenido |
|---|---|
| `datos/biblia.js` | La Biblia ([formato](#biblia)) |
| `datos/himnario.js` | El himnario ([formato](#himnario)) |

Mientras no estén, el panel usa los de `datos/ejemplo/` y muestra un **aviso amarillo**. Puedes usar solo uno de los dos; por ejemplo, solo la Biblia.

**¿De dónde saco los archivos?**
- **Paquete listo (lo más fácil):** [descarga el ZIP de datos](https://drive.google.com/file/d/1B8zye0bMZzDGIugql1sGbryPEalL_0mN/view?usp=sharing) (3 MB) con la **Biblia Reina-Valera 1960** (`biblia.js`) y el **Himnario Evangélico Presbiteriano** de 706 himnos (`himnario.js`). Descomprímelo, copia los dos archivos a la carpeta `datos` y pon `abreviatura: "RVR1960"` en `config.js`. Los textos conservan los derechos de sus titulares.
- **Biblia:** si ya usabas el **OBS Bible Plugin** (Firstfruits Studio), busca en su carpeta `obs-bible-plugin-dock/bibles/` el archivo de tu versión (por ejemplo `Reina Valera 1960.js`). Cópialo y renómbralo como `datos/biblia.js`. Funciona tal cual.
- **Versiones de dominio público** (por ejemplo, Reina-Valera 1909) se pueden convertir al formato descrito abajo.
- **Himnario:** pide el archivo a quien comparte el himnario de tu denominación, o créalo con el [formato](#himnario) (es un archivo de texto).

> Respeta los derechos: usa solo textos que tu iglesia tiene permiso de proyectar y transmitir. Para transmitir himnos con derechos, muchas iglesias usan una licencia de streaming (por ejemplo, CCLI).

En `config.js` puedes poner la abreviatura que quieres que aparezca junto a la cita:

```js
biblia: { abreviatura: "RVR1960" },
```

## 5. Agregar el panel a OBS

1. En OBS: menú **Docks → Docks de navegador personalizados…**
2. **Nombre:** `Proyector`
3. **URL:** la ruta de `panel.html` con `file:///` adelante y diagonales normales (`/`):

| Sistema | Ejemplo de URL |
|---|---|
| Windows | `file:///C:/proyector-biblia-himnario-obs/panel.html` |
| macOS | `file:///Users/TU_USUARIO/proyector-biblia-himnario-obs/panel.html` |
| Linux | `file:///home/TU_USUARIO/proyector-biblia-himnario-obs/panel.html` |

4. **Aplicar.** Aparece una ventana que puedes acoplar donde quieras (funciona mejor ancha).
5. El **punto de la esquina superior izquierda** indica la conexión:
   - 🟢 verde: conectado a OBS
   - 🟡 amarillo: conectando
   - 🔴 rojo: sin conexión (ver [Problemas comunes](#10-problemas-comunes))

> Truco para la ruta en Windows: abre la carpeta en el Explorador, haz clic en la barra de direcciones, copia la ruta (por ejemplo `C:\proyector-biblia-himnario-obs`), cambia las `\` por `/` y agrega `file:///` al inicio y `/panel.html` al final.

## 6. Agregar las salidas a tus escenas

Una **salida** es una fuente de navegador que muestra el texto en la escena. Hay tres:

| Archivo | Muestra | Úsala cuando… |
|---|---|---|
| `salida-biblia.html` | Solo la Biblia | Quieres versículos en tus escenas de cámara |
| `salida-himnos.html` | Solo los himnos | Tienes una escena especial para cantar |
| `salida.html` | Lo último que pongas, sea Biblia o himno | Tienes una sola escena y no te importa separar |

**Para agregar una salida:**

1. En la escena: **+ → Navegador → Crear nueva**. Ponle un nombre, por ejemplo `Salida Biblia`.
2. Marca **Archivo local** y elige el archivo (`salida-biblia.html`, por ejemplo).
3. **Ancho 1920, Alto 1080**. Si tu lienzo es de otro tamaño, usa el tamaño de tu lienzo y ajusta la fuente para que lo cubra.
4. **Deja DESMARCADO** "Apagar la fuente cuando no sea visible" y también "Actualizar el navegador cuando la escena se active".
5. Acomódala en la lista de fuentes:
   - **Tercio inferior / Solo texto:** hasta arriba, encima de la cámara.
   - **Pantalla completa / Texto + cámaras:** pinta un fondo en toda la pantalla, así que va **debajo** de las cámaras que quieras que se vean encima.
6. Para usar la misma salida en otra escena: **+ → Navegador → Agregar existente**.

> **Ojo con "Agregar existente":** es la misma fuente; si la cambias en una escena, cambia en todas. Si una escena necesita otra salida (Biblia vs. himnos), crea una fuente nueva.

## 7. Ejemplos según tu equipo

### A. Una cámara, solo versículos
- Escena "Cámara" → cámara + `salida-biblia.html` encima.
- Diseño de Biblia: **Tercio inferior**.

### B. Dos cámaras y una escena para cantar
- Escenas "Cámara 1" y "Cámara 2" → `salida-biblia.html` (la misma fuente con "Agregar existente").
- Escena "Himnos" → fondo + `salida-himnos.html` + las dos cámaras **encima**, a la derecha.
- Diseño de Himnos: **Texto + cámaras** (el texto ocupa la izquierda y la columna derecha, de unos 600 px, queda libre). Si tus cámaras están a la izquierda, cambia **Texto del lado** a *Derecho*.

### C. Proyector o pantalla dentro del templo
- **Con OBS:** crea una escena "Proyección" con `salida.html` y el diseño **Pantalla completa**. Clic derecho en la escena → **Proyector de pantalla completa** → elige el monitor o proyector.
- **Sin OBS:** abre `panel.html?demo` y `salida.html?demo` en el **mismo navegador** (Chrome o Edge). Pon la salida en el proyector y presiona F11. En modo `?demo` no se usa OBS: el panel y la salida se hablan directo entre pestañas.

> En Windows, para abrir con `?demo` escribe en la barra de direcciones del navegador algo como `file:///C:/proyector-biblia-himnario-obs/panel.html?demo`.

### D. Transmisión y proyector a la vez
- Usa `salida-biblia.html` en las escenas de transmisión y una escena "Proyección" con `salida.html` en el proyector de pantalla completa. Todas reciben lo mismo al mismo tiempo.

### E. Operador en otra computadora (laptop o tablet)
El panel es una página web, así que puede estar en otra computadora de la red local:
1. Copia la carpeta del proyecto (con tus datos y `config.js`) a la laptop.
2. En el `config.js` **de la laptop** pon en `host` la IP de la computadora de OBS (por ejemplo `"192.168.1.20"`).
3. En la computadora de OBS, permite el puerto 4455 en el firewall (Windows te lo pregunta la primera vez).
4. En la laptop abre `panel.html` en Chrome o Edge.
5. Las **salidas** se quedan en la computadora de OBS, como en el paso 6.

### F. Solo Biblia (sin himnario), o al revés
- Agrega solo el archivo que tengas. La otra pestaña seguirá mostrando los datos de ejemplo; simplemente no la uses.

### G. Lienzo de 1280×720
- Pon la salida en 1920×1080 y en OBS: clic derecho → **Transformar → Ajustar a la pantalla**. Se ve igual de nítido.

## 8. Cómo se usa

### Barra superior
Dos renglones, **Biblia** e **Himnos**, cada uno con lo que está **al aire** y su botón **Ocultar**. Si no hay nada al aire, el botón se ve tenue.

### Biblia
- Escribe la cita y **Enter** (o **Ir**): `Juan 3:16`, `jn 3 16-18`, `1 co 13:4-7`, `sal 23`, `cantares 2:4`.
  - **Enter solo te lleva a la cita** y marca los versículos; **no** la pone al aire.
  - **→** pone al aire el primer versículo marcado; las siguientes **→** avanzan.
- **Clic** en un versículo: lo muestra. **Shift + clic**: muestra un rango.
- **Libros:** catálogo de los 66 libros por secciones; elige libro y capítulo.
- **◀ ▶** junto al nombre del capítulo: capítulo anterior o siguiente.
- Las **citas recientes** aparecen como botoncitos debajo de la caja.
- Se aceptan nombres completos, sin acentos y abreviaturas comunes (`gn`, `ex`, `sal`, `pr`, `is`, `mt`, `mr`, `lc`, `jn`, `hch`, `ro`, `1co`, `ga`, `ef`, `fil`, `he`, `stg`, `1p`, `ap`…).

### Himnos
- Escribe el **número** o parte del **título** y Enter, o elige un grupo (**1–100**, **101–200**…).
- Clic en cada estrofa para mostrarla, o usa **→**.
- Opciones:
  - **Título primero:** diapositiva inicial con número y nombre del himno.
  - **Autores y cita:** agrega la cita bíblica y los autores a esa diapositiva.
  - **Repetir coro:** pone el coro después de cada estrofa (si el himno tiene un solo coro).
  - **Líneas:** parte las estrofas largas (4 va bien para el tercio inferior; "Todas" para pantalla completa).

### Culto (lista guardada)
- Botón **+ Culto** en la Biblia (guarda la cita escrita) o en un himno abierto.
- En la pestaña **Culto**: clic para **abrir** (sin poner al aire), **▶** para poner al aire directo, **↑ ↓** para ordenar, **✕** para quitar.
- La lista se guarda sola aunque cierres OBS. Al terminar, **Vaciar lista** (pide un segundo clic).

### Teclado
Con el panel enfocado y fuera de las cajas de texto:

| Tecla | Acción |
|---|---|
| → ↓ Espacio, Av Pág | Siguiente versículo o estrofa |
| ← ↑, Re Pág | Anterior |
| Esc | Ocultar el canal de la pestaña abierta |
| Shift + Esc | Ocultar Biblia e himnos |

## 9. Diseño

En la pestaña **Diseño**, arriba eliges **Diseño de Biblia** o **Diseño de Himnos**: cada uno guarda el suyo.

| Opción | Detalle |
|---|---|
| **Plantilla** | Tercio inferior · Pantalla completa · Texto + cámaras · Solo texto |
| **Fondo** | Una de tus imágenes o un **color sólido**, con control para oscurecer la imagen |
| **Texto** | Tipo de letra, tamaño, color, negrita, sombra, alineación, posición (arriba, centro, abajo) |
| **Encabezado** | Mostrar u ocultar la cita o el nombre del himno; mostrar la versión de la Biblia |
| **Caja (tercio inferior)** | Color y opacidad de la barra |
| **Texto + cámaras** | Lado del texto (izquierdo o derecho) |
| **Animación** | Desvanecer, deslizar, acercar o corte directo |
| **Restablecer** | Vuelve a los valores iniciales |

El tamaño de la letra se ajusta solo para que el texto quepa.

**Fondos propios:** copia tus imágenes a la carpeta `fondos/` y agrégalas en `config.js`:

```js
fondos: [
  { nombre: "Cruz", archivo: "fondos/cruz.jpg" },
  { nombre: "Atardecer", archivo: "fondos/atardecer.jpg" },
],
```

Puedes usar imágenes de otra carpeta con una ruta relativa, por ejemplo `"../Imagenes/cruz.jpg"`.

## 10. Problemas comunes

| Problema | Solución |
|---|---|
| **Punto rojo** en el panel | Revisa que OBS esté abierto, que el servidor WebSocket esté habilitado y que la contraseña y el puerto de `config.js` coincidan. Después de editar `config.js`, recarga el panel (clic derecho → **Recargar**). |
| El panel dice "OBS rechazó la contraseña" | La contraseña de `config.js` no es la de OBS. Cópiala de nuevo desde "Mostrar información de conexión". |
| El panel funciona pero **no se ve nada** en la escena | ¿La fuente está visible (el ojo)? ¿Está arriba de la cámara? ¿Es la salida correcta (Biblia vs. himnos)? ¿Elegiste "Archivo local"? |
| Se ve el texto **chiquito arriba a la izquierda**, sin diseño | La fuente tiene una versión vieja en caché: doble clic en la fuente → **Actualizar caché de la página actual**. |
| Después de **actualizar el proyecto** algo se ve raro | Recarga el panel y, en cada salida, **Actualizar caché de la página actual**. |
| Aviso amarillo de **datos de ejemplo** | Falta `datos/biblia.js`, `datos/himnario.js` o `config.js` (ver secciones 3 y 4). Revisa que los nombres sean exactos, en minúsculas. |
| Las **letras** se ven distintas a lo esperado | Las tipografías vienen de Google Fonts. Sin internet se usan letras del sistema. |
| El **dock** sale en blanco | Revisa la URL: debe empezar con `file:///` y usar `/`, no `\`. |
| No aparece un **libro** en el catálogo (gris) | Tu archivo de Biblia no trae ese libro. |
| El texto se **encima con las cámaras** en "Texto + cámaras" | Pon las cámaras encima de la salida y en la columna derecha (o cambia el lado del texto). |
| Al **recargar el panel** a media transmisión | Lo que está al aire se queda en pantalla. El panel no sabe qué hay al aire hasta que muestres u ocultes algo. |

## 11. Formato de los archivos de datos

Son archivos JavaScript de texto, en **UTF-8**.

### Biblia
Mismo formato que el *OBS Bible Plugin* (Firstfruits). `bookId` va de 1 (Génesis) a 66 (Apocalipsis):

```js
ObsBiblePlugin.importBible({
  "name": "Reina Valera 1909",
  "abbreviation": "RV1909",
  "books": [
    { "id": 1, "name": "Génesis" },
    { "id": 2, "name": "Éxodo" }
    // … los 66 libros
  ],
  "scriptures": [
    { "id": 1, "bookId": 1, "chapter": 1, "verse": 1, "text": "En el principio…" },
    { "id": 2, "bookId": 1, "chapter": 1, "verse": 2, "text": "…" }
    // … un objeto por versículo
  ]
});
```

Los nombres de los libros son los que se ven en pantalla y en el catálogo. La búsqueda acepta el nombre sin acentos, el inicio del nombre (`gen`, `apoc`) y las abreviaturas comunes.

### Himnario

```js
window.HIMNOS = [
  {
    "numero": 1,
    "titulo": "Nombre del himno",
    "intro": "Cita o frase opcional. Ro. 11:36",
    "autores": ["LETRA: …", "MÚSICA: …"],
    "versos": [
      { "nombre": "1",    "lineas": ["línea 1", "línea 2", "línea 3", "línea 4"] },
      { "nombre": "Coro", "lineas": ["…", "…"] },
      { "nombre": "2",    "lineas": ["…", "…"] }
    ]
  }
];
```

- `nombre` de cada verso: un número para las estrofas, `Coro` para el coro (cualquier texto que empiece con "Coro"), o vacío.
- `intro` y `autores` son opcionales.
- Si un himno tiene **un solo** coro y está activado "Repetir coro", el panel lo pone después de cada estrofa.

Revisa los ejemplos completos en `datos/ejemplo/`.

## 12. Para desarrolladores

- Todo es HTML, CSS y JavaScript sin dependencias ni compilación.
- `lib/obsws.js`: cliente mínimo de obs-websocket v5 (autenticación incluida). El panel envía mensajes con la petición `BroadcastCustomEvent` y las salidas los reciben como evento `CustomEvent`. En paralelo usa `BroadcastChannel` para el modo `?demo`.
- Mensajes: `mostrar`, `ocultar`, `estilo` y `estado` (con `canal: "biblia" | "himnos"`), y `hola` (una salida pide el estado actual).
- `lib/cargar.js` carga `config.js`, `datos/biblia.js` y `datos/himnario.js`, o sus versiones de ejemplo si no existen.
- La configuración del panel (diseños, lista del culto, recientes) se guarda en el `localStorage` del navegador de OBS.

### Demostración sin instalar
Si este repositorio tiene **GitHub Pages** activado, la página principal (`index.html`) tiene botones para abrir `panel.html?demo` y `salida.html?demo` en dos pestañas y probar todo con los datos de ejemplo.

---

Licencia [MIT](LICENSE) para el código. Los textos bíblicos e himnarios **no** forman parte del proyecto y conservan sus propios derechos.
