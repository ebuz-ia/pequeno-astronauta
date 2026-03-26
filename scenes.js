// ============================================
// scenes.js - MENU, FLIGHT, PLANET_EXPLORE
// Pequeno Astronauta v2.5 - Robot + Puzzles + Easter Egg
// ============================================

window.Game = window.Game || {};
Game.scenes = Game.scenes || {};

// ===========================
// LAUNCH BASE SCENE (replaces MENU)
// ===========================
Game.scenes.LAUNCH_BASE = {
  starfield: null,
  time: 0,
  btnBounds: null,
  flameFrame: 0,
  flameTimer: 0,
  lightTimer: 0,
  lightsOn: true,
  launching: false,
  launchTimer: 0,
  rocketYOffset: 0,

  enter: function() {
    this.starfield = new Game.Starfield(150);
    this.time = 0;
    this.flameFrame = 0;
    this.flameTimer = 0;
    this.lightTimer = 0;
    this.lightsOn = true;
    this.launching = false;
    this.launchTimer = 0;
    this.rocketYOffset = 0;
    if (Game.Audio && Game.Audio.initialized) Game.Audio.playMenuMusic();
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt, 'down');

    // Flame anim
    this.flameTimer += dt;
    if (this.flameTimer > 0.1) { this.flameTimer = 0; this.flameFrame = (this.flameFrame + 1) % 3; }

    // Blink tower lights
    this.lightTimer += dt;
    if (this.lightTimer > 0.5) { this.lightTimer = 0; this.lightsOn = !this.lightsOn; }

    // Launch animation
    if (this.launching) {
      this.launchTimer += dt;
      if (this.launchTimer < 1.0) {
        // Tremor + fire building up
        Game.triggerShake(2 + this.launchTimer * 5, 0.05);
        if (Math.random() < 0.5) {
          Game.spawnParticles(Game.CANVAS_W / 2 + (Math.random() - 0.5) * 30, Game.CANVAS_H - 90, 2, Math.random() < 0.5 ? '#ff6b35' : '#ffeb3b', 1);
        }
      } else if (this.launchTimer < 2.5) {
        // Rocket ascending
        this.rocketYOffset += 300 * dt;
        if (Math.random() < 0.6) {
          Game.spawnParticles(Game.CANVAS_W / 2 + (Math.random() - 0.5) * 15, Game.CANVAS_H - 135 - this.rocketYOffset + 50, 1, '#ff9800', 0.8);
        }
      } else {
        // Go to free space exploration
        this.launching = false;
        Game.changeStateImmediate(Game.States.SPACE_FREE);
      }
      return;
    }

    // Start
    if (Game.Input.wasPressed(' ') || Game.Input.wasPressed('Enter')) {
      this.startLaunch();
    }
    if (this.btnBounds && Game.Input.mouse.clicked) {
      if (Game.UI.isMouseInRect(this.btnBounds.x, this.btnBounds.y, this.btnBounds.w, this.btnBounds.h)) {
        this.startLaunch();
      }
    }
  },

  startLaunch: function() {
    if (Game.Audio) { Game.Audio.init(); Game.Audio.sfx.launch(); }
    Game.saveData = Game.Save.load();
    if (Game.saveData.easterEggPlanet === -1) {
      Game.saveData.easterEggPlanet = 1 + Math.floor(Math.random() * 4);
      Game.Save.save(Game.saveData);
    }
    this.launching = true;
    this.launchTimer = 0;
    this.rocketYOffset = 0;
  },

  render: function(ctx) {
    // Night sky - flat color bands (GBA style)
    Game.Pixel.drawColorBands(ctx, [
      { color: '#050510', ratio: 0.4 },
      { color: '#0a0a1a', ratio: 0.35 },
      { color: '#0f1020', ratio: 0.25 }
    ], 0, 0, Game.CANVAS_W, Game.CANVAS_H);

    // Stars
    this.starfield.render(ctx);

    // Ground - metal platform area
    var groundY = Game.CANVAS_H - 90;

    // Concrete/metal ground
    ctx.fillStyle = '#2a2a30';
    ctx.fillRect(0, groundY, Game.CANVAS_W, 90);
    ctx.fillStyle = '#3a3a40';
    ctx.fillRect(0, groundY, Game.CANVAS_W, 4);
    ctx.fillStyle = '#1a1a20';
    ctx.fillRect(0, groundY + 20, Game.CANVAS_W, 70);

    // Floor markings (yellow stripes)
    for (var mx = 0; mx < Game.CANVAS_W; mx += 60) {
      ctx.fillStyle = '#c0a010';
      ctx.fillRect(mx, groundY + 8, 30, 4);
    }

    // Center floor markings (landing circle)
    var padCX = Game.CANVAS_W / 2;
    ctx.fillStyle = '#c0a010';
    ctx.fillRect(padCX - 60, groundY + 2, 120, 4);
    ctx.fillRect(padCX - 3, groundY + 2, 6, 16);

    // Launch pad
    Game.Pixel.draw(ctx, Game.Sprites.launchPad, padCX - 60, groundY - 20, 3);

    // Launch tower (left of pad)
    var towerX = padCX - 140;
    var towerY = groundY - 96 * 3;
    Game.Pixel.draw(ctx, Game.Sprites.launchTower, towerX, towerY, 3);

    // Blinking lights on tower
    var lightColor = this.lightsOn ? '#ff0000' : '#440000';
    ctx.fillStyle = lightColor;
    ctx.fillRect(towerX + 15, towerY + 3, 6, 6);
    ctx.fillRect(towerX + 21, towerY + 3, 6, 6);
    // More lights down the tower
    var lightColor2 = !this.lightsOn ? '#ffff00' : '#444400';
    ctx.fillStyle = lightColor2;
    ctx.fillRect(towerX + 18, towerY + 42, 6, 6);
    ctx.fillRect(towerX + 18, towerY + 72, 6, 6);

    // Support arm connecting tower to rocket
    ctx.fillStyle = '#555';
    ctx.fillRect(towerX + 30, groundY - 80, padCX - towerX - 50, 6);

    // Rocket on pad
    var rocketX = padCX;
    var rocketY = groundY - 45 - this.rocketYOffset;
    Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, rocketX, rocketY, 3);

    // Flame during launch
    if (this.launching && this.launchTimer >= 0.5) {
      Game.Pixel.drawCentered(ctx, Game.Sprites.flame[this.flameFrame], rocketX, rocketY + 44, 3);
    }

    // Title - pixel art
    if (!this.launching || this.launchTimer < 1) {
      var titleY = 50 + Math.sin(this.time * 1.5) * 3;
      var titleScale = 4;
      this.drawColorTitle(ctx, 'EXPLORADORES', Game.CANVAS_W / 2, titleY, titleScale);
      this.drawColorTitle(ctx, 'DA GALAXIA', Game.CANVAS_W / 2, titleY + titleScale * 7, titleScale);

      // Subtitle
      Game.UI.text(ctx, 'Uma aventura espacial em pixel art', Game.CANVAS_W / 2, titleY + titleScale * 15, 13, '#556', 'center');
    }

    // "LANCAR" button
    if (!this.launching) {
      var btnW = 180, btnH = 44;
      var btnX = Game.CANVAS_W / 2 - btnW / 2;
      var btnY = Game.CANVAS_H - 60;
      var hovered = Game.UI.isMouseInRect(btnX, btnY, btnW, btnH);

      var pulse = Math.sin(this.time * 3) * 0.2 + 0.8;
      ctx.save();
      ctx.globalAlpha = pulse * 0.3;
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(btnX - 4, btnY - 4, btnW + 8, btnH + 8);
      ctx.restore();

      this.btnBounds = Game.UI.button(ctx, 'LANCAR', btnX, btnY, btnW, btnH, hovered, '#ff6b35');

      // Save hint
      var save = Game.Save.load();
      if (save.coins !== 100 || save.currentPlanet > 0) {
        Game.UI.text(ctx, 'Continuar jogo salvo', Game.CANVAS_W / 2, btnY - 15, 11, '#555', 'center');
      }
    } else {
      // Launch countdown text
      if (this.launchTimer < 1.5) {
        var countText = Math.ceil(1.5 - this.launchTimer);
        Game.UI.textBold(ctx, '' + countText, Game.CANVAS_W / 2, 200, 40, '#ff6b35', 'center');
      } else {
        Game.UI.textBold(ctx, 'DECOLAGEM!', Game.CANVAS_W / 2, 200, 28, '#ffd700', 'center');
      }
    }

    // Controls & version
    if (!this.launching) {
      Game.UI.text(ctx, 'ESPACO/ENTER: Lancar | WASD: Mover | E: Interagir | M: Musica', Game.CANVAS_W / 2, 20, 10, '#333', 'center');
      Game.UI.text(ctx, 'v4.0', Game.CANVAS_W - 30, Game.CANVAS_H - 15, 10, '#333', 'right');
    }
  },

  drawColorTitle: function(ctx, text, centerX, y, scale) {
    var totalW = 0;
    var chars = text.split('');
    for (var i = 0; i < chars.length; i++) {
      var glyph = Game.UI.glyphs[chars[i]];
      if (glyph) totalW += (glyph[0].length + 1) * scale;
      else totalW += 3 * scale;
    }
    totalW -= scale;

    var cx = centerX - totalW / 2;
    for (var j = 0; j < chars.length; j++) {
      var glyph2 = Game.UI.glyphs[chars[j]];
      if (glyph2) {
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
// SPACE FREE EXPLORATION (360 rotation, free movement)
// ===========================
Game.scenes.SPACE_FREE = {
  time: 0,
  starfield: null,

  // Ship state
  shipX: 0,
  shipY: 0,
  shipAngle: 0, // radians, 0 = up
  shipVX: 0,
  shipVY: 0,
  thrustPower: 200,
  rotateSpeed: 2.5, // radians/sec
  maxSpeed: 300,
  friction: 0.985,

  // Camera
  camX: 0,
  camY: 0,

  // Controls state (for on-screen buttons)
  pressing: { left: false, right: false, thrust: false, brake: false, shoot: false, bomb: false },
  fireCooldown: 0,
  bombCooldown: 0,

  // Planets in world space
  worldScale: 1200, // pixels per gx/gy unit (more spread out)
  nearPlanet: -1,

  // Flame
  flameFrame: 0,
  flameTimer: 0,

  // Black hole warning
  blackHoleWarning: false,
  blackHoleTimer: 0,

  // Squadron (wingmen)
  wingmen: [],

  enter: function(data) {
    this.time = 0;
    this.starfield = new Game.Starfield(400);
    this.flameFrame = 0;
    this.flameTimer = 0;
    this.nearPlanet = -1;
    this.blackHoleWarning = false;
    this.blackHoleTimer = 0;
    this.exploding = false;
    this.explosionTimer = 0;
    this.portalActive = false;
    this.finalBossActive = false;
    this.finalBossHP = 0;
    this.showingVictory = false;

    // Spawn wingmen based on upgrade level
    this.wingmen = [];
    var squadLevel = Game.saveData.rocketParts.radar || 0;
    for (var wi = 0; wi < squadLevel; wi++) {
      this.wingmen.push({
        x: 0, y: 0,
        offsetAngle: (wi + 1) * (Math.PI * 2 / (squadLevel + 1)),
        orbitDist: 60 + wi * 25,
        shootTimer: 1 + Math.random() * 2,
        flameFrame: Math.floor(Math.random() * 3)
      });
    }

    // Position ship at current planet
    var cp = Game.PlanetData[Game.saveData.currentPlanet];
    this.shipX = cp.gx * this.worldScale;
    this.shipY = cp.gy * this.worldScale;
    this.shipAngle = 0;
    this.shipVX = 0;
    this.shipVY = 0;

    if (data && data.fromPlanet !== undefined) {
      var fp = Game.PlanetData[data.fromPlanet];
      this.shipX = fp.gx * this.worldScale;
      this.shipY = fp.gy * this.worldScale + 80;
    }

    // Black holes are rare events - clear and set timer
    Game.BlackHoles = [];
    this.blackHoleSpawnTimer = 60 + Math.random() * 120; // first one 1-3 minutes

    if (Game.Audio && Game.Audio.initialized) Game.Audio.playFlightMusic();
  },

  update: function(dt) {
    this.time += dt;

    // Flame animation
    this.flameTimer += dt;
    if (this.flameTimer > 0.1) { this.flameTimer = 0; this.flameFrame = (this.flameFrame + 1) % 3; }

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    // Music toggle
    if (Game.Input.wasPressed('m') || Game.Input.wasPressed('M')) {
      if (Game.Audio) Game.Audio.toggleMusic();
    }

    // --- ROTATION ---
    var rotLeft = Game.Input.keys['ArrowLeft'] || Game.Input.keys['a'] || Game.Input.keys['A'] || this.pressing.left;
    var rotRight = Game.Input.keys['ArrowRight'] || Game.Input.keys['d'] || Game.Input.keys['D'] || this.pressing.right;
    if (rotLeft) this.shipAngle -= this.rotateSpeed * dt;
    if (rotRight) this.shipAngle += this.rotateSpeed * dt;

    // --- SHOOT ---
    // Normal shot (Space or shoot button)
    this.fireCooldown = (this.fireCooldown || 0) - dt * 1000;
    this.bombCooldown = (this.bombCooldown || 0) - dt * 1000;
    var mouseShoot = Game.Input.mouse.down && !this.pressing.anyControl;
    var shooting = Game.Input.keys[' '] || this.pressing.shoot || mouseShoot;
    var bombing = Game.Input.wasPressed('b') || Game.Input.wasPressed('B') || this.pressing.bomb;

    if (Game.saveData.ammo === undefined) { Game.saveData.ammo = 50; Game.saveData.maxAmmo = 50; }
    if (shooting && this.fireCooldown <= 0 && Game.saveData.ammo > 0) {
      Game.saveData.ammo--;
      var stats = Game.getRocketStats(Game.saveData);
      this.fireCooldown = stats.fireCooldown || 300;
      var bx = this.shipX + Math.sin(this.shipAngle) * 30;
      var by = this.shipY - Math.cos(this.shipAngle) * 30;
      var bvx = Math.sin(this.shipAngle) * 500 + this.shipVX * 0.3;
      var bvy = -Math.cos(this.shipAngle) * 500 + this.shipVY * 0.3;
      var bulletColor = '#4fc3f7';
      var skins = { red: '#f44336', blue: '#2196f3', green: '#4caf50', purple: '#9c27b0' };
      if (Game.saveData.shotSkin && skins[Game.saveData.shotSkin]) bulletColor = skins[Game.saveData.shotSkin];
      Game.EntityManager.add('bullets', {
        x: bx, y: by, vx: bvx, vy: bvy, radius: 4, damage: 10,
        color: bulletColor, life: 2, active: true,
        update: function(dt) {
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.life -= dt; if (this.life <= 0) this.active = false;
        },
        render: function(ctx, ox, oy) {
          ctx.fillStyle = this.color;
          ctx.fillRect(this.x - (ox||0) - 3, this.y - (oy||0) - 3, 6, 6);
        }
      });
      if (Game.Audio) Game.Audio.sfx.shoot();
    }

    // Bomb (B key or bomb button) - area damage, 3s cooldown
    if (bombing && this.bombCooldown <= 0 && Game.saveData.coins >= 5) {
      this.bombCooldown = 3000;
      Game.saveData.coins -= 5;
      var bombX = this.shipX + Math.sin(this.shipAngle) * 40;
      var bombY = this.shipY - Math.cos(this.shipAngle) * 40;
      var bombVX = Math.sin(this.shipAngle) * 200 + this.shipVX * 0.5;
      var bombVY = -Math.cos(this.shipAngle) * 200 + this.shipVY * 0.5;
      Game.EntityManager.add('bullets', {
        x: bombX, y: bombY, vx: bombVX, vy: bombVY, radius: 8, damage: 50,
        color: '#ff9800', life: 1.5, active: true, isBomb: true, exploded: false,
        update: function(dt) {
          this.x += this.vx * dt; this.y += this.vy * dt;
          this.vx *= 0.98; this.vy *= 0.98;
          this.life -= dt;
          if (this.life <= 0 && !this.exploded) {
            this.exploded = true;
            this.active = false;
            // Explosion particles
            Game.spawnParticles(this.x, this.y, 20, '#ff9800', 1.5);
            Game.spawnParticles(this.x, this.y, 15, '#ffeb3b', 1);
            Game.spawnParticles(this.x, this.y, 10, '#f44336', 1.2);
            Game.triggerShake(8, 0.3);
            if (Game.Audio) Game.Audio.sfx.explosion();
          }
        },
        render: function(ctx, ox, oy) {
          var sx = this.x - (ox||0);
          var sy = this.y - (oy||0);
          // Bomb body
          ctx.fillStyle = '#ff9800';
          ctx.fillRect(sx - 6, sy - 6, 12, 12);
          ctx.fillStyle = '#ffeb3b';
          ctx.fillRect(sx - 3, sy - 3, 6, 6);
          // Trail
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#f44336';
          ctx.fillRect(sx - this.vx * 0.02 - 3, sy - this.vy * 0.02 - 3, 6, 6);
          ctx.restore();
        }
      });
      if (Game.Audio) Game.Audio.sfx.explosion();
      Game.addFloatingText('-5 moedas', this.shipX, this.shipY - 30, '#ff9800');
    }

    // --- THRUST ---
    var thrusting = Game.Input.keys['ArrowUp'] || Game.Input.keys['w'] || Game.Input.keys['W'] || this.pressing.thrust;
    var braking = Game.Input.keys['ArrowDown'] || Game.Input.keys['s'] || Game.Input.keys['S'] || this.pressing.brake;

    if (thrusting && Game.saveData.fuel > 0) {
      // Direction from angle (0 = up)
      var ax = Math.sin(this.shipAngle) * this.thrustPower;
      var ay = -Math.cos(this.shipAngle) * this.thrustPower;
      this.shipVX += ax * dt;
      this.shipVY += ay * dt;
      Game.saveData.fuel = Math.max(0, Game.saveData.fuel - dt * 3);

      // Thrust particles
      if (Math.random() < 0.5) {
        var px = this.shipX - Math.sin(this.shipAngle) * 30;
        var py = this.shipY + Math.cos(this.shipAngle) * 30;
        Game.spawnParticles(px, py, 1, Math.random() < 0.5 ? '#ff6b35' : '#ffeb3b', 0.5);
      }
    }

    // --- FUEL EMPTY: NUCLEAR EXPLOSION ---
    if (Game.saveData.fuel <= 0 && !this.exploding) {
      this.exploding = true;
      this.explosionTimer = 0;
      this.explosionX = this.shipX;
      this.explosionY = this.shipY;
      this.shipVX = 0;
      this.shipVY = 0;
      if (Game.Audio) Game.Audio.sfx.explosion();
      Game.triggerShake(20, 2);
      // Massive particle burst
      for (var ep = 0; ep < 40; ep++) {
        Game.spawnParticles(this.shipX, this.shipY, 1, '#ff9800', 2);
        Game.spawnParticles(this.shipX, this.shipY, 1, '#ffeb3b', 1.5);
        Game.spawnParticles(this.shipX, this.shipY, 1, '#f44336', 1.8);
      }
    }

    if (this.exploding) {
      this.explosionTimer += dt;
      // Screen flash
      // After 3 seconds, respawn at current planet with half fuel
      if (this.explosionTimer > 3.5) {
        this.exploding = false;
        var stats2 = Game.getRocketStats(Game.saveData);
        Game.saveData.fuel = Math.floor(stats2.maxFuel * 0.3);
        Game.saveData.coins = Math.floor(Game.saveData.coins * 0.8);
        Game.saveData.currentPlanet = 0; // volta para Terra
        Game.Save.save(Game.saveData);
        Game.showMessage('Nave destruida! Retornando a Terra com 30% fuel', 3);
        var terra = Game.PlanetData[0];
        this.shipX = terra.gx * this.worldScale;
        this.shipY = terra.gy * this.worldScale + 80;
        this.shipVX = 0;
        this.shipVY = 0;
      }
      return; // freeze controls during explosion
    }

    if (braking) {
      this.shipVX *= 0.95;
      this.shipVY *= 0.95;
    }

    // Friction
    this.shipVX *= this.friction;
    this.shipVY *= this.friction;

    // Clamp speed
    var speed = Math.sqrt(this.shipVX * this.shipVX + this.shipVY * this.shipVY);
    if (speed > this.maxSpeed) {
      this.shipVX = (this.shipVX / speed) * this.maxSpeed;
      this.shipVY = (this.shipVY / speed) * this.maxSpeed;
    }

    // Move
    this.shipX += this.shipVX * dt;
    this.shipY += this.shipVY * dt;

    // Camera follows ship
    this.camX = this.shipX - Game.CANVAS_W / 2;
    this.camY = this.shipY - Game.CANVAS_H / 2;

    // --- CHECK PROXIMITY TO PLANETS ---
    this.nearPlanet = -1;
    for (var p = 0; p < Game.PlanetData.length; p++) {
      var planet = Game.PlanetData[p];
      var requiredVisits = p < 5 ? 0 : (p < 10 ? 5 : 10);
      if ((Game.saveData.planetsVisited || 0) < requiredVisits) continue;

      var wx = planet.gx * this.worldScale;
      var wy = planet.gy * this.worldScale;
      var dist = Math.sqrt((this.shipX - wx) * (this.shipX - wx) + (this.shipY - wy) * (this.shipY - wy));
      if (dist < 80) {
        this.nearPlanet = p;
        break;
      }
    }

    // Enter planet
    if (this.nearPlanet >= 0 && (Game.Input.wasPressed('e') || Game.Input.wasPressed('E'))) {
      Game.saveData.currentPlanet = this.nearPlanet;
      if (Game.saveData.visitedPlanets.indexOf(this.nearPlanet) === -1) {
        Game.saveData.visitedPlanets.push(this.nearPlanet);
        Game.saveData.planetsVisited = Game.saveData.visitedPlanets.length;
      }
      Game.Save.save(Game.saveData);
      Game.changeStateImmediate(Game.States.PLANET_EXPLORE, { planetIndex: this.nearPlanet });
      return;
    }

    // Switch weapon (Q key)
    if (Game.Input.wasPressed('q') || Game.Input.wasPressed('Q')) {
      if (!Game.saveData.weapons) Game.saveData.weapons = { blaster: true };
      var ownedW = Object.keys(Game.saveData.weapons).filter(function(w) { return Game.saveData.weapons[w]; });
      if (ownedW.length > 1) {
        var ci2 = ownedW.indexOf(Game.saveData.currentWeapon || 'blaster');
        Game.saveData.currentWeapon = ownedW[(ci2 + 1) % ownedW.length];
        Game.showMessage('Arma: ' + Game.saveData.currentWeapon.toUpperCase(), 1.5);
        if (Game.Audio) Game.Audio.sfx.menuSelect();
      }
    }

    // Enter cockpit (C key)
    if (Game.Input.wasPressed('c') || Game.Input.wasPressed('C')) {
      Game.changeStateImmediate(Game.States.COCKPIT);
      return;
    }

    // --- EMERALD PORTAL (appears when 5 shards collected) ---
    if (Game.saveData.emeraldShards >= 5 && !Game.saveData.gameCompleted && !this.portalActive) {
      this.portalActive = true;
      this.portalX = this.shipX + 2000;
      this.portalY = this.shipY - 1000;
      Game.showMessage('O PORTAL DA ESMERALDA se abriu! Encontre-o no mapa!', 4);
    }
    if (this.portalActive) {
      var pdx = this.portalX - this.shipX, pdy = this.portalY - this.shipY;
      var pDist = Math.sqrt(pdx * pdx + pdy * pdy);
      if (pDist < 80 && (Game.Input.wasPressed('e') || Game.Input.wasPressed('E'))) {
        // Enter final boss arena
        this.portalActive = false;
        this.finalBossActive = true;
        this.finalBossHP = 500;
        this.finalBossMaxHP = 500;
        this.finalBossX = this.shipX + 300;
        this.finalBossY = this.shipY;
        this.finalBossPhase = 0;
        this.finalBossTimer = 0;
        this.finalBossAttackTimer = 3;
        Game.showMessage('BOSS FINAL: IMPERADOR DAS TREVAS!', 4);
        Game.triggerShake(15, 1);
        if (Game.Audio) Game.Audio.sfx.warning();
        if (Game.Audio) Game.Audio.sfx.easterEgg();
      }
    }

    // --- FINAL BOSS LOGIC ---
    if (this.finalBossActive) {
      this.finalBossTimer += dt;
      // Orbit around player
      var fbAngle = this.finalBossTimer * 0.5;
      var fbDist = 200 + Math.sin(this.finalBossTimer * 0.3) * 80;
      this.finalBossX = this.shipX + Math.cos(fbAngle) * fbDist;
      this.finalBossY = this.shipY + Math.sin(fbAngle) * fbDist;

      // Attack patterns
      this.finalBossAttackTimer -= dt;
      if (this.finalBossAttackTimer <= 0) {
        this.finalBossPhase = (this.finalBossPhase + 1) % 3;
        this.finalBossAttackTimer = 2.5;

        if (this.finalBossPhase === 0) {
          // Spiral burst (12 projectiles)
          for (var fb = 0; fb < 12; fb++) {
            var fba = Math.PI * 2 * fb / 12;
            Game.EntityManager.add('particles', {
              x: this.finalBossX, y: this.finalBossY, radius: 5, active: true,
              vx: Math.cos(fba) * 200, vy: Math.sin(fba) * 200, life: 2,
              color: '#e040fb', isEnemyBullet: true,
              update: function(dt3) { this.x += this.vx * dt3; this.y += this.vy * dt3; this.life -= dt3; if (this.life <= 0) this.active = false; },
              render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x-(ox||0)-4, this.y-(oy||0)-4, 8, 8); }
            });
          }
          if (Game.Audio) Game.Audio.sfx.explosion();
        } else if (this.finalBossPhase === 1) {
          // Homing missiles (3)
          for (var fm = 0; fm < 3; fm++) {
            var fmAngle2 = Math.random() * Math.PI * 2;
            (function(sx, sy) {
              Game.EntityManager.add('particles', {
                x: sx, y: sy, radius: 6, active: true,
                vx: Math.cos(fmAngle2) * 100, vy: Math.sin(fmAngle2) * 100, life: 3,
                color: '#ff1744', isEnemyBullet: true,
                update: function(dt3) {
                  var tdx = Game.scenes.SPACE_FREE.shipX - this.x;
                  var tdy = Game.scenes.SPACE_FREE.shipY - this.y;
                  var td = Math.sqrt(tdx*tdx+tdy*tdy);
                  if (td > 5) { this.vx += (tdx/td) * 80 * dt3; this.vy += (tdy/td) * 80 * dt3; }
                  this.x += this.vx * dt3; this.y += this.vy * dt3;
                  this.life -= dt3; if (this.life <= 0) this.active = false;
                },
                render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x-(ox||0)-5, this.y-(oy||0)-5, 10, 10); }
              });
            })(this.finalBossX, this.finalBossY);
          }
        } else {
          // Laser beam (line of particles toward player)
          var ldx = this.shipX - this.finalBossX, ldy = this.shipY - this.finalBossY;
          var ld = Math.sqrt(ldx*ldx+ldy*ldy);
          for (var ll = 0; ll < 8; ll++) {
            Game.EntityManager.add('particles', {
              x: this.finalBossX + (ldx/ld) * ll * 30, y: this.finalBossY + (ldy/ld) * ll * 30,
              radius: 4, active: true, vx: (ldx/ld) * 350, vy: (ldy/ld) * 350, life: 1,
              color: '#ffeb3b', isEnemyBullet: true,
              update: function(dt3) { this.x += this.vx * dt3; this.y += this.vy * dt3; this.life -= dt3; if (this.life <= 0) this.active = false; },
              render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x-(ox||0)-3, this.y-(oy||0)-3, 6, 6); }
            });
          }
          if (Game.Audio) Game.Audio.sfx.shoot();
        }
      }

      // Check bullets hitting final boss
      var bullets = Game.EntityManager.bullets;
      for (var fbi = bullets.length - 1; fbi >= 0; fbi--) {
        var fb2 = bullets[fbi];
        if (!fb2.active) continue;
        var fbdx = fb2.x - this.finalBossX, fbdy = fb2.y - this.finalBossY;
        if (Math.sqrt(fbdx*fbdx+fbdy*fbdy) < 40) {
          fb2.active = false;
          this.finalBossHP -= (fb2.damage || 10);
          Game.spawnParticles(this.finalBossX, this.finalBossY, 3, '#e040fb', 0.5);
          if (Game.Audio) Game.Audio.sfx.hit();

          if (this.finalBossHP <= 0) {
            this.finalBossActive = false;
            Game.saveData.gameCompleted = true;
            Game.Save.save(Game.saveData);
            // MEGA EXPLOSION
            for (var fex = 0; fex < 60; fex++) Game.spawnParticles(this.finalBossX, this.finalBossY, 1, ['#ff9800','#ffeb3b','#f44336','#e040fb','#4caf50'][fex%5], 3);
            Game.triggerShake(25, 2);
            if (Game.Audio) { Game.Audio.sfx.explosion(); Game.Audio.sfx.milestone(); Game.Audio.sfx.easterEgg(); }
            this.victoryTimer = 0;
            this.showingVictory = true;
          }
        }
      }
    }

    // --- VICTORY SCREEN ---
    if (this.showingVictory) {
      this.victoryTimer += dt;
      // No other updates during victory
      this.starfield.update(dt, 'none');
      Game.EntityManager.updateAll(dt);
      return;
    }

    // --- MAP BOUNDARY (black holes push back) ---
    var mapLimit = 18000; // world radius (covers all 15 planets at scale 1200)
    var distFromCenter = Math.sqrt(this.shipX * this.shipX + this.shipY * this.shipY);
    if (distFromCenter > mapLimit) {
      // Strong push toward center
      var pushForce = (distFromCenter - mapLimit) * 0.5;
      this.shipVX -= (this.shipX / distFromCenter) * pushForce * dt;
      this.shipVY -= (this.shipY / distFromCenter) * pushForce * dt;
      this.blackHoleWarning = true;
      if (!this._boundaryWarned) {
        this._boundaryWarned = true;
        Game.showMessage('PERIGO! Borda da galaxia! Buracos negros por toda parte!', 3);
        if (Game.Audio) Game.Audio.sfx.warning();
      }
    } else {
      this._boundaryWarned = false;
    }
    // Spawn boundary black holes when near edge
    if (distFromCenter > mapLimit * 0.8 && Game.BlackHoles.length < 5) {
      var edgeAngle = Math.atan2(this.shipY, this.shipX);
      for (var ebi = 0; ebi < 3; ebi++) {
        var ebAngle = edgeAngle + (ebi - 1) * 0.5;
        var ebDist = mapLimit * 0.95;
        var exists = false;
        for (var ebc = 0; ebc < Game.BlackHoles.length; ebc++) {
          var ebdx = Game.BlackHoles[ebc].gx - Math.cos(ebAngle) * ebDist / this.worldScale;
          var ebdy = Game.BlackHoles[ebc].gy - Math.sin(ebAngle) * ebDist / this.worldScale;
          if (Math.sqrt(ebdx*ebdx+ebdy*ebdy) < 3) { exists = true; break; }
        }
        if (!exists) {
          Game.BlackHoles.push({
            gx: Math.cos(ebAngle) * ebDist / this.worldScale,
            gy: Math.sin(ebAngle) * ebDist / this.worldScale,
            radius: 1.5, name: 'Abismo ' + (Game.BlackHoles.length + 1),
            lifetime: 60
          });
        }
      }
    }

    // --- COMET HALLEY (rare, deadly) ---
    this.cometTimer = (this.cometTimer || 40 + Math.random() * 60) - dt;
    if (this.cometTimer <= 0 && !this.activeComet) {
      this.cometTimer = 50 + Math.random() * 80;
      // Spawn comet from random edge, aimed near player
      var cAngle = Math.random() * Math.PI * 2;
      var cDist = 800;
      this.activeComet = {
        x: this.shipX + Math.cos(cAngle) * cDist,
        y: this.shipY + Math.sin(cAngle) * cDist,
        vx: -Math.cos(cAngle) * 500,
        vy: -Math.sin(cAngle) * 500,
        radius: 20,
        life: 5,
        warned: false
      };
      Game.showMessage('COMETA HALLEY DETECTADO! DESVIE!', 3);
      if (Game.Audio) Game.Audio.sfx.warning();
    }
    if (this.activeComet) {
      var comet = this.activeComet;
      comet.x += comet.vx * dt;
      comet.y += comet.vy * dt;
      comet.life -= dt;
      // Check collision with ship
      var cdx = comet.x - this.shipX, cdy = comet.y - this.shipY;
      var cDist2 = Math.sqrt(cdx * cdx + cdy * cdy);
      if (cDist2 < comet.radius + 24) {
        // INSTANT EXPLOSION
        this.activeComet = null;
        this.exploding = true;
        this.explosionTimer = 0;
        this.explosionX = this.shipX;
        this.explosionY = this.shipY;
        this.shipVX = 0; this.shipVY = 0;
        for (var cp = 0; cp < 50; cp++) Game.spawnParticles(this.shipX, this.shipY, 1, ['#ff9800','#ffeb3b','#f44336'][cp%3], 2);
        Game.triggerShake(25, 2);
        if (Game.Audio) Game.Audio.sfx.explosion();
        Game.showMessage('ATINGIDO PELO COMETA HALLEY!', 3);
      }
      if (comet.life <= 0) this.activeComet = null;
    }

    // --- BLACK HOLE RARE SPAWN ---
    this.blackHoleSpawnTimer -= dt;
    if (this.blackHoleSpawnTimer <= 0 && Game.BlackHoles.length < 2) {
      // Spawn a black hole at random position far from ship
      var bhAngle = Math.random() * Math.PI * 2;
      var bhDist = 2000 + Math.random() * 3000;
      var newBH = {
        gx: (this.shipX + Math.cos(bhAngle) * bhDist) / this.worldScale,
        gy: (this.shipY + Math.sin(bhAngle) * bhDist) / this.worldScale,
        radius: 0.8 + Math.random() * 0.8,
        name: Game.BlackHoleNames[Math.floor(Math.random() * Game.BlackHoleNames.length)],
        lifetime: 30 + Math.random() * 40 // disappears after 30-70 seconds
      };
      Game.BlackHoles.push(newBH);
      this.blackHoleSpawnTimer = 90 + Math.random() * 180; // next one in 1.5-4.5 minutes
    }

    // Age and remove expired black holes
    for (var bhr = Game.BlackHoles.length - 1; bhr >= 0; bhr--) {
      if (Game.BlackHoles[bhr].lifetime !== undefined) {
        Game.BlackHoles[bhr].lifetime -= dt;
        if (Game.BlackHoles[bhr].lifetime <= 0) {
          Game.BlackHoles.splice(bhr, 1);
        }
      }
    }

    // --- BLACK HOLES ---
    this.blackHoleWarning = false;
    for (var bh = 0; bh < Game.BlackHoles.length; bh++) {
      var hole = Game.BlackHoles[bh];
      var bhx = hole.gx * this.worldScale;
      var bhy = hole.gy * this.worldScale;
      var bhDist = Math.sqrt((this.shipX - bhx) * (this.shipX - bhx) + (this.shipY - bhy) * (this.shipY - bhy));
      var dangerRadius = hole.radius * this.worldScale;

      if (bhDist < dangerRadius * 2) {
        this.blackHoleWarning = true;
        this.blackHoleTimer += dt;
        // Play warning sound periodically
        if (Math.floor(this.blackHoleTimer * 2) % 2 === 0 && Math.floor((this.blackHoleTimer - dt) * 2) % 2 !== 0) {
          if (Game.Audio) Game.Audio.sfx.warning();
        }
      }

      // Gravitational pull
      if (bhDist < dangerRadius * 1.5 && bhDist > 10) {
        var pullForce = 150 * (1 - bhDist / (dangerRadius * 1.5));
        var pdx = (bhx - this.shipX) / bhDist;
        var pdy = (bhy - this.shipY) / bhDist;
        this.shipVX += pdx * pullForce * dt;
        this.shipVY += pdy * pullForce * dt;
      }

      // Death zone
      if (bhDist < dangerRadius * 0.3) {
        Game.triggerShake(15, 0.5);
        if (Game.Audio) Game.Audio.sfx.damage();
        Game.saveData.coins = Math.floor(Game.saveData.coins * 0.7);
        Game.saveData.fuel = Math.floor(Game.saveData.fuel * 0.5);
        // Teleport back to current planet
        var safeP = Game.PlanetData[Game.saveData.currentPlanet];
        this.shipX = safeP.gx * this.worldScale;
        this.shipY = safeP.gy * this.worldScale + 80;
        this.shipVX = 0;
        this.shipVY = 0;
        Game.showMessage('Sugado pelo buraco negro! -30% moedas, -50% fuel', 3);
        Game.Save.save(Game.saveData);
      }
    }

    // --- SPAWN ENEMIES, ASTEROIDS, MONSTERS ---
    this.enemySpawnTimer = (this.enemySpawnTimer || 3) - dt;
    this.asteroidSpawnTimer = (this.asteroidSpawnTimer || 1) - dt;
    this.monsterSpawnTimer = (this.monsterSpawnTimer || 20) - dt;

    // Asteroids (frequent)
    if (this.asteroidSpawnTimer <= 0) {
      this.asteroidSpawnTimer = 1.5 + Math.random() * 2;
      var aAngle = Math.random() * Math.PI * 2;
      var aDist = 500 + Math.random() * 200;
      var ax2 = this.shipX + Math.cos(aAngle) * aDist;
      var ay2 = this.shipY + Math.sin(aAngle) * aDist;
      var aSpeed = 40 + Math.random() * 80;
      var aDir = Math.random() * Math.PI * 2;
      Game.EntityManager.add('meteors', {
        x: ax2, y: ay2, radius: 12 + Math.random() * 10,
        vx: Math.cos(aDir) * aSpeed, vy: Math.sin(aDir) * aSpeed,
        active: true, hp: 10, lucky: Math.random() < 0.08,
        update: function(dt2) {
          this.x += this.vx * dt2; this.y += this.vy * dt2;
          var d = Math.sqrt((this.x - Game.scenes.SPACE_FREE.shipX) ** 2 + (this.y - Game.scenes.SPACE_FREE.shipY) ** 2);
          if (d > 800) this.active = false;
        },
        render: function(ctx2, ox, oy) {
          var sx2 = this.x - (ox || 0), sy2 = this.y - (oy || 0);
          if (this.lucky) {
            ctx2.save(); ctx2.globalAlpha = 0.3; ctx2.fillStyle = '#ffd700';
            ctx2.fillRect(sx2 - this.radius, sy2 - this.radius, this.radius * 2, this.radius * 2);
            ctx2.restore();
          }
          Game.Pixel.drawCentered(ctx2, Game.Sprites.meteor, sx2, sy2, 3);
        },
        destroy: function() {
          this.active = false;
          Game.spawnParticles(this.x, this.y, 6, '#8d6e63', 0.8);
        }
      });
    }

    // Enemy ships (moderate)
    if (this.enemySpawnTimer <= 0) {
      this.enemySpawnTimer = 4 + Math.random() * 6;
      var eAngle = Math.random() * Math.PI * 2;
      var eDist = 500 + Math.random() * 200;
      var ex = this.shipX + Math.cos(eAngle) * eDist;
      var ey = this.shipY + Math.sin(eAngle) * eDist;
      Game.EntityManager.add('enemies', {
        x: ex, y: ey, radius: 18, hp: 30, active: true,
        shootTimer: 1 + Math.random() * 2,
        coinDrop: 8 + Math.floor(Math.random() * 12),
        update: function(dt2) {
          // Chase player slowly
          var tdx = Game.scenes.SPACE_FREE.shipX - this.x;
          var tdy = Game.scenes.SPACE_FREE.shipY - this.y;
          var td = Math.sqrt(tdx * tdx + tdy * tdy);
          if (td > 10) {
            this.x += (tdx / td) * 50 * dt2;
            this.y += (tdy / td) * 50 * dt2;
          }
          if (td > 900) this.active = false;
          // Shoot at player
          this.shootTimer -= dt2;
          if (this.shootTimer <= 0 && td < 400) {
            this.shootTimer = 2 + Math.random();
            Game.EntityManager.add('particles', {
              x: this.x, y: this.y, radius: 4, active: true,
              vx: (tdx / td) * 200, vy: (tdy / td) * 200, life: 2,
              color: '#f44336', isEnemyBullet: true,
              update: function(dt3) {
                this.x += this.vx * dt3; this.y += this.vy * dt3;
                this.life -= dt3; if (this.life <= 0) this.active = false;
              },
              render: function(ctx2, ox, oy) {
                ctx2.fillStyle = this.color;
                ctx2.fillRect(this.x - (ox||0) - 3, this.y - (oy||0) - 3, 6, 6);
              }
            });
          }
        },
        render: function(ctx2, ox, oy) {
          Game.Pixel.drawCentered(ctx2, Game.Sprites.enemyShip, this.x - (ox||0), this.y - (oy||0), 3);
        },
        takeDamage: function(dmg) {
          this.hp -= dmg;
          if (this.hp <= 0) {
            this.active = false;
            Game.spawnParticles(this.x, this.y, 10, '#ff6b35', 1);
            Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, this.coinDrop));
            Game.addFloatingText('+' + this.coinDrop, this.x, this.y - 15, '#ffd700');
            if (Game.Audio) Game.Audio.sfx.explosion();
            if (Game.Combo) Game.Combo.add();
            // Drop ammo
            if (Math.random() < 0.4) {
              Game.saveData.ammo = Math.min((Game.saveData.maxAmmo||50), (Game.saveData.ammo||0) + 3);
              Game.addFloatingText('+3 balas', this.x, this.y - 25, '#4fc3f7', 10);
            }
          }
        }
      });
    }

    // Space monsters (rare, big, tanky)
    if (this.monsterSpawnTimer <= 0) {
      this.monsterSpawnTimer = 25 + Math.random() * 40;
      var mAngle = Math.random() * Math.PI * 2;
      var mDist = 450 + Math.random() * 200;
      var mmx = this.shipX + Math.cos(mAngle) * mDist;
      var mmy = this.shipY + Math.sin(mAngle) * mDist;
      Game.EntityManager.add('enemies', {
        x: mmx, y: mmy, radius: 30, hp: 80, active: true,
        isMonster: true, animTime: 0, shootTimer: 3,
        coinDrop: 30 + Math.floor(Math.random() * 20),
        update: function(dt2) {
          this.animTime += dt2;
          // Slowly orbit around player
          var tdx = Game.scenes.SPACE_FREE.shipX - this.x;
          var tdy = Game.scenes.SPACE_FREE.shipY - this.y;
          var td = Math.sqrt(tdx * tdx + tdy * tdy);
          if (td > 1000) this.active = false;
          // Circle around player
          var perpX = -tdy / td, perpY = tdx / td;
          this.x += (tdx / td * 20 + perpX * 40) * dt2;
          this.y += (tdy / td * 20 + perpY * 40) * dt2;
          // Shoot burst
          this.shootTimer -= dt2;
          if (this.shootTimer <= 0 && td < 500) {
            this.shootTimer = 2.5 + Math.random();
            for (var bs = 0; bs < 5; bs++) {
              var bsa = Math.PI * 2 * bs / 5;
              Game.EntityManager.add('particles', {
                x: this.x, y: this.y, radius: 4, active: true,
                vx: Math.cos(bsa) * 150, vy: Math.sin(bsa) * 150, life: 1.5,
                color: '#e040fb', isEnemyBullet: true,
                update: function(dt3) {
                  this.x += this.vx * dt3; this.y += this.vy * dt3;
                  this.life -= dt3; if (this.life <= 0) this.active = false;
                },
                render: function(ctx2, ox, oy) {
                  ctx2.fillStyle = this.color;
                  ctx2.fillRect(this.x - (ox||0) - 4, this.y - (oy||0) - 4, 8, 8);
                }
              });
            }
            if (Game.Audio) Game.Audio.sfx.hit();
          }
        },
        render: function(ctx2, ox, oy) {
          var sx2 = this.x - (ox||0), sy2 = this.y - (oy||0);
          // Monster body (pulsating)
          var pulse = 1 + Math.sin(this.animTime * 3) * 0.1;
          var r = this.radius * pulse;
          // Body
          Game.Pixel.drawCircle(ctx2, sx2, sy2, r, '#6a1b9a', 3);
          // Eye
          Game.Pixel.drawCircle(ctx2, sx2, sy2 - 5, r * 0.35, '#e040fb', 3);
          Game.Pixel.drawCircle(ctx2, sx2 + 3, sy2 - 7, r * 0.15, '#fff', 2);
          // Tentacles (simple pixel lines)
          for (var tt = 0; tt < 4; tt++) {
            var ta = this.animTime * 2 + tt * 1.57;
            var tx = sx2 + Math.cos(ta) * (r + 8);
            var ty = sy2 + Math.sin(ta) * (r + 8);
            ctx2.fillStyle = '#9c27b0';
            ctx2.fillRect(tx - 3, ty - 3, 6, 6);
            var tx2 = sx2 + Math.cos(ta) * (r + 16);
            var ty2 = sy2 + Math.sin(ta) * (r + 16);
            ctx2.fillRect(tx2 - 2, ty2 - 2, 4, 4);
          }
        },
        takeDamage: function(dmg) {
          this.hp -= dmg;
          Game.spawnParticles(this.x, this.y, 3, '#e040fb', 0.5);
          if (this.hp <= 0) {
            this.active = false;
            Game.spawnParticles(this.x, this.y, 20, '#9c27b0', 1.5);
            Game.spawnParticles(this.x, this.y, 10, '#e040fb', 1);
            Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, this.coinDrop));
            Game.addFloatingText('+' + this.coinDrop + ' BOSS!', this.x, this.y - 20, '#e040fb', 18);
            if (Game.Audio) Game.Audio.sfx.explosion();
            Game.triggerShake(10, 0.5);
            if (Game.Combo) Game.Combo.add();
          }
        }
      });
    }

    // --- COLLISION: bullets vs enemies/meteors ---
    var bullets = Game.EntityManager.bullets;
    var enemies = Game.EntityManager.enemies;
    var meteors = Game.EntityManager.meteors;

    for (var bi = bullets.length - 1; bi >= 0; bi--) {
      var bul = bullets[bi];
      if (!bul.active) continue;

      // vs meteors
      for (var mi = meteors.length - 1; mi >= 0; mi--) {
        var met = meteors[mi];
        if (!met.active) continue;
        var mdx = bul.x - met.x, mdy = bul.y - met.y;
        if (Math.sqrt(mdx * mdx + mdy * mdy) < bul.radius + met.radius) {
          bul.active = false;
          met.destroy();
          var reward = 3 + Math.floor(Math.random() * 4);
          if (met.lucky) reward *= 3;
          var mult = Game.Combo ? Game.Combo.add() : 1;
          reward = Math.floor(reward * mult);
          Game.saveData.coins += reward;
          Game.EntityManager.add('coins', Game.createCoin(met.x, met.y, reward));
          Game.addFloatingText('+' + reward, met.x, met.y - 10, met.lucky ? '#ff4081' : '#ffd700');
          if (Game.Audio) Game.Audio.sfx.explosion();
          if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
          break;
        }
      }

      // vs enemies
      for (var ei = enemies.length - 1; ei >= 0; ei--) {
        var ene = enemies[ei];
        if (!ene.active || !ene.takeDamage) continue;
        var edx = bul.x - ene.x, edy = bul.y - ene.y;
        if (Math.sqrt(edx * edx + edy * edy) < bul.radius + ene.radius) {
          bul.active = false;
          ene.takeDamage(bul.damage || 10);
          if (Game.Audio && ene.active) Game.Audio.sfx.hit();
          break;
        }
      }
    }

    // --- COLLISION: enemy bullets vs ship ---
    var particles = Game.EntityManager.particles;
    for (var pi = particles.length - 1; pi >= 0; pi--) {
      var part = particles[pi];
      if (!part.active || !part.isEnemyBullet) continue;
      var pdx2 = part.x - this.shipX, pdy2 = part.y - this.shipY;
      if (Math.sqrt(pdx2 * pdx2 + pdy2 * pdy2) < 24) {
        part.active = false;
        Game.saveData.fuel = Math.max(0, Game.saveData.fuel - 5);
        Game.triggerShake(4, 0.15);
        if (Game.Audio) Game.Audio.sfx.damage();
        Game.addFloatingText('-5 fuel', this.shipX, this.shipY - 30, '#f44336');
      }
    }

    // --- COLLISION: meteors vs ship ---
    for (var mi2 = meteors.length - 1; mi2 >= 0; mi2--) {
      var met2 = meteors[mi2];
      if (!met2.active) continue;
      var sdx = met2.x - this.shipX, sdy = met2.y - this.shipY;
      if (Math.sqrt(sdx * sdx + sdy * sdy) < met2.radius + 20) {
        met2.destroy();
        Game.saveData.fuel = Math.max(0, Game.saveData.fuel - 10);
        Game.triggerShake(6, 0.2);
        if (Game.Audio) Game.Audio.sfx.damage();
        Game.addFloatingText('-10 fuel', this.shipX, this.shipY - 30, '#f44336');
      }
    }

    // --- COLLECT COINS ---
    var coins = Game.EntityManager.coins;
    for (var ci = coins.length - 1; ci >= 0; ci--) {
      var coin = coins[ci];
      if (!coin.active) continue;
      var cdx = coin.x - this.shipX, cdy = coin.y - this.shipY;
      if (Math.sqrt(cdx * cdx + cdy * cdy) < 30) {
        Game.saveData.coins += coin.value;
        coin.active = false;
        if (Game.Audio) Game.Audio.sfx.coin();
        if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
      }
    }

    // --- WINGMEN UPDATE ---
    for (var wi = 0; wi < this.wingmen.length; wi++) {
      var wm = this.wingmen[wi];
      // Orbit around player
      wm.x = this.shipX + Math.cos(this.time * 1.5 + wm.offsetAngle) * wm.orbitDist;
      wm.y = this.shipY + Math.sin(this.time * 1.5 + wm.offsetAngle) * wm.orbitDist;
      wm.flameFrame = (wm.flameFrame + dt * 10) % 3;

      // Auto-shoot at nearest enemy
      wm.shootTimer -= dt;
      if (wm.shootTimer <= 0) {
        var nearestEnemy = null, nearestDist = 350;
        var allEnemies = Game.EntityManager.enemies.concat(Game.EntityManager.meteors);
        for (var ne = 0; ne < allEnemies.length; ne++) {
          var enemy = allEnemies[ne];
          if (!enemy.active) continue;
          var ndx = enemy.x - wm.x, ndy = enemy.y - wm.y;
          var nd = Math.sqrt(ndx * ndx + ndy * ndy);
          if (nd < nearestDist) { nearestDist = nd; nearestEnemy = enemy; }
        }
        if (nearestEnemy) {
          wm.shootTimer = 1.5 + Math.random();
          var wdx = nearestEnemy.x - wm.x, wdy = nearestEnemy.y - wm.y;
          var wd = Math.sqrt(wdx * wdx + wdy * wdy);
          Game.EntityManager.add('bullets', {
            x: wm.x, y: wm.y, vx: (wdx / wd) * 400, vy: (wdy / wd) * 400,
            radius: 3, damage: 8, color: '#81d4fa', life: 1.5, active: true,
            update: function(dt2) { this.x += this.vx * dt2; this.y += this.vy * dt2; this.life -= dt2; if (this.life <= 0) this.active = false; },
            render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x - (ox||0) - 2, this.y - (oy||0) - 2, 4, 4); }
          });
          if (Game.Audio) Game.Audio.sfx.robotShoot();
        } else {
          wm.shootTimer = 0.5;
        }
      }
    }

    // Update starfield (parallax with camera)
    this.starfield.update(dt, 'none');

    // Update particles
    Game.EntityManager.updateAll(dt);
  },

  render: function(ctx) {
    var W = Game.CANVAS_W;
    var H = Game.CANVAS_H;

    // Deep space gradient background
    var bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#020210');
    bgGrad.addColorStop(0.5, '#050518');
    bgGrad.addColorStop(1, '#0a0520');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Infinite tiling starfield (3 parallax layers)
    if (this.starfield && this.starfield.stars) {
      var layers = [0.05, 0.1, 0.2]; // parallax speeds
      for (var li = 0; li < layers.length; li++) {
        var speed = layers[li];
        var offX = (-this.camX * speed) % W;
        var offY = (-this.camY * speed) % H;
        // Ensure positive modulo
        if (offX > 0) offX -= W;
        if (offY > 0) offY -= H;

        for (var si = 0; si < this.starfield.stars.length; si++) {
          var star = this.starfield.stars[si];
          if (star.layer !== li) continue;
          var twinkle = 0.5 + Math.sin(this.time * 2 + si * 0.7) * 0.3;

          // Draw at 4 tiled positions (2x2 grid) to cover all scroll directions
          for (var tx = 0; tx < 2; tx++) {
            for (var ty = 0; ty < 2; ty++) {
              var sx = star.x + offX + tx * W;
              var sy = star.y + offY + ty * H;
              if (sx < -5 || sx > W + 5 || sy < -5 || sy > H + 5) continue;
              ctx.save();
              ctx.globalAlpha = (star.brightness || 0.7) * twinkle;
              ctx.shadowColor = star.color || '#fff';
              ctx.shadowBlur = star.size * 2;
              ctx.fillStyle = star.color || '#fff';
              ctx.beginPath();
              ctx.arc(sx, sy, star.size * 0.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }
    }

    // --- SPACE DETAILS (nebulae, galaxies, comets, dust) ---
    this.renderSpaceDetailsSmooth(ctx);

    // --- RENDER WORLD OBJECTS ---

    // Black holes
    for (var bh = 0; bh < Game.BlackHoles.length; bh++) {
      var hole = Game.BlackHoles[bh];
      var bhsx = hole.gx * this.worldScale - this.camX;
      var bhsy = hole.gy * this.worldScale - this.camY;
      if (bhsx < -200 || bhsx > W + 200 || bhsy < -200 || bhsy > H + 200) continue;

      var bhRad = hole.radius * this.worldScale * 0.3;
      // Accretion disk (smooth gradient)
      ctx.save();
      var bhGrad = ctx.createRadialGradient(bhsx, bhsy, 0, bhsx, bhsy, bhRad * 2.5);
      bhGrad.addColorStop(0, 'rgba(0,0,0,0.9)');
      bhGrad.addColorStop(0.3, 'rgba(60,0,20,0.4)');
      bhGrad.addColorStop(0.6, 'rgba(100,0,30,0.15)');
      bhGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bhGrad;
      ctx.beginPath();
      ctx.arc(bhsx, bhsy, bhRad * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Accretion ring
      ctx.save();
      ctx.globalAlpha = 0.4 + Math.sin(this.time * 2) * 0.1;
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(bhsx, bhsy, bhRad * 1.5, bhRad * 0.5, this.time * 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // Center void
      Game.Pixel.drawSmoothCircle(ctx, bhsx, bhsy, bhRad * 0.4, '#000');
      // Label
      ctx.save();
      ctx.font = '9px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#660022';
      ctx.fillText(hole.name, bhsx, bhsy + bhRad + 15);
      ctx.restore();
    }

    // Planets
    for (var p = 0; p < Game.PlanetData.length; p++) {
      var planet = Game.PlanetData[p];
      var requiredVisits = p < 5 ? 0 : (p < 10 ? 5 : 10);
      var accessible = (Game.saveData.planetsVisited || 0) >= requiredVisits;

      var psx = planet.gx * this.worldScale - this.camX;
      var psy = planet.gy * this.worldScale - this.camY;

      // Skip if off screen
      if (psx < -100 || psx > W + 100 || psy < -100 || psy > H + 100) continue;

      var planetRadius = accessible ? 35 : 15;
      var planetColor = accessible ? planet.groundColor : '#333';

      // Atmosphere glow (smooth radial)
      if (accessible) {
        ctx.save();
        var atmoGrad = ctx.createRadialGradient(psx, psy, planetRadius, psx, psy, planetRadius + 25);
        atmoGrad.addColorStop(0, (planet.skyBottom || '#334') + '40');
        atmoGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = atmoGrad;
        ctx.beginPath();
        ctx.arc(psx, psy, planetRadius + 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Rings (Saturn-like for planets 5,7,11)
      if (accessible && (p === 5 || p === 7 || p === 11)) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = '#c0a060';
        ctx.lineWidth = 2;
        for (var ri = -1; ri <= 1; ri++) {
          ctx.beginPath();
          ctx.ellipse(psx, psy, planetRadius + 16 + ri * 5, (planetRadius + 16 + ri * 5) * 0.3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Planet body (smooth gradient sphere)
      Game.Pixel.drawGradientCircle(ctx, psx, psy, planetRadius,
        accessible ? (planet.surfaceDetail || '#5cb85c') : '#555',
        planetColor);

      // Surface details (smooth)
      if (accessible) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        Game.Pixel.drawSmoothCircle(ctx, psx - 6, psy - 5, planetRadius * 0.25, planet.surfaceDetail || '#5cb85c');
        Game.Pixel.drawSmoothCircle(ctx, psx + 8, psy + 6, planetRadius * 0.15, planet.groundDark || '#2a5020');
        ctx.restore();
        // Shadow (crescent)
        ctx.save();
        ctx.globalAlpha = 0.35;
        var shadowGrad = ctx.createRadialGradient(psx + planetRadius * 0.5, psy + planetRadius * 0.3, 0, psx, psy, planetRadius);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
        shadowGrad.addColorStop(0.6, 'rgba(0,0,0,0.2)');
        shadowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(psx, psy, planetRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Orbiting moon (smooth)
      if (accessible && (p === 0 || p === 1 || p === 4 || p === 8)) {
        var moonAngle = this.time * 0.8 + p * 2;
        var moonDist = planetRadius + 22;
        var moonX = psx + Math.cos(moonAngle) * moonDist;
        var moonY = psy + Math.sin(moonAngle) * moonDist * 0.6;
        Game.Pixel.drawGradientCircle(ctx, moonX, moonY, 5, '#ddd', '#888');
      }

      // Name label
      var labelColor = p === this.nearPlanet ? '#4caf50' : (accessible ? '#ccc' : '#444');
      ctx.save();
      ctx.font = '10px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText(planet.name, psx + 1, psy + planetRadius + 17);
      ctx.fillStyle = labelColor;
      ctx.fillText(planet.name, psx, psy + planetRadius + 16);
      ctx.restore();

      // Current planet indicator (smooth ring)
      if (p === Game.saveData.currentPlanet) {
        Game.Pixel.drawSmoothRing(ctx, psx, psy, planetRadius + 8, '#4caf50', 2);
      }

      // Near planet glow
      if (p === this.nearPlanet) {
        Game.Pixel.drawGlowCircle(ctx, psx, psy, planetRadius + 5, 'rgba(76,175,80,0.15)', 20);
      }
    }

    // Particles
    Game.EntityManager.renderAll(ctx, this.camX, this.camY);

    // --- NUCLEAR EXPLOSION ---
    if (this.exploding) {
      var ex = this.explosionX - this.camX;
      var ey = this.explosionY - this.camY;
      var t = this.explosionTimer;

      // Flash (first 0.5s)
      if (t < 0.5) {
        ctx.save();
        ctx.globalAlpha = 1 - t * 2;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // Expanding shockwave ring
      var ringRadius = t * 200;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.6 - t * 0.15);
      Game.Pixel.drawRing(ctx, ex, ey, ringRadius, '#ff9800', 6, 4);
      Game.Pixel.drawRing(ctx, ex, ey, ringRadius * 0.7, '#ffeb3b', 4, 4);
      ctx.restore();

      // Mushroom cloud stem
      var stemH = Math.min(t * 80, 150);
      var stemW = 15 + t * 5;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.8 - t * 0.2);
      ctx.fillStyle = '#ff6b35';
      ctx.fillRect(ex - stemW / 2, ey - stemH, stemW, stemH);
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(ex - stemW / 2 + 3, ey - stemH, stemW - 6, stemH);

      // Mushroom cap
      var capRadius = 30 + t * 40;
      Game.Pixel.drawCircle(ctx, ex, ey - stemH, capRadius, '#f44336', 4);
      Game.Pixel.drawCircle(ctx, ex, ey - stemH - 10, capRadius * 0.7, '#ff9800', 4);
      Game.Pixel.drawCircle(ctx, ex, ey - stemH - 15, capRadius * 0.4, '#ffeb3b', 4);

      // Inner glow
      ctx.globalAlpha = Math.max(0, 0.5 - t * 0.1);
      Game.Pixel.drawCircle(ctx, ex, ey, 20 + t * 30, '#fff', 4);
      ctx.restore();

      // Text
      if (t > 1) {
        var txtAlpha = Math.min(1, (t - 1) * 2);
        ctx.save();
        ctx.globalAlpha = txtAlpha;
        Game.UI.textBold(ctx, 'NAVE DESTRUIDA!', W / 2, H / 2 - 30, 24, '#f44336', 'center');
        Game.UI.text(ctx, 'Reconstruindo...', W / 2, H / 2 + 10, 14, '#ff9800', 'center');
        ctx.restore();
      }
      return; // skip ship rendering during explosion
    }

    // --- SHIP (always centered) ---
    var shipSX = this.shipX - this.camX;
    var shipSY = this.shipY - this.camY;

    ctx.save();
    ctx.translate(shipSX, shipSY);
    ctx.rotate(this.shipAngle);

    // Smooth rocket body
    // Nose cone
    ctx.fillStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(-10, -10);
    ctx.lineTo(10, -10);
    ctx.closePath();
    ctx.fill();
    // Body
    var bodyGrad = ctx.createLinearGradient(-12, 0, 12, 0);
    bodyGrad.addColorStop(0, '#bbb');
    bodyGrad.addColorStop(0.3, '#e8e8e8');
    bodyGrad.addColorStop(0.7, '#ddd');
    bodyGrad.addColorStop(1, '#999');
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-10, -10, 20, 30);
    // Window
    ctx.fillStyle = '#1e88e5';
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#64b5f6';
    ctx.beginPath();
    ctx.arc(-1, -6, 2, 0, Math.PI * 2);
    ctx.fill();
    // Fins
    ctx.fillStyle = '#f44336';
    ctx.beginPath();
    ctx.moveTo(-10, 15);
    ctx.lineTo(-18, 25);
    ctx.lineTo(-10, 20);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(10, 15);
    ctx.lineTo(18, 25);
    ctx.lineTo(10, 20);
    ctx.closePath();
    ctx.fill();
    // Nozzle
    ctx.fillStyle = '#555';
    ctx.fillRect(-6, 20, 12, 5);

    // Flame when thrusting (smooth fire)
    var isThrusting = Game.Input.keys['ArrowUp'] || Game.Input.keys['w'] || Game.Input.keys['W'] || this.pressing.thrust;
    if (isThrusting && Game.saveData.fuel > 0) {
      var flameH = 15 + Math.random() * 10;
      var flameGrad = ctx.createLinearGradient(0, 25, 0, 25 + flameH);
      flameGrad.addColorStop(0, '#ffeb3b');
      flameGrad.addColorStop(0.4, '#ff9800');
      flameGrad.addColorStop(1, 'rgba(244,67,54,0)');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-6, 25);
      ctx.lineTo(0, 25 + flameH);
      ctx.lineTo(6, 25);
      ctx.closePath();
      ctx.fill();
      // Inner flame
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.moveTo(-3, 25);
      ctx.lineTo(0, 25 + flameH * 0.5);
      ctx.lineTo(3, 25);
      ctx.closePath();
      ctx.fill();
    }

    // Engine glow
    ctx.save();
    ctx.shadowColor = '#ff6b35';
    ctx.shadowBlur = isThrusting && Game.saveData.fuel > 0 ? 15 : 0;
    ctx.fillStyle = 'rgba(255,107,53,0.1)';
    ctx.beginPath();
    ctx.arc(0, 25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();

    // --- WINGMEN ---
    for (var wi = 0; wi < this.wingmen.length; wi++) {
      var wm = this.wingmen[wi];
      var wmsx = wm.x - this.camX;
      var wmsy = wm.y - this.camY;
      // Face toward ship center
      var wmAngle = Math.atan2(this.shipX - wm.x, -(this.shipY - wm.y));
      ctx.save();
      ctx.translate(wmsx, wmsy);
      ctx.rotate(wmAngle);
      // Small rocket (scale 2 instead of 3)
      Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, 0, 0, 2);
      Game.Pixel.drawCentered(ctx, Game.Sprites.flame[Math.floor(wm.flameFrame)], 0, 30, 2);
      ctx.restore();
    }

    // --- HUD ---
    // Fuel bar (top left)
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 120, 30);
    ctx.fillStyle = '#333';
    ctx.fillRect(14, 14, 112, 22);
    var stats = Game.getRocketStats(Game.saveData);
    var fuelPct = Math.max(0, Game.saveData.fuel / stats.maxFuel);
    ctx.fillStyle = fuelPct > 0.3 ? '#4caf50' : (fuelPct > 0.1 ? '#ff9800' : '#f44336');
    ctx.fillRect(14, 14, 112 * fuelPct, 22);
    Game.UI.text(ctx, 'FUEL ' + Math.floor(Game.saveData.fuel), 70, 22, 10, '#fff', 'center');

    // Ammo bar
    var ammo = Game.saveData.ammo || 0;
    var maxAmmo = Game.saveData.maxAmmo || 50;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 40, 120, 16);
    ctx.fillStyle = '#333';
    ctx.fillRect(14, 44, 112, 8);
    var ammoPct = ammo / maxAmmo;
    ctx.fillStyle = ammoPct > 0.3 ? '#4fc3f7' : (ammoPct > 0.1 ? '#ff9800' : '#f44336');
    ctx.fillRect(14, 44, 112 * ammoPct, 8);
    Game.UI.text(ctx, 'BALAS ' + ammo + '/' + maxAmmo, 70, 47, 8, '#fff', 'center');

    // Coins (top right)
    Game.UI.text(ctx, '' + Game.saveData.coins, W - 60, 22, 14, '#ffd700', 'center');

    // Velocimeter (analog gauge)
    var spd = Math.sqrt(this.shipVX * this.shipVX + this.shipVY * this.shipVY);
    var spdPct = Math.min(1, spd / this.maxSpeed);
    var gaugeX = W / 2, gaugeY = 40, gaugeR = 28;

    // Gauge background
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(gaugeX - gaugeR - 4, gaugeY - gaugeR - 4, gaugeR * 2 + 8, gaugeR * 2 + 20);
    Game.Pixel.drawCircle(ctx, gaugeX, gaugeY, gaugeR, '#111', 3);
    Game.Pixel.drawRing(ctx, gaugeX, gaugeY, gaugeR, '#334', 2, 2);

    // Speed arc markings
    for (var sm = 0; sm < 10; sm++) {
      var sma = -2.3 + sm * 0.5;
      var smColor = sm < 6 ? '#4caf50' : (sm < 8 ? '#ff9800' : '#f44336');
      ctx.fillStyle = smColor;
      ctx.fillRect(gaugeX + Math.cos(sma) * (gaugeR - 6), gaugeY + Math.sin(sma) * (gaugeR - 6), 3, 3);
    }

    // Needle
    var needleAngle = -2.3 + spdPct * 4.6;
    ctx.fillStyle = spdPct > 0.8 ? '#f44336' : (spdPct > 0.5 ? '#ff9800' : '#4caf50');
    for (var ni = 3; ni <= gaugeR - 8; ni += 3) {
      ctx.fillRect(gaugeX + Math.cos(needleAngle) * ni - 1, gaugeY + Math.sin(needleAngle) * ni - 1, 2, 2);
    }
    // Center dot
    ctx.fillStyle = '#fff';
    ctx.fillRect(gaugeX - 2, gaugeY - 2, 4, 4);

    // Digital readout
    Game.UI.textBold(ctx, Math.floor(spd) + '', gaugeX, gaugeY + gaugeR + 8, 10, '#fff', 'center');
    Game.UI.text(ctx, 'km/s', gaugeX, gaugeY + gaugeR + 16, 7, '#666', 'center');

    // Near planet prompt
    if (this.nearPlanet >= 0) {
      var pName = Game.PlanetData[this.nearPlanet].name;
      var blink = Math.sin(this.time * 4) > 0;
      if (blink) {
        Game.UI.textBold(ctx, '[E] Pousar em ' + pName, W / 2, H - 80, 16, '#4caf50', 'center');
      }
    }

    // Black hole warning
    if (this.blackHoleWarning) {
      var warnBlink = Math.sin(this.time * 8) > 0;
      if (warnBlink) {
        ctx.fillStyle = 'rgba(255,0,0,0.15)';
        ctx.fillRect(0, 0, W, H);
      }
      Game.UI.textBold(ctx, 'PERIGO! BURACO NEGRO!', W / 2, 60, 18, '#ff0000', 'center');
    }

    // --- COMET HALLEY ---
    if (this.activeComet) {
      var comSX = this.activeComet.x - this.camX;
      var comSY = this.activeComet.y - this.camY;
      // Tail (long trail of pixels)
      var tailLen = 15;
      var nvx = -this.activeComet.vx, nvy = -this.activeComet.vy;
      var nv = Math.sqrt(nvx*nvx+nvy*nvy);
      nvx /= nv; nvy /= nv;
      for (var ct = 1; ct <= tailLen; ct++) {
        ctx.save();
        ctx.globalAlpha = 0.6 - ct * 0.035;
        ctx.fillStyle = ct < 5 ? '#fff' : (ct < 10 ? '#aaddff' : '#4488cc');
        var ts = Math.max(2, 8 - ct * 0.4);
        ctx.fillRect(comSX + nvx * ct * 12 - ts/2, comSY + nvy * ct * 12 - ts/2, ts, ts);
        ctx.restore();
      }
      // Head (bright white/blue)
      ctx.fillStyle = '#fff';
      ctx.fillRect(comSX - 6, comSY - 6, 12, 12);
      ctx.fillStyle = '#bbddff';
      ctx.fillRect(comSX - 4, comSY - 4, 8, 8);
      ctx.fillStyle = '#4fc3f7';
      ctx.fillRect(comSX - 2, comSY - 2, 4, 4);
      // Warning text
      Game.UI.textBold(ctx, 'HALLEY', comSX, comSY - 15, 9, '#ff4444', 'center');
    }

    // --- PORTAL ---
    if (this.portalActive) {
      var porSX = this.portalX - this.camX;
      var porSY = this.portalY - this.camY;
      if (porSX > -100 && porSX < W + 100 && porSY > -100 && porSY < H + 100) {
        var porPulse = 1 + Math.sin(this.time * 3) * 0.15;
        ctx.save();
        ctx.globalAlpha = 0.3;
        Game.Pixel.drawCircle(ctx, porSX, porSY, 60 * porPulse, '#4caf50', 4);
        ctx.restore();
        Game.Pixel.drawRing(ctx, porSX, porSY, 45 * porPulse, '#69f0ae', 3, 3);
        Game.Pixel.drawRing(ctx, porSX, porSY, 35 * porPulse, '#00e676', 2, 3);
        Game.Pixel.drawCircle(ctx, porSX, porSY, 15, '#b9f6ca', 3);
        // Rotating sparkles
        for (var sp = 0; sp < 6; sp++) {
          var spa = this.time * 2 + sp * 1.047;
          ctx.fillStyle = '#4caf50';
          ctx.fillRect(porSX + Math.cos(spa) * 50 - 2, porSY + Math.sin(spa) * 50 - 2, 4, 4);
        }
        Game.UI.textBold(ctx, 'PORTAL', porSX, porSY + 55, 12, '#4caf50', 'center');
        // Proximity prompt
        var ppDist = Math.sqrt((this.shipX - this.portalX) ** 2 + (this.shipY - this.portalY) ** 2);
        if (ppDist < 120) {
          Game.UI.textBold(ctx, '[E] ENTRAR NO PORTAL', porSX, porSY - 60, 14, '#69f0ae', 'center');
        }
      }
    }

    // --- FINAL BOSS ---
    if (this.finalBossActive) {
      var fbsx = this.finalBossX - this.camX;
      var fbsy = this.finalBossY - this.camY;
      var fbPulse = 1 + Math.sin(this.time * 4) * 0.08;
      var fbR = 40 * fbPulse;

      // Aura
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(this.time * 2) * 0.05;
      Game.Pixel.drawCircle(ctx, fbsx, fbsy, fbR + 30, '#4a0072', 5);
      ctx.restore();

      // Body (dark purple core)
      Game.Pixel.drawCircle(ctx, fbsx, fbsy, fbR, '#311b92', 3);
      Game.Pixel.drawCircle(ctx, fbsx, fbsy - 5, fbR * 0.75, '#4527a0', 3);

      // Crown of horns
      var hornColors = ['#ff6f00', '#f44336', '#ff6f00'];
      for (var hi = 0; hi < 5; hi++) {
        var ha = -0.8 + hi * 0.4;
        var hx = fbsx + Math.cos(ha - 1.57) * (fbR + 5);
        var hy = fbsy + Math.sin(ha - 1.57) * (fbR + 5);
        ctx.fillStyle = hornColors[hi % 3];
        ctx.fillRect(hx - 3, hy - 8, 6, 12);
      }

      // Eyes (3 eyes!)
      var eyePhase = Math.sin(this.time * 5);
      ctx.fillStyle = eyePhase > 0 ? '#ff1744' : '#d50000';
      ctx.fillRect(fbsx - 15, fbsy - 10, 8, 8);
      ctx.fillRect(fbsx + 7, fbsy - 10, 8, 8);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(fbsx - 3, fbsy - 15, 6, 6);
      // Pupils
      ctx.fillStyle = '#000';
      ctx.fillRect(fbsx - 12, fbsy - 8, 3, 3);
      ctx.fillRect(fbsx + 10, fbsy - 8, 3, 3);
      ctx.fillRect(fbsx - 1, fbsy - 13, 3, 3);

      // Tentacles
      for (var ti = 0; ti < 6; ti++) {
        var ta2 = this.time * 1.5 + ti * 1.047;
        for (var ts = 0; ts < 3; ts++) {
          var td2 = fbR + 10 + ts * 12;
          ctx.fillStyle = ts === 0 ? '#7b1fa2' : '#9c27b0';
          ctx.fillRect(fbsx + Math.cos(ta2) * td2 - 3, fbsy + Math.sin(ta2) * td2 - 3, 6, 6);
        }
      }

      // HP bar
      var fbHpPct = this.finalBossHP / this.finalBossMaxHP;
      ctx.fillStyle = '#000';
      ctx.fillRect(fbsx - 50, fbsy - fbR - 25, 100, 8);
      ctx.fillStyle = fbHpPct > 0.5 ? '#9c27b0' : (fbHpPct > 0.25 ? '#f44336' : '#ff1744');
      ctx.fillRect(fbsx - 49, fbsy - fbR - 24, 98 * fbHpPct, 6);
      Game.UI.textBold(ctx, 'IMPERADOR DAS TREVAS', fbsx, fbsy - fbR - 32, 10, '#e040fb', 'center');
      Game.UI.text(ctx, Math.floor(this.finalBossHP) + '/' + this.finalBossMaxHP, fbsx, fbsy - fbR - 15, 8, '#fff', 'center');
    }

    // --- VICTORY SCREEN ---
    if (this.showingVictory) {
      ctx.save();
      var vAlpha = Math.min(1, this.victoryTimer * 0.5);
      ctx.globalAlpha = vAlpha * 0.7;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(1, this.victoryTimer * 0.5);

      // Emerald glow
      var emeraldPulse = 1 + Math.sin(this.time * 2) * 0.1;
      Game.Pixel.drawCircle(ctx, W/2, H/2 - 60, 30 * emeraldPulse, '#4caf50', 3);
      Game.Pixel.drawCircle(ctx, W/2, H/2 - 60, 20 * emeraldPulse, '#69f0ae', 3);
      Game.Pixel.drawCircle(ctx, W/2, H/2 - 60, 10, '#b9f6ca', 3);

      // Victory text
      Game.UI.textBold(ctx, 'VOCE VENCEU!', W/2, H/2 + 10, 32, '#ffd700', 'center');
      Game.UI.textBold(ctx, 'EXPLORADORES DA GALAXIA', W/2, H/2 + 45, 18, '#4caf50', 'center');
      Game.UI.text(ctx, 'O Imperador das Trevas foi derrotado.', W/2, H/2 + 75, 13, '#aaa', 'center');
      Game.UI.text(ctx, 'A galaxia esta em paz.', W/2, H/2 + 95, 13, '#aaa', 'center');

      if (this.victoryTimer > 3) {
        Game.UI.text(ctx, 'Moedas: ' + Game.saveData.coins + ' | Planetas: ' + (Game.saveData.planetsVisited || 0), W/2, H/2 + 130, 11, '#888', 'center');
        var blink2 = Math.sin(this.time * 3) > 0;
        if (blink2) Game.UI.textBold(ctx, 'Pressione ENTER para continuar explorando', W/2, H/2 + 160, 12, '#ffd700', 'center');
        if (Game.Input.wasPressed('Enter') || Game.Input.wasPressed(' ')) {
          this.showingVictory = false;
        }
      }
      ctx.restore();
      return; // skip other HUD during victory
    }

    // Emerald shard counter (top)
    if (Game.saveData.emeraldShards > 0 && !Game.saveData.gameCompleted) {
      var shardX = W / 2 - 50, shardY = 75;
      for (var si = 0; si < 5; si++) {
        var filled = si < Game.saveData.emeraldShards;
        ctx.fillStyle = filled ? '#4caf50' : '#1a3a1a';
        ctx.fillRect(shardX + si * 22, shardY, 16, 8);
        if (filled) {
          ctx.fillStyle = '#69f0ae';
          ctx.fillRect(shardX + si * 22 + 2, shardY + 2, 12, 4);
        }
      }
      Game.UI.text(ctx, Game.saveData.emeraldShards + '/5', shardX + 55, shardY + 12, 8, '#4caf50', 'center');
    }

    // --- MINIMAP (bottom right corner) ---
    this.renderMinimap(ctx);

    // --- ON-SCREEN CONTROL BUTTONS ---
    this.renderControls(ctx);

    // Controls hint
    Game.UI.text(ctx, 'A/D: Girar | W: Acelerar | S: Frear | ESPACO: Tiro | B: Bomba | E: Pousar | C: Cockpit',
      W / 2, H - 15, 9, 'rgba(255,255,255,0.3)', 'center');
  },

  renderCockpitOverlay: function(ctx) {
    var W = Game.CANVAS_W;
    var H = Game.CANVAS_H;
    var panelColor = '#1a1d24';
    var metalDark = '#12141a';
    var metalLight = '#2a2e38';
    var accent = '#334';
    var screenGlow = '#0a3a2a';

    // === WINDSHIELD FRAME (top trapezoid) ===
    // Top bar
    ctx.fillStyle = panelColor;
    ctx.fillRect(0, 0, W, 22);
    ctx.fillStyle = metalLight;
    ctx.fillRect(0, 20, W, 3);

    // Left pillar (angled)
    for (var py = 0; py < H; py += 3) {
      var pillarW = Math.max(0, 50 - py * 0.06);
      ctx.fillStyle = panelColor;
      ctx.fillRect(0, py, pillarW, 3);
    }
    // Right pillar (angled)
    for (var py2 = 0; py2 < H; py2 += 3) {
      var pillarW2 = Math.max(0, 50 - py2 * 0.06);
      ctx.fillStyle = panelColor;
      ctx.fillRect(W - pillarW2, py2, pillarW2, 3);
    }

    // Pillar edge highlights
    ctx.fillStyle = metalLight;
    for (var ey = 0; ey < H - 120; ey += 3) {
      var ex = 50 - ey * 0.06;
      if (ex > 2) {
        ctx.fillRect(ex - 1, ey, 2, 3);
        ctx.fillRect(W - ex - 1, ey, 2, 3);
      }
    }

    // === DASHBOARD (bottom panel) ===
    var dashY = H - 120;
    ctx.fillStyle = panelColor;
    ctx.fillRect(0, dashY, W, 120);
    // Dashboard top edge
    ctx.fillStyle = metalLight;
    ctx.fillRect(0, dashY, W, 3);
    ctx.fillStyle = accent;
    ctx.fillRect(0, dashY + 3, W, 1);

    // --- Left instrument cluster ---
    var lx = 20, ly = dashY + 10;

    // Speed gauge (circle with needle)
    ctx.fillStyle = '#111';
    ctx.fillRect(lx, ly, 50, 50);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(lx + 2, ly + 2, 46, 46);
    // Gauge markings
    ctx.fillStyle = '#334';
    for (var gm = 0; gm < 8; gm++) {
      var ga = -2.3 + gm * 0.6;
      ctx.fillRect(lx + 25 + Math.cos(ga) * 18, ly + 30 + Math.sin(ga) * 18, 3, 3);
    }
    // Needle (based on speed)
    var spd = Math.sqrt(this.shipVX * this.shipVX + this.shipVY * this.shipVY);
    var needleAngle = -2.3 + (spd / this.maxSpeed) * 4.6;
    ctx.fillStyle = '#f44336';
    ctx.fillRect(lx + 25 + Math.cos(needleAngle) * 5, ly + 30 + Math.sin(needleAngle) * 5, 2, 2);
    ctx.fillRect(lx + 25 + Math.cos(needleAngle) * 10, ly + 30 + Math.sin(needleAngle) * 10, 2, 2);
    ctx.fillRect(lx + 25 + Math.cos(needleAngle) * 15, ly + 30 + Math.sin(needleAngle) * 15, 2, 2);
    Game.UI.text(ctx, 'VEL', lx + 25, ly + 55, 7, '#556', 'center');

    // Fuel gauge
    var fx = lx + 58;
    ctx.fillStyle = '#111';
    ctx.fillRect(fx, ly, 30, 50);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(fx + 2, ly + 2, 26, 46);
    var stats = Game.getRocketStats(Game.saveData);
    var fuelPct = Math.max(0, Game.saveData.fuel / stats.maxFuel);
    var fuelBarH = 40 * fuelPct;
    var fuelColor = fuelPct > 0.3 ? '#4caf50' : (fuelPct > 0.1 ? '#ff9800' : '#f44336');
    ctx.fillStyle = fuelColor;
    ctx.fillRect(fx + 5, ly + 5 + (40 - fuelBarH), 20, fuelBarH);
    Game.UI.text(ctx, 'FUEL', fx + 15, ly + 55, 7, '#556', 'center');

    // --- Center console ---
    var cx = W / 2 - 80;
    var cy = dashY + 8;

    // Heading indicator
    ctx.fillStyle = '#111';
    ctx.fillRect(cx, cy, 60, 35);
    ctx.fillStyle = '#0a1a15';
    ctx.fillRect(cx + 2, cy + 2, 56, 31);
    var headingDeg = Math.floor(((this.shipAngle * 180 / Math.PI) % 360 + 360) % 360);
    Game.UI.textBold(ctx, headingDeg + ' DEG', cx + 30, cy + 12, 10, '#4caf50', 'center');
    Game.UI.text(ctx, 'HEADING', cx + 30, cy + 28, 7, '#334', 'center');

    // Status screen
    var sx = cx + 68;
    ctx.fillStyle = '#111';
    ctx.fillRect(sx, cy, 90, 35);
    ctx.fillStyle = '#0a1520';
    ctx.fillRect(sx + 2, cy + 2, 86, 31);
    var statusText = this.blackHoleWarning ? 'PERIGO' : (spd > 200 ? 'RAPIDO' : 'NORMAL');
    var statusColor = this.blackHoleWarning ? '#f44336' : (spd > 200 ? '#ff9800' : '#4fc3f7');
    Game.UI.textBold(ctx, statusText, sx + 45, cy + 12, 10, statusColor, 'center');
    Game.UI.text(ctx, 'STATUS', sx + 45, cy + 28, 7, '#334', 'center');

    // --- Right instruments ---
    var rx = W - 110, ry = dashY + 10;

    // HP bar
    ctx.fillStyle = '#111';
    ctx.fillRect(rx, ry, 30, 50);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(rx + 2, ry + 2, 26, 46);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(rx + 5, ry + 5, 20, 40); // always full in space free
    Game.UI.text(ctx, 'HP', rx + 15, ry + 55, 7, '#556', 'center');

    // Coins display
    ctx.fillStyle = '#111';
    ctx.fillRect(rx + 38, ry, 50, 25);
    ctx.fillStyle = '#1a1510';
    ctx.fillRect(rx + 40, ry + 2, 46, 21);
    Game.UI.textBold(ctx, '' + Game.saveData.coins, rx + 63, ry + 10, 9, '#ffd700', 'center');
    Game.UI.text(ctx, 'MOEDAS', rx + 63, ry + 22, 6, '#553', 'center');

    // --- Decorative elements ---
    // Small lights across dashboard top
    var lights = [
      { x: 130, color: this.time % 2 > 1.5 ? '#f44336' : '#440000' },
      { x: 160, color: '#4caf50' },
      { x: 190, color: this.time % 3 > 2 ? '#ff9800' : '#442200' },
      { x: W - 180, color: '#4fc3f7' },
      { x: W - 150, color: this.time % 2.5 > 2 ? '#f44336' : '#440000' },
      { x: W - 120, color: '#4caf50' }
    ];
    for (var li = 0; li < lights.length; li++) {
      ctx.fillStyle = lights[li].color;
      ctx.fillRect(lights[li].x, dashY + 5, 4, 4);
    }

    // Bolts/rivets on dashboard
    ctx.fillStyle = '#3a3e48';
    for (var bx = 10; bx < W; bx += 80) {
      ctx.fillRect(bx, dashY + 2, 3, 3);
    }

    // Center joystick hint
    ctx.fillStyle = metalLight;
    ctx.fillRect(W / 2 - 4, dashY + 50, 8, 20);
    ctx.fillStyle = '#555';
    ctx.fillRect(W / 2 - 6, dashY + 48, 12, 6);

    // Bottom row of buttons
    for (var btn = 0; btn < 6; btn++) {
      var bxx = cx + btn * 28;
      var byy = dashY + 70;
      ctx.fillStyle = btn === 2 ? '#4caf50' : (btn === 4 ? '#f44336' : '#333');
      ctx.fillRect(bxx, byy, 20, 12);
      ctx.fillStyle = '#222';
      ctx.fillRect(bxx + 1, byy + 1, 18, 10);
    }
  },

  renderSpaceDetailsSmooth: function(ctx) {
    var W = Game.CANVAS_W, H = Game.CANVAS_H;
    var cx = this.camX, cy = this.camY;

    // Nebulae (smooth radial gradients)
    var nebulaColors = ['#2a0050', '#003050', '#500030', '#003020', '#302000'];
    for (var ni = 0; ni < 6; ni++) {
      var nx = ((ni * 3571 + 1234) % 20000) - 5000;
      var ny = ((ni * 2713 + 5678) % 16000) - 3000;
      var nsx = nx - cx * 0.3;
      var nsy = ny - cy * 0.3;
      if (nsx < -300 || nsx > W + 300 || nsy < -300 || nsy > H + 300) continue;
      var nSize = 100 + (ni * 37 % 150);
      ctx.save();
      var nebGrad = ctx.createRadialGradient(nsx, nsy, 0, nsx, nsy, nSize);
      nebGrad.addColorStop(0, nebulaColors[ni % nebulaColors.length] + '30');
      nebGrad.addColorStop(0.5, nebulaColors[ni % nebulaColors.length] + '15');
      nebGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.arc(nsx, nsy, nSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Distant galaxies (soft glow points)
    for (var gi = 0; gi < 4; gi++) {
      var gx = ((gi * 4937 + 2345) % 25000) - 8000;
      var gy = ((gi * 3119 + 7890) % 20000) - 5000;
      var gsx = gx - cx * 0.15;
      var gsy = gy - cy * 0.15;
      if (gsx < -50 || gsx > W + 50 || gsy < -50 || gsy > H + 50) continue;
      Game.Pixel.drawGlowCircle(ctx, gsx, gsy, 3, 'rgba(200,220,255,0.4)', 12);
      // Spiral hint
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#aaccff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var sa = 0; sa < 15; sa++) {
        var sAngle = sa * 0.4 + this.time * 0.05;
        var sDist = 3 + sa * 1.5;
        var sdx = gsx + Math.cos(sAngle) * sDist;
        var sdy = gsy + Math.sin(sAngle) * sDist * 0.5;
        if (sa === 0) ctx.moveTo(sdx, sdy); else ctx.lineTo(sdx, sdy);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Comets (smooth trails)
    var cometSeed = Math.floor(this.time * 0.1);
    for (var ci = 0; ci < 2; ci++) {
      var cPhase = (this.time * 0.3 + ci * 5.7) % 10;
      if (cPhase > 8) continue;
      var cBaseX = ((ci * 6173 + cometSeed * 1000) % 3000) - 500;
      var cBaseY = ((ci * 4231 + cometSeed * 800) % 2000) - 500;
      var csx = cBaseX + cPhase * 120 - cx * 0.2;
      var csy = cBaseY + cPhase * 30 - cy * 0.2;
      if (csx < -100 || csx > W + 100 || csy < -50 || csy > H + 50) continue;
      // Tail gradient
      ctx.save();
      var tailGrad = ctx.createLinearGradient(csx, csy, csx - 80, csy - 20);
      tailGrad.addColorStop(0, 'rgba(200,230,255,0.5)');
      tailGrad.addColorStop(1, 'transparent');
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(csx, csy);
      ctx.lineTo(csx - 80, csy - 20);
      ctx.stroke();
      ctx.restore();
      // Head
      Game.Pixel.drawGlowCircle(ctx, csx, csy, 3, 'rgba(220,240,255,0.8)', 8);
    }
  },

  renderSpaceDetails: function(ctx) {
    var W = Game.CANVAS_W, H = Game.CANVAS_H;
    var cx = this.camX, cy = this.camY;

    // Nebulae (large colored clouds, seeded by position)
    var nebulaColors = ['#1a0030', '#002030', '#300020', '#002010', '#201000'];
    for (var ni = 0; ni < 8; ni++) {
      var nx = ((ni * 3571 + 1234) % 20000) - 5000;
      var ny = ((ni * 2713 + 5678) % 16000) - 3000;
      var nsx = nx - cx * 0.3;
      var nsy = ny - cy * 0.3;
      if (nsx < -300 || nsx > W + 300 || nsy < -200 || nsy > H + 200) continue;
      var nColor = nebulaColors[ni % nebulaColors.length];
      var nSize = 80 + (ni * 37 % 120);
      ctx.save();
      ctx.globalAlpha = 0.06 + Math.sin(this.time * 0.3 + ni) * 0.02;
      // Draw cloud as cluster of pixel circles
      Game.Pixel.drawCircle(ctx, nsx, nsy, nSize, nColor, 6);
      Game.Pixel.drawCircle(ctx, nsx + nSize * 0.4, nsy - nSize * 0.3, nSize * 0.7, nColor, 6);
      Game.Pixel.drawCircle(ctx, nsx - nSize * 0.3, nsy + nSize * 0.4, nSize * 0.6, nColor, 6);
      ctx.restore();
    }

    // Distant galaxies (small spiral shapes)
    for (var gi = 0; gi < 5; gi++) {
      var gx = ((gi * 4937 + 2345) % 25000) - 8000;
      var gy = ((gi * 3119 + 7890) % 20000) - 5000;
      var gsx = gx - cx * 0.15;
      var gsy = gy - cy * 0.15;
      if (gsx < -50 || gsx > W + 50 || gsy < -50 || gsy > H + 50) continue;
      ctx.save();
      ctx.globalAlpha = 0.15;
      // Galaxy core
      ctx.fillStyle = '#ffeedd';
      ctx.fillRect(gsx - 2, gsy - 2, 4, 4);
      // Spiral arms as scattered dots
      for (var sa = 0; sa < 12; sa++) {
        var sAngle = sa * 0.5 + this.time * 0.1;
        var sDist = 4 + sa * 2;
        var sdx = gsx + Math.cos(sAngle) * sDist;
        var sdy = gsy + Math.sin(sAngle) * sDist * 0.5;
        ctx.fillStyle = sa < 6 ? '#aaccff' : '#8899cc';
        ctx.fillRect(sdx - 1, sdy - 1, 2, 2);
      }
      ctx.restore();
    }

    // Comets (moving streaks)
    var cometSeed = Math.floor(this.time * 0.1);
    for (var ci = 0; ci < 2; ci++) {
      var cPhase = (this.time * 0.3 + ci * 5.7) % 10;
      if (cPhase > 8) continue; // comet visible 80% of time
      var cBaseX = ((ci * 6173 + cometSeed * 1000) % 3000) - 500;
      var cBaseY = ((ci * 4231 + cometSeed * 800) % 2000) - 500;
      var csx = cBaseX + cPhase * 120 - cx * 0.2;
      var csy = cBaseY + cPhase * 30 - cy * 0.2;
      if (csx < -100 || csx > W + 100 || csy < -50 || csy > H + 50) continue;
      ctx.save();
      ctx.globalAlpha = 0.5;
      // Head
      ctx.fillStyle = '#ddeeff';
      ctx.fillRect(csx - 2, csy - 2, 4, 4);
      // Tail (trailing pixels)
      for (var ct = 1; ct <= 8; ct++) {
        ctx.globalAlpha = 0.4 - ct * 0.04;
        ctx.fillStyle = ct < 4 ? '#aaddff' : '#6699cc';
        ctx.fillRect(csx - ct * 8 - 1, csy - ct * 2 - 1, 3, 2);
      }
      ctx.restore();
    }

    // Space dust clouds (faint pixel clusters)
    for (var di = 0; di < 15; di++) {
      var dx = ((di * 2851 + 4567) % 12000) - 3000;
      var dy = ((di * 1973 + 8901) % 10000) - 2000;
      var dsx = dx - cx * 0.05;
      var dsy = dy - cy * 0.05;
      if (dsx < -20 || dsx > W + 20 || dsy < -20 || dsy > H + 20) continue;
      ctx.save();
      ctx.globalAlpha = 0.04 + Math.sin(this.time * 0.2 + di) * 0.01;
      ctx.fillStyle = di % 3 === 0 ? '#443322' : (di % 3 === 1 ? '#223344' : '#332244');
      ctx.fillRect(dsx - 6, dsy - 3, 12, 6);
      ctx.fillRect(dsx - 3, dsy - 6, 6, 12);
      ctx.restore();
    }
  },

  renderMinimap: function(ctx) {
    var W = Game.CANVAS_W;
    var H = Game.CANVAS_H;
    var mapW = 160, mapH = 130;
    var mapX = W - mapW - 15;
    var mapY = H - mapH - 80; // bottom right

    // Background
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.restore();

    // Border
    ctx.fillStyle = '#334';
    ctx.fillRect(mapX, mapY, mapW, 1);
    ctx.fillRect(mapX, mapY + mapH - 1, mapW, 1);
    ctx.fillRect(mapX, mapY, 1, mapH);
    ctx.fillRect(mapX + mapW - 1, mapY, 1, mapH);

    // Label
    Game.UI.text(ctx, 'MAPA', mapX + mapW / 2, mapY + 8, 8, '#556', 'center');

    // Calculate map scale to fit all planets
    var minGX = 0, maxGX = 0, minGY = 0, maxGY = 0;
    for (var p = 0; p < Game.PlanetData.length; p++) {
      var pl = Game.PlanetData[p];
      var req = p < 5 ? 0 : (p < 10 ? 5 : 10);
      if ((Game.saveData.planetsVisited || 0) < req) continue;
      if (pl.gx < minGX) minGX = pl.gx;
      if (pl.gx > maxGX) maxGX = pl.gx;
      if (pl.gy < minGY) minGY = pl.gy;
      if (pl.gy > maxGY) maxGY = pl.gy;
    }
    var rangeX = Math.max(maxGX - minGX, 4);
    var rangeY = Math.max(maxGY - minGY, 4);
    var scale = Math.min((mapW - 30) / rangeX, (mapH - 30) / rangeY);
    var centerGX = (minGX + maxGX) / 2;
    var centerGY = (minGY + maxGY) / 2;
    var mcx = mapX + mapW / 2;
    var mcy = mapY + mapH / 2 + 5;

    // Draw black holes
    for (var bh = 0; bh < Game.BlackHoles.length; bh++) {
      var hole = Game.BlackHoles[bh];
      var bhpx = mcx + (hole.gx - centerGX) * scale;
      var bhpy = mcy + (hole.gy - centerGY) * scale;
      if (bhpx < mapX || bhpx > mapX + mapW || bhpy < mapY || bhpy > mapY + mapH) continue;
      ctx.fillStyle = '#330011';
      ctx.fillRect(bhpx - 3, bhpy - 3, 6, 6);
    }

    // Draw planets
    for (var p2 = 0; p2 < Game.PlanetData.length; p2++) {
      var planet = Game.PlanetData[p2];
      var req2 = p2 < 5 ? 0 : (p2 < 10 ? 5 : 10);
      if ((Game.saveData.planetsVisited || 0) < req2) continue;

      var ppx = mcx + (planet.gx - centerGX) * scale;
      var ppy = mcy + (planet.gy - centerGY) * scale;
      if (ppx < mapX + 2 || ppx > mapX + mapW - 2 || ppy < mapY + 2 || ppy > mapY + mapH - 2) continue;

      // Visited = bright, current = green ring
      var visited = Game.saveData.visitedPlanets && Game.saveData.visitedPlanets.indexOf(p2) >= 0;
      var dotColor = visited ? planet.groundColor : '#555';
      var dotSize = p2 === this.nearPlanet ? 5 : 3;

      ctx.fillStyle = dotColor;
      ctx.fillRect(ppx - dotSize / 2, ppy - dotSize / 2, dotSize, dotSize);

      // Current planet ring
      if (p2 === Game.saveData.currentPlanet) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(ppx - dotSize / 2 - 1, ppy - dotSize / 2 - 1, dotSize + 2, 1);
        ctx.fillRect(ppx - dotSize / 2 - 1, ppy + dotSize / 2, dotSize + 2, 1);
        ctx.fillRect(ppx - dotSize / 2 - 1, ppy - dotSize / 2, 1, dotSize + 2);
        ctx.fillRect(ppx + dotSize / 2, ppy - dotSize / 2, 1, dotSize + 2);
      }

      // Name for nearby/visited
      if (visited || p2 === this.nearPlanet) {
        Game.UI.text(ctx, planet.name, ppx, ppy + dotSize + 5, 6, '#777', 'center');
      }
    }

    // Draw ship position (blinking white dot)
    var shipMX = mcx + (this.shipX / this.worldScale - centerGX) * scale;
    var shipMY = mcy + (this.shipY / this.worldScale - centerGY) * scale;
    // Clamp to map bounds
    shipMX = Math.max(mapX + 3, Math.min(mapX + mapW - 3, shipMX));
    shipMY = Math.max(mapY + 3, Math.min(mapY + mapH - 3, shipMY));

    // Ship direction indicator (small line)
    var dirLen = 8;
    var dirX = shipMX + Math.sin(this.shipAngle) * dirLen;
    var dirY = shipMY - Math.cos(this.shipAngle) * dirLen;
    ctx.fillStyle = '#ff9800';
    // Draw direction as 2 pixel dots
    var steps = 4;
    for (var ds = 1; ds <= steps; ds++) {
      var t = ds / steps;
      var dx = shipMX + (dirX - shipMX) * t;
      var dy = shipMY + (dirY - shipMY) * t;
      ctx.fillRect(dx - 1, dy - 1, 2, 2);
    }

    // Ship dot (blinking)
    var blink = Math.sin(this.time * 6) > -0.3;
    if (blink) {
      ctx.fillStyle = '#fff';
      ctx.fillRect(shipMX - 2, shipMY - 2, 4, 4);
    }
  },

  renderControls: function(ctx) {
    var W = Game.CANVAS_W;
    var H = Game.CANVAS_H;
    var dashY = H - 120; // dashboard top
    var bs = 55; // button size (bigger for mobile)
    var gap = 6;

    // === LEFT: D-PAD (rotation + thrust/brake) ===
    var padX = 12;
    var padCY = dashY - bs - 15; // center Y of d-pad

    // Up (thrust)
    var upX = padX + bs + gap, upY = padCY - bs - gap;
    this.drawControlBtn(ctx, upX, upY, bs, '^', this.pressing.thrust);

    // Down (brake)
    var dnX = padX + bs + gap, dnY = padCY + gap;
    this.drawControlBtn(ctx, dnX, dnY, bs, 'v', this.pressing.brake);

    // Left (rotate left)
    var ltX = padX, ltY = padCY - bs / 2;
    this.drawControlBtn(ctx, ltX, ltY, bs, '<', this.pressing.left);

    // Right (rotate right)
    var rtX = padX + bs * 2 + gap * 2, rtY = padCY - bs / 2;
    this.drawControlBtn(ctx, rtX, rtY, bs, '>', this.pressing.right);

    // === RIGHT: ACTION BUTTONS ===
    var actionX = W - bs * 2 - gap - 12;
    var actionY = dashY - bs * 2 - gap - 15;

    // Shoot (top - big cyan)
    var shootActive = this.pressing.shoot;
    ctx.save();
    ctx.globalAlpha = shootActive ? 0.85 : 0.4;
    ctx.fillStyle = shootActive ? '#4fc3f7' : '#1a3a5c';
    ctx.fillRect(actionX, actionY, bs, bs);
    ctx.fillStyle = '#0d2137';
    ctx.fillRect(actionX + 2, actionY + 2, bs - 4, bs - 4);
    if (shootActive) { ctx.fillStyle = '#4fc3f7'; ctx.fillRect(actionX + 2, actionY + 2, bs - 4, bs - 4); }
    ctx.restore();
    Game.UI.textBold(ctx, 'TIRO', actionX + bs / 2, actionY + bs / 2 - 3, 12, shootActive ? '#fff' : '#4fc3f7', 'center');

    // Bomb (right of shoot)
    var bombX = actionX + bs + gap;
    var bombActive = this.pressing.bomb;
    var bombReady = this.bombCooldown <= 0 && Game.saveData.coins >= 5;
    ctx.save();
    ctx.globalAlpha = bombActive ? 0.85 : (bombReady ? 0.4 : 0.15);
    ctx.fillStyle = bombActive ? '#ff9800' : '#4a2800';
    ctx.fillRect(bombX, actionY, bs, bs);
    ctx.fillStyle = '#2a1500';
    ctx.fillRect(bombX + 2, actionY + 2, bs - 4, bs - 4);
    if (bombActive) { ctx.fillStyle = '#ff9800'; ctx.fillRect(bombX + 2, actionY + 2, bs - 4, bs - 4); }
    ctx.restore();
    Game.UI.textBold(ctx, 'BOMBA', bombX + bs / 2, actionY + bs / 2 - 6, 9, bombReady ? '#ff9800' : '#555', 'center');
    Game.UI.text(ctx, '5$', bombX + bs / 2, actionY + bs / 2 + 8, 8, bombReady ? '#ffd700' : '#333', 'center');
    if (this.bombCooldown > 0) {
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#000';
      ctx.fillRect(bombX + 2, actionY + 2, (bs - 4) * (this.bombCooldown / 3000), bs - 4);
      ctx.restore();
    }

    // === HANDLE TOUCH/MOUSE (multitouch support) ===
    this.pressing.left = false;
    this.pressing.right = false;
    this.pressing.thrust = false;
    this.pressing.brake = false;
    this.pressing.shoot = false;
    this.pressing.bomb = false;

    // Collect all active touch points (or single mouse)
    var points = [];
    var touches = Game.Input.mouse.touches;
    if (touches && touches.length > 0) {
      for (var ti = 0; ti < touches.length; ti++) points.push(touches[ti]);
    } else if (Game.Input.mouse.down) {
      points.push({ x: Game.Input.mouse.x, y: Game.Input.mouse.y });
    }

    // Check each touch point against all buttons
    var hitIn = function(px, py, bx, by, bw, bh) { return px >= bx && px <= bx + bw && py >= by && py <= by + bh; };
    for (var pi = 0; pi < points.length; pi++) {
      var px = points[pi].x, py = points[pi].y;
      if (hitIn(px, py, upX, upY, bs, bs)) this.pressing.thrust = true;
      if (hitIn(px, py, dnX, dnY, bs, bs)) this.pressing.brake = true;
      if (hitIn(px, py, ltX, ltY, bs, bs)) this.pressing.left = true;
      if (hitIn(px, py, rtX, rtY, bs, bs)) this.pressing.right = true;
      if (hitIn(px, py, actionX, actionY, bs, bs)) this.pressing.shoot = true;
      if (hitIn(px, py, bombX, actionY, bs, bs)) this.pressing.bomb = true;
    }
    // Track if mouse is on any control button (to prevent shooting when clicking controls)
    this.pressing.anyControl = this.pressing.left || this.pressing.right || this.pressing.thrust || this.pressing.brake;
  },

  drawControlBtn: function(ctx, x, y, size, label, active, id) {
    ctx.save();
    ctx.globalAlpha = active ? 0.7 : 0.3;
    ctx.fillStyle = active ? '#4caf50' : '#222';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#555';
    ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    if (active) {
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
    }
    ctx.restore();
    Game.UI.textBold(ctx, label, x + size / 2, y + size / 2 - 3, 20, active ? '#fff' : '#888', 'center');
  },

  exit: function() {
    Game.EntityManager.clear();
  }
};

// ===========================
// COCKPIT SCENE
// Interior da nave com mapa galactico, visor panoramico, robot dormindo
// ===========================
Game.scenes.COCKPIT = {
  time: 0,
  starfield: null,
  selectedPlanet: -1,
  mapZoom: 18,
  mapCenterX: 0,
  mapCenterY: 0,
  visorStars: [],
  robotSleepFrame: 0,
  alertTimer: 0,
  alertText: '',
  showUpgradeNotif: false,
  upgradeNotifTimer: 0,

  enter: function() {
    this.time = 0;
    this.starfield = new Game.Starfield(100);
    this.selectedPlanet = -1;
    this.mapCenterX = Game.PlanetData[Game.saveData.currentPlanet].gx;
    this.mapCenterY = Game.PlanetData[Game.saveData.currentPlanet].gy;

    // Generate visor stars
    this.visorStars = [];
    for (var i = 0; i < 60; i++) {
      this.visorStars.push({
        x: Math.random() * 360 + 30,
        y: Math.random() * 160 + 30,
        size: 1 + Math.random() * 2,
        speed: 10 + Math.random() * 30,
        bright: 0.3 + Math.random() * 0.7
      });
    }

    // Check ship tier upgrade
    var tier = Game.getShipTier(Game.saveData.planetsVisited || 0);
    if (tier > (Game.saveData.shipTierNotified || -1) && tier > 0) {
      this.showUpgradeNotif = true;
      this.upgradeNotifTimer = 5;
      Game.saveData.shipTierNotified = tier;
      Game.Save.save(Game.saveData);
      if (Game.Audio) Game.Audio.sfx.milestone();
    }

    if (Game.Audio && Game.Audio.initialized) Game.Audio.playPlanetMusic(Game.saveData.currentPlanet);
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt, 'left');
    this.robotSleepFrame = Math.floor(this.time * 0.5) % 3;

    // Music toggle
    if (Game.Input.wasPressed('m') || Game.Input.wasPressed('M')) {
      if (Game.Audio) Game.Audio.toggleMusic();
    }

    // Update visor stars (slow drift left)
    for (var i = 0; i < this.visorStars.length; i++) {
      var vs = this.visorStars[i];
      vs.x -= vs.speed * dt;
      if (vs.x < 30) { vs.x = 390; vs.y = Math.random() * 160 + 30; }
    }

    // Upgrade notification timer
    if (this.upgradeNotifTimer > 0) this.upgradeNotifTimer -= dt;
    if (this.upgradeNotifTimer <= 0) this.showUpgradeNotif = false;

    // Alert timer
    if (this.alertTimer > 0) this.alertTimer -= dt;

    // Handle planet selection on map via click
    if (Game.Input.mouse.clicked) {
      var mx = Game.Input.mouse.x;
      var my = Game.Input.mouse.y;

      // Map area must match renderGalaxyMap: mx=30, my=220, mw=400, mh=240
      var mapX = 30, mapY = 220, mapW = 400, mapH = 240;
      var mapContentY = mapY + 22;
      var mapContentH = mapH - 30;
      var mapCenterX = mapX + mapW / 2;
      var mapCenterY = mapContentY + mapContentH / 2;
      if (mx >= mapX && mx <= mapX + mapW && my >= mapY && my <= mapY + mapH) {
        // Check which planet was clicked
        var closestPlanet = -1;
        var closestDist = 25; // click radius
        for (var p = 0; p < Game.PlanetData.length; p++) {
          var planet = Game.PlanetData[p];
          // Check if planet is accessible (tier-based)
          var requiredVisits = p < 5 ? 0 : (p < 10 ? 5 : 10);
          if ((Game.saveData.planetsVisited || 0) < requiredVisits) continue;

          var px = mapCenterX + (planet.gx - this.mapCenterX) * this.mapZoom;
          var py = mapCenterY + (planet.gy - this.mapCenterY) * this.mapZoom;
          var dd = Math.sqrt((mx - px) * (mx - px) + (my - py) * (my - py));
          if (dd < closestDist) { closestDist = dd; closestPlanet = p; }
        }
        if (closestPlanet >= 0 && closestPlanet !== Game.saveData.currentPlanet) {
          this.selectedPlanet = closestPlanet;
          if (Game.Audio) Game.Audio.sfx.menuSelect();
        }
      }

      // "VIAJAR" button
      if (this.selectedPlanet >= 0 && this.travelBtnBounds) {
        var tb = this.travelBtnBounds;
        if (mx >= tb.x && mx <= tb.x + tb.w && my >= tb.y && my <= tb.y + tb.h) {
          this.startTravel();
        }
      }

      // "EXPLORAR" button (go to current planet surface)
      if (this.exploreBtnBounds) {
        var eb = this.exploreBtnBounds;
        if (mx >= eb.x && mx <= eb.x + eb.w && my >= eb.y && my <= eb.y + eb.h) {
          Game.changeStateImmediate(Game.States.PLANET_EXPLORE, { planetIndex: Game.saveData.currentPlanet });
          return;
        }
      }

      // "VOLTAR AO ESPACO" button
      if (this.backBtnBounds) {
        var bb = this.backBtnBounds;
        if (mx >= bb.x && mx <= bb.x + bb.w && my >= bb.y && my <= bb.y + bb.h) {
          Game.changeStateImmediate(Game.States.SPACE_FREE, { fromPlanet: Game.saveData.currentPlanet });
          return;
        }
      }
    }

    // Keyboard shortcuts
    if (Game.Input.wasPressed('Enter') && this.selectedPlanet >= 0) {
      this.startTravel();
    }
    if (Game.Input.wasPressed('e') || Game.Input.wasPressed('E')) {
      Game.changeStateImmediate(Game.States.PLANET_EXPLORE, { planetIndex: Game.saveData.currentPlanet });
      return;
    }
    if (Game.Input.wasPressed('Escape')) {
      Game.changeStateImmediate(Game.States.SPACE_FREE, { fromPlanet: Game.saveData.currentPlanet });
      return;
    }
  },

  startTravel: function() {
    // Set selected planet as target and go to SPACE_FREE positioned there
    Game.saveData.targetPlanet = this.selectedPlanet;
    Game.saveData.currentPlanet = this.selectedPlanet;
    if (Game.saveData.visitedPlanets.indexOf(this.selectedPlanet) === -1) {
      Game.saveData.visitedPlanets.push(this.selectedPlanet);
      Game.saveData.planetsVisited = Game.saveData.visitedPlanets.length;
    }
    Game.Save.save(Game.saveData);

    if (Game.Audio) Game.Audio.sfx.launch();
    Game.changeStateImmediate(Game.States.SPACE_FREE, { fromPlanet: this.selectedPlanet });
  },

  checkBlackHoleRoute: function(x1, y1, x2, y2) {
    for (var i = 0; i < Game.BlackHoles.length; i++) {
      var bh = Game.BlackHoles[i];
      // Point-to-line-segment distance
      var dx = x2 - x1, dy = y2 - y1;
      var len2 = dx * dx + dy * dy;
      if (len2 === 0) continue;
      var t = Math.max(0, Math.min(1, ((bh.gx - x1) * dx + (bh.gy - y1) * dy) / len2));
      var projX = x1 + t * dx, projY = y1 + t * dy;
      var distToBH = Math.sqrt((bh.gx - projX) * (bh.gx - projX) + (bh.gy - projY) * (bh.gy - projY));
      if (distToBH < bh.radius * 1.5) return bh;
    }
    return null;
  },

  render: function(ctx) {
    // Dark cockpit background
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    // === VISOR PANORAMICO (top area, 30-420 x 30-200) ===
    this.renderVisor(ctx);

    // === MAPA GALACTICO (left panel, 30-430 x 220-460) ===
    this.renderGalaxyMap(ctx);

    // === INFO PANEL (right side) ===
    this.renderInfoPanel(ctx);

    // (Robot removed - only appears on asteroid landings now)

    // === COCKPIT FRAME (overlay) ===
    this.renderCockpitFrame(ctx);

    // === ALERTS ===
    if (this.alertTimer > 0) {
      var blink = Math.sin(this.time * 10) > 0;
      if (blink) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, this.alertTimer);
        ctx.fillStyle = 'rgba(255,0,0,0.15)';
        ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
        Game.UI.textBold(ctx, this.alertText, Game.CANVAS_W / 2, Game.CANVAS_H / 2, 18, '#ff4444', 'center');
        ctx.restore();
      }
    }

    // === SHIP UPGRADE NOTIFICATION ===
    if (this.showUpgradeNotif) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.upgradeNotifTimer / 0.5);
      var tier = Game.ShipTiers[Game.getShipTier(Game.saveData.planetsVisited || 0)];
      Game.UI.panel(ctx, Game.CANVAS_W / 2 - 180, 10, 360, 50);
      Game.UI.textBold(ctx, 'NAVE EVOLUIU: ' + tier.name + '!', Game.CANVAS_W / 2, 25, 16, tier.color, 'center');
      Game.UI.text(ctx, 'Velocidade, fuel e HP aumentados!', Game.CANVAS_W / 2, 45, 11, '#aaa', 'center');
      ctx.restore();
    }
  },

  renderVisor: function(ctx) {
    var vx = 30, vy = 15, vw = 420, vh = 190;

    // Visor border
    ctx.fillStyle = '#111';
    ctx.fillRect(vx - 2, vy - 2, vw + 4, vh + 4);
    ctx.fillStyle = '#050510';
    ctx.fillRect(vx, vy, vw, vh);

    // Deep space (pixel color bands)
    Game.Pixel.drawColorBands(ctx, [
      { color: '#050510', ratio: 0.35 },
      { color: '#0a0a20', ratio: 0.35 },
      { color: '#050515', ratio: 0.3 }
    ], vx, vy, vw, vh);

    // Stars in visor (parallax drift)
    ctx.save();
    ctx.beginPath();
    ctx.rect(vx, vy, vw, vh);
    ctx.clip();

    for (var i = 0; i < this.visorStars.length; i++) {
      var s = this.visorStars[i];
      ctx.fillStyle = 'rgba(255,255,255,' + (s.bright * (0.7 + Math.sin(this.time * 2 + i) * 0.3)) + ')';
      ctx.fillRect(vx + s.x - vw / 2 + 200, vy + s.y - vh / 2 + 80, Math.ceil(s.size), Math.ceil(s.size));
    }

    // Target planet in visor (if selected, show it growing)
    if (this.selectedPlanet >= 0) {
      var tp = Game.PlanetData[this.selectedPlanet];
      var tpx = vx + vw / 2 + Math.sin(this.time * 0.3) * 20;
      var tpy = vy + vh / 2 + Math.cos(this.time * 0.4) * 10;
      var tpSize = 15 + Math.sin(this.time) * 3;

      // Planet glow (pixel)
      ctx.globalAlpha = 0.2;
      Game.Pixel.drawCircle(ctx, tpx, tpy, tpSize + 8, tp.groundColor, 3);

      // Planet body (pixel)
      ctx.globalAlpha = 1;
      Game.Pixel.drawCircle(ctx, tpx, tpy, tpSize, tp.groundColor, 3);

      // Surface detail (pixel)
      Game.Pixel.drawCircle(ctx, tpx - 3, tpy - 3, tpSize * 0.4, tp.groundLight, 3);
      Game.Pixel.drawCircle(ctx, tpx + 4, tpy + 4, tpSize * 0.3, tp.groundDark, 3);

      // Name
      Game.UI.textBold(ctx, tp.name, tpx, tpy + tpSize + 12, 11, '#fff', 'center');
    } else {
      // Default: show distant nebula (pixel glow)
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#9c27b0';
      ctx.fillRect(vx + vw * 0.4, vy + vh * 0.2, vw * 0.4, vh * 0.4);
      ctx.globalAlpha = 0.04;
      ctx.fillRect(vx + vw * 0.3, vy + vh * 0.1, vw * 0.6, vh * 0.6);
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Visor label
    Game.UI.text(ctx, 'VISOR PANORAMICO', vx + vw / 2, vy + vh + 3, 9, '#444', 'center');
  },

  renderGalaxyMap: function(ctx) {
    var mx = 30, my = 220, mw = 400, mh = 240;

    // Map background
    Game.UI.panel(ctx, mx, my, mw, mh);

    // Title
    Game.UI.textBold(ctx, 'MAPA GALACTICO', mx + mw / 2, my + 8, 11, '#4fc3f7', 'center');

    // Map content area
    var contentY = my + 22;
    var contentH = mh - 30;
    ctx.save();
    ctx.beginPath();
    ctx.rect(mx + 2, contentY, mw - 4, contentH);
    ctx.clip();

    var centerX = mx + mw / 2;
    var centerY = contentY + contentH / 2;

    // Grid lines (pixel)
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (var gx = -10; gx <= 10; gx++) {
      var lx = Math.floor(centerX + (gx - this.mapCenterX) * this.mapZoom);
      ctx.fillRect(lx, contentY, 1, contentH);
    }
    for (var gy = -10; gy <= 10; gy++) {
      var ly = Math.floor(centerY + (gy - this.mapCenterY) * this.mapZoom);
      ctx.fillRect(mx, ly, mw, 1);
    }

    // Draw route line (current -> selected)
    if (this.selectedPlanet >= 0) {
      var fromP = Game.PlanetData[Game.saveData.currentPlanet];
      var toP = Game.PlanetData[this.selectedPlanet];
      var fx = centerX + (fromP.gx - this.mapCenterX) * this.mapZoom;
      var fy = centerY + (fromP.gy - this.mapCenterY) * this.mapZoom;
      var tx = centerX + (toP.gx - this.mapCenterX) * this.mapZoom;
      var ty = centerY + (toP.gy - this.mapCenterY) * this.mapZoom;

      // Dashed route line (pixel dots)
      var routeDx = tx - fx, routeDy = ty - fy;
      var routeLen = Math.sqrt(routeDx * routeDx + routeDy * routeDy);
      var routeSteps = Math.floor(routeLen / 6);
      ctx.fillStyle = '#ffd700';
      for (var rd = 0; rd < routeSteps; rd++) {
        if (rd % 2 === 0) {
          var rt = rd / routeSteps;
          ctx.fillRect(Math.floor(fx + routeDx * rt), Math.floor(fy + routeDy * rt), 2, 2);
        }
      }
    }

    // Draw black holes
    for (var b = 0; b < Game.BlackHoles.length; b++) {
      var bh = Game.BlackHoles[b];
      var bhx = centerX + (bh.gx - this.mapCenterX) * this.mapZoom;
      var bhy = centerY + (bh.gy - this.mapCenterY) * this.mapZoom;

      // Accretion disk (pixel)
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(this.time * 2 + b) * 0.05;
      ctx.fillStyle = '#880000';
      ctx.fillRect(bhx - 20, bhy - 20, 40, 40);
      ctx.fillStyle = '#ff4444';
      ctx.fillRect(bhx - 10, bhy - 10, 20, 20);
      ctx.restore();

      // Black center (pixel)
      Game.Pixel.drawCircle(ctx, bhx, bhy, 4, '#000', 2);
      Game.Pixel.drawRing(ctx, bhx, bhy, 5, '#660000', 1, 2);
    }

    // Draw planets
    for (var p = 0; p < Game.PlanetData.length; p++) {
      var planet = Game.PlanetData[p];
      var requiredVisits = p < 5 ? 0 : (p < 10 ? 5 : 10);
      var accessible = (Game.saveData.planetsVisited || 0) >= requiredVisits;
      var visited = Game.saveData.visitedPlanets && Game.saveData.visitedPlanets.indexOf(p) !== -1;
      var isCurrent = p === Game.saveData.currentPlanet;
      var isSelected = p === this.selectedPlanet;

      var ppx = centerX + (planet.gx - this.mapCenterX) * this.mapZoom;
      var ppy = centerY + (planet.gy - this.mapCenterY) * this.mapZoom;

      if (ppx < mx - 10 || ppx > mx + mw + 10 || ppy < contentY - 10 || ppy > contentY + contentH + 10) continue;

      var dotSize = isCurrent ? 7 : (isSelected ? 6 : (accessible ? 5 : 3));

      if (!accessible) {
        // Locked planet - dim (pixel)
        ctx.globalAlpha = 0.25;
        Game.Pixel.drawCircle(ctx, ppx, ppy, dotSize, '#555', 2);
        ctx.globalAlpha = 1;
        continue;
      }

      // Selection ring (pixel)
      if (isSelected) {
        Game.Pixel.drawRing(ctx, ppx, ppy, dotSize + 4 + Math.sin(this.time * 4) * 2, '#ffd700', 2, 2);
      }

      // Current planet ring (pixel)
      if (isCurrent) {
        Game.Pixel.drawRing(ctx, ppx, ppy, dotSize + 3, '#4caf50', 2, 2);
      }

      // Planet dot (pixel)
      Game.Pixel.drawCircle(ctx, ppx, ppy, dotSize, planet.groundColor, 2);

      // Visited marker
      if (visited && !isCurrent) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(ppx - 1, ppy - dotSize - 4, 2, 2);
      }

      // Name label
      ctx.fillStyle = isSelected ? '#ffd700' : (isCurrent ? '#4caf50' : '#888');
      ctx.font = (isSelected || isCurrent ? 'bold ' : '') + '8px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(planet.name, ppx, ppy + dotSize + 9);
    }

    ctx.restore();

    // Map legend
    Game.UI.text(ctx, 'Clique em um planeta para selecionar destino', mx + mw / 2, my + mh - 6, 8, '#444', 'center');
  },

  renderInfoPanel: function(ctx) {
    var ix = 460, iy = 15, iw = 470, ih = 450;

    // Ship info
    var tier = Game.ShipTiers[Game.getShipTier(Game.saveData.planetsVisited || 0)];
    var stats = Game.getRocketStats(Game.saveData);
    var planet = Game.PlanetData[Game.saveData.currentPlanet];

    // Current location
    Game.UI.textBold(ctx, 'Estacao: ' + planet.name, ix + 10, iy + 5, 13, '#4caf50');

    // Ship name
    Game.UI.textBold(ctx, 'Nave: ' + tier.name, ix + 10, iy + 25, 12, tier.color);

    // Stats
    Game.UI.text(ctx, 'Vel: ' + Math.floor(stats.speed) + ' | Fuel: ' + Math.ceil(Game.saveData.fuel) + '/' + Math.floor(stats.maxFuel), ix + 10, iy + 45, 10, '#aaa');
    Game.UI.text(ctx, 'HP: ' + Math.floor(stats.maxHp) + ' | Escudo: ' + Math.floor(stats.damageReduction * 100) + '%', ix + 10, iy + 60, 10, '#aaa');

    // Coins
    var coinFrame = Math.floor(this.time * 6) % 4;
    Game.Pixel.draw(ctx, Game.Sprites.coin[coinFrame], ix + 10, iy + 78, 3);
    Game.UI.textBold(ctx, '' + Game.saveData.coins, ix + 30, iy + 78, 14, '#ffd700');

    // Planets visited
    Game.UI.text(ctx, 'Planetas visitados: ' + (Game.saveData.planetsVisited || 0) + '/' + Game.PlanetData.length, ix + 10, iy + 100, 10, '#888');

    // Selected planet info
    if (this.selectedPlanet >= 0) {
      var sp = Game.PlanetData[this.selectedPlanet];
      var dy = iy + 125;

      Game.UI.panel(ctx, ix, dy, iw - 10, 100);
      Game.UI.textBold(ctx, 'Destino: ' + sp.name, ix + 15, dy + 10, 14, '#ffd700');
      Game.UI.text(ctx, 'Gravidade: ' + sp.gravity.toFixed(1) + 'x', ix + 15, dy + 30, 11, '#aaa');
      Game.UI.text(ctx, 'Distancia: ' + sp.distance + 'm', ix + 15, dy + 45, 11, '#aaa');
      Game.UI.text(ctx, 'Preco fuel: ' + sp.fuelPrice + '$/u', ix + 15, dy + 60, 11, '#aaa');

      // Tier requirement
      var reqVisits = this.selectedPlanet < 5 ? 0 : (this.selectedPlanet < 10 ? 5 : 10);
      if (reqVisits > 0) {
        var tierName = reqVisits >= 10 ? 'Tier 3' : 'Tier 2';
        Game.UI.text(ctx, 'Requer: ' + tierName + ' (' + reqVisits + ' planetas)', ix + 15, dy + 78, 10, '#ff9800');
      }

      // Check for black hole on route
      var from = Game.PlanetData[Game.saveData.currentPlanet];
      var bhHit = this.checkBlackHoleRoute(from.gx, from.gy, sp.gx, sp.gy);
      if (bhHit) {
        Game.UI.textBold(ctx, 'AVISO: Buraco negro na rota!', ix + 200, dy + 10, 11, '#ff4444');
      }

      // Travel button
      var travelBtnX = ix + 20, travelBtnY = dy + 110, travelBtnW = 180, travelBtnH = 40;
      var canTravel = Game.saveData.fuel > 0;
      var travelHovered = Game.UI.isMouseInRect(travelBtnX, travelBtnY, travelBtnW, travelBtnH);
      Game.UI.button(ctx, canTravel ? 'VIAJAR (Enter)' : 'SEM FUEL', travelBtnX, travelBtnY, travelBtnW, travelBtnH,
        travelHovered && canTravel, canTravel ? '#ffd700' : '#660000');
      this.travelBtnBounds = { x: travelBtnX, y: travelBtnY, w: travelBtnW, h: travelBtnH };
    } else {
      this.travelBtnBounds = null;
    }

    // Explore current planet button
    var expBtnX = ix + 20, expBtnY = ih - 70, expBtnW = 180, expBtnH = 35;
    var expHovered = Game.UI.isMouseInRect(expBtnX, expBtnY, expBtnW, expBtnH);
    Game.UI.button(ctx, 'EXPLORAR (E)', expBtnX, expBtnY, expBtnW, expBtnH, expHovered, '#4caf50');
    this.exploreBtnBounds = { x: expBtnX, y: expBtnY, w: expBtnW, h: expBtnH };

    // Back to space button
    var backBtnX = ix + 20, backBtnY = ih - 30, backBtnW = 180, backBtnH = 35;
    var backHovered = Game.UI.isMouseInRect(backBtnX, backBtnY, backBtnW, backBtnH);
    Game.UI.button(ctx, 'VOLTAR AO ESPACO (ESC)', backBtnX, backBtnY, backBtnW, backBtnH, backHovered, '#ff9800');
    this.backBtnBounds = { x: backBtnX, y: backBtnY, w: backBtnW, h: backBtnH };

    // Controls
    Game.UI.text(ctx, 'E: Explorar | ESC: Voltar ao espaco | M: Musica', ix + 10, ih + 10, 9, '#444');
  },

  renderSleepingRobot: function(ctx) {
    if (!Game.saveData.hasRobot) return;

    var rx = 850, ry = 420;

    // Robot sprite
    Game.Pixel.drawCentered(ctx, Game.Sprites.robot, rx, ry, 3);

    // Sleeping Z's
    var zFrames = ['z', 'zZ', 'zZz'];
    var zText = zFrames[this.robotSleepFrame];
    ctx.save();
    ctx.globalAlpha = 0.5 + Math.sin(this.time * 2) * 0.3;
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(zText, rx + 12, ry - 15 - Math.sin(this.time) * 5);
    ctx.restore();

    Game.UI.text(ctx, 'Robo descansando...', rx, ry + 20, 8, '#555', 'center');
  },

  renderCockpitFrame: function(ctx) {
    // Top bar (instruments)
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, 0, Game.CANVAS_W, 12);

    // Instrument dots
    var instruments = ['#4caf50', '#f44336', '#ffd700', '#4fc3f7', '#ff9800'];
    for (var i = 0; i < instruments.length; i++) {
      var blink = Math.sin(this.time * (2 + i * 0.5) + i) > 0.3;
      ctx.fillStyle = blink ? instruments[i] : '#333';
      ctx.fillRect(10 + i * 25, 4, 6, 4);
    }

    // Ship name in top bar
    var tier = Game.ShipTiers[Game.getShipTier(Game.saveData.planetsVisited || 0)];
    Game.UI.text(ctx, tier.name, Game.CANVAS_W / 2, 1, 9, tier.color, 'center');

    // Bottom bar
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(0, Game.CANVAS_H - 15, Game.CANVAS_W, 15);
    Game.UI.text(ctx, 'EXPLORADORES DA GALAXIA', Game.CANVAS_W / 2, Game.CANVAS_H - 13, 10, '#333', 'center');
  },

  exit: function() {}
};

// ===========================
// REPAIR PUZZLE (Among Us style)
// ===========================
Game.RepairPuzzle = {
  active: false,
  type: 'wires', // 'wires' or 'simon'
  wires: [],
  selected: -1,
  connections: [],
  solved: 0,
  totalWires: 4,
  colors: ['#f44336', '#4caf50', '#4fc3f7', '#ffeb3b'],
  rightSide: [],
  onComplete: null,

  // Simon Says
  simonSequence: [],
  simonInput: [],
  simonStep: 0,
  simonShowing: true,
  simonShowTimer: 0,
  simonShowIdx: 0,
  simonColors: ['#f44336', '#4caf50', '#4fc3f7', '#ffeb3b'],
  simonFlash: -1,

  start: function(callback) {
    this.active = true;
    this.onComplete = callback;

    if (Math.random() < 0.5) {
      this.startWires();
    } else {
      this.startSimon();
    }
  },

  startWires: function() {
    this.type = 'wires';
    this.solved = 0;
    this.selected = -1;
    this.connections = [];
    // Shuffle right side
    this.rightSide = [0, 1, 2, 3];
    for (var i = this.rightSide.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = this.rightSide[i];
      this.rightSide[i] = this.rightSide[j];
      this.rightSide[j] = tmp;
    }
  },

  startSimon: function() {
    this.type = 'simon';
    this.simonSequence = [];
    this.simonInput = [];
    this.simonStep = 0;
    this.simonShowing = true;
    this.simonShowTimer = 0;
    this.simonShowIdx = 0;
    this.simonFlash = -1;
    // Generate sequence of 5
    for (var i = 0; i < 5; i++) {
      this.simonSequence.push(Math.floor(Math.random() * 4));
    }
  },

  update: function(dt) {
    if (!this.active) return;

    if (Game.Input.wasPressed('Escape')) {
      this.active = false;
      Game.subState = Game.SubStates.NONE;
      return;
    }

    if (this.type === 'wires') {
      this.updateWires(dt);
    } else {
      this.updateSimon(dt);
    }
  },

  updateWires: function(dt) {
    if (!Game.Input.mouse.clicked) return;
    var mx = Game.Input.mouse.x;
    var my = Game.Input.mouse.y;

    var panelX = (Game.CANVAS_W - 400) / 2;
    var panelY = (Game.CANVAS_H - 300) / 2;

    // Left side dots
    for (var i = 0; i < 4; i++) {
      var ly = panelY + 80 + i * 55;
      var lx = panelX + 60;
      if (Math.abs(mx - lx) < 20 && Math.abs(my - ly) < 20) {
        // Check if already connected
        var alreadyConnected = false;
        for (var c = 0; c < this.connections.length; c++) {
          if (this.connections[c].left === i) alreadyConnected = true;
        }
        if (!alreadyConnected) this.selected = i;
      }
    }

    // Right side dots
    if (this.selected >= 0) {
      for (var r = 0; r < 4; r++) {
        var ry = panelY + 80 + r * 55;
        var rx = panelX + 340;
        if (Math.abs(mx - rx) < 20 && Math.abs(my - ry) < 20) {
          // Check if correct match
          if (this.rightSide[r] === this.selected) {
            this.connections.push({ left: this.selected, right: r });
            this.solved++;
            Game.spawnParticles(rx, ry, 6, this.colors[this.selected]);
            if (this.solved >= 4) {
              this.complete();
            }
          } else {
            Game.triggerShake(3, 0.15);
          }
          this.selected = -1;
        }
      }
    }
  },

  updateSimon: function(dt) {
    if (this.simonShowing) {
      this.simonShowTimer += dt;
      if (this.simonShowTimer > 0.8) {
        this.simonShowTimer = 0;
        this.simonShowIdx++;
        if (this.simonShowIdx > this.simonSequence.length) {
          this.simonShowing = false;
          this.simonInput = [];
          this.simonFlash = -1;
        } else {
          this.simonFlash = this.simonSequence[this.simonShowIdx - 1];
        }
      }
    } else {
      this.simonFlash = -1;
      // Player input
      if (Game.Input.mouse.clicked) {
        var mx = Game.Input.mouse.x;
        var my = Game.Input.mouse.y;
        var panelX = (Game.CANVAS_W - 400) / 2;
        var panelY = (Game.CANVAS_H - 300) / 2;

        for (var i = 0; i < 4; i++) {
          var bx = panelX + 40 + i * 90;
          var by = panelY + 140;
          if (mx > bx && mx < bx + 70 && my > by && my < by + 70) {
            this.simonFlash = i;
            this.simonInput.push(i);

            var step = this.simonInput.length - 1;
            if (this.simonSequence[step] !== i) {
              // Wrong - restart showing
              Game.triggerShake(4, 0.2);
              this.simonShowing = true;
              this.simonShowTimer = 0;
              this.simonShowIdx = 0;
              this.simonInput = [];
            } else if (this.simonInput.length === this.simonSequence.length) {
              this.complete();
            }
          }
        }
      }
    }
  },

  complete: function() {
    this.active = false;
    Game.subState = Game.SubStates.NONE;
    Game.showMessage('Foguete reparado!', 2);
    Game.spawnParticles(Game.CANVAS_W / 2, Game.CANVAS_H / 2, 20, '#4caf50', 1.5);
    if (this.onComplete) this.onComplete();
  },

  render: function(ctx) {
    if (!this.active) return;

    // Dimmed background
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    var panelW = 400, panelH = 300;
    var panelX = (Game.CANVAS_W - panelW) / 2;
    var panelY = (Game.CANVAS_H - panelH) / 2;

    Game.UI.panel(ctx, panelX, panelY, panelW, panelH);

    if (this.type === 'wires') {
      this.renderWires(ctx, panelX, panelY, panelW, panelH);
    } else {
      this.renderSimon(ctx, panelX, panelY, panelW, panelH);
    }

    Game.UI.text(ctx, 'ESC para cancelar', Game.CANVAS_W / 2, panelY + panelH - 20, 10, '#555', 'center');
  },

  renderWires: function(ctx, px, py, pw, ph) {
    Game.UI.textBold(ctx, 'REPARO: Conecte os fios', Game.CANVAS_W / 2, py + 15, 16, '#4fc3f7', 'center');
    Game.UI.text(ctx, 'Clique esquerda, depois direita da mesma cor', Game.CANVAS_W / 2, py + 38, 11, '#888', 'center');

    // Draw connections (pixel line)
    for (var c = 0; c < this.connections.length; c++) {
      var conn = this.connections[c];
      var ly = py + 80 + conn.left * 55;
      var ry2c = py + 80 + conn.right * 55;
      var wireDx = (px + 340) - (px + 60), wireDy = ry2c - ly;
      var wireLen = Math.sqrt(wireDx * wireDx + wireDy * wireDy);
      var wireSteps = Math.floor(wireLen / 4);
      ctx.fillStyle = this.colors[conn.left];
      for (var ws = 0; ws <= wireSteps; ws++) {
        var wt = ws / wireSteps;
        ctx.fillRect(Math.floor(px + 60 + wireDx * wt), Math.floor(ly + wireDy * wt), 3, 3);
      }
    }

    // Left dots
    for (var i = 0; i < 4; i++) {
      var ly2 = py + 80 + i * 55;
      var isConnected = false;
      for (var cc = 0; cc < this.connections.length; cc++) {
        if (this.connections[cc].left === i) isConnected = true;
      }
      ctx.fillStyle = isConnected ? '#333' : this.colors[i];
      ctx.fillRect(px + 45, ly2 - 12, 30, 24);
      if (this.selected === i) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px + 43, ly2 - 14, 34, 28);
      }
    }

    // Right dots (shuffled colors)
    for (var r = 0; r < 4; r++) {
      var ry2 = py + 80 + r * 55;
      var isConnectedR = false;
      for (var cr = 0; cr < this.connections.length; cr++) {
        if (this.connections[cr].right === r) isConnectedR = true;
      }
      ctx.fillStyle = isConnectedR ? '#333' : this.colors[this.rightSide[r]];
      ctx.fillRect(px + 325, ry2 - 12, 30, 24);
    }
  },

  renderSimon: function(ctx, px, py, pw, ph) {
    Game.UI.textBold(ctx, 'REPARO: Repita a sequencia', Game.CANVAS_W / 2, py + 15, 16, '#4fc3f7', 'center');

    if (this.simonShowing) {
      Game.UI.text(ctx, 'Observe...', Game.CANVAS_W / 2, py + 40, 12, '#ffd700', 'center');
    } else {
      Game.UI.text(ctx, 'Sua vez! (' + this.simonInput.length + '/' + this.simonSequence.length + ')', Game.CANVAS_W / 2, py + 40, 12, '#4caf50', 'center');
    }

    // Sequence preview dots
    for (var s = 0; s < this.simonSequence.length; s++) {
      var dotX = px + pw / 2 - (this.simonSequence.length * 15) / 2 + s * 15;
      var dotFilled = this.simonShowing ? (s < this.simonShowIdx) : (s < this.simonInput.length);
      ctx.fillStyle = dotFilled ? '#4caf50' : '#333';
      ctx.fillRect(dotX, py + 60, 10, 10);
    }

    // 4 color buttons
    for (var i = 0; i < 4; i++) {
      var bx = px + 40 + i * 90;
      var by = py + 90;
      var isFlashing = this.simonFlash === i;
      var hovered = Game.UI.isMouseInRect(bx, by, 70, 70);

      ctx.fillStyle = isFlashing ? '#fff' : (hovered && !this.simonShowing ? this.simonColors[i] : this.darkenColor(this.simonColors[i]));
      ctx.fillRect(bx, by, 70, 70);
      ctx.strokeStyle = this.simonColors[i];
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, 70, 70);

      // Inner highlight
      if (isFlashing) {
        ctx.fillStyle = this.simonColors[i];
        ctx.fillRect(bx + 10, by + 10, 50, 50);
      }
    }
  },

  darkenColor: function(hex) {
    // Simple darken: parse hex and reduce
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.floor(r * 0.4);
    g = Math.floor(g * 0.4);
    b = Math.floor(b * 0.4);
    return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
  }
};

// ===========================
// FLIGHT SCENE (vertical)
// ===========================
Game.scenes.FLIGHT = {
  rocket: null,
  robot: null,
  starfield: null,
  time: 0,
  spawnTimer: 0,
  meteorSpawnRate: 1.5,
  enemySpawnRate: 4,
  enemyTimer: 0,
  eventTimer: 0,
  eventActive: null,
  reachedTarget: false,
  bgPhase: 0,
  repairPromptShown: false,
  targetPlanetIdx: -1,
  flightDistance: 5000,
  blackHole: null,
  blackHoleWarned: false,
  blackHoleSucking: false,
  blackHoleSuckTimer: 0,
  gameOverTimer: 0,

  enter: function(data) {
    data = data || {};
    this.starfield = new Game.Starfield(300);
    this.rocket = new Game.Rocket(Game.saveData);
    this.time = 0;
    this.spawnTimer = 2;
    this.enemyTimer = 5;
    this.eventTimer = 15 + Math.random() * 10;
    this.eventActive = null;
    this.reachedTarget = false;
    this.bgPhase = 0;
    this.repairPromptShown = false;
    this.blackHoleWarned = false;
    this.blackHoleSucking = false;
    this.blackHoleSuckTimer = 0;
    this.gameOverTimer = 0;

    // Flight parameters from cockpit
    this.targetPlanetIdx = data.targetPlanet !== undefined ? data.targetPlanet : (Game.saveData.currentPlanet + 1);
    this.flightDistance = data.flightDistance || 5000;
    this.blackHole = data.blackHole || null;

    // Asteroid landing
    this.largeAsteroid = null;
    this.asteroidTimer = 20 + Math.random() * 15;
    this.robotLander = null;
    this.asteroidLandPhase = 0; // 0=none, 1=descending, 2=robot working, 3=ascending

    Game.EntityManager.clear();
    if (Game.Combo) Game.Combo.reset();
    if (Game.Audio && Game.Audio.initialized) Game.Audio.playFlightMusic();
    if (Game.Audio) Game.Audio.sfx.launch();
  },

  update: function(dt) {
    this.time += dt;

    // Asteroid landing substate
    if (Game.subState === Game.SubStates.ASTEROID_LAND) {
      this.updateAsteroidLand(dt);
      return;
    }

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    // Music toggle
    if (Game.Input.wasPressed('m') || Game.Input.wasPressed('M')) {
      if (Game.Audio) Game.Audio.toggleMusic();
    }

    // Update rocket
    this.rocket.update(dt);

    // Spawn large asteroids
    if (Game.saveData.hasRobot) {
      this.asteroidTimer -= dt;
      if (this.asteroidTimer <= 0 && !this.largeAsteroid) {
        this.largeAsteroid = new Game.LargeAsteroid(
          100 + Math.random() * (Game.CANVAS_W - 200),
          -60
        );
        this.asteroidTimer = 25 + Math.random() * 15;
      }
    }

    // Update large asteroid
    if (this.largeAsteroid && this.largeAsteroid.active) {
      this.largeAsteroid.update(dt);
      // Check proximity to rocket
      var adx = this.rocket.x - this.largeAsteroid.x;
      var ady = this.rocket.y - this.largeAsteroid.y;
      var adist = Math.sqrt(adx * adx + ady * ady);
      this.largeAsteroid.landable = adist < 120;

      // Land on asteroid (S key)
      if (this.largeAsteroid.landable && (Game.Input.wasPressed('s') || Game.Input.wasPressed('S') || Game.Input.wasPressed('ArrowDown'))) {
        Game.subState = Game.SubStates.ASTEROID_LAND;
        this.asteroidLandPhase = 1; // descending
        this.largeAsteroid.landed = true;
        this.asteroidLandTimer = 0;
        if (Game.Audio) Game.Audio.sfx.parachute();
      }

      if (!this.largeAsteroid.active) this.largeAsteroid = null;
    }

    // Game over from black hole
    if (Game.subState === Game.SubStates.GAMEOVER) {
      this.gameOverTimer -= dt;
      if (this.gameOverTimer <= 0) {
        Game.subState = Game.SubStates.NONE;
        Game.changeStateImmediate(Game.States.COCKPIT);
      }
      return;
    }

    // Background phase
    var currentPlanet = Game.saveData.currentPlanet;
    var nextPlanetIdx = this.targetPlanetIdx >= 0 ? this.targetPlanetIdx : (currentPlanet + 1);
    var targetAlt = this.flightDistance;

    var altPct = this.rocket.altitude / targetAlt;

    // Black hole encounter (at 40-60% of flight)
    if (this.blackHole && !this.blackHoleSucking && altPct > 0.4 && altPct < 0.6 && !this.blackHoleWarned) {
      this.blackHoleWarned = true;
      Game.showMessage('PERIGO! PERIGO! Buraco negro ' + this.blackHole.name + '!', 4);
      if (Game.Audio) Game.Audio.sfx.warning();
      Game.triggerShake(8, 2);
    }

    // Black hole suck zone (50% of flight - must dodge through)
    if (this.blackHole && altPct > 0.48 && altPct < 0.55 && !this.blackHoleSucking) {
      // Gravitational pull toward center
      var pullStrength = 100;
      this.rocket.x += (Game.CANVAS_W / 2 - this.rocket.x) * pullStrength * dt * 0.01;
      // If player doesn't fight it, game over
      if (Math.abs(this.rocket.x - Game.CANVAS_W / 2) < 5 && altPct > 0.51) {
        this.blackHoleSucking = true;
        this.blackHoleSuckTimer = 3;
        if (Game.Audio) Game.Audio.sfx.damage();
      }
    }

    if (this.blackHoleSucking) {
      this.blackHoleSuckTimer -= dt;
      Game.triggerShake(12, 0.1);
      // Spiral effect
      this.rocket.x += Math.sin(this.time * 10) * 200 * dt;
      this.rocket.y += Math.cos(this.time * 10) * 100 * dt;
      if (this.blackHoleSuckTimer <= 0) {
        // Game over - return to cockpit
        Game.subState = Game.SubStates.GAMEOVER;
        this.gameOverTimer = 4;
        Game.showMessage('Foguete destruido pelo buraco negro!', 4);
        // Lose some coins but not all
        Game.saveData.coins = Math.floor(Game.saveData.coins * 0.7);
        Game.saveData.fuel = Math.max(10, Game.saveData.fuel * 0.5);
        Game.Save.save(Game.saveData);
        return;
      }
    }
    if (altPct < 0.15) this.bgPhase = 0;
    else if (altPct < 0.85) this.bgPhase = 1;
    else this.bgPhase = 2;

    // Starfield
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
        var met = new Game.MeteorPixel(mx, -30, speed);
        // 8% chance of lucky meteor (golden, 3x reward)
        if (Math.random() < 0.08) { met.lucky = true; }
        Game.EntityManager.add('meteors', met);
        this.spawnTimer = this.meteorSpawnRate * (0.6 + Math.random() * 0.8);
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
            // Variable rewards + combo
            var isLucky = meteors[m].lucky;
            var baseReward = 3 + Math.floor(Math.random() * 4);
            if (Math.random() < 0.05) baseReward = 15 + Math.floor(Math.random() * 10); // 5% jackpot
            if (isLucky) baseReward *= 3;
            var mult = Game.Combo ? Game.Combo.add() : 1;
            var finalReward = Math.floor(baseReward * mult);
            Game.EntityManager.add('coins', Game.createCoin(meteors[m].x, meteors[m].y, finalReward));
            Game.addFloatingText('+' + finalReward, meteors[m].x, meteors[m].y - 10, isLucky ? '#ff4081' : '#ffd700');
            if (Game.Audio) Game.Audio.sfx.explosion();
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
            if (!enemies[e].active && Game.Combo) {
              var emult = Game.Combo.add();
              var eReward = Math.floor(enemies[e].coinDrop * emult);
              Game.addFloatingText('+' + eReward, enemies[e].x, enemies[e].y - 15, '#ffd700', 16);
            }
            if (Game.Audio) Game.Audio.sfx.hit();
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
          if (Game.Audio) Game.Audio.sfx.damage();
        }
      }
    }

    // Enemy bullets vs rocket
    var particles = Game.EntityManager.particles;
    for (var p = 0; p < particles.length; p++) {
      if (particles[p].active && particles[p].isEnemyBullet) {
        var pdx = rkt.x - particles[p].x;
        var pdy = rkt.y - particles[p].y;
        if (Math.sqrt(pdx * pdx + pdy * pdy) < rkt.radius + (particles[p].radius || 4)) {
          particles[p].active = false;
          rkt.takeDamage(10);
          if (Game.Audio) Game.Audio.sfx.damage();
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
          if (Game.Audio) { coins[c].value >= 10 ? Game.Audio.sfx.coinBig() : Game.Audio.sfx.coin(); }
          if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
        }
      }
    }

    // Check if reached target planet
    if (!this.reachedTarget && this.rocket.altitude >= targetAlt && nextPlanetIdx < Game.PlanetData.length) {
      this.reachedTarget = true;
      Game.saveData.currentPlanet = nextPlanetIdx;
      if (nextPlanetIdx > Game.saveData.highestPlanet) {
        Game.saveData.highestPlanet = nextPlanetIdx;
      }
      // Track visited planets
      if (!Game.saveData.visitedPlanets) Game.saveData.visitedPlanets = [0];
      if (Game.saveData.visitedPlanets.indexOf(nextPlanetIdx) === -1) {
        Game.saveData.visitedPlanets.push(nextPlanetIdx);
        Game.saveData.planetsVisited = Game.saveData.visitedPlanets.length;
      }
      Game.saveData.fuel = this.rocket.fuel;
      Game.Save.save(Game.saveData);
      Game.showMessage('Chegou em ' + Game.PlanetData[nextPlanetIdx].name + '!', 2);
      if (Game.Audio) Game.Audio.sfx.milestone();
      Game.changeStateImmediate(Game.States.COCKPIT);
      return;
    }

    // Parachute landed
    if (this.rocket.parachute && !this.rocket.active) {
      Game.saveData.fuel = 0;
      Game.Save.save(Game.saveData);
      Game.showMessage('Fuel esgotado! Voltando para ' + Game.PlanetData[currentPlanet].name, 2);
      Game.changeStateImmediate(Game.States.COCKPIT);
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

    // Sky background (pixel color bands)
    if (this.bgPhase === 0) {
      Game.Pixel.drawColorBands(ctx, [
        { color: planet.skyTop, ratio: 0.5 },
        { color: planet.skyBottom, ratio: 0.5 }
      ], 0, 0, Game.CANVAS_W, Game.CANVAS_H);
    } else if (this.bgPhase === 2 && this.targetPlanetIdx < Game.PlanetData.length) {
      var nextPlanet = Game.PlanetData[this.targetPlanetIdx];
      Game.Pixel.drawColorBands(ctx, [
        { color: nextPlanet.skyTop, ratio: 0.5 },
        { color: nextPlanet.skyBottom, ratio: 0.5 }
      ], 0, 0, Game.CANVAS_W, Game.CANVAS_H);
    } else {
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    }

    // Stars
    this.starfield.render(ctx);

    // Ground receding
    if (this.rocket.altitude < 500 && !this.rocket.parachute) {
      var groundY = Game.CANVAS_H - 30 + this.rocket.altitude * 0.5;
      if (groundY < Game.CANVAS_H + 10) {
        ctx.fillStyle = planet.groundColor;
        ctx.fillRect(0, groundY, Game.CANVAS_W, Game.CANVAS_H - groundY + 30);
        ctx.fillStyle = planet.surfaceDetail;
        ctx.fillRect(0, groundY, Game.CANVAS_W, 3);
      }
    }

    // Entities
    Game.EntityManager.renderAll(ctx, 0, 0);

    // Rocket
    this.rocket.render(ctx);

    // Large asteroid
    if (this.largeAsteroid && this.largeAsteroid.active) {
      this.largeAsteroid.render(ctx, 0, 0);
    }

    // Event warning
    if (this.eventActive) {
      var blink = Math.sin(Game.time * 6) > 0;
      if (blink) {
        var evtText = this.eventActive.type === 'meteor_shower' ? 'CHUVA DE METEOROS' : 'FROTA INIMIGA';
        Game.UI.textBold(ctx, evtText, Game.CANVAS_W / 2, 55, 12, '#ff9800', 'center');
      }
    }

    // Asteroid landing prompt
    if (this.largeAsteroid && this.largeAsteroid.landable && !this.largeAsteroid.landed) {
      var landBlink = Math.sin(Game.time * 4) > 0;
      if (landBlink) {
        Game.UI.textBold(ctx, '[S] POUSAR NO ASTEROIDE', Game.CANVAS_W / 2, 70, 13, '#4caf50', 'center');
      }
    }

    // Combo display
    if (Game.Combo) Game.Combo.render(ctx);

    // HUD
    Game.UI.renderFlightHUD(ctx, this.rocket, Game.saveData);

    // Black hole visual
    if (this.blackHole && this.blackHoleWarned) {
      var bhProgress = this.rocket.altitude / this.flightDistance;
      if (bhProgress > 0.35 && bhProgress < 0.65) {
        var bhIntensity = 1 - Math.abs(bhProgress - 0.5) * 4;
        ctx.save();
        ctx.globalAlpha = bhIntensity * 0.4;
        // Swirling black hole (pixel)
        var bhCx = Game.CANVAS_W / 2 + Math.sin(this.time * 0.5) * 100;
        var bhCy = Game.CANVAS_H * 0.3;
        ctx.fillStyle = '#440000';
        ctx.fillRect(bhCx - 80, bhCy - 80, 160, 160);
        ctx.fillStyle = '#220000';
        ctx.fillRect(bhCx - 40, bhCy - 40, 80, 80);
        ctx.fillStyle = '#000';
        ctx.fillRect(bhCx - 15, bhCy - 15, 30, 30);

        // Accretion ring (pixel)
        var ringRadius = 60 + Math.sin(this.time * 3) * 10;
        Game.Pixel.drawRing(ctx, bhCx, bhCy, ringRadius, '#ff4444', 2, 4);
        ctx.restore();
      }
    }

    // Black hole sucking animation
    if (this.blackHoleSucking) {
      ctx.save();
      var suckAlpha = Math.min(1, (3 - this.blackHoleSuckTimer) / 3);
      ctx.globalAlpha = suckAlpha * 0.7;
      var suckSize = suckAlpha * 300;
      Game.Pixel.drawCircle(ctx, Game.CANVAS_W / 2, Game.CANVAS_H * 0.3, suckSize, '#000', 6);
      ctx.restore();
    }

    // Game over overlay
    if (Game.subState === Game.SubStates.GAMEOVER) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
      Game.UI.textBold(ctx, 'DESTRUIDO PELO BURACO NEGRO', Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 30, 24, '#ff4444', 'center');
      Game.UI.text(ctx, 'Perdeu 30% das moedas. Retornando ao cockpit...', Game.CANVAS_W / 2, Game.CANVAS_H / 2 + 10, 14, '#aaa', 'center');
      ctx.restore();
    }

    // Asteroid landing overlay
    if (Game.subState === Game.SubStates.ASTEROID_LAND) {
      this.renderAsteroidLand(ctx);
    }
  },

  // --- Asteroid Landing Logic ---
  updateAsteroidLand: function(dt) {
    this.asteroidLandTimer = (this.asteroidLandTimer || 0) + dt;
    var ast = this.largeAsteroid;

    if (this.asteroidLandPhase === 1) {
      // Descending onto asteroid
      this.rocket.x += (ast.x - this.rocket.x) * 3 * dt;
      this.rocket.y += (ast.y - 35 - this.rocket.y) * 3 * dt;
      if (this.asteroidLandTimer > 1.5) {
        this.asteroidLandPhase = 2;
        this.asteroidLandTimer = 0;
        // Create robot lander
        if (Game.saveData.hasRobot && Game.RobotLander) {
          this.robotLander = new Game.RobotLander(
            ast.x, ast.y - 15,
            ast.x + ast.resourceX,
            ast.y - 15
          );
          this.robotLander.onComplete = function() {};
          this.robotLander.start();
        } else {
          // No robot - just collect directly after a delay
          this.asteroidLandPhase = 3;
          this.asteroidLandTimer = 0;
          this.collectReward(ast);
        }
      }
    } else if (this.asteroidLandPhase === 2) {
      // Robot working
      if (this.robotLander) {
        this.robotLander.update(dt);
        if (this.robotLander.state === 'COMPLETE') {
          this.collectReward(ast);
          this.asteroidLandPhase = 3;
          this.asteroidLandTimer = 0;
        }
      }
    } else if (this.asteroidLandPhase === 3) {
      // Ascending back
      this.rocket.y -= 200 * dt;
      if (this.asteroidLandTimer > 1.2) {
        Game.subState = Game.SubStates.NONE;
        this.asteroidLandPhase = 0;
        this.largeAsteroid = null;
        this.robotLander = null;
      }
    }
  },

  collectReward: function(ast) {
    if (ast.resourceType === 'mineral') {
      var coins = 20 + Math.floor(Math.random() * 15);
      Game.saveData.coins += coins;
      Game.addFloatingText('+' + coins + ' moedas', ast.x, ast.y - 50, '#ffd700', 16);
      if (Game.Audio) Game.Audio.sfx.coinBig();
    } else {
      var fuel = 15 + Math.floor(Math.random() * 10);
      var stats = Game.getRocketStats(Game.saveData);
      Game.saveData.fuel = Math.min(Game.saveData.fuel + fuel, stats.maxFuel);
      this.rocket.fuel = Math.min(this.rocket.fuel + fuel, this.rocket.maxFuel);
      Game.addFloatingText('+' + fuel + ' fuel', ast.x, ast.y - 50, '#4fc3f7', 16);
      if (Game.Audio) Game.Audio.sfx.upgrade();
    }
    Game.saveData.asteroidsLanded = (Game.saveData.asteroidsLanded || 0) + 1;
    Game.Save.save(Game.saveData);
    if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
  },

  renderAsteroidLand: function(ctx) {
    var ast = this.largeAsteroid;
    if (!ast) return;

    // Dim background
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    ctx.restore();

    // Large asteroid centered
    Game.Pixel.drawCentered(ctx, Game.Sprites.largeAsteroid, ast.x, ast.y, 3);

    // Resource on surface
    if (this.asteroidLandPhase <= 2) {
      var resSprite = ast.resourceType === 'mineral' ? Game.Sprites.mineral : Game.Sprites.fuelCrystal;
      Game.Pixel.drawCentered(ctx, resSprite, ast.x + ast.resourceX, ast.y - 25, 3);
    }

    // Rocket
    Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, this.rocket.x, this.rocket.y, 3);

    // Robot lander
    if (this.robotLander && this.asteroidLandPhase === 2) {
      this.robotLander.render(ctx, 0, 0);
    }

    // Status text
    if (this.asteroidLandPhase === 1) {
      Game.UI.textBold(ctx, 'Pousando...', Game.CANVAS_W / 2, 30, 14, '#4caf50', 'center');
    } else if (this.asteroidLandPhase === 2) {
      Game.UI.textBold(ctx, 'Coletando recursos...', Game.CANVAS_W / 2, 30, 14, '#ffd700', 'center');
    } else if (this.asteroidLandPhase === 3) {
      Game.UI.textBold(ctx, 'Decolando!', Game.CANVAS_W / 2, 30, 14, '#ff6b35', 'center');
    }
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
  terrainWidth: 8000,
  planetIndex: 0,
  time: 0,
  shopPos: { x: 600, y: 0 },
  rocketPadPos: { x: 1200, y: 0 },
  nearShop: false,
  nearRocket: false,
  decorations: [],
  easterEggPos: null,
  nearEasterEgg: false,
  bellAnim: 0,

  enter: function(data) {
    data = data || {};
    this.planetIndex = data.planetIndex !== undefined ? data.planetIndex : Game.saveData.currentPlanet;
    Game.saveData.currentPlanet = this.planetIndex;

    this.time = 0;
    this.starfield = new Game.Starfield(100);
    this.bellAnim = 0;
    this.nearEasterEgg = false;
    this.easterEggPos = null;

    // Generate terrain
    this.terrain = Game.TerrainGenerator.generate(this.planetIndex, this.terrainWidth);

    // Place main structures spread across terrain
    this.rocketPadPos.x = Math.floor(this.terrainWidth * 0.1); // rocket pad near start
    this.rocketPadPos.y = this.terrain[this.rocketPadPos.x];
    this.shopPos.x = Math.floor(this.terrainWidth * 0.2);
    this.shopPos.y = this.terrain[this.shopPos.x];

    // Flatten terrain around structures
    this.flattenArea(this.shopPos.x - 50, this.shopPos.x + 50, this.shopPos.y);
    this.flattenArea(this.rocketPadPos.x - 50, this.rocketPadPos.x + 50, this.rocketPadPos.y);

    // --- DISCOVERABLE LOCATIONS spread across the planet ---
    this.locations = [];
    var locationTypes = ['ruins', 'cave', 'chest', 'oasis', 'temple', 'camp', 'beacon', 'wreck'];
    var numLocations = 6 + Math.floor(Math.random() * 4); // 6-9 locations
    for (var li = 0; li < numLocations; li++) {
      var lx = Math.floor(this.terrainWidth * (0.25 + li * 0.08 + Math.random() * 0.05));
      lx = Math.min(lx, this.terrainWidth - 100);
      var ly = this.terrain[Math.min(lx, this.terrain.length - 1)];
      this.flattenArea(lx - 30, lx + 30, ly);
      var locType = locationTypes[(li + this.planetIndex) % locationTypes.length];
      this.locations.push({
        x: lx, y: ly, type: locType,
        discovered: false, looted: false,
        reward: 10 + Math.floor(Math.random() * 20) + this.planetIndex * 5
      });
    }

    // Easter egg placement (far end)
    if (Game.saveData.easterEggPlanet === this.planetIndex && !Game.saveData.foundEasterEgg) {
      var eggX = Math.floor(this.terrainWidth * (0.9 + Math.random() * 0.05));
      this.easterEggPos = { x: eggX, y: this.terrain[Math.min(eggX, this.terrain.length - 1)] };
    }

    // Create astronaut near rocket pad
    this.astronaut = new Game.Astronaut(this.rocketPadPos.x, this.rocketPadPos.y - 20);

    // Camera setup
    Game.Camera.mode = 'horizontal';
    Game.Camera.setWorldBounds(this.terrainWidth, Game.CANVAS_H);
    Game.Camera.x = this.astronaut.x - Game.CANVAS_W / 2;
    Game.Camera.y = 0;

    // Decorations
    this.generateDecorations();

    Game.EntityManager.clear();
    this.nearShop = false;
    this.nearRocket = false;
    this.alienSpawnTimer = 3 + Math.random() * 5;
    this.astronaut.hp = this.astronaut.maxHp;
    this.astronaut.shootCooldown = 0;
    this.bossSpawned = false;
    this.bossDefeated = false;
    this.bossSpawnTimer = 20 + Math.random() * 15;
    this.killCount = 0;
    this._prevEnemyCount = 0;

    // Hunger starts at saved value
    if (Game.saveData.hunger === undefined) Game.saveData.hunger = 100;

    // Food items scattered on terrain
    this.foodItems = [];
    var foodTypes = ['baga', 'cogumelo', 'fruta', 'carne'];
    var numFood = 8 + Math.floor(Math.random() * 6);
    for (var fi = 0; fi < numFood; fi++) {
      var fx = 200 + Math.floor(Math.random() * (this.terrainWidth - 400));
      this.foodItems.push({
        x: fx, y: this.terrain[Math.min(fx, this.terrain.length - 1)] - 10,
        type: foodTypes[Math.floor(Math.random() * foodTypes.length)],
        hunger: 15 + Math.floor(Math.random() * 15),
        collected: false
      });
    }

    // Ammo crates scattered on terrain
    this.ammoCrates = [];
    var numCrates = 4 + Math.floor(Math.random() * 4);
    for (var aci = 0; aci < numCrates; aci++) {
      var acx = 300 + Math.floor(Math.random() * (this.terrainWidth - 600));
      this.ammoCrates.push({
        x: acx, y: this.terrain[Math.min(acx, this.terrain.length - 1)] - 10,
        collected: false,
        type: Math.random() < 0.7 ? 'ammo' : 'weapon',
        ammoAmount: 10 + Math.floor(Math.random() * 15),
        weaponType: ['shotgun', 'laser', 'missile', 'plasma'][Math.floor(Math.random() * 4)]
      });
    }

    // Rare scraps (1-3 per planet, hard to find - at edges and hidden areas)
    this.scraps = [];
    var numScraps = 1 + Math.floor(Math.random() * 2);
    for (var si = 0; si < numScraps; si++) {
      // Place scraps in hard-to-reach areas (far ends or between structures)
      var sx2 = Math.floor(this.terrainWidth * (0.6 + si * 0.15 + Math.random() * 0.1));
      sx2 = Math.min(sx2, this.terrainWidth - 100);
      this.scraps.push({
        x: sx2, y: this.terrain[Math.min(sx2, this.terrain.length - 1)] - 12,
        collected: false,
        type: ['motor', 'placa', 'bateria', 'sensor'][Math.floor(Math.random() * 4)]
      });
    }

    // Spawn initial resources
    this.resources = [];
    var numResources = 5 + Math.floor(Math.random() * 5);
    for (var ri = 0; ri < numResources; ri++) {
      var rx = 100 + Math.floor(Math.random() * (this.terrainWidth - 200));
      this.resources.push({
        x: rx, y: this.terrain[Math.min(rx, this.terrain.length - 1)] - 15,
        type: Math.random() < 0.6 ? 'mineral' : 'crystal',
        collected: false,
        value: Math.random() < 0.6 ? (5 + Math.floor(Math.random() * 10)) : (10 + Math.floor(Math.random() * 15))
      });
    }

    if (Game.Audio && Game.Audio.initialized) Game.Audio.playPlanetMusic(this.planetIndex);
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

    for (var x = 50; x < this.terrainWidth - 50; x += 60 + Math.floor(Math.random() * 120)) {
      if (Math.abs(x - this.shopPos.x) < 80 || Math.abs(x - this.rocketPadPos.x) < 80) continue;

      var groundY = this.terrain[x];
      var type = 'rock';

      if (this.planetIndex === 0) {
        type = Math.random() < 0.6 ? 'tree' : 'rock';
      } else if (this.planetIndex === 1) {
        type = Math.random() < 0.3 ? 'crater' : 'rock';
        if (x > 400 && x < 500 && Math.random() < 0.2) type = 'flag';
      } else if (this.planetIndex === 2) {
        type = Math.random() < 0.2 ? 'rover' : 'rock';
      } else if (this.planetIndex === 3) {
        type = Math.random() < 0.3 ? 'volcano' : 'rock';
      } else if (this.planetIndex === 4) {
        type = Math.random() < 0.4 ? 'crystal' : 'rock';
      }

      this.decorations.push({
        x: x, y: groundY, type: type,
        size: 0.6 + Math.random() * 0.8,
        color: Game.PlanetData[this.planetIndex].surfaceDetail
      });
    }
  },

  update: function(dt) {
    this.time += dt;
    this.starfield.update(dt, 'left');
    Game.UI.updateDialog(dt);

    // Lore display (freeze gameplay)
    if (this.showingLore) return;

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

    // Music toggle
    if (Game.Input.wasPressed('m') || Game.Input.wasPressed('M')) {
      if (Game.Audio) Game.Audio.toggleMusic();
    }

    var planet = Game.PlanetData[this.planetIndex];

    // Update astronaut
    this.astronaut.update(dt, this.terrain, planet.gravity);

    // --- HUNGER SYSTEM ---
    Game.saveData.hunger = Math.max(0, (Game.saveData.hunger || 100) - dt * 1.5); // drains over ~66 seconds
    if (Game.saveData.hunger <= 0) {
      // Starving: lose HP slowly
      this.astronaut.hp = Math.max(0, this.astronaut.hp - dt * 8);
      if (Math.floor(this.time * 2) % 4 === 0 && Math.floor((this.time - dt) * 2) % 4 !== 0) {
        Game.addFloatingText('FOME!', this.astronaut.x, this.astronaut.y - 40, '#f44336', 12);
      }
    }

    // Collect food (auto on proximity)
    if (this.foodItems) {
      for (var fi = 0; fi < this.foodItems.length; fi++) {
        var food = this.foodItems[fi];
        if (food.collected) continue;
        if (Math.abs(this.astronaut.x - food.x) < 30 && Math.abs(this.astronaut.y - food.y) < 35) {
          food.collected = true;
          Game.saveData.hunger = Math.min(100, Game.saveData.hunger + food.hunger);
          Game.addFloatingText('+' + food.hunger + ' ' + food.type, food.x, food.y - 15, '#8bc34a', 12);
          if (Game.Audio) Game.Audio.sfx.coin();
        }
      }
    }

    // Collect scraps (auto on proximity)
    if (this.scraps) {
      for (var si = 0; si < this.scraps.length; si++) {
        var scrap = this.scraps[si];
        if (scrap.collected) continue;
        if (Math.abs(this.astronaut.x - scrap.x) < 30 && Math.abs(this.astronaut.y - scrap.y) < 35) {
          scrap.collected = true;
          Game.saveData.scrapsCollected = (Game.saveData.scrapsCollected || 0) + 1;
          Game.addFloatingText('SUCATA: ' + scrap.type.toUpperCase(), scrap.x, scrap.y - 20, '#ff9800', 14);
          if (Game.Audio) Game.Audio.sfx.easterEgg();
          Game.triggerShake(3, 0.2);
          // Every 3 scraps = free random upgrade
          if (Game.saveData.scrapsCollected % 3 === 0) {
            var upKeys = ['engine', 'fuelTank', 'heatShield', 'armor', 'laser', 'nozzle'];
            var upKey = upKeys[Math.floor(Math.random() * upKeys.length)];
            if (Game.saveData.rocketParts[upKey] < 4) {
              Game.saveData.rocketParts[upKey]++;
              Game.showMessage('3 sucatas! Upgrade ' + upKey.toUpperCase() + ' montado!', 4);
            } else {
              Game.saveData.coins += 100;
              Game.showMessage('3 sucatas! +100 moedas (upgrade ja no max)', 3);
            }
          } else {
            Game.showMessage('Sucata coletada! ' + Game.saveData.scrapsCollected + '/3 para upgrade', 2);
          }
          Game.Save.save(Game.saveData);
        }
      }
    }

    // --- COLLECT AMMO CRATES ---
    if (this.ammoCrates) {
      for (var aci = 0; aci < this.ammoCrates.length; aci++) {
        var crate = this.ammoCrates[aci];
        if (crate.collected) continue;
        if (Math.abs(this.astronaut.x - crate.x) < 30 && Math.abs(this.astronaut.y - crate.y) < 35) {
          crate.collected = true;
          if (crate.type === 'ammo') {
            Game.saveData.ammo = Math.min(Game.saveData.maxAmmo || 50, (Game.saveData.ammo || 0) + crate.ammoAmount);
            Game.addFloatingText('+' + crate.ammoAmount + ' BALAS!', crate.x, crate.y - 20, '#4fc3f7', 14);
            if (Game.Audio) Game.Audio.sfx.upgrade();
          } else {
            // Weapon pickup
            if (!Game.saveData.weapons) Game.saveData.weapons = { blaster: true };
            Game.saveData.weapons[crate.weaponType] = true;
            Game.saveData.currentWeapon = crate.weaponType;
            var weaponNames = { shotgun: 'SHOTGUN', laser: 'LASER', missile: 'MISSIL', plasma: 'PLASMA' };
            Game.addFloatingText('ARMA: ' + (weaponNames[crate.weaponType] || crate.weaponType), crate.x, crate.y - 20, '#ff9800', 16);
            Game.showMessage('Nova arma: ' + (weaponNames[crate.weaponType] || crate.weaponType) + '! [Q] trocar arma', 3);
            if (Game.Audio) Game.Audio.sfx.easterEgg();
            Game.triggerShake(4, 0.3);
          }
          Game.Save.save(Game.saveData);
        }
      }
    }

    // --- SWITCH WEAPON (Q key) ---
    if (Game.Input.wasPressed('q') || Game.Input.wasPressed('Q')) {
      if (!Game.saveData.weapons) Game.saveData.weapons = { blaster: true };
      var ownedWeapons = Object.keys(Game.saveData.weapons).filter(function(w) { return Game.saveData.weapons[w]; });
      if (ownedWeapons.length > 1) {
        var curIdx = ownedWeapons.indexOf(Game.saveData.currentWeapon || 'blaster');
        Game.saveData.currentWeapon = ownedWeapons[(curIdx + 1) % ownedWeapons.length];
        Game.showMessage('Arma: ' + Game.saveData.currentWeapon.toUpperCase(), 1.5);
        if (Game.Audio) Game.Audio.sfx.menuSelect();
      }
    }

    // --- ASTRONAUT SHOOTING (SPACE key) ---
    this.astronaut.shootCooldown = (this.astronaut.shootCooldown || 0) - dt * 1000;
    var weapon = Game.saveData.currentWeapon || 'blaster';
    var weaponCooldowns = { blaster: 300, shotgun: 500, laser: 150, missile: 800, plasma: 400 };
    var weaponAmmo = { blaster: 1, shotgun: 3, laser: 1, missile: 2, plasma: 1 };
    if ((Game.Input.keys[' '] || Game.Input.mouse.down) && this.astronaut.shootCooldown <= 0 && Game.saveData.ammo >= (weaponAmmo[weapon] || 1)) {
      Game.saveData.ammo -= (weaponAmmo[weapon] || 1);
      this.astronaut.shootCooldown = weaponCooldowns[weapon] || 300;
      var bdir = this.astronaut.facing;
      var bx = this.astronaut.x + bdir * 20;
      var by = this.astronaut.y - 8;

      if (weapon === 'blaster') {
        Game.EntityManager.add('bullets', {
          x: bx, y: by, vx: bdir * 400, vy: 0, radius: 4, damage: 15,
          color: '#4fc3f7', life: 1, active: true,
          update: function(dt2) { this.x += this.vx * dt2; this.life -= dt2; if (this.life <= 0) this.active = false; },
          render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x-(ox||0)-4, this.y-(oy||0)-2, 8, 4); }
        });
      } else if (weapon === 'shotgun') {
        // 5 pellets in spread
        for (var sp = 0; sp < 5; sp++) {
          var spread = (sp - 2) * 15;
          Game.EntityManager.add('bullets', {
            x: bx, y: by + spread, vx: bdir * 350, vy: spread * 2, radius: 3, damage: 8,
            color: '#ff9800', life: 0.5, active: true,
            update: function(dt2) { this.x += this.vx * dt2; this.y += this.vy * dt2; this.life -= dt2; if (this.life <= 0) this.active = false; },
            render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x-(ox||0)-2, this.y-(oy||0)-2, 4, 4); }
          });
        }
      } else if (weapon === 'laser') {
        // Fast thin beam
        Game.EntityManager.add('bullets', {
          x: bx, y: by, vx: bdir * 800, vy: 0, radius: 3, damage: 25,
          color: '#f44336', life: 0.4, active: true,
          update: function(dt2) { this.x += this.vx * dt2; this.life -= dt2; if (this.life <= 0) this.active = false; },
          render: function(ctx2, ox, oy) { ctx2.fillStyle = this.color; ctx2.fillRect(this.x-(ox||0)-6, this.y-(oy||0)-1, 12, 2); }
        });
      } else if (weapon === 'missile') {
        // Slow but explosive
        Game.EntityManager.add('bullets', {
          x: bx, y: by, vx: bdir * 250, vy: 0, radius: 6, damage: 40,
          color: '#ff5722', life: 1.5, active: true, isMissile: true,
          update: function(dt2) {
            this.x += this.vx * dt2; this.life -= dt2;
            if (this.life <= 0) {
              this.active = false;
              Game.spawnParticles(this.x, this.y, 8, '#ff9800', 0.8);
              Game.triggerShake(3, 0.15);
            }
          },
          render: function(ctx2, ox, oy) {
            var sx = this.x-(ox||0), sy = this.y-(oy||0);
            ctx2.fillStyle = '#ff5722'; ctx2.fillRect(sx-5, sy-3, 10, 6);
            ctx2.fillStyle = '#ffeb3b'; ctx2.fillRect(sx-7, sy-2, 4, 4);
          }
        });
      } else if (weapon === 'plasma') {
        // Big slow energy ball
        Game.EntityManager.add('bullets', {
          x: bx, y: by, vx: bdir * 300, vy: 0, radius: 8, damage: 30,
          color: '#e040fb', life: 1.2, active: true, time: 0,
          update: function(dt2) { this.x += this.vx * dt2; this.time += dt2; this.life -= dt2; if (this.life <= 0) this.active = false; },
          render: function(ctx2, ox, oy) {
            var sx = this.x-(ox||0), sy = this.y-(oy||0);
            var ps = 6 + Math.sin(this.time * 8) * 2;
            ctx2.save(); ctx2.globalAlpha = 0.4;
            ctx2.fillStyle = '#e040fb'; ctx2.fillRect(sx-ps-2, sy-ps-2, ps*2+4, ps*2+4);
            ctx2.restore();
            ctx2.fillStyle = '#ce93d8'; ctx2.fillRect(sx-ps, sy-ps, ps*2, ps*2);
            ctx2.fillStyle = '#fff'; ctx2.fillRect(sx-2, sy-2, 4, 4);
          }
        });
      }
      if (Game.Audio) Game.Audio.sfx.shoot();
    }

    // --- ALIEN SPAWNING (nao spawna na Terra) ---
    this.alienSpawnTimer -= dt;
    if (this.alienSpawnTimer <= 0 && this.planetIndex > 0) {
      this.alienSpawnTimer = 4 + Math.random() * 6;
      // Multiple alien types per planet (random pick, weighted by planet)
      var alienPool = [Game.Sprites.alienGreen, Game.Sprites.alienPurple, Game.Sprites.alienRed];
      var alienSprite = alienPool[Math.floor(Math.random() * alienPool.length)];
      var alienX = this.astronaut.x + (Math.random() < 0.5 ? -1 : 1) * (300 + Math.random() * 200);
      alienX = Math.max(50, Math.min(this.terrainWidth - 50, alienX));
      var alienGroundY = this.terrain[Math.min(Math.floor(alienX), this.terrain.length - 1)];

      Game.EntityManager.add('enemies', {
        x: alienX, y: alienGroundY - 18, radius: 15, hp: 20 + this.planetIndex * 5,
        active: true, sprite: alienSprite, facing: 1, animTimer: 0,
        coinDrop: 5 + this.planetIndex * 3 + Math.floor(Math.random() * 5),
        groundY: alienGroundY,
        update: function(dt2) {
          this.animTimer += dt2;
          // Chase astronaut
          var ast = Game.scenes.PLANET_EXPLORE.astronaut;
          var dx = ast.x - this.x;
          this.facing = dx > 0 ? 1 : -1;
          if (Math.abs(dx) > 30) {
            this.x += this.facing * (40 + Game.scenes.PLANET_EXPLORE.planetIndex * 8) * dt2;
          }
          // Stay on ground
          var gx = Math.min(Math.floor(this.x), Game.scenes.PLANET_EXPLORE.terrain.length - 1);
          if (gx >= 0 && gx < Game.scenes.PLANET_EXPLORE.terrain.length) {
            this.groundY = Game.scenes.PLANET_EXPLORE.terrain[gx];
            this.y = this.groundY - 18;
          }
          // Damage astronaut on contact (wider hitbox)
          if (Math.abs(dx) < 40 && Math.abs(ast.y - this.y) < 45) {
            if (!this._hitCooldown || this._hitCooldown <= 0) {
              ast.hp = Math.max(0, ast.hp - 15);
              this._hitCooldown = 0.8;
              Game.triggerShake(4, 0.15);
              if (Game.Audio) Game.Audio.sfx.damage();
              Game.addFloatingText('-10 HP', ast.x, ast.y - 30, '#f44336');
            }
          }
          if (this._hitCooldown > 0) this._hitCooldown -= dt2;
          // Despawn if too far
          if (Math.abs(this.x - ast.x) > 800) this.active = false;
        },
        render: function(ctx2, ox, oy) {
          Game.Pixel.drawCentered(ctx2, this.sprite, this.x - (ox||0), this.y - (oy||0), 3, this.facing === -1);
        },
        takeDamage: function(dmg) {
          this.hp -= dmg;
          Game.spawnParticles(this.x, this.y, 3, '#4caf50', 0.5);
          if (this.hp <= 0) {
            this.active = false;
            Game.spawnParticles(this.x, this.y, 10, '#4caf50', 1);
            Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, this.coinDrop));
            Game.addFloatingText('+' + this.coinDrop, this.x, this.y - 20, '#ffd700');
            if (Game.Audio) Game.Audio.sfx.explosion();
            // Count kill for boss trigger
            if (Game.scenes.PLANET_EXPLORE) Game.scenes.PLANET_EXPLORE.killCount++;
            // Drop food (40% chance)
            if (Math.random() < 0.4 && Game.scenes.PLANET_EXPLORE.foodItems) {
              Game.scenes.PLANET_EXPLORE.foodItems.push({
                x: this.x, y: this.y, type: 'carne',
                hunger: 20 + Math.floor(Math.random() * 10), collected: false
              });
            }
            // Drop ammo (30% chance)
            if (Math.random() < 0.3) {
              Game.saveData.ammo = Math.min((Game.saveData.maxAmmo || 50), (Game.saveData.ammo || 0) + 5);
              Game.addFloatingText('+5 balas', this.x, this.y - 35, '#4fc3f7', 10);
            }
          }
        }
      });
    }

    // --- BULLET vs ALIEN COLLISION ---
    var bullets = Game.EntityManager.bullets;
    var enemies = Game.EntityManager.enemies;
    for (var bi = bullets.length - 1; bi >= 0; bi--) {
      var bul = bullets[bi];
      if (!bul.active) continue;
      for (var ei = enemies.length - 1; ei >= 0; ei--) {
        var ene = enemies[ei];
        if (!ene.active || !ene.takeDamage) continue;
        var edx = bul.x - ene.x, edy = bul.y - ene.y;
        if (Math.sqrt(edx * edx + edy * edy) < bul.radius + ene.radius) {
          bul.active = false;
          ene.takeDamage(bul.damage || 15);
          break;
        }
      }
    }

    // --- COLLECT COINS (walk over them) ---
    var coins = Game.EntityManager.coins;
    for (var ci = coins.length - 1; ci >= 0; ci--) {
      var coin = coins[ci];
      if (!coin.active) continue;
      var cdx = this.astronaut.x - coin.x;
      var cdy = this.astronaut.y - coin.y;
      if (Math.abs(cdx) < 35 && Math.abs(cdy) < 40) {
        Game.saveData.coins += coin.value;
        coin.active = false;
        Game.addFloatingText('+' + coin.value, coin.x, coin.y - 15, '#ffd700', 12);
        if (Game.Audio) Game.Audio.sfx.coin();
        if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
      }
    }

    // --- COLLECT RESOURCES ---
    if (this.resources) {
      for (var ri = 0; ri < this.resources.length; ri++) {
        var res = this.resources[ri];
        if (res.collected) continue;
        var rdx = this.astronaut.x - res.x;
        var rdy = this.astronaut.y - res.y;
        if (Math.abs(rdx) < 25 && Math.abs(rdy) < 30) {
          res.collected = true;
          Game.saveData.coins += res.value;
          Game.addFloatingText('+' + res.value, res.x, res.y - 15, res.type === 'mineral' ? '#ff9800' : '#4fc3f7');
          if (Game.Audio) Game.Audio.sfx.coin();
          if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
        }
      }
    }

    // --- SUPER BOSS SPAWN (only after exploring + killing aliens) ---
    var alreadyDefeatedBoss = Game.saveData.bossesDefeated && Game.saveData.bossesDefeated.indexOf(this.planetIndex) >= 0;
    if (!this.bossSpawned && !this.bossDefeated && !alreadyDefeatedBoss && this.planetIndex > 0) {
      this.bossSpawnTimer -= dt;
      // Boss requires: 5+ kills AND timer expired
      if (this.killCount >= 5 && this.bossSpawnTimer <= 0) {
        this.bossSpawned = true;
        Game.showMessage('A TERRA TREME... O GUARDIAO E SUA GUARDA APARECERAM!', 4);
        Game.triggerShake(8, 0.5);
        if (Game.Audio) Game.Audio.sfx.warning();

        // Spawn boss guards (3-4 elite aliens)
        var numGuards = 3 + Math.floor(Math.random() * 2);
        var guardSprites = [Game.Sprites.alienGreen, Game.Sprites.alienPurple, Game.Sprites.alienRed];
        for (var gi = 0; gi < numGuards; gi++) {
          var gSpawnX = this.astronaut.x + (gi % 2 === 0 ? -1 : 1) * (150 + gi * 80 + Math.random() * 50);
          gSpawnX = Math.max(50, Math.min(this.terrainWidth - 50, gSpawnX));
          var gGroundY = this.terrain[Math.min(Math.floor(gSpawnX), this.terrain.length - 1)];
          var guardHP = 35 + this.planetIndex * 8;
          Game.EntityManager.add('enemies', {
            x: gSpawnX, y: gGroundY - 18, radius: 15, hp: guardHP,
            active: true, sprite: guardSprites[gi % 3], facing: 1, animTimer: 0,
            isGuard: true, coinDrop: 8 + Math.floor(Math.random() * 5),
            speed: 55 + this.planetIndex * 10,
            update: function(dt2) {
              this.animTimer += dt2;
              var ast2 = Game.scenes.PLANET_EXPLORE.astronaut;
              var dx2 = ast2.x - this.x;
              this.facing = dx2 > 0 ? 1 : -1;
              if (Math.abs(dx2) > 25) this.x += this.facing * this.speed * dt2;
              var gx2 = Math.min(Math.floor(this.x), Game.scenes.PLANET_EXPLORE.terrain.length - 1);
              if (gx2 >= 0) this.y = Game.scenes.PLANET_EXPLORE.terrain[gx2] - 18;
              // Damage on contact
              if (Math.abs(dx2) < 35 && Math.abs(ast2.y - this.y) < 40) {
                if (!this._hcd || this._hcd <= 0) {
                  ast2.hp = Math.max(0, ast2.hp - 12);
                  this._hcd = 0.7;
                  Game.triggerShake(3, 0.1);
                  if (Game.Audio) Game.Audio.sfx.damage();
                  Game.addFloatingText('-12 HP', ast2.x, ast2.y - 30, '#f44336');
                }
              }
              if (this._hcd > 0) this._hcd -= dt2;
              if (Math.abs(this.x - ast2.x) > 1000) this.active = false;
            },
            render: function(ctx2, ox, oy) {
              Game.Pixel.drawCentered(ctx2, this.sprite, this.x - (ox||0), this.y - (oy||0), 3, this.facing === -1);
              // Guard marker (small shield icon)
              ctx2.fillStyle = '#ff9800';
              ctx2.fillRect(this.x - (ox||0) - 4, this.y - (oy||0) - 22, 8, 3);
            },
            takeDamage: function(dmg) {
              this.hp -= dmg;
              Game.spawnParticles(this.x, this.y, 3, '#ff9800', 0.5);
              if (this.hp <= 0) {
                this.active = false;
                Game.spawnParticles(this.x, this.y, 8, '#ff9800', 1);
                Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, this.coinDrop));
                Game.addFloatingText('+' + this.coinDrop, this.x, this.y - 20, '#ffd700');
                if (Game.Audio) Game.Audio.sfx.explosion();
                if (Game.scenes.PLANET_EXPLORE) Game.scenes.PLANET_EXPLORE.killCount++;
              }
            }
          });
        }

        var bossX = this.astronaut.x + (Math.random() < 0.5 ? 300 : -300);
        bossX = Math.max(100, Math.min(this.terrainWidth - 100, bossX));
        var bossGroundY = this.terrain[Math.min(Math.floor(bossX), this.terrain.length - 1)];
        var bossHP = 150 + this.planetIndex * 30;
        var self = this;

        Game.EntityManager.add('enemies', {
          x: bossX, y: bossGroundY - 40, radius: 30, hp: bossHP, maxHp: bossHP,
          active: true, isBoss: true, facing: 1, animTime: 0,
          attackTimer: 2, phaseTimer: 0, phase: 0,
          groundY: bossGroundY,
          update: function(dt2) {
            this.animTime += dt2;
            this.phaseTimer += dt2;
            var ast = Game.scenes.PLANET_EXPLORE.astronaut;
            var dx = ast.x - this.x;
            this.facing = dx > 0 ? 1 : -1;

            // Movement phases
            if (this.phase === 0) {
              // Chase
              if (Math.abs(dx) > 60) this.x += this.facing * 70 * dt2;
              if (this.phaseTimer > 4) { this.phase = 1; this.phaseTimer = 0; }
            } else if (this.phase === 1) {
              // Jump attack
              this.y -= 200 * dt2;
              if (this.phaseTimer > 0.5) { this.phase = 2; this.phaseTimer = 0; }
            } else if (this.phase === 2) {
              // Slam down
              this.y += 300 * dt2;
              var gx2 = Math.min(Math.floor(this.x), Game.scenes.PLANET_EXPLORE.terrain.length - 1);
              var gy2 = Game.scenes.PLANET_EXPLORE.terrain[Math.max(0, gx2)];
              if (this.y >= gy2 - 40) {
                this.y = gy2 - 40;
                Game.triggerShake(6, 0.3);
                // Shockwave - damage nearby
                if (Math.abs(dx) < 120) {
                  ast.hp = Math.max(0, ast.hp - 15);
                  Game.addFloatingText('-15 HP', ast.x, ast.y - 30, '#f44336');
                  if (Game.Audio) Game.Audio.sfx.damage();
                }
                // Spawn projectiles
                for (var bp = 0; bp < 3; bp++) {
                  var bpDir = -1 + bp;
                  Game.EntityManager.add('particles', {
                    x: this.x + bpDir * 40, y: this.y, radius: 5, active: true,
                    vx: bpDir * 150, vy: -100, life: 1.5, color: '#ff4081', isEnemyBullet: true,
                    update: function(dt3) {
                      this.x += this.vx * dt3; this.y += this.vy * dt3;
                      this.vy += 200 * dt3;
                      this.life -= dt3; if (this.life <= 0) this.active = false;
                    },
                    render: function(ctx2, ox, oy) {
                      ctx2.fillStyle = this.color;
                      ctx2.fillRect(this.x - (ox||0) - 4, this.y - (oy||0) - 4, 8, 8);
                    }
                  });
                }
                this.phase = 0; this.phaseTimer = 0;
              }
            }

            // Stay on ground (phase 0)
            if (this.phase === 0) {
              var gx3 = Math.min(Math.floor(this.x), Game.scenes.PLANET_EXPLORE.terrain.length - 1);
              if (gx3 >= 0) this.y = Game.scenes.PLANET_EXPLORE.terrain[gx3] - 40;
            }

            // Contact damage
            if (Math.abs(dx) < 35 && Math.abs(ast.y - this.y) < 40) {
              if (!this._hitCD || this._hitCD <= 0) {
                ast.hp = Math.max(0, ast.hp - 20);
                this._hitCD = 1.5;
                Game.triggerShake(5, 0.2);
                if (Game.Audio) Game.Audio.sfx.damage();
                Game.addFloatingText('-20 HP', ast.x, ast.y - 30, '#f44336');
              }
            }
            if (this._hitCD > 0) this._hitCD -= dt2;
          },
          render: function(ctx2, ox, oy) {
            var sx = this.x - (ox||0), sy = this.y - (oy||0);
            var pulse = 1 + Math.sin(this.animTime * 4) * 0.05;
            var r = this.radius * pulse;
            var pi = self.planetIndex % 5;
            // Planet-specific boss appearance
            var bossColors = [
              ['#b71c1c','#d32f2f','#ff6f00'], // Terra: Golem vermelho
              ['#1a237e','#283593','#42a5f5'], // Lua: Espectro azul
              ['#bf360c','#e64a19','#ff9800'], // Marte: Demonio laranja
              ['#4a148c','#6a1b9a','#ce93d8'], // Venus: Hydra roxa
              ['#0d47a1','#1565c0','#4fc3f7']  // Plutao: Titan gelo
            ];
            var bc = bossColors[pi];
            // Body
            Game.Pixel.drawCircle(ctx2, sx, sy, r, bc[0], 3);
            Game.Pixel.drawCircle(ctx2, sx, sy - 5, r * 0.7, bc[1], 3);
            // Crown/horns (different per boss)
            ctx2.fillStyle = bc[2];
            if (pi === 0) { // Golem: 3 horns
              ctx2.fillRect(sx - 18, sy - r - 6, 6, 12);
              ctx2.fillRect(sx + 12, sy - r - 6, 6, 12);
              ctx2.fillRect(sx - 3, sy - r - 12, 6, 14);
            } else if (pi === 1) { // Espectro: floating orbs
              Game.Pixel.drawCircle(ctx2, sx - 20, sy - r, 6, '#42a5f5', 2);
              Game.Pixel.drawCircle(ctx2, sx + 20, sy - r, 6, '#42a5f5', 2);
            } else if (pi === 2) { // Demonio: wings
              ctx2.fillRect(sx - r - 8, sy - 10, 12, 6);
              ctx2.fillRect(sx + r - 4, sy - 10, 12, 6);
              ctx2.fillRect(sx - r - 4, sy - 16, 8, 8);
              ctx2.fillRect(sx + r, sy - 16, 8, 8);
            } else if (pi === 3) { // Hydra: multiple heads
              for (var hh = 0; hh < 3; hh++) {
                var ha2 = -0.5 + hh * 0.5 + Math.sin(this.animTime * 3 + hh) * 0.2;
                var hx2 = sx + Math.cos(ha2 - 1.57) * (r + 8);
                var hy2 = sy + Math.sin(ha2 - 1.57) * (r + 8);
                Game.Pixel.drawCircle(ctx2, hx2, hy2, 8, bc[1], 2);
                ctx2.fillStyle = '#fff'; ctx2.fillRect(hx2 - 1, hy2 - 2, 3, 3);
              }
            } else { // Titan: ice crown
              ctx2.fillRect(sx - 15, sy - r - 8, 4, 10);
              ctx2.fillRect(sx - 5, sy - r - 12, 4, 14);
              ctx2.fillRect(sx + 5, sy - r - 8, 4, 10);
              ctx2.fillRect(sx + 12, sy - r - 6, 4, 8);
            }
            // Eyes (glowing, color matches boss)
            var eyeGlow = Math.sin(this.animTime * 6) > 0 ? '#ffeb3b' : bc[2];
            Game.Pixel.drawCircle(ctx2, sx - 8, sy - 8, 5, eyeGlow, 2);
            Game.Pixel.drawCircle(ctx2, sx + 8, sy - 8, 5, eyeGlow, 2);
            ctx2.fillStyle = '#000';
            ctx2.fillRect(sx - 9, sy - 9, 3, 3);
            ctx2.fillRect(sx + 7, sy - 9, 3, 3);
            // HP bar above boss
            var hpPct = this.hp / this.maxHp;
            ctx2.fillStyle = '#000';
            ctx2.fillRect(sx - 30, sy - r - 20, 60, 6);
            ctx2.fillStyle = hpPct > 0.5 ? '#f44336' : '#ff6f00';
            ctx2.fillRect(sx - 29, sy - r - 19, 58 * hpPct, 4);
            Game.UI.text(ctx2, 'BOSS', sx, sy - r - 24, 8, '#ff4081', 'center');
          },
          takeDamage: function(dmg) {
            this.hp -= dmg;
            Game.spawnParticles(this.x, this.y, 4, '#f44336', 0.5);
            if (this.hp <= 0) {
              this.active = false;
              self.bossDefeated = true;
              // Mega explosion
              Game.spawnParticles(this.x, this.y, 30, '#ff9800', 2);
              Game.spawnParticles(this.x, this.y, 20, '#ffeb3b', 1.5);
              Game.spawnParticles(this.x, this.y, 15, '#f44336', 1.8);
              Game.triggerShake(15, 1);
              if (Game.Audio) Game.Audio.sfx.explosion();
              if (Game.Audio) Game.Audio.sfx.milestone();
              // Drop coins
              var reward = 50 + self.planetIndex * 20;
              Game.EntityManager.add('coins', Game.createCoin(this.x, this.y, reward));
              Game.addFloatingText('+' + reward, this.x, this.y - 40, '#ffd700', 16);

              // Drop EMERALD SHARD
              if (!Game.saveData.bossesDefeated) Game.saveData.bossesDefeated = [];
              if (Game.saveData.bossesDefeated.indexOf(self.planetIndex) === -1) {
                Game.saveData.bossesDefeated.push(self.planetIndex);
                Game.saveData.emeraldShards = (Game.saveData.emeraldShards || 0) + 1;
                Game.addFloatingText('FRAGMENTO DE ESMERALDA!', this.x, this.y - 60, '#4caf50', 20);

                if (Game.saveData.emeraldShards >= 5) {
                  Game.showMessage('ESMERALDA COMPLETA! Um portal se abriu no espaco...', 5);
                } else {
                  Game.showMessage('Fragmento ' + Game.saveData.emeraldShards + '/5 da Esmeralda! Derrote mais guardioes!', 4);
                }
              }

              // Bonus upgrade
              var bonusTypes = ['engine', 'fuelTank', 'heatShield', 'armor', 'laser'];
              var bonusKey = bonusTypes[self.planetIndex % bonusTypes.length];
              if (Game.saveData.rocketParts[bonusKey] < 4) {
                Game.saveData.rocketParts[bonusKey]++;
              }
              Game.Save.save(Game.saveData);

              // Show planet lore scroll
              self.showingLore = true;
              self.loreTimer = 0;
              self.loreScroll = 0;
            }
          }
        });
      }
    }

    // Track kills (moved - now tracked inline via takeDamage)

    // --- ASTRONAUT HP CHECK ---
    if (this.astronaut.hp <= 0) {
      Game.showMessage('Voce foi derrotado! Voltando ao foguete...', 2);
      this.astronaut.hp = this.astronaut.maxHp;
      this.astronaut.x = this.rocketPadPos.x;
      this.astronaut.y = this.rocketPadPos.y - 20;
      Game.saveData.coins = Math.floor(Game.saveData.coins * 0.9);
      Game.Save.save(Game.saveData);
    }

    // Camera follow
    Game.Camera.follow(this.astronaut, dt);

    // Proximity checks
    var shopDist = Math.abs(this.astronaut.x - this.shopPos.x);
    this.nearShop = shopDist < 60;

    var rktDist = Math.abs(this.astronaut.x - this.rocketPadPos.x);
    this.nearRocket = rktDist < 60;

    // Bell animation when near shop
    if (this.nearShop) {
      this.bellAnim += dt * 8;
    } else {
      this.bellAnim *= 0.9;
    }

    // Easter egg proximity
    this.nearEasterEgg = false;
    if (this.easterEggPos) {
      var eggDist = Math.abs(this.astronaut.x - this.easterEggPos.x);
      this.nearEasterEgg = eggDist < 40;
    }

    // Location proximity + discovery
    this.nearLocation = null;
    if (this.locations) {
      for (var li = 0; li < this.locations.length; li++) {
        var loc = this.locations[li];
        var locDist = Math.abs(this.astronaut.x - loc.x);
        if (locDist < 50) {
          if (!loc.discovered) {
            loc.discovered = true;
            Game.addFloatingText('Descoberta: ' + loc.type.toUpperCase(), loc.x, loc.y - 30, '#ffd700', 14);
            if (Game.Audio) Game.Audio.sfx.menuSelect();
          }
          if (!loc.looted) this.nearLocation = loc;
        }
      }
    }

    // Interact (E key)
    if (Game.Input.wasPressed('e') || Game.Input.wasPressed('E')) {
      // Loot location
      if (this.nearLocation && !this.nearLocation.looted) {
        var loc2 = this.nearLocation;
        loc2.looted = true;
        var locReward = loc2.reward;

        if (loc2.type === 'chest' || loc2.type === 'ruins') {
          Game.saveData.coins += locReward;
          Game.addFloatingText('+' + locReward + ' moedas!', loc2.x, loc2.y - 30, '#ffd700', 16);
          if (Game.Audio) Game.Audio.sfx.coinBig();
        } else if (loc2.type === 'oasis' || loc2.type === 'camp') {
          this.astronaut.hp = Math.min(this.astronaut.maxHp, this.astronaut.hp + 50);
          Game.addFloatingText('+50 HP!', loc2.x, loc2.y - 30, '#4caf50', 16);
          if (Game.Audio) Game.Audio.sfx.repair();
        } else if (loc2.type === 'cave') {
          var caveLoot = locReward * 2;
          Game.saveData.coins += caveLoot;
          Game.addFloatingText('+' + caveLoot + ' tesouro!', loc2.x, loc2.y - 30, '#e040fb', 16);
          if (Game.Audio) Game.Audio.sfx.easterEgg();
        } else if (loc2.type === 'beacon' || loc2.type === 'temple') {
          var stats3 = Game.getRocketStats(Game.saveData);
          Game.saveData.fuel = Math.min(Game.saveData.fuel + 30, stats3.maxFuel);
          Game.addFloatingText('+30 fuel!', loc2.x, loc2.y - 30, '#4fc3f7', 16);
          if (Game.Audio) Game.Audio.sfx.upgrade();
        } else if (loc2.type === 'wreck') {
          Game.saveData.coins += locReward;
          var stats4 = Game.getRocketStats(Game.saveData);
          Game.saveData.fuel = Math.min(Game.saveData.fuel + 15, stats4.maxFuel);
          Game.addFloatingText('+' + locReward + '$ +15 fuel', loc2.x, loc2.y - 30, '#ff9800', 14);
          if (Game.Audio) Game.Audio.sfx.coinBig();
        }
        Game.Save.save(Game.saveData);
        if (Game.Milestones) Game.Milestones.check(Game.saveData.coins);
      } else if (this.nearShop) {
        Game.ShopUI.open();
        if (Game.Audio) Game.Audio.sfx.menuSelect();
      } else if (this.nearRocket) {
        // Go to free space exploration
        Game.Save.save(Game.saveData);
        Game.changeStateImmediate(Game.States.SPACE_FREE, { fromPlanet: this.planetIndex });
      } else if (this.nearEasterEgg && !Game.saveData.foundEasterEgg) {
        // Found easter egg!
        Game.saveData.foundEasterEgg = true;
        Game.Save.save(Game.saveData);
        this.easterEggPos = null;
        Game.showMessage('NUCLEO ESTELAR encontrado! -30% consumo fuel!', 4);
        Game.spawnParticles(this.astronaut.x, this.astronaut.y - 20, 30, '#e040fb', 2);
        if (Game.Audio) Game.Audio.sfx.easterEgg();
        Game.triggerShake(6, 0.5);
      }
    }

    // Update particles
    Game.EntityManager.updateAll(dt);
  },

  render: function(ctx) {
    var planet = Game.PlanetData[this.planetIndex];
    var camX = Game.Camera.x;

    // Sky (pixel color bands)
    Game.Pixel.drawColorBands(ctx, [
      { color: planet.skyTop, ratio: 0.5 },
      { color: planet.skyBottom, ratio: 0.5 }
    ], 0, 0, Game.CANVAS_W, Game.CANVAS_H);

    // Stars
    this.starfield.render(ctx);

    // Blocky parallax mountains
    this.renderParallax(ctx, planet, camX);

    // Background decorations
    this.renderDecorations(ctx, camX, true);

    // Terrain
    Game.TerrainGenerator.render(ctx, this.terrain, this.planetIndex, camX);

    // Foreground decorations
    this.renderDecorations(ctx, camX, false);

    // RPG Shop tent with bell
    var shopScreenX = this.shopPos.x - camX;
    if (shopScreenX > -80 && shopScreenX < Game.CANVAS_W + 80) {
      // Shop tent
      Game.Pixel.drawCentered(ctx, Game.Sprites.shopTent, shopScreenX, this.shopPos.y - 27, 3);

      // Animated bell on top
      var bellSwing = Math.sin(this.bellAnim) * (this.nearShop ? 8 : 0);
      ctx.save();
      ctx.translate(shopScreenX, this.shopPos.y - 54);
      ctx.rotate(bellSwing * Math.PI / 180);
      Game.Pixel.drawCentered(ctx, Game.Sprites.bell, 0, 0, 3);
      ctx.restore();

      // Sign
      Game.UI.textBold(ctx, 'LOJA', shopScreenX, this.shopPos.y - 68, 10, '#ffd700', 'center');

      if (this.nearShop) {
        var pulse = Math.sin(this.time * 4) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = pulse;
        Game.UI.textBold(ctx, '[E] Entrar', shopScreenX, this.shopPos.y + 25, 12, '#4fc3f7', 'center');
        ctx.restore();
      }
    }

    // Space station / rocket pad
    var rktScreenX = this.rocketPadPos.x - camX;
    if (rktScreenX > -80 && rktScreenX < Game.CANVAS_W + 80) {
      // Space station building
      Game.Pixel.drawCentered(ctx, Game.Sprites.spaceStation, rktScreenX, this.rocketPadPos.y - 36, 3);

      // Rocket on top
      Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, rktScreenX, this.rocketPadPos.y - 90, 3);

      if (this.nearRocket) {
        var pulse2 = Math.sin(this.time * 4) * 0.3 + 0.7;
        ctx.save();
        ctx.globalAlpha = pulse2;
        var launchText = Game.saveData.fuel > 0 ? '[E] Lancar' : '[E] Sem Fuel!';
        var launchColor = Game.saveData.fuel > 0 ? '#4caf50' : '#f44336';
        Game.UI.textBold(ctx, launchText, rktScreenX, this.rocketPadPos.y + 30, 12, launchColor, 'center');
        ctx.restore();
      }
    }

    // Easter egg
    if (this.easterEggPos) {
      var eggScreenX = this.easterEggPos.x - camX;
      if (eggScreenX > -20 && eggScreenX < Game.CANVAS_W + 20) {
        // Subtle glow
        var glowAlpha = 0.3 + Math.sin(this.time * 2) * 0.15;
        ctx.save();
        ctx.globalAlpha = glowAlpha;
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(eggScreenX - 10, this.easterEggPos.y - 18, 20, 20);
        ctx.restore();

        // Egg sprite
        Game.Pixel.drawCentered(ctx, Game.Sprites.easterEggGlow, eggScreenX, this.easterEggPos.y - 12, 3);

        if (this.nearEasterEgg) {
          var eggPulse = Math.sin(this.time * 5) * 0.4 + 0.6;
          ctx.save();
          ctx.globalAlpha = eggPulse;
          Game.UI.textBold(ctx, '[E] ???', eggScreenX, this.easterEggPos.y - 28, 11, '#e040fb', 'center');
          ctx.restore();
        }
      }
    }

    // Discoverable locations
    if (this.locations) {
      for (var li = 0; li < this.locations.length; li++) {
        var loc = this.locations[li];
        var lsx = loc.x - camX;
        if (lsx < -80 || lsx > Game.CANVAS_W + 80) continue;
        var lsy = loc.y;

        if (loc.looted) {
          // Looted - dim marker
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = '#555';
          ctx.fillRect(lsx - 10, lsy - 15, 20, 15);
          ctx.restore();
        } else {
          // Active location - draw based on type
          var locColors = { ruins: '#8d6e63', cave: '#5d4037', chest: '#ffd700', oasis: '#4fc3f7', temple: '#9c27b0', camp: '#ff9800', beacon: '#4caf50', wreck: '#78909c' };
          var lc = locColors[loc.type] || '#888';

          // Structure
          if (loc.type === 'chest') {
            ctx.fillStyle = '#8d6e63'; ctx.fillRect(lsx - 12, lsy - 12, 24, 12);
            ctx.fillStyle = '#ffd700'; ctx.fillRect(lsx - 10, lsy - 10, 20, 8);
            ctx.fillStyle = '#ff9800'; ctx.fillRect(lsx - 2, lsy - 8, 4, 4);
          } else if (loc.type === 'cave') {
            ctx.fillStyle = '#3e2723'; ctx.fillRect(lsx - 18, lsy - 20, 36, 20);
            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(lsx - 12, lsy - 16, 24, 16);
            ctx.fillStyle = '#111'; ctx.fillRect(lsx - 8, lsy - 12, 16, 12);
          } else if (loc.type === 'temple') {
            ctx.fillStyle = '#7b1fa2'; ctx.fillRect(lsx - 15, lsy - 25, 30, 25);
            ctx.fillStyle = '#9c27b0'; ctx.fillRect(lsx - 12, lsy - 22, 24, 3);
            ctx.fillStyle = '#ce93d8'; ctx.fillRect(lsx - 3, lsy - 30, 6, 8);
          } else if (loc.type === 'ruins') {
            ctx.fillStyle = '#8d6e63'; ctx.fillRect(lsx - 15, lsy - 18, 6, 18);
            ctx.fillRect(lsx + 9, lsy - 15, 6, 15);
            ctx.fillRect(lsx - 5, lsy - 10, 10, 3);
          } else if (loc.type === 'beacon') {
            ctx.fillStyle = '#388e3c'; ctx.fillRect(lsx - 3, lsy - 30, 6, 30);
            var beaconBlink = Math.sin(this.time * 4 + li) > 0;
            ctx.fillStyle = beaconBlink ? '#4caf50' : '#1b5e20';
            ctx.fillRect(lsx - 5, lsy - 32, 10, 6);
          } else if (loc.type === 'oasis') {
            ctx.fillStyle = '#4fc3f7'; ctx.fillRect(lsx - 15, lsy - 3, 30, 3);
            ctx.fillStyle = '#81d4fa'; ctx.fillRect(lsx - 10, lsy - 2, 20, 2);
          } else if (loc.type === 'camp') {
            ctx.fillStyle = '#5d4037'; ctx.fillRect(lsx - 2, lsy - 18, 4, 18);
            ctx.fillStyle = '#ff9800'; ctx.fillRect(lsx - 8, lsy - 25, 16, 10);
            ctx.fillStyle = '#ffeb3b'; ctx.fillRect(lsx - 5, lsy - 22, 10, 5);
          } else if (loc.type === 'wreck') {
            ctx.fillStyle = '#546e7a'; ctx.fillRect(lsx - 18, lsy - 10, 12, 10);
            ctx.fillRect(lsx + 2, lsy - 14, 15, 14);
            ctx.fillStyle = '#90a4ae'; ctx.fillRect(lsx - 15, lsy - 8, 8, 6);
          }

          // Interaction prompt when near
          if (loc === this.nearLocation) {
            var promptBlink = Math.sin(this.time * 4) > 0;
            if (promptBlink) {
              Game.UI.textBold(ctx, '[E] ' + loc.type.toUpperCase(), lsx, lsy - 40, 10, lc, 'center');
            }
          }

          // Undiscovered glow
          if (!loc.discovered) {
            ctx.save();
            ctx.globalAlpha = 0.15 + Math.sin(this.time * 2 + li) * 0.05;
            ctx.fillStyle = lc;
            ctx.fillRect(lsx - 20, lsy - 30, 40, 30);
            ctx.restore();
          }
        }
      }
    }

    // Ammo crates on ground
    if (this.ammoCrates) {
      for (var aci = 0; aci < this.ammoCrates.length; aci++) {
        var crate = this.ammoCrates[aci];
        if (crate.collected) continue;
        var csx = crate.x - camX;
        if (csx < -20 || csx > Game.CANVAS_W + 20) continue;
        if (crate.type === 'ammo') {
          // Ammo box (green/cyan)
          ctx.fillStyle = '#1b5e20'; ctx.fillRect(csx - 9, crate.y - 10, 18, 12);
          ctx.fillStyle = '#2e7d32'; ctx.fillRect(csx - 7, crate.y - 8, 14, 8);
          ctx.fillStyle = '#4fc3f7'; ctx.fillRect(csx - 2, crate.y - 7, 4, 6);
          ctx.fillStyle = '#4fc3f7'; ctx.fillRect(csx - 4, crate.y - 5, 8, 2);
        } else {
          // Weapon crate (orange/gold glow)
          ctx.save();
          ctx.globalAlpha = 0.25 + Math.sin(this.time * 3 + aci) * 0.1;
          ctx.fillStyle = '#ff9800'; ctx.fillRect(csx - 14, crate.y - 14, 28, 28);
          ctx.restore();
          ctx.fillStyle = '#5d4037'; ctx.fillRect(csx - 10, crate.y - 10, 20, 12);
          ctx.fillStyle = '#8d6e63'; ctx.fillRect(csx - 8, crate.y - 8, 16, 8);
          ctx.fillStyle = '#ffd700'; ctx.fillRect(csx - 3, crate.y - 7, 6, 6);
          // Weapon label
          var wName = { shotgun: 'SHOTGUN', laser: 'LASER', missile: 'MISSIL', plasma: 'PLASMA' }[crate.weaponType] || '?';
          Game.UI.text(ctx, wName, csx, crate.y + 8, 7, '#ff9800', 'center');
        }
      }
    }

    // Food items on ground
    if (this.foodItems) {
      for (var fi = 0; fi < this.foodItems.length; fi++) {
        var food = this.foodItems[fi];
        if (food.collected) continue;
        var fsx = food.x - camX;
        if (fsx < -20 || fsx > Game.CANVAS_W + 20) continue;
        // Draw food based on type
        if (food.type === 'baga') {
          ctx.fillStyle = '#e91e63'; ctx.fillRect(fsx - 4, food.y - 4, 4, 4);
          ctx.fillStyle = '#f06292'; ctx.fillRect(fsx, food.y - 4, 4, 4);
          ctx.fillStyle = '#4caf50'; ctx.fillRect(fsx - 2, food.y - 7, 4, 3);
        } else if (food.type === 'cogumelo') {
          ctx.fillStyle = '#8d6e63'; ctx.fillRect(fsx - 2, food.y - 3, 4, 6);
          ctx.fillStyle = '#f44336'; ctx.fillRect(fsx - 5, food.y - 8, 10, 5);
          ctx.fillStyle = '#fff'; ctx.fillRect(fsx - 3, food.y - 7, 2, 2);
          ctx.fillRect(fsx + 2, food.y - 6, 2, 2);
        } else if (food.type === 'fruta') {
          ctx.fillStyle = '#ff9800'; ctx.fillRect(fsx - 4, food.y - 6, 8, 6);
          ctx.fillStyle = '#ffeb3b'; ctx.fillRect(fsx - 2, food.y - 4, 4, 2);
          ctx.fillStyle = '#4caf50'; ctx.fillRect(fsx - 1, food.y - 9, 3, 3);
        } else if (food.type === 'carne') {
          ctx.fillStyle = '#8d6e63'; ctx.fillRect(fsx - 5, food.y - 4, 10, 4);
          ctx.fillStyle = '#d32f2f'; ctx.fillRect(fsx - 3, food.y - 3, 6, 2);
          ctx.fillStyle = '#795548'; ctx.fillRect(fsx - 6, food.y - 2, 3, 5);
        }
      }
    }

    // Rare scraps (glowing)
    if (this.scraps) {
      for (var si = 0; si < this.scraps.length; si++) {
        var scrap = this.scraps[si];
        if (scrap.collected) continue;
        var ssx = scrap.x - camX;
        if (ssx < -20 || ssx > Game.CANVAS_W + 20) continue;
        // Glow effect
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(this.time * 3 + si * 2) * 0.1;
        ctx.fillStyle = '#ff9800';
        ctx.fillRect(ssx - 12, scrap.y - 12, 24, 24);
        ctx.restore();
        // Scrap piece
        ctx.fillStyle = '#78909c'; ctx.fillRect(ssx - 8, scrap.y - 8, 16, 8);
        ctx.fillStyle = '#546e7a'; ctx.fillRect(ssx - 6, scrap.y - 6, 12, 4);
        ctx.fillStyle = '#ff9800'; ctx.fillRect(ssx - 2, scrap.y - 5, 4, 3);
        ctx.fillStyle = '#90a4ae'; ctx.fillRect(ssx - 4, scrap.y, 8, 4);
        // Label
        Game.UI.text(ctx, scrap.type, ssx, scrap.y + 12, 7, '#ff9800', 'center');
      }
    }

    // Resources on ground
    if (this.resources) {
      for (var ri = 0; ri < this.resources.length; ri++) {
        var res = this.resources[ri];
        if (res.collected) continue;
        var rsx = res.x - camX;
        if (rsx < -30 || rsx > Game.CANVAS_W + 30) continue;
        var resSprite = res.type === 'mineral' ? Game.Sprites.mineral : Game.Sprites.fuelCrystal;
        Game.Pixel.drawCentered(ctx, resSprite, rsx, res.y, 3);
        // Small glow
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(this.time * 3 + ri) * 0.1;
        ctx.fillStyle = res.type === 'mineral' ? '#ff9800' : '#4fc3f7';
        ctx.fillRect(rsx - 6, res.y - 6, 12, 12);
        ctx.restore();
      }
    }

    // Astronaut
    this.astronaut.render(ctx, camX, 0);

    // Particles + enemies
    Game.EntityManager.renderAll(ctx, camX, 0);

    // HUD
    Game.UI.renderExploreHUD(ctx, Game.saveData);

    // HP bar
    var hpPct = this.astronaut.hp / this.astronaut.maxHp;
    ctx.fillStyle = '#111';
    ctx.fillRect(15, 30, 82, 12);
    ctx.fillStyle = hpPct > 0.5 ? '#4caf50' : (hpPct > 0.25 ? '#ff9800' : '#f44336');
    ctx.fillRect(16, 31, 80 * hpPct, 10);
    Game.UI.text(ctx, 'HP ' + Math.floor(this.astronaut.hp), 56, 34, 8, '#fff', 'center');

    // Hunger bar
    var hungerPct = Math.max(0, (Game.saveData.hunger || 0)) / 100;
    ctx.fillStyle = '#111';
    ctx.fillRect(15, 45, 82, 10);
    ctx.fillStyle = hungerPct > 0.4 ? '#8bc34a' : (hungerPct > 0.15 ? '#ff9800' : '#f44336');
    ctx.fillRect(16, 46, 80 * hungerPct, 8);
    Game.UI.text(ctx, 'FOME', 56, 49, 7, '#fff', 'center');
    if (hungerPct <= 0) {
      var starveBlink = Math.sin(this.time * 6) > 0;
      if (starveBlink) Game.UI.textBold(ctx, 'FAMINTO!', 56, 62, 9, '#f44336', 'center');
    }

    // Ammo + Weapon
    var ammo2 = Game.saveData.ammo || 0;
    Game.UI.text(ctx, 'BALAS: ' + ammo2, 56, 65, 8, '#4fc3f7', 'center');
    var weapName = (Game.saveData.currentWeapon || 'blaster').toUpperCase();
    var weapColors = { BLASTER: '#4fc3f7', SHOTGUN: '#ff9800', LASER: '#f44336', MISSILE: '#ff5722', PLASMA: '#e040fb' };
    Game.UI.textBold(ctx, weapName, 56, 77, 9, weapColors[weapName] || '#fff', 'center');
    Game.UI.text(ctx, '[Q] trocar', 56, 87, 7, '#666', 'center');

    // Scrap counter
    var scraps = Game.saveData.scrapsCollected || 0;
    Game.UI.text(ctx, 'Sucatas: ' + (scraps % 3) + '/3', 56, 98, 8, '#ff9800', 'center');

    // Easter egg found indicator
    if (Game.saveData.foundEasterEgg) {
      Game.UI.text(ctx, 'Nucleo Estelar ativo (-30% fuel)', 15, 32, 10, '#e040fb');
    }

    // Dialog
    Game.UI.renderDialog(ctx);

    // Shop overlay
    if (Game.subState === Game.SubStates.SHOP) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
      Game.ShopUI.render(ctx, Game.saveData);
    }

    // Planet lore scroll (after boss defeat)
    if (this.showingLore) {
      this.loreTimer += 0.016;
      var W = Game.CANVAS_W, H = Game.CANVAS_H;
      var lore = Game.PlanetLore[this.planetIndex % Game.PlanetLore.length];

      // Dark overlay
      ctx.save();
      ctx.globalAlpha = Math.min(0.85, this.loreTimer * 2);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Scroll frame (ancient parchment style)
      var scrollW = 500, scrollH = 360;
      var scrollX = W / 2 - scrollW / 2;
      var scrollY = H / 2 - scrollH / 2;

      // Parchment background
      ctx.fillStyle = '#2a1f14';
      ctx.fillRect(scrollX - 4, scrollY - 4, scrollW + 8, scrollH + 8);
      ctx.fillStyle = '#3d2b1a';
      ctx.fillRect(scrollX, scrollY, scrollW, scrollH);
      ctx.fillStyle = '#4a3423';
      ctx.fillRect(scrollX + 4, scrollY + 4, scrollW - 8, scrollH - 8);

      // Scroll rolls (top and bottom)
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(scrollX - 8, scrollY - 8, scrollW + 16, 12);
      ctx.fillRect(scrollX - 8, scrollY + scrollH - 4, scrollW + 16, 12);
      ctx.fillStyle = '#795548';
      ctx.fillRect(scrollX - 6, scrollY - 6, scrollW + 12, 8);
      ctx.fillRect(scrollX - 6, scrollY + scrollH - 2, scrollW + 12, 8);

      // Emerald shard icon
      var shardPulse = 1 + Math.sin(this.time * 3) * 0.15;
      Game.Pixel.drawCircle(ctx, W / 2, scrollY + 30, 12 * shardPulse, '#4caf50', 3);
      Game.Pixel.drawCircle(ctx, W / 2, scrollY + 30, 7 * shardPulse, '#69f0ae', 3);

      // Title
      Game.UI.textBold(ctx, lore.title, W / 2, scrollY + 55, 14, '#ffd700', 'center');

      // Decorative line
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(scrollX + 40, scrollY + 68, scrollW - 80, 2);

      // Lore text (line by line with fade-in)
      for (var li = 0; li < lore.lines.length; li++) {
        var lineDelay = li * 0.4;
        var lineAlpha = Math.min(1, Math.max(0, (this.loreTimer - 0.5 - lineDelay) * 2));
        if (lineAlpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = lineAlpha;
        Game.UI.text(ctx, lore.lines[li], W / 2, scrollY + 90 + li * 26, 12, '#d4c5a9', 'center');
        ctx.restore();
      }

      // Close prompt (after all lines shown)
      var allShown = this.loreTimer > 0.5 + lore.lines.length * 0.4 + 1;
      if (allShown) {
        var closeBlink = Math.sin(this.time * 3) > 0;
        if (closeBlink) {
          Game.UI.textBold(ctx, 'Pressione ENTER ou ESPACO para fechar', W / 2, scrollY + scrollH - 20, 11, '#ffd700', 'center');
        }
        if (Game.Input.wasPressed('Enter') || Game.Input.wasPressed(' ') || Game.Input.wasPressed('Escape') || Game.Input.mouse.clicked) {
          this.showingLore = false;
        }
      }
    }
  },

  renderParallax: function(ctx, planet, camX) {
    // Blocky pixel mountains
    var parallaxSpeed = 0.3;
    var offset = camX * parallaxSpeed;
    var blockSize = 6; // bigger blocks for pixel feel

    ctx.fillStyle = planet.groundDark;
    for (var i = 0; i < 10; i++) {
      var mx = i * 250 - (offset % 250) - 125;
      var mh = 40 + Math.sin(i * 1.7 + 3) * 25;
      var my = Game.CANVAS_H - 200 + Math.sin(i * 0.8) * 20;

      // Draw blocky mountain shape
      var peakY = my;
      var baseY = my + mh;
      var halfW = 80 + Math.sin(i * 2.3) * 20;

      for (var bx = mx - halfW; bx < mx + halfW; bx += blockSize) {
        var distFromCenter = Math.abs(bx - mx) / halfW;
        var colHeight = mh * (1 - distFromCenter * distFromCenter);
        if (colHeight > 0) {
          var colTop = baseY - colHeight;
          // Snap to block grid
          colTop = Math.floor(colTop / blockSize) * blockSize;
          ctx.fillRect(Math.floor(bx / blockSize) * blockSize, colTop, blockSize, baseY - colTop);
        }
      }
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
          ctx.fillStyle = '#5d4037';
          ctx.fillRect(sx - 3 * s, sy - 24 * s, 6 * s, 24 * s);
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
          // Pixel crater (flat oval via stacked rects)
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fillRect(sx - 16 * s, sy - 3 * s, 32 * s, 6 * s);
          ctx.fillRect(sx - 20 * s, sy - 1 * s, 40 * s, 2 * s);
          // Rim
          ctx.fillStyle = '#888';
          ctx.fillRect(sx - 20 * s, sy - 4 * s, 40 * s, 1);
          ctx.fillRect(sx - 20 * s, sy + 3 * s, 40 * s, 1);
          break;

        case 'flag':
          if (isBackground) continue;
          ctx.fillStyle = '#ccc';
          ctx.fillRect(sx, sy - 40, 2, 40);
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
          ctx.fillStyle = '#bbb';
          ctx.fillRect(sx - 10 * s, sy - 10 * s, 20 * s, 8 * s);
          ctx.fillStyle = '#888';
          ctx.fillRect(sx - 8 * s, sy - 16 * s, 8 * s, 6 * s);
          ctx.fillStyle = '#333';
          ctx.fillRect(sx - 10 * s, sy - 2 * s, 6 * s, 4 * s);
          ctx.fillRect(sx + 4 * s, sy - 2 * s, 6 * s, 4 * s);
          ctx.fillStyle = '#ccc';
          ctx.fillRect(sx + 4 * s, sy - 22 * s, 1, 8 * s);
          ctx.fillStyle = '#f44336';
          ctx.fillRect(sx + 3 * s, sy - 24 * s, 3 * s, 2 * s);
          break;

        case 'volcano':
          if (isBackground) continue;
          // Pixel volcano (stacked rects trapezoid)
          ctx.fillStyle = '#8b4513';
          var vRows = 10;
          for (var vr = 0; vr < vRows; vr++) {
            var vt = vr / vRows;
            var vHalfW = 5 * s + (20 * s - 5 * s) * vt;
            var vy2 = sy - 30 * s + (30 * s) * vt;
            var vRowH = (30 * s) / vRows;
            ctx.fillRect(sx - vHalfW, vy2, vHalfW * 2, vRowH + 1);
          }
          ctx.fillStyle = '#ff5722';
          ctx.fillRect(sx - 4 * s, sy - 30 * s, 8 * s, 3 * s);
          if (Math.sin(this.time * 3 + dec.x) > 0.5) {
            ctx.fillStyle = 'rgba(100,100,100,0.4)';
            ctx.fillRect(sx - 2, sy - 34 * s - Math.sin(this.time * 2) * 5, 4, 4);
            ctx.fillRect(sx + 3, sy - 36 * s - Math.cos(this.time * 1.5) * 4, 3, 3);
          }
          break;

        case 'crystal':
          if (isBackground) continue;
          ctx.fillStyle = '#4fc3f7';
          ctx.fillRect(sx - 2 * s, sy - 20 * s, 4 * s, 20 * s);
          ctx.fillStyle = '#81d4fa';
          ctx.fillRect(sx - 5 * s, sy - 14 * s, 3 * s, 14 * s);
          ctx.fillRect(sx + 2 * s, sy - 18 * s, 3 * s, 18 * s);
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
