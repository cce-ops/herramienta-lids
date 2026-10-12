/* app.js - Cuestionario LIDS por fases ciclo vida, 16 preguntas, offline + selector Producto/Servicio */
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

// Preguntas para modo Producto (mismo orden y estructura que antes)
const PREGUNTAS_PROD = [
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

// Preguntas para modo Servicio (misma estructura de dimensiones pero redacción adaptada)
const PREGUNTAS_SERV = [
  { dim: 'materiales_bajo_impacto', texto: '¿La infraestructura del servicio usa materiales reciclados, renovables o de bajo impacto?', desc: 'Servidores, redes, hardware de acceso, licencias físicas. 1=todo virgen/descartable, 5=mayor parte renovable o reacondicionada.',
    ayuda: 'Revisa servidores, routers, dispositivos de acceso y materiales físicos asociados: ¿hay reacondicionamiento o materiales certificados? 1 = compra nueva virgen cada ciclo. 5 = reacondicionados o con materiales reciclados/renovables con inventario conocido.' },
  { dim: 'materiales_bajo_impacto', texto: '¿Evita tóxicos y materiales críticos en hardware y operación?', desc: 'Refrigerantes químicos, plomo, cobalto, PVC en cabling, componentes electrónicos. 1=sin inventario, 5=inventario completo + sustitución activa.',
    ayuda: 'Revisa componentes químicos y físicos de tu operación: refrigerantes, cables, circuitos. 1 = no sabe qué contiene. 5 = inventario completo y ya sustituyó lo peor con alternativas.' },
  { dim: 'reduccion_material', texto: '¿La infraestructura del servicio se mantiene al mínimo funcional?', desc: 'Servidores, memoria, ancho de red, recursos asignados. 1=sobre-provisionado, 5=escalado automático por demanda.',
    ayuda: '¿Regulas recursos según demanda real? 1 = siempre al máximo por seguridad. 5 = topología eficiente, sin desperdicio de capacidad ni servidores ociosos, escalado automático.' },
  { dim: 'reduccion_material', texto: '¿Se minimizan datos residuales, logs y recursos digitales auxiliares?', desc: 'Purga automática, caché controlado, archivos temporales, paquetes redundantes. 1=acumulado sin limpiar, 5=gestión automática mínima.',
    ayuda: 'Cuenta datos residuales: logs sin rotar, caché sin purgar, archivos duplicados, paquetes redundantes. 1 = acumulación constante. 5 = políticas de retención, purge automática, casi cero residuo.' },
  { dim: 'produccion_limpia', texto: '¿La operación del servicio usa procesos limpios y eficientes?', desc: 'Energía de servidores, emisiones por despliegue, proveedores, centro de datos. 1=alto consumo y residuo, 5=renovable + circuito cerrado.',
    ayuda: 'Piensa por sesión o usuario: energía de servidores, descarga de datos, emisiones por despliegue, químicos de mantenimiento. 1 = mucho residuo, alta huella, sin control. 5 = energía renovable demostrable, eficiencia certificada, reutilización de recursos.' },
  { dim: 'produccion_limpia', texto: '¿Los proveedores de infraestructura operan de forma limpia y verificada?', desc: 'Datacenters, hosting, proveedores de servicios auxiliares. 1=sin verificación, 5=auditoría + renovable + cercanía.',
    ayuda: '¿Dónde se aloja tu servicio y con qué energía? ¿Hay certificación? 1 = origen desconocido o muy lejano, sin verificación. 5 = proveedores cercanos con ISO 14001, energía renovable demostrable y transparencia.' },
  { dim: 'distribucion', texto: '¿Los canales de entrega del servicio son rápidos, locales y sin duplicaciones?', desc: 'CDN, descarga directa, baja latencia, distribución P2P eficiente. 1=transferencias largas y redundantes, 5=distribución eficiente y local.',
    ayuda: 'Mira transferencias: ¿hay duplicaciones y saltos largos? 1 = descarga lenta o intercontinental repetida. 5 = CDN o servidores locales, sin duplicación, latencia baja, entrega eficiente.' },
  { dim: 'distribucion', texto: '¿El servicio elimina materiales físicos innecesarios o gestiona retorno?', desc: 'Entrega digital completa, take-back de hardware, embalaje cero para acceso. 1=físico obligatorio sin retorno, 5=totalmente digital o retornable documentado.',
    ayuda: '¿Aunque sea un servicio, viene acompañado de cajas, folletos, hardware innecesario? 1 = siempre con físico no retornable. 5 = entrega digital completa o con retorno documentado de hardware/acceso.' },
  { dim: 'impacto_uso', texto: '¿El uso real del servicio por el usuario final mantiene baja carga energética y de red?', desc: 'Dispositivos finales, transferencias, tiempo de pantalla, consumo de red. 1=alto consumo continuo, 5=casi cero + indicador visible.',
    ayuda: 'Mide lo que gasta el dispositivo/endpoint del usuario final en uso típico: pantalla, procesamiento, red. 1 = siempre activo y gasta mucho. 5 = modo eco, apagado automático, bajo consumo de red y energía visible.' },
  { dim: 'impacto_uso', texto: '¿El diseño del servicio informa y evita mal uso por parte del usuario?', desc: 'Transparencia de impacto, avisos de consumo, guía de uso eficiente, auto-apagado. 1=sin información, 5=guía clara + diseño que previene desperdicio.',
    ayuda: '¿El diseño evita que se use mal o desperdiciado? 1 = sin manual ni avisos de impacto. 5 = guía clara, datos de consumo visibles, autocontrol integrado, diseño que evita desperdicio.' },
  { dim: 'vida_util', texto: '¿El servicio y su infraestructura permiten durabilidad y actualización sostenida?', desc: 'Actualizaciones sin rotura, reemplazo de partes, compatibilidad larga, arquitectura abierta. 1=obsoleto y cerrado, 5=actualizaciones sostenidas.',
    ayuda: '¿Puede actualizarse o extenderse sin reemplazar todo? 1 = sellado, requiere reemplazo total al fallar o quedar obsoleto. 5 = actualizaciones incrementales, partes intercambiables, compatibilidad prolongada y arquitectura abierta.' },
  { dim: 'vida_util', texto: '¿El usuario puede actualizar o reparar sin técnico especializado?', desc: 'Auto-actualización, herramientas estándar, reemplazo simple de componentes, guías claras. 1=sellado y técnico obligatorio, 5=auto-reparable en minutos.',
    ayuda: '¿El usuario puede mantenerlo sin asistente técnico? 1 = solo servicio oficial, herramientas especiales. 5 = auto-actualización, guía clara y cambios simples con herramientas estándar, en minutos.' },
  { dim: 'fin_vida', texto: '¿El cierre, migración o transición del servicio es rápido y reversible?', desc: 'Exportación de datos, cierre de cuenta, retorno de hardware acceso, preservación de información. 1=complejo con pérdida, 5=<3 min reversibles con datos intactos.',
    ayuda: '¿Cómo se cierra o migra? Cronometra: exportación, cierre, transición. 1 = más de 15 min, pérdida de datos o herramienta especial. 5 = menos de 3 min, pasos simples, datos intactos, retorno o transición documentada.' },
  { dim: 'fin_vida', texto: '¿Existe plan de recogida, reacondicionamiento o transición de datos?', desc: 'Take-back de hardware, reacondicionado, gestor de datos, etiquetado del canal. 1=sin plan, 5=canal activo y etiquetado claramente.',
    ayuda: '¿Qué pasa cuando el servicio o el hardware mueren? 1 = a la basura / sin más, datos perdidos. 5 = recogida activa, reacondicionamiento, transición de datos o gestor autorizado indicado al usuario.' },
  { dim: 'nuevo_concepto', texto: '¿El modelo de negocio convierte la función en servicio (no venta fija)?', desc: 'Suscripción, uso por resultado, acceso compartido, digital, refill. 1=venta de licencia fija, 5=modelo de servicio probado y escalable.',
    ayuda: '¿Vendes la función o el objeto/licencia fija? 1 = venta lineal de licencia o producto perpetuo. 5 = alquiler, uso por hora/resultado, recarga (refill), acceso compartido o digital ya funcionando y escalable.' },
  { dim: 'nuevo_concepto', texto: '¿El servicio genera impacto social o sistémico claro y medible?', desc: 'Acceso compartido, empleo local de soporte/reparación, transparencia, justicia digital. 1=ninguno medido, 5=impacto medido y comunicado.',
    ayuda: '¿A quién beneficia además del contratante/usuario? 1 = nada medido o comunicado. 5 = acceso compartido que amplía uso, reparación/soporte local, transparencia o justicia digital medida y comunicada.' }
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
let modoActual = 'producto'; // 'producto' o 'servicio'

function dimDePregunta(i) { return DIMENSIONES.find(d => d.id === (modoActual === 'producto' ? PREGUNTAS_PROD[i].dim : PREGUNTAS_SERV[i]).id); }
// Helper corregido:
function dimDePregunta(i) {
  const p = modoActual === 'producto' ? PREGUNTAS_PROD[i] : PREGUNTAS_SERV[i];
  return DIMENSIONES.find(d => d.id === p.dim);
}

// Mapa dimensión -> índices de preguntas (según modo actual)
function mapaPreguntasPorDim() {
  const m = {};
  const preguntas = modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV;
  preguntas.forEach((p, i) => { (m[p.dim] = m[p.dim] || []).push(i); });
  return m;
}

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
  saveProducto(); saveServicio(); // guardar ambos en caso de cambio de tab después
  indice = 0; respuestas = {}; // conservar modoActual (producto o servicio) según tab activa
  actualizarPanelProductoVisible(modoActual === 'producto');
  const tag = document.getElementById('producto-tag');
  if (tag) tag.textContent = ''; // limpiar textos viejos hasta actualizar
  mostrarSeccion('cuestionario');
  mostrarPregunta();
}

function actualizarPanelProductoVisible(visible) {
  document.getElementById('panel-producto').classList.toggle('oculto', !visible);
  document.getElementById('panel-servicio').classList.toggle('oculto', visible);
  // actualizar tabs aria
  const tabProd = document.getElementById('tab-producto');
  const tabServ = document.getElementById('tab-servicio');
  if (tabProd && tabServ) {
    tabProd.setAttribute('aria-selected', visible);
    tabServ.setAttribute('aria-selected', !visible);
    tabProd.classList.toggle('tab-activo', visible);
    tabServ.classList.toggle('tab-activo', !visible);
  }
  // actualizar fase actual según modo visible
  actualizarFaseActual();
}

function actualizarPanelServicioVisible(visible) {
  actualizarPanelProductoVisible(!visible);
}

function actualizarFaseActual() {
  const dim = dimDePregunta(indice);
  document.getElementById('fase-actual').textContent = 'Fase: ' + dim.fase + ' · ' + dim.nombre;
}

function cambiarModo(tabBtn) {
  modoActual = tabBtn.dataset.modo === 'servicio' ? 'servicio' : 'producto';
  // guardar preferencia en localStorage
  try { localStorage.setItem('lids_modo', modoActual); } catch (e) {}
  actualizarPanelProductoVisible(modoActual === 'producto');
}

function mostrarPregunta() {
  const p = modoActual === 'producto' ? PREGUNTAS_PROD[indice] : PREGUNTAS_SERV[indice];
  const dim = dimDePregunta(indice);
  document.getElementById('fase-actual').textContent = 'Fase: ' + dim.fase + ' · ' + dim.nombre;
  document.getElementById('pregunta-actual').textContent = (indice + 1) + '/' + (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length) + '. ' + p.texto;
  document.getElementById('pregunta-desc').textContent = p.desc;
  document.getElementById('pregunta-help').setAttribute('data-tip', p.ayuda || 'Valora del 1 al 5 según tu ' + (modoActual === 'producto' ? 'producto' : 'servicio') + '.');
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
  document.getElementById('btn-siguiente').textContent = indice === (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length) - 1 ? 'Ver resultados ✓' : 'Siguiente →';
  const pct = (indice / (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length)) * 100;
  document.getElementById('barra-progreso').value = pct;
  document.getElementById('progreso-texto').textContent = 'Pregunta ' + (indice + 1) + ' de ' + (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length);
}

function siguiente() {
  if (!respuestas[indice]) { alert('Selecciona una opción 1-5 para continuar.'); return; }
  if (indice < (modoActual === 'producto' ? PREGUNTAS_PROD.length : PREGUNTAS_SERV.length) - 1) { indice++; mostrarPregunta(); }
  else finalizar();
}

function atras() { if (indice > 0) { indice--; mostrarPregunta(); } }

function calcularScores() {
  const scores = {};
  DIMENSIONES.forEach(d => {
    const idxs = (modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV).map((p, i) => p.dim === d.id ? i : -1).filter(i => i >= 0);
    const vals = idxs.map(i => respuestas[i] || 0);
    scores[d.id] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return scores;
}

function finalizar() {
  const scores = calcularScores();
  const prod = getProducto(); // siempre guardar producto/servicio actual al finalizar
  // también guardar el modo actual para restauración futura
  try { localStorage.setItem('lids_modo', modoActual); } catch (e) {}
  window.__lastScores = scores;
  window.__lastDims = DIMENSIONES;
  window.__producto = prod; // reutilizamos variable para resumen (puede ser servicio)
  mostrarSeccion('resultados');
  generarGraficoRadar(scores, DIMENSIONES);
  mostrarPuntuaciones(scores, DIMENSIONES, respuestas, mapaPreguntasPorDim());
  mostrarSugerenciasLocales(scores, DIMENSIONES);
  const media = Object.values(scores).reduce((a, b) => a + b, 0) / DIMENSIONES.length;
  const peor = [...DIMENSIONES].sort((a, b) => scores[a.id] - scores[b.id])[0];
  const nombreLabel = prod.nombre ? (modoActual === 'producto' ? '📦 ' : '🛎 ') : '';
  document.getElementById('resumen-global').innerHTML =
    (prod.nombre ? nombreLabel + '<strong>' + prod.nombre.replace(/</g, '&lt;') + '</strong><br>' : '') +
    'Media global: <strong>' + media.toFixed(1) + ' / 5</strong> · Prioridad: <strong>' + peor.nombre + ' (' + scores[peor.id].toFixed(1) + ')</strong>';
  document.getElementById('sugerencias-output').textContent = 'Sugerencias locales ya visibles arriba. Usa IA solo si quieres redacción ampliada.';
  try { localStorage.setItem('lids_last', JSON.stringify({ respuestas, scores, producto: prod })); } catch (e) {}
}

function exportar() {
  const prod = getProducto(); // o podría leer modoActual para elegir qué guardar
  const data = { fecha: new Date().toISOString(), producto: prod, modo: modoActual, respuestas, scores: window.__lastScores || calcularScores(), dimensiones: DIMENSIONES, preguntas: modoActual === 'producto' ? PREGUNTAS_PROD : PREGUNTAS_SERV };
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

  // Restaurar modo guardado (producto o servicio) al recargar
  try {
    const guardado = localStorage.getItem('lids_modo');
    if (guardado) { modoActual = guardado; } // por defecto ya es 'producto' al inicio
  } catch (e) {}
  // Aplicar modo guardado después de que el DOM esté listo (tabs ya existen)
  setTimeout(() => { actualizarPanelProductoVisible(modoActual === 'producto'); }, 10);

  // Listeners de tabs Producto/Servicio - pasar el elemento button real, no un objeto dataset
  const tabProducto = document.getElementById('tab-producto');
  const tabServicio = document.getElementById('tab-servicio');
  if (tabProducto) tabProducto.addEventListener('click', (e) => cambiarModo(tabProducto));
  if (tabServicio) tabServicio.addEventListener('click', (e) => cambiarModo(tabServicio));

  // Restaurar producto/servicio guardado
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
  // Restaurar última sesión si existe (compatibilidad con modo anterior)
  try {
    const last = JSON.parse(localStorage.getItem('lids_last') || 'null');
    if (last && last.respuestas && Object.keys(last.respuestas).length > 0) { respuestas = last.respuestas; }
  } catch (e) {}
});
