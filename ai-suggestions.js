/* ai-suggestions.js - Sugerencias locales offline + IA opcional (Google Gemini) */
'use strict';

const SUGERENCIAS_LOCALES = {
  materiales_bajo_impacto: [
    'Sustituir plásticos vírgenes por reciclados o biobasados certificados (ej. rPET, PLA).',
    'Eliminar sustancias SVHC / retardantes halogenados; pedir FDS a proveedores.',
    'Priorizar madera FSC, acero reciclado o aluminio secundario según pieza.'
  ],
  reduccion_material: [
    'Aligerar pieza con nervaduras / topología; objetivo -15% peso sin perder función.',
    'Reducir espesor o número piezas; unificar funciones en una sola.',
    'Eliminar sobrematerial de embalaje interno; diseño encajable.'
  ],
  produccion_limpia: [
    'Cambiar a procesos baja Tª / bajo residuo (unión mecánica vs soldadura).',
    'Medir scrap y retrabajo; meta <3%; reutilizar mermas en misma línea.',
    'Sustituir disolventes por base agua; filtrar y recircular refrigerante.'
  ],
  distribucion: [
    'Diseño flat-pack / apilable; aumentar densidad carga +30%.',
    'Embalaje mono-material cartón reciclado; eliminar EPS.',
    'Agrupar envíos y priorizar transporte terrestre / marítimo vs aéreo.'
  ],
  impacto_uso: [
    'Reducir consumo energético en uso: modo eco, apagado auto, motor IE4.',
    'Diseñar para bajo consumible (agua, tinta, filtros lavables).',
    'Incluir manual uso eficiente + indicador consumo visible.'
  ],
  vida_util: [
    'Piezas desgaste estándar y desmontables con tornillo Torx, no pegadas.',
    'Ofrecer kit reparación + guía despiece; garantía extendida 5 años.',
    'Acabados durables reparables (aceite vs barniz) y repuestos 10 años.'
  ],
  fin_vida: [
    'Marcaje material ISO 11469 en plásticos >50 g; evitar mezclas inseparables.',
    'Uniones reversibles: clips + máximo 3 familias material por módulo.',
    'Plan take-back / segunda vida; contacto gestor autorizado en etiqueta.'
  ],
  nuevo_concepto: [
    'Evaluar producto como servicio (alquiler, refill, reparación pagada).',
    'Función compartida / modular ampliable en vez de vender unidad nueva.',
    'Digitalizar parte función (app vs hardware extra) para desmaterializar.'
  ]
};

const PROVEEDORES = {
  gemini: {
    label: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/',
    modelos: ['gemini-3.8-flash', 'gemini-3.8-live', 'gemini-3.8-live-extended-thinking', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
  }
};

const PROVEEDOR_POR_DEFECTO = 'gemini';
const PREFIJO_CLAVE = 'lids_apikey_';
const PREFIJO_MODELO = 'lids_model_';

/* Proveedor guardado que ya no existe (OpenRouter, Groq, NVIDIA NIM...): cae a Gemini. */
function proveedorValido(p) {
  return Object.prototype.hasOwnProperty.call(PROVEEDORES, p) ? p : PROVEEDOR_POR_DEFECTO;
}

function getKey(provider) {
  return localStorage.getItem(PREFIJO_CLAVE + provider) || '';
}

/* Borra claves y modelos guardados de los proveedores retirados: ya no sirven para nada. */
function limpiarProveedoresRetirados() {
  try {
    const p = localStorage.getItem('lids_provider');
    if (p && !PROVEEDORES[p]) localStorage.removeItem('lids_provider');
    [PREFIJO_CLAVE, PREFIJO_MODELO].forEach(pref => {
      Object.keys(localStorage)
        .filter(k => k.indexOf(pref) === 0 && !PROVEEDORES[k.slice(pref.length)])
        .forEach(k => localStorage.removeItem(k));
    });
  } catch (e) {}
}

function initIAConfig() {
  const selProv = document.getElementById('ia-proveedor');
  const selMod = document.getElementById('ia-modelo');
  const inpKey = document.getElementById('ia-clave');
  if (!selProv) return;
  limpiarProveedoresRetirados();
  selProv.value = proveedorValido(localStorage.getItem('lids_provider'));

  function refrescar() {
    const p = proveedorValido(selProv.value);
    selProv.value = p;
    const cfg = PROVEEDORES[p];
    selMod.innerHTML = '';
    cfg.modelos.forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      selMod.appendChild(o);
    });
    const savedMod = localStorage.getItem(PREFIJO_MODELO + p);
    if (savedMod && cfg.modelos.includes(savedMod)) selMod.value = savedMod;
    inpKey.value = getKey(p);
    setEstado('Proveedor: ' + cfg.label + '. ' + (getKey(p) ? 'Clave guardada ✓' : 'Sin clave: solo sugerencias locales.'));
  }
  selProv.addEventListener('change', refrescar);
  refrescar();

  document.getElementById('btn-guardar-clave').addEventListener('click', () => {
    const p = proveedorValido(selProv.value);
    localStorage.setItem('lids_provider', p);
    localStorage.setItem(PREFIJO_MODELO + p, selMod.value);
    localStorage.setItem(PREFIJO_CLAVE + p, inpKey.value.trim());
    setEstado(inpKey.value.trim() ? 'Clave guardada local ✓' : 'Clave borrada. Modo offline.');
  });
  document.getElementById('btn-probar-ia').addEventListener('click', probarConexionIA);
  document.getElementById('btn-volver-intro').addEventListener('click', () => {
    mostrarSeccion(window.__lastScores ? 'resultados' : 'intro');
  });
}

function setEstado(msg) {
  const el = document.getElementById('ia-estado');
  if (el) el.textContent = msg;
}

function mostrarSugerenciasLocales(scores, dimensiones) {
  const cont = document.getElementById('sugerencias-locales');
  if (!cont) return;
  const orden = [...dimensiones].sort((a, b) => (scores[a.id] || 0) - (scores[b.id] || 0));
  const peores = orden.slice(0, 2);
  cont.innerHTML = '';
  peores.forEach(d => {
    const v = (scores[d.id] || 0).toFixed(1);
    const div = document.createElement('div');
    div.className = 'sug' + ((scores[d.id] || 0) >= 3 ? ' media' : '');
    const items = (SUGERENCIAS_LOCALES[d.id] || []).map(s => '<li>' + s + '</li>').join('');
    div.innerHTML = '<strong>' + d.nombre + ' (' + v + '/5) — prioridad alta:</strong><ul>' + items + '</ul>';
    cont.appendChild(div);
  });
}

function getProductoContext() {
  if (window.__producto && (window.__producto.nombre || window.__producto.desc)) return window.__producto;
  try {
    const p = JSON.parse(localStorage.getItem('lids_producto') || 'null');
    if (p && (p.nombre || p.desc)) return p;
  } catch (e) {}
  const nEl = document.getElementById('producto-nombre');
  const dEl = document.getElementById('producto-desc');
  const n = nEl ? nEl.value.trim() : '';
  const d = dEl ? dEl.value.trim() : '';
  return { nombre: n, desc: d };
}

function construirPrompt(scores, dimensiones) {
  const lineas = dimensiones.map(d => '- ' + d.nombre + ': ' + (scores[d.id] || 0).toFixed(1) + '/5').join('\n');
  const prod = getProductoContext();
  const ctx = (prod.nombre || prod.desc)
    ? 'Producto diseñado: "' + (prod.nombre || 'sin nombre') + '"' + (prod.desc ? '\nDescripción usuario: ' + prod.desc : '') + '\n'
    : 'Producto diseñado: no especificado (consejos genéricos).\n';
  return 'Eres experto en ecodiseño que explica claro a estudiantes de diseño.\n' + ctx + 'Puntuaciones LIDS:\n' + lineas +
    '\nFORMATO OBLIGATORIO:\n' +
    '## [Nombre dimensión] (nota/5)\n' +
    '• Acción concreta específica para ESTE producto (cada tecnicismo aclarado entre paréntesis con palabras simples)\n' +
    '• Otra acción (igual, con aclaración)\n' +
    '• Tercera acción (igual)\n' +
    'Repite para las 2 puntuaciones más bajas.\n' +
    'REGLAS: solo bullet points •, nunca párrafos largos ni lista numerada densa. Cada bullet 1-2 líneas máx. Cada término técnico (ej. poliamida 6.6, torque, in-situ, UNE-EN 1335) lleva explicación corta entre paréntesis. Prohibido usar **negrita markdown**. Todo en español, ni una palabra en inglés. Frases completas, prohibido cortar texto a medias. Cubre las 2 dimensiones (6 bullets en total). Máximo 180 palabras.';
}

function renderIA(texto) {
  let h = texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[\s(])\*(?!\s)([^*\n]+)\*(?=[\s).,;:]|$)/g, '$1<em>$2</em>');
  const lineas = h.split('\n');
  let html = '', enLista = false;
  for (const ln of lineas) {
    const t = ln.trim().replace(/^&gt;\s?/, '');
    if (!t) { if (enLista) { html += '</ul>'; enLista = false; } continue; }
    const head = t.match(/^#{1,3}\s*(.+)/);
    if (head) { if (enLista) { html += '</ul>'; enLista = false; } html += '<h4>' + head[1] + '</h4>'; continue; }
    const item = t.match(/^(?:[•\-\*]|\d+[.)])\s*(.+)/);
    if (item) { if (!enLista) { html += '<ul>'; enLista = true; } html += '<li>' + item[1] + '</li>'; continue; }
    if (enLista) { html += '</ul>'; enLista = false; }
    html += '<p>' + t + '</p>';
  }
  if (enLista) html += '</ul>';
  return html;
}

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function esperar(ms) { return new Promise(res => setTimeout(res, ms)); }

async function fetchTimeout(url, opts, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms || 60000);
  try { return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal })); }
  finally { clearTimeout(t); }
}

function httpError(status, retryAfter) {
  const e = new Error('HTTP ' + status);
  e.code = status;
  e.retryAfter = retryAfter || 0;
  e.retryable = status === 429 || (status >= 500 && status <= 599);
  return e;
}

function redError(orig) {
  const e = new Error(orig && orig.name === 'AbortError' ? 'Timeout 60s sin respuesta' : 'Fallo red: ' + (orig ? orig.message : 'desconocido'));
  e.retryable = true;
  return e;
}

async function fetchModelosDisponibles(provider, key) {
  try {
    const r = await fetchTimeout(PROVEEDORES[provider].url + 'models?pageSize=100&key=' + encodeURIComponent(key), {}, 20000);
    if (!r.ok) return null;
    const data = await r.json();
    return (data.models || []).map(m => String(m.name || '').replace(/^models\//, '')).filter(Boolean);
  } catch (e) { return null; }
}

function respuestaValida(t) {
  if (!t) return false;
  const txt = t.trim();
  if (txt.length < 300) return false;
  const bullets = (txt.match(/^[•\-\*]/gm) || []).length + (txt.match(/^\d+[.)]\s+\S/gm) || []).length;
  if (bullets < 3) return false;
  return true;
}

async function llamarModelo(provider, model, prompt, key) {
  const cfg = PROVEEDORES[provider];
  const url = cfg.url + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
  let r;
  try {
    r = await fetchTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1000 } })
    });
  } catch (e) { throw redError(e); }
  if (!r.ok) throw httpError(r.status, parseInt(r.headers.get('retry-after') || '0', 10) || 0);
  const data = await r.json();
  const t = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts.map(p => p.text || '').join('');
  if (!t) { const e = new Error('Respuesta vacía del modelo'); e.retryable = true; throw e; }
  return t;
}

async function generarSugerenciasIA() {
  const out = document.getElementById('sugerencias-output');
  const provider = proveedorValido(localStorage.getItem('lids_provider') || document.getElementById('ia-proveedor').value);
  const cfg = PROVEEDORES[provider];
  const sel = localStorage.getItem(PREFIJO_MODELO + provider) || cfg.modelos[0];
  const key = getKey(provider);
  if (!key) {
    out.innerHTML = '<p>⚠️ Sin clave API para ' + esc(cfg.label) + '. Pulsa «Cambiar proveedor / clave», pégala y vuelve aquí con «Volver»: tus resultados y puntuaciones quedan intactos.</p>';
    return;
  }
  const scores = window.__lastScores || {};
  const dims = window.__lastDims || [];
  const prodCtx = getProductoContext();
  const prompt = construirPrompt(scores, dims);
  const base = [sel].concat(cfg.modelos.filter(m => m !== sel));
  const intentos = [];
  progreso('🔍 Consultando modelos disponibles en tu cuenta de ' + esc(cfg.label) + '...');
  const disp = await fetchModelosDisponibles(provider, key);
  let lista = base;
  if (disp) {
    lista = base.filter(m => disp.indexOf(m) !== -1);
    if (!lista.length) {
      out.innerHTML = '<p>❌ Ningún modelo de la lista existe en tu cuenta de ' + esc(cfg.label) + '.</p>' +
        '<p class="nota">Tu cuenta ofrece: ' + esc(disp.slice(0, 12).join(', ')) + (disp.length > 12 ? '... (+' + (disp.length - 12) + ')' : '') + '</p>' +
        '<p>Actualiza la lista de modelos. Resultados intactos.</p>';
      return;
    }
    if (lista[0] !== sel) intentos.push('⚠ ' + esc(sel) + ' no existe en tu cuenta, empiezo por ' + esc(lista[0]));
  }

  function progreso(msg) {
    out.innerHTML = '<p>' + msg + '</p>' + (intentos.length ? '<p class="nota">' + intentos.join('<br>') + '</p>' : '');
  }

  for (let i = 0; i < lista.length; i++) {
    const m = lista[i];
    for (let att = 1; att <= 2; att++) {
      progreso('⏳ Probando <strong>' + esc(m) + '</strong> (' + (i + 1) + '/' + lista.length + ', intento ' + att + '/2)...' + (prodCtx.nombre ? ' Producto: ' + esc(prodCtx.nombre) : ''));
      try {
        const texto = await llamarModelo(provider, m, prompt, key);
        if (!respuestaValida(texto)) {
          intentos.push('✕ ' + esc(m) + ': respuesta pobre o cortada (' + texto.trim().length + ' caracteres, sin bullets completos) → siguiente modelo');
          break;
        }
        out.innerHTML = renderIA(texto) + '<p class="nota">✓ Generado con ' + esc(provider) + ' / ' + esc(m) + ((att > 1 || i > 0) ? ' (tras reintento / modelo respaldo)' : '') + '</p>';
        return;
      } catch (e) {
        if (e.code === 401 || e.code === 403) {
          out.innerHTML = '<p>❌ Clave API rechazada por ' + esc(cfg.label) + ' (HTTP ' + e.code + '). Revisa clave en «Cambiar proveedor / clave». Resultados intactos, nada que repetir.</p>';
          return;
        }
        if (e.retryable && att === 1) {
          const s = e.code === 429 ? Math.min(Math.max(e.retryAfter || 4, 2), 30) : 3;
          intentos.push('↻ ' + esc(m) + ': fallo ' + (e.code ? 'HTTP ' + e.code : esc(e.message)) + ' → reintento en ' + s + 's...');
          progreso('⏳ ' + esc(m) + ' falló (' + (e.code ? 'HTTP ' + e.code : 'red') + '). Reintento en ' + s + 's...');
          await esperar(s * 1000);
        } else {
          intentos.push('✕ ' + esc(m) + ': ' + (e.code ? 'HTTP ' + e.code + ' ' : '') + esc(e.message) + (e.code === 404 ? ' (modelo no disponible, paso al siguiente)' : ''));
          break;
        }
      }
    }
  }
  out.innerHTML = '<p>❌ Fallaron los ' + lista.length + ' modelos de ' + esc(cfg.label) + '.</p>' +
    '<p class="nota">' + intentos.join('<br>') + '</p>' +
    '<p>Sugerencias locales de arriba siguen válidas. Verifica la conexión o revisa tu clave. Resultados intactos.</p>';
}

async function probarConexionIA() {
  const p = proveedorValido(document.getElementById('ia-proveedor').value);
  const key = document.getElementById('ia-clave').value.trim();
  if (!key) { setEstado('Pega clave primero.'); return; }
  setEstado('Probando ' + PROVEEDORES[p].label + '...');
  try {
    const m = document.getElementById('ia-modelo').value;
    const r = await fetch(PROVEEDORES[p].url + encodeURIComponent(m) + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Responde solo: OK' }] }] })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    setEstado('✓ Conexión ' + PROVEEDORES[p].label + ' OK.');
  } catch (e) {
    setEstado('❌ Fallo: ' + e.message);
  }
}

function mostrarSeccion(id) {
  ['intro', 'config-ia', 'cuestionario', 'resultados'].forEach(s => {
    document.getElementById(s).classList.toggle('oculto', s !== id);
  });
  window.scrollTo(0, 0);
}
