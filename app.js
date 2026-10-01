/* app.js - Cuestionario LIDS por fases ciclo vida, 16 preguntas, offline */
'use strict';

const DIMENSIONES = [
  // Orden rueda LIDS clásica: 0 arriba, sentido horario 0-7 como imagen referencia
  // terms: cada término vinculado a su pregunta (q: 0 primera, 1 segunda) para pintar según respuesta
  { id: 'nuevo_concepto', nombre: '0) Nuevo concepto', fase: 'Transversal',
    terms: [{ t: 'Desmaterialización', q: 0 }, { t: 'Uso compartido', q: 1 }, { t: 'Integración funciones', q: 0 }, { t: 'De producto a servicio', q: 0 }] },
  { id: 'materiales_bajo_impacto', nombre: '1) Materiales bajo impacto', fase: 'Extracción / Materiales',
    terms: [{ t: 'Menos dañinos', q: 1 }, { t: 'Renovables', q: 0 }, { t: 'Bajo contenido energético', q: 0 }, { t: 'Reciclados', q: 0 }, { t: 'Reciclables', q: 0 }] },
  { id: 'reduccion_material', nombre: '2) Reducción materiales', fase: 'Extracción / Materiales',
    terms: [{ t: 'Reducción peso', q: 0 }, { t: 'Reducción volumen', q: 1 }] },
  { id: 'produccion_limpia', nombre: '3) Producción limpia', fase: 'Producción',
    terms: [{ t: 'Tecnología limpia', q: 0 }, { t: 'Menos pasos', q: 0 }, { t: 'Energía menor y limpia', q: 1 }, { t: 'Menos residuo', q: 0 }] },
  { id: 'distribucion', nombre: '4) Distribución eficiente', fase: 'Distribución',
    terms: [{ t: 'Envase menor/limpio/reutilizable', q: 1 }, { t: 'Transporte eficiente', q: 0 }, { t: 'Logística eficiente', q: 0 }] },
  { id: 'impacto_uso', nombre: '5) Impacto en uso', fase: 'Uso',
    terms: [{ t: 'Menor consumo energía', q: 0 }, { t: 'Fuente limpia', q: 0 }, { t: 'Menos consumibles', q: 0 }, { t: 'Cero desperdicio', q: 1 }] },
  { id: 'vida_util', nombre: '6) Vida útil producto', fase: 'Uso',
    terms: [{ t: 'Fiabilidad y durabilidad', q: 0 }, { t: 'Fácil reparación', q: 0 }, { t: 'Estructura modular', q: 1 }, { t: 'Diseño clásico', q: 0 }, { t: 'Vínculo usuario', q: 1 }] },
  { id: 'fin_vida', nombre: '7) Fin de vida', fase: 'Fin de vida',
    terms: [{ t: 'Reutilización', q: 1 }, { t: 'Remanufactura', q: 1 }, { t: 'Reciclaje materiales', q: 0 }, { t: 'Incineración limpia', q: 0 }] }
];

function mapaPreguntasPorDim() {
  const m = {};
  PREGUNTAS.forEach((p, i) => { (m[p.dim] = m[p.dim] || []).push(i); });
  return m;
}

const PREGUNTAS = [
  { dim: 'materiales_bajo_impacto', texto: '¿Usa materiales reciclados, renovables o certificados bajo impacto?', desc: 'Ej. rPET, madera FSC, acero reciclado. 1=nada virgen tóxico, 5=mayoría certificada.',
    ayuda: 'Mira tu lista de materiales: qué % es reciclado, renovable o certificado. 1 = todo virgen sin certificar. 5 = mayoría con certificado (FSC, GRS, rPET). Ej.: carcasa con 80% rPET = 4 o 5.' },
  { dim: 'materiales_bajo_impacto', texto: '¿Evita tóxicos y materiales críticos escasos?', desc: 'SVHC, halogenados, cobalto crítico, PVC. 1=sin control, 5=inventario completo + sustitución.',
    ayuda: 'Revisa fichas de seguridad (FDS) y cada pieza: PVC, retardantes halogenados, plomo, sustancias SVHC. 1 = no sabes qué contiene. 5 = inventario completo y ya sustituiste lo peor.' },
  { dim: 'reduccion_material', texto: '¿Producto aligerado al mínimo necesario?', desc: 'Espesores, nervaduras, piezas multifunción. 1=sobredimensionado, 5=optimizado topológico.',
    ayuda: '¿Pesa lo mínimo sin romperse ni perder función? 1 = macizo o sobredimensionado por si acaso. 5 = nervaduras, espesores ajustados o diseño optimizado. Compara con una alternativa ligera.' },
  { dim: 'reduccion_material', texto: '¿Minimiza embalaje y material auxiliar?', desc: 'Flat-pack, granel, sin EPS. 1=doble embalaje, 5=mono-material mínimo.',
    ayuda: 'Cuenta todo lo que acompaña al producto: cajas, espumas, film, bridas. 1 = doble caja con espuma. 5 = encaja sin relleno y en un solo material reciclable.' },
  { dim: 'produccion_limpia', texto: '¿Proceso productivo eficiente y limpio?', desc: 'Bajo consumo, poco scrap, sin disolventes. 1=alto residuo, 5=circuito cerrado.',
    ayuda: 'Piensa por unidad fabricada: energía, agua, recortes (scrap) y disolventes. 1 = mucho residuo y olor a disolvente. 5 = mermas por debajo del 3% reutilizadas, base agua, circuito cerrado.' },
  { dim: 'produccion_limpia', texto: '¿Proveedores con criterio ambiental?', desc: 'Energía renovable, ISO 14001, proximidad. 1=sin criterio, 5=auditoría + local.',
    ayuda: '¿De dónde viene cada parte y con qué energía se fabrica? 1 = origen desconocido o muy lejano. 5 = proveedores cercanos, con ISO 14001 y energía renovable demostrable.' },
  { dim: 'distribucion', texto: '¿Logística optimizada en volumen y distancia?', desc: 'Apilable, carga completa, tramo corto. 1=aire + vacío, 5=densidad máxima terrestre.',
    ayuda: 'Mira camión o contenedor: ¿viaja lleno? ¿cuántos km? 1 = medio vacío o por avión. 5 = apilable, carga completa y tramo corto por tierra o mar.' },
  { dim: 'distribucion', texto: '¿Embalaje reutilizable / reciclable?', desc: 'Mono-material, retornable. 1=mixto no reciclable, 5=retornable documentado.',
    ayuda: '¿El envase vuelve o se recicla fácil? 1 = mezcla inseparable que acaba en basura. 5 = retornable con recogida o de un solo material con reciclaje claro.' },
  { dim: 'impacto_uso', texto: '¿Bajo consumo energía / agua durante uso?', desc: 'Modo eco, clase A, sin consumibles. 1=alto consumo continuo, 5=casi cero + indicador.',
    ayuda: 'Mide lo que gasta en un uso típico (kWh, agua, consumibles). 1 = siempre encendido y gasta mucho. 5 = modo eco, apagado automático y consumo casi cero con indicador visible.' },
  { dim: 'impacto_uso', texto: '¿Informa y facilita uso eficiente?', desc: 'Manual, auto-apagado, mantenimiento simple. 1=sin info, 5=guía + diseño que evita mal uso.',
    ayuda: '¿El diseño evita que se use mal? 1 = sin manual ni avisos. 5 = guía clara, apagado auto y mantenimiento tan obvio que no hay que explicarlo.' },
  { dim: 'vida_util', texto: '¿Durable y reparable?', desc: 'Tornillos estándar, repuestos 10 años. 1=pegado desechable, 5=kit reparación + garantía 5a.',
    ayuda: '¿Se rompe pronto? ¿Se puede abrir? 1 = pegado y sin repuestos, de usar y tirar. 5 = tornillos estándar, repuestos 10 años y kit o garantía de reparación.' },
  { dim: 'vida_util', texto: '¿Mantenimiento fácil y piezas estándar?', desc: 'Filtros lavables, desgaste sustituible. 1=sellado, 5=usuario repara en 10 min.',
    ayuda: '¿Lo mantiene el usuario sin taller? 1 = sellado, solo servicio oficial. 5 = filtros lavables y piezas de desgaste cambiables en 10 minutos con guía.' },
  { dim: 'fin_vida', texto: '¿Desmontaje rápido con pocas herramientas?', desc: 'Clips, 3 materiales máx, marcado ISO. 1=>15 min / especial, 5=<3 min reversibles.',
    ayuda: 'Cronometra abrirlo con un destornillador normal. 1 = más de 15 min, herramienta especial o se rompe. 5 = menos de 3 min con clips o tornillos y plásticos marcados para reciclar.' },
  { dim: 'fin_vida', texto: '¿Existe plan recogida / segunda vida?', desc: 'Take-back, reacondicionado, gestor. 1=vertedero, 5=canal activo + etiqueta.',
    ayuda: '¿Qué pasa cuando muere el producto? 1 = a la basura sin más. 5 = lo recoges, se reacondiciona o indicas en la etiqueta el gestor autorizado.' },
  { dim: 'nuevo_concepto', texto: '¿Modelo innovador desmaterializa función?', desc: 'Alquiler, refill, modular, digital. 1=venta lineal, 5=servicio probado.',
    ayuda: '¿Vendes el objeto o la función que cumple? 1 = venta lineal de usar y tirar. 5 = alquiler, recarga (refill), módulos ampliables o versión digital ya funcionando.' },
  { dim: 'nuevo_concepto', texto: '¿Aporta beneficio social / sistémico claro?', desc: 'Acceso compartido, empleo local reparación. 1=ninguno, 5=medido y comunicado.',
    ayuda: '¿A quién beneficia además del comprador? 1 = nada medido. 5 = uso compartido, reparación local u otro impacto medido y comunicado al usuario.' }
];

const OPCIONES = [
  [1, '1 - Nada / mínimo'],
  [2, '2 - Parcial bajo'],
  [3, '3 - Moderado'],
  [4, '4 - Bueno'],
  [5, '5 - Excelente']
];

let indice = 0;
let respuestas = {}; // pregunta idx -> 1-5

function dimDePregunta(i) { return DIMENSIONES.find(d => d.id === PREGUNTAS[i].dim); }

function getProducto() {
  const n = (document.getElementById('producto-nombre').value || '').trim();
  const d = (document.getElementById('producto-desc').value || '').trim();
  return { nombre: n, desc: d };
}

function saveProducto() {
  try { localStorage.setItem('lids_producto', JSON.stringify(getProducto())); } catch (e) {}
  window.__producto = getProducto();
}

function iniciar() {
  saveProducto();
  indice = 0; respuestas = {};
  const p = getProducto();
  const tag = document.getElementById('producto-tag');
  if (tag) tag.textContent = p.nombre ? '📦 Evaluando: ' + p.nombre : '';
  mostrarSeccion('cuestionario');
  mostrarPregunta();
}

function mostrarPregunta() {
  const p = PREGUNTAS[indice];
  const dim = dimDePregunta(indice);
  document.getElementById('fase-actual').textContent = 'Fase: ' + dim.fase + ' · ' + dim.nombre;
  document.getElementById('pregunta-actual').textContent = (indice + 1) + '/' + PREGUNTAS.length + '. ' + p.texto;
  document.getElementById('pregunta-desc').textContent = p.desc;
  document.getElementById('pregunta-help').setAttribute('data-tip', p.ayuda || 'Valora del 1 al 5 según tu producto.');
  const box = document.getElementById('opciones');
  box.innerHTML = '';
  const actual = respuestas[indice];
  OPCIONES.forEach(([v, label]) => {
    const lab = document.createElement('label');
    if (actual === v) lab.classList.add('sel');
    lab.innerHTML = '<input type="radio" name="op" value="' + v + '"' + (actual === v ? ' checked' : '') + '> ' + label;
    lab.querySelector('input').addEventListener('change', () => {
      respuestas[indice] = v;
      box.querySelectorAll('label').forEach(l => l.classList.remove('sel'));
      lab.classList.add('sel');
    });
    box.appendChild(lab);
  });
  document.getElementById('btn-atras').disabled = indice === 0;
  document.getElementById('btn-siguiente').textContent = indice === PREGUNTAS.length - 1 ? 'Ver resultados ✓' : 'Siguiente →';
  const pct = (indice / PREGUNTAS.length) * 100;
  document.getElementById('barra-progreso').value = pct;
  document.getElementById('progreso-texto').textContent = 'Pregunta ' + (indice + 1) + ' de ' + PREGUNTAS.length;
}

function siguiente() {
  if (!respuestas[indice]) { alert('Selecciona una opción 1-5 para continuar.'); return; }
  if (indice < PREGUNTAS.length - 1) { indice++; mostrarPregunta(); }
  else finalizar();
}

function atras() { if (indice > 0) { indice--; mostrarPregunta(); } }

function calcularScores() {
  const scores = {};
  DIMENSIONES.forEach(d => {
    const idxs = PREGUNTAS.map((p, i) => p.dim === d.id ? i : -1).filter(i => i >= 0);
    const vals = idxs.map(i => respuestas[i] || 0);
    scores[d.id] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return scores;
}

function finalizar() {
  const scores = calcularScores();
  const prod = getProducto();
  window.__lastScores = scores;
  window.__lastDims = DIMENSIONES;
  window.__producto = prod;
  mostrarSeccion('resultados');
  generarGraficoRadar(scores, DIMENSIONES);
  mostrarPuntuaciones(scores, DIMENSIONES, respuestas, mapaPreguntasPorDim());
  mostrarSugerenciasLocales(scores, DIMENSIONES);
  const media = Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONES.length;
  const peor = [...DIMENSIONES].sort((a, b) => scores[a.id] - scores[b.id])[0];
  document.getElementById('resumen-global').innerHTML =
    (prod.nombre ? '📦 <strong>' + prod.nombre.replace(/</g, '&lt;') + '</strong><br>' : '') +
    'Media global: <strong>' + media.toFixed(1) + ' / 5</strong> · Prioridad: <strong>' + peor.nombre + ' (' + scores[peor.id].toFixed(1) + ')</strong>';
  document.getElementById('sugerencias-output').textContent = 'Sugerencias locales ya visibles arriba. Usa IA solo si quieres redacción ampliada.';
  try { localStorage.setItem('lids_last', JSON.stringify({ respuestas, scores, producto: prod })); } catch (e) {}
}

function exportar() {
  const data = { fecha: new Date().toISOString(), producto: getProducto(), respuestas, scores: window.__lastScores || calcularScores(), dimensiones: DIMENSIONES, preguntas: PREGUNTAS };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'diagnostico-lids.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

document.addEventListener('DOMContentLoaded', () => {
  initIAConfig();
  document.getElementById('btn-iniciar').addEventListener('click', iniciar);
  document.getElementById('btn-config').addEventListener('click', () => mostrarSeccion('config-ia'));
  document.getElementById('btn-config2').addEventListener('click', () => mostrarSeccion('config-ia'));
  document.getElementById('btn-siguiente').addEventListener('click', siguiente);
  document.getElementById('btn-atras').addEventListener('click', atras);
  document.getElementById('btn-sugerencias').addEventListener('click', generarSugerenciasIA);
  document.getElementById('btn-regenerar').addEventListener('click', generarSugerenciasIA);
  document.getElementById('btn-exportar').addEventListener('click', exportar);
  document.getElementById('btn-imprimir').addEventListener('click', () => window.print());
  document.getElementById('btn-reiniciar').addEventListener('click', () => location.reload());
  // Restaurar producto guardado
  try {
    const prod = JSON.parse(localStorage.getItem('lids_producto') || 'null');
    if (prod) {
      if (prod.nombre) document.getElementById('producto-nombre').value = prod.nombre;
      if (prod.desc) document.getElementById('producto-desc').value = prod.desc;
      window.__producto = prod;
    }
  } catch (e) {}
  document.getElementById('producto-nombre').addEventListener('input', saveProducto);
  document.getElementById('producto-desc').addEventListener('input', saveProducto);
  // Restaurar última sesión si existe
  try {
    const last = JSON.parse(localStorage.getItem('lids_last') || 'null');
    if (last && last.respuestas && Object.keys(last.respuestas).length === PREGUNTAS.length) {
      respuestas = last.respuestas;
    }
  } catch (e) {}
});
