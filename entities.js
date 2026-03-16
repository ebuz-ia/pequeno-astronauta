// ============================================
// entities.js - Pixel sprites, entities, terrain
// Pequeno Astronauta v2.0
// ============================================

window.Game = window.Game || {};

// --- Color shortcuts ---
var _ = null; // transparent
var W = '#ffffff'; var G = '#aaaaaa'; var D = '#666666'; var K = '#333333';
var R = '#e53935'; var B = '#42a5f5'; var Y = '#ffeb3b'; var O = '#ff9800';
var Gn = '#4caf50'; var P = '#9c27b0'; var C = '#4fc3f7'; var Br = '#8d6e63';

// ===========================
// PIXEL SPRITES
// ===========================
Game.Sprites = {};

// --- Rocket (16 wide x 24 tall) ---
Game.Sprites.rocket = [
  [_,_,_,_,_,_,_,W,W,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,W,'#e0e0e0',W,W,_,_,_,_,_,_],
  [_,_,_,_,_,W,'#e0e0e0','#e0e0e0','#e0e0e0',W,_,_,_,_,_,_],
  [_,_,_,_,_,W,'#e0e0e0',C,C,W,_,_,_,_,_,_],
  [_,_,_,_,W,'#e0e0e0',C,'#1a237e',C,'#e0e0e0',W,_,_,_,_,_],
  [_,_,_,_,W,'#e0e0e0',C,C,C,'#e0e0e0',W,_,_,_,_,_],
  [_,_,_,_,W,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',W,_,_,_,_,_],
  [_,_,_,W,W,R,R,W,R,R,W,W,_,_,_,_],
  [_,_,_,W,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',W,_,_,_,_],
  [_,_,_,W,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',W,_,_,_,_],
  [_,_,_,W,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',W,_,_,_,_],
  [_,_,_,W,G,G,'#e0e0e0','#e0e0e0','#e0e0e0',G,G,W,_,_,_,_],
  [_,_,_,W,G,G,'#e0e0e0','#e0e0e0','#e0e0e0',G,G,W,_,_,_,_],
  [_,_,_,W,G,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',G,W,_,_,_,_],
  [_,_,W,W,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',W,W,_,_,_],
  [_,_,W,D,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',D,W,_,_,_],
  [_,W,W,D,'#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0','#e0e0e0',D,W,W,_,_],
  [_,W,D,D,G,G,G,G,G,G,G,D,D,W,_,_],
  [W,W,D,_,_,_,D,D,D,_,_,_,D,W,W,_],
  [W,R,_,_,_,_,_,D,_,_,_,_,_,R,W,_],
  [_,W,_,_,_,_,_,D,_,_,_,_,_,W,_,_],
  [_,_,_,_,_,_,_,K,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,K,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
];

// --- Rocket flame frames (16x8) ---
Game.Sprites.flame = [];
Game.Sprites.flame[0] = [
  [_,_,_,_,_,_,O,O,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,O,Y,Y,O,O,_,_,_,_,_,_],
  [_,_,_,_,_,O,Y,W,Y,O,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,Y,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,Y,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,O,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,R,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
];
Game.Sprites.flame[1] = [
  [_,_,_,_,_,O,O,O,O,O,_,_,_,_,_,_],
  [_,_,_,_,O,Y,Y,Y,Y,O,_,_,_,_,_,_],
  [_,_,_,_,_,O,Y,W,Y,O,_,_,_,_,_,_],
  [_,_,_,_,_,O,Y,Y,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,Y,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,O,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,R,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,R,_,_,_,_,_,_,_,_]
];
Game.Sprites.flame[2] = [
  [_,_,_,_,_,_,O,O,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,O,Y,Y,O,_,_,_,_,_,_,_],
  [_,_,_,_,O,Y,W,W,Y,O,_,_,_,_,_,_],
  [_,_,_,_,_,O,Y,Y,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,O,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,O,R,O,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,R,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_]
];

// --- Astronaut (12 wide x 16 tall) ---
Game.Sprites.astronautIdle = [
  [_,_,_,_,W,W,W,W,_,_,_,_],
  [_,_,_,W,G,G,G,G,W,_,_,_],
  [_,_,_,W,G,C,C,G,W,_,_,_],
  [_,_,_,W,G,C,'#1565c0',C,W,_,_,_],
  [_,_,_,W,G,C,C,G,W,_,_,_],
  [_,_,_,_,W,G,G,W,_,_,_,_],
  [_,_,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,_,_],
  [_,D,W,W,W,W,W,W,W,W,D,_],
  [_,D,_,W,W,W,W,W,W,_,D,_],
  [_,_,_,W,W,W,W,W,W,_,_,_],
  [_,_,_,W,W,_,_,W,W,_,_,_],
  [_,_,_,W,W,_,_,W,W,_,_,_],
  [_,_,W,W,W,_,_,W,W,W,_,_],
  [_,_,K,K,K,_,_,K,K,K,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_]
];

Game.Sprites.astronautWalk1 = [
  [_,_,_,_,W,W,W,W,_,_,_,_],
  [_,_,_,W,G,G,G,G,W,_,_,_],
  [_,_,_,W,G,C,C,G,W,_,_,_],
  [_,_,_,W,G,C,'#1565c0',C,W,_,_,_],
  [_,_,_,W,G,C,C,G,W,_,_,_],
  [_,_,_,_,W,G,G,W,_,_,_,_],
  [_,_,W,W,W,W,W,W,W,W,_,_],
  [_,_,W,W,W,W,W,W,W,W,_,_],
  [_,D,W,W,W,W,W,W,W,W,D,_],
  [_,D,_,W,W,W,W,W,W,_,D,_],
  [_,_,_,W,W,W,W,W,W,_,_,_],
  [_,_,_,_,W,W,W,W,_,_,_,_],
  [_,_,_,W,W,_,_,_,W,_,_,_],
  [_,_,W,W,_,_,_,_,W,W,_,_],
  [_,_,K,K,_,_,_,_,K,K,_,_],
  [_,_,_,_,_,_,_,_,_,_,_,_]
];

Game.Sprites.astronautJump = [
  [_,_,_,_,W,W,W,W,_,_,_,_],
  [_,_,_,W,G,G,G,G,W,_,_,_],
  [_,_,_,W,G,C,C,G,W,_,_,_],
  [_,_,_,W,G,C,'#1565c0',C,W,_,_,_],
  [_,_,_,W,G,C,C,G,W,_,_,_],
  [_,_,_,_,W,G,G,W,_,_,_,_],
  [_,D,W,W,W,W,W,W,W,W,D,_],
  [_,D,W,W,W,W,W,W,W,W,D,_],
  [_,_,W,W,W,W,W,W,W,W,_,_],
  [_,_,_,W,W,W,W,W,W,_,_,_],
  [_,_,_,W,W,W,W,W,W,_,_,_],
  [_,_,_,W,_,_,_,_,W,_,_,_],
  [_,_,W,W,_,_,_,_,W,W,_,_],
  [_,W,W,_,_,_,_,_,_,W,W,_],
  [_,K,K,_,_,_,_,_,_,K,K,_],
  [_,_,_,_,_,_,_,_,_,_,_,_]
];

// --- Meteor (10x10) ---
Game.Sprites.meteor = [
  [_,_,_,Br,Br,Br,Br,_,_,_],
  [_,_,Br,D,D,Br,D,Br,_,_],
  [_,Br,D,K,D,D,D,D,Br,_],
  [Br,D,D,D,D,K,D,D,D,Br],
  [Br,D,K,D,D,D,D,K,D,Br],
  [Br,D,D,D,K,D,D,D,D,Br],
  [Br,D,D,D,D,D,K,D,D,Br],
  [_,Br,D,D,K,D,D,D,Br,_],
  [_,_,Br,D,D,D,D,Br,_,_],
  [_,_,_,Br,Br,Br,Br,_,_]
];

// --- Enemy ship (12x10) ---
Game.Sprites.enemyShip = [
  [_,_,_,_,_,R,R,_,_,_,_,_],
  [_,_,_,_,R,D,D,R,_,_,_,_],
  [_,_,_,R,D,R,D,D,R,_,_,_],
  [_,_,R,D,D,D,D,D,D,R,_,_],
  [_,R,D,D,D,D,D,D,D,D,R,_],
  [R,D,D,G,D,D,D,D,G,D,D,R],
  [R,R,D,D,D,D,D,D,D,D,R,R],
  [_,_,R,D,D,D,D,D,D,R,_,_],
  [_,_,_,R,D,_,_,D,R,_,_,_],
  [_,_,_,_,R,_,_,R,_,_,_,_]
];

// --- Coin (8x8, 4 frames) ---
Game.Sprites.coin = [];
Game.Sprites.coin[0] = [
  [_,_,Y,Y,Y,Y,_,_],
  [_,Y,Y,O,O,Y,Y,_],
  [Y,Y,O,Y,Y,O,Y,Y],
  [Y,O,Y,O,O,Y,O,Y],
  [Y,O,Y,O,O,Y,O,Y],
  [Y,Y,O,Y,Y,O,Y,Y],
  [_,Y,Y,O,O,Y,Y,_],
  [_,_,Y,Y,Y,Y,_,_]
];
Game.Sprites.coin[1] = [
  [_,_,_,Y,Y,_,_,_],
  [_,_,Y,O,Y,Y,_,_],
  [_,Y,O,Y,O,Y,_,_],
  [_,Y,Y,O,Y,Y,_,_],
  [_,Y,Y,O,Y,Y,_,_],
  [_,Y,O,Y,O,Y,_,_],
  [_,_,Y,O,Y,Y,_,_],
  [_,_,_,Y,Y,_,_,_]
];
Game.Sprites.coin[2] = [
  [_,_,_,Y,Y,_,_,_],
  [_,_,_,O,Y,_,_,_],
  [_,_,Y,O,Y,_,_,_],
  [_,_,Y,Y,Y,_,_,_],
  [_,_,Y,Y,Y,_,_,_],
  [_,_,Y,O,Y,_,_,_],
  [_,_,_,O,Y,_,_,_],
  [_,_,_,Y,Y,_,_,_]
];
Game.Sprites.coin[3] = Game.Sprites.coin[1];

// --- Parachute (16x10) ---
Game.Sprites.parachute = [
  [_,_,_,R,R,R,R,R,R,R,R,R,R,_,_,_],
  [_,_,R,W,R,W,R,W,R,W,R,W,R,R,_,_],
  [_,R,W,W,R,W,W,R,W,W,R,W,W,R,_,_],
  [R,W,W,R,R,W,W,R,W,W,R,R,W,W,R,_],
  [R,_,R,_,_,R,_,_,_,R,_,_,R,_,R,_],
  [_,_,R,_,_,_,R,_,R,_,_,_,R,_,_,_],
  [_,_,_,R,_,_,_,R,_,_,_,R,_,_,_,_],
  [_,_,_,_,R,_,_,R,_,_,R,_,_,_,_,_],
  [_,_,_,_,_,R,_,R,_,R,_,_,_,_,_,_],
  [_,_,_,_,_,_,R,R,R,_,_,_,_,_,_,_]
];

// --- Shop building (24x20) ---
Game.Sprites.shop = [
  [_,_,_,_,_,_,_,_,Y,Y,Y,Y,Y,Y,Y,Y,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,Y,O,O,O,O,O,O,O,O,Y,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,Y,O,O,O,O,O,O,O,O,O,O,Y,_,_,_,_,_,_],
  [_,_,_,_,_,Y,O,O,O,O,O,O,O,O,O,O,O,O,Y,_,_,_,_,_],
  [_,_,_,_,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,Y,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,W,W,Br,Br,Br,Br,Br,Br,Br,Br,Br,W,W,Br,Br,_,_,_,_],
  [_,_,_,_,Br,W,W,Br,Br,Br,Br,Br,Br,Br,Br,Br,W,W,Br,Br,_,_,_,_],
  [_,_,_,_,Br,W,W,Br,Br,Br,Br,Br,Br,Br,Br,Br,W,W,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,K,K,K,K,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,Br,Br,Br,Br,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,Br,Br,Br,Br,Br,K,K,K,K,K,K,Br,Br,Br,Br,Br,_,_,_,_],
  [_,_,_,_,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,K,_,_,_,_]
];

// ===========================
// STARFIELD (reused, adapted for vertical)
// ===========================
Game.Starfield = function(count) {
  this.stars = [];
  for (var i = 0; i < (count || 200); i++) {
    var layer = Math.floor(Math.random() * 3);
    this.stars.push({
      x: Math.random() * Game.CANVAS_W,
      y: Math.random() * Game.CANVAS_H,
      size: 0.5 + layer * 0.8 + Math.random() * 0.5,
      speed: 20 + layer * 40 + Math.random() * 20,
      brightness: 0.3 + layer * 0.25 + Math.random() * 0.2,
      twinkleOffset: Math.random() * Math.PI * 2,
      layer: layer
    });
  }
  this.time = 0;
};

Game.Starfield.prototype.update = function(dt, scrollDir) {
  this.time += dt;
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    if (scrollDir === 'down') {
      s.y += s.speed * dt;
      if (s.y > Game.CANVAS_H + 5) { s.y = -5; s.x = Math.random() * Game.CANVAS_W; }
    } else if (scrollDir === 'left') {
      s.x -= s.speed * dt;
      if (s.x < -5) { s.x = Game.CANVAS_W + 5; s.y = Math.random() * Game.CANVAS_H; }
    }
  }
};

Game.Starfield.prototype.render = function(ctx) {
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    var twinkle = Math.sin(this.time * 2 + s.twinkleOffset) * 0.15 + 0.85;
    ctx.fillStyle = 'rgba(255,255,255,' + (s.brightness * twinkle) + ')';
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), Math.ceil(s.size), Math.ceil(s.size));
  }
};

// ===========================
// ENTITY MANAGER
// ===========================
Game.EntityManager = {
  bullets: [], enemies: [], meteors: [], coins: [], particles: [],

  add: function(type, entity) { if (this[type]) this[type].push(entity); },

  updateAll: function(dt) {
    var types = ['bullets', 'enemies', 'meteors', 'coins', 'particles'];
    for (var t = 0; t < types.length; t++) {
      var arr = this[types[t]];
      for (var i = arr.length - 1; i >= 0; i--) {
        arr[i].update(dt);
        if (!arr[i].active) arr.splice(i, 1);
      }
    }
  },

  renderAll: function(ctx, offsetX, offsetY) {
    var ox = offsetX || 0, oy = offsetY || 0;
    var types = ['coins', 'meteors', 'enemies', 'bullets', 'particles'];
    for (var t = 0; t < types.length; t++) {
      var arr = this[types[t]];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].active) arr[i].render(ctx, ox, oy);
      }
    }
  },

  clear: function() {
    this.bullets = []; this.enemies = []; this.meteors = [];
    this.coins = []; this.particles = [];
  }
};

// ===========================
// PARTICLES
// ===========================
Game.createParticle = function(x, y, color, size, speedMult) {
  var angle = Math.random() * Math.PI * 2;
  var speed = (50 + Math.random() * 150) * (speedMult || 1);
  return {
    x: x, y: y,
    dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed,
    life: 0.4 + Math.random() * 0.4, maxLife: 0.8,
    color: color, size: size || (2 + Math.random() * 3), active: true,
    update: function(dt) {
      this.x += this.dx * dt; this.y += this.dy * dt;
      this.dx *= 0.97; this.dy *= 0.97;
      this.life -= dt;
      if (this.life <= 0) this.active = false;
    },
    render: function(ctx, ox, oy) {
      var alpha = Math.max(0, this.life / this.maxLife);
      ctx.save(); ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - (ox || 0), this.y - (oy || 0), this.size, this.size);
      ctx.restore();
    }
  };
};

Game.spawnParticles = function(x, y, count, color, speedMult) {
  for (var i = 0; i < count; i++) {
    Game.EntityManager.add('particles', Game.createParticle(x, y, color, null, speedMult));
  }
};

// ===========================
// BULLET (shoots upward in flight)
// ===========================
Game.createBullet = function(x, y, damage, skinColor) {
  return {
    x: x, y: y, radius: 4,
    dy: -500, damage: damage || 10,
    color: skinColor || '#ffeb3b',
    lifetime: 3, active: true,
    update: function(dt) {
      this.y += this.dy * dt;
      this.lifetime -= dt;
      if (this.lifetime <= 0 || this.y < -20) this.active = false;
    },
    render: function(ctx, ox, oy) {
      var sx = this.x - (ox || 0);
      var sy = this.y - (oy || 0);
      ctx.fillStyle = this.color;
      ctx.fillRect(sx - 2, sy - 4, 4, 8);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(sx - 1, sy - 2, 2, 4);
    }
  };
};

// ===========================
// COIN (drops from enemies)
// ===========================
Game.createCoin = function(x, y, value) {
  return {
    x: x, y: y, radius: 8,
    value: value || 1, lifetime: 6, active: true, time: Math.random() * 10,
    dy: -80, // pop up then fall
    vy: 0, gravity: 200,
    update: function(dt) {
      this.time += dt;
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      this.lifetime -= dt;
      if (this.lifetime <= 0) this.active = false;
    },
    render: function(ctx, ox, oy) {
      var sx = this.x - (ox || 0);
      var sy = this.y - (oy || 0);
      if (this.lifetime < 2) { ctx.save(); ctx.globalAlpha = this.lifetime / 2; }
      var frame = Math.floor(this.time * 6) % 4;
      Game.Pixel.drawCentered(ctx, Game.Sprites.coin[frame], sx, sy, 2);
      if (this.lifetime < 2) ctx.restore();
    }
  };
};

// ===========================
// ROCKET (flight entity)
// ===========================
Game.Rocket = function(saveData) {
  var stats = Game.getRocketStats(saveData);
  this.x = Game.CANVAS_W / 2;
  this.y = Game.CANVAS_H - 80;
  this.width = 32; // 16 * scale 2
  this.height = 48;
  this.radius = 16;

  this.speed = stats.speed;
  this.fuel = saveData.fuel;
  this.maxFuel = stats.maxFuel;
  this.damageReduction = stats.damageReduction;
  this.fireCooldown = 0;
  this.fireRate = stats.fireCooldown;

  this.hp = 100;
  this.maxHp = 100;
  this.altitude = 0;
  this.ascending = true;
  this.parachute = false;
  this.parachuteDeploy = 0;

  this.flameFrame = 0;
  this.flameTimer = 0;
  this.active = true;
  this.shotSkin = saveData.shotSkin;
  this.time = 0;
};

Game.Rocket.prototype.update = function(dt) {
  this.time += dt;
  var inp = Game.Input;

  // Flame animation
  this.flameTimer += dt;
  if (this.flameTimer > 0.1) { this.flameTimer = 0; this.flameFrame = (this.flameFrame + 1) % 3; }

  if (this.parachute) {
    // Falling with parachute
    this.parachuteDeploy = Math.min(1, this.parachuteDeploy + dt * 2);
    this.altitude -= 80 * dt;
    this.y += 60 * dt; // visual fall
    // Sway
    this.x += Math.sin(this.time * 2) * 30 * dt;
    if (this.altitude <= 0) { this.altitude = 0; this.active = false; }
    return;
  }

  // Movement
  var mx = 0;
  if (inp.isDown('a') || inp.isDown('A') || inp.isDown('ArrowLeft')) mx = -1;
  if (inp.isDown('d') || inp.isDown('D') || inp.isDown('ArrowRight')) mx = 1;

  this.x += mx * 250 * dt;
  this.x = Math.max(20, Math.min(this.x, Game.CANVAS_W - 20));

  // Descend if holding down
  if (inp.isDown('s') || inp.isDown('S') || inp.isDown('ArrowDown')) {
    this.altitude -= this.speed * 0.5 * dt;
    if (this.altitude < 0) this.altitude = 0;
  }

  // Ascend (auto)
  if (this.fuel > 0 && this.ascending) {
    this.altitude += this.speed * dt;
    this.fuel -= dt * 8; // fuel consumption
    if (this.fuel <= 0) {
      this.fuel = 0;
      this.parachute = true;
    }
  }

  // Shooting
  this.fireCooldown -= dt * 1000;
  if ((inp.wasPressed(' ') || inp.isDown(' ')) && this.fireCooldown <= 0) {
    var skinData = Game.ShopData.skins.find(function(s) { return s.key === (Game.saveData.shotSkin || 'default'); });
    var bulletColor = skinData ? skinData.color : '#ffeb3b';
    Game.EntityManager.add('bullets', Game.createBullet(this.x, this.y - 24, 10, bulletColor));
    this.fireCooldown = this.fireRate;
  }
};

Game.Rocket.prototype.takeDamage = function(amount) {
  var dmg = amount * (1 - this.damageReduction);
  this.hp -= dmg;
  Game.triggerShake(6, 0.2);
  Game.spawnParticles(this.x, this.y, 6, '#f44336');
  if (this.hp <= 0) {
    this.hp = 0;
    this.parachute = true; // still deploy parachute
    Game.spawnParticles(this.x, this.y, 15, '#ff6b35', 1.5);
  }
};

Game.Rocket.prototype.render = function(ctx) {
  // Parachute
  if (this.parachute && this.parachuteDeploy > 0) {
    ctx.save();
    ctx.globalAlpha = this.parachuteDeploy;
    Game.Pixel.drawCentered(ctx, Game.Sprites.parachute, this.x, this.y - 40 - this.parachuteDeploy * 20, 2);
    // Strings
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x - 12, this.y - 40); ctx.lineTo(this.x - 4, this.y - 10);
    ctx.moveTo(this.x + 12, this.y - 40); ctx.lineTo(this.x + 4, this.y - 10);
    ctx.stroke();
    ctx.restore();
  }

  // Rocket
  Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, this.x, this.y, 2);

  // Flame (only when ascending with fuel)
  if (this.fuel > 0 && !this.parachute) {
    Game.Pixel.drawCentered(ctx, Game.Sprites.flame[this.flameFrame], this.x, this.y + 30, 2);
  }
};

// ===========================
// METEOR (falls down in flight)
// ===========================
Game.MeteorPixel = function(x, y, speed) {
  this.x = x;
  this.y = y;
  this.radius = 10;
  this.speed = speed || (120 + Math.random() * 200);
  this.rotation = 0;
  this.active = true;
};

Game.MeteorPixel.prototype.update = function(dt) {
  this.y += this.speed * dt;
  this.x += Math.sin(this.y * 0.01) * 20 * dt; // slight wobble
  if (this.y > Game.CANVAS_H + 40) this.active = false;
};

Game.MeteorPixel.prototype.render = function(ctx, ox, oy) {
  Game.Pixel.drawCentered(ctx, Game.Sprites.meteor, this.x - (ox || 0), this.y - (oy || 0), 2);
};

Game.MeteorPixel.prototype.destroy = function() {
  this.active = false;
  Game.spawnParticles(this.x, this.y, 8, '#8d6e63');
};

// ===========================
// ENEMY SHIP (comes from top in flight)
// ===========================
Game.EnemyShip = function(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 14;
  this.hp = 30;
  this.speed = 60 + Math.random() * 60;
  this.shootTimer = 1 + Math.random() * 2;
  this.coinDrop = 5 + Math.floor(Math.random() * 10);
  this.pattern = Math.random() < 0.5 ? 'zigzag' : 'straight';
  this.time = Math.random() * 10;
  this.active = true;
};

Game.EnemyShip.prototype.update = function(dt) {
  this.time += dt;
  this.y += this.speed * dt;

  if (this.pattern === 'zigzag') {
    this.x += Math.sin(this.time * 3) * 100 * dt;
  }

  this.x = Math.max(20, Math.min(this.x, Game.CANVAS_W - 20));

  // Shoot downward
  this.shootTimer -= dt;
  if (this.shootTimer <= 0) {
    this.shootTimer = 1.5 + Math.random() * 2;
    // Enemy bullet (goes down)
    Game.EntityManager.add('particles', {
      x: this.x, y: this.y + 12,
      dx: 0, dy: 300, life: 2, maxLife: 2,
      color: '#f44336', size: 4, active: true,
      isEnemyBullet: true,
      radius: 4,
      update: function(dt) {
        this.y += this.dy * dt;
        this.life -= dt;
        if (this.life <= 0 || this.y > Game.CANVAS_H + 20) this.active = false;
      },
      render: function(ctx, ox, oy) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - 2 - (ox || 0), this.y - 4 - (oy || 0), 4, 8);
      }
    });
  }

  if (this.y > Game.CANVAS_H + 40) this.active = false;
};

Game.EnemyShip.prototype.takeDamage = function(amount) {
  this.hp -= amount;
  if (this.hp <= 0) {
    this.active = false;
    Game.spawnParticles(this.x, this.y, 10, '#f44336');
    Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, this.coinDrop));
  }
};

Game.EnemyShip.prototype.render = function(ctx, ox, oy) {
  Game.Pixel.drawCentered(ctx, Game.Sprites.enemyShip, this.x - (ox || 0), this.y - (oy || 0), 2);
};

// ===========================
// ASTRONAUT (planet exploration)
// ===========================
Game.Astronaut = function(x, y) {
  this.x = x;
  this.y = y;
  this.width = 24; // 12 * 2
  this.height = 32; // 16 * 2
  this.vx = 0;
  this.vy = 0;
  this.speed = 160;
  this.jumpForce = -350;
  this.onGround = false;
  this.facing = 1; // 1=right, -1=left
  this.animFrame = 0;
  this.animTimer = 0;
  this.walking = false;
  this.active = true;
};

Game.Astronaut.prototype.update = function(dt, terrain, gravity) {
  var inp = Game.Input;
  var grav = (gravity || 1) * Game.GRAVITY;

  // Horizontal movement
  this.vx = 0;
  this.walking = false;
  if (inp.isDown('a') || inp.isDown('A') || inp.isDown('ArrowLeft')) {
    this.vx = -this.speed;
    this.facing = -1;
    this.walking = true;
  }
  if (inp.isDown('d') || inp.isDown('D') || inp.isDown('ArrowRight')) {
    this.vx = this.speed;
    this.facing = 1;
    this.walking = true;
  }

  // Jump
  if (this.onGround && (inp.wasPressed(' ') || inp.wasPressed('ArrowUp') || inp.wasPressed('w') || inp.wasPressed('W'))) {
    this.vy = this.jumpForce * (gravity < 0.5 ? 0.7 : 1); // Lower jump on low gravity (already floaty)
  }

  // Gravity
  this.vy += grav * dt;

  // Move
  this.x += this.vx * dt;
  this.y += this.vy * dt;

  // Ground collision with terrain
  this.onGround = false;
  if (terrain) {
    var footX = Math.floor(this.x);
    if (footX >= 0 && footX < terrain.length) {
      var groundY = terrain[footX];
      if (this.y + this.height / 2 >= groundY && this.vy >= 0) {
        this.y = groundY - this.height / 2;
        this.vy = 0;
        this.onGround = true;
      }
    }
  }

  // World bounds
  this.x = Math.max(12, Math.min(this.x, (terrain ? terrain.length : 1920) - 12));

  // Animation
  if (this.walking && this.onGround) {
    this.animTimer += dt;
    if (this.animTimer > 0.15) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  } else {
    this.animFrame = 0;
    this.animTimer = 0;
  }
};

Game.Astronaut.prototype.render = function(ctx, ox, oy) {
  var sx = this.x - (ox || 0);
  var sy = this.y - (oy || 0) - this.height / 2;
  var flipX = this.facing === -1;
  var sprite;

  if (!this.onGround) {
    sprite = Game.Sprites.astronautJump;
  } else if (this.walking) {
    sprite = this.animFrame === 0 ? Game.Sprites.astronautIdle : Game.Sprites.astronautWalk1;
  } else {
    sprite = Game.Sprites.astronautIdle;
  }

  Game.Pixel.draw(ctx, sprite, sx - this.width / 2, sy, 2, flipX);
};

// ===========================
// TERRAIN GENERATOR
// ===========================
Game.TerrainGenerator = {
  generate: function(planetIndex, width) {
    var planet = Game.PlanetData[planetIndex];
    var terrain = [];
    var baseY = planet.terrainBase;
    var variance = planet.terrainVariance;

    // Generate smooth terrain using sine waves
    for (var x = 0; x < width; x++) {
      var h = baseY;
      h += Math.sin(x * 0.01) * variance * 0.5;
      h += Math.sin(x * 0.03 + 2) * variance * 0.3;
      h += Math.sin(x * 0.005) * variance * 0.8;

      // Planet-specific features
      if (planetIndex === 1) { // Lua - craters
        if (Math.sin(x * 0.02 + 5) > 0.7) h += 15;
      }
      if (planetIndex === 3) { // Venus - jagged
        h += Math.sin(x * 0.08) * variance * 0.4;
      }
      if (planetIndex === 4) { // Plutao - icy flat with spikes
        if (Math.sin(x * 0.015 + 3) > 0.8) h -= 30;
      }

      terrain.push(Math.floor(h));
    }

    return terrain;
  },

  render: function(ctx, terrain, planetIndex, cameraX) {
    var planet = Game.PlanetData[planetIndex];
    var startX = Math.max(0, Math.floor(cameraX));
    var endX = Math.min(terrain.length, Math.floor(cameraX + Game.CANVAS_W + 1));

    for (var x = startX; x < endX; x++) {
      var screenX = x - cameraX;
      var groundY = terrain[x];
      var depth = Game.CANVAS_H - groundY;

      // Main ground
      ctx.fillStyle = planet.groundColor;
      ctx.fillRect(screenX, groundY, 1, depth);

      // Surface detail (top 3 pixels)
      ctx.fillStyle = planet.surfaceDetail;
      ctx.fillRect(screenX, groundY, 1, 2);

      // Darker layer below
      ctx.fillStyle = planet.groundDark;
      ctx.fillRect(screenX, groundY + 8, 1, depth - 8);

      // Random dirt/rock pixels
      if ((x * 7 + Math.floor(groundY)) % 13 === 0) {
        ctx.fillStyle = planet.groundLight;
        ctx.fillRect(screenX, groundY + 4 + (x % 5), 1, 2);
      }
    }
  }
};
