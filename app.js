/* app.js - Cuestionario LIDS por fases ciclo vida, 16 preguntas, offline + selector Producto/Servicio */
'use strict';

// ---------- CONFIGURATION ----------
const DIMENSIONES = [
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
    terms: [{ t: 'Menor consumo energía', q: 0 }, { t: 'Fuente limpia', q: 0 }, { t: 'Menor consumibles', q: 0 }, { t: 'Cero desperdicio', q: 1 }] },
  { id: 'vida_util', nombre: '6) Vida útil producto', fase: 'Uso',
    terms: [{ t: 'Fiabilidad y durabilidad', q: 0 }, { t: 'Fácil reparación', q: 0 }, { t: 'Estructura modular', q: 1 }, { t: 'Diseño clásico', q: 0 }, { t: 'Vínculo usuario', q: 1 }] },
  { id: 'fin_vida', nombre: '7) Fin de vida', fase: 'Fin de vida',
    terms: [{ t: 'Reutilización', q: 1 }, { t: 'Remanufactura', q: 1 }, { t: 'Reciclaje materiales', q: 0 }, { t: 'Incineración limpia', q: 0 }] }
];

// Preguntas modo Producto (estructura original)
const PREGUNTAS_PROD = [
  { dim: 'materiales_bajo_impacto', texto: '¿Usa materiales reciclados, renovables o certificados bajo impacto?', desc: 'Ej. rPET, madera FSC, acero reciclado. 1=nada virgen tóxico, 5=mayoría certificada.',
    ayuda: 'Mira tu lista de materiales: qué % es reciclado, renovable o certificado. 1 = todo virgen sin certificar. 5 = mayoría con certificado (FSC, GRS, rPET). Ej.: carcasa con 80% rPET = 4 o 5.' },
  { dim: 'materiales_bajo_impacto', texto: '¿Evita tóxicos y materiales críticos escasos?', desc: 'SVHC, halogenados, cobalto crítico, PVC. 1=sin control, 5=inventario completo + sustitución.',
    ayuda: 'Revisa fichas de seguridad (FDS) y cada pieza: PVC, retardantes halogenados, plomo, sustancias SVHC. 1 = no sabes qué contiene. 5 = inventario completo y ya sustituiste lo peor.' },
  { dim: 'reduccion_material', texto: '¿Producto aligerado al mínimo necesario?', desc: 'Espesores, nervaduras, piezas multifunción. 1=sobredimensionado, 5=optimizado topológico.',
    ayuda: '¿Pesa lo mínimo sin romperse ni perder función? 1 = macizo o sobredimensionado por si acaso. 5 = nervaduras, espesores ajustados o diseño optimizado. Compara con una alternativa ligera.' },
  { dim: 'reduccion_material', texto: '¿Minimiza embalaje y material auxiliar?', desc: 'Flat‑pack, granel, sin EPS. 1=doble embalaje, 5=mono‑material mínimo.',
    ayuda: 'Cuenta todo lo que acompaña al producto: cajas, espumas, film, bridas. 1 = doble caja con espuma. 5 = encaja sin relleno y en un solo material reciclable.' },
  { dim: 'produccion_limpia', texto: '¿Proceso productivo eficiente y limpio?', desc: 'Bajo consumo, poco scrap, sin disolventes. 1=alto residuo, 5=circuito cerrado.',
    ayuda: 'Piensa por unidad fabricada: energía, agua, recortes (scrap) y disolventes. 1 = mucho residuo y olor a disolvente. 5 = mermas por debajo del 3% reutilizadas, base agua, circuito cerrado.' },
  { dim: 'produccion_limpia', texto: '¿Proveedores con criterio ambiental?', desc: 'Energía renovable, ISO 14001, proximidad. 1=sin criterio, 5=auditoría + local.',
    ayuda: '¿De dónde viene cada parte y con qué energía se fabrica? 1 = origen desconocido o muy lejano. 5 = proveedores cercanos, con ISO 14001 y energía renovable demostrable.' },
  { dim: 'distribucion', texto: '¿Logística optimizada en volumen y distancia?', desc: 'Apilable, carga completa, tramo corto. 1=aire + vacío, 5=densidad máxima terrestre.',
    ayuda: 'Mira camión o contenedor: ¿viaja lleno? ¿cuántos km? 1 = medio vacío o por avión. 5 = apilable, carga completa y tramo corto por tierra o mar.' },
  { dim: 'distribucion', texto: '¿Embalaje reutilizable / reciclable?', desc: 'Mono‑material, retornable. 1=mezcla inseparable que acaba en basura. 5=retornable documentado.',
    ayuda: '¿El envase vuelve o se recicla fácil? 1 = mezcla inseparable que acaba en basura. 5 = retornable con recogida o de un solo material con reciclaje claro.' },
  { dim: 'impacto_uso', texto: '¿Bajo consumo energía / agua durante uso?', desc: 'Modo eco, clase A, sin consumibles. 1=alto consumo continuo, 5=casi cero + indicador.',
    ayuda: 'Mide lo que gasta en un uso típico (kWh, agua, consumibles). 1 = siempre encendido y gasta mucho. 5 = modo eco, apagado automático y consumo casi cero visible.' },
  { dim: 'impacto_uso', texto: '¿Informa y facilita uso eficiente?', desc: 'Manual, auto‑apagado, mantenimiento simple. 1=sin info, 5=guía + diseño que evita mal uso.',
    ayuda: '¿El diseño evita que se use mal? 1 = sin manual ni avisos. 5 = guía clara, apagado auto y mantenimiento tan obvio que no hay que explicarlo.' },
  { dim: 'vida_util', texto: '¿Durable y reparable?', desc: 'Tornillos estándar, repuestos 10 años. 1=pegado desechable, 5=kit reparación + garantía 5 años.',
    ayuda: '¿Se rompe pronto? ¿Se puede abrir? 1 = pegado y sin repuestos, de usar y tirar. 5 = tornillos estándar, repuestos 10 años y kit o garantía de reparación.' },
  { dim: 'vida_util', texto: '¿Mantenimiento fácil y piezas estándar?', desc: 'Filtros lavables, desgaste sustituible. 1=sellado, 5=usuario repara en 10 min.',
    ayuda: '¿Lo mantiene el usuario sin taller? 1 = solo servicio oficial. 5 = filtros lavables y piezas de desgaste cambiables en 10 min con guía.' },
  { dim: 'fin_vida', texto: '¿Desmontaje rápido con pocas herramientas?', desc: 'Clips, 3 materiales máx, marcado ISO. 1=>15 min / especial, 5=<3 min reversibles.',
    ayuda: 'Cronometra abrirlo con un destornillador normal. 1 = más de 15 min, herramienta especial o se rompe. 5 = menos de 3 min con clips o tornillos y plásticos marcados para reciclar.' },
  { dim: 'fin_vida', texto: '¿Existe plan recogida / segunda vida?', desc: 'Take‑back, reacondicionado, gestor. 1=vertedero, 5=canal activo + etiqueta.',
    ayuda: '¿Qué pasa cuando muere el producto? 1 = a la basura sin más. 5 = lo recoges, se reacondiciona o indicas gestor autorizado al usuario.' },
  { dim: 'nuevo_concepto', texto: '¿Modelo innovador desmaterializa función?', desc: 'Alquiler, refill, modular, digital. 1=venta lineal, 5=servicio probado.',
    ayuda: '¿Vendes el objeto o la función que cumple? 1 = venta lineal de usar y tirar. 5 = alquiler, recarga (refill), módulos ampliables o versión digital ya funcionando.' },
  { dim: 'nuevo_concepto', texto: '¿Aporta beneficio social / sistémico claro?', desc: 'Acceso compartido, empleo local reparación. 1=ninguno, 5=medido y comunicado.',
    ayuda: '¿A quién beneficia además del comprador? 1=ninguno, 5=uso compartido, reparación local u otro impacto medido y comunicado al usuario.' }
];

// Preguntas modo Servicio (mismas dimensiones, redacción adaptada)
const PREGUNTAS_SERV = [
  { dim: 'materiales_bajo_impacto', texto: '¿El servicio evita materiales vírgenes o críticos por uso?', desc: 'Infraestructura, hardware, licencias. 1=vírgenes sin control, 5=predominantemente renovables o reciclados.',
    ayuda: 'Revisa qué hardware/licencias se proveen. 1 = compra nueva cada vez. 5 = renovables, reciclados o reacondicionados con inventario conocido.' },
  { dim: 'materiales_bajo_impacto', texto: '¿Evita sustancias tóxicas o críticas en infraestructura?', desc: 'HVAC químico, refrigerantes, componentes con metales críticos. 1=sin inventario, 5=inventario completo + sustitución.',
    ayuda: 'Revisa componentes químicos y de hardware: retardantes halogenados, plomo, cobalto crítico. 1 = no sabe qué contiene. 5 = inventario completo y ya sustituyó lo peor.' },
  { dim: 'reduccion_material', texto: '¿Infrastructure aligerada al mínimo necesario?', desc: 'Servidores, ancho de red, recursos asignados. 1=sobredimensionado, 5=optimizado topológicamente.',
    ayuda: '¿Los recursos usados son estrictamente los mínimos? 1 = sobre‑provisionado por seguridad. 5 = topología eficiente, sin desperdicio de capacidad.' },
  { dim: 'reduccion_material', texto: '¿Minimiza recursos auxiliares y embalaje digital?', desc: 'Adjuntos, cache, logs, paquetes innecesarios. 1=doble embalaje, 5=mono‑material mínimo.',
    ayuda: 'Cuenta todo lo adicional: logs excesivos, archivos temporales sin purgar, paquetes redundantes. 1 = generosos sin cleaning. 5 = purge automática, sin caché residual.' },
  { dim: 'produccion_limpia', texto: '¿Procesos de puesta en marcha y operación eficaces y limpios?', desc: 'Consumo energía, proveedores, centro de datos. 1=alto residuo, 5=circuito cerrado o renovables.',
    ayuda: 'Piensa por sesión/hora: energía, agua, recortes y químicos. 1 = mucho residuo y alto consumo. 5 = base agua, eficiencia certificada, reutilización mermas.' },
  { dim: 'produccion_limpia', texto: '¿Proveedores con criterio ambiental demostrable?', desc: 'Energía renovable, certificaciones, proximidad. 1=sin criterio, 5=auditoría + local.',
    ayuda: '¿De dónde viene cada parte y con qué energía? 1 = origen desconocido o muy lejano. 5 = proveedores cercanos, con energía verde demostrada.' },
  { dim: 'distribucion', texto: '¿Canales de distribución optimizados en volumen y distancia?', desc: 'Descargas, CDN, delivery digital. 1=aire + vacío, 5=densidad máxima terrestre/marítima.',
    ayuda: 'Mira ancho de banda o transfers: ¿quién entrega y cuántos km/saltos? 1 = descarga por enlace lento o transfer intercontinental. 5 = CDN local o distribución P2P eficiente.' },
  { dim: 'distribucion', texto: '¿Embalaje/Retorno optimizado?', desc: 'Digital=meta‑cero físicos. 1=materiales físicos innecesarios, 5=servicios retornables o take‑back documentado.',
    ayuda: '¿Hay materiales físicos al inicio o al fin? 1 = siempre vienen con caja/folleto físico. 5 = totalmente digital o con retorno documentado.' },
  { dim: 'impacto_uso', texto: '¿Consumo energía / agua durante uso de usuario final bajo?', desc: 'Dispositivos, endpoints, uso real. 1=alto consumo continuo, 5=casi cero + indicador.',
    ayuda: 'Mide lo que gasta el equipo del usuario final en uso típico. 1 = siempre encendido y gasta mucho. 5 = modo eco, apagado automático, consumo casi cero visible.' },
  { dim: 'impacto_uso', texto: '¿Informa y facilita uso eficiente por usuario?', desc: 'Manual, auto‑apagado, mantenimiento simple. 1=sin info, 5=guía + diseño que evita mal uso.',
    ayuda: '¿El diseño evita que se use mal? 1 = sin manual ni avisos. 5 = guía clara, apagado auto y mantenimiento tan obvio que no hay que explicarlo.' },
  { dim: 'vida_util', texto: '¿Durable y reparable la infrastructure?', desc: 'Componentes, actualizaciones, reemplazables. 1=pegado obsoleto, 5=kit reparación + garantía extendida.',
    ayuda: '¿Se rompe pronto? ¿Se puede actualizar o reparar? 1 = sellado y de usar y tirar. 5 = piezas intercambiables, garantía 5 + años.' },
  { dim: 'vida_util', texto: '¿Mantenimiento fácil y piezas/actualizaciones estándar?', desc: 'Guías, herramientas, reemplazables. 1=sellado, 5=usuario repara en 10 min o actualiza sin técnico.',
    ayuda: '¿Lo mantiene el usuario sin asistencia técnica? 1 = solo servicio oficial. 5 = filtros lavables y piezas/actualizaciones auto‑reparables en 10 min.' },
  { dim: 'fin_vida', texto: '¿Desmontaje rápido con pocas herramientas para transición?', desc: 'Actualizaciones, migración, cese operaciones. 1=>15 min / especial, 5=<3 min reversibles.',
    ayuda: 'Cronometra cerrar o migrar el servicio. 1 = más de 15 min, herramienta especial o se rompe. 5 = menos de 3 min con pasos simples y documentados.' },
  { dim: 'fin_vida', texto: '¿Existe plan recogida / segunda vida / reacondicionado?', desc: 'Take‑back, reacondicionado, gestor. 1=vertedero, 5=canal activo + etiqueta.',
    ayuda: '¿Qué pasa cuando muere el servicio o caduca? 1 = a la basura / sin más. 5 = lo recoges, se reacondiciona o indicas gestor autorizado al usuario.' },
  { dim: 'nuevo_concepto', texto: '¿Modelo innovador desmaterializa función?', desc: 'SaaS, refill, modular, digital. 1=venta lineal, 5=servicio probado.',
    ayuda: '¿Vendes la función o el objeto/licencia? 1 = venta lineal de licencia perpetua. 5 = alquiler, recarga (refill), módulos ampliables o versión digital ya funcionando.' },
  { dim: 'nuevo_concepto', texto: '¿Aporta beneficio social / sistémico claro?', desc: 'Acceso compartido, empleo local reparación. 1=ninguno, 5=medido y comunicado.',
    ayuda: '¿A quién beneficia además del contratante/usuario? 1=ninguno, 5=uso compartido, reparación local u otro impacto medido y comunicado al usuario.' }
];

const OPCIONES = [
  [1, '1 - Nada / mínimo'],
  [2, '2 - Parcial bajo'],
  [3, '3 - Moderado'],
  [4, '4 - Bueno'],
  [5, '5 - Excelente']
];

let indice = 0;
let respuestas = {};
let modoActual = 'producto';

// Helper to get the dimension for the current mode and question index
function dimDePregunta(i) {
  const preguntas = modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV;
  const p = preguntas[i];
  return DIMENSIONES.find(d => d.id === p.dim);
}

// ---------- UTILIDADES ----------
function getProducto() {
  const n = (document.getElementById('producto-nombre').value || '').trim();
  const d = (document.getElementById('producto-desc').value || '').trim();
  return { nombre: n, desc: d };
}
function getServicio() {
  const n = (document.getElementById('servicio-nombre').value || '').trim();
  const d = (document.getElementById('servicio-desc').value || '').trim();
  return { nombre: n, desc: d };
}
function saveProducto() {
  try { localStorage.setItem('lids_producto', JSON.stringify(getProducto())); } catch (e) {}
  window.__producto = getProducto();
}
function saveServicio() {
  try { localStorage.setItem('lids_servicio', JSON.stringify(getServicio())); } catch (e) {}
  window.__servicio = getServicio();
}
function iniciar() {
  saveProducto(); saveServicio();
  indice = 0; respuestas = {}; modoActual = 'producto'; // reset a producto por defecto
  actualizarPanelProductoVisible(true); // asegurar visibilidad inicial
  const tag = document.getElementById('producto-tag');
  if (tag) tag.textContent = '';
  mostrarSeccion('cuestionario');
  mostrarPregunta();
}
function actualizarPanelProductoVisible(visible) {
  const pnlProd = document.getElementById('panel-producto');
  const pnlServ = document.getElementById('panel-servicio');
  const tabProd = document.getElementById('tab-producto');
  const tabServ = document.getElementById('tab-servicio');
  if (pnlProd) pnlProd.classList.toggle('oculto', !visible);
  if (pnlServ) pnlServ.classList.toggle('oculto', visible);
  if (tabProd) {
    tabProd.setAttribute('aria-selected', visible);
    tabProd.classList.toggle('tab-activo', visible);
  }
  if (tabServ) {
    tabServ.setAttribute('aria-selected', !visible);
    tabServ.classList.toggle('tab-activo', !visible);
  }
  // actualizar fase actual segú​n modo visible
  actualizarFaseActual();
}
function actualizarFaseActual() {
  const dim = dimDePregunta(indice);
  const el = document.getElementById('fase-actual');
  if (el) el.textContent = 'Fase: ' + dim.fase + ' · ' + dim.nombre;
}
function cambiarModo(tabBtn) {
  const modo = tabBtn.getAttribute('data-modo');   // <-- lee data-modo directamente
  if (!modo) return;
  modoActual = modo === 'servicio' ? 'servicio' : 'producto';
  try { localStorage.setItem('lids_modo', modoActual); } catch (e) {}
  actualizarPanelProductoVisible(modoActual === 'producto');
}
function mostrarPregunta() {
  const preguntas = modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV;
  const p = preguntas[indice];
  const dim = dimDePregunta(indice);
  const elFase = document.getElementById('fase-actual');
  const elPregunta = document.getElementById('pregunta-actual');
  const elDesc = document.getElementById('pregunta-desc');
  const elHelp = document.getElementById('pregunta-help');
  if (elFase) elFase.textContent = 'Fase: ' + dim.fase + ' · ' + dim.nombre;
  if (elPregunta) elPregunta.textContent = (indice + 1) + '/' + (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length) + '. ' + p.texto;
  if (elDesc) elDesc.textContent = p.desc;
  if (elHelp) elHelp.setAttribute('data-tip', p.ayuda || 'Valora del 1 al 5 según tu ' + (modoActual === 'producto' ? 'producto' : 'servicio') + '.');
  const box = document.getElementById('opciones');
  if (!box) return;
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
  const btnAtras = document.getElementById('btn-atras');
  if (btnAtras) btnAtras.disabled = indice === 0;
  const btnSiguiente = document.getElementById('btn-siguiente');
  if (btnSiguiente) {
    btnSiguiente.textContent = indice === (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length) - 1
      ? 'Ver resultados ✓'
      : 'Siguiente →';
  }
  const pctBar = document.getElementById('barra-progreso');
  const txtProgreso = document.getElementById('progreso-texto');
  if (pctBar) pctBar.value = (indice / (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length)) * 100;
  if (txtProgreso) txtProgreso.textContent = 'Pregunta ' + (indice + 1) + ' de ' + (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length);
}
function siguiente() {
  if (!respuestas[indice]) { alert('Selecciona una opción 1-5 para continuar.'); return; }
  const max = (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length) - 1;
  if (indice < max) { indice++; mostrarPregunta(); }
  else finaliza(); // si es la última pasa a resultados
}
function atras() { if (indice > 0) { indice--; mostrarPregunta(); } }
function calcularScores() {
  const scores = {};
  DIMENSIONES.forEach(d => {
    const idxs = (modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV)
      .map((p, i) => p.dim === d.id ? i : -1)
      .filter(i => i >= 0);
    const vals = idxs.map(i => respuestas[i] || 0);
    scores[d.id] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return scores;
}
function finaliza() {
  const scores = calcularScores();
  const prod = getProducto(); // siempre guarda el último producto/servicio activo
  try { localStorage.setItem('lids_modo', modoActual); } catch (e) {}
  window.__lastScores = scores;
  window.__lastDims = DIMENSIONES;
  window.__producto = prod;
  mostrarSeccion('resultados');
  generarGraficoRadar(scores, DIMENSIONES);
  mostrarPuntuaciones(scores, DIMENSIONES, respuestas, mapaPreguntasPorDim());
  mostrarSugerenciasLocales(scores, DIMENSIONES);
  const media = Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONES.length;
  const peor = [...DIMENSIONES].sort((a, b) => scores[a.id] - scores[b.id])[0];
  const nombreLabel = prod.nombre ? (modoActual === 'producto' ? '📦 ' : '🛎 ') : '';
  const elGlobal = document.getElementById('resumen-global');
  if (elGlobal) {
    elGlobal.innerHTML = (prod.nombre ? nombreLabel + '<strong>' + prod.nombre.replace(/</g, '&lt;') + '</strong><br>' : '') +
      'Media global: <strong>' + media.toFixed(1) + ' / 5</strong> · Prioridad: <strong>' + peor.nombre + ' (' + scores[peor.id].toFixed(1) + ')</strong>';
  }
  const elOut = document.getElementById('sugerencias-output');
  if (elOut) elOut.textContent = 'Sugerencias locales ya visibles arriba. Usa IA solo si quieres redacción ampliada.';
  try { localStorage.setItem('lids_last', JSON.stringify({ respuestas, scores, producto: prod })); } catch (e) {}
}
function exportar() {
  const prod = getProducto(); // al final siempre guarda el último producto (puede ser servicio)
  const data = {
    fecha: new Date().toISOString(),
    producto: prod,
    modo: modoActual,
    respuestas,
    scores: window.__lastScores || calcularScores(),
    dimensiones: DIMENSIONES,
    preguntas: modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'diagnostico-lids.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function generarGraficoRadar(scores, dimensiones) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = 600;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const cx = size / 2, cy = size / 2 + 10, R = 200;
  const n = dimensiones.length;
  const vals = dimensiones.map(d => Math.max(0, Math.min(5, scores[d.id] || 0)));
  // Anillos
  for (let lvl = 1; lvl <= 5; lvl++) {
    const r = (R / 5) * lvl;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = lvl === 5 ? '#9e9e9e' : 'rgba(0,0,0,0.15)';
    ctx.lineWidth = lvl === 5 ? 1.5 : 1;
    ctx.stroke();
    ctx.fillStyle = '#999';
    ctx.font = '11px sans-serif';
    ctx.fillText(String(lvl), cx + 4, cy - r + 12);
  }
  // Ejes + etiquetas
  dimensiones.forEach((d, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)';
    ctx.stroke();
    const lx = cx + Math.cos(a) * (R + 28), ly = cy + Math.sin(a) * (R + 28);
    ctx.fillStyle = '#1b5e20';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    // Corte etiqueta larga en 2 líneas
    const palabras = d.nombre.split(' ');
    if (d.nombre.length > 16 && palabras.length > 1) {
      const mitad = Math.ceil(palabras.length / 2);
      ctx.fillText(palabras.slice(0, mitad).join(' '), lx, ly - 6);
      ctx.fillText(palabras.slice(mitad).join(' '), lx, ly + 7);
    } else {
      ctx.fillText(d.nombre, lx, ly);
    }
    ctx.textAlign = 'left';
  });
  // Polígono de datos
  ctx.beginPath();
  vals.forEach((v, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (R / 5) * v;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(46,125,50,0.25)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(46,125,50,1)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Puntos
  vals.forEach((v, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (R / 5) * v;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = v < 3 ? '#e53935' : (v < 4 ? '#fb8c00' : '#2e7d32');
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}
function colorTermino(v) {
  if (!v) return 'term-nd';
  if (v >= 4) return 'term-ok';
  if (v >= 3) return 'term-med';
  return 'term-mal';
}
function mostrarPuntuaciones(scores, dimensiones, respuestas, mapa) {
  const cont = document.getElementById('puntuaciones');
  if (!cont) return;
  cont.innerHTML = '';
  dimensiones.forEach(dim => {
    const v = scores[dim.id] || 0;
    const clase = v >= 4 ? 'puntuacion-alta' : (v >= 3 ? 'puntuacion-media' : 'puntuacion-baja');
    const div = document.createElement('div');
    div.className = 'puntuacion-item ' + clase;
    const idxs = (mapa && mapa[dim.id]) || [];
    const terms = (dim.terms || []).map(t => {
      const qi = idxs[t.q];
      const rv = (qi != null ? respuestas[qi] : 0) || 0;
      return '<span class="' + colorTermino(rv) + '">' + t.t + '</span>';
    }).join('');
    div.innerHTML = '<strong>' + dim.nombre + ':</strong> ' + v.toFixed(1) + ' / 5' +
      (terms ? '<br><span class="terms">' + terms + '</span>' : '');
    cont.appendChild(div);
  });
}
function mapaPreguntasPorDim() {
  const m = {};
  PREGUNTAS_PROD.concat(PREGUNTAS_SERV).forEach((p, i) => { (m[p.dim] = m[p.dim] || []).push(i); });
  return m;
}

/* ---------- IA CONFIGURATION ---------- */
function initIAConfig() {
  const selProv = document.getElementById('ia-proveedor');
  const selMod = document.getElementById('ia-modelo');
  const inpKey = document.getElementById('ia-clave');
  if (!selProv) return;
  function proveedorValido(p) { return (p && PROVEEDORES[p]) ? p : 'gemini'; }
  function getKey(provider) { return localStorage.getItem('lids_apikey_' + provider) || ''; }
  function limpiarProveedoresRetirados() {
    try {
      const p = localStorage.getItem('lids_provider');
      if (p && !PROVEEDORES[p]) localStorage.removeItem('lids_provider');
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('lids_') && !PROVEEDORES[k.replace(/lids_(model|apikey)_/, '')]) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}
  }
  limpiarProveedoresRetirados();
  selProv.value = proveedorValido(localStorage.getItem('lids_provider'));
  function refrescar() {
    const p = proveedorValido(selProv.value);
    selProv.value = p;
    selMod.innerHTML = '';
    if (PROVEEDORES[p] && PROVEEDORES[p].modelos) {
      PROVEEDORES[p].modelos.forEach(m => {
        const o = document.createElement('option');
        o.value = m; o.textContent = m;
        selMod.appendChild(o);
      }
    }
    const savedMod = localStorage.getItem('lids_model_' + p);
    if (savedMod && (PROVEEDORES[p].modelos || []).includes(savedMod)) selMod.value = savedMod;
    inpKey.value = getKey(p);
    const elEstado = document.getElementById('ia-estado');
    if (elEstado) elEstado.textContent = 'Proveedor: ' + PROVEEDORES[p].label + '. ' + (getKey(p) ? 'Clave guardada ✓' : 'Sin clave: solo sugerencias locales.');
  }
  selProv.addEventListener('change', refrescar);
  refrescar();
  document.getElementById('btn-guardar-clave').addEventListener('click', () => {
    const p = proveedorValido(selProv.value);
    localStorage.setItem('lids_provider', p);
    localStorage.setItem('lids_model_' + p, selMod.value);
    localStorage.setItem('lids_apikey_' + p, inpKey.value.trim());
    const elEstado = document.getElementById('ia-estado');
    if (elEstado) elEstado.textContent = inpKey.value.trim() ? 'Clave guardada local ✓' : 'Clave borrada. Modo offline.';
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
function probarConexionIA() {
  const p = proveedorValido(document.getElementById('ia-proveedor').value);
  const key = document.getElementById('ia-clave').value.trim();
  if (!key) { setEstado('Pega clave primero.'); return; }
  setEstado('Probando ' + PROVEEDORES[p].label + '...');
  try {
    const m = document.getElementById('ia-modelo').value;
    const r = fetch(PROVEEDORES[p].url + encodeURIComponent(m) + ':generateContent?key=' + encodeURIComponent(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Responde solo: OK' }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 100 } })
    });
    r.then(resp => {
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return resp.json();
    }).then(data => {
      if (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
        setEstado('✓ Conexión ' + PROVEEDORES[p].label + ' OK.');
      } else {
        throw new Error('Respuesta inesperada');
      }
    }).catch(e => {
      setEstado('❌ Fallo: ' + e.message);
    });
  } catch (e) {
    setEstado('❌ Fallo: ' + e.message);
  }
}
function proveedorValido(p) { return (p && PROVEEDORES[p]) ? p : 'gemini'; }
const PROVEEDORES = {
  gemini: {
    label: 'Google Gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/models/',
    modelos: ['gemini-3.8-flash', 'gemini-3.8-live', 'gemini-3.8-live-extended-thinking', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
  }
};

function pegarEnElDOM(id, contenido) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = contenido;
}
function mostrarSeccion(id) {
  ['intro','config-ia','cuestionario','resultados'].forEach(s => {
    const e = document.getElementById(s);
    if (e) e.classList.toggle('oculto', s !== id);
  });
  window.scrollTo(0, 0);
}
document.addEventListener('DOMContentLoaded', () => {
  // Botones principales
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

  // Restaurar modo guardado al recargar
  try { const guardado = localStorage.getItem('lids_modo'); if (guardado) modoActual = guardado; } catch (e) {}
  setTimeout(() => { actualizarPanelProductoVisible(modoActual === 'producto'); }, 10);

  // Listeners de tabs Producto/Servicio
  const tabProducto = document.getElementById('tab-producto');
  const tabServicio = document.getElementById('tab-servicio');
  if (tabProducto) tabProducto.addEventListener('click', (e) => cambiarModo(tabProducto));
  if (tabServicio) tabServicio.addEventListener('click', (e) => cambiarModo(tabServicio));

  // Restaurar producto/servicio guardado en los campos
  try {
    const prod = JSON.parse(localStorage.getItem('lids_producto') || 'null');
    if (prod && prod.nombre) { document.getElementById('producto-nombre').value = prod.nombre; }
    if (prod && prod.desc) { document.getElementById('producto-desc').value = prod.desc; }
    const serv = JSON.parse(localStorage.getItem('lids_servicio') || 'null');
    if (serv && serv.nombre) { document.getElementById('servicio-nombre').value = serv.nombre; }
    if (serv && serv.desc) { document.getElementById('servicio-desc').value = serv.desc; }
    window.__producto = prod; window.__servicio = serv;
  } catch (e) {}
  document.getElementById('producto-nombre').addEventListener('input', saveProducto);
  document.getElementById('producto-desc').addEventListener('input', saveProducto);
  document.getElementById('servicio-nombre').addEventListener('input', saveServicio);
  document.getElementById('servicio-desc').addEventListener('input', saveServicio);

  // Restaurar última sesión si existía
  try {
    const last = JSON.parse(localStorage.getItem('lids_last') || 'null');
    if (last && last.respuestas && Object.keys(last.respuestas).length > 0) { respuestas = last.respuestas; }
  } catch (e) {}
});