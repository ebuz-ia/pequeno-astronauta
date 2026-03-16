// ============================================
// entities.js - All game entities, drawing helpers, starfield, entity manager
// ============================================

window.Game = window.Game || {};

// --- Drawing Helpers ---
Game.Draw = {
  rocket: function(ctx, x, y, angle, scale, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // Body
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(-12, 15);
    ctx.lineTo(12, 15);
    ctx.closePath();
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Color stripe
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.lineTo(-6, 8);
    ctx.lineTo(6, 8);
    ctx.closePath();
    ctx.fillStyle = color || '#4fc3f7';
    ctx.fill();

    // Window
    ctx.beginPath();
    ctx.arc(0, -8, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#64b5f6';
    ctx.fill();
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Fins
    ctx.fillStyle = color || '#4fc3f7';
    ctx.beginPath();
    ctx.moveTo(-12, 15);
    ctx.lineTo(-20, 22);
    ctx.lineTo(-10, 18);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(12, 15);
    ctx.lineTo(20, 22);
    ctx.lineTo(10, 18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  },

  rocketFlame: function(ctx, x, y, angle, scale, time) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    var flicker = Math.sin(time * 15) * 3;
    var flicker2 = Math.cos(time * 20) * 2;

    // Outer flame
    ctx.beginPath();
    ctx.moveTo(-8, 15);
    ctx.lineTo(0, 30 + flicker);
    ctx.lineTo(8, 15);
    ctx.closePath();
    ctx.fillStyle = '#ff6b35';
    ctx.globalAlpha = 0.8;
    ctx.fill();

    // Inner flame
    ctx.beginPath();
    ctx.moveTo(-4, 15);
    ctx.lineTo(0, 24 + flicker2);
    ctx.lineTo(4, 15);
    ctx.closePath();
    ctx.fillStyle = '#ffeb3b';
    ctx.globalAlpha = 0.9;
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.restore();
  },

  astronaut: function(ctx, x, y, angle, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Backpack
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(-14, -6, 6, 14);

    // Body (suit)
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#eceff1';
    ctx.fill();
    ctx.strokeStyle = '#b0bec5';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Helmet visor
    ctx.beginPath();
    ctx.arc(3, -2, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#4fc3f7';
    ctx.fill();
    ctx.strokeStyle = '#0288d1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Visor reflection
    ctx.beginPath();
    ctx.arc(5, -4, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();

    // Legs
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(-6, 10, 5, 8);
    ctx.fillRect(2, 10, 5, 8);

    // Boots
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(-7, 16, 6, 4);
    ctx.fillRect(1, 16, 6, 4);

    // Direction indicator (arm pointing toward angle)
    if (angle !== undefined) {
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = '#eceff1';
      ctx.fillRect(10, -2, 8, 4);
      ctx.fillStyle = '#ff8a65';
      ctx.fillRect(16, -3, 5, 6); // gun
      ctx.restore();
    }

    ctx.restore();
  },

  hexagon: function(ctx, x, y, radius, rotation, color, eyeColor) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Body
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = (Math.PI / 3) * i - Math.PI / 2;
      var px = Math.cos(a) * radius;
      var py = Math.sin(a) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Eye
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = eyeColor || '#fff';
    ctx.fill();

    // Pupil
    ctx.beginPath();
    ctx.arc(radius * 0.08, 0, radius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a2a';
    ctx.fill();

    // Antennae
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.3, -radius);
    ctx.lineTo(-radius * 0.4, -radius * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-radius * 0.4, -radius * 1.5, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(radius * 0.3, -radius);
    ctx.lineTo(radius * 0.4, -radius * 1.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(radius * 0.4, -radius * 1.5, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    ctx.restore();
  },

  meteor: function(ctx, x, y, radius, rotation, vertices) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    for (var i = 0; i < vertices.length; i++) {
      var vx = vertices[i].x;
      var vy = vertices[i].y;
      if (i === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();

    ctx.fillStyle = '#5d4e37';
    ctx.fill();
    ctx.strokeStyle = '#8d7e67';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Craters
    ctx.beginPath();
    ctx.arc(radius * 0.2, -radius * 0.1, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3d2a';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-radius * 0.3, radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#4a3d2a';
    ctx.fill();

    ctx.restore();
  },

  coin: function(ctx, x, y, time) {
    var bob = Math.sin(time * 3) * 3;
    var shimmer = Math.sin(time * 5) * 0.2 + 0.8;

    // Glow
    ctx.beginPath();
    ctx.arc(x, y + bob, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fill();

    // Outer
    ctx.beginPath();
    ctx.arc(x, y + bob, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgb(255, 215, 0)';
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner
    ctx.beginPath();
    ctx.arc(x, y + bob, 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(184, 134, 11, ' + shimmer + ')';
    ctx.fill();

    // $ symbol
    ctx.fillStyle = '#b8860b';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', x, y + bob + 1);
  },

  hpBar: function(ctx, x, y, w, h, hp, maxHp, color) {
    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, h);
    // HP fill
    var ratio = Math.max(0, hp / maxHp);
    ctx.fillStyle = color || (ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#ff9800' : '#f44336');
    ctx.fillRect(x, y, w * ratio, h);
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
  }
};

// --- Starfield ---
Game.Starfield = function(count) {
  this.stars = [];
  for (var i = 0; i < (count || 200); i++) {
    var layer = Math.floor(Math.random() * 3); // 0=far, 1=mid, 2=near
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

Game.Starfield.prototype.update = function(dt, scrollSpeed) {
  this.time += dt;
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    if (scrollSpeed) {
      s.x -= s.speed * dt * (scrollSpeed || 1);
      if (s.x < -5) {
        s.x = Game.CANVAS_W + 5;
        s.y = Math.random() * Game.CANVAS_H;
      }
    }
  }
};

Game.Starfield.prototype.render = function(ctx) {
  for (var i = 0; i < this.stars.length; i++) {
    var s = this.stars[i];
    var twinkle = Math.sin(this.time * 2 + s.twinkleOffset) * 0.15 + 0.85;
    var alpha = s.brightness * twinkle;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
    ctx.fill();
  }
};

// --- Entity Manager ---
Game.EntityManager = {
  bullets: [],
  enemies: [],
  meteors: [],
  coins: [],
  particles: [],

  add: function(type, entity) {
    if (this[type]) this[type].push(entity);
  },

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

  renderAll: function(ctx, cam) {
    var types = ['coins', 'meteors', 'enemies', 'bullets', 'particles'];
    for (var t = 0; t < types.length; t++) {
      var arr = this[types[t]];
      for (var i = 0; i < arr.length; i++) {
        if (arr[i].active) arr[i].render(ctx, cam);
      }
    }
  },

  clear: function() {
    this.bullets = [];
    this.enemies = [];
    this.meteors = [];
    this.coins = [];
    this.particles = [];
  },

  getByType: function(type) {
    return this[type] || [];
  }
};

// --- Particle ---
Game.createParticle = function(x, y, color, size, speedMult) {
  var angle = Math.random() * Math.PI * 2;
  var speed = (50 + Math.random() * 150) * (speedMult || 1);
  return {
    x: x,
    y: y,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    life: 0.5 + Math.random() * 0.5,
    maxLife: 0.5 + Math.random() * 0.5,
    color: color,
    size: size || (2 + Math.random() * 3),
    active: true,
    update: function(dt) {
      this.x += this.dx * dt;
      this.y += this.dy * dt;
      this.dx *= 0.98;
      this.dy *= 0.98;
      this.life -= dt;
      if (this.life <= 0) this.active = false;
    },
    render: function(ctx, cam) {
      var sx = this.x - (cam ? cam.x : 0);
      var sy = this.y - (cam ? cam.y : 0);
      var alpha = Math.max(0, this.life / this.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(sx - this.size / 2, sy - this.size / 2, this.size, this.size);
      ctx.restore();
    }
  };
};

Game.spawnParticles = function(x, y, count, color, speedMult) {
  for (var i = 0; i < count; i++) {
    Game.EntityManager.add('particles', Game.createParticle(x, y, color, null, speedMult));
  }
};

// --- Bullet ---
Game.createBullet = function(x, y, angle, damage, speed) {
  var spd = speed || 500;
  return {
    x: x,
    y: y,
    radius: 4,
    dx: Math.cos(angle) * spd,
    dy: Math.sin(angle) * spd,
    damage: damage || 10,
    lifetime: 2,
    active: true,
    trail: [],
    update: function(dt) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 4) this.trail.shift();

      this.x += this.dx * dt;
      this.y += this.dy * dt;
      this.lifetime -= dt;

      if (this.lifetime <= 0 || this.x < -50 || this.x > Game.WORLD_W + 50 ||
          this.y < -50 || this.y > Game.WORLD_H + 50) {
        this.active = false;
      }
    },
    render: function(ctx, cam) {
      var ox = cam ? cam.x : 0;
      var oy = cam ? cam.y : 0;

      // Trail
      for (var i = 0; i < this.trail.length; i++) {
        var alpha = (i + 1) / (this.trail.length + 1) * 0.5;
        var r = this.radius * (i + 1) / (this.trail.length + 1);
        ctx.beginPath();
        ctx.arc(this.trail[i].x - ox, this.trail[i].y - oy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 235, 59, ' + alpha + ')';
        ctx.fill();
      }

      // Bullet
      ctx.beginPath();
      ctx.arc(this.x - ox, this.y - oy, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffeb3b';
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(this.x - ox, this.y - oy, this.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 235, 59, 0.3)';
      ctx.fill();
    }
  };
};

// --- Player ---
Game.Player = function() {
  this.x = 0;
  this.y = 0;
  this.radius = 16;
  this.hp = 100;
  this.maxHp = 100;
  this.speed = 200;
  this.damage = 10;
  this.fireRate = 300; // ms
  this.fireCooldown = 0;
  this.angle = 0;
  this.invincible = 0;
  this.active = true;
  this.time = 0;
  this.walkAnim = 0;
};

Game.Player.prototype.initStats = function(saveData) {
  var u = saveData.upgrades;
  this.maxHp = 100 + u.hp * 25;
  this.hp = this.maxHp;
  this.damage = 10 + u.dmg * 5;
  this.speed = 200 * (1 + u.speed * 0.2);
  this.fireRate = Math.max(100, 300 - u.fireRate * 50);
};

Game.Player.prototype.update = function(dt, worldW, worldH, useCamera) {
  this.time += dt;

  // Movement
  var mx = 0, my = 0;
  var inp = Game.Input;
  if (inp.isDown('w') || inp.isDown('W') || inp.isDown('ArrowUp')) my = -1;
  if (inp.isDown('s') || inp.isDown('S') || inp.isDown('ArrowDown')) my = 1;
  if (inp.isDown('a') || inp.isDown('A') || inp.isDown('ArrowLeft')) mx = -1;
  if (inp.isDown('d') || inp.isDown('D') || inp.isDown('ArrowRight')) mx = 1;

  // Normalize diagonal
  if (mx !== 0 && my !== 0) {
    var norm = 1 / Math.sqrt(2);
    mx *= norm;
    my *= norm;
  }

  this.x += mx * this.speed * dt;
  this.y += my * this.speed * dt;

  // Walking animation
  if (mx !== 0 || my !== 0) {
    this.walkAnim += dt * 8;
  }

  // Clamp
  var maxX = worldW || Game.CANVAS_W;
  var maxY = worldH || Game.CANVAS_H;
  this.x = Math.max(this.radius, Math.min(this.x, maxX - this.radius));
  this.y = Math.max(this.radius, Math.min(this.y, maxY - this.radius));

  // Angle toward mouse
  if (useCamera) {
    var worldMouse = Game.Camera.screenToWorld(inp.mouse.x, inp.mouse.y);
    this.angle = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);
  } else {
    this.angle = Math.atan2(inp.mouse.y - this.y, inp.mouse.x - this.x);
  }

  // Shooting
  this.fireCooldown -= dt * 1000;
  if ((inp.mouse.down || inp.isDown(' ')) && this.fireCooldown <= 0) {
    this.shoot();
    this.fireCooldown = this.fireRate;
  }

  // Invincibility
  if (this.invincible > 0) {
    this.invincible -= dt;
  }
};

Game.Player.prototype.shoot = function() {
  var bx = this.x + Math.cos(this.angle) * 20;
  var by = this.y + Math.sin(this.angle) * 20;
  Game.EntityManager.add('bullets', Game.createBullet(bx, by, this.angle, this.damage));
};

Game.Player.prototype.takeDamage = function(amount) {
  if (this.invincible > 0) return;
  this.hp -= amount;
  this.invincible = 0.5;
  Game.triggerShake(6, 0.2);
  Game.spawnParticles(this.x, this.y, 5, '#f44336');
  if (this.hp <= 0) {
    this.hp = 0;
    this.active = false;
  }
};

Game.Player.prototype.render = function(ctx, cam) {
  // Blink when invincible
  if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) return;

  var sx = this.x - (cam ? cam.x : 0);
  var sy = this.y - (cam ? cam.y : 0);

  // Leg animation offset
  var legOffset = Math.sin(this.walkAnim) * 3;

  Game.Draw.astronaut(ctx, sx, sy, this.angle, 1);
};

// --- Enemy ---
Game.Enemy = function(x, y, planetLevel) {
  this.x = x;
  this.y = y;
  this.radius = 20;
  this.planetLevel = planetLevel || 0;
  this.hp = Math.floor(50 * Math.pow(1.5, this.planetLevel));
  this.maxHp = this.hp;
  this.speed = 80 + this.planetLevel * 15;
  this.damage = Math.floor(10 * Math.pow(1.3, this.planetLevel));
  this.coinDrop = 5 + Math.floor(Math.random() * 11);
  this.hitCooldown = 0;
  this.flashTimer = 0;
  this.rotation = 0;
  this.active = true;
  this.time = 0;

  // Color based on planet
  var colors = ['#4caf50', '#f44336', '#9c27b0'];
  this.color = colors[this.planetLevel] || '#4caf50';
};

Game.Enemy.prototype.update = function(dt, playerX, playerY) {
  this.time += dt;
  this.rotation += dt * 0.5;

  // Chase player
  var dx = playerX - this.x;
  var dy = playerY - this.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist > 0) {
    this.x += (dx / dist) * this.speed * dt;
    this.y += (dy / dist) * this.speed * dt;
  }

  // Clamp to world
  this.x = Math.max(this.radius, Math.min(this.x, Game.WORLD_W - this.radius));
  this.y = Math.max(this.radius, Math.min(this.y, Game.WORLD_H - this.radius));

  if (this.hitCooldown > 0) this.hitCooldown -= dt;
  if (this.flashTimer > 0) this.flashTimer -= dt;
};

Game.Enemy.prototype.takeDamage = function(amount) {
  this.hp -= amount;
  this.flashTimer = 0.1;
  if (this.hp <= 0) {
    this.active = false;
    Game.spawnParticles(this.x, this.y, 12, this.color);
    // Spawn coin
    Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, this.coinDrop));
  }
};

Game.Enemy.prototype.render = function(ctx, cam) {
  var sx = this.x - (cam ? cam.x : 0);
  var sy = this.y - (cam ? cam.y : 0);

  // Flash white when hit
  var col = this.flashTimer > 0 ? '#fff' : this.color;

  Game.Draw.hexagon(ctx, sx, sy, this.radius, this.rotation, col);

  // HP bar
  if (this.hp < this.maxHp) {
    Game.Draw.hpBar(ctx, sx - 15, sy - this.radius - 10, 30, 4, this.hp, this.maxHp);
  }
};

// --- Meteor ---
Game.Meteor = function(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 15 + Math.random() * 20;
  this.speed = 100 + Math.random() * 200;
  this.rotation = Math.random() * Math.PI * 2;
  this.rotSpeed = (Math.random() - 0.5) * 3;
  this.active = true;

  // Generate irregular polygon vertices
  this.vertices = [];
  var numVerts = 8 + Math.floor(Math.random() * 4);
  for (var i = 0; i < numVerts; i++) {
    var a = (Math.PI * 2 / numVerts) * i;
    var r = this.radius * (0.7 + Math.random() * 0.3);
    this.vertices.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
};

Game.Meteor.prototype.update = function(dt) {
  this.x -= this.speed * dt;
  this.rotation += this.rotSpeed * dt;

  if (this.x < -this.radius * 2) {
    this.active = false;
  }
};

Game.Meteor.prototype.render = function(ctx, cam) {
  var sx = this.x - (cam ? cam.x : 0);
  var sy = this.y - (cam ? cam.y : 0);
  Game.Draw.meteor(ctx, sx, sy, this.radius, this.rotation, this.vertices);
};

Game.Meteor.prototype.destroy = function() {
  this.active = false;
  Game.spawnParticles(this.x, this.y, 8, '#8d7e67');
};

// --- Coin ---
Game.createCoin = function(x, y, value) {
  return {
    x: x,
    y: y,
    radius: 8,
    value: value || 1,
    lifetime: 8,
    active: true,
    time: Math.random() * 10,
    update: function(dt) {
      this.time += dt;
      this.lifetime -= dt;
      if (this.lifetime <= 0) this.active = false;
    },
    render: function(ctx, cam) {
      var sx = this.x - (cam ? cam.x : 0);
      var sy = this.y - (cam ? cam.y : 0);
      // Fade when about to expire
      if (this.lifetime < 2) {
        ctx.save();
        ctx.globalAlpha = this.lifetime / 2;
      }
      Game.Draw.coin(ctx, sx, sy, this.time);
      if (this.lifetime < 2) {
        ctx.restore();
      }
    }
  };
};
