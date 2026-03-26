// ============================================
// ui.js - HUD, ShopUI, Pause, Dialog, UI helpers
// Pequeno Astronauta v2.0 - Pixel Art Edition
// ============================================

window.Game = window.Game || {};

Game.UI = {
  // --- Text Helper ---
  text: function(ctx, str, x, y, size, color, align, baseline) {
    ctx.fillStyle = color || '#fff';
    ctx.font = (size || 16) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'top';
    ctx.fillText(str, x, y);
  },

  textBold: function(ctx, str, x, y, size, color, align, baseline) {
    ctx.fillStyle = color || '#fff';
    ctx.font = 'bold ' + (size || 16) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.textBaseline = baseline || 'top';
    ctx.fillText(str, x, y);
  },

  // --- Pixel text (blocky) ---
  pixelText: function(ctx, str, x, y, scale, color) {
    ctx.fillStyle = color || '#fff';
    var s = scale || 2;
    var chars = str.toUpperCase().split('');
    var cx = x;
    for (var i = 0; i < chars.length; i++) {
      var glyph = this.glyphs[chars[i]];
      if (glyph) {
        for (var r = 0; r < glyph.length; r++) {
          for (var c = 0; c < glyph[r].length; c++) {
            if (glyph[r][c]) {
              ctx.fillRect(cx + c * s, y + r * s, s, s);
            }
          }
        }
        cx += (glyph[0].length + 1) * s;
      } else {
        cx += 3 * s; // space
      }
    }
  },

  // Minimal pixel font glyphs (5 tall)
  glyphs: {
    'P': [[1,1,1],[1,0,1],[1,1,1],[1,0,0],[1,0,0]],
    'E': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,1,1]],
    'Q': [[0,1,0],[1,0,1],[1,0,1],[1,0,1],[0,1,1]],
    'U': [[1,0,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    'N': [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
    'O': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
    'S': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    'T': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[0,1,0]],
    'R': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,0,1]],
    'I': [[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
    'L': [[1,0,0],[1,0,0],[1,0,0],[1,0,0],[1,1,1]],
    'D': [[1,1,0],[1,0,1],[1,0,1],[1,0,1],[1,1,0]],
    'C': [[0,1,1],[1,0,0],[1,0,0],[1,0,0],[0,1,1]],
    'M': [[1,0,1],[1,1,1],[1,1,1],[1,0,1],[1,0,1]],
    'V': [[1,0,1],[1,0,1],[1,0,1],[0,1,0],[0,1,0]],
    'J': [[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,0]],
    'G': [[0,1,1],[1,0,0],[1,0,1],[1,0,1],[0,1,1]],
    'F': [[1,1,1],[1,0,0],[1,1,0],[1,0,0],[1,0,0]],
    'H': [[1,0,1],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
    'B': [[1,1,0],[1,0,1],[1,1,0],[1,0,1],[1,1,0]],
    'K': [[1,0,1],[1,1,0],[1,0,0],[1,1,0],[1,0,1]],
    'W': [[1,0,1],[1,0,1],[1,1,1],[1,1,1],[1,0,1]],
    'X': [[1,0,1],[0,1,0],[0,1,0],[0,1,0],[1,0,1]],
    'Y': [[1,0,1],[1,0,1],[0,1,0],[0,1,0],[0,1,0]],
    'Z': [[1,1,1],[0,0,1],[0,1,0],[1,0,0],[1,1,1]],
    '0': [[1,1,1],[1,0,1],[1,0,1],[1,0,1],[1,1,1]],
    '1': [[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
    '2': [[1,1,1],[0,0,1],[1,1,1],[1,0,0],[1,1,1]],
    '3': [[1,1,1],[0,0,1],[1,1,1],[0,0,1],[1,1,1]],
    '4': [[1,0,1],[1,0,1],[1,1,1],[0,0,1],[0,0,1]],
    '5': [[1,1,1],[1,0,0],[1,1,1],[0,0,1],[1,1,1]],
    '6': [[1,1,1],[1,0,0],[1,1,1],[1,0,1],[1,1,1]],
    '7': [[1,1,1],[0,0,1],[0,0,1],[0,1,0],[0,1,0]],
    '8': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
    '9': [[1,1,1],[1,0,1],[1,1,1],[0,0,1],[1,1,1]],
    '/': [[0,0,1],[0,0,1],[0,1,0],[1,0,0],[1,0,0]],
    ':': [[0],[1],[0],[1],[0]],
    '+': [[0,0,0],[0,1,0],[1,1,1],[0,1,0],[0,0,0]],
    '-': [[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
    '.': [[0],[0],[0],[0],[1]],
    '%': [[1,0,1],[0,0,1],[0,1,0],[1,0,0],[1,0,1]]
  },

  // --- Panel ---
  panel: function(ctx, x, y, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 0.9;
    ctx.fillStyle = '#0f0f20';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },

  // --- Button ---
  button: function(ctx, text, x, y, w, h, isHovered, color) {
    var bgColor = isHovered ? (color || '#4fc3f7') : '#1a1a30';
    var textColor = isHovered ? '#0a0a15' : '#fff';

    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color || '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();

    return { x: x, y: y, w: w, h: h };
  },

  // --- Check if mouse is inside rect ---
  isMouseInRect: function(x, y, w, h) {
    var m = Game.Input.mouse;
    return m.x >= x && m.x <= x + w && m.y >= y && m.y <= y + h;
  },

  // --- Flight HUD ---
  renderFlightHUD: function(ctx, rocket, saveData) {
    // Fuel bar (left side, vertical)
    var fuelBarX = 16;
    var fuelBarY = 60;
    var fuelBarW = 20;
    var fuelBarH = 200;
    var fuelPct = Math.max(0, rocket.fuel / rocket.maxFuel);

    // Fuel label
    this.textBold(ctx, 'FUEL', fuelBarX + fuelBarW / 2, fuelBarY - 18, 10, '#4fc3f7', 'center');

    // Bar background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(fuelBarX, fuelBarY, fuelBarW, fuelBarH);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(fuelBarX, fuelBarY, fuelBarW, fuelBarH);

    // Fuel fill (bottom to top)
    var fillH = fuelBarH * fuelPct;
    var fuelColor = fuelPct > 0.3 ? '#4caf50' : (fuelPct > 0.15 ? '#ff9800' : '#f44336');
    ctx.fillStyle = fuelColor;
    ctx.fillRect(fuelBarX + 1, fuelBarY + fuelBarH - fillH, fuelBarW - 2, fillH);

    // Fuel text
    this.text(ctx, Math.ceil(rocket.fuel), fuelBarX + fuelBarW / 2, fuelBarY + fuelBarH + 5, 11, '#fff', 'center');

    // HP bar (below fuel)
    var hpBarY = fuelBarY + fuelBarH + 25;
    var hpPct = Math.max(0, rocket.hp / rocket.maxHp);
    this.textBold(ctx, 'HP', fuelBarX + fuelBarW / 2, hpBarY - 14, 10, '#f44336', 'center');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(fuelBarX, hpBarY, fuelBarW, 80);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(fuelBarX, hpBarY, fuelBarW, 80);
    var hpFillH = 80 * hpPct;
    ctx.fillStyle = hpPct > 0.3 ? '#f44336' : '#880000';
    ctx.fillRect(fuelBarX + 1, hpBarY + 80 - hpFillH, fuelBarW - 2, hpFillH);

    // Altimeter (right side)
    var altX = Game.CANVAS_W - 50;
    var altY = 60;
    var altH = 280;

    this.textBold(ctx, 'ALT', altX + 15, altY - 18, 10, '#4fc3f7', 'center');

    // Determine target altitude from flight scene
    var currentPlanetIdx = saveData.currentPlanet;
    var flightScene = Game.scenes.FLIGHT;
    var flightDist = flightScene ? flightScene.flightDistance : 5000;
    var altProgress = Math.min(1, rocket.altitude / flightDist);

    // Altimeter bar
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(altX, altY, 30, altH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(altX, altY, 30, altH);

    // Fill
    var altFillH = altH * altProgress;
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(altX + 1, altY + altH - altFillH, 28, altFillH);

    // Target planet marker
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(altX - 5, altY - 1, 40, 3);

    // Current altitude number
    var dispAlt = Math.floor(rocket.altitude);
    this.text(ctx, dispAlt + 'm', altX + 15, altY + altH + 5, 10, '#aaa', 'center');

    // Target planet name
    var targetIdx = flightScene ? flightScene.targetPlanetIdx : -1;
    if (targetIdx >= 0 && targetIdx < Game.PlanetData.length) {
      this.text(ctx, Game.PlanetData[targetIdx].name, altX + 15, altY - 32, 9, '#ffd700', 'center');
    }

    // Coins (top right)
    var coinFrame = Math.floor(Game.time * 6) % 4;
    Game.Pixel.draw(ctx, Game.Sprites.coin[coinFrame], Game.CANVAS_W - 120, 12, 3);
    this.textBold(ctx, '' + saveData.coins, Game.CANVAS_W - 100, 15, 16, '#ffd700', 'left');

    // Planet name (top center)
    var planetName = Game.PlanetData[currentPlanetIdx].name;
    this.textBold(ctx, 'Saindo de ' + planetName, Game.CANVAS_W / 2, 10, 14, '#4fc3f7', 'center');

    // Parachute warning
    if (rocket.parachute) {
      var blink = Math.sin(Game.time * 6) > 0;
      if (blink) {
        this.textBold(ctx, 'PARAQUEDAS ATIVADO', Game.CANVAS_W / 2, 35, 16, '#f44336', 'center');
      }
    } else if (rocket.fuel < 10 && rocket.fuel > 0) {
      var blink2 = Math.sin(Game.time * 8) > 0;
      if (blink2) {
        this.textBold(ctx, 'FUEL BAIXO!', Game.CANVAS_W / 2, 35, 14, '#ff9800', 'center');
      }
    }
  },

  // --- Planet Explore HUD ---
  renderExploreHUD: function(ctx, saveData) {
    var planet = Game.PlanetData[saveData.currentPlanet];

    // Planet name (top center)
    this.textBold(ctx, planet.name, Game.CANVAS_W / 2, 10, 18, '#fff', 'center');

    // Coins (top right)
    var coinFrame = Math.floor(Game.time * 6) % 4;
    Game.Pixel.draw(ctx, Game.Sprites.coin[coinFrame], Game.CANVAS_W - 120, 12, 3);
    this.textBold(ctx, '' + saveData.coins, Game.CANVAS_W - 100, 15, 16, '#ffd700', 'left');

    // Fuel indicator (top left)
    this.text(ctx, 'Fuel: ' + Math.ceil(saveData.fuel) + '/' + Game.getRocketStats(saveData).maxFuel, 15, 12, 13, '#4caf50');

    // Controls hint (bottom)
    this.text(ctx, 'WASD: Mover | ESPACO: Pular | E: Interagir | M: Musica | ESC: Menu', Game.CANVAS_W / 2, Game.CANVAS_H - 25, 11, 'rgba(255,255,255,0.4)', 'center');
  },

  // --- Pause Overlay ---
  renderPause: function(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    this.textBold(ctx, 'PAUSADO', Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 60, 40, '#fff', 'center', 'middle');
    this.text(ctx, 'ESC para continuar', Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 10, 16, '#aaa', 'center', 'middle');

    var btnW = 200, btnH = 40;
    var btnX = Game.CANVAS_W / 2 - btnW / 2;
    var btnY = Game.CANVAS_H / 2 + 30;
    var hovered = this.isMouseInRect(btnX, btnY, btnW, btnH);

    this.button(ctx, 'Voltar ao Menu', btnX, btnY, btnW, btnH, hovered, '#ff6b35');

    if (hovered && Game.Input.mouse.clicked) {
      Game.paused = false;
      Game.changeState(Game.States.MENU);
    }

    ctx.restore();
  },

  // --- Dialog ---
  dialog: { text: '', timer: 0 },

  showDialog: function(text, duration) {
    this.dialog.text = text;
    this.dialog.timer = duration || 3;
  },

  updateDialog: function(dt) {
    if (this.dialog.timer > 0) this.dialog.timer -= dt;
  },

  renderDialog: function(ctx) {
    if (this.dialog.timer <= 0) return;

    var alpha = Math.min(1, this.dialog.timer);
    ctx.save();
    ctx.globalAlpha = alpha;

    var w = 420, h = 36;
    var x = Game.CANVAS_W / 2 - w / 2;
    var y = Game.CANVAS_H - 60;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    this.textBold(ctx, this.dialog.text, Game.CANVAS_W / 2, y + h / 2, 13, '#fff', 'center', 'middle');
    ctx.restore();
  }
};

// ===========================
// SHOP UI (3 tabs: Parts, Fuel, Skins)
// ===========================
Game.ShopUI = {
  tab: 0, // 0=parts, 1=fuel, 2=skins, 3=robot

  open: function() {
    Game.subState = Game.SubStates.SHOP;
    this.tab = 0;
  },

  close: function() {
    Game.subState = Game.SubStates.NONE;
  },

  update: function(dt) {
    if (Game.Input.wasPressed('Escape') || Game.Input.wasPressed('e') || Game.Input.wasPressed('E')) {
      this.close();
      // Consume the key press so planet scene doesn't also process it
      Game.Input.justPressed['e'] = false;
      Game.Input.justPressed['E'] = false;
      Game.Input.justPressed['Escape'] = false;
      return;
    }
  },

  render: function(ctx, saveData) {
    var panelW = 600, panelH = 380;
    var panelX = (Game.CANVAS_W - panelW) / 2;
    var panelY = (Game.CANVAS_H - panelH) / 2;

    Game.UI.panel(ctx, panelX, panelY, panelW, panelH);

    // Title
    Game.UI.textBold(ctx, 'LOJA', Game.CANVAS_W / 2, panelY + 15, 22, '#ffd700', 'center');

    // Coins
    var coinFrame = Math.floor(Game.time * 6) % 4;
    Game.Pixel.draw(ctx, Game.Sprites.coin[coinFrame], Game.CANVAS_W / 2 - 55, panelY + 40, 3);
    Game.UI.textBold(ctx, '' + saveData.coins, Game.CANVAS_W / 2 - 35, panelY + 40, 16, '#ffd700', 'left');

    // Tab buttons
    var tabNames = ['Pecas', 'Fuel', 'Skins', 'Robo'];
    var tabColors = ['#4fc3f7', '#4caf50', '#9c27b0', '#ff9800'];
    var tabW = 105, tabH = 30;
    var tabStartX = panelX + (panelW - tabNames.length * (tabW + 10)) / 2;
    var tabY = panelY + 65;

    for (var t = 0; t < tabNames.length; t++) {
      var tx = tabStartX + t * (tabW + 10);
      var isActive = this.tab === t;
      var tabHovered = Game.UI.isMouseInRect(tx, tabY, tabW, tabH);

      ctx.fillStyle = isActive ? tabColors[t] : (tabHovered ? '#2a2a4a' : '#151525');
      ctx.fillRect(tx, tabY, tabW, tabH);
      ctx.strokeStyle = tabColors[t];
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.strokeRect(tx, tabY, tabW, tabH);

      ctx.fillStyle = isActive ? '#0a0a15' : '#fff';
      ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tabNames[t], tx + tabW / 2, tabY + tabH / 2);

      if (tabHovered && Game.Input.mouse.clicked) {
        this.tab = t;
      }
    }

    // Tab content area
    var contentY = tabY + tabH + 15;
    var contentH = panelH - (contentY - panelY) - 30;

    if (this.tab === 0) {
      this.renderPartsTab(ctx, saveData, panelX, contentY, panelW, contentH);
    } else if (this.tab === 1) {
      this.renderFuelTab(ctx, saveData, panelX, contentY, panelW, contentH);
    } else if (this.tab === 2) {
      this.renderSkinsTab(ctx, saveData, panelX, contentY, panelW, contentH);
    } else {
      this.renderRobotTab(ctx, saveData, panelX, contentY, panelW, contentH);
    }

    // Close hint
    Game.UI.text(ctx, 'ESC ou E para fechar', Game.CANVAS_W / 2, panelY + panelH - 20, 11, '#555', 'center');
  },

  renderPartsTab: function(ctx, saveData, px, py, pw, ph) {
    var parts = Game.ShopData.parts;
    var cardW = 260, cardH = 90;
    var startX = px + 20;
    var gapX = 280, gapY = 100;

    // Check which parts are available on this planet
    var planet = Game.PlanetData[saveData.currentPlanet];

    // Filter to only available parts on this planet
    var planetIdx = Game.saveData.currentPlanet || 0;
    var visibleParts = [];
    for (var fi = 0; fi < parts.length; fi++) {
      var avail = Game.ShopData.isPartAvailable ? Game.ShopData.isPartAvailable(parts[fi].key, planetIdx) : true;
      if (avail) visibleParts.push(parts[fi]);
    }

    for (var i = 0; i < visibleParts.length; i++) {
      var part = visibleParts[i];
      var col = i % 2;
      var row = Math.floor(i / 2);
      var cx = startX + col * gapX;
      var cy = py + row * gapY;
      var level = saveData.rocketParts[part.key] || 0;
      var effectiveMax = Game.ShopData.getPartMaxLevel ? Game.ShopData.getPartMaxLevel(part.key, planetIdx) : part.maxLevel;
      var maxed = level >= effectiveMax;
      var cost = Game.ShopData.getPartCost(part.key, level, planetIdx);
      var canBuy = !maxed && cost > 0 && saveData.coins >= cost;
      var available = true; // already filtered above
      var discount = Game.ShopData.getPlanetDiscount ? Game.ShopData.getPlanetDiscount(planetIdx) : 0;
      var hovered = available && Game.UI.isMouseInRect(cx, cy, cardW, cardH);

      // Card background
      ctx.fillStyle = !available ? '#0d0d18' : (hovered && canBuy ? '#252540' : '#15152a');
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = !available ? '#222' : (hovered && canBuy ? part.color : '#333');
      ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, cardW, cardH);

      // Color bar left
      ctx.fillStyle = available ? part.color : '#333';
      ctx.fillRect(cx, cy, 5, cardH);

      // Name + level
      Game.UI.textBold(ctx, part.name, cx + 15, cy + 10, 15, available ? '#fff' : '#555');
      Game.UI.text(ctx, 'Nivel ' + level + '/' + effectiveMax, cx + 15, cy + 30, 11, available ? '#aaa' : '#444');
      var descText = part.desc + '/nivel';
      if (discount > 0 && available) descText += ' (-' + Math.round(discount * 100) + '%)';
      Game.UI.text(ctx, descText, cx + 15, cy + 48, 11, available ? part.color : '#444');

      // Level pips
      for (var lv = 0; lv < effectiveMax; lv++) {
        ctx.fillStyle = lv < level ? part.color : '#333';
        ctx.fillRect(cx + 15 + lv * 14, cy + 66, 10, 6);
      }

      // Discount badge
      if (available && discount > 0 && !maxed) {
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(cx + cardW - 55, cy + 2, 52, 14);
        Game.UI.text(ctx, '-' + Math.round(discount * 100) + '% OFF', cx + cardW - 29, cy + 8, 8, '#fff', 'center');
      }

      // Cost / status
      if (!available) {
        Game.UI.text(ctx, 'Planeta avancado', cx + cardW - 65, cy + 35, 9, '#555', 'center', 'middle');
      } else if (maxed) {
        Game.UI.textBold(ctx, 'MAX', cx + cardW - 40, cy + 35, 14, '#ffd700', 'center', 'middle');
      } else {
        Game.UI.textBold(ctx, cost + '$', cx + cardW - 45, cy + 30, 14, canBuy ? '#ffd700' : '#666', 'center');
        if (canBuy) {
          Game.UI.text(ctx, 'Comprar', cx + cardW - 45, cy + 50, 10, '#4fc3f7', 'center');
        }
      }

      // Click to buy
      if (hovered && canBuy && Game.Input.mouse.clicked) {
        saveData.coins -= cost;
        saveData.rocketParts[part.key] = level + 1;
        Game.Save.save(saveData);
        Game.spawnParticles(cx + cardW / 2, cy + cardH / 2, 10, part.color);
        if (Game.Audio) Game.Audio.sfx.upgrade();
      }
    }
  },

  renderFuelTab: function(ctx, saveData, px, py, pw, ph) {
    var planet = Game.PlanetData[saveData.currentPlanet];
    var stats = Game.getRocketStats(saveData);
    var price = planet.fuelPrice;

    // Current fuel display
    var fuelPct = saveData.fuel / stats.maxFuel;
    var barX = px + 80;
    var barY = py + 20;
    var barW = pw - 160;
    var barH = 30;

    Game.UI.textBold(ctx, 'Tanque: ' + Math.ceil(saveData.fuel) + '/' + stats.maxFuel, Game.CANVAS_W / 2, barY - 5, 14, '#fff', 'center', 'middle');

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(barX, barY + 15, barW, barH);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(barX, barY + 15, barW, barH);

    var fuelColor = fuelPct > 0.3 ? '#4caf50' : (fuelPct > 0.15 ? '#ff9800' : '#f44336');
    ctx.fillStyle = fuelColor;
    ctx.fillRect(barX + 1, barY + 16, (barW - 2) * fuelPct, barH - 2);

    // Buy options
    var options = [
      { amount: 10, label: '+10 Fuel' },
      { amount: 25, label: '+25 Fuel' },
      { amount: 50, label: '+50 Fuel' },
      { amount: stats.maxFuel - saveData.fuel, label: 'Tanque Cheio' }
    ];

    var optY = barY + 65;
    var optW = 120, optH = 60;
    var optStartX = px + (pw - options.length * (optW + 15)) / 2;

    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      if (opt.amount <= 0) continue;

      var actualAmount = Math.min(opt.amount, stats.maxFuel - saveData.fuel);
      if (actualAmount <= 0) continue;

      var totalCost = Math.ceil(actualAmount * price);
      var ox = optStartX + i * (optW + 15);
      var canBuy = saveData.coins >= totalCost && actualAmount > 0;
      var hovered = Game.UI.isMouseInRect(ox, optY, optW, optH);

      ctx.fillStyle = hovered && canBuy ? '#1a2e1a' : '#15152a';
      ctx.fillRect(ox, optY, optW, optH);
      ctx.strokeStyle = hovered && canBuy ? '#4caf50' : '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, optY, optW, optH);

      Game.UI.textBold(ctx, opt.label, ox + optW / 2, optY + 15, 12, '#fff', 'center');
      Game.UI.textBold(ctx, totalCost + '$', ox + optW / 2, optY + 35, 14, canBuy ? '#ffd700' : '#666', 'center');

      if (hovered && canBuy && Game.Input.mouse.clicked) {
        saveData.coins -= totalCost;
        saveData.fuel = Math.min(saveData.fuel + actualAmount, stats.maxFuel);
        Game.Save.save(saveData);
        Game.spawnParticles(ox + optW / 2, optY + optH / 2, 8, '#4caf50');
      }
    }

    // Price info
    Game.UI.text(ctx, 'Preco por unidade: ' + price + ' moedas (planeta ' + planet.name + ')', Game.CANVAS_W / 2, optY + 80, 11, '#666', 'center');
  },

  renderSkinsTab: function(ctx, saveData, px, py, pw, ph) {
    var skins = Game.ShopData.skins;
    var cardW = 100, cardH = 100;
    var startX = px + (pw - skins.length * (cardW + 10)) / 2;

    for (var i = 0; i < skins.length; i++) {
      var skin = skins[i];
      var cx = startX + i * (cardW + 10);
      var cy = py + 20;
      var owned = saveData.unlockedSkins.indexOf(skin.key) !== -1;
      var equipped = saveData.shotSkin === skin.key;
      var canBuy = !owned && saveData.coins >= skin.cost;
      var hovered = Game.UI.isMouseInRect(cx, cy, cardW, cardH);

      // Card
      ctx.fillStyle = equipped ? '#1a2e1a' : (hovered ? '#252540' : '#15152a');
      ctx.fillRect(cx, cy, cardW, cardH);
      ctx.strokeStyle = equipped ? '#4caf50' : (hovered ? skin.color : '#333');
      ctx.lineWidth = equipped ? 2 : 1;
      ctx.strokeRect(cx, cy, cardW, cardH);

      // Shot preview (colored rectangle)
      ctx.fillStyle = skin.color;
      ctx.fillRect(cx + cardW / 2 - 3, cy + 15, 6, 20);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(cx + cardW / 2 - 1, cy + 18, 2, 14);

      // Name
      Game.UI.textBold(ctx, skin.name, cx + cardW / 2, cy + 48, 12, '#fff', 'center');

      // Status
      if (equipped) {
        Game.UI.text(ctx, 'Equipado', cx + cardW / 2, cy + 68, 10, '#4caf50', 'center');
      } else if (owned) {
        Game.UI.text(ctx, 'Equipar', cx + cardW / 2, cy + 68, 10, '#4fc3f7', 'center');
      } else {
        Game.UI.textBold(ctx, skin.cost + '$', cx + cardW / 2, cy + 66, 12, canBuy ? '#ffd700' : '#666', 'center');
        if (canBuy) Game.UI.text(ctx, 'Comprar', cx + cardW / 2, cy + 82, 10, '#4fc3f7', 'center');
      }

      // Click
      if (hovered && Game.Input.mouse.clicked) {
        if (owned && !equipped) {
          saveData.shotSkin = skin.key;
          Game.Save.save(saveData);
        } else if (canBuy) {
          saveData.coins -= skin.cost;
          saveData.unlockedSkins.push(skin.key);
          saveData.shotSkin = skin.key;
          Game.Save.save(saveData);
          Game.spawnParticles(cx + cardW / 2, cy + cardH / 2, 10, skin.color);
        }
      }
    }
  },

  renderRobotTab: function(ctx, saveData, px, py, pw, ph) {
    var hasRobot = saveData.hasRobot;
    var robotLevel = saveData.robotLevel || 0;

    // Robot preview
    if (Game.Sprites.robot) {
      Game.Pixel.drawCentered(ctx, Game.Sprites.robot, Game.CANVAS_W / 2, py + 40, 4);
    }

    if (!hasRobot) {
      // Buy robot
      var cost = 200;
      var canBuy = saveData.coins >= cost;
      Game.UI.textBold(ctx, 'Robo Companheiro', Game.CANVAS_W / 2, py + 70, 16, '#ff9800', 'center');
      Game.UI.text(ctx, 'Atira, coleta moedas e repara o foguete!', Game.CANVAS_W / 2, py + 92, 11, '#aaa', 'center');

      var btnW = 180, btnH = 40;
      var btnX = Game.CANVAS_W / 2 - btnW / 2;
      var btnY = py + 115;
      var hovered = Game.UI.isMouseInRect(btnX, btnY, btnW, btnH);

      ctx.fillStyle = hovered && canBuy ? '#2a3a2a' : '#15152a';
      ctx.fillRect(btnX, btnY, btnW, btnH);
      ctx.strokeStyle = canBuy ? '#ff9800' : '#444';
      ctx.lineWidth = 2;
      ctx.strokeRect(btnX, btnY, btnW, btnH);

      Game.UI.textBold(ctx, 'Comprar: ' + cost + '$', btnX + btnW / 2, btnY + btnH / 2, 14, canBuy ? '#ffd700' : '#666', 'center', 'middle');

      if (hovered && canBuy && Game.Input.mouse.clicked) {
        saveData.coins -= cost;
        saveData.hasRobot = true;
        saveData.robotLevel = 1;
        Game.Save.save(saveData);
        Game.spawnParticles(Game.CANVAS_W / 2, py + 40, 15, '#ff9800', 1.5);
        Game.showMessage('Robo adquirido! Use R para trocar modo.', 3);
      }
    } else {
      // Robot info and upgrades
      Game.UI.textBold(ctx, 'Robo Nivel ' + robotLevel, Game.CANVAS_W / 2, py + 70, 16, '#ff9800', 'center');

      // Modes info
      var modes = [
        { name: 'Seguir', desc: 'Segue o foguete', color: '#4fc3f7' },
        { name: 'Atirar', desc: 'Atira nos inimigos', color: '#f44336' },
        { name: 'Coletar', desc: 'Coleta moedas automaticamente', color: '#ffd700' }
      ];

      for (var i = 0; i < modes.length; i++) {
        var my = py + 95 + i * 28;
        ctx.fillStyle = modes[i].color;
        ctx.fillRect(px + 100, my, 8, 8);
        Game.UI.text(ctx, modes[i].name + ': ' + modes[i].desc, px + 115, my - 2, 11, '#ccc');
      }

      // Upgrade button
      if (robotLevel < 3) {
        var upgCost = Math.floor(150 * Math.pow(1.8, robotLevel));
        var canUpg = saveData.coins >= upgCost;
        var upgBtnW = 200, upgBtnH = 36;
        var upgBtnX = Game.CANVAS_W / 2 - upgBtnW / 2;
        var upgBtnY = py + 190;
        var upgHovered = Game.UI.isMouseInRect(upgBtnX, upgBtnY, upgBtnW, upgBtnH);

        ctx.fillStyle = upgHovered && canUpg ? '#2a3a2a' : '#15152a';
        ctx.fillRect(upgBtnX, upgBtnY, upgBtnW, upgBtnH);
        ctx.strokeStyle = canUpg ? '#ff9800' : '#444';
        ctx.lineWidth = 1;
        ctx.strokeRect(upgBtnX, upgBtnY, upgBtnW, upgBtnH);

        var upgText = 'Upgrade Nv' + (robotLevel + 1) + ': ' + upgCost + '$';
        Game.UI.textBold(ctx, upgText, upgBtnX + upgBtnW / 2, upgBtnY + upgBtnH / 2, 12, canUpg ? '#ffd700' : '#555', 'center', 'middle');

        Game.UI.text(ctx, 'Tiros mais rapidos e coleta maior', Game.CANVAS_W / 2, upgBtnY + upgBtnH + 8, 10, '#666', 'center');

        if (upgHovered && canUpg && Game.Input.mouse.clicked) {
          saveData.coins -= upgCost;
          saveData.robotLevel++;
          Game.Save.save(saveData);
          Game.spawnParticles(Game.CANVAS_W / 2, upgBtnY, 10, '#ff9800');
        }
      } else {
        Game.UI.textBold(ctx, 'NIVEL MAXIMO!', Game.CANVAS_W / 2, py + 200, 14, '#ffd700', 'center');
      }

      Game.UI.text(ctx, 'Pressione R durante o voo para trocar modo', Game.CANVAS_W / 2, py + ph - 15, 10, '#555', 'center');
    }
  }
};
