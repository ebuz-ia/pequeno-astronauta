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
  LAUNCH_BASE: 'LAUNCH_BASE',
  SPACE_FREE: 'SPACE_FREE',
  COCKPIT: 'COCKPIT',
  PLANET_EXPLORE: 'PLANET_EXPLORE',
  FLIGHT: 'FLIGHT'
};

Game.SubStates = {
  NONE: 'NONE',
  SHOP: 'SHOP',
  ASTEROID_LAND: 'ASTEROID_LAND',
  GAMEOVER: 'GAMEOVER'
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
    var s = scale || 3;
    return {
      w: sprite[0].length * s,
      h: sprite.length * s
    };
  },

  // GBA-style flat color bands (replaces gradients)
  drawColorBands: function(ctx, bands, x, y, w, h) {
    var cy = y;
    for (var i = 0; i < bands.length; i++) {
      var bh = Math.ceil(h * bands[i].ratio);
      ctx.fillStyle = bands[i].color;
      ctx.fillRect(x, cy, w, bh);
      cy += bh;
    }
  },

  // Pixelated circle using fillRect (serrated edges)
  drawCircle: function(ctx, cx, cy, radius, color, pixelSize) {
    var ps = pixelSize || 2;
    ctx.fillStyle = color;
    var r2 = radius * radius;
    for (var py = -radius; py <= radius; py += ps) {
      for (var px = -radius; px <= radius; px += ps) {
        if (px * px + py * py <= r2) {
          ctx.fillRect(cx + px, cy + py, ps, ps);
        }
      }
    }
  },

  // Pixelated ring (outline only)
  drawRing: function(ctx, cx, cy, radius, color, thickness, pixelSize) {
    var ps = pixelSize || 2;
    var t = thickness || 2;
    var outer2 = radius * radius;
    var inner2 = (radius - t) * (radius - t);
    ctx.fillStyle = color;
    for (var py = -radius; py <= radius; py += ps) {
      for (var px = -radius; px <= radius; px += ps) {
        var d2 = px * px + py * py;
        if (d2 <= outer2 && d2 >= inner2) {
          ctx.fillRect(cx + px, cy + py, ps, ps);
        }
      }
    }
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

    // Multitouch support - track all active touch points
    self.mouse.touches = [];

    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      self.mouse.touches = [];
      for (var i = 0; i < e.touches.length; i++) {
        self.mouse.touches.push({
          x: (e.touches[i].clientX - rect.left) / Game.scale,
          y: (e.touches[i].clientY - rect.top) / Game.scale
        });
      }
      self.mouse.x = self.mouse.touches[0].x;
      self.mouse.y = self.mouse.touches[0].y;
      self.mouse.down = true;
      self.mouse.clicked = true;
    });

    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      self.mouse.touches = [];
      for (var i = 0; i < e.touches.length; i++) {
        self.mouse.touches.push({
          x: (e.touches[i].clientX - rect.left) / Game.scale,
          y: (e.touches[i].clientY - rect.top) / Game.scale
        });
      }
      if (e.touches.length === 0) {
        self.mouse.down = false;
        self.mouse.touches = [];
      } else {
        self.mouse.x = self.mouse.touches[0].x;
        self.mouse.y = self.mouse.touches[0].y;
      }
    });

    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      var rect = canvas.getBoundingClientRect();
      self.mouse.touches = [];
      for (var i = 0; i < e.touches.length; i++) {
        self.mouse.touches.push({
          x: (e.touches[i].clientX - rect.left) / Game.scale,
          y: (e.touches[i].clientY - rect.top) / Game.scale
        });
      }
      self.mouse.x = self.mouse.touches[0].x;
      self.mouse.y = self.mouse.touches[0].y;
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

    // No hard clamping - allow free exploration (soft clamp to terrain bounds)
    if (this.mode === 'horizontal') {
      this.x = Math.max(-100, Math.min(this.x, Math.max(0, this.worldW - Game.CANVAS_W + 100)));
      this.y = 0;
    } else {
      // Free camera for other modes
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

// --- Galaxy Map (planet positions in 2D space) ---
// Each planet has galactic coordinates (gx, gy) for the cockpit map
Game.PlanetData = [
  { name: 'Terra', gravity: 1.0, gx: 0, gy: 0, distance: 0,
    groundColor: '#3a7d2e', groundDark: '#2d6323', groundLight: '#4a9d3e',
    skyTop: '#1a3a5c', skyBottom: '#5b8ab5', surfaceDetail: '#5cb85c',
    terrainVariance: 30, terrainBase: 380,
    shopItems: ['engine', 'fuelTank', 'heatShield', 'nozzle'], fuelPrice: 1 },
  { name: 'Lua', gravity: 0.4, gx: 1, gy: -1, distance: 3000,
    groundColor: '#b0b0b0', groundDark: '#8a8a8a', groundLight: '#c8c8c8',
    skyTop: '#0a0a1a', skyBottom: '#1a1a2a', surfaceDetail: '#999',
    terrainVariance: 20, terrainBase: 400,
    shopItems: ['engine', 'fuelTank'], fuelPrice: 3 },
  { name: 'Marte', gravity: 0.7, gx: 3, gy: 1, distance: 6000,
    groundColor: '#c1440e', groundDark: '#8b3209', groundLight: '#d4651a',
    skyTop: '#1a0a05', skyBottom: '#4a2010', surfaceDetail: '#d47030',
    terrainVariance: 40, terrainBase: 370,
    shopItems: ['heatShield', 'nozzle', 'fuelTank'], fuelPrice: 4 },
  { name: 'Venus', gravity: 1.2, gx: 2, gy: 3, distance: 8000,
    groundColor: '#d4a017', groundDark: '#a07010', groundLight: '#e8c040',
    skyTop: '#3a2000', skyBottom: '#8a5020', surfaceDetail: '#e8b030',
    terrainVariance: 50, terrainBase: 360,
    shopItems: ['nozzle', 'heatShield', 'engine'], fuelPrice: 5 },
  { name: 'Plutao', gravity: 0.3, gx: -2, gy: 4, distance: 10000,
    groundColor: '#4a6fa5', groundDark: '#3a5580', groundLight: '#6090c0',
    skyTop: '#050510', skyBottom: '#101030', surfaceDetail: '#7ab0e0',
    terrainVariance: 25, terrainBase: 390,
    shopItems: ['engine', 'fuelTank', 'heatShield', 'nozzle'], fuelPrice: 6 },
  // --- Tier 2 planets (unlocked after visiting 5) ---
  { name: 'Europa', gravity: 0.5, gx: -3, gy: -2, distance: 12000,
    groundColor: '#8ecae6', groundDark: '#6daed1', groundLight: '#b8e0f0',
    skyTop: '#0a1020', skyBottom: '#1a3050', surfaceDetail: '#a0d4ee',
    terrainVariance: 15, terrainBase: 410,
    shopItems: ['engine', 'fuelTank'], fuelPrice: 7 },
  { name: 'Titan', gravity: 0.6, gx: 5, gy: -1, distance: 14000,
    groundColor: '#d4a574', groundDark: '#b08050', groundLight: '#e8c090',
    skyTop: '#2a1500', skyBottom: '#6a4020', surfaceDetail: '#dab080',
    terrainVariance: 35, terrainBase: 375,
    shopItems: ['heatShield', 'nozzle'], fuelPrice: 8 },
  { name: 'Io', gravity: 0.8, gx: 4, gy: 4, distance: 16000,
    groundColor: '#e8c020', groundDark: '#c0a010', groundLight: '#f0d840',
    skyTop: '#1a1000', skyBottom: '#4a3010', surfaceDetail: '#f0e040',
    terrainVariance: 55, terrainBase: 355,
    shopItems: ['engine', 'heatShield'], fuelPrice: 9 },
  { name: 'Ganimedes', gravity: 0.5, gx: -4, gy: 2, distance: 18000,
    groundColor: '#7a8a6a', groundDark: '#5a6a4a', groundLight: '#9aaa8a',
    skyTop: '#0a0a10', skyBottom: '#1a2020', surfaceDetail: '#8a9a7a',
    terrainVariance: 30, terrainBase: 385,
    shopItems: ['fuelTank', 'nozzle'], fuelPrice: 10 },
  { name: 'Ceres', gravity: 0.3, gx: 0, gy: -5, distance: 20000,
    groundColor: '#808080', groundDark: '#606060', groundLight: '#a0a0a0',
    skyTop: '#050505', skyBottom: '#151515', surfaceDetail: '#909090',
    terrainVariance: 18, terrainBase: 405,
    shopItems: ['engine', 'fuelTank', 'heatShield', 'nozzle'], fuelPrice: 11 },
  // --- Tier 3 planets (unlocked after visiting 10) ---
  { name: 'Kepler-22b', gravity: 1.1, gx: 6, gy: 6, distance: 25000,
    groundColor: '#2e8b57', groundDark: '#1a6b3a', groundLight: '#4aab70',
    skyTop: '#0a2020', skyBottom: '#1a5050', surfaceDetail: '#3a9b67',
    terrainVariance: 45, terrainBase: 365,
    shopItems: ['engine', 'nozzle'], fuelPrice: 12 },
  { name: 'Proxima-b', gravity: 0.9, gx: -6, gy: -4, distance: 28000,
    groundColor: '#8b4513', groundDark: '#6b3010', groundLight: '#ab6530',
    skyTop: '#200a05', skyBottom: '#501a10', surfaceDetail: '#9b5520',
    terrainVariance: 50, terrainBase: 360,
    shopItems: ['heatShield', 'fuelTank'], fuelPrice: 13 },
  { name: 'Trappist-1e', gravity: 0.7, gx: -5, gy: 7, distance: 32000,
    groundColor: '#4a0080', groundDark: '#300060', groundLight: '#6a20a0',
    skyTop: '#100020', skyBottom: '#2a0050', surfaceDetail: '#5a10a0',
    terrainVariance: 38, terrainBase: 375,
    shopItems: ['engine', 'heatShield', 'nozzle'], fuelPrice: 14 },
  { name: 'Nebulosa X', gravity: 0.2, gx: 7, gy: -6, distance: 36000,
    groundColor: '#ff6b9d', groundDark: '#d04070', groundLight: '#ff90b0',
    skyTop: '#200020', skyBottom: '#500050', surfaceDetail: '#ff80a0',
    terrainVariance: 60, terrainBase: 350,
    shopItems: ['fuelTank', 'nozzle'], fuelPrice: 15 },
  { name: 'Centro Galactico', gravity: 1.5, gx: 0, gy: 10, distance: 40000,
    groundColor: '#ffd700', groundDark: '#ccaa00', groundLight: '#ffe44d',
    skyTop: '#1a1000', skyBottom: '#4a3000', surfaceDetail: '#ffe030',
    terrainVariance: 70, terrainBase: 345,
    shopItems: ['engine', 'fuelTank', 'heatShield', 'nozzle'], fuelPrice: 20 }
];

// --- Black Holes (rare random events, not permanent) ---
Game.BlackHoles = [];
Game.BlackHoleNames = ['Cygnus X-1', 'Sagitario A', 'M87', 'TON 618', 'V404 Cygni', 'GRS 1915', 'XTE J1550'];

// --- Ship Tiers (upgrade every 5 planets) ---
Game.ShipTiers = [
  { name: 'Explorer I', tier: 0, speedMult: 1.0, fuelMult: 1.0, hpMult: 1.0, color: '#e0e0e0' },
  { name: 'Voyager II', tier: 1, speedMult: 1.3, fuelMult: 1.5, hpMult: 1.3, color: '#4fc3f7' },
  { name: 'Odyssey III', tier: 2, speedMult: 1.6, fuelMult: 2.0, hpMult: 1.6, color: '#ffd700' }
];

Game.getShipTier = function(planetsVisited) {
  if (planetsVisited >= 10) return 2;
  if (planetsVisited >= 5) return 1;
  return 0;
};

// --- Shop Data ---
Game.ShopData = {
  parts: [
    { key: 'engine', name: 'Motor', desc: '+15% velocidade', baseCost: 100, costScale: 1.8, maxLevel: 4, color: '#f44336', icon: 'engine' },
    { key: 'fuelTank', name: 'Tanque', desc: '+50 fuel max', baseCost: 80, costScale: 1.6, maxLevel: 4, color: '#2196f3', icon: 'tank' },
    { key: 'heatShield', name: 'Escudo', desc: '-15% dano', baseCost: 120, costScale: 2.0, maxLevel: 4, color: '#ff9800', icon: 'shield' },
    { key: 'nozzle', name: 'Bocal', desc: '-20% cooldown tiro', baseCost: 90, costScale: 1.7, maxLevel: 4, color: '#9c27b0', icon: 'nozzle' },
    { key: 'armor', name: 'Armadura', desc: '+25 HP max', baseCost: 150, costScale: 1.9, maxLevel: 4, color: '#607d8b', icon: 'armor' },
    { key: 'laser', name: 'Laser', desc: '+20% dano tiro', baseCost: 200, costScale: 2.0, maxLevel: 3, color: '#00bcd4', icon: 'laser' },
    { key: 'magnet', name: 'Ima de Moedas', desc: '+30% raio coleta', baseCost: 80, costScale: 1.5, maxLevel: 3, color: '#ffd700', icon: 'magnet' },
    { key: 'radar', name: 'Esquadrao', desc: '+1 nave aliada', baseCost: 250, costScale: 2.2, maxLevel: 2, color: '#4caf50', icon: 'radar' }
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
  var tier = Game.ShipTiers[Game.getShipTier(saveData.planetsVisited || 0)];
  return {
    speed: 150 * (1 + parts.engine * 0.15) * tier.speedMult,
    maxFuel: (150 + parts.fuelTank * 50) * tier.fuelMult,
    damageReduction: parts.heatShield * 0.15,
    fireCooldown: Math.max(100, 400 - parts.nozzle * 80),
    maxHp: (100 + (parts.armor || 0) * 25) * tier.hpMult,
    damageBonus: 1 + (parts.laser || 0) * 0.2,
    coinMagnet: 30 + (parts.magnet || 0) * 10,
    radarRange: (parts.radar || 0) > 0 ? 300 + (parts.radar || 0) * 150 : 0,
    tier: tier
  };
};

// --- Save/Load ---
Game.Save = {
  KEY: 'pequeno-astronauta-v2',

  defaults: function() {
    return {
      coins: 999999,
      currentPlanet: 0,
      highestPlanet: 0,
      planetsVisited: 0,
      visitedPlanets: [0], // array of visited planet indices
      targetPlanet: -1, // selected destination from cockpit
      fuel: 9999,
      rocketParts: { engine: 0, fuelTank: 0, heatShield: 0, nozzle: 0, armor: 0, laser: 0, magnet: 0, radar: 0 },
      shotSkin: 'default',
      unlockedSkins: ['default'],
      hasRobot: false,
      robotLevel: 0,
      asteroidsLanded: 0,
      hunger: 100,
      ammo: 50,
      maxAmmo: 50,
      currentWeapon: 'blaster',
      weapons: { blaster: true },
      scrapsCollected: 0,
      emeraldShards: 0,
      bossesDefeated: [],
      gameCompleted: false,
      foundEasterEgg: false,
      easterEggPlanet: -1,
      shipTierNotified: -1
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
          planetsVisited: parsed.planetsVisited || def.planetsVisited,
          visitedPlanets: parsed.visitedPlanets || def.visitedPlanets,
          targetPlanet: parsed.targetPlanet !== undefined ? parsed.targetPlanet : def.targetPlanet,
          fuel: parsed.fuel !== undefined ? parsed.fuel : def.fuel,
          rocketParts: Object.assign({}, def.rocketParts, parsed.rocketParts || {}),
          shotSkin: parsed.shotSkin || def.shotSkin,
          unlockedSkins: parsed.unlockedSkins || def.unlockedSkins,
          hasRobot: parsed.hasRobot || def.hasRobot,
          robotLevel: parsed.robotLevel || def.robotLevel,
          asteroidsLanded: parsed.asteroidsLanded || def.asteroidsLanded,
          hunger: parsed.hunger !== undefined ? parsed.hunger : def.hunger,
          ammo: parsed.ammo !== undefined ? parsed.ammo : def.ammo,
          maxAmmo: parsed.maxAmmo || def.maxAmmo,
          currentWeapon: parsed.currentWeapon || def.currentWeapon,
          weapons: parsed.weapons || def.weapons,
          scrapsCollected: parsed.scrapsCollected || def.scrapsCollected,
          emeraldShards: parsed.emeraldShards || def.emeraldShards,
          bossesDefeated: parsed.bossesDefeated || def.bossesDefeated,
          gameCompleted: parsed.gameCompleted || def.gameCompleted,
          foundEasterEgg: parsed.foundEasterEgg || def.foundEasterEgg,
          easterEggPlanet: parsed.easterEggPlanet !== undefined ? parsed.easterEggPlanet : def.easterEggPlanet,
          shipTierNotified: parsed.shipTierNotified !== undefined ? parsed.shipTierNotified : def.shipTierNotified
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

  // Update systems
  if (Game.Combo) Game.Combo.update(dt);
  if (Game.Milestones) Game.Milestones.update(dt);
  if (Game.updateFloatingTexts) Game.updateFloatingTexts(dt);

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

  // Floating texts (above scene)
  if (Game.renderFloatingTexts) Game.renderFloatingTexts(ctx, 0, 0);

  // Milestone celebration (above everything)
  if (Game.Milestones) Game.Milestones.render(ctx);

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

  // Init audio on first interaction
  Game.canvas.addEventListener('click', function() { if (Game.Audio) Game.Audio.init(); }, { once: true });
  Game.canvas.addEventListener('keydown', function() { if (Game.Audio) Game.Audio.init(); }, { once: true });

  // Init milestones
  if (Game.Milestones) Game.Milestones.init();
  window.addEventListener('resize', Game.resize);

  Game.state = Game.States.LAUNCH_BASE;
  if (Game.scenes[Game.States.LAUNCH_BASE] && Game.scenes[Game.States.LAUNCH_BASE].enter) {
    Game.scenes[Game.States.LAUNCH_BASE].enter();
  }

  Game.lastTime = performance.now();
  requestAnimationFrame(Game.loop);
};

window.onload = function() { Game.init(); };
