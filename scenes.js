// ============================================
// scenes.js - MENU, FLIGHT, PLANET_EXPLORE
// Pequeno Astronauta v2.5 - Robot + Puzzles + Easter Egg
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
    // Assign easter egg planet if not set
    if (Game.saveData.easterEggPlanet === -1) {
      Game.saveData.easterEggPlanet = 1 + Math.floor(Math.random() * 4); // 1-4 (not Terra)
      Game.Save.save(Game.saveData);
    }
    if (Game.saveData.currentPlanet > 0 || Game.saveData.coins > 100) {
      Game.changeState(Game.States.PLANET_EXPLORE, { planetIndex: Game.saveData.currentPlanet });
    } else {
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

    this.drawColorTitle(ctx, 'PEQUENO', Game.CANVAS_W / 2, titleY, titleScale);
    this.drawColorTitle(ctx, 'ASTRONAUTA', Game.CANVAS_W / 2, titleY + titleScale * 7, titleScale);

    // Subtitle
    Game.UI.text(ctx, 'Uma aventura espacial em pixel art', Game.CANVAS_W / 2, titleY + titleScale * 15, 14, '#78909c', 'center');

    // Animated rocket in center
    var rocketY = 260 + Math.sin(this.time * 2) * 8;
    Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, Game.CANVAS_W / 2, rocketY, 3);
    Game.Pixel.drawCentered(ctx, Game.Sprites.flame[this.flameFrame], Game.CANVAS_W / 2, rocketY + 45, 3);

    // Robot companion floating near rocket
    if (Game.Sprites.robot) {
      var robotX = Game.CANVAS_W / 2 - 50 + Math.sin(this.time * 1.5) * 10;
      var robotY = rocketY - 10 + Math.cos(this.time * 2) * 6;
      Game.Pixel.drawCentered(ctx, Game.Sprites.robot, robotX, robotY, 2);
    }

    // Small astronaut on the ground
    var astSprite = Math.floor(this.time * 3) % 2 === 0 ? Game.Sprites.astronautIdle : Game.Sprites.astronautWalk1;
    Game.Pixel.draw(ctx, astSprite, Game.CANVAS_W / 2 + 100, groundY - 32, 2);

    // "JOGAR" button
    var btnW = 160, btnH = 44;
    var btnX = Game.CANVAS_W / 2 - btnW / 2;
    var btnY = 380;
    var hovered = Game.UI.isMouseInRect(btnX, btnY, btnW, btnH);

    var pulse = Math.sin(this.time * 3) * 0.2 + 0.8;
    ctx.save();
    ctx.globalAlpha = pulse * 0.3;
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(btnX - 4, btnY - 4, btnW + 8, btnH + 8);
    ctx.restore();

    this.btnBounds = Game.UI.button(ctx, 'JOGAR', btnX, btnY, btnW, btnH, hovered, '#4caf50');

    // Check for save
    var save = Game.Save.load();
    if (save.coins !== 100 || save.currentPlanet > 0) {
      Game.UI.text(ctx, 'Continuar jogo salvo', Game.CANVAS_W / 2, btnY + btnH + 8, 11, '#666', 'center');
    }

    // Controls hint
    Game.UI.text(ctx, 'WASD: Mover | ESPACO: Pular/Atirar | E: Interagir | R: Robo | ESC: Pausar',
      Game.CANVAS_W / 2, Game.CANVAS_H - 25, 11, '#3a3a5a', 'center');

    // Version
    Game.UI.text(ctx, 'v2.5', Game.CANVAS_W - 30, Game.CANVAS_H - 20, 10, '#333', 'right');
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

    // Draw connections
    for (var c = 0; c < this.connections.length; c++) {
      var conn = this.connections[c];
      var ly = py + 80 + conn.left * 55;
      var ry = py + 80 + conn.right * 55;
      ctx.strokeStyle = this.colors[conn.left];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px + 60, ly);
      ctx.lineTo(px + 340, ry);
      ctx.stroke();
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

    // Robot companion
    if (Game.saveData.hasRobot) {
      this.robot = new Game.Robot(this.rocket);
      this.robot.deployed = true;
      this.robot.mode = 'shoot'; // default to shoot in flight
    } else {
      this.robot = null;
    }

    Game.EntityManager.clear();
  },

  update: function(dt) {
    this.time += dt;

    // Repair puzzle substate
    if (Game.subState === Game.SubStates.REPAIR) {
      Game.RepairPuzzle.update(dt);
      return;
    }

    // Pause
    if (Game.Input.wasPressed('Escape')) {
      Game.paused = !Game.paused;
      return;
    }

    // Robot mode toggle (R key)
    if (this.robot && Game.Input.wasPressed('r') || Game.Input.wasPressed('R')) {
      if (this.robot) this.robot.cycleMode();
    }

    // Update rocket
    this.rocket.update(dt);

    // Check HP for repair prompt
    if (this.rocket.hp <= 30 && this.rocket.hp > 0 && !this.repairPromptShown && Game.saveData.hasRobot) {
      this.repairPromptShown = true;
      Game.showMessage('HP baixo! Pressione F para reparar', 3);
    }

    // Start repair puzzle
    if (Game.Input.wasPressed('f') || Game.Input.wasPressed('F')) {
      if (this.rocket.hp <= 50 && this.rocket.hp > 0 && Game.saveData.hasRobot) {
        Game.subState = Game.SubStates.REPAIR;
        var self = this;
        Game.RepairPuzzle.start(function() {
          self.rocket.hp = Math.min(self.rocket.maxHp, self.rocket.hp + 40);
          self.repairPromptShown = false;
        });
        return;
      }
    }

    // Background phase
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

    // Starfield
    var scrollSpeed = this.rocket.fuel > 0 ? 1 : 0.3;
    this.starfield.update(dt * scrollSpeed, 'down');

    // Update robot
    if (this.robot) {
      this.robot.owner = this.rocket;
      this.robot.update(dt);
    }

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
            Game.EntityManager.add('coins', Game.createCoin(meteors[m].x, meteors[m].y, 3 + Math.floor(Math.random() * 4)));
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

    // Enemy bullets vs rocket
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

    // Parachute landed
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

    // Sky background
    if (this.bgPhase === 0) {
      var grad = ctx.createLinearGradient(0, 0, 0, Game.CANVAS_H);
      grad.addColorStop(0, planet.skyTop);
      grad.addColorStop(1, planet.skyBottom);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
    } else if (this.bgPhase === 2 && currentPlanet + 1 < Game.PlanetData.length) {
      var nextPlanet = Game.PlanetData[currentPlanet + 1];
      var grad2 = ctx.createLinearGradient(0, 0, 0, Game.CANVAS_H);
      grad2.addColorStop(0, nextPlanet.skyTop);
      grad2.addColorStop(1, nextPlanet.skyBottom);
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);
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

    // Robot
    if (this.robot) this.robot.render(ctx);

    // Event warning
    if (this.eventActive) {
      var blink = Math.sin(Game.time * 6) > 0;
      if (blink) {
        var evtText = this.eventActive.type === 'meteor_shower' ? 'CHUVA DE METEOROS' : 'FROTA INIMIGA';
        Game.UI.textBold(ctx, evtText, Game.CANVAS_W / 2, 55, 12, '#ff9800', 'center');
      }
    }

    // Repair prompt
    if (this.rocket.hp <= 50 && this.rocket.hp > 0 && Game.saveData.hasRobot) {
      var repBlink = Math.sin(Game.time * 4) > 0;
      if (repBlink) {
        Game.UI.textBold(ctx, '[F] Reparar Foguete', Game.CANVAS_W / 2, 70, 11, '#ff9800', 'center');
      }
    }

    // Robot mode indicator
    if (this.robot && this.robot.deployed) {
      var modeNames = { follow: 'Seguindo', shoot: 'Atirando', collect: 'Coletando' };
      var modeColors = { follow: '#4fc3f7', shoot: '#f44336', collect: '#ffd700' };
      Game.UI.text(ctx, 'Robo: ' + modeNames[this.robot.mode] + ' [R]', 50, Game.CANVAS_H - 45, 10, modeColors[this.robot.mode]);
    }

    // HUD
    Game.UI.renderFlightHUD(ctx, this.rocket, Game.saveData);

    // Repair puzzle overlay
    if (Game.subState === Game.SubStates.REPAIR) {
      Game.RepairPuzzle.render(ctx);
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
      } else if (this.nearRocket) {
        if (Game.saveData.fuel > 0) {
          Game.Save.save(Game.saveData);
          Game.changeState(Game.States.FLIGHT);
        } else {
          Game.UI.showDialog('Sem fuel! Compre na loja.', 2);
        }
      } else if (this.nearEasterEgg && !Game.saveData.foundEasterEgg) {
        // Found easter egg!
        Game.saveData.foundEasterEgg = true;
        Game.Save.save(Game.saveData);
        this.easterEggPos = null;
        Game.showMessage('NUCLEO ESTELAR encontrado! -30% consumo fuel!', 4);
        Game.spawnParticles(this.astronaut.x, this.astronaut.y - 20, 30, '#e040fb', 2);
        Game.triggerShake(6, 0.5);
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
      Game.Pixel.drawCentered(ctx, Game.Sprites.shopTent, shopScreenX, this.shopPos.y - 18, 2);

      // Animated bell on top
      var bellSwing = Math.sin(this.bellAnim) * (this.nearShop ? 8 : 0);
      ctx.save();
      ctx.translate(shopScreenX, this.shopPos.y - 54);
      ctx.rotate(bellSwing * Math.PI / 180);
      Game.Pixel.drawCentered(ctx, Game.Sprites.bell, 0, 0, 2);
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
      Game.Pixel.drawCentered(ctx, Game.Sprites.spaceStation, rktScreenX, this.rocketPadPos.y - 24, 2);

      // Rocket on top
      Game.Pixel.drawCentered(ctx, Game.Sprites.rocket, rktScreenX, this.rocketPadPos.y - 60, 2);

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
        Game.Pixel.drawCentered(ctx, Game.Sprites.easterEggGlow, eggScreenX, this.easterEggPos.y - 8, 2);

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
          ctx.fillStyle = '#8b4513';
          ctx.beginPath();
          ctx.moveTo(sx - 20 * s, sy);
          ctx.lineTo(sx - 5 * s, sy - 30 * s);
          ctx.lineTo(sx + 5 * s, sy - 30 * s);
          ctx.lineTo(sx + 20 * s, sy);
          ctx.closePath();
          ctx.fill();
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
