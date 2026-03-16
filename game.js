// ============================================
// game.js - Core engine: loop, input, camera, state machine, save, collision
// ============================================

window.Game = window.Game || {};

// --- Constants ---
Game.CANVAS_W = 960;
Game.CANVAS_H = 540;
Game.WORLD_W = 1920;
Game.WORLD_H = 1080;

Game.States = {
  MENU: 'MENU',
  HUB: 'HUB',
  SPACE_TRAVEL: 'SPACE_TRAVEL',
  PLANET: 'PLANET'
};

Game.SubStates = {
  NONE: 'NONE',
  SHOP: 'SHOP',
  STARMAP: 'STARMAP'
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
Game.selectedPlanet = 0;
Game.message = null; // {text, timer}

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
  Game.transition.dir = 1; // fade out
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
      // Prevent scrolling with arrow keys/space
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

    // Touch support
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

  isDown: function(key) {
    return !!this.keys[key];
  },

  wasPressed: function(key) {
    return !!this.justPressed[key];
  },

  endFrame: function() {
    this.justPressed = {};
    this.mouse.clicked = false;
  }
};

// --- Camera ---
Game.Camera = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  lerpSpeed: 5,

  follow: function(target, dt) {
    this.targetX = target.x - Game.CANVAS_W / 2;
    this.targetY = target.y - Game.CANVAS_H / 2;

    // Lerp
    this.x += (this.targetX - this.x) * this.lerpSpeed * dt;
    this.y += (this.targetY - this.y) * this.lerpSpeed * dt;

    // Clamp to world bounds
    this.x = Math.max(0, Math.min(this.x, Game.WORLD_W - Game.CANVAS_W));
    this.y = Math.max(0, Math.min(this.y, Game.WORLD_H - Game.CANVAS_H));
  },

  reset: function() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
  },

  worldToScreen: function(wx, wy) {
    return { x: wx - this.x, y: wy - this.y };
  },

  screenToWorld: function(sx, sy) {
    return { x: sx + this.x, y: sy + this.y };
  }
};

// --- Collision Helpers ---
Game.Collision = {
  circleCircle: function(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (a.radius + b.radius);
  },

  pointCircle: function(px, py, c) {
    var dx = px - c.x;
    var dy = py - c.y;
    return (dx * dx + dy * dy) < (c.radius * c.radius);
  },

  circleRect: function(circle, rect) {
    var cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
    var cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
    var dx = circle.x - cx;
    var dy = circle.y - cy;
    return (dx * dx + dy * dy) < (circle.radius * circle.radius);
  }
};

// --- Save/Load ---
Game.Save = {
  KEY: 'pequeno-astronauta-save',

  defaults: function() {
    return {
      coins: 0,
      upgrades: { hp: 0, dmg: 0, speed: 0, fireRate: 0 },
      planetsCleared: []
    };
  },

  load: function() {
    try {
      var data = localStorage.getItem(this.KEY);
      if (data) {
        var parsed = JSON.parse(data);
        // Merge with defaults to handle new fields
        var def = this.defaults();
        return {
          coins: parsed.coins || def.coins,
          upgrades: Object.assign({}, def.upgrades, parsed.upgrades || {}),
          planetsCleared: parsed.planetsCleared || def.planetsCleared
        };
      }
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
    return this.defaults();
  },

  save: function(data) {
    try {
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  },

  clear: function() {
    localStorage.removeItem(this.KEY);
  }
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
  if (w / h > ratio) {
    newH = h;
    newW = h * ratio;
  } else {
    newW = w;
    newH = w / ratio;
  }

  Game.canvas.style.width = newW + 'px';
  Game.canvas.style.height = newH + 'px';
  Game.scale = newW / Game.CANVAS_W;
};

// --- Game Loop ---
Game.lastTime = 0;

Game.loop = function(timestamp) {
  var dt = (timestamp - Game.lastTime) / 1000;
  Game.lastTime = timestamp;

  // Cap delta time
  if (dt > 0.05) dt = 0.05;
  if (dt <= 0) dt = 0.016;

  // Update transition
  if (Game.transition.active) {
    Game.transition.alpha += Game.transition.dir * Game.transition.speed * dt;
    if (Game.transition.dir === 1 && Game.transition.alpha >= 1) {
      Game.transition.alpha = 1;
      if (Game.transition.callback) {
        Game.transition.callback();
        Game.transition.callback = null;
      }
      Game.transition.dir = -1; // fade in
    }
    if (Game.transition.dir === -1 && Game.transition.alpha <= 0) {
      Game.transition.alpha = 0;
      Game.transition.active = false;
    }
  }

  // Update
  if (!Game.paused && Game.scenes[Game.state]) {
    Game.scenes[Game.state].update(dt);
  }

  // Update message
  if (Game.message) {
    Game.message.timer -= dt;
    if (Game.message.timer <= 0) Game.message = null;
  }

  // Update shake
  if (Game.shake.duration > 0) {
    Game.shake.duration -= dt;
    if (Game.shake.duration <= 0) {
      Game.shake.intensity = 0;
    }
  }

  // Render
  var ctx = Game.ctx;
  ctx.save();

  // Apply screen shake
  if (Game.shake.intensity > 0) {
    var sx = (Math.random() - 0.5) * Game.shake.intensity * 2;
    var sy = (Math.random() - 0.5) * Game.shake.intensity * 2;
    ctx.translate(sx, sy);
  }

  // Clear
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(-10, -10, Game.CANVAS_W + 20, Game.CANVAS_H + 20);

  if (Game.scenes[Game.state]) {
    Game.scenes[Game.state].render(ctx);
  }

  ctx.restore();

  // Render transition overlay
  if (Game.transition.active && Game.transition.alpha > 0) {
    ctx.save();
    ctx.globalAlpha = Game.transition.alpha;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    ctx.restore();
  }

  // Render message
  if (Game.message) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, Game.message.timer);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(Game.CANVAS_W / 2 - 200, Game.CANVAS_H / 2 - 30, 400, 60);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Game.message.text, Game.CANVAS_W / 2, Game.CANVAS_H / 2);
    ctx.restore();
  }

  // Render pause overlay
  if (Game.paused) {
    Game.UI.renderPause(ctx);
  }

  Game.Input.endFrame();
  requestAnimationFrame(Game.loop);
};

// --- Init ---
Game.init = function() {
  Game.canvas = document.getElementById('game');
  Game.ctx = Game.canvas.getContext('2d');

  Game.Input.init(Game.canvas);
  Game.saveData = Game.Save.load();
  Game.resize();

  window.addEventListener('resize', Game.resize);

  // Start at menu immediately (no transition)
  Game.state = Game.States.MENU;
  if (Game.scenes[Game.States.MENU] && Game.scenes[Game.States.MENU].enter) {
    Game.scenes[Game.States.MENU].enter();
  }

  Game.lastTime = performance.now();
  requestAnimationFrame(Game.loop);
};

// --- Boot ---
window.onload = function() {
  Game.init();
};
