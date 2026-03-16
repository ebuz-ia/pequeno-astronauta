// ============================================
// game.js - Core engine + PixelRenderer + Planet/Shop data
// Pequeno Astronauta v2.0 - Pixel Art Edition
// ============================================

window.Game = window.Game || {};

// --- Constants ---
Game.CANVAS_W = 960;
Game.CANVAS_H = 540;
Game.GRAVITY = 600; // base gravity px/s^2

Game.States = {
  MENU: 'MENU',
  PLANET_EXPLORE: 'PLANET_EXPLORE',
  FLIGHT: 'FLIGHT'
};

Game.SubStates = {
  NONE: 'NONE',
  SHOP: 'SHOP',
  REPAIR: 'REPAIR'
};

// --- Runtime State ---
Game.state = null;
Game.subState = Game.SubStates.NONE;
Game.scenes = Game.scenes || {};
Game.canvas = null;
Game.ctx = null;
Game.scale = 1;
Game.paused = false;
Game.saveData = null;
Game.time = 0;
Game.message = null;

// --- Pixel Renderer ---
Game.Pixel = {
  draw: function(ctx, sprite, x, y, scale, flipX) {
    if (!sprite || !sprite.length) return;
    var s = scale || 2;
    var rows = sprite.length;
    var cols = sprite[0].length;
    var w = cols * s;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var color = sprite[r][c];
        if (!color) continue;
        var px = flipX ? x + (cols - 1 - c) * s : x + c * s;
        var py = y + r * s;
        ctx.fillStyle = color;
        ctx.fillRect(px, py, s, s);
      }
    }
  },

  drawCentered: function(ctx, sprite, cx, cy, scale, flipX) {
    if (!sprite || !sprite.length) return;
    var s = scale || 2;
    var w = sprite[0].length * s;
    var h = sprite.length * s;
    this.draw(ctx, sprite, cx - w / 2, cy - h / 2, s, flipX);
  },

  getSize: function(sprite, scale) {
    var s = scale || 2;
    return {
      w: sprite[0].length * s,
      h: sprite.length * s
    };
  }
};

// --- Screen Shake ---
Game.shake = { intensity: 0, duration: 0 };

Game.triggerShake = function(intensity, duration) {
  Game.shake.intensity = intensity;
  Game.shake.duration = duration;
};

// --- Transition ---
Game.transition = { active: false, alpha: 0, dir: 1, callback: null, speed: 3 };

Game.startTransition = function(callback) {
  Game.transition.active = true;
  Game.transition.alpha = 0;
  Game.transition.dir = 1;
  Game.transition.callback = callback;
};

// --- Input Manager ---
Game.Input = {
  keys: {},
  justPressed: {},
  mouse: { x: 0, y: 0, clicked: false, down: false },

  init: function(canvas) {
    var self = this;

    window.addEventListener('keydown', function(e) {
      if (!self.keys[e.key]) {
        self.justPressed[e.key] = true;
      }
      self.keys[e.key] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].indexOf(e.key) !== -1) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', function(e) {
      self.keys[e.key] = false;
    });

    canvas.addEventListener('mousedown', function(e) {
      self.mouse.down = true;
      self.mouse.clicked = true;
    });

    canvas.addEventListener('mouseup', function(e) {
      self.mouse.down = false;
    });

    canvas.addEventListener('mousemove', function(e) {
      var rect = canvas.getBoundingClientRect();
      self.mouse.x = (e.clientX - rect.left) / Game.scale;
      self.mouse.y = (e.clientY - rect.top) / Game.scale;
    });

    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var touch = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      self.mouse.x = (touch.clientX - rect.left) / Game.scale;
      self.mouse.y = (touch.clientY - rect.top) / Game.scale;
      self.mouse.down = true;
      self.mouse.clicked = true;
    });

    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      self.mouse.down = false;
    });

    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var touch = e.touches[0];
      var rect = canvas.getBoundingClientRect();
      self.mouse.x = (touch.clientX - rect.left) / Game.scale;
      self.mouse.y = (touch.clientY - rect.top) / Game.scale;
    });
  },

  isDown: function(key) { return !!this.keys[key]; },
  wasPressed: function(key) { return !!this.justPressed[key]; },
  endFrame: function() { this.justPressed = {}; this.mouse.clicked = false; }
};

// --- Camera ---
Game.Camera = {
  x: 0, y: 0,
  targetX: 0, targetY: 0,
  lerpSpeed: 5,
  worldW: 1920, worldH: 1080,
  mode: 'horizontal', // 'horizontal' for planet, 'vertical' for flight

  setWorldBounds: function(w, h) {
    this.worldW = w;
    this.worldH = h;
  },

  follow: function(target, dt) {
    if (this.mode === 'horizontal') {
      this.targetX = target.x - Game.CANVAS_W / 2;
      this.targetY = 0; // fixed Y for planet exploration
    } else {
      this.targetX = target.x - Game.CANVAS_W / 2;
      this.targetY = target.y - Game.CANVAS_H / 2;
    }

    this.x += (this.targetX - this.x) * this.lerpSpeed * dt;
    this.y += (this.targetY - this.y) * this.lerpSpeed * dt;

    this.x = Math.max(0, Math.min(this.x, Math.max(0, this.worldW - Game.CANVAS_W)));
    if (this.mode === 'horizontal') {
      this.y = 0;
    } else {
      this.y = Math.max(0, Math.min(this.y, Math.max(0, this.worldH - Game.CANVAS_H)));
    }
  },

  reset: function() { this.x = 0; this.y = 0; this.targetX = 0; this.targetY = 0; },
  worldToScreen: function(wx, wy) { return { x: wx - this.x, y: wy - this.y }; },
  screenToWorld: function(sx, sy) { return { x: sx + this.x, y: sy + this.y }; }
};

// --- Collision Helpers ---
Game.Collision = {
  circleCircle: function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < (a.radius + b.radius);
  },

  pointCircle: function(px, py, c) {
    var dx = px - c.x;
    var dy = py - c.y;
    return (dx * dx + dy * dy) < (c.radius * c.radius);
  },

  rectRect: function(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  },

  pointRect: function(px, py, r) {
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }
};

// --- Planet Data ---
Game.PlanetData = [
  {
    name: 'Terra', altitude: 0, gravity: 1.0,
    groundColor: '#3a7d2e', groundDark: '#2d6323', groundLight: '#4a9d3e',
    skyTop: '#1a3a5c', skyBottom: '#5b8ab5',
    surfaceDetail: '#5cb85c',
    terrainVariance: 30, terrainBase: 380,
    shopItems: ['engine', 'fuelTank', 'heatShield', 'nozzle'],
    fuelPrice: 1
  },
  {
    name: 'Lua', altitude: 3000, gravity: 0.4,
    groundColor: '#b0b0b0', groundDark: '#8a8a8a', groundLight: '#c8c8c8',
    skyTop: '#0a0a1a', skyBottom: '#1a1a2a',
    surfaceDetail: '#999',
    terrainVariance: 20, terrainBase: 400,
    shopItems: ['engine', 'fuelTank'],
    fuelPrice: 3
  },
  {
    name: 'Marte', altitude: 12000, gravity: 0.7,
    groundColor: '#c1440e', groundDark: '#8b3209', groundLight: '#d4651a',
    skyTop: '#1a0a05', skyBottom: '#4a2010',
    surfaceDetail: '#d47030',
    terrainVariance: 40, terrainBase: 370,
    shopItems: ['heatShield', 'nozzle', 'fuelTank'],
    fuelPrice: 4
  },
  {
    name: 'Venus', altitude: 22000, gravity: 1.2,
    groundColor: '#d4a017', groundDark: '#a07010', groundLight: '#e8c040',
    skyTop: '#3a2000', skyBottom: '#8a5020',
    surfaceDetail: '#e8b030',
    terrainVariance: 50, terrainBase: 360,
    shopItems: ['nozzle', 'heatShield', 'engine'],
    fuelPrice: 5
  },
  {
    name: 'Plutao', altitude: 35000, gravity: 0.3,
    groundColor: '#4a6fa5', groundDark: '#3a5580', groundLight: '#6090c0',
    skyTop: '#050510', skyBottom: '#101030',
    surfaceDetail: '#7ab0e0',
    terrainVariance: 25, terrainBase: 390,
    shopItems: ['engine', 'fuelTank', 'heatShield', 'nozzle'],
    fuelPrice: 6
  }
];

// --- Shop Data ---
Game.ShopData = {
  parts: [
    { key: 'engine', name: 'Motor', desc: '+15% velocidade', baseCost: 100, costScale: 1.8, maxLevel: 4, color: '#f44336', icon: 'engine' },
    { key: 'fuelTank', name: 'Tanque', desc: '+50 fuel max', baseCost: 80, costScale: 1.6, maxLevel: 4, color: '#2196f3', icon: 'tank' },
    { key: 'heatShield', name: 'Escudo', desc: '-15% dano', baseCost: 120, costScale: 2.0, maxLevel: 4, color: '#ff9800', icon: 'shield' },
    { key: 'nozzle', name: 'Bocal', desc: '-20% cooldown', baseCost: 90, costScale: 1.7, maxLevel: 4, color: '#9c27b0', icon: 'nozzle' }
  ],

  skins: [
    { key: 'default', name: 'Padrao', cost: 0, color: '#ffeb3b' },
    { key: 'red', name: 'Fogo', cost: 50, color: '#f44336' },
    { key: 'blue', name: 'Gelo', cost: 50, color: '#4fc3f7' },
    { key: 'green', name: 'Plasma', cost: 80, color: '#4caf50' },
    { key: 'purple', name: 'Nebula', cost: 120, color: '#9c27b0' }
  ],

  getPartCost: function(partKey, currentLevel) {
    var part = this.parts.find(function(p) { return p.key === partKey; });
    if (!part || currentLevel >= part.maxLevel) return -1;
    return Math.floor(part.baseCost * Math.pow(part.costScale, currentLevel));
  }
};

// --- Rocket Stats Calculator ---
Game.getRocketStats = function(saveData) {
  var parts = saveData.rocketParts;
  return {
    speed: 150 * (1 + parts.engine * 0.15),
    maxFuel: 150 + parts.fuelTank * 50,
    damageReduction: parts.heatShield * 0.15,
    fireCooldown: Math.max(100, 400 - parts.nozzle * 80)
  };
};

// --- Save/Load ---
Game.Save = {
  KEY: 'pequeno-astronauta-v2',

  defaults: function() {
    return {
      coins: 100,
      currentPlanet: 0,
      highestPlanet: 0,
      fuel: 150,
      rocketParts: { engine: 0, fuelTank: 0, heatShield: 0, nozzle: 0 },
      shotSkin: 'default',
      unlockedSkins: ['default'],
      hasRobot: false,
      robotLevel: 0,
      foundEasterEgg: false,
      easterEggPlanet: -1
    };
  },

  load: function() {
    try {
      var data = localStorage.getItem(this.KEY);
      if (data) {
        var parsed = JSON.parse(data);
        var def = this.defaults();
        return {
          coins: parsed.coins !== undefined ? parsed.coins : def.coins,
          currentPlanet: parsed.currentPlanet || def.currentPlanet,
          highestPlanet: parsed.highestPlanet || def.highestPlanet,
          fuel: parsed.fuel !== undefined ? parsed.fuel : def.fuel,
          rocketParts: Object.assign({}, def.rocketParts, parsed.rocketParts || {}),
          shotSkin: parsed.shotSkin || def.shotSkin,
          unlockedSkins: parsed.unlockedSkins || def.unlockedSkins,
          hasRobot: parsed.hasRobot || def.hasRobot,
          robotLevel: parsed.robotLevel || def.robotLevel,
          foundEasterEgg: parsed.foundEasterEgg || def.foundEasterEgg,
          easterEggPlanet: parsed.easterEggPlanet !== undefined ? parsed.easterEggPlanet : def.easterEggPlanet
        };
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return this.defaults();
  },

  save: function(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); }
    catch (e) { console.warn('Failed to save:', e); }
  },

  clear: function() { localStorage.removeItem(this.KEY); }
};

// --- State Machine ---
Game.changeState = function(newState, data) {
  if (Game.scenes[Game.state] && Game.scenes[Game.state].exit) {
    Game.scenes[Game.state].exit();
  }
  Game.startTransition(function() {
    Game.state = newState;
    Game.subState = Game.SubStates.NONE;
    Game.paused = false;
    if (Game.scenes[newState] && Game.scenes[newState].enter) {
      Game.scenes[newState].enter(data);
    }
  });
};

Game.changeStateImmediate = function(newState, data) {
  if (Game.scenes[Game.state] && Game.scenes[Game.state].exit) {
    Game.scenes[Game.state].exit();
  }
  Game.state = newState;
  Game.subState = Game.SubStates.NONE;
  Game.paused = false;
  if (Game.scenes[newState] && Game.scenes[newState].enter) {
    Game.scenes[newState].enter(data);
  }
};

Game.showMessage = function(text, duration) {
  Game.message = { text: text, timer: duration || 3 };
};

// --- Canvas Scaling ---
Game.resize = function() {
  var w = window.innerWidth;
  var h = window.innerHeight;
  var ratio = Game.CANVAS_W / Game.CANVAS_H;
  var newW, newH;
  if (w / h > ratio) { newH = h; newW = h * ratio; }
  else { newW = w; newH = w / ratio; }
  Game.canvas.style.width = newW + 'px';
  Game.canvas.style.height = newH + 'px';
  Game.scale = newW / Game.CANVAS_W;
};

// --- Game Loop ---
Game.lastTime = 0;

Game.loop = function(timestamp) {
  var dt = (timestamp - Game.lastTime) / 1000;
  Game.lastTime = timestamp;
  if (dt > 0.05) dt = 0.05;
  if (dt <= 0) dt = 0.016;

  Game.time += dt;

  // Update transition
  if (Game.transition.active) {
    Game.transition.alpha += Game.transition.dir * Game.transition.speed * dt;
    if (Game.transition.dir === 1 && Game.transition.alpha >= 1) {
      Game.transition.alpha = 1;
      if (Game.transition.callback) { Game.transition.callback(); Game.transition.callback = null; }
      Game.transition.dir = -1;
    }
    if (Game.transition.dir === -1 && Game.transition.alpha <= 0) {
      Game.transition.alpha = 0;
      Game.transition.active = false;
    }
  }

  if (!Game.paused && Game.scenes[Game.state]) {
    Game.scenes[Game.state].update(dt);
  }

  if (Game.message) {
    Game.message.timer -= dt;
    if (Game.message.timer <= 0) Game.message = null;
  }

  if (Game.shake.duration > 0) {
    Game.shake.duration -= dt;
    if (Game.shake.duration <= 0) Game.shake.intensity = 0;
  }

  var ctx = Game.ctx;
  ctx.save();

  if (Game.shake.intensity > 0) {
    ctx.translate((Math.random() - 0.5) * Game.shake.intensity * 2,
                  (Math.random() - 0.5) * Game.shake.intensity * 2);
  }

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(-10, -10, Game.CANVAS_W + 20, Game.CANVAS_H + 20);

  if (Game.scenes[Game.state]) {
    Game.scenes[Game.state].render(ctx);
  }

  ctx.restore();

  if (Game.transition.active && Game.transition.alpha > 0) {
    ctx.save();
    ctx.globalAlpha = Game.transition.alpha;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    ctx.restore();
  }

  if (Game.message) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, Game.message.timer);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    var mw = Math.min(500, ctx.measureText(Game.message.text).width + 60);
    ctx.fillRect(Game.CANVAS_W / 2 - mw / 2, Game.CANVAS_H / 2 - 25, mw, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Game.message.text, Game.CANVAS_W / 2, Game.CANVAS_H / 2);
    ctx.restore();
  }

  if (Game.paused && Game.UI) {
    Game.UI.renderPause(ctx);
  }

  Game.Input.endFrame();
  requestAnimationFrame(Game.loop);
};

// --- Init ---
Game.init = function() {
  Game.canvas = document.getElementById('game');
  Game.ctx = Game.canvas.getContext('2d');
  Game.ctx.imageSmoothingEnabled = false;

  Game.Input.init(Game.canvas);
  Game.saveData = Game.Save.load();
  Game.resize();
  window.addEventListener('resize', Game.resize);

  Game.state = Game.States.MENU;
  if (Game.scenes[Game.States.MENU] && Game.scenes[Game.States.MENU].enter) {
    Game.scenes[Game.States.MENU].enter();
  }

  Game.lastTime = performance.now();
  requestAnimationFrame(Game.loop);
};

window.onload = function() { Game.init(); };
