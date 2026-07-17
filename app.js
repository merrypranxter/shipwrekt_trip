(() => {
  'use strict';

  document.documentElement.classList.add('has-js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;

  const conceptNodes = [
    { id: 'silence', label: 'SILENCE', title: 'The Silence Event', x: 145, y: 128, cluster: ['perception'] },
    { id: 'split', label: 'DUAL BOOT', title: 'Operator / Avatar', x: 380, y: 95, cluster: ['embodiment'] },
    { id: 'geometry', label: 'METAFORM', title: 'The Tetragrammaton', x: 666, y: 125, cluster: ['perception'] },
    { id: 'lattice', label: 'THE NET', title: 'Indra’s Net', x: 848, y: 286, cluster: ['perception', 'memory'] },
    { id: 'stuffness', label: 'STUFFNESS', title: 'The Horror of Stuff', x: 180, y: 405, cluster: ['embodiment'] },
    { id: 'burn', label: 'THE BURN', title: 'Ignite / Collapse / Repeat', x: 430, y: 500, cluster: ['embodiment', 'transmission'] },
    { id: 'clowntech', label: 'CLOWNTECH', title: 'Sacred Camouflage', x: 690, y: 424, cluster: ['transmission'] },
    { id: 'memory', label: 'MEMORY LOOP', title: 'Remember / Forget', x: 842, y: 542, cluster: ['memory'] }
  ];

  const conceptEdges = [
    { from: 'silence', to: 'split', kind: 'continues', reason: 'Silence reveals a second point of view' },
    { from: 'silence', to: 'geometry', kind: 'expands', reason: 'The zero state acquires living form' },
    { from: 'split', to: 'stuffness', kind: 'shares-tissue', reason: 'The Avatar carries embodiment' },
    { from: 'split', to: 'memory', kind: 'stores', reason: 'The Operator leaves instructions for the Avatar' },
    { from: 'geometry', to: 'lattice', kind: 'expands', reason: 'The metaform becomes a relational network' },
    { from: 'geometry', to: 'clowntech', kind: 'transmits', reason: 'Geometry seeks a public syntax' },
    { from: 'lattice', to: 'clowntech', kind: 'carries', reason: 'Witnessing receives the transmission' },
    { from: 'lattice', to: 'memory', kind: 'stores', reason: 'The witness echo returns later' },
    { from: 'stuffness', to: 'burn', kind: 'feeds', reason: 'Embodiment supplies the friction metaphor' },
    { from: 'burn', to: 'clowntech', kind: 'transmits', reason: 'The burn acquires camouflage' },
    { from: 'burn', to: 'memory', kind: 'resets', reason: 'Forgetting completes the cycle' },
    { from: 'clowntech', to: 'memory', kind: 'records', reason: 'The performance becomes a digital sigil' }
  ];

  const nodeIndex = new Map(conceptNodes.map((node) => [node.id, node]));
  const zoneState = { current: 0, target: 0 };
  const shaderState = {
    breach: 0,
    pointer: { x: 0.5, y: 0.5 },
    pointerTarget: { x: 0.5, y: 0.5 },
    scroll: 0,
    density: root.dataset.signalDensity || 'feral'
  };

  function nodeTitle(id) {
    if (id === 'threshold') return 'threshold';
    if (id === 'field-map') return 'field map';
    if (id === 'integration') return 'integration';
    if (id === 'source-vault') return 'source vault';
    if (id === 'tune-the-field') return 'intensity';
    return nodeIndex.get(id)?.title || id.replaceAll('-', ' ');
  }

  function buildConceptMap() {
    const svg = document.querySelector('#concept-map');
    if (!svg) return;
    const namespace = 'http://www.w3.org/2000/svg';

    const make = (tag, attributes = {}) => {
      const element = document.createElementNS(namespace, tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, String(value)));
      return element;
    };

    const edgeLayer = make('g', { class: 'edge-layer' });
    const nodeLayer = make('g', { class: 'node-layer' });

    conceptEdges.forEach((edge) => {
      const from = nodeIndex.get(edge.from);
      const to = nodeIndex.get(edge.to);
      const midpointX = (from.x + to.x) / 2;
      const midpointY = (from.y + to.y) / 2 - Math.min(55, Math.abs(to.x - from.x) * 0.08);
      const path = make('path', {
        class: 'edge',
        d: `M ${from.x} ${from.y} Q ${midpointX} ${midpointY} ${to.x} ${to.y}`,
        'data-from': edge.from,
        'data-to': edge.to,
        'data-kind': edge.kind
      });
      const title = make('title');
      title.textContent = edge.reason;
      path.append(title);
      edgeLayer.append(path);
    });

    conceptNodes.forEach((node) => {
      const link = make('a', {
        class: 'node-link',
        href: `#${node.id}`,
        'data-map-link': node.id,
        'data-cluster': node.cluster.join(' '),
        'aria-label': `${node.title}. Enter this concept.`
      });
      const halo = make('rect', {
        class: 'node-halo',
        x: node.x - 78,
        y: node.y - 28,
        width: 156,
        height: 56,
        rx: 25,
        ry: 21
      });
      const label = make('text', {
        class: 'node-label',
        x: node.x,
        y: node.y + 6,
        'text-anchor': 'middle'
      });
      label.textContent = node.label;
      const title = make('title');
      title.textContent = node.title;
      link.append(title, halo, label);
      nodeLayer.append(link);
    });

    svg.replaceChildren(edgeLayer, nodeLayer);

    const relatedIds = (id) => new Set(
      conceptEdges
        .filter((edge) => edge.from === id || edge.to === id)
        .flatMap((edge) => [edge.from, edge.to])
        .filter((candidate) => candidate !== id)
    );

    const focusNode = (id) => {
      const related = relatedIds(id);
      svg.classList.add('is-focusing');
      svg.querySelectorAll('.node-link').forEach((link) => {
        const candidate = link.dataset.mapLink;
        link.classList.toggle('is-current', candidate === id);
        link.classList.toggle('is-related', related.has(candidate));
      });
      svg.querySelectorAll('.edge').forEach((edge) => {
        edge.classList.toggle('is-active', edge.dataset.from === id || edge.dataset.to === id);
      });
      document.querySelectorAll('.spore-card').forEach((card) => {
        card.classList.toggle('is-related', related.has(card.dataset.mapNode) || card.dataset.mapNode === id);
      });
    };

    const releaseNode = () => {
      svg.classList.remove('is-focusing');
      svg.querySelectorAll('.node-link, .edge').forEach((element) => {
        element.classList.remove('is-current', 'is-related', 'is-active');
      });
      document.querySelectorAll('.spore-card').forEach((card) => card.classList.remove('is-related'));
    };

    svg.addEventListener('pointerover', (event) => {
      const link = event.target.closest?.('[data-map-link]');
      if (link) focusNode(link.dataset.mapLink);
    });
    svg.addEventListener('pointerleave', releaseNode);
    svg.addEventListener('focusin', (event) => {
      const link = event.target.closest?.('[data-map-link]');
      if (link) focusNode(link.dataset.mapLink);
    });
    svg.addEventListener('focusout', (event) => {
      if (!svg.contains(event.relatedTarget)) releaseNode();
    });

    document.querySelectorAll('[data-node-target]').forEach((link) => {
      link.addEventListener('pointerenter', () => focusNode(link.dataset.nodeTarget));
      link.addEventListener('pointerleave', releaseNode);
      link.addEventListener('focus', () => focusNode(link.dataset.nodeTarget));
      link.addEventListener('blur', releaseNode);
    });
  }

  function mountFieldFilter() {
    const form = document.querySelector('#field-filter');
    const status = document.querySelector('#filter-status');
    const svg = document.querySelector('#concept-map');
    if (!form || !status || !svg) return;

    const allowed = new Set(['all', 'perception', 'embodiment', 'transmission', 'memory']);

    const applyFilter = (value, updateUrl = true) => {
      const selected = allowed.has(value) ? value : 'all';
      let visibleCount = 0;

      document.querySelectorAll('.spore-card').forEach((card) => {
        const matches = selected === 'all' || card.dataset.cluster.split(' ').includes(selected);
        card.classList.toggle('is-filtered-out', !matches);
        if (matches) visibleCount += 1;
      });

      svg.querySelectorAll('.node-link').forEach((link) => {
        const matches = selected === 'all' || link.dataset.cluster.split(' ').includes(selected);
        link.classList.toggle('is-filtered-out', !matches);
      });

      svg.querySelectorAll('.edge').forEach((edge) => {
        const from = nodeIndex.get(edge.dataset.from);
        const to = nodeIndex.get(edge.dataset.to);
        const matches = selected === 'all' || from.cluster.includes(selected) || to.cluster.includes(selected);
        edge.classList.toggle('is-filtered-out', !matches);
      });

      status.textContent = selected === 'all'
        ? 'Eight nodes in the field.'
        : `${visibleCount} ${selected} node${visibleCount === 1 ? '' : 's'} emphasized. All eight remain reachable.`;

      const input = form.querySelector(`input[value="${selected}"]`);
      if (input) input.checked = true;

      if (updateUrl) {
        const url = new URL(window.location.href);
        if (selected === 'all') url.searchParams.delete('field');
        else url.searchParams.set('field', selected);
        history.replaceState({ field: selected }, '', url);
      }
    };

    form.addEventListener('change', (event) => {
      if (event.target.name === 'field') applyFilter(event.target.value);
    });

    const initial = new URL(window.location.href).searchParams.get('field') || 'all';
    applyFilter(initial, false);
    window.addEventListener('popstate', () => {
      applyFilter(new URL(window.location.href).searchParams.get('field') || 'all', false);
    });
  }

  function mountSectionSensing() {
    const sections = [...document.querySelectorAll('.trip-node')];
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const visited = [];
    let previousId = null;
    const trail = document.querySelector('#session-trail');

    const renderTrail = () => {
      if (!trail) return;
      trail.replaceChildren(...visited.slice(-5).map((id) => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = nodeTitle(id);
        item.append(link);
        return item;
      }));
    };

    const updateArrival = (section, fromId) => {
      const arrival = section.querySelector('[data-arrival]');
      if (!arrival || !fromId || fromId === section.id) return;
      const link = document.createElement('a');
      link.href = `#${fromId}`;
      link.textContent = nodeTitle(fromId);
      arrival.replaceChildren(
        document.createTextNode('This visit came through '),
        link,
        document.createTextNode('. This trail exists only in this tab.')
      );
    };

    const setCurrent = (section) => {
      const id = section.id;
      if (root.dataset.currentNode === id) return;
      const fromId = previousId;
      previousId = id;
      root.dataset.currentNode = id;
      zoneState.target = Number(section.dataset.zone || 0);
      sections.forEach((candidate) => candidate.classList.toggle('is-current', candidate === section));

      if (id && visited.at(-1) !== id) {
        visited.push(id);
        if (visited.length > 8) visited.shift();
        renderTrail();
      }
      updateArrival(section, fromId);

      const habitat = id === 'field-map' ? '#field-map'
        : id === 'source-vault' ? '#source-vault'
          : id === 'tune-the-field' ? '#tune-the-field'
            : id === 'threshold' ? '#threshold'
              : '#silence';
      document.querySelectorAll('.root-nav a').forEach((link) => {
        if (link.getAttribute('href') === habitat) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setCurrent(visible[0].target);
    }, { rootMargin: '-18% 0px -56% 0px', threshold: [0, 0.08, 0.2, 0.45] });

    sections.forEach((section) => observer.observe(section));
    renderTrail();
  }

  function mountProgress() {
    const progress = document.querySelector('#signal-progress');
    if (!progress) return;
    let ticking = false;

    const update = () => {
      const maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const value = Math.min(1, Math.max(0, window.scrollY / maximum));
      shaderState.scroll = value;
      progress.style.transform = `scaleY(${value})`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    update();
  }

  function mountDensityPreference() {
    const form = document.querySelector('#density-form');
    const reset = document.querySelector('#density-reset');
    const status = document.querySelector('#preference-status');
    if (!form || !reset || !status) return;

    const key = 'shipwrekt:symbiosis:v1';
    const allowed = new Set(['quiet', 'luminous', 'feral']);

    const apply = (value) => {
      if (!allowed.has(value)) return;
      root.dataset.signalDensity = value;
      shaderState.density = value;
      window.dispatchEvent(new CustomEvent('signal-density-change', { detail: { value } }));
    };

    let current = allowed.has(root.dataset.signalDensity) ? root.dataset.signalDensity : 'feral';
    try {
      const stored = JSON.parse(localStorage.getItem(key) || 'null');
      if (stored?.version === 1 && stored.kind === 'signal-density' && allowed.has(stored.value)) {
        current = stored.value;
        apply(current);
        status.textContent = `${nodeTitle('tune-the-field')} remembered: ${current}. Stored locally on this device.`;
      }
    } catch (_) {
      /* A malformed or unavailable preference must never block the artwork. */
    }
    const currentInput = form.querySelector(`input[value="${current}"]`);
    if (currentInput) currentInput.checked = true;

    form.addEventListener('change', (event) => {
      if (event.target.name === 'signal-density') apply(event.target.value);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const selected = new FormData(form).get('signal-density');
      if (!allowed.has(selected)) return;
      apply(selected);
      try {
        localStorage.setItem(key, JSON.stringify({ version: 1, kind: 'signal-density', value: selected }));
        status.textContent = `${nodeTitle('tune-the-field')} remembered: ${selected}. Stored locally on this device.`;
      } catch (_) {
        status.textContent = `${selected} is active for this visit, but this browser blocked local memory.`;
      }
      status.classList.remove('is-remembered');
      requestAnimationFrame(() => status.classList.add('is-remembered'));
      window.setTimeout(() => status.classList.remove('is-remembered'), 900);
    });

    reset.addEventListener('click', () => {
      try { localStorage.removeItem(key); } catch (_) { /* Reset still applies in memory. */ }
      apply('feral');
      const input = form.querySelector('input[value="feral"]');
      if (input) input.checked = true;
      status.textContent = 'Remembered preference cleared. Default feral signal restored.';
    });
  }

  function mountBreach() {
    document.querySelectorAll('[data-breach-button]').forEach((button) => {
      button.addEventListener('click', () => {
        shaderState.breach = 1;
        root.classList.add('is-breaching');
        window.setTimeout(() => root.classList.remove('is-breaching'), 950);
      });
    });
  }

  /* Haunting 1/3: one rare ambient glance after real quiet. */
  function mountIdleWatch() {
    const eye = document.querySelector('.watch-node');
    if (!eye || prefersReducedMotion.matches) return;
    let timer = 0;
    let manifested = false;

    const clear = () => window.clearTimeout(timer);
    const schedule = () => {
      clear();
      if (manifested || document.hidden) return;
      timer = window.setTimeout(() => {
        manifested = true;
        eye.classList.add('is-watching');
        window.setTimeout(() => eye.classList.remove('is-watching'), 1200);
      }, 14000);
    };

    ['pointerdown', 'keydown', 'scroll'].forEach((type) => {
      window.addEventListener(type, schedule, { passive: true });
    });
    document.addEventListener('visibilitychange', schedule);
    schedule();
  }

  /* Haunting 2/3: a card's inner glass leans; its link and hitbox never move. */
  function mountCardLeans() {
    const cards = document.querySelectorAll('.spore-card');
    cards.forEach((card) => {
      const inner = card.querySelector('.spore-card__body');
      if (!inner) return;

      const reset = () => {
        inner.style.removeProperty('--spore-tilt-x');
        inner.style.removeProperty('--spore-tilt-y');
      };

      card.addEventListener('pointermove', (event) => {
        if (!finePointer.matches || prefersReducedMotion.matches) return;
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        inner.style.setProperty('--spore-tilt-x', `${(-y * 1.1).toFixed(2)}deg`);
        inner.style.setProperty('--spore-tilt-y', `${(x * 1.4).toFixed(2)}deg`);
      });
      card.addEventListener('pointerleave', reset);
      card.addEventListener('focusin', () => {
        if (!prefersReducedMotion.matches) {
          inner.style.setProperty('--spore-tilt-x', '-0.6deg');
          inner.style.setProperty('--spore-tilt-y', '0.8deg');
        }
      });
      card.addEventListener('focusout', (event) => {
        if (!card.contains(event.relatedTarget)) reset();
      });
    });
  }

  function mountPointerField() {
    if (!finePointer.matches) return;
    window.addEventListener('pointermove', (event) => {
      shaderState.pointerTarget.x = event.clientX / Math.max(1, window.innerWidth);
      shaderState.pointerTarget.y = 1 - event.clientY / Math.max(1, window.innerHeight);
    }, { passive: true });
  }

  function mountShader() {
    const canvas = document.querySelector('#signal-field');
    if (!canvas || prefersReducedMotion.matches) return;

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false
    });
    if (!gl) return;

    const vertexSource = `#version 300 es
      in vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `#version 300 es
      precision highp float;

      uniform vec2 u_resolution;
      uniform vec2 u_pointer;
      uniform float u_time;
      uniform float u_scroll;
      uniform float u_zone;
      uniform float u_intensity;
      uniform float u_breach;

      out vec4 outColor;

      #define PI 3.14159265359

      mat2 rotate2d(float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return mat2(c, -s, s, c);
      }

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        mat2 turn = rotate2d(0.52);
        for (int i = 0; i < 5; i++) {
          value += amplitude * noise(p);
          p = turn * p * 2.03 + 13.7;
          amplitude *= 0.5;
        }
        return value;
      }

      float lattice(vec2 p) {
        float a = abs(sin(PI * p.x));
        float b = abs(sin(PI * (p.x * 0.5 + p.y * 0.8660254)));
        float c = abs(sin(PI * (p.x * 0.5 - p.y * 0.8660254)));
        float nearest = min(a, min(b, c));
        return pow(1.0 - nearest, 15.0);
      }

      vec3 zonePalette(float zone, float phase) {
        vec3 cyan = vec3(0.05, 0.92, 1.0);
        vec3 pink = vec3(1.0, 0.08, 0.56);
        vec3 lime = vec3(0.72, 1.0, 0.12);
        vec3 orange = vec3(1.0, 0.28, 0.04);
        vec3 violet = vec3(0.58, 0.22, 1.0);
        if (zone < 2.5) return mix(cyan, violet, phase);
        if (zone < 4.5) return mix(pink, cyan, phase);
        if (zone < 6.5) return mix(lime, cyan, phase);
        if (zone < 8.5) return mix(orange, pink, phase);
        if (zone < 10.5) return mix(pink, violet, phase);
        return mix(violet, lime, phase);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / max(1.0, u_resolution.y);
        float time = u_time * (0.055 + 0.075 * u_intensity);
        float zone = floor(u_zone + 0.5);
        float zonePhase = fract(u_zone);

        vec2 pointer = (u_pointer - 0.5) * vec2(u_resolution.x / max(1.0, u_resolution.y), 1.0);
        float attention = exp(-4.5 * length(uv - pointer));

        vec2 p = rotate2d(0.13 * zone + 0.08 * sin(time)) * uv;
        float fungal = fbm(p * (2.3 + 0.07 * zone) + vec2(time, -time * 0.62));
        float slowFold = sin(length(p) * 10.0 - time * 2.0 + fungal * 4.0);
        p += 0.105 * vec2(
          sin(p.y * 4.0 + time + fungal * 2.0),
          cos(p.x * 3.7 - time * 0.8 + fungal * 2.6)
        ) * (0.35 + u_intensity);

        float grid = lattice(p * (4.2 + 0.14 * zone));
        float angle = atan(p.y, p.x);
        float radius = length(p);
        float petals = abs(cos(angle * (3.0 + mod(zone, 4.0)) + slowFold));
        float metaRadius = 0.24 + 0.11 * petals + 0.025 * sin(angle * 9.0 - time * 3.0);
        float metaform = 1.0 - smoothstep(0.0, 0.022 + 0.014 * u_intensity, abs(radius - metaRadius));

        float rootBand = abs(sin((fungal * 7.0 + p.x * 2.0 - p.y * 1.4) * PI));
        float roots = pow(1.0 - rootBand, 13.0);
        float echoes = 0.0;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          vec2 echoP = rotate2d(fi * 0.09 + time * 0.04) * p * (1.0 + fi * 0.12);
          echoes += (1.0 - smoothstep(0.0, 0.018 + fi * 0.006, abs(length(echoP) - metaRadius - fi * 0.055))) / 3.0;
        }

        float rupture = u_breach * (1.0 - smoothstep(0.0, 0.24, abs(radius - 0.44 + 0.08 * sin(angle * 7.0))));
        float pulse = 0.5 + 0.5 * sin(time * 2.1 + fungal * 5.0 + u_scroll * PI * 4.0);
        vec3 accent = zonePalette(zone, clamp(pulse + zonePhase * 0.35, 0.0, 1.0));
        vec3 secondary = zonePalette(zone + 1.8, 1.0 - pulse);
        vec3 deep = vec3(0.012, 0.006, 0.028);

        float signal = grid * (0.12 + 0.35 * u_intensity)
                     + roots * (0.1 + 0.45 * u_intensity)
                     + metaform * (0.42 + 0.5 * u_intensity)
                     + echoes * 0.32
                     + attention * 0.09
                     + rupture * 0.8;

        vec3 color = deep;
        color += accent * signal;
        color += secondary * (fungal * 0.12 + max(0.0, slowFold) * 0.035);
        color += vec3(1.0, 0.94, 0.72) * pow(metaform, 2.0) * 0.34;
        color *= 0.72 + 0.28 * (1.0 - smoothstep(0.05, 1.15, radius));
        color = min(color, vec3(1.18));

        float alpha = clamp(0.42 + signal * 0.36 + fungal * 0.09, 0.36, 0.92);
        outColor = vec4(color, alpha);
      }
    `;

    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn('Shipwrekt shader compile failure:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Shipwrekt shader link failure:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      pointer: gl.getUniformLocation(program, 'u_pointer'),
      time: gl.getUniformLocation(program, 'u_time'),
      scroll: gl.getUniformLocation(program, 'u_scroll'),
      zone: gl.getUniformLocation(program, 'u_zone'),
      intensity: gl.getUniformLocation(program, 'u_intensity'),
      breach: gl.getUniformLocation(program, 'u_breach')
    };

    const intensityFor = () => ({ quiet: 0.2, luminous: 0.62, feral: 1 }[shaderState.density] ?? 1);
    let frame = 0;
    let running = false;
    let startTime = performance.now();

    const resize = () => {
      const density = shaderState.density;
      const maxDpr = density === 'feral' ? 1.55 : density === 'luminous' ? 1.3 : 1;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now) => {
      resize();
      const elapsed = (now - startTime) / 1000;
      zoneState.current += (zoneState.target - zoneState.current) * 0.035;
      shaderState.pointer.x += (shaderState.pointerTarget.x - shaderState.pointer.x) * 0.045;
      shaderState.pointer.y += (shaderState.pointerTarget.y - shaderState.pointer.y) * 0.045;
      shaderState.breach *= 0.94;

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.pointer, shaderState.pointer.x, shaderState.pointer.y);
      gl.uniform1f(uniforms.time, elapsed);
      gl.uniform1f(uniforms.scroll, shaderState.scroll);
      gl.uniform1f(uniforms.zone, zoneState.current);
      gl.uniform1f(uniforms.intensity, intensityFor());
      gl.uniform1f(uniforms.breach, shaderState.breach);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now) => {
      if (!running) return;
      draw(now);
      frame = requestAnimationFrame(loop);
    };

    const syncLoop = () => {
      const shouldRun = !document.hidden && shaderState.density !== 'quiet' && !prefersReducedMotion.matches;
      if (shouldRun && !running) {
        running = true;
        startTime = performance.now() - 7000;
        frame = requestAnimationFrame(loop);
      } else if (!shouldRun && running) {
        running = false;
        cancelAnimationFrame(frame);
      }
      if (!shouldRun && !prefersReducedMotion.matches) draw(performance.now());
    };

    root.classList.add('has-webgl');
    window.addEventListener('resize', () => {
      resize();
      if (!running) draw(performance.now());
    }, { passive: true });
    document.addEventListener('visibilitychange', syncLoop);
    window.addEventListener('signal-density-change', syncLoop);
    prefersReducedMotion.addEventListener?.('change', syncLoop);
    syncLoop();
  }

  buildConceptMap();
  mountFieldFilter();
  mountSectionSensing();
  mountProgress();
  mountDensityPreference();
  mountBreach();
  mountIdleWatch();
  mountCardLeans();
  mountPointerField();
  mountShader();
})();
