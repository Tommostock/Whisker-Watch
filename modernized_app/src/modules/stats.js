/**
 * Statistics Display
 * Renders incident statistics panel in the stats tab
 */

import { escapeHtml } from '../utils/escape-html.js';

/**
 * Render statistics panel
 * Shows status breakdown, method distribution, and hotspot areas
 * @param {Array<Object>} incidents - All incidents
 */
export function renderStats(incidents) {
  const el = document.getElementById('statsWrap');
  if (!el) return;

  if (!incidents.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">📊</div><div class="empty-txt">Log incidents to see statistics.</div></div>`;
    return;
  }

  const total = incidents.length;
  const open = incidents.filter(i => i.status === 'open').length;
  const suspect = incidents.filter(i => i.status === 'suspect').length;
  const closed = incidents.filter(i => i.status === 'closed').length;

  // Count by method
  const mc = {};
  const ac = {};
  incidents.forEach(i => {
    mc[i.method] = (mc[i.method] || 0) + 1;
    if (i.area && i.area !== 'Unknown') ac[i.area] = (ac[i.area] || 0) + 1;
  });

  const topM = Object.entries(mc).sort((a, b) => b[1] - a[1]);
  const topA = Object.entries(ac).sort((a, b) => b[1] - a[1]);

  // Status cards
  const statusCards = [
    ['OPEN', open, 'var(--green)'],
    ['SUSPECT', suspect, 'var(--yellow)'],
    ['CLOSED', closed, 'var(--accent)']
  ].map(([label, count, color]) => `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center">
      <div style="font-size:22px;font-weight:800;color:${color};font-family:'Space Mono',monospace">${count}</div>
      <div style="font-size:8px;color:var(--text-muted);letter-spacing:.1em;margin-top:2px">${label}</div>
    </div>
  `).join('');

  // Method bars
  const methodBars = topM.map(([method, count]) => `
    <div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:9px;margin-bottom:3px">
        <span style="color:var(--text)">${escapeHtml(method)}</span>
        <span style="color:var(--text-muted)">${count}</span>
      </div>
      <div style="height:3px;background:var(--border);border-radius:2px">
        <div style="height:3px;background:var(--accent);border-radius:2px;width:${(count / total * 100).toFixed(0)}%"></div>
      </div>
    </div>
  `).join('');

  // Area bars
  const areaBars = topA.length ? `
    <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--text-muted);letter-spacing:.12em;margin:16px 0 10px;text-transform:uppercase">Hotspot Areas</div>
    ${topA.slice(0, 8).map(([area, count]) => `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-family:'Space Mono',monospace;font-size:9px;margin-bottom:3px">
          <span style="color:var(--text)">${escapeHtml(area)}</span>
          <span style="color:var(--text-muted)">${count}</span>
        </div>
        <div style="height:3px;background:var(--border);border-radius:2px">
          <div style="height:3px;background:var(--accent2);border-radius:2px;width:${(count / total * 100).toFixed(0)}%"></div>
        </div>
      </div>
    `).join('')}
  ` : '';

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:18px">${statusCards}</div>
    <div style="font-family:'Space Mono',monospace;font-size:8px;color:var(--text-muted);letter-spacing:.12em;margin-bottom:10px;text-transform:uppercase">By Method</div>
    ${methodBars}
    ${areaBars}
  `;
}
