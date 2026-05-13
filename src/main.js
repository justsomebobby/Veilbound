import Phaser from 'phaser';
import './styles.css';

const GAME_WIDTH = 960;
const GAME_HEIGHT = 540;

const COLORS = {
  bg: 0x111827,
  panel: 0x1f2937,
  panelSoft: 0x374151,
  accent: 0x7c3aed,
  success: 0x22c55e,
  warning: 0xf59e0b,
  danger: 0xef4444,
  blue: 0x38bdf8
};

const SAVE_KEY = 'veilbound_phase1_save';

const defaultSave = {
  version: 1,
  gateAccepted: false,
  player: {
    skinTone: 'default',
    hairColor: 'black',
    hairStyle: 'short',
    outfit: 'starter',
    passive: 'balanced'
  },
  settings: {
    adultContent: false,
    reducedExplicitness: true,
    difficulty: 'normal',
    touchButtons: 'medium',
    leftHandedMode: false,
    musicVolume: 0.7,
    sfxVolume: 0.8
  },
  progress: {
    currentLevel: 1,
    scenesUnlocked: ['phase1_placeholder_intro'],
    endingsUnlocked: [],
    skillsUnlocked: []
  }
};

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? structuredClone({ ...defaultSave, ...JSON.parse(raw) }) : structuredClone(defaultSave);
  } catch {
    return structuredClone(defaultSave);
  }
}

function saveGame(data) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

class BaseScene extends Phaser.Scene {
  drawBackground(title, subtitle = '') {
    this.cameras.main.setBackgroundColor(COLORS.bg);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg);
    this.add.text(36, 26, title, { fontFamily: 'system-ui', fontSize: '34px', color: '#f9fafb', fontStyle: '700' });
    if (subtitle) this.add.text(38, 72, subtitle, { fontFamily: 'system-ui', fontSize: '16px', color: '#cbd5e1' });
  }

  button(x, y, w, h, label, cb, color = COLORS.panelSoft) {
    const rect = this.add.rectangle(x, y, w, h, color, 0.96).setStrokeStyle(2, 0xffffff, 0.12).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, { fontFamily: 'system-ui', fontSize: '21px', color: '#ffffff', fontStyle: '700', align: 'center' }).setOrigin(0.5);
    rect.on('pointerdown', () => {
      rect.setFillStyle(COLORS.accent);
      cb?.();
    });
    rect.on('pointerup', () => rect.setFillStyle(color));
    rect.on('pointerout', () => rect.setFillStyle(color));
    return { rect, text };
  }

  backButton(target = 'HubScene') {
    this.button(78, 492, 112, 56, 'Back', () => this.scene.start(target), COLORS.panel);
  }

  save() {
    return loadSave();
  }

  writeSave(data) {
    saveGame(data);
  }
}

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() {
    const save = loadSave();
    this.scene.start(save.gateAccepted ? 'MainMenuScene' : 'AgeGateScene');
  }
}

class AgeGateScene extends BaseScene {
  constructor() { super('AgeGateScene'); }
  create() {
    this.drawBackground('Veilbound', 'Phase 1 placeholder-safe scaffold. Touch-first iPhone target.');
    this.add.rectangle(480, 270, 760, 280, COLORS.panel, 0.94).setStrokeStyle(2, 0xffffff, 0.13);
    this.add.text(480, 178, 'Content Gate Placeholder', { fontSize: '32px', color: '#ffffff', fontStyle: '800' }).setOrigin(0.5);
    this.add.text(480, 238, 'This prototype contains no explicit assets. Future adult content is planned as opt-in, skippable, and gallery-controlled.', { fontSize: '20px', color: '#cbd5e1', align: 'center', wordWrap: { width: 640 } }).setOrigin(0.5);
    this.button(480, 350, 360, 68, 'I understand — continue', () => {
      const s = this.save();
      s.gateAccepted = true;
      this.writeSave(s);
      this.scene.start('MainMenuScene');
    }, COLORS.accent);
  }
}

class MainMenuScene extends BaseScene {
  constructor() { super('MainMenuScene'); }
  create() {
    this.drawBackground('Veilbound', 'Phase 1: menu, save, hub, gallery, scene viewer.');
    this.add.text(480, 132, 'Mobile-first browser game scaffold', { fontSize: '24px', color: '#cbd5e1' }).setOrigin(0.5);
    this.button(480, 210, 320, 58, 'Continue', () => this.scene.start('HubScene'), COLORS.accent);
    this.button(480, 282, 320, 58, 'Touch Test', () => this.scene.start('MobileTestScene'));
    this.button(480, 354, 320, 58, 'Options', () => this.scene.start('OptionsScene'));
    this.button(480, 426, 320, 58, 'Gallery', () => this.scene.start('GalleryScene'));
  }
}

class HubScene extends BaseScene {
  constructor() { super('HubScene'); }
  create() {
    const s = this.save();
    this.drawBackground('Hub', `Current Level: ${s.progress.currentLevel} | Placeholder hub state`);
    const items = [
      ['Level Select', 'LevelSelectScene'], ['Customize', 'CustomizeScene'], ['Skills', 'SkillScene'],
      ['Gallery', 'GalleryScene'], ['Scene Viewer', 'SceneViewerScene'], ['Options', 'OptionsScene'], ['Touch Test', 'MobileTestScene'], ['Main Menu', 'MainMenuScene']
    ];
    items.forEach(([label, scene], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      this.button(300 + col * 360, 150 + row * 78, 300, 58, label, () => this.scene.start(scene), i === 4 ? COLORS.accent : COLORS.panelSoft);
    });
  }
}

class OptionsScene extends BaseScene {
  constructor() { super('OptionsScene'); }
  create() {
    const s = this.save();
    this.drawBackground('Options', 'Saved locally on this browser.');
    const toggles = [
      ['Reduced explicitness', 'reducedExplicitness'], ['Encounter prompts', 'encounterIntentPrompts'], ['Left-handed mode', 'leftHandedMode'], ['Screen shake', 'screenShake']
    ];
    toggles.forEach(([label, key], i) => {
      const value = Boolean(s.settings[key]);
      this.button(480, 150 + i * 72, 520, 54, `${label}: ${value ? 'ON' : 'OFF'}`, () => {
        const next = this.save();
        next.settings[key] = !Boolean(next.settings[key]);
        this.writeSave(next);
        this.scene.restart();
      });
    });
    this.button(480, 456, 300, 54, 'Reset Save', () => {
      localStorage.removeItem(SAVE_KEY);
      this.scene.start('AgeGateScene');
    }, COLORS.danger);
    this.backButton();
  }
}

class CustomizeScene extends BaseScene {
  constructor() { super('CustomizeScene'); }
  create() {
    const s = this.save();
    this.drawBackground('Customization', 'Placeholder system for future layered art.');
    const fields = [
      ['Skin tone', 'skinTone', ['default', 'warm', 'deep', 'pale']],
      ['Hair color', 'hairColor', ['black', 'brown', 'blonde', 'silver']],
      ['Hair style', 'hairStyle', ['short', 'long']],
      ['Outfit', 'outfit', ['starter', 'training']],
      ['Passive', 'passive', ['balanced', 'energy', 'escape']]
    ];
    fields.forEach(([label, key, values], i) => {
      this.button(480, 126 + i * 66, 560, 50, `${label}: ${s.player[key]}`, () => {
        const next = this.save();
        const idx = values.indexOf(next.player[key]);
        next.player[key] = values[(idx + 1) % values.length];
        this.writeSave(next);
        this.scene.restart();
      });
    });
    this.add.circle(790, 252, 58, COLORS.accent, 0.9);
    this.add.rectangle(790, 346, 92, 112, COLORS.blue, 0.9);
    this.add.text(790, 442, 'Layered art\nplaceholder', { fontSize: '16px', color: '#cbd5e1', align: 'center' }).setOrigin(0.5);
    this.backButton();
  }
}

class GalleryScene extends BaseScene {
  constructor() { super('GalleryScene'); }
  create() {
    const s = this.save();
    this.drawBackground('Gallery', 'Unlocked placeholder scene records.');
    this.add.text(480, 124, `Unlocked scenes: ${s.progress.scenesUnlocked.length}`, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
    this.button(480, 210, 520, 62, 'Phase 1 Placeholder Intro', () => this.scene.start('SceneViewerScene'), COLORS.accent);
    this.add.text(480, 294, 'Future sections: Trap Encounters, Elite Encounters, Boss Endings, Animation Viewer, Enemy Records.', { fontSize: '18px', color: '#cbd5e1', align: 'center', wordWrap: { width: 720 } }).setOrigin(0.5);
    this.backButton();
  }
}

class SceneViewerScene extends BaseScene {
  constructor() { super('SceneViewerScene'); }
  create(data = {}) {
    this.phase = data.phase ?? 0;
    this.looping = data.looping ?? true;
    const phases = ['Setup', 'Main loop', 'Variant loop', 'Result'];
    this.drawBackground('Scene Viewer', 'Touch-friendly placeholder controls. No explicit assets in Phase 1.');
    this.add.rectangle(480, 238, 640, 250, COLORS.panel, 0.94).setStrokeStyle(2, 0xffffff, 0.12);
    this.add.text(480, 180, phases[this.phase], { fontSize: '34px', color: '#ffffff', fontStyle: '800' }).setOrigin(0.5);
    this.add.text(480, 250, 'Scene art and animation phases will plug into this viewer later.', { fontSize: '22px', color: '#cbd5e1', align: 'center', wordWrap: { width: 560 } }).setOrigin(0.5);
    this.add.text(480, 312, `Loop phase: ${this.looping ? 'ON' : 'OFF'}`, { fontSize: '20px', color: '#fbbf24' }).setOrigin(0.5);
    this.button(230, 430, 150, 54, 'Prev', () => this.scene.restart({ phase: Math.max(0, this.phase - 1), looping: this.looping }));
    this.button(400, 430, 150, 54, 'Loop', () => this.scene.restart({ phase: this.phase, looping: !this.looping }), COLORS.warning);
    this.button(570, 430, 150, 54, 'Next', () => this.scene.restart({ phase: Math.min(phases.length - 1, this.phase + 1), looping: this.looping }));
    this.button(740, 430, 150, 54, 'Gallery', () => this.scene.start('GalleryScene'));
    this.backButton('HubScene');
  }
}

class LevelSelectScene extends BaseScene {
  constructor() { super('LevelSelectScene'); }
  create() {
    this.drawBackground('Level Select', 'Gameplay begins in Phase 2.');
    this.button(480, 220, 440, 62, 'Level 1: Shrine Ruins — Locked to Phase 2', () => {}, COLORS.panelSoft);
    this.add.text(480, 308, 'Next step: implement movement, jump, attack, dodge, enemies, and clothing-health.', { fontSize: '20px', color: '#cbd5e1', align: 'center', wordWrap: { width: 720 } }).setOrigin(0.5);
    this.backButton();
  }
}

class SkillScene extends BaseScene {
  constructor() { super('SkillScene'); }
  create() {
    this.drawBackground('Skills', 'Placeholder for Phase 7 progression.');
    ['Quick Strike', 'Dodge Counter', 'Energy Break', 'Repair', 'Resist'].forEach((skill, i) => {
      this.button(480, 132 + i * 64, 420, 50, `${skill}: planned`, () => {});
    });
    this.backButton();
  }
}

class MobileTestScene extends BaseScene {
  constructor() { super('MobileTestScene'); }
  create() {
    this.drawBackground('Touch Test', 'Virtual controls and safe-area check.');
    this.player = this.add.rectangle(480, 280, 50, 80, COLORS.blue);
    this.velocity = 0;
    this.add.text(480, 98, 'Hold left/right. Tap jump/attack/dodge buttons.', { fontSize: '20px', color: '#cbd5e1' }).setOrigin(0.5);
    const left = this.button(110, 422, 118, 70, '←', () => {}, COLORS.panelSoft);
    const right = this.button(250, 422, 118, 70, '→', () => {}, COLORS.panelSoft);
    this.button(670, 422, 118, 70, 'Jump', () => this.flash(COLORS.success), COLORS.accent);
    this.button(810, 422, 118, 70, 'Atk', () => this.flash(COLORS.warning), COLORS.accent);
    this.button(810, 330, 118, 58, 'Dodge', () => this.flash(COLORS.danger), COLORS.panelSoft);
    left.rect.on('pointerdown', () => this.velocity = -4);
    left.rect.on('pointerup', () => this.velocity = 0);
    left.rect.on('pointerout', () => this.velocity = 0);
    right.rect.on('pointerdown', () => this.velocity = 4);
    right.rect.on('pointerup', () => this.velocity = 0);
    right.rect.on('pointerout', () => this.velocity = 0);
    this.backButton();
  }
  flash(color) {
    this.player.setFillStyle(color);
    this.time.delayedCall(180, () => this.player?.setFillStyle(COLORS.blue));
  }
  update() {
    if (!this.player) return;
    this.player.x = Phaser.Math.Clamp(this.player.x + this.velocity, 80, 880);
  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.bg,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  input: { activePointers: 8 },
  render: { antialias: true, powerPreference: 'low-power' },
  scene: [BootScene, AgeGateScene, MainMenuScene, HubScene, CustomizeScene, OptionsScene, GalleryScene, SceneViewerScene, LevelSelectScene, SkillScene, MobileTestScene]
};

const game = new Phaser.Game(config);
window.addEventListener('contextmenu', (event) => event.preventDefault());
window.__VEILBOUND_PHASE1__ = { game };
