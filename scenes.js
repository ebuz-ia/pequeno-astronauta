// ============================================
// scenes.js - MENU, FLIGHT, PLANET_EXPLORE
// Pequeno Astronauta v2.0 - Pixel Art Edition
// ============================================

window.Game = window.Game || {};
Game.scenes = Game.scenes || {};

// ===========================
// MENU SCENE
// ===========================
Game.scenes.MENU = {
  starfield: null,
  time: 0,
  btnBounds: null,
  flameFrame: 0,
  flameTimer: 0,

  enter: function() {
    this.starfield = new Game.Starfield(200);
    this.time = 0;
    this.flameFrame = 0;
    this.flameTimer = 0;
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt, 'down');

    // Flame anim
    this.flameTimer += dt;
    if (this.flameTimer > 0.1) { this.flameTimer = 0; this.flameFrame = (this.flameFrame + 1) % 3; }

    // Start game
    if (Game.Input.wasPressed(' ') || Game.Input.wasPressed('Enter')) {
      this.startGame();
    }

    if (this.btnBounds && Game.Input.mouse.clicked) {
      if (Game.UI.isMouseInRect(this.btnBounds.x, this.btnBounds.y, this.btnBounds.w, this.btnBounds.h)) {
        this.startGame();
      }
    }
  },

  startGame: function() {
    Game.saveData = Game.Save.load();
    if (Game.saveData.currentPlanet > 0 || Game.saveData.coins > 50) {
      // Continue - go to planet
      Game.changeState(Game.States.PLANET_EXPLORE, { planetIndex: Game.saveData.currentPlanet });
    } else {
      // New game - go to Terra
      Game.changeState(Game.States.PLANET_EXPLORE, { planetIndex: 0 });
    }
  },

  render: function(ctx) {
    // Dark sky gradient
    var grad = ctx.createLinearGradient(0, 0, 0, Game.CANVAS_H);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(0.6, '#0a0a2a');
    grad.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    // Stars
    this.starfield.render(ctx);

    // Terra ground at bottom
    var groundY = Game.CANVAS_H - 60;
    ctx.fillStyle = '#3a7d2e';
    ctx.fillRect(0, groundY, Game.CANVAS_W, 60);
    ctx.fillStyle = '#5cb85c';
    ctx.fillRect(0, groundY, Game.CANVAS_W, 3);
    ctx.fillStyle = '#2d6323';
    ctx.fillRect(0, groundY + 10, Game.CANVAS_W, 50);

    // Pixel title "PEQUENO ASTRONAUTA"
    var titleY = 80 + Math.sin(this.time * 1.5) * 5;
    var titleScale = 4;

    // Title with color cycling per character
    var title1 = 'PEQUENO';
    var title2 = 'ASTRONAUTA';

    // Draw each character with shifting color
    this.drawColorTitle(ctx, title1, Game.CANVAS_W / 2, titleY, titleScale);
    this.drawColorTitle(ctx, title2, Game.CANVAS_W / 2, titleY + titleScale * 7, titleScale);

    // Subtitle
    Game.UI.text(ctx, 'Uma aventura espacial em pixel art', Game.CANVAS_W / 2, titleY + titleScale * 15, 14, '#78909c', 'center');

    // Animated rocket in center
    var rocketY = 260 + Math.sin(this.time * 2) * 8;
    Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, Game.CANVAS_W / 2, rocketY, 3);
    Game.Pixel.drawCentered(ctx, Game.Sprites.flame[this.flameFrame], Game.CANVAS_W / 2, rocketY + 45, 3);

    // Small astronaut on the ground
    var astSprite = Math.floor(this.time * 3) % 2 === 0 ? Game.Sprites.astronautIdle : Game.Sprites.astronautWalk1;
    Game.Pixel.draw(ctx, astSprite, Game.CANVAS_W / 2 + 100, groundY - 32, 2);

    // "JOGAR" button
    var btnW = 160, btnH = 44;
    var btnX = Game.CANVAS_W / 2 - btnW / 2;
    var btnY = 380;
    var hovered = Game.UI.isMouseInRect(btnX, btnY, btnW, btnH);

    // Button glow
    var pulse = Math.sin(this.time * 3) * 0.2 + 0.8;
    ctx.save();
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(btnX - 4, btnY - 4, btnW + 8, btnH + 8);
    ctx.restore();

    this.btnBounds = Game.UI.button(ctx, 'JOGAR', btnX, btnY, btnW, btnH, hovered, '#4caf50');

    // Check for save
    var save = Game.Save.load();
    if (save.coins !== 50 || save.currentPlanet > 0) {
      Game.UI.text(ctx, 'Continuar jogo salvo', Game.CANVAS_W / 2, btnY + btnH + 8, 11, '#666', 'center');
    }

    // Controls hint
    Game.UI.text(ctx, 'WASD: Mover | ESPACO: Pular/Atirar | E: Interagir | ESC: Pausar',
      Game.CANVAS_W / 2, Game.CANVAS_H - 25, 11, '#3a3a5a', 'center');

    // Version
    Game.UI.text(ctx, 'v2.0', Game.CANVAS_W - 30, Game.CANVAS_H - 20, 10, '#333', 'right');
  },

  drawColorTitle: function(ctx, text, centerX, y, scale) {
    // Calculate total width
    var totalW = 0;
    var chars = text.split('');
    for (var i = 0; i < chars.length; i++) {
      var glyph = Game.UI.glyphs[chars[i]];
      if (glyph) totalW += (glyph[0].length + 1) * scale;
      else totalW += 3 * scale;
    }
    totalW -= scale; // Remove last gap

    var cx = centerX - totalW / 2;
    for (var j = 0; j < chars.length; j++) {
      var glyph2 = Game.UI.glyphs[chars[j]];
      if (glyph2) {
        // Color cycling
        var hue = (this.time * 60 + j * 30) % 360;
        var color = 'hsl(' + hue + ', 80%, 70%)';
        ctx.fillStyle = color;
        for (var r = 0; r < glyph2.length; r++) {
          for (var c = 0; c < glyph2[r].length; c++) {
            if (glyph2[r][c]) {
              ctx.fillRect(cx + c * scale, y + r * scale, scale, scale);
            }
          }
        }
        cx += (glyph2[0].length + 1) * scale;
      } else {
        cx += 3 * scale;
      }
    }
  },

  exit: function() {}
};

// ===========================
// FLIGHT SCENE (vertical)
// ===========================
Game.scenes.FLIGHT = {
  rocket: null,
  starfield: null,
  time: 0,
  spawnTimer: 0,
  meteorSpawnRate: 1.5,
  enemySpawnRate: 4,
  enemyTimer: 0,
  eventTimer: 0,
  eventActive: null,
  reachedTarget: false,
  bgPhase: 0, // 0=atmosphere, 1=space, 2=next atmosphere

  enter: function(data) {
    data = data || {};
    this.starfield = new Game.Starfield(300);
    this.rocket = new Game.Rocket(Game.saveData);
    this.time = 0;
    this.spawnTimer = 2; // grace period
    this.enemyTimer = 5;
    this.eventTimer = 15 + Math.random() * 10;
    this.eventActive = null;
    this.reachedTarget = false;
    this.bgPhase = 0;

    Game.EntityManager.clear();
  },

  update: function(dt) {
    this.time += dt;

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    // Update rocket
    this.rocket.update(dt);

    // Background phase based on altitude
    var currentPlanet = Game.saveData.currentPlanet;
    var startAlt = Game.PlanetData[currentPlanet].altitude;
    var nextPlanetIdx = currentPlanet + 1;
    var targetAlt = nextPlanetIdx < Game.PlanetData.length
      ? Game.PlanetData[nextPlanetIdx].altitude - startAlt
      : 50000;

    var altPct = this.rocket.altitude / targetAlt;
    if (altPct < 0.15) this.bgPhase = 0;
    else if (altPct < 0.85) this.bgPhase = 1;
    else this.bgPhase = 2;

    // Starfield speed based on fuel
    var scrollSpeed = this.rocket.fuel > 0 ? 1 : 0.3;
    this.starfield.update(dt * scrollSpeed, 'down');

    // Update entities
    Game.EntityManager.updateAll(dt);

    // Spawn meteors
    if (!this.rocket.parachute) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        var mx = 40 + Math.random() * (Game.CANVAS_W - 80);
        var speed = 150 + Math.random() * 200 + currentPlanet * 30;
        Game.EntityManager.add('meteors', new Game.MeteorPixel(mx, -30, speed));
        this.spawnTimer = this.meteorSpawnRate * (0.6 + Math.random() * 0.8);
        // Increase difficulty over time
        if (this.meteorSpawnRate > 0.4) this.meteorSpawnRate -= dt * 0.02;
      }

      // Spawn enemy ships
      this.enemyTimer -= dt;
      if (this.enemyTimer <= 0) {
        var ex = 60 + Math.random() * (Game.CANVAS_W - 120);
        Game.EntityManager.add('enemies', new Game.EnemyShip(ex, -40));
        this.enemyTimer = this.enemySpawnRate * (0.7 + Math.random() * 0.6);
        if (this.enemySpawnRate > 2) this.enemySpawnRate -= 0.1;
      }

      // Special events
      this.eventTimer -= dt;
      if (this.eventTimer <= 0 && !this.eventActive) {
        this.triggerEvent();
        this.eventTimer = 20 + Math.random() * 15;
      }
    }

    // Update special event
    if (this.eventActive) {
      this.eventActive.timer -= dt;
      if (this.eventActive.type === 'meteor_shower') {
        this.eventActive.spawnTimer -= dt;
        if (this.eventActive.spawnTimer <= 0) {
          this.eventActive.spawnTimer = 0.15;
          Game.EntityManager.add('meteors', new Game.MeteorPixel(
            Math.random() * Game.CANVAS_W, -30, 200 + Math.random() * 250
          ));
        }
      } else if (this.eventActive.type === 'enemy_fleet') {
        this.eventActive.spawnTimer -= dt;
        if (this.eventActive.spawnTimer <= 0) {
          this.eventActive.spawnTimer = 0.8;
          Game.EntityManager.add('enemies', new Game.EnemyShip(
            60 + Math.random() * (Game.CANVAS_W - 120), -40
          ));
        }
      }
      if (this.eventActive.timer <= 0) this.eventActive = null;
    }

    // --- COLLISIONS ---

    // Bullets vs meteors
    var bullets = Game.EntityManager.bullets;
    var meteors = Game.EntityManager.meteors;
    for (var b = 0; b < bullets.length; b++) {
      for (var m = 0; m < meteors.length; m++) {
        if (bullets[b].active && meteors[m].active) {
          var bdx = bullets[b].x - meteors[m].x;
          var bdy = bullets[b].y - meteors[m].y;
          if (Math.sqrt(bdx * bdx + bdy * bdy) < bullets[b].radius + meteors[m].radius) {
            bullets[b].active = false;
            meteors[m].destroy();
            // Drop coin
            Game.EntityManager.add('coins', Game.createCoin(meteors[m].x, meteors[m].y, 2 + Math.floor(Math.random() * 3)));
          }
        }
      }
    }

    // Bullets vs enemies
    var enemies = Game.EntityManager.enemies;
    for (var b2 = 0; b2 < bullets.length; b2++) {
      for (var e = 0; e < enemies.length; e++) {
        if (bullets[b2].active && enemies[e].active && !enemies[e].isEnemyBullet) {
          var edx = bullets[b2].x - enemies[e].x;
          var edy = bullets[b2].y - enemies[e].y;
          if (Math.sqrt(edx * edx + edy * edy) < bullets[b2].radius + enemies[e].radius) {
            bullets[b2].active = false;
            enemies[e].takeDamage(bullets[b2].damage);
          }
        }
      }
    }

    // Meteors vs rocket
    var rkt = this.rocket;
    for (var m2 = 0; m2 < meteors.length; m2++) {
      if (meteors[m2].active) {
        var mdx = rkt.x - meteors[m2].x;
        var mdy = rkt.y - meteors[m2].y;
        if (Math.sqrt(mdx * mdx + mdy * mdy) < rkt.radius + meteors[m2].radius) {
          meteors[m2].destroy();
          rkt.takeDamage(20);
        }
      }
    }

    // Enemy bullets vs rocket (stored in particles with isEnemyBullet)
    var particles = Game.EntityManager.particles;
    for (var p = 0; p < particles.length; p++) {
      if (particles[p].active && particles[p].isEnemyBullet) {
        var pdx = rkt.x - particles[p].x;
        var pdy = rkt.y - particles[p].y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < rkt.radius + (particles[p].radius || 4)) {
          particles[p].active = false;
          rkt.takeDamage(10);
        }
      }
    }

    // Coins vs rocket
    var coins = Game.EntityManager.coins;
    for (var c = 0; c < coins.length; c++) {
      if (coins[c].active) {
        var cdx = rkt.x - coins[c].x;
        var cdy = rkt.y - coins[c].y;
        if (Math.sqrt(cdx * cdx + cdy * cdy) < rkt.radius + coins[c].radius) {
          Game.saveData.coins += coins[c].value;
          coins[c].active = false;
          Game.spawnParticles(coins[c].x, coins[c].y, 4, '#ffd700');
        }
      }
    }

    // Check if reached next planet
    if (!this.reachedTarget && this.rocket.altitude >= targetAlt && nextPlanetIdx < Game.PlanetData.length) {
      this.reachedTarget = true;
      Game.saveData.currentPlanet = nextPlanetIdx;
      if (nextPlanetIdx > Game.saveData.highestPlanet) {
        Game.saveData.highestPlanet = nextPlanetIdx;
      }
      Game.saveData.fuel = this.rocket.fuel;
      Game.Save.save(Game.saveData);
      Game.showMessage('Chegou em ' + Game.PlanetData[nextPlanetIdx].name + '!', 2);
      Game.changeState(Game.States.PLANET_EXPLORE, { planetIndex: nextPlanetIdx });
      return;
    }

    // Parachute landed = back to current planet
    if (this.rocket.parachute && !this.rocket.active) {
      Game.saveData.fuel = 0;
      Game.Save.save(Game.saveData);
      Game.showMessage('Fuel esgotado! Voltando para ' + Game.PlanetData[currentPlanet].name, 2);
      Game.changeState(Game.States.PLANET_EXPLORE, { planetIndex: currentPlanet });
      return;
    }
  },

  triggerEvent: function() {
    var type = Math.random() < 0.5 ? 'meteor_shower' : 'enemy_fleet';
    this.eventActive = { type: type, timer: 5, spawnTimer: 0 };
    if (type === 'meteor_shower') {
      Game.showMessage('CHUVA DE METEOROS!', 2);
    } else {
      Game.showMessage('FROTA INIMIGA!', 2);
    }
    Game.triggerShake(4, 0.5);
  },

  render: function(ctx) {
    var currentPlanet = Game.saveData.currentPlanet;
    var planet = Game.PlanetData[currentPlanet];

    // Sky background based on phase
    if (this.bgPhase === 0) {
      // Atmosphere of current planet
      var grad = ctx.createLinearGradient(0, 0, 0, Game.CANVAS_H);
      grad.addColorStop(0, planet.skyTop);
      grad.addColorStop(1, planet.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    } else if (this.bgPhase === 2 && currentPlanet + 1 < Game.PlanetData.length) {
      // Atmosphere of next planet
      var nextPlanet = Game.PlanetData[currentPlanet + 1];
      var grad2 = ctx.createLinearGradient(0, 0, 0, Game.CANVAS_H);
      grad2.addColorStop(0, nextPlanet.skyTop);
      grad2.addColorStop(1, nextPlanet.skyBottom);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    } else {
      // Deep space
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    }

    // Stars
    this.starfield.render(ctx);

    // Ground receding (only at very start)
    if (this.rocket.altitude < 500 && !this.rocket.parachute) {
      var groundY = Game.CANVAS_H - 30 + this.rocket.altitude * 0.5;
      if (groundY < Game.CANVAS_H + 10) {
        ctx.fillStyle = planet.groundColor;
        ctx.fillRect(0, groundY, Game.CANVAS_W, Game.CANVAS_H - groundY + 30);
        ctx.fillStyle = planet.surfaceDetail;
        ctx.fillRect(0, groundY, Game.CANVAS_W, 2);
      }
    }

    // Entities (behind rocket)
    Game.EntityManager.renderAll(ctx, 0, 0);

    // Rocket
    this.rocket.render(ctx);

    // Event warning
    if (this.eventActive) {
      var blink = Math.sin(Game.time * 6) > 0;
      if (blink) {
        var evtText = this.eventActive.type === 'meteor_shower' ? 'CHUVA DE METEOROS' : 'FROTA INIMIGA';
        Game.UI.textBold(ctx, evtText, Game.CANVAS_W / 2, 55, 12, '#ff9800', 'center');
      }
    }

    // HUD
    Game.UI.renderFlightHUD(ctx, this.rocket, Game.saveData);
  },

  exit: function() {
    Game.EntityManager.clear();
  }
};

// ===========================
// PLANET EXPLORE SCENE (platformer)
// ===========================
Game.scenes.PLANET_EXPLORE = {
  astronaut: null,
  starfield: null,
  terrain: null,
  terrainWidth: 2400,
  planetIndex: 0,
  time: 0,
  shopPos: { x: 600, y: 0 },
  rocketPadPos: { x: 1200, y: 0 },
  nearShop: false,
  nearRocket: false,
  decorations: [],

  enter: function(data) {
    data = data || {};
    this.planetIndex = data.planetIndex !== undefined ? data.planetIndex : Game.saveData.currentPlanet;
    Game.saveData.currentPlanet = this.planetIndex;

    this.time = 0;
    this.starfield = new Game.Starfield(100);

    // Generate terrain
    this.terrain = Game.TerrainGenerator.generate(this.planetIndex, this.terrainWidth);

    // Place shop and rocket pad on flat areas
    this.shopPos.x = Math.floor(this.terrainWidth * 0.3);
    this.shopPos.y = this.terrain[this.shopPos.x];
    this.rocketPadPos.x = Math.floor(this.terrainWidth * 0.65);
    this.rocketPadPos.y = this.terrain[this.rocketPadPos.x];

    // Flatten terrain around shop and rocket
    this.flattenArea(this.shopPos.x - 40, this.shopPos.x + 40, this.shopPos.y);
    this.flattenArea(this.rocketPadPos.x - 30, this.rocketPadPos.x + 30, this.rocketPadPos.y);

    // Create astronaut
    this.astronaut = new Game.Astronaut(this.rocketPadPos.x, this.rocketPadPos.y - 20);

    // Camera setup
    Game.Camera.mode = 'horizontal';
    Game.Camera.setWorldBounds(this.terrainWidth, Game.CANVAS_H);
    Game.Camera.x = this.astronaut.x - Game.CANVAS_W / 2;
    Game.Camera.y = 0;

    // Generate decorations
    this.generateDecorations();

    Game.EntityManager.clear();
    this.nearShop = false;
    this.nearRocket = false;
  },

  flattenArea: function(startX, endX, y) {
    startX = Math.max(0, startX);
    endX = Math.min(this.terrain.length - 1, endX);
    for (var x = startX; x <= endX; x++) {
      this.terrain[x] = y;
    }
  },

  generateDecorations: function() {
    this.decorations = [];
    var planet = Game.PlanetData[this.planetIndex];

    // Planet-specific decorations
    for (var x = 50; x < this.terrainWidth - 50; x += 60 + Math.floor(Math.random() * 120)) {
      // Skip near shop and rocket
      if (Math.abs(x - this.shopPos.x) < 80 || Math.abs(x - this.rocketPadPos.x) < 60) continue;

      var groundY = this.terrain[x];
      var type = 'rock';

      if (this.planetIndex === 0) { // Terra
        type = Math.random() < 0.6 ? 'tree' : 'rock';
      } else if (this.planetIndex === 1) { // Lua
        type = Math.random() < 0.3 ? 'crater' : 'rock';
        if (x > 400 && x < 500 && Math.random() < 0.2) type = 'flag'; // US flag
      } else if (this.planetIndex === 2) { // Marte
        type = Math.random() < 0.2 ? 'rover' : 'rock';
      } else if (this.planetIndex === 3) { // Venus
        type = Math.random() < 0.3 ? 'volcano' : 'rock';
      } else if (this.planetIndex === 4) { // Plutao
        type = Math.random() < 0.4 ? 'crystal' : 'rock';
      }

      this.decorations.push({
        x: x,
        y: groundY,
        type: type,
        size: 0.6 + Math.random() * 0.8,
        color: planet.surfaceDetail
      });
    }
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt, 'left');
    Game.UI.updateDialog(dt);

    // Shop substate
    if (Game.subState === Game.SubStates.SHOP) {
      Game.ShopUI.update(dt);
      return;
    }

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    var planet = Game.PlanetData[this.planetIndex];

    // Update astronaut
    this.astronaut.update(dt, this.terrain, planet.gravity);

    // Camera follow
    Game.Camera.follow(this.astronaut, dt);

    // Check proximity to shop
    var shopDist = Math.abs(this.astronaut.x - this.shopPos.x);
    this.nearShop = shopDist < 50;

    // Check proximity to rocket
    var rktDist = Math.abs(this.astronaut.x - this.rocketPadPos.x);
    this.nearRocket = rktDist < 50;

    // Interact (E key)
    if (Game.Input.wasPressed('e') || Game.Input.wasPressed('E')) {
      if (this.nearShop) {
        Game.ShopUI.open();
      } else if (this.nearRocket) {
        if (Game.saveData.fuel > 0) {
          // Launch!
          Game.Save.save(Game.saveData);
          Game.changeState(Game.States.FLIGHT);
        } else {
          Game.UI.showDialog('Sem fuel! Compre na loja.', 2);
        }
      }
    }

    // Update particles
    Game.EntityManager.updateAll(dt);
  },

  render: function(ctx) {
    var planet = Game.PlanetData[this.planetIndex];
    var camX = Game.Camera.x;

    // Sky gradient
    var grad = ctx.createLinearGradient(0, 0, 0, Game.CANVAS_H);
    grad.addColorStop(0, planet.skyTop);
    grad.addColorStop(1, planet.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    // Stars (only visible on dark-sky planets)
    this.starfield.render(ctx);

    // Parallax distant mountains
    this.renderParallax(ctx, planet, camX);

    // Decorations (behind terrain for some, on top for others)
    this.renderDecorations(ctx, camX, true); // background decorations

    // Terrain
    Game.TerrainGenerator.render(ctx, this.terrain, this.planetIndex, camX);

    // Decorations on terrain
    this.renderDecorations(ctx, camX, false); // foreground decorations

    // Shop building
    var shopScreenX = this.shopPos.x - camX;
    if (shopScreenX > -60 && shopScreenX < Game.CANVAS_W + 60) {
      Game.Pixel.drawCentered(ctx, Game.Sprites.shop, shopScreenX, this.shopPos.y - 20, 2);
      // Sign
      Game.UI.textBold(ctx, 'LOJA', shopScreenX, this.shopPos.y - 50, 10, '#ffd700', 'center');

      if (this.nearShop) {
        var pulse = Math.sin(this.time * 4) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = pulse;
        Game.UI.textBold(ctx, '[E] Entrar', shopScreenX, this.shopPos.y + 25, 12, '#4fc3f7', 'center');
        ctx.restore();
      }
    }

    // Rocket on launch pad
    var rktScreenX = this.rocketPadPos.x - camX;
    if (rktScreenX > -40 && rktScreenX < Game.CANVAS_W + 40) {
      // Launch pad
      ctx.fillStyle = '#555';
      ctx.fillRect(rktScreenX - 20, this.rocketPadPos.y - 2, 40, 4);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(rktScreenX - 22, this.rocketPadPos.y - 2, 4, 4);
      ctx.fillRect(rktScreenX + 18, this.rocketPadPos.y - 2, 4, 4);

      // Rocket
      Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, rktScreenX, this.rocketPadPos.y - 24, 2);

      if (this.nearRocket) {
        var pulse2 = Math.sin(this.time * 4) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = pulse2;
        var launchText = Game.saveData.fuel > 0 ? '[E] Lancar' : '[E] Sem Fuel!';
        var launchColor = Game.saveData.fuel > 0 ? '#4caf50' : '#f44336';
        Game.UI.textBold(ctx, launchText, rktScreenX, this.rocketPadPos.y + 25, 12, launchColor, 'center');
        ctx.restore();
      }
    }

    // Astronaut
    this.astronaut.render(ctx, camX, 0);

    // Particles
    Game.EntityManager.renderAll(ctx, camX, 0);

    // HUD
    Game.UI.renderExploreHUD(ctx, Game.saveData);

    // Dialog
    Game.UI.renderDialog(ctx);

    // Shop overlay
    if (Game.subState === Game.SubStates.SHOP) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
      Game.ShopUI.render(ctx, Game.saveData);
    }
  },

  renderParallax: function(ctx, planet, camX) {
    // Simple parallax mountains/hills
    var parallaxSpeed = 0.3;
    var offset = camX * parallaxSpeed;

    ctx.fillStyle = planet.groundDark;
    for (var i = 0; i < 8; i++) {
      var mx = i * 300 - (offset % 300) - 150;
      var mh = 40 + Math.sin(i * 1.7 + 3) * 25;
      var my = Game.CANVAS_H - 200 + Math.sin(i * 0.8) * 20;

      ctx.beginPath();
      ctx.moveTo(mx - 100, my + mh);
      ctx.lineTo(mx, my);
      ctx.lineTo(mx + 100, my + mh);
      ctx.closePath();
      ctx.fill();
    }
  },

  renderDecorations: function(ctx, camX, isBackground) {
    for (var i = 0; i < this.decorations.length; i++) {
      var dec = this.decorations[i];
      var sx = dec.x - camX;
      if (sx < -60 || sx > Game.CANVAS_W + 60) continue;

      var sy = dec.y;
      var s = dec.size;

      switch (dec.type) {
        case 'tree':
          if (isBackground) continue;
          // Trunk
          ctx.fillStyle = '#5d4037';
          ctx.fillRect(sx - 3 * s, sy - 24 * s, 6 * s, 24 * s);
          // Leaves (pixel blocks)
          ctx.fillStyle = '#2e7d32';
          ctx.fillRect(sx - 12 * s, sy - 36 * s, 24 * s, 14 * s);
          ctx.fillStyle = '#388e3c';
          ctx.fillRect(sx - 8 * s, sy - 44 * s, 16 * s, 10 * s);
          ctx.fillStyle = '#43a047';
          ctx.fillRect(sx - 4 * s, sy - 48 * s, 8 * s, 6 * s);
          break;

        case 'rock':
          if (isBackground) continue;
          ctx.fillStyle = dec.color;
          ctx.fillRect(sx - 6 * s, sy - 8 * s, 12 * s, 8 * s);
          ctx.fillRect(sx - 4 * s, sy - 12 * s, 8 * s, 4 * s);
          break;

        case 'crater':
          if (!isBackground) continue;
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.beginPath();
          ctx.ellipse(sx, sy, 20 * s, 6 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#888';
          ctx.lineWidth = 1;
          ctx.stroke();
          break;

        case 'flag':
          if (isBackground) continue;
          // Pole
          ctx.fillStyle = '#ccc';
          ctx.fillRect(sx, sy - 40, 2, 40);
          // Flag (US-ish)
          ctx.fillStyle = '#b71c1c';
          ctx.fillRect(sx + 2, sy - 40, 16, 10);
          ctx.fillStyle = '#fff';
          ctx.fillRect(sx + 2, sy - 38, 16, 2);
          ctx.fillRect(sx + 2, sy - 34, 16, 2);
          ctx.fillStyle = '#1a237e';
          ctx.fillRect(sx + 2, sy - 40, 6, 6);
          break;

        case 'rover':
          if (isBackground) continue;
          // Simple rover
          ctx.fillStyle = '#bbb';
          ctx.fillRect(sx - 10 * s, sy - 10 * s, 20 * s, 8 * s);
          ctx.fillStyle = '#888';
          ctx.fillRect(sx - 8 * s, sy - 16 * s, 8 * s, 6 * s);
          // Wheels
          ctx.fillStyle = '#333';
          ctx.fillRect(sx - 10 * s, sy - 2 * s, 6 * s, 4 * s);
          ctx.fillRect(sx + 4 * s, sy - 2 * s, 6 * s, 4 * s);
          // Antenna
          ctx.fillStyle = '#ccc';
          ctx.fillRect(sx + 4 * s, sy - 22 * s, 1, 8 * s);
          ctx.fillStyle = '#f44336';
          ctx.fillRect(sx + 3 * s, sy - 24 * s, 3 * s, 2 * s);
          break;

        case 'volcano':
          if (isBackground) continue;
          ctx.fillStyle = '#8b4513';
          ctx.beginPath();
          ctx.moveTo(sx - 20 * s, sy);
          ctx.lineTo(sx - 5 * s, sy - 30 * s);
          ctx.lineTo(sx + 5 * s, sy - 30 * s);
          ctx.lineTo(sx + 20 * s, sy);
          ctx.closePath();
          ctx.fill();
          // Lava glow
          ctx.fillStyle = '#ff5722';
          ctx.fillRect(sx - 4 * s, sy - 30 * s, 8 * s, 3 * s);
          // Smoke particles (just pixels)
          if (Math.sin(this.time * 3 + dec.x) > 0.5) {
            ctx.fillStyle = 'rgba(100,100,100,0.4)';
            ctx.fillRect(sx - 2, sy - 34 * s - Math.sin(this.time * 2) * 5, 4, 4);
            ctx.fillRect(sx + 3, sy - 36 * s - Math.cos(this.time * 1.5) * 4, 3, 3);
          }
          break;

        case 'crystal':
          if (isBackground) continue;
          // Ice crystal
          ctx.fillStyle = '#4fc3f7';
          ctx.fillRect(sx - 2 * s, sy - 20 * s, 4 * s, 20 * s);
          ctx.fillStyle = '#81d4fa';
          ctx.fillRect(sx - 5 * s, sy - 14 * s, 3 * s, 14 * s);
          ctx.fillRect(sx + 2 * s, sy - 18 * s, 3 * s, 18 * s);
          // Glow
          ctx.save();
          ctx.globalAlpha = 0.2 + Math.sin(this.time * 2 + dec.x) * 0.1;
          ctx.fillStyle = '#4fc3f7';
          ctx.fillRect(sx - 8 * s, sy - 22 * s, 16 * s, 24 * s);
          ctx.restore();
          break;
      }
    }
  },

  exit: function() {
    Game.EntityManager.clear();
    Game.Camera.reset();
    Game.Save.save(Game.saveData);
  }
};
