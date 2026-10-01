/* ai-suggestions.js - Sugerencias locales offline + IA multi-proveedor opcional */
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
  openrouter: {
    label: 'OpenRouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    modelos: ['nvidia/nemotron-3-ultra-550b-a55b:free', 'stealth/space-bunny-alpha'],
    tipo: 'openai'
  },
  groq: {
    label: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    modelos: ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
    tipo: 'openai'
  },
  nvidia: {
    label: 'NVIDIA NIM',
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    modelos: ['nvidia/nemotron-3-ultra-550b-a55b', 'nvidia/nemotron-4-340b-instruct'],
    tipo: 'openai'
  },
  gemini: {
    label: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/',
    modelos: ['gemini-3.8-flash', 'gemini-3.8-live', 'gemini-3.7-flash', 'gemini-3.5-flash'],
    tipo: 'gemini'
  }
};

function getKey(provider) {
  return localStorage.getItem('lids_apikey_' + provider) || '';
}

function initIAConfig() {
  const selProv = document.getElementById('ia-proveedor');
  const selMod = document.getElementById('ia-modelo');
  const inpKey = document.getElementById('ia-clave');
  if (!selProv) return;
  const savedProv = localStorage.getItem('lids_provider') || 'openrouter';
  selProv.value = savedProv;

  function refrescar() {
    const p = selProv.value;
    const cfg = PROVEEDORES[p];
    selMod.innerHTML = '';
    cfg.modelos.forEach(m => {
      const o = document.createElement('option');
      o.value = m; o.textContent = m;
      selMod.appendChild(o);
    });
    const savedMod = localStorage.getItem('lids_model_' + p);
    if (savedMod && cfg.modelos.includes(savedMod)) selMod.value = savedMod;
    inpKey.value = getKey(p);
    setEstado('Proveedor: ' + cfg.label + '. ' + (getKey(p) ? 'Clave guardada ✓' : 'Sin clave: solo sugerencias locales.'));
  }
  selProv.addEventListener('change', refrescar);
  refrescar();

  document.getElementById('btn-guardar-clave').addEventListener('click', () => {
    const p = selProv.value;
    localStorage.setItem('lids_provider', p);
    localStorage.setItem('lids_model_' + p, selMod.value);
    localStorage.setItem('lids_apikey_' + p, inpKey.value.trim());
    setEstado(inpKey.value.trim() ? 'Clave guardada local ✓' : 'Clave borrada. Modo offline.');
  });
  document.getElementById('btn-probar-ia').addEventListener('click', probarConexionIA);
  document.getElementById('btn-volver-intro').addEventListener('click', () => {
    mostrarSeccion('intro');
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
    'REGLAS: solo bullet points •, nunca párrafos largos ni lista numerada densa. Cada bullet 1-2 líneas máx. Cada término técnico (ej. poliamida 6.6, torque, in-situ, UNE-EN 1335) lleva explicación corta entre paréntesis. Prohibido usar **negrita markdown**. Español sencillo, máximo 180 palabras.';
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

async function generarSugerenciasIA() {
  const out = document.getElementById('sugerencias-output');
  const provider = localStorage.getItem('lids_provider') || document.getElementById('ia-proveedor').value || 'openrouter';
  const model = localStorage.getItem('lids_model_' + provider) || PROVEEDORES[provider].modelos[0];
  const key = getKey(provider);
  if (!key) {
    out.textContent = '⚠️ Sin clave API para ' + provider + '. Configura en ⚙️ Configurar IA. Mientras tanto usa sugerencias locales de arriba (offline).';
    mostrarSeccion('config-ia');
    return;
  }
  const scores = window.__lastScores || {};
  const dims = window.__lastDims || [];
  const prodCtx = getProductoContext();
  const prompt = construirPrompt(scores, dims);
  out.textContent = '⏳ Analizando ' + (prodCtx.nombre ? '"' + prodCtx.nombre + '" ' : '') + 'con ' + provider + ' / ' + model + '...';

  try {
    let texto;
    if (PROVEEDORES[provider].tipo === 'gemini') {
      const url = PROVEEDORES[provider].url + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 600 } })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      texto = data.candidates && data.candidates[0] && data.candidates[0].content.parts.map(p => p.text).join('');
    } else {
      const r = await fetch(PROVEEDORES[provider].url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + key,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.href,
          'X-Title': 'Diagnostico LIDS'
        },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 600 })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const data = await r.json();
      texto = data.choices[0].message.content;
    }
    out.innerHTML = renderIA(texto || 'Respuesta vacía del modelo.');
  } catch (e) {
    console.error(e);
    out.textContent = '❌ Fallo IA (' + e.message + '). Verifica clave, modelo y conexión. Sugerencias locales siguen válidas arriba.';
  }
}

async function probarConexionIA() {
  const p = document.getElementById('ia-proveedor').value;
  const key = document.getElementById('ia-clave').value.trim();
  if (!key) { setEstado('Pega clave primero.'); return; }
  setEstado('Probando ' + p + '...');
  try {
    if (PROVEEDORES[p].tipo === 'gemini') {
      const m = document.getElementById('ia-modelo').value;
      const r = await fetch(PROVEEDORES[p].url + encodeURIComponent(m) + ':generateContent?key=' + encodeURIComponent(key), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Responde solo: OK' }] }] })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setEstado('✓ Conexión Gemini OK.');
    } else {
      const m = document.getElementById('ia-modelo').value;
      const r = await fetch(PROVEEDORES[p].url, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Responde solo: OK' }], max_tokens: 5 })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      setEstado('✓ Conexión ' + p + ' OK.');
    }
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
