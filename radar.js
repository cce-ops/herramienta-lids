/* radar.js - Radar LIDS nativo canvas, cero dependencias, funciona file:// offline */
'use strict';

function generarGraficoRadar(scores, dimensiones) {
  const canvas = document.getElementById('radarChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const size = 600;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = '100%';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2 + 10, R = 200;
  const n = dimensiones.length;
  const vals = dimensiones.map(d => Math.max(0, Math.min(5, scores[d.id] || 0)));

  ctx.clearRect(0, 0, size, size);

  // Anillos 1-5
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

  // Polígono datos
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
  respuestas = respuestas || {};
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
    }).join(' · ');
    div.innerHTML = '<strong>' + dim.nombre + ':</strong> ' + v.toFixed(1) + ' / 5' +
      (terms ? '<br><span class="terms">' + terms + '</span>' : '');
    cont.appendChild(div);
  });
}

window.addEventListener('resize', () => {
  if (window.__lastScores && window.__lastDims) {
    generarGraficoRadar(window.__lastScores, window.__lastDims);
  }
});
