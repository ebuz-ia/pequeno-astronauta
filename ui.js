// ============================================
// ui.js - HUD, Shop, Starmap, Pause, Dialog, UI helpers
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

  // --- Panel ---
  panel: function(ctx, x, y, w, h, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 0.85;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  },

  // --- Button ---
  button: function(ctx, text, x, y, w, h, isHovered, color) {
    var bgColor = isHovered ? (color || '#4fc3f7') : '#2a2a4a';
    var textColor = isHovered ? '#1a1a2e' : '#fff';

    ctx.save();
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = color || '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.stroke();

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

  // --- HUD ---
  renderHUD: function(ctx, data) {
    // HP Bar (top-left)
    if (data.hp !== undefined) {
      // Heart icon
      ctx.fillStyle = '#f44336';
      ctx.font = '16px Arial';
      ctx.textBaseline = 'middle';
      ctx.fillText('\u2665', 15, 25);

      Game.Draw.hpBar(ctx, 35, 18, 120, 14, data.hp, data.maxHp);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.ceil(data.hp) + '/' + data.maxHp, 95, 25);
      ctx.textAlign = 'left';
    }

    // Coins (top-right)
    if (data.coins !== undefined) {
      Game.Draw.coin(ctx, Game.CANVAS_W - 80, 22, performance.now() / 1000);
      Game.UI.textBold(ctx, '' + data.coins, Game.CANVAS_W - 60, 15, 16, '#ffd700', 'left');
    }

    // State label (top-center)
    if (data.label) {
      Game.UI.textBold(ctx, data.label, Game.CANVAS_W / 2, 10, 14, '#4fc3f7', 'center');
    }

    // Wave info
    if (data.wave) {
      Game.UI.text(ctx, 'Onda ' + data.wave + '/' + data.totalWaves + ' - Aliens: ' + data.enemiesLeft,
        Game.CANVAS_W / 2, 30, 12, '#aaa', 'center');
    }
  },

  // --- Pause Overlay ---
  renderPause: function(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, Game.CANVAS_W, Game.CANVAS_H);

    Game.UI.textBold(ctx, 'PAUSADO', Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 50, 40, '#fff', 'center', 'middle');
    Game.UI.text(ctx, 'Pressione ESC para continuar', Game.CANVAS_W / 2, Game.CANVAS_H / 2 + 10, 16, '#aaa', 'center', 'middle');

    var btnW = 200, btnH = 40;
    var btnX = Game.CANVAS_W / 2 - btnW / 2;
    var btnY = Game.CANVAS_H / 2 + 50;
    var hovered = Game.UI.isMouseInRect(btnX, btnY, btnW, btnH);

    Game.UI.button(ctx, 'Voltar ao Hub', btnX, btnY, btnW, btnH, hovered, '#ff6b35');

    if (hovered && Game.Input.mouse.clicked) {
      Game.paused = false;
      Game.changeState(Game.States.HUB);
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
    if (this.dialog.timer > 0) {
      this.dialog.timer -= dt;
    }
  },

  renderDialog: function(ctx) {
    if (this.dialog.timer <= 0) return;

    var alpha = Math.min(1, this.dialog.timer);
    ctx.save();
    ctx.globalAlpha = alpha;

    var w = 400, h = 40;
    var x = Game.CANVAS_W / 2 - w / 2;
    var y = Game.CANVAS_H - 70;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 1;
    ctx.stroke();

    Game.UI.textBold(ctx, this.dialog.text, Game.CANVAS_W / 2, y + h / 2, 14, '#fff', 'center', 'middle');

    ctx.restore();
  }
};

// --- Shop UI ---
Game.ShopUI = {
  upgrades: [
    { key: 'hp', name: 'Escudo', cost: 50, icon: 'shield', desc: '+25 HP', color: '#4caf50', maxLevel: 5 },
    { key: 'dmg', name: 'Dano', cost: 75, icon: 'sword', desc: '+5 Dano', color: '#f44336', maxLevel: 5 },
    { key: 'speed', name: 'Velocidade', cost: 60, icon: 'boot', desc: '+20% Vel', color: '#2196f3', maxLevel: 5 },
    { key: 'fireRate', name: 'Cadencia', cost: 80, icon: 'bullet', desc: '-50ms Cooldown', color: '#ff9800', maxLevel: 5 }
  ],

  render: function(ctx, saveData) {
    var panelW = 560, panelH = 340;
    var panelX = (Game.CANVAS_W - panelW) / 2;
    var panelY = (Game.CANVAS_H - panelH) / 2;

    Game.UI.panel(ctx, panelX, panelY, panelW, panelH);

    // Title
    Game.UI.textBold(ctx, 'LOJA DE UPGRADES', Game.CANVAS_W / 2, panelY + 20, 22, '#4fc3f7', 'center');

    // Coins display
    Game.Draw.coin(ctx, Game.CANVAS_W / 2 - 50, panelY + 52, performance.now() / 1000);
    Game.UI.textBold(ctx, '' + saveData.coins, Game.CANVAS_W / 2 - 35, panelY + 45, 16, '#ffd700', 'left');

    // Cards 2x2
    var cardW = 230, cardH = 100;
    var startX = panelX + 30;
    var startY = panelY + 75;
    var gapX = 270, gapY = 115;

    for (var i = 0; i < this.upgrades.length; i++) {
      var u = this.upgrades[i];
      var col = i % 2;
      var row = Math.floor(i / 2);
      var cx = startX + col * gapX;
      var cy = startY + row * gapY;
      var level = saveData.upgrades[u.key] || 0;
      var maxed = level >= u.maxLevel;
      var cost = u.cost * (level + 1); // Scaling cost
      var canBuy = !maxed && saveData.coins >= cost;
      var hovered = Game.UI.isMouseInRect(cx, cy, cardW, cardH);

      // Card background
      ctx.save();
      ctx.fillStyle = hovered && canBuy ? '#2a2a4a' : '#1e1e38';
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, 8);
      ctx.fill();
      ctx.strokeStyle = hovered && canBuy ? u.color : '#333';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Icon
      this.renderIcon(ctx, u.icon, cx + 25, cy + 35, u.color);

      // Name + level
      Game.UI.textBold(ctx, u.name, cx + 55, cy + 15, 16, '#fff');
      Game.UI.text(ctx, 'Nivel ' + level + '/' + u.maxLevel, cx + 55, cy + 35, 12, '#aaa');
      Game.UI.text(ctx, u.desc, cx + 55, cy + 55, 12, u.color);

      // Cost or MAX
      if (maxed) {
        Game.UI.textBold(ctx, 'MAX', cx + cardW - 40, cy + 40, 14, '#ffd700', 'center', 'middle');
      } else {
        Game.UI.textBold(ctx, cost + '$', cx + cardW - 40, cy + 35, 14,
          canBuy ? '#ffd700' : '#666', 'center');
        if (canBuy) {
          Game.UI.text(ctx, 'Clique', cx + cardW - 40, cy + 55, 10, '#4fc3f7', 'center');
        }
      }

      // Handle click
      if (hovered && canBuy && Game.Input.mouse.clicked) {
        saveData.coins -= cost;
        saveData.upgrades[u.key] = level + 1;
        Game.Save.save(saveData);
        Game.spawnParticles(cx + cardW / 2, cy + cardH / 2, 10, u.color);
      }
    }

    // Close hint
    Game.UI.text(ctx, 'ESC para fechar', Game.CANVAS_W / 2, panelY + panelH - 25, 12, '#666', 'center');
  },

  renderIcon: function(ctx, type, x, y, color) {
    ctx.save();
    ctx.fillStyle = color;

    switch (type) {
      case 'shield':
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x + 10, y - 6);
        ctx.lineTo(x + 10, y + 4);
        ctx.lineTo(x, y + 12);
        ctx.lineTo(x - 10, y + 4);
        ctx.lineTo(x - 10, y - 6);
        ctx.closePath();
        ctx.fill();
        break;
      case 'sword':
        ctx.fillRect(x - 2, y - 14, 4, 20);
        ctx.fillRect(x - 8, y - 2, 16, 4);
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(x - 3, y + 6, 6, 8);
        break;
      case 'boot':
        ctx.fillRect(x - 6, y - 10, 8, 16);
        ctx.fillRect(x - 6, y + 4, 14, 6);
        break;
      case 'bullet':
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 3, y, 6, 12);
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(x - 4, y + 8, 8, 4);
        break;
    }
    ctx.restore();
  }
};

// --- Starmap UI ---
Game.StarmapUI = {
  planets: [
    { name: 'Planeta Verde', color: '#4caf50', bgColor: '#1a2e1a', level: 0 },
    { name: 'Planeta Vermelho', color: '#f44336', bgColor: '#2e1a1a', level: 1 },
    { name: 'Planeta Roxo', color: '#9c27b0', bgColor: '#2a1a2e', level: 2 }
  ],

  render: function(ctx, saveData) {
    var panelW = 600, panelH = 300;
    var panelX = (Game.CANVAS_W - panelW) / 2;
    var panelY = (Game.CANVAS_H - panelH) / 2;

    Game.UI.panel(ctx, panelX, panelY, panelW, panelH);

    // Title
    Game.UI.textBold(ctx, 'MAPA ESTELAR', Game.CANVAS_W / 2, panelY + 20, 22, '#4fc3f7', 'center');

    // Draw line connecting planets
    ctx.strokeStyle = 'rgba(79, 195, 247, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(panelX + 110, panelY + 160);
    ctx.lineTo(panelX + panelW - 110, panelY + 160);
    ctx.stroke();
    ctx.setLineDash([]);

    // Planets
    var spacing = panelW / 4;
    for (var i = 0; i < this.planets.length; i++) {
      var p = this.planets[i];
      var px = panelX + spacing * (i + 1);
      var py = panelY + 150;
      var radius = 40;

      var cleared = saveData.planetsCleared.indexOf(p.level) !== -1;
      var locked = p.level > 0 && saveData.planetsCleared.indexOf(p.level - 1) === -1;
      var hovered = !locked && Game.Collision.pointCircle(Game.Input.mouse.x, Game.Input.mouse.y,
        { x: px, y: py, radius: radius });

      // Planet glow
      if (hovered && !locked) {
        ctx.beginPath();
        ctx.arc(px, py, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(79, 195, 247, 0.2)';
        ctx.fill();
      }

      // Planet circle
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = locked ? '#333' : p.color;
      ctx.fill();

      if (!locked) {
        ctx.strokeStyle = hovered ? '#fff' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = hovered ? 3 : 1;
        ctx.stroke();
      }

      // Planet surface details
      if (!locked) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(px - 10, py - 5, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px + 15, py + 10, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
      }

      // Name
      Game.UI.textBold(ctx, p.name, px, py + 55, 13, locked ? '#555' : '#fff', 'center');

      // Difficulty stars
      var diffText = '';
      for (var s = 0; s <= p.level; s++) diffText += '\u2605';
      Game.UI.text(ctx, diffText, px, py + 72, 12, locked ? '#555' : '#ff9800', 'center');

      // Cleared checkmark
      if (cleared) {
        ctx.fillStyle = '#4caf50';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\u2713', px, py);
      }

      // Lock icon
      if (locked) {
        ctx.fillStyle = '#666';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('\uD83D\uDD12', px, py);
      }

      // Click to select planet
      if (hovered && !locked && Game.Input.mouse.clicked) {
        Game.selectedPlanet = p.level;
        Game.changeState(Game.States.SPACE_TRAVEL, { planetLevel: p.level });
      }
    }

    // Close hint
    Game.UI.text(ctx, 'ESC para fechar', Game.CANVAS_W / 2, panelY + panelH - 25, 12, '#666', 'center');
  }
};
