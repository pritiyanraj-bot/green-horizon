(() => {
  const canvas = document.getElementById('splash-canvas');
  const ctx = canvas && canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (!canvas || !ctx || reducedMotion || coarsePointer) {
    document.documentElement.classList.add('no-cursor');
  } else {
    let width = 0, height = 0, dpr = 1, last = null;
    const particles = [];
    const palette = ['#10b981', '#84cc16', '#286752'];
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = width * dpr; canvas.height = height * dpr;
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function addSplash(x, y, force = 1) {
      const count = Math.round(5 * force);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.7 + Math.random() * 2.6) * force;
        particles.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          r: 2 + Math.random() * 7 * Math.min(force, 1.6),
          life: 1, decay: 0.012 + Math.random() * 0.02,
          color: palette[Math.floor(Math.random() * palette.length)],
          spin: (Math.random() - .5) * .12
        });
      }
      if (particles.length > 260) particles.splice(0, particles.length - 260);
    }
    window.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      if (!last) { last = {x:event.clientX,y:event.clientY}; addSplash(last.x,last.y,.7); return; }
      const dx = event.clientX - last.x, dy = event.clientY - last.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 7) {
        addSplash(event.clientX, event.clientY, Math.min(1.5, distance / 22));
        last = {x:event.clientX,y:event.clientY};
      }
    }, {passive:true});
    window.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') addSplash(e.clientX,e.clientY,1.7); }, {passive:true});
    window.addEventListener('resize', resize, {passive:true});
    resize();
    function draw() {
      ctx.clearRect(0,0,width,height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy = p.vy * .985 + .018;
        p.r *= .986; p.life -= p.decay;
        if (p.life <= 0 || p.r < .3) { particles.splice(i,1); continue; }
        ctx.globalAlpha = Math.max(0,p.life) * .68;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    draw();
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.desktop-nav');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open'); menuButton.setAttribute('aria-expanded','false');
    }));
  }

  // Scope drawer toggles
  document.querySelectorAll('.scope-toggle-btn, .scope-trigger').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = button.dataset.serviceTarget;
      const drawer = document.getElementById('scope-' + targetId);
      const toggleBtn = document.querySelector(`.scope-toggle-btn[data-service-target="${targetId}"]`);
      const triggerArrow = document.querySelector(`.scope-trigger[data-service-target="${targetId}"]`);
      
      if (!drawer) return;
      const isOpen = drawer.classList.toggle('open');
      
      if (toggleBtn) {
        toggleBtn.setAttribute('aria-expanded', String(isOpen));
        const textSpan = toggleBtn.querySelector('span:first-child');
        if (textSpan) {
          textSpan.textContent = isOpen ? 'Hide scope & deliverables' : 'View scope & deliverables';
        }
      }
      if (triggerArrow) {
        triggerArrow.setAttribute('aria-expanded', String(isOpen));
      }
    });
  });

  document.querySelectorAll('[data-service]').forEach(button => {
    button.addEventListener('click', () => {
      const select = document.getElementById('service');
      const form = document.getElementById('contact');
      if (select) select.value = button.dataset.service;
      if (form) form.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth'});
      window.setTimeout(() => document.getElementById('name')?.focus({preventScroll:true}), 450);
    });
  });

  const enquiryForm = document.getElementById('enquiry-form');
  const status = document.getElementById('form-status');
  if (enquiryForm && status) {
    enquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(enquiryForm);
      const lines = [
        'GREEN HORIZON CONSULTING — PROJECT ENQUIRY',
        '',
        'Name: ' + (data.get('name') || ''),
        'Email: ' + (data.get('email') || ''),
        'Organisation: ' + (data.get('organisation') || ''),
        'Service: ' + (data.get('service') || ''),
        'Project details: ' + (data.get('message') || '')
      ];
      const draft = lines.join('\n');
      const blob = new Blob([draft], {type:'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'green-horizon-enquiry.txt';
      document.body.appendChild(link); link.click(); link.remove();
      URL.revokeObjectURL(url);
      status.textContent = 'Your enquiry draft has been prepared as a text file on this device. No data was sent to a server.';
    });
  }
})();
