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
  worldScale: 800, // pixels per gx/gy unit
  nearPlanet: -1,

  // Flame
  flameFrame: 0,
  flameTimer: 0,

  // Black hole warning
  blackHoleWarning: false,
  blackHoleTimer: 0,

  enter: function(data) {
    this.time = 0;
    this.starfield = new Game.Starfield(400);
    this.flameFrame = 0;
    this.flameTimer = 0;
    this.nearPlanet = -1;
    this.blackHoleWarning = false;
    this.blackHoleTimer = 0;

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
    var shooting = Game.Input.keys[' '] || this.pressing.shoot;
    var bombing = Game.Input.wasPressed('b') || Game.Input.wasPressed('B') || this.pressing.bomb;

    if (shooting && this.fireCooldown <= 0) {
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

    // Enter cockpit (C key)
    if (Game.Input.wasPressed('c') || Game.Input.wasPressed('C')) {
      Game.changeStateImmediate(Game.States.COCKPIT);
      return;
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

    // Update starfield (parallax with camera)
    this.starfield.update(dt, 'none');

    // Update particles
    Game.EntityManager.updateAll(dt);
  },

  render: function(ctx) {
    var W = Game.CANVAS_W;
    var H = Game.CANVAS_H;

    // Dark space background
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, W, H);

    // Starfield (parallax offset)
    ctx.save();
    ctx.translate(-this.camX * 0.1 % W, -this.camY * 0.1 % H);
    this.starfield.render(ctx);
    ctx.restore();

    // --- RENDER WORLD OBJECTS ---

    // Black holes
    for (var bh = 0; bh < Game.BlackHoles.length; bh++) {
      var hole = Game.BlackHoles[bh];
      var bhsx = hole.gx * this.worldScale - this.camX;
      var bhsy = hole.gy * this.worldScale - this.camY;
      if (bhsx < -200 || bhsx > W + 200 || bhsy < -200 || bhsy > H + 200) continue;

      var bhRad = hole.radius * this.worldScale * 0.3;
      // Accretion glow
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(this.time * 2) * 0.05;
      Game.Pixel.drawCircle(ctx, bhsx, bhsy, bhRad * 2, '#330011', 4);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.3;
      Game.Pixel.drawCircle(ctx, bhsx, bhsy, bhRad, '#110000', 3);
      ctx.restore();
      // Center
      Game.Pixel.drawCircle(ctx, bhsx, bhsy, bhRad * 0.4, '#000000', 3);
      // Label
      Game.UI.text(ctx, hole.name, bhsx, bhsy + bhRad + 15, 9, '#660022', 'center');
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

      var planetRadius = accessible ? 30 : 15;
      var planetColor = accessible ? planet.groundColor : '#333';

      // Planet body (pixelated circle)
      Game.Pixel.drawCircle(ctx, psx, psy, planetRadius, planetColor, 3);

      // Surface highlight
      if (accessible) {
        Game.Pixel.drawCircle(ctx, psx - 6, psy - 6, planetRadius * 0.4, planet.surfaceDetail || '#5cb85c', 3);
      }

      // Name label
      var labelColor = p === this.nearPlanet ? '#4caf50' : (accessible ? '#aaa' : '#444');
      Game.UI.text(ctx, planet.name, psx, psy + planetRadius + 12, 10, labelColor, 'center');

      // Current planet indicator
      if (p === Game.saveData.currentPlanet) {
        Game.Pixel.drawRing(ctx, psx, psy, planetRadius + 6, '#4caf50', 2, 3);
      }

      // Near planet glow
      if (p === this.nearPlanet) {
        ctx.save();
        ctx.globalAlpha = 0.2 + Math.sin(this.time * 4) * 0.1;
        Game.Pixel.drawCircle(ctx, psx, psy, planetRadius + 12, '#4caf50', 4);
        ctx.restore();
      }
    }

    // Particles
    Game.EntityManager.renderAll(ctx, this.camX, this.camY);

    // --- SHIP (always centered) ---
    var shipSX = this.shipX - this.camX;
    var shipSY = this.shipY - this.camY;

    ctx.save();
    ctx.translate(shipSX, shipSY);
    ctx.rotate(this.shipAngle);

    // Rocket sprite (draw centered, rotated)
    Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, 0, 0, 3);

    // Flame when thrusting
    var isThrusting = Game.Input.keys['ArrowUp'] || Game.Input.keys['w'] || Game.Input.keys['W'] || Game.Input.keys[' '] || this.pressing.thrust;
    if (isThrusting && Game.saveData.fuel > 0) {
      Game.Pixel.drawCentered(ctx, Game.Sprites.flame[this.flameFrame], 0, 44, 3);
    }

    ctx.restore();

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

    // Coins (top right)
    Game.UI.text(ctx, '' + Game.saveData.coins, W - 60, 22, 14, '#ffd700', 'center');

    // Speed indicator
    var spd = Math.floor(Math.sqrt(this.shipVX * this.shipVX + this.shipVY * this.shipVY));
    Game.UI.text(ctx, 'VEL: ' + spd, W / 2, 20, 10, '#888', 'center');

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

    // --- ON-SCREEN CONTROL BUTTONS ---
    this.renderControls(ctx);

    // Controls hint
    Game.UI.text(ctx, 'A/D: Girar | W: Acelerar | S: Frear | ESPACO: Tiro | B: Bomba | E: Pousar | C: Cockpit',
      W / 2, H - 15, 9, 'rgba(255,255,255,0.3)', 'center');
  },

  renderControls: function(ctx) {
    var W = Game.CANVAS_W;
    var H = Game.CANVAS_H;
    var btnSize = 50;
    var margin = 15;
    var btnY = H - btnSize - margin - 30;

    // Left side: rotation buttons
    var leftX = margin;
    this.drawControlBtn(ctx, leftX, btnY, btnSize, '<', this.pressing.left);
    this.drawControlBtn(ctx, leftX + btnSize + 10, btnY, btnSize, '>', this.pressing.right);

    // Center: shoot + bomb
    var centerX = W / 2 - btnSize - 5;
    var shootActive = this.pressing.shoot;
    var bombActive = this.pressing.bomb;
    var bombReady = this.bombCooldown <= 0 && Game.saveData.coins >= 5;

    // Shoot button (cyan)
    ctx.save();
    ctx.globalAlpha = shootActive ? 0.8 : 0.35;
    ctx.fillStyle = shootActive ? '#4fc3f7' : '#1a3a5c';
    ctx.fillRect(centerX, btnY, btnSize, btnSize);
    ctx.fillStyle = '#0d2137';
    ctx.fillRect(centerX + 2, btnY + 2, btnSize - 4, btnSize - 4);
    if (shootActive) { ctx.fillStyle = '#4fc3f7'; ctx.fillRect(centerX + 2, btnY + 2, btnSize - 4, btnSize - 4); }
    ctx.restore();
    Game.UI.textBold(ctx, 'TIRO', centerX + btnSize / 2, btnY + btnSize / 2 - 3, 11, shootActive ? '#fff' : '#4fc3f7', 'center');

    // Bomb button (orange)
    var bombX = centerX + btnSize + 10;
    ctx.save();
    ctx.globalAlpha = bombActive ? 0.8 : (bombReady ? 0.35 : 0.15);
    ctx.fillStyle = bombActive ? '#ff9800' : '#4a2800';
    ctx.fillRect(bombX, btnY, btnSize, btnSize);
    ctx.fillStyle = '#2a1500';
    ctx.fillRect(bombX + 2, btnY + 2, btnSize - 4, btnSize - 4);
    if (bombActive) { ctx.fillStyle = '#ff9800'; ctx.fillRect(bombX + 2, btnY + 2, btnSize - 4, btnSize - 4); }
    ctx.restore();
    Game.UI.textBold(ctx, 'BOMBA', bombX + btnSize / 2, btnY + btnSize / 2 - 8, 9, bombReady ? '#ff9800' : '#555', 'center');
    Game.UI.text(ctx, '5$', bombX + btnSize / 2, btnY + btnSize / 2 + 8, 8, bombReady ? '#ffd700' : '#333', 'center');
    // Cooldown indicator
    if (this.bombCooldown > 0) {
      var cdPct = this.bombCooldown / 3000;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#000';
      ctx.fillRect(bombX + 2, btnY + 2, (btnSize - 4) * cdPct, btnSize - 4);
      ctx.restore();
    }

    // Right side: thrust/brake
    var rightX = W - btnSize - margin;
    this.drawControlBtn(ctx, rightX, btnY - btnSize - 10, btnSize, '^', this.pressing.thrust);
    this.drawControlBtn(ctx, rightX, btnY, btnSize, 'v', this.pressing.brake);

    // Handle mouse/touch on buttons
    var mx = Game.Input.mouse.x;
    var my = Game.Input.mouse.y;
    var mDown = Game.Input.mouse.down;

    this.pressing.left = false;
    this.pressing.right = false;
    this.pressing.thrust = false;
    this.pressing.brake = false;
    this.pressing.shoot = false;
    this.pressing.bomb = false;

    if (mDown) {
      if (mx >= leftX && mx <= leftX + btnSize && my >= btnY && my <= btnY + btnSize) this.pressing.left = true;
      if (mx >= leftX + btnSize + 10 && mx <= leftX + btnSize * 2 + 10 && my >= btnY && my <= btnY + btnSize) this.pressing.right = true;
      if (mx >= rightX && mx <= rightX + btnSize && my >= btnY - btnSize - 10 && my <= btnY - 10) this.pressing.thrust = true;
      if (mx >= rightX && mx <= rightX + btnSize && my >= btnY && my <= btnY + btnSize) this.pressing.brake = true;
      if (mx >= centerX && mx <= centerX + btnSize && my >= btnY && my <= btnY + btnSize) this.pressing.shoot = true;
      if (mx >= bombX && mx <= bombX + btnSize && my >= btnY && my <= btnY + btnSize) this.pressing.bomb = true;
    }
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
      Game.changeStateImmediate(Game.States.LAUNCH_BASE);
      return;
    }
  },

  startTravel: function() {
    // Check if route crosses a black hole
    var from = Game.PlanetData[Game.saveData.currentPlanet];
    var to = Game.PlanetData[this.selectedPlanet];
    var blackHoleHit = this.checkBlackHoleRoute(from.gx, from.gy, to.gx, to.gy);

    if (blackHoleHit) {
      this.alertText = 'PERIGO! Rota cruza o buraco negro ' + blackHoleHit.name + '!';
      this.alertTimer = 3;
      if (Game.Audio) Game.Audio.sfx.warning();
      Game.triggerShake(4, 0.5);
    }

    // Calculate distance for flight
    var dx = to.gx - from.gx;
    var dy = to.gy - from.gy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var flightDist = Math.max(3000, Math.floor(dist * 2500));

    Game.saveData.targetPlanet = this.selectedPlanet;
    Game.Save.save(Game.saveData);

    if (Game.Audio) Game.Audio.sfx.launch();
    Game.changeStateImmediate(Game.States.FLIGHT, {
      targetPlanet: this.selectedPlanet,
      flightDistance: flightDist,
      blackHole: blackHoleHit
    });
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
    var expBtnX = ix + 20, expBtnY = ih - 30, expBtnW = 180, expBtnH = 35;
    var expHovered = Game.UI.isMouseInRect(expBtnX, expBtnY, expBtnW, expBtnH);
    Game.UI.button(ctx, 'EXPLORAR (E)', expBtnX, expBtnY, expBtnW, expBtnH, expHovered, '#4caf50');
    this.exploreBtnBounds = { x: expBtnX, y: expBtnY, w: expBtnW, h: expBtnH };

    // Controls
    Game.UI.text(ctx, 'E: Explorar planeta | M: Musica | ESC: Menu', ix + 10, ih + 10, 9, '#444');
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
  terrainWidth: 2400,
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

    // Place shop and rocket pad
    this.shopPos.x = Math.floor(this.terrainWidth * 0.3);
    this.shopPos.y = this.terrain[this.shopPos.x];
    this.rocketPadPos.x = Math.floor(this.terrainWidth * 0.65);
    this.rocketPadPos.y = this.terrain[this.rocketPadPos.x];

    // Flatten terrain
    this.flattenArea(this.shopPos.x - 50, this.shopPos.x + 50, this.shopPos.y);
    this.flattenArea(this.rocketPadPos.x - 50, this.rocketPadPos.x + 50, this.rocketPadPos.y);

    // Easter egg placement
    if (Game.saveData.easterEggPlanet === this.planetIndex && !Game.saveData.foundEasterEgg) {
      var eggX = Math.floor(this.terrainWidth * (0.85 + Math.random() * 0.1)); // far right
      this.easterEggPos = { x: eggX, y: this.terrain[Math.min(eggX, this.terrain.length - 1)] };
    }

    // Create astronaut
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

    // Interact (E key)
    if (Game.Input.wasPressed('e') || Game.Input.wasPressed('E')) {
      if (this.nearShop) {
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

    // Astronaut
    this.astronaut.render(ctx, camX, 0);

    // Particles
    Game.EntityManager.renderAll(ctx, camX, 0);

    // HUD
    Game.UI.renderExploreHUD(ctx, Game.saveData);

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
