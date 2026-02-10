(function() {
  var last = null;
  setInterval(function() {
    fetch(location.href).then(function(r) { return r.text(); }).then(function(t) {
      if (last !== null && t !== last) location.reload();
      last = t;
    }).catch(function() {});
  }, 1000);
})();
