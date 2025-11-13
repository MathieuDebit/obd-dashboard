// Sidebar filter
(function(){
  const navFilter = document.getElementById('navFilter');
  const navList = document.getElementById('navList');
  if (!navFilter || !navList) return;
  navFilter.addEventListener('input', () => {
    const term = navFilter.value.toLowerCase();
    for (const li of navList.querySelectorAll('li')) {
      const a = li.querySelector('a');
      li.style.display = a.textContent.toLowerCase().includes(term) ? '' : 'none';
    }
  });
})();

// Link zoom across per-PID charts
(function(){
  const linkZoom = document.getElementById('linkZoom');
  if (!linkZoom) return;

  function forEachPlot(fn) {
    document.querySelectorAll('.js-plotly-plot').forEach(fn);
  }

  function attachListeners() {
    forEachPlot((el) => {
      if (el.__obd_linked) return; // avoid double binding
      el.__obd_linked = true;
      if (typeof el.on === 'function') {
        el.on('plotly_relayout', (d) => {
          if (!linkZoom.checked) return;
          const x0 = d['xaxis.range[0]'];
          const x1 = d['xaxis.range[1]'];
          if (x0 && x1) {
            forEachPlot((p) => { if (p !== el) Plotly.relayout(p, {'xaxis.range': [x0, x1]}); });
          }
          if (d['xaxis.autorange']) {
            forEachPlot((p) => Plotly.relayout(p, {'xaxis.autorange': true}));
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }
})();
