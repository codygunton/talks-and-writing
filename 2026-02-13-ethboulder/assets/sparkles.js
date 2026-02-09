(function() {
  // Create the sparkle background layer and prepend to body
  var bg = document.createElement("div");
  bg.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;background:#062873;";
  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
  canvas.width = 1280; canvas.height = 720;
  bg.appendChild(canvas);
  document.body.prepend(bg);

  var ctx = canvas.getContext("2d");
  var W = 1280, H = 720, NUM = 3000, ps = [];
  for (var i = 0; i < NUM; i++) {
    ps.push({
      x: Math.random()*W, y: Math.random()*H,
      r: 0.1+Math.random()*0.6,
      o: 0.1+Math.random()*0.9,
      oS: (0.3+Math.random()*1.7)*(Math.random()<0.5?1:-1)/60,
      dx: (Math.random()*0.15+0.02)*(Math.random()<0.5?1:-1),
      dy: (Math.random()*0.15+0.02)*(Math.random()<0.5?1:-1)
    });
  }
  function draw() {
    ctx.clearRect(0,0,W,H);
    for (var j=0;j<ps.length;j++) {
      var p=ps[j];
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<-5)p.x=W+5; if(p.x>W+5)p.x=-5;
      if(p.y<-5)p.y=H+5; if(p.y>H+5)p.y=-5;
      p.o+=p.oS;
      if(p.o>=1){p.o=1;p.oS=-Math.abs(p.oS);}
      if(p.o<=0.1){p.o=0.1;p.oS=Math.abs(p.oS);}
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,6.283);
      ctx.fillStyle="rgba(149,173,223,"+p.o+")";
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();
