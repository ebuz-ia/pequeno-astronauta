// ============================================
// scenes.js - All game scenes: Menu, Hub, SpaceTravel, Planet
// ============================================

window.Game = window.Game || {};
Game.scenes = Game.scenes || {};

// ===========================
// MENU SCENE
// ===========================
Game.scenes.MENU = {
  starfield: null,
  time: 0,
  titleChars: 'PEQUENO ASTRONAUTA'.split(''),
  btnBounds: null,

  enter: function() {
    this.starfield = new Game.Starfield(150);
    this.time = 0;
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt);

    // Click "Jogar" or press Space/Enter
    if (Game.Input.wasPressed(' ') || Game.Input.wasPressed('Enter')) {
      Game.changeState(Game.States.HUB);
    }

    if (this.btnBounds && Game.Input.mouse.clicked) {
      if (Game.UI.isMouseInRect(this.btnBounds.x, this.btnBounds.y, this.btnBounds.w, this.btnBounds.h)) {
        Game.changeState(Game.States.HUB);
      }
    }
  },

  render: function(ctx) {
    // Starfield
    this.starfield.render(ctx);

    // Title with color cycling
    var titleY = 140 + Math.sin(this.time * 1.5) * 8;
    ctx.save();
    ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Measure total width for centering
    var fullText = this.titleChars.join('');
    var totalW = ctx.measureText(fullText).width;
    var startX = Game.CANVAS_W / 2 - totalW / 2;

    var charX = startX;
    for (var i = 0; i < this.titleChars.length; i++) {
      var ch = this.titleChars[i];
      var hue = (this.time * 40 + i * 20) % 360;
      ctx.fillStyle = 'hsl(' + hue + ', 80%, 70%)';
      ctx.textAlign = 'left';
      ctx.fillText(ch, charX, titleY);
      charX += ctx.measureText(ch).width;
    }
    ctx.restore();

    // Subtitle
    Game.UI.text(ctx, 'Uma aventura espacial', Game.CANVAS_W / 2, titleY + 40, 18, '#78909c', 'center', 'middle');

    // Decorative astronaut
    Game.Draw.astronaut(ctx, Game.CANVAS_W / 2 - 80, 280 + Math.sin(this.time * 2) * 5, 0, 1.5);

    // Decorative rocket
    Game.Draw.rocket(ctx, Game.CANVAS_W / 2 + 80, 270 + Math.sin(this.time * 2 + 1) * 5, 0, 1.5, '#4fc3f7');
    Game.Draw.rocketFlame(ctx, Game.CANVAS_W / 2 + 80, 270 + Math.sin(this.time * 2 + 1) * 5, 0, 1.5, this.time);

    // "JOGAR" button
    var btnW = 180, btnH = 50;
    var btnX = Game.CANVAS_W / 2 - btnW / 2;
    var btnY = 370;
    var hovered = Game.UI.isMouseInRect(btnX, btnY, btnW, btnH);

    // Pulsing glow
    var pulse = Math.sin(this.time * 3) * 0.15 + 0.85;
    ctx.save();
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.roundRect(btnX - 4, btnY - 4, btnW + 8, btnH + 8, 12);
    ctx.fill();
    ctx.restore();

    this.btnBounds = Game.UI.button(ctx, 'JOGAR', btnX, btnY, btnW, btnH, hovered, '#4caf50');

    // Controls hint
    Game.UI.text(ctx, 'WASD: Mover | Mouse: Mirar/Atirar | E: Interagir | ESC: Pausar',
      Game.CANVAS_W / 2, Game.CANVAS_H - 40, 12, '#546e7a', 'center');

    // Version
    Game.UI.text(ctx, 'v1.0', Game.CANVAS_W - 15, Game.CANVAS_H - 20, 10, '#333', 'right');
  },

  exit: function() {}
};

// ===========================
// HUB SCENE
// ===========================
Game.scenes.HUB = {
  player: null,
  starfield: null,
  time: 0,
  rocketPos: { x: 650, y: 250 },
  nearRocket: false,
  decorations: [],

  enter: function() {
    this.starfield = new Game.Starfield(100);
    this.player = new Game.Player();
    this.player.x = 250;
    this.player.y = 350;
    this.player.initStats(Game.saveData);
    this.time = 0;
    this.nearRocket = false;
    Game.Camera.reset();
    Game.EntityManager.clear();

    // Generate random decorations (control panels, etc.)
    this.decorations = [];
    // Window showing space
    this.decorations.push({ type: 'window', x: 480, y: 80, w: 160, h: 120 });
    // Control panels
    this.decorations.push({ type: 'panel', x: 100, y: 280, w: 60, h: 80 });
    this.decorations.push({ type: 'panel', x: 800, y: 300, w: 50, h: 70 });

    Game.UI.showDialog('Explore o hub. Pressione E proximo ao foguete.', 4);
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt);
    Game.UI.updateDialog(dt);
    Game.EntityManager.updateAll(dt);

    // Handle substates
    if (Game.subState !== Game.SubStates.NONE) {
      if (Game.Input.wasPressed('Escape')) {
        Game.subState = Game.SubStates.NONE;
      }
      return;
    }

    // Player movement (no shooting in hub)
    var inp = Game.Input;
    var mx = 0, my = 0;
    if (inp.isDown('w') || inp.isDown('W') || inp.isDown('ArrowUp')) my = -1;
    if (inp.isDown('s') || inp.isDown('S') || inp.isDown('ArrowDown')) my = 1;
    if (inp.isDown('a') || inp.isDown('A') || inp.isDown('ArrowLeft')) mx = -1;
    if (inp.isDown('d') || inp.isDown('D') || inp.isDown('ArrowRight')) mx = 1;

    if (mx !== 0 && my !== 0) {
      var norm = 1 / Math.sqrt(2);
      mx *= norm;
      my *= norm;
    }

    this.player.x += mx * this.player.speed * dt;
    this.player.y += my * this.player.speed * dt;
    this.player.x = Math.max(20, Math.min(this.player.x, Game.CANVAS_W - 20));
    this.player.y = Math.max(200, Math.min(this.player.y, Game.CANVAS_H - 30));

    if (mx !== 0 || my !== 0) this.player.walkAnim += dt * 8;
    this.player.angle = Math.atan2(inp.mouse.y - this.player.y, inp.mouse.x - this.player.x);

    // Check proximity to rocket
    var dx = this.player.x - this.rocketPos.x;
    var dy = this.player.y - this.rocketPos.y;
    this.nearRocket = Math.sqrt(dx * dx + dy * dy) < 100;

    if (this.nearRocket && Game.Input.wasPressed('e') || this.nearRocket && Game.Input.wasPressed('E')) {
      Game.subState = Game.SubStates.STARMAP;
    }

    // ESC to go back to menu
    if (Game.Input.wasPressed('Escape')) {
      Game.changeState(Game.States.MENU);
    }
  },

  render: function(ctx) {
    // Starfield background
    this.starfield.render(ctx);

    // Station floor
    var gradient = ctx.createLinearGradient(0, 380, 0, Game.CANVAS_H);
    gradient.addColorStop(0, '#2a2a3a');
    gradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 380, Game.CANVAS_W, 160);

    // Floor grid lines
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.1)';
    ctx.lineWidth = 1;
    for (var fx = 0; fx < Game.CANVAS_W; fx += 60) {
      ctx.beginPath();
      ctx.moveTo(fx, 380);
      ctx.lineTo(fx, Game.CANVAS_H);
      ctx.stroke();
    }
    for (var fy = 380; fy < Game.CANVAS_H; fy += 40) {
      ctx.beginPath();
      ctx.moveTo(0, fy);
      ctx.lineTo(Game.CANVAS_W, fy);
      ctx.stroke();
    }

    // Station walls
    ctx.fillStyle = '#1e1e30';
    ctx.fillRect(0, 160, Game.CANVAS_W, 220);
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 160, Game.CANVAS_W, 220);

    // Decorations
    for (var d = 0; d < this.decorations.length; d++) {
      var dec = this.decorations[d];
      if (dec.type === 'window') {
        // Space window
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(dec.x, dec.y, dec.w, dec.h);
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 3;
        ctx.strokeRect(dec.x, dec.y, dec.w, dec.h);

        // Distant planet in window
        ctx.beginPath();
        ctx.arc(dec.x + 100, dec.y + 60, 30, 0, Math.PI * 2);
        ctx.fillStyle = '#4caf50';
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(dec.x + 90, dec.y + 50, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalAlpha = 1;

        // Stars in window
        for (var ws = 0; ws < 8; ws++) {
          ctx.beginPath();
          ctx.arc(
            dec.x + 10 + Math.sin(ws * 3.7) * 60 + 60,
            dec.y + 10 + Math.cos(ws * 2.3) * 40 + 40,
            1, 0, Math.PI * 2
          );
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
        }
      } else if (dec.type === 'panel') {
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(dec.x, dec.y, dec.w, dec.h);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(dec.x, dec.y, dec.w, dec.h);

        // Blinking lights
        for (var li = 0; li < 3; li++) {
          var on = Math.sin(this.time * 2 + li * 2) > 0;
          ctx.beginPath();
          ctx.arc(dec.x + 15 + li * 15, dec.y + 15, 4, 0, Math.PI * 2);
          ctx.fillStyle = on ? '#4caf50' : '#333';
          ctx.fill();
        }
      }
    }

    // Rocket
    var rTime = this.time;
    var rBob = Math.sin(rTime * 1.5) * 3;
    Game.Draw.rocket(ctx, this.rocketPos.x, this.rocketPos.y + rBob, 0, 2.5, '#4fc3f7');
    Game.Draw.rocketFlame(ctx, this.rocketPos.x, this.rocketPos.y + rBob, 0, 2.5, rTime);

    // Interaction ring when near
    if (this.nearRocket) {
      var ringPulse = Math.sin(rTime * 4) * 0.3 + 0.5;
      ctx.beginPath();
      ctx.arc(this.rocketPos.x, this.rocketPos.y, 80, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(79, 195, 247, ' + ringPulse + ')';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      Game.UI.textBold(ctx, 'Pressione E', this.rocketPos.x, this.rocketPos.y + 95, 14, '#4fc3f7', 'center');
    }

    // Player
    this.player.render(ctx);

    // HUD (coins only)
    Game.UI.renderHUD(ctx, {
      coins: Game.saveData.coins,
      label: 'ESTACAO ESPACIAL'
    });

    // Dialog
    Game.UI.renderDialog(ctx);

    // Particles
    Game.EntityManager.renderAll(ctx);

    // Substates overlays
    if (Game.subState === Game.SubStates.SHOP) {
      Game.ShopUI.render(ctx, Game.saveData);
    } else if (Game.subState === Game.SubStates.STARMAP) {
      // Tab buttons at top of panel
      var panelW = 600, panelH = 300;
      var panelY = (Game.CANVAS_H - panelH) / 2;

      Game.StarmapUI.render(ctx, Game.saveData);

      // Shop tab button
      var tabX = (Game.CANVAS_W - panelW) / 2 + 10;
      var tabY = panelY - 35;
      var tabHovered = Game.UI.isMouseInRect(tabX, tabY, 100, 30);
      Game.UI.button(ctx, 'Loja', tabX, tabY, 100, 30, tabHovered, '#ff9800');
      if (tabHovered && Game.Input.mouse.clicked) {
        Game.subState = Game.SubStates.SHOP;
      }
    } else if (Game.subState === Game.SubStates.SHOP) {
      // Already rendered above
    }

    // If in shop, show starmap tab
    if (Game.subState === Game.SubStates.SHOP) {
      var panelW2 = 560, panelH2 = 340;
      var panelY2 = (Game.CANVAS_H - panelH2) / 2;
      var tabX2 = (Game.CANVAS_W - panelW2) / 2 + 10;
      var tabY2 = panelY2 - 35;
      var tabHovered2 = Game.UI.isMouseInRect(tabX2, tabY2, 120, 30);
      Game.UI.button(ctx, 'Mapa Estelar', tabX2, tabY2, 120, 30, tabHovered2, '#4fc3f7');
      if (tabHovered2 && Game.Input.mouse.clicked) {
        Game.subState = Game.SubStates.STARMAP;
      }
    }
  },

  exit: function() {
    Game.EntityManager.clear();
  }
};

// ===========================
// SPACE TRAVEL SCENE
// ===========================
Game.scenes.SPACE_TRAVEL = {
  starfield: null,
  rocketX: 0,
  rocketY: 0,
  rocketHP: 0,
  rocketMaxHP: 0,
  distance: 0,
  targetDistance: 0,
  spawnTimer: 0,
  spawnInterval: 0,
  planetLevel: 0,
  time: 0,
  coinsEarned: 0,

  enter: function(data) {
    data = data || {};
    this.planetLevel = data.planetLevel || 0;
    this.starfield = new Game.Starfield(250);
    this.rocketX = 150;
    this.rocketY = Game.CANVAS_H / 2;

    var u = Game.saveData.upgrades;
    this.rocketMaxHP = 100 + (u.hp || 0) * 25;
    this.rocketHP = this.rocketMaxHP;

    this.targetDistance = 3000 + this.planetLevel * 1500;
    this.distance = 0;
    this.spawnInterval = Math.max(0.4, 0.8 - this.planetLevel * 0.15);
    this.spawnTimer = 1.5; // Initial grace period
    this.time = 0;
    this.coinsEarned = 0;

    Game.EntityManager.clear();
  },

  update: function(dt) {
    this.time += dt;

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    // Rocket movement (up/down + slight left/right)
    var inp = Game.Input;
    var my = 0, mx = 0;
    if (inp.isDown('w') || inp.isDown('W') || inp.isDown('ArrowUp')) my = -1;
    if (inp.isDown('s') || inp.isDown('S') || inp.isDown('ArrowDown')) my = 1;
    if (inp.isDown('a') || inp.isDown('A') || inp.isDown('ArrowLeft')) mx = -1;
    if (inp.isDown('d') || inp.isDown('D') || inp.isDown('ArrowRight')) mx = 1;

    this.rocketY += my * 250 * dt;
    this.rocketX += mx * 120 * dt;
    this.rocketY = Math.max(30, Math.min(this.rocketY, Game.CANVAS_H - 30));
    this.rocketX = Math.max(60, Math.min(this.rocketX, 300));

    // Shooting
    if ((inp.mouse.down || inp.isDown(' ')) && this.time > 0.3) {
      // Use player fire rate
      var fireRate = Math.max(100, 300 - (Game.saveData.upgrades.fireRate || 0) * 50);
      if (!this._lastShot || this.time - this._lastShot > fireRate / 1000) {
        var dmg = 10 + (Game.saveData.upgrades.dmg || 0) * 5;
        Game.EntityManager.add('bullets',
          Game.createBullet(this.rocketX + 30, this.rocketY, 0, dmg, 600));
        this._lastShot = this.time;
      }
    }

    // Progress
    this.distance += 200 * dt;

    // Starfield scroll
    this.starfield.update(dt, 1);

    // Meteor spawning
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      var m = new Game.Meteor(Game.CANVAS_W + 40, 30 + Math.random() * (Game.CANVAS_H - 60));
      Game.EntityManager.add('meteors', m);
      this.spawnTimer = this.spawnInterval * (0.7 + Math.random() * 0.6);
    }

    // Update entities
    Game.EntityManager.updateAll(dt);

    // Collision: bullets vs meteors
    var bullets = Game.EntityManager.getByType('bullets');
    var meteors = Game.EntityManager.getByType('meteors');
    for (var b = 0; b < bullets.length; b++) {
      for (var m2 = 0; m2 < meteors.length; m2++) {
        if (bullets[b].active && meteors[m2].active &&
            Game.Collision.circleCircle(bullets[b], meteors[m2])) {
          bullets[b].active = false;
          meteors[m2].destroy();
          this.coinsEarned += 1 + Math.floor(Math.random() * 3);
          Game.saveData.coins += 1 + Math.floor(Math.random() * 3);
        }
      }
    }

    // Collision: meteors vs rocket
    var rocketHitbox = { x: this.rocketX, y: this.rocketY, radius: 20 };
    for (var m3 = 0; m3 < meteors.length; m3++) {
      if (meteors[m3].active && Game.Collision.circleCircle(rocketHitbox, meteors[m3])) {
        meteors[m3].destroy();
        this.rocketHP -= 20;
        Game.triggerShake(8, 0.3);
        Game.spawnParticles(this.rocketX, this.rocketY, 8, '#ff6b35');
      }
    }

    // Rocket destroyed
    if (this.rocketHP <= 0) {
      Game.spawnParticles(this.rocketX, this.rocketY, 25, '#ff6b35', 1.5);
      Game.Save.save(Game.saveData);
      Game.showMessage('Viagem falhou!', 2);
      Game.changeState(Game.States.HUB);
      return;
    }

    // Reached destination
    if (this.distance >= this.targetDistance) {
      Game.Save.save(Game.saveData);
      Game.changeState(Game.States.PLANET, { planetLevel: this.planetLevel });
    }
  },

  render: function(ctx) {
    // Starfield
    this.starfield.render(ctx);

    // Distance progress bar
    var barW = 400, barH = 8;
    var barX = (Game.CANVAS_W - barW) / 2;
    var barY = 12;
    var progress = Math.min(1, this.distance / this.targetDistance);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW * progress, barH, 4);
    ctx.fill();

    // Destination planet indicator
    var planetColors = ['#4caf50', '#f44336', '#9c27b0'];
    ctx.beginPath();
    ctx.arc(barX + barW + 20, barY + 4, 8, 0, Math.PI * 2);
    ctx.fillStyle = planetColors[this.planetLevel] || '#4caf50';
    ctx.fill();

    // Rocket ship icon at progress point
    ctx.beginPath();
    ctx.arc(barX + barW * progress, barY + 4, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Rocket
    ctx.save();
    ctx.translate(this.rocketX, this.rocketY);
    ctx.rotate(-Math.PI / 2); // Point right
    Game.Draw.rocket(ctx, 0, 0, 0, 1.8, planetColors[this.planetLevel]);
    Game.Draw.rocketFlame(ctx, 0, 0, 0, 1.8, this.time);
    ctx.restore();

    // Entities
    Game.EntityManager.renderAll(ctx);

    // HUD
    Game.UI.renderHUD(ctx, {
      hp: this.rocketHP,
      maxHp: this.rocketMaxHP,
      coins: Game.saveData.coins,
      label: 'VIAGEM ESPACIAL'
    });

    // Distance text
    var pct = Math.floor(progress * 100);
    Game.UI.text(ctx, pct + '%', Game.CANVAS_W / 2, 24, 12, '#aaa', 'center');
  },

  exit: function() {
    Game.EntityManager.clear();
  }
};

// ===========================
// PLANET SCENE
// ===========================
Game.scenes.PLANET = {
  player: null,
  starfield: null,
  planetLevel: 0,
  currentWave: 1,
  totalWaves: 3,
  enemiesPerWave: 5,
  enemiesAlive: 0,
  waveDelay: 0,
  waveStarted: false,
  victory: false,
  victoryTimer: 0,
  time: 0,
  coinsEarned: 0,
  rocks: [],
  planetColors: [
    { bg: '#0d1a0d', ground: '#1a2e1a', accent: '#4caf50' },
    { bg: '#1a0d0d', ground: '#2e1a1a', accent: '#f44336' },
    { bg: '#1a0d1a', ground: '#2a1a2e', accent: '#9c27b0' }
  ],

  enter: function(data) {
    data = data || {};
    this.planetLevel = data.planetLevel || 0;
    this.starfield = new Game.Starfield(80);
    this.time = 0;
    this.coinsEarned = 0;

    // Player
    this.player = new Game.Player();
    this.player.x = Game.WORLD_W / 2;
    this.player.y = Game.WORLD_H / 2;
    this.player.initStats(Game.saveData);

    // Camera
    Game.Camera.x = this.player.x - Game.CANVAS_W / 2;
    Game.Camera.y = this.player.y - Game.CANVAS_H / 2;

    // Waves
    this.currentWave = 1;
    this.waveStarted = false;
    this.waveDelay = 2;
    this.enemiesAlive = 0;
    this.victory = false;
    this.victoryTimer = 0;

    Game.EntityManager.clear();

    // Generate rocks (decorative)
    this.rocks = [];
    for (var i = 0; i < 30; i++) {
      this.rocks.push({
        x: Math.random() * Game.WORLD_W,
        y: Math.random() * Game.WORLD_H,
        radius: 5 + Math.random() * 15,
        shade: Math.random() * 0.3
      });
    }
  },

  spawnWave: function() {
    var count = this.enemiesPerWave + this.currentWave;
    this.enemiesAlive = count;

    for (var i = 0; i < count; i++) {
      var edge = Math.floor(Math.random() * 4);
      var ex, ey;
      switch (edge) {
        case 0: ex = Math.random() * Game.WORLD_W; ey = 20; break;
        case 1: ex = Math.random() * Game.WORLD_W; ey = Game.WORLD_H - 20; break;
        case 2: ex = 20; ey = Math.random() * Game.WORLD_H; break;
        case 3: ex = Game.WORLD_W - 20; ey = Math.random() * Game.WORLD_H; break;
      }
      // Ensure at least 300px from player
      var dx = ex - this.player.x;
      var dy = ey - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < 300) {
        ex = (this.player.x + 400) % Game.WORLD_W;
        ey = (this.player.y + 400) % Game.WORLD_H;
      }
      Game.EntityManager.add('enemies', new Game.Enemy(ex, ey, this.planetLevel));
    }
    this.waveStarted = true;
  },

  update: function(dt) {
    this.time += dt;

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    // Victory state
    if (this.victory) {
      this.victoryTimer -= dt;
      // Firework particles
      if (Math.random() < 0.3) {
        var fx = this.player.x + (Math.random() - 0.5) * 300;
        var fy = this.player.y + (Math.random() - 0.5) * 200;
        var colors = ['#ffd700', '#4caf50', '#f44336', '#4fc3f7', '#ff9800'];
        Game.spawnParticles(fx, fy, 5, colors[Math.floor(Math.random() * colors.length)], 1.2);
      }
      Game.EntityManager.updateAll(dt);

      if (this.victoryTimer <= 0) {
        // Mark planet as cleared
        if (Game.saveData.planetsCleared.indexOf(this.planetLevel) === -1) {
          Game.saveData.planetsCleared.push(this.planetLevel);
        }
        Game.Save.save(Game.saveData);
        Game.showMessage('Planeta conquistado! +' + this.coinsEarned + ' moedas', 3);
        Game.changeState(Game.States.HUB);
      }
      return;
    }

    // Wave management
    if (!this.waveStarted) {
      this.waveDelay -= dt;
      if (this.waveDelay <= 0) {
        this.spawnWave();
      }
    }

    // Player update
    this.player.update(dt, Game.WORLD_W, Game.WORLD_H, true);

    // Camera follow
    Game.Camera.follow(this.player, dt);

    // Update entities
    var enemies = Game.EntityManager.getByType('enemies');
    for (var e = 0; e < enemies.length; e++) {
      enemies[e].update(dt, this.player.x, this.player.y);
    }

    // Non-enemy entity updates
    var bullets = Game.EntityManager.getByType('bullets');
    for (var b = 0; b < bullets.length; b++) bullets[b].update(dt);
    var coins = Game.EntityManager.getByType('coins');
    for (var c = 0; c < coins.length; c++) coins[c].update(dt);
    var particles = Game.EntityManager.getByType('particles');
    for (var p = 0; p < particles.length; p++) particles[p].update(dt);

    // Remove inactive
    Game.EntityManager.bullets = bullets.filter(function(e) { return e.active; });
    Game.EntityManager.enemies = enemies.filter(function(e) { return e.active; });
    Game.EntityManager.coins = coins.filter(function(e) { return e.active; });
    Game.EntityManager.particles = particles.filter(function(e) { return e.active; });

    // Collision: bullets vs enemies
    bullets = Game.EntityManager.getByType('bullets');
    enemies = Game.EntityManager.getByType('enemies');
    for (var b2 = 0; b2 < bullets.length; b2++) {
      for (var e2 = 0; e2 < enemies.length; e2++) {
        if (bullets[b2].active && enemies[e2].active &&
            Game.Collision.circleCircle(bullets[b2], enemies[e2])) {
          enemies[e2].takeDamage(bullets[b2].damage);
          bullets[b2].active = false;
          if (!enemies[e2].active) {
            this.enemiesAlive--;
            this.coinsEarned += enemies[e2].coinDrop;
            Game.saveData.coins += enemies[e2].coinDrop;
          }
        }
      }
    }

    // Collision: enemies vs player (contact damage)
    for (var e3 = 0; e3 < enemies.length; e3++) {
      if (enemies[e3].active && enemies[e3].hitCooldown <= 0 &&
          Game.Collision.circleCircle(this.player, enemies[e3])) {
        this.player.takeDamage(enemies[e3].damage);
        enemies[e3].hitCooldown = 1;
      }
    }

    // Collision: coins vs player
    coins = Game.EntityManager.getByType('coins');
    for (var c2 = 0; c2 < coins.length; c2++) {
      if (coins[c2].active && Game.Collision.circleCircle(this.player, coins[c2])) {
        coins[c2].active = false;
      }
    }

    // Player died
    if (!this.player.active) {
      Game.Save.save(Game.saveData);
      Game.showMessage('Voce foi derrotado! +' + this.coinsEarned + ' moedas', 3);
      Game.changeState(Game.States.HUB);
      return;
    }

    // All enemies dead in wave
    if (this.waveStarted && this.enemiesAlive <= 0) {
      if (this.currentWave >= this.totalWaves) {
        this.victory = true;
        this.victoryTimer = 3;
      } else {
        this.currentWave++;
        this.waveStarted = false;
        this.waveDelay = 2;
      }
    }
  },

  render: function(ctx) {
    var cam = Game.Camera;
    var colors = this.planetColors[this.planetLevel] || this.planetColors[0];

    // Background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    // Ground texture (grid)
    ctx.strokeStyle = colors.accent + '15'; // Very transparent
    ctx.lineWidth = 1;
    var gridSize = 80;
    var startX = -(cam.x % gridSize);
    var startY = -(cam.y % gridSize);
    for (var gx = startX; gx < Game.CANVAS_W; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, Game.CANVAS_H);
      ctx.stroke();
    }
    for (var gy = startY; gy < Game.CANVAS_H; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(Game.CANVAS_W, gy);
      ctx.stroke();
    }

    // Rocks (decorative)
    for (var r = 0; r < this.rocks.length; r++) {
      var rock = this.rocks[r];
      var rsx = rock.x - cam.x;
      var rsy = rock.y - cam.y;
      if (rsx < -50 || rsx > Game.CANVAS_W + 50 || rsy < -50 || rsy > Game.CANVAS_H + 50) continue;

      ctx.beginPath();
      ctx.arc(rsx, rsy, rock.radius, 0, Math.PI * 2);
      var shade = 0.15 + rock.shade;
      ctx.fillStyle = 'rgba(100, 100, 100, ' + shade + ')';
      ctx.fill();
    }

    // World boundary indicator
    var edges = [
      { x: -cam.x, y: -cam.y, w: Game.WORLD_W, h: 2 },
      { x: -cam.x, y: Game.WORLD_H - cam.y, w: Game.WORLD_W, h: 2 },
      { x: -cam.x, y: -cam.y, w: 2, h: Game.WORLD_H },
      { x: Game.WORLD_W - cam.x, y: -cam.y, w: 2, h: Game.WORLD_H }
    ];
    ctx.fillStyle = colors.accent + '40';
    for (var ei = 0; ei < edges.length; ei++) {
      ctx.fillRect(edges[ei].x, edges[ei].y, edges[ei].w, edges[ei].h);
    }

    // Render entities
    Game.EntityManager.renderAll(ctx, cam);

    // Player
    this.player.render(ctx, cam);

    // Wave countdown text
    if (!this.waveStarted && !this.victory) {
      var countDown = Math.ceil(this.waveDelay);
      Game.UI.textBold(ctx, 'Onda ' + this.currentWave + ' chegando... ' + countDown,
        Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 60, 24, colors.accent, 'center', 'middle');
    }

    // Victory text
    if (this.victory) {
      Game.UI.textBold(ctx, 'VITORIA!', Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 40, 48, '#ffd700', 'center', 'middle');
      Game.UI.text(ctx, '+' + this.coinsEarned + ' moedas', Game.CANVAS_W / 2, Game.CANVAS_H / 2 + 20, 20, '#fff', 'center', 'middle');
    }

    // Planet names
    var planetNames = ['Planeta Verde', 'Planeta Vermelho', 'Planeta Roxo'];

    // HUD
    Game.UI.renderHUD(ctx, {
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      coins: Game.saveData.coins,
      label: planetNames[this.planetLevel] || 'Planeta',
      wave: this.currentWave,
      totalWaves: this.totalWaves,
      enemiesLeft: this.enemiesAlive
    });
  },

  exit: function() {
    Game.EntityManager.clear();
    Game.Camera.reset();
  }
};
