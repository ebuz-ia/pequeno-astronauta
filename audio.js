// ============================================
// audio.js - Chiptune Music + SFX via Web Audio API
// Pequeno Astronauta v2.5
// Zero external files - 100% procedural
// ============================================

window.Game = window.Game || {};

Game.Audio = {
  ctx: null,
  masterGain: null,
  musicGain: null,
  sfxGain: null,
  musicVolume: 0.25,
  sfxVolume: 0.4,
  enabled: true,
  musicEnabled: true,
  currentMusic: null,
  musicTimers: [],
  initialized: false,

  init: function() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.6;

      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.musicVolume;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.sfxVolume;

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
      this.enabled = false;
    }
  },

  resume: function() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  // --- SFX Engine ---
  playTone: function(freq, duration, type, volume, delay) {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    var t = this.ctx.currentTime + (delay || 0);
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);

    var vol = volume !== undefined ? volume : 0.3;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  },

  playNoise: function(duration, volume, delay) {
    if (!this.enabled || !this.ctx) return;
    this.resume();

    var t = this.ctx.currentTime + (delay || 0);
    var bufferSize = this.ctx.sampleRate * duration;
    var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    var source = this.ctx.createBufferSource();
    source.buffer = buffer;

    var gain = this.ctx.createGain();
    source.connect(gain);
    gain.connect(this.sfxGain);

    gain.gain.setValueAtTime(volume || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    source.start(t);
    source.stop(t + duration + 0.05);
  },

  // --- Sound Effects ---
  sfx: {
    shoot: function() {
      Game.Audio.playTone(800, 0.08, 'square', 0.2);
      Game.Audio.playTone(600, 0.06, 'square', 0.1, 0.03);
    },

    hit: function() {
      Game.Audio.playTone(200, 0.15, 'sawtooth', 0.25);
      Game.Audio.playNoise(0.1, 0.15);
    },

    explosion: function() {
      Game.Audio.playNoise(0.3, 0.2);
      Game.Audio.playTone(100, 0.2, 'sawtooth', 0.2);
      Game.Audio.playTone(60, 0.3, 'sine', 0.15, 0.05);
    },

    coin: function() {
      Game.Audio.playTone(1200, 0.06, 'square', 0.15);
      Game.Audio.playTone(1600, 0.08, 'square', 0.12, 0.06);
    },

    coinBig: function() {
      Game.Audio.playTone(1000, 0.06, 'square', 0.15);
      Game.Audio.playTone(1200, 0.06, 'square', 0.12, 0.06);
      Game.Audio.playTone(1600, 0.08, 'square', 0.15, 0.12);
      Game.Audio.playTone(2000, 0.1, 'square', 0.12, 0.18);
    },

    damage: function() {
      Game.Audio.playTone(150, 0.12, 'sawtooth', 0.3);
      Game.Audio.playTone(100, 0.15, 'square', 0.2, 0.05);
      Game.Audio.playNoise(0.08, 0.1);
    },

    launch: function() {
      Game.Audio.playTone(200, 0.5, 'sawtooth', 0.15);
      Game.Audio.playTone(300, 0.4, 'sawtooth', 0.12, 0.1);
      Game.Audio.playTone(400, 0.3, 'sawtooth', 0.1, 0.2);
      Game.Audio.playNoise(0.6, 0.08);
    },

    upgrade: function() {
      Game.Audio.playTone(400, 0.1, 'square', 0.15);
      Game.Audio.playTone(500, 0.1, 'square', 0.15, 0.1);
      Game.Audio.playTone(600, 0.1, 'square', 0.15, 0.2);
      Game.Audio.playTone(800, 0.15, 'square', 0.2, 0.3);
    },

    menuSelect: function() {
      Game.Audio.playTone(600, 0.08, 'square', 0.12);
      Game.Audio.playTone(900, 0.1, 'square', 0.1, 0.05);
    },

    parachute: function() {
      Game.Audio.playTone(600, 0.15, 'sine', 0.15);
      Game.Audio.playTone(400, 0.2, 'sine', 0.12, 0.1);
      Game.Audio.playTone(300, 0.25, 'sine', 0.1, 0.2);
    },

    repair: function() {
      Game.Audio.playTone(500, 0.08, 'square', 0.12);
      Game.Audio.playTone(700, 0.08, 'square', 0.12, 0.08);
      Game.Audio.playTone(900, 0.12, 'square', 0.15, 0.16);
    },

    easterEgg: function() {
      var notes = [523, 659, 784, 1047, 1319, 1568];
      for (var i = 0; i < notes.length; i++) {
        Game.Audio.playTone(notes[i], 0.15, 'sine', 0.12, i * 0.08);
      }
    },

    combo: function(level) {
      var baseFreq = 600 + level * 100;
      Game.Audio.playTone(baseFreq, 0.06, 'square', 0.12);
      Game.Audio.playTone(baseFreq * 1.25, 0.08, 'square', 0.1, 0.04);
    },

    milestone: function() {
      var melody = [523, 659, 784, 1047, 784, 1047, 1319];
      for (var i = 0; i < melody.length; i++) {
        Game.Audio.playTone(melody[i], 0.12, 'square', 0.15, i * 0.1);
      }
    },

    warning: function() {
      Game.Audio.playTone(300, 0.15, 'square', 0.2);
      Game.Audio.playTone(300, 0.15, 'square', 0.2, 0.3);
    },

    robotShoot: function() {
      Game.Audio.playTone(1000, 0.05, 'sine', 0.1);
      Game.Audio.playTone(800, 0.04, 'sine', 0.08, 0.02);
    }
  },

  // --- Music Engine (procedural chiptune loops) ---
  stopMusic: function() {
    for (var i = 0; i < this.musicTimers.length; i++) {
      clearTimeout(this.musicTimers[i]);
    }
    this.musicTimers = [];
    this.currentMusic = null;
  },

  playNote: function(freq, duration, type, volume, delay) {
    if (!this.enabled || !this.ctx || !this.musicEnabled) return;
    this.resume();

    var t = this.ctx.currentTime + (delay || 0);
    var osc = this.ctx.createOscillator();
    var gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);

    var vol = (volume !== undefined ? volume : 0.1);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.setValueAtTime(vol, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  },

  // Menu music - cinematic space theme (Interstellar-inspired)
  playMenuMusic: function() {
    if (this.currentMusic === 'menu') return;
    this.stopMusic();
    this.currentMusic = 'menu';
    var self = this;
    var bpm = 72;
    var b = 60 / bpm;

    // Cm - Ab - Eb - Bb progression (cinematic)
    var chords = [
      [262, 311, 392], // Cm
      [208, 262, 311], // Ab
      [311, 392, 494], // Eb
      [233, 294, 349]  // Bb
    ];
    var melody = [
      392, 0, 494, 523, 494, 0, 392, 0,
      311, 0, 392, 440, 392, 0, 311, 0,
      494, 0, 523, 587, 659, 0, 587, 523,
      349, 0, 392, 440, 392, 0, 349, 0
    ];
    var loopLen = 32 * b * 1000;

    function playLoop() {
      if (self.currentMusic !== 'menu') return;
      // Pad chords (warm sine pads)
      for (var c = 0; c < 4; c++) {
        for (var n = 0; n < 3; n++) {
          self.playNote(chords[c][n], b * 7.5, 'sine', 0.03, c * b * 8);
          self.playNote(chords[c][n] * 0.5, b * 7.5, 'triangle', 0.02, c * b * 8);
        }
      }
      // Arpeggio layer (triangle, gentle)
      for (var c2 = 0; c2 < 4; c2++) {
        for (var a = 0; a < 8; a++) {
          var note = chords[c2][a % 3] * (a < 4 ? 1 : 2);
          self.playNote(note, b * 0.4, 'triangle', 0.025, c2 * b * 8 + a * b);
        }
      }
      // Melody (sine, expressive)
      for (var i = 0; i < melody.length; i++) {
        if (melody[i] === 0) continue;
        self.playNote(melody[i], b * 1.5, 'sine', 0.05, i * b);
        self.playNote(melody[i] * 2, b * 0.8, 'sine', 0.015, i * b + b * 0.1);
      }
      // Sub bass
      var bassNotes = [131, 104, 156, 117];
      for (var bb = 0; bb < 4; bb++) {
        self.playNote(bassNotes[bb], b * 7, 'sine', 0.04, bb * b * 8);
      }
      self.musicTimers.push(setTimeout(playLoop, loopLen));
    }
    playLoop();
  },

  // Flight music - intense action (layered drums + synth)
  playFlightMusic: function() {
    if (this.currentMusic === 'flight') return;
    this.stopMusic();
    this.currentMusic = 'flight';
    var self = this;
    var bpm = 135;
    var b = 60 / bpm;

    var melody = [
      392, 440, 494, 0, 587, 0, 494, 440,
      523, 587, 659, 0, 587, 523, 494, 0,
      440, 494, 523, 0, 659, 784, 659, 587,
      523, 0, 494, 440, 392, 0, 349, 392
    ];
    var bassLine = [196, 0, 196, 196, 233, 0, 233, 196, 175, 0, 175, 175, 220, 0, 220, 196];
    var loopLen = 32 * b * 1000;

    function playLoop() {
      if (self.currentMusic !== 'flight') return;
      // Lead melody (square, punchy)
      for (var i = 0; i < melody.length; i++) {
        if (melody[i] === 0) continue;
        self.playNote(melody[i], b * 0.5, 'square', 0.045, i * b);
      }
      // Counter melody (octave up, quiet)
      for (var i2 = 0; i2 < melody.length; i2++) {
        if (melody[i2] === 0) continue;
        if (i2 % 3 === 0) self.playNote(melody[i2] * 2, b * 0.3, 'sine', 0.015, i2 * b + b * 0.5);
      }
      // Bass (sawtooth, fat)
      for (var j = 0; j < bassLine.length; j++) {
        if (bassLine[j] === 0) continue;
        self.playNote(bassLine[j], b * 1.8, 'sawtooth', 0.04, j * b * 2);
        self.playNote(bassLine[j] * 0.5, b * 1.8, 'sine', 0.03, j * b * 2);
      }
      // Kick (four on the floor)
      for (var k = 0; k < 16; k++) {
        self.playNote(50, b * 0.15, 'sine', 0.07, k * b * 2);
      }
      // Snare (offbeat)
      for (var s = 0; s < 8; s++) {
        self.playNoise(0.08, 0.04, s * b * 4 + b * 2);
      }
      // Hi-hat (8th notes)
      for (var h = 0; h < 32; h++) {
        self.playNoise(0.03, 0.015, h * b);
      }
      // Arp layer (adds energy)
      var arpNotes = [392, 494, 587, 659, 587, 494];
      for (var ar = 0; ar < 16; ar++) {
        self.playNote(arpNotes[ar % 6], b * 0.2, 'triangle', 0.02, ar * b * 2 + b);
      }
      self.musicTimers.push(setTimeout(playLoop, loopLen));
    }
    playLoop();
  },

  // Planet explore music - ambient + unique per planet
  playPlanetMusic: function(planetIndex) {
    if (this.currentMusic === 'planet' + planetIndex) return;
    this.stopMusic();
    this.currentMusic = 'planet' + planetIndex;
    var self = this;

    var configs = [
      // Terra - warm and hopeful
      { melody: [330, 392, 494, 440, 392, 349, 330, 294, 262, 294, 330, 392, 440, 494, 440, 392],
        chords: [[262,330,392],[220,262,330],[175,220,262],[196,247,294]],
        bass: [131, 110, 87, 98], bpm: 85, wave: 'sine' },
      // Lua - mysterious, ethereal
      { melody: [220, 0, 330, 294, 0, 262, 247, 0, 220, 0, 294, 330, 0, 262, 220, 0],
        chords: [[220,262,330],[196,247,330],[175,220,294],[196,262,330]],
        bass: [110, 98, 87, 98], bpm: 65, wave: 'triangle' },
      // Marte - tense, rhythmic
      { melody: [294, 349, 294, 0, 330, 392, 0, 349, 294, 0, 330, 392, 440, 0, 392, 349],
        chords: [[294,349,440],[262,330,392],[247,294,349],[262,311,392]],
        bass: [147, 131, 123, 131], bpm: 90, wave: 'square' },
      // Venus - eerie, dissonant
      { melody: [233, 277, 311, 0, 330, 0, 349, 311, 277, 0, 233, 262, 0, 311, 277, 233],
        chords: [[233,294,349],[220,277,330],[208,262,311],[220,277,349]],
        bass: [117, 110, 104, 110], bpm: 70, wave: 'sine' },
      // Plutao - cold, sparse, haunting
      { melody: [196, 0, 0, 247, 0, 0, 262, 0, 220, 0, 0, 247, 0, 0, 196, 0],
        chords: [[196,247,294],[175,220,262],[165,196,247],[175,220,294]],
        bass: [98, 87, 82, 87], bpm: 55, wave: 'triangle' }
    ];

    var cfg = configs[planetIndex % configs.length];
    var b = 60 / cfg.bpm;
    var loopLen = 16 * b * 1000;

    function playLoop() {
      if (self.currentMusic !== 'planet' + planetIndex) return;
      // Pad chords
      for (var c = 0; c < 4; c++) {
        for (var n = 0; n < 3; n++) {
          self.playNote(cfg.chords[c][n], b * 3.8, 'sine', 0.025, c * b * 4);
        }
      }
      // Melody
      for (var i = 0; i < cfg.melody.length; i++) {
        if (cfg.melody[i] === 0) continue;
        self.playNote(cfg.melody[i], b * 1.2, cfg.wave, 0.04, i * b);
        // Octave shimmer
        if (i % 4 === 0) {
          self.playNote(cfg.melody[i] * 2, b * 0.6, 'sine', 0.01, i * b + b * 0.2);
        }
      }
      // Bass
      for (var bb = 0; bb < 4; bb++) {
        self.playNote(cfg.bass[bb], b * 3.5, 'sine', 0.035, bb * b * 4);
      }
      // Ambient arp (every other loop beat)
      for (var a = 0; a < 8; a++) {
        var arpNote = cfg.chords[a % 4][a % 3];
        self.playNote(arpNote * 2, b * 0.3, 'triangle', 0.012, a * b * 2 + b * 0.5);
      }
      self.musicTimers.push(setTimeout(playLoop, loopLen));
    }
    playLoop();
  },

  toggleMusic: function() {
    this.musicEnabled = !this.musicEnabled;
    if (!this.musicEnabled) {
      this.stopMusic();
    }
    this.musicGain.gain.value = this.musicEnabled ? this.musicVolume : 0;
  },

  toggleSfx: function() {
    this.sfxVolume = this.sfxVolume > 0 ? 0 : 0.4;
    this.sfxGain.gain.value = this.sfxVolume;
  }
};

// ===========================
// FLOATING TEXT SYSTEM
// ===========================
Game.FloatingTexts = [];

Game.addFloatingText = function(text, x, y, color, size, duration) {
  Game.FloatingTexts.push({
    text: text,
    x: x, y: y,
    color: color || '#ffd700',
    size: size || 14,
    life: duration || 1.2,
    maxLife: duration || 1.2,
    vy: -60,
    active: true
  });
};

Game.updateFloatingTexts = function(dt) {
  for (var i = Game.FloatingTexts.length - 1; i >= 0; i--) {
    var ft = Game.FloatingTexts[i];
    ft.y += ft.vy * dt;
    ft.vy *= 0.97;
    ft.life -= dt;
    if (ft.life <= 0) {
      Game.FloatingTexts.splice(i, 1);
    }
  }
};

Game.renderFloatingTexts = function(ctx, offsetX, offsetY) {
  for (var i = 0; i < Game.FloatingTexts.length; i++) {
    var ft = Game.FloatingTexts[i];
    var alpha = Math.min(1, ft.life / (ft.maxLife * 0.3));
    var scale = 1 + (1 - ft.life / ft.maxLife) * 0.3;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold ' + Math.floor(ft.size * scale) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillText(ft.text, ft.x - (offsetX || 0) + 1, ft.y - (offsetY || 0) + 1);
    // Text
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x - (offsetX || 0), ft.y - (offsetY || 0));
    ctx.restore();
  }
};

// ===========================
// COMBO SYSTEM
// ===========================
Game.Combo = {
  count: 0,
  timer: 0,
  maxTimer: 3, // seconds to maintain combo
  multiplier: 1,
  bestCombo: 0,

  add: function() {
    this.count++;
    this.timer = this.maxTimer;
    this.multiplier = 1 + Math.floor(this.count / 3) * 0.5; // +0.5x every 3 kills
    if (this.multiplier > 5) this.multiplier = 5; // cap at 5x

    if (this.count > this.bestCombo) this.bestCombo = this.count;

    // Sound escalation
    if (this.count > 1) {
      Game.Audio.sfx.combo(Math.min(this.count, 8));
    }

    return this.multiplier;
  },

  update: function(dt) {
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.count = 0;
        this.multiplier = 1;
        this.timer = 0;
      }
    }
  },

  reset: function() {
    this.count = 0;
    this.timer = 0;
    this.multiplier = 1;
  },

  render: function(ctx) {
    if (this.count < 2) return;

    var x = Game.CANVAS_W / 2;
    var y = 90;
    var pulse = 1 + Math.sin(Game.time * 8) * 0.1;
    var size = Math.min(22, 14 + this.count);

    ctx.save();
    ctx.globalAlpha = Math.min(1, this.timer / 1);

    // Combo text
    ctx.fillStyle = '#0a0a1a';
    ctx.font = 'bold ' + Math.floor(size * pulse) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COMBO x' + this.count + ' (' + this.multiplier.toFixed(1) + 'x)', x + 1, y + 1);

    var comboColor = this.count >= 10 ? '#ff4081' : (this.count >= 5 ? '#ff9800' : '#ffd700');
    ctx.fillStyle = comboColor;
    ctx.fillText('COMBO x' + this.count + ' (' + this.multiplier.toFixed(1) + 'x)', x, y);

    // Timer bar
    var barW = 80;
    var barH = 4;
    var pct = this.timer / this.maxTimer;
    ctx.fillStyle = '#333';
    ctx.fillRect(x - barW / 2, y + 8, barW, barH);
    ctx.fillStyle = comboColor;
    ctx.fillRect(x - barW / 2, y + 8, barW * pct, barH);

    ctx.restore();
  }
};

// ===========================
// MILESTONE SYSTEM
// ===========================
Game.Milestones = {
  thresholds: [100, 250, 500, 1000, 2500, 5000, 10000],
  celebrated: {},
  currentCelebration: null,
  celebrationTimer: 0,

  init: function() {
    try {
      var data = localStorage.getItem('pa-milestones');
      if (data) this.celebrated = JSON.parse(data);
    } catch (e) {}
  },

  check: function(totalCoins) {
    for (var i = 0; i < this.thresholds.length; i++) {
      var t = this.thresholds[i];
      if (totalCoins >= t && !this.celebrated[t]) {
        this.celebrated[t] = true;
        this.celebrate(t);
        try { localStorage.setItem('pa-milestones', JSON.stringify(this.celebrated)); }
        catch (e) {}
        return;
      }
    }
  },

  celebrate: function(amount) {
    this.currentCelebration = amount;
    this.celebrationTimer = 3;
    Game.Audio.sfx.milestone();
    Game.triggerShake(8, 0.5);
    Game.spawnParticles(Game.CANVAS_W / 2, Game.CANVAS_H / 2, 25, '#ffd700', 2);
    Game.spawnParticles(Game.CANVAS_W / 2, Game.CANVAS_H / 2, 15, '#ff9800', 1.5);
  },

  update: function(dt) {
    if (this.celebrationTimer > 0) {
      this.celebrationTimer -= dt;
      if (this.celebrationTimer <= 0) {
        this.currentCelebration = null;
      }
    }
  },

  render: function(ctx) {
    if (!this.currentCelebration) return;

    var alpha = Math.min(1, this.celebrationTimer / 0.5);
    var scale = 1 + (3 - this.celebrationTimer) * 0.05;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Big centered text
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + Math.floor(36 * scale) + 'px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.currentCelebration + ' MOEDAS!', Game.CANVAS_W / 2, Game.CANVAS_H / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
    ctx.fillText('Marco atingido!', Game.CANVAS_W / 2, Game.CANVAS_H / 2 + 20);

    // Decorative ring
    var ringAlpha = Math.sin(Game.time * 6) * 0.3 + 0.5;
    ctx.globalAlpha = alpha * ringAlpha;
    var ringRadius = 80 + (3 - this.celebrationTimer) * 20;
    Game.Pixel.drawRing(Game.ctx || ctx, Game.CANVAS_W / 2, Game.CANVAS_H / 2, ringRadius, '#ffd700', 3, 3);

    ctx.restore();
  }
};
