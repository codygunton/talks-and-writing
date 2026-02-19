(function() {
  var DURATION = 15 * 60;
  var remaining = DURATION;
  var interval = null;
  var running = false;

  var el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'z-index:9999',
    'background:rgba(20,20,30,0.82)',
    'color:#fff',
    'font-family:Inter,sans-serif',
    'font-size:14px',
    'font-weight:600',
    'letter-spacing:0.03em',
    'border-radius:7px',
    'padding:4px 8px',
    'display:flex',
    'align-items:center',
    'gap:6px',
    'box-shadow:0 2px 8px rgba(0,0,0,0.35)',
    'user-select:none',
  ].join(';');

  var display = document.createElement('span');

  var btn = function(label, onclick) {
    var b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = [
      'background:rgba(255,255,255,0.15)',
      'border:none',
      'border-radius:4px',
      'color:#fff',
      'font-size:11px',
      'padding:2px 5px',
      'cursor:pointer',
      'font-family:inherit',
    ].join(';');
    b.addEventListener('mouseenter', function() { b.style.background = 'rgba(255,255,255,0.28)'; });
    b.addEventListener('mouseleave', function() { b.style.background = 'rgba(255,255,255,0.15)'; });
    b.addEventListener('click', onclick);
    return b;
  };

  function fmt(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function render() {
    display.textContent = fmt(remaining);
    if (remaining <= 60) {
      display.style.color = '#ff5f5f';
    } else if (remaining <= 3 * 60) {
      display.style.color = '#ffcc44';
    } else {
      display.style.color = '#fff';
    }
  }

  function reposition() {
    var slide = document.querySelector('section');
    if (!slide) return;
    var r = slide.getBoundingClientRect();
    el.style.left = (r.left + 14) + 'px';
    el.style.bottom = (window.innerHeight - r.bottom + 14) + 'px';
  }

  var startBtn = btn('▶', function() {
    if (running) return;
    running = true;
    interval = setInterval(function() {
      if (remaining > 0) {
        remaining--;
        render();
      } else {
        clearInterval(interval);
        running = false;
        display.style.color = '#ff5f5f';
      }
    }, 1000);
  });

  var pauseBtn = btn('⏸', function() {
    if (!running) return;
    running = false;
    clearInterval(interval);
  });

  var resetBtn = btn('↺', function() {
    running = false;
    clearInterval(interval);
    remaining = DURATION;
    display.style.color = '#fff';
    render();
  });

  var dismissBtn = btn('✕', function() {
    running = false;
    clearInterval(interval);
    document.body.removeChild(el);
  });

  el.appendChild(display);
  el.appendChild(startBtn);
  el.appendChild(pauseBtn);
  el.appendChild(resetBtn);
  el.appendChild(dismissBtn);

  render();
  document.body.appendChild(el);
  reposition();

  window.addEventListener('resize', reposition);
  // reposition after slide transitions
  var obs = new MutationObserver(reposition);
  obs.observe(document.body, { childList: true, subtree: true });
})();
