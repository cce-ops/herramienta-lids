# Herramienta de Diagnóstico de Ecodiseño (Rueda LIDS)

Aplicación web estática y gratuita para evaluar un producto con la metodología de la Rueda LIDS (Brezet & van Hemel). Funciona sin conexión; la IA es opcional y requiere internet.

## Uso

- **En local:** descarga el repositorio y abre `index.html` con doble clic. No requiere instalación ni servidor.
- **En la web:** activa GitHub Pages (Settings → Pages → Deploy from branch → `main` / root) y comparte la URL generada.

  https://cce-ops.github.io/herramienta-lids/

## Qué incluye

- Cuestionario guiado de 16 preguntas en 8 estrategias LIDS, ordenadas según la rueda clásica (0–7).
- Gráfico radar dibujado en canvas nativo, sin dependencias externas.
- Contexto del producto (nombre y descripción) que la IA utiliza para dar consejos específicos.
- Sugerencias técnicas locales automáticas (offline) para las 2 dimensiones con peor puntuación.
- Sugerencias con IA en formato de bullet points, con los tecnicismos aclarados entre paréntesis.
- Exportación del diagnóstico a JSON e impresión a PDF.

## Configuración de la IA (opcional)

En la pantalla de configuración se elige proveedor y modelo, y se pega la clave personal. La clave se guarda únicamente en el `localStorage` del navegador de cada usuario; nunca se incluye en el código ni se sube al repositorio.

Proveedores soportados (modelos gratuitos):

- **OpenRouter:** `nvidia/nemotron-3-ultra-550b-a55b:free`, `stealth/space-bunny-alpha`
- **Groq:** `openai/gpt-oss-120b`, `openai/gpt-oss-20b`
- **Google Gemini:** `gemini-3.8-flash`, entre otros
- **NVIDIA NIM:** `nvidia/nemotron-3-ultra-550b-a55b`, `nvidia/nemotron-4-340b-instruct`

## Estructura

| Archivo             | Contenido                                              |
|---------------------|--------------------------------------------------------|
| `index.html`        | Estructura principal, sin CDN ni dependencias externas  |
| `styles.css`        | Estilos responsive y de impresión                       |
| `app.js`            | Cuestionario, puntuaciones, contexto de producto        |
| `radar.js`          | Gráfico radar nativo y tarjetas de puntuación           |
| `ai-suggestions.js` | Sugerencias locales + conexión multi-proveedor de IA    |

## Privacidad

Todo el diagnóstico se procesa en el navegador. Solo cuando el usuario pulsa «Generar con IA» se envían el producto descrito y las puntuaciones al proveedor de IA elegido.
