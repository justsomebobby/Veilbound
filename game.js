(() => {
  "use strict";

  const BUILD = "v3.5-visual-proto";

  const CONFIG = {
    dashCost: 8,
    worldWidth: 1800,
    gateX: 1690,
    groundY: 430,
    gravity: 1500,
    walkSpeed: 220,
    levelWalkSpeed: 230,
    dashSpeed: 360,
    jumpVelocity: -620,
    levelAttackReach: 52,
    bossAttackReach: 58,
  };

  const COLORS = {
    skyTop: "#171332",
    skyBottom: "#0f172a",
    forestBack: "#1e1b4b",
    forestMid: "#312e81",
    forestNear: "#111827",
    ground: "#2b1f24",
    groundTop: "#4b2e28",
    bark: "#1f2937",
    leafDark: "#172554",
    leafGlow: "rgba(168, 85, 247, 0.13)",
    skin: "#f1bda3",
    hair: "#f472b6",
    hairDark: "#be185d",
    outfit: "#f9a8d4",
    outfitDark: "#831843",
    cape: "#111827",
    capeInner: "#f472b6",
    boot: "#0f172a",
    hat: "#111827",
    trim: "#fbbf24",
    magic: "#c084fc",
    magicBlue: "#38bdf8",
    slime: "#34d399",
    slimeDark: "#065f46",
    slimeBoss: "#7c3aed",
    slimeBossDark: "#312e81",
    slimeCore: "#f0abfc",
    goblin: "#84cc16",
    goblinDark: "#365314",
    bat: "#7c2d12",
    warning: "#fb7185",
  };

  const dom = {};
  const state = {
    activeScreen: "menu",
    levelRunning: false,
    bossRunning: false,
    levelLastTime: 0,
    bossLastTime: 0,
    cameraX: 0,
    levelPlayer: null,
    levelEnemies: [],
    levelPickups: [],
    bossPlayer: null,
    boss: null,
    levelInput: { left: false, right: false },
    bossInput: { left: false, right: false },
    levelAttackLocked: false,
    bossAttackLocked: false,
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheDom();
    setBuildTags();
    wireNavigation();
    wireControls();
    restartLevel();
    showScreen("menu");
    preventBrowserGestures();
  }

  function cacheDom() {
    [
      "safeHub",
      "menu",
      "hub",
      "customize",
      "gallery",
      "game",
      "boss",
      "result",
      "hubText",
      "resultText",
      "resultStats",
      "levelCanvas",
      "bossCanvas",
      "armorDots",
      "levelHealth",
      "levelHealthFill",
      "levelEnergy",
      "levelMessage",
      "levelLeft",
      "levelRight",
      "levelJump",
      "levelAttack",
      "levelDash",
      "levelRestart",
      "bossArmorDots",
      "bossPlayerHealth",
      "bossPlayerHealthFill",
      "bossEnergy",
      "bossHitsLeft",
      "bossHealthFill",
      "bossMessage",
      "bossLeft",
      "bossRight",
      "bossJump",
      "bossAttack",
      "bossDash",
      "bossRestart",
    ].forEach((id) => {
      dom[id] = document.getElementById(id);
    });

    dom.levelCtx = dom.levelCanvas.getContext("2d");
    dom.bossCtx = dom.bossCanvas.getContext("2d");
  }

  function setBuildTags() {
    document.querySelectorAll("[data-build-tag]").forEach((tag) => {
      tag.textContent = BUILD;
    });
  }

  function wireNavigation() {
    document.addEventListener("click", (event) => {
      const target = event.target;
      const destination = target && target.dataset ? target.dataset.go : null;
      if (destination) showScreen(destination);
    });

    dom.safeHub.addEventListener("click", () => showScreen("hub"));
    dom.levelRestart.addEventListener("click", restartLevel);
    dom.bossRestart.addEventListener("click", startBoss);
  }

  function wireControls() {
    bindHold(dom.levelLeft, () => (state.levelInput.left = true), () => (state.levelInput.left = false));
    bindHold(dom.levelRight, () => (state.levelInput.right = true), () => (state.levelInput.right = false));
    bindPress(dom.levelJump, () => jump(state.levelPlayer));
    bindPress(dom.levelAttack, levelAttack);
    bindPress(dom.levelDash, () => dash(state.levelPlayer, setLevelMessage, updateLevelHud));

    bindHold(dom.bossLeft, () => (state.bossInput.left = true), () => (state.bossInput.left = false));
    bindHold(dom.bossRight, () => (state.bossInput.right = true), () => (state.bossInput.right = false));
    bindPress(dom.bossJump, () => jump(state.bossPlayer));
    bindPress(dom.bossAttack, bossAttack);
    bindPress(dom.bossDash, () => dash(state.bossPlayer, setBossMessage, updateBossHud));
  }

  function preventBrowserGestures() {
    document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    window.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("selectstart", (event) => event.preventDefault());
    document.addEventListener("dragstart", (event) => event.preventDefault());
    document.addEventListener("gesturestart", (event) => event.preventDefault());
  }

  function bindPress(button, callback) {
    let active = false;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (active) return;
      active = true;
      callback();
      button.blur();
    });
    const release = (event) => {
      event.preventDefault();
      active = false;
      button.blur();
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  function bindHold(button, onDown, onUp) {
    let active = false;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (active) return;
      active = true;
      onDown();
      button.blur();
    });
    const release = (event) => {
      event.preventDefault();
      if (!active) return;
      active = false;
      onUp();
      button.blur();
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("is-active"));

    const screen = dom[screenId] || dom.hub;
    screen.classList.add("is-active");
    state.activeScreen = screenId;

    state.levelRunning = false;
    state.bossRunning = false;
    state.levelInput.left = false;
    state.levelInput.right = false;
    state.bossInput.left = false;
    state.bossInput.right = false;

    if (screenId === "game") startLevel();
    if (screenId === "boss") startBoss();

    window.scrollTo(0, 0);
  }

  function makePlayer(overrides = {}) {
    return {
      x: 70,
      y: 360,
      w: 34,
      h: 66,
      vx: 0,
      vy: 0,
      face: 1,
      onGround: false,
      armor: 3,
      health: 100,
      energy: 0,
      attackFlash: 0,
      invulnerable: 0,
      dashing: 0,
      intangible: 0,
      gateReached: false,
      ...overrides,
    };
  }

  function restartLevel() {
    state.levelAttackLocked = false;
    state.cameraX = 0;
    state.levelPlayer = makePlayer();
    state.levelEnemies = [
      makeEnemy("slime", 500, 396, 38, 34, 1, { jumpy: true }),
      makeEnemy("goblin", 930, 382, 50, 48, 2),
      makeEnemy("bat", 1240, 250, 46, 34, 2, { flying: true }),
    ];
    state.levelPickups = [
      { x: 720, y: 330, collected: false },
      { x: 1420, y: 320, collected: false },
    ];

    setLevelMessage("Forest path: reach the gate");
    updateLevelHud();
    drawLevel(0);
  }

  function startLevel() {
    restartLevel();
    state.levelRunning = true;
    state.levelLastTime = performance.now();
    requestAnimationFrame(levelLoop);
  }

  function makeEnemy(kind, x, y, w, h, hp, options = {}) {
    return {
      kind,
      x,
      y,
      w,
      h,
      baseY: y,
      hp,
      maxHp: hp,
      dir: options.dir || -1,
      flying: !!options.flying,
      jumpy: !!options.jumpy,
      t: 0,
    };
  }

  function startBoss() {
    state.bossAttackLocked = false;
    const source = state.levelPlayer || makePlayer({ energy: 20 });

    state.bossPlayer = makePlayer({
      x: 110,
      armor: source.armor,
      health: source.health,
      energy: Math.max(20, source.energy),
    });

    state.boss = {
      x: 670,
      y: 326,
      w: 120,
      h: 104,
      hp: 100,
      maxHp: 100,
      hitFlash: 0,
      cooldown: 0.65,
      windup: 0,
      telegraph: 0,
      telegraphType: "",
      lastAttackType: "orb",
      projectiles: [],
    };

    setBossMessage(`Build ${BUILD}`);
    updateBossHud();
    drawBoss(0);

    state.bossRunning = true;
    state.bossLastTime = performance.now();
    requestAnimationFrame(bossLoop);
  }

  function setLevelMessage(message) {
    dom.levelMessage.textContent = message;
  }

  function setBossMessage(message) {
    dom.bossMessage.textContent = message;
  }

  function armorDots(count) {
    return [1, 2, 3]
      .map((index) => `<i class="dot ${index <= count ? "" : "is-empty"}"></i>`)
      .join("");
  }

  function updateLevelHud() {
    const player = state.levelPlayer;
    dom.armorDots.innerHTML = armorDots(player.armor);
    dom.levelHealth.textContent = Math.max(0, Math.ceil(player.health));
    dom.levelHealthFill.style.width = `${clamp(player.health, 0, 100)}%`;
    dom.levelEnergy.textContent = Math.floor(player.energy);
    updateDashButton(dom.levelDash, player.energy);
  }

  function updateBossHud() {
    const player = state.bossPlayer;
    const boss = state.boss;
    dom.bossArmorDots.innerHTML = armorDots(player.armor);
    dom.bossPlayerHealth.textContent = Math.max(0, Math.ceil(player.health));
    dom.bossPlayerHealthFill.style.width = `${clamp(player.health, 0, 100)}%`;
    dom.bossEnergy.textContent = Math.floor(player.energy);
    dom.bossHitsLeft.textContent = Math.max(0, Math.ceil(boss.hp / 10));
    dom.bossHealthFill.style.width = `${clamp(boss.hp, 0, 100)}%`;
    updateDashButton(dom.bossDash, player.energy);
  }

  function updateDashButton(button, energy) {
    button.classList.toggle("is-locked", energy < CONFIG.dashCost);
    button.disabled = false;
  }

  function jump(player) {
    if (!player || !player.onGround) return;
    player.vy = CONFIG.jumpVelocity;
    player.onGround = false;
  }

  function dash(player, messageFn, hudFn) {
    if (!player || player.energy < CONFIG.dashCost) return;

    player.energy -= CONFIG.dashCost;
    player.dashing = 0.42;
    player.invulnerable = 0.8;
    player.intangible = 0.95;
    player.vx = CONFIG.dashSpeed * player.face;

    messageFn("Intangible");
    hudFn();
  }

  function levelAttack() {
    const player = state.levelPlayer;
    if (!player || state.levelAttackLocked) return;

    state.levelAttackLocked = true;
    setTimeout(() => (state.levelAttackLocked = false), 120);

    player.attackFlash = 0.14;
    player.energy = Math.min(100, player.energy + 4);

    const hitbox = attackBox(player, CONFIG.levelAttackReach);
    const enemy = nearestOverlappingEnemy(hitbox, state.levelEnemies, player);

    if (enemy) {
      enemy.hp -= 1;
      player.energy = Math.min(100, player.energy + 16);
      setLevelMessage(enemy.hp <= 0 ? "Enemy down" : `${enemy.kind} HP ${enemy.hp}/${enemy.maxHp}`);
    } else {
      setLevelMessage("Miss");
    }

    updateLevelHud();
  }

  function bossAttack() {
    const player = state.bossPlayer;
    const boss = state.boss;
    if (!player || !boss || state.bossAttackLocked || boss.hp <= 0) return;

    state.bossAttackLocked = true;
    setTimeout(() => (state.bossAttackLocked = false), 150);

    player.attackFlash = 0.14;
    player.energy = Math.min(100, player.energy + 4);

    const hitbox = attackBox(player, CONFIG.bossAttackReach);
    if (rectsOverlap(hitbox, boss)) {
      boss.hp -= 10;
      boss.hitFlash = 0.18;
      player.energy = Math.min(100, player.energy + 14);
      setBossMessage(boss.hp > 0 ? `King Slime: ${Math.ceil(boss.hp / 10)} hits left` : "King Slime defeated");
      updateBossHud();

      if (boss.hp <= 0) finishBoss();
    } else {
      setBossMessage("Miss");
      updateBossHud();
    }
  }

  function finishBoss() {
    const player = state.bossPlayer;
    const boss = state.boss;

    boss.hp = 0;
    state.bossRunning = false;
    updateBossHud();

    setBossMessage("King Slime defeated");
    dom.hubText.textContent = "Level 1 clear: King Slime defeated.";
    dom.resultText.textContent = "King Slime defeated. Forest route cleared.";
    dom.resultStats.textContent = `Remaining health: ${Math.max(0, Math.ceil(player.health))} | Armor layers: ${player.armor} | Energy: ${Math.floor(player.energy)}`;

    setTimeout(() => showScreen("result"), 800);
  }

  function nearestOverlappingEnemy(hitbox, enemies, player) {
    let nearest = null;
    let nearestDistance = Infinity;

    enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || !rectsOverlap(hitbox, enemy)) return;
      const distance = Math.abs(centerX(player) - centerX(enemy));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = enemy;
      }
    });

    return nearest;
  }

  function attackBox(actor, reach) {
    return {
      x: actor.face > 0 ? actor.x + actor.w : actor.x - reach,
      y: actor.y + 10,
      w: reach,
      h: 38,
    };
  }

  function hurtLevelPlayer(ignoreArmor) {
    const player = state.levelPlayer;
    if (!canHazardHit(player)) return;

    player.invulnerable = 1;
    player.energy = Math.min(100, player.energy + 12);

    if (player.armor > 0 && !ignoreArmor) {
      player.armor -= 1;
      setLevelMessage("Armor layer hit");
    } else {
      player.health -= 25;
      setLevelMessage("Health damage");
    }

    updateLevelHud();
    if (player.health <= 0) setTimeout(restartLevel, 700);
  }

  function hurtBossPlayer(ignoreArmor) {
    const player = state.bossPlayer;
    if (!canHazardHit(player)) return;

    player.invulnerable = 1;
    player.energy = Math.min(100, player.energy + 12);

    if (player.armor > 0 && !ignoreArmor) {
      player.armor -= 1;
      setBossMessage("Armor layer hit");
    } else {
      player.health -= 18;
      setBossMessage("Health damage");
    }

    updateBossHud();
    if (player.health <= 0) setTimeout(startBoss, 700);
  }

  function canHazardHit(actor) {
    return actor && actor.invulnerable <= 0 && actor.dashing <= 0 && actor.intangible <= 0;
  }

  function updateActor(actor, input, dt, maxX, walkSpeed = CONFIG.walkSpeed) {
    actor.attackFlash = Math.max(0, actor.attackFlash - dt);
    actor.invulnerable = Math.max(0, actor.invulnerable - dt);
    actor.dashing = Math.max(0, actor.dashing - dt);
    actor.intangible = Math.max(0, actor.intangible - dt);

    const axis = Number(input.right) - Number(input.left);
    if (axis !== 0) {
      actor.face = axis;
      actor.vx = axis * (actor.dashing > 0 ? CONFIG.dashSpeed : walkSpeed);
    } else if (actor.dashing <= 0) {
      actor.vx *= 0.82;
    }

    actor.vy += CONFIG.gravity * dt;
    actor.x += actor.vx * dt;
    actor.y += actor.vy * dt;

    if (actor.y + actor.h >= CONFIG.groundY) {
      actor.y = CONFIG.groundY - actor.h;
      actor.vy = 0;
      actor.onGround = true;
    } else {
      actor.onGround = false;
    }

    actor.x = clamp(actor.x, 20, maxX);
  }

  function updateLevel(dt) {
    const player = state.levelPlayer;
    updateActor(player, state.levelInput, dt, CONFIG.worldWidth - 80, CONFIG.levelWalkSpeed);

    state.cameraX = clamp(player.x - 330, 0, CONFIG.worldWidth - 960);

    state.levelEnemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      updateEnemy(enemy, dt);
      if (rectsOverlap(player, enemy)) hurtLevelPlayer(enemy.flying);
    });

    state.levelPickups.forEach((pickup) => {
      if (pickup.collected) return;
      if (distance(player.x + 17, player.y + 33, pickup.x, pickup.y) < 42) {
        pickup.collected = true;
        player.energy = Math.min(100, player.energy + 25);
        setLevelMessage("Pickup");
        updateLevelHud();
      }
    });

    if (player.x > CONFIG.gateX && !player.gateReached) {
      player.gateReached = true;
      setLevelMessage("Boss gate reached");
      setTimeout(() => showScreen("boss"), 450);
    }
  }

  function updateEnemy(enemy, dt) {
    enemy.t += dt;

    if (enemy.flying) {
      enemy.x += enemy.dir * 82 * dt;
      enemy.y = 245 + Math.sin(enemy.t * 3) * 38;
      if (enemy.x < 1150 || enemy.x > 1440) enemy.dir *= -1;
      return;
    }

    if (enemy.jumpy) {
      enemy.x += enemy.dir * 58 * dt;
      const hop = Math.abs(Math.sin(enemy.t * 4.8));
      enemy.y = CONFIG.groundY - enemy.h - hop * 42;
      if (enemy.x < 390 || enemy.x > 760) enemy.dir *= -1;
      return;
    }

    enemy.x += enemy.dir * 65 * dt;
    if (enemy.x < 840 || enemy.x > 1080) enemy.dir *= -1;
    enemy.y = CONFIG.groundY - enemy.h;
  }

  function updateBoss(dt) {
    const player = state.bossPlayer;
    const boss = state.boss;

    updateActor(player, state.bossInput, dt, 820);

    boss.hitFlash = Math.max(0, boss.hitFlash - dt);
    boss.cooldown -= dt;
    boss.windup = Math.max(0, boss.windup - dt);

    if (boss.telegraph > 0) {
      boss.telegraph -= dt;
      if (boss.telegraph <= 0) releaseBossAttack();
    }

    boss.x += Math.sign(centerX(player) - centerX(boss)) * 36 * dt;
    boss.x = clamp(boss.x, 520, 820);

    if (boss.cooldown <= 0 && boss.telegraph <= 0 && boss.windup <= 0) {
      boss.cooldown = 1.05;
      beginBossAttack();
    }

    if (boss.windup > 0 && canHazardHit(player) && rectsOverlap(player, bossSlamZone())) {
      hurtBossPlayer(false);
    }

    boss.projectiles.forEach((projectile) => updateProjectile(projectile, player, dt));
    boss.projectiles = boss.projectiles.filter((projectile) => projectile.life > 0 && projectile.x > -80 && projectile.x < 1040);

    if (canHazardHit(player) && rectsOverlap(player, boss)) {
      hurtBossPlayer(false);
    }
  }

  function beginBossAttack() {
    const player = state.bossPlayer;
    const boss = state.boss;
    const dist = Math.abs(centerX(player) - centerX(boss));
    const useGlob = dist > 215 || boss.lastAttackType === "slam";

    boss.telegraph = useGlob ? 0.38 : 0.3;
    boss.telegraphType = useGlob ? "glob" : "slam";
    boss.lastAttackType = boss.telegraphType;

    setBossMessage(useGlob ? "King Slime forms a glob" : "King Slime swells up");
  }

  function releaseBossAttack() {
    const player = state.bossPlayer;
    const boss = state.boss;

    if (boss.telegraphType === "slam") {
      boss.windup = 0.22;
    }

    if (boss.telegraphType === "glob") {
      const direction = centerX(player) < centerX(boss) ? -1 : 1;
      boss.projectiles.push({
        x: boss.x + boss.w / 2,
        y: boss.y + 50,
        w: 28,
        h: 28,
        vx: direction * 290,
        life: 2.8,
        ignorePlayerUntilClear: false,
      });
    }

    boss.telegraphType = "";
  }

  function updateProjectile(projectile, player, dt) {
    projectile.x += projectile.vx * dt;
    projectile.life -= dt;

    const touching = rectsOverlap(player, projectile);

    if (!touching) {
      projectile.ignorePlayerUntilClear = false;
      return;
    }

    if (!canHazardHit(player)) {
      projectile.ignorePlayerUntilClear = true;
      return;
    }

    if (projectile.ignorePlayerUntilClear) return;

    projectile.life = 0;
    hurtBossPlayer(false);
  }

  function bossSlamZone() {
    const boss = state.boss;
    return { x: boss.x - 74, y: boss.y + 18, w: boss.w + 148, h: 82 };
  }

  function levelLoop(now) {
    if (!state.levelRunning) return;

    const dt = Math.min(0.033, (now - state.levelLastTime) / 1000);
    state.levelLastTime = now;

    updateLevel(dt);
    drawLevel(now / 1000);

    requestAnimationFrame(levelLoop);
  }

  function bossLoop(now) {
    if (!state.bossRunning) return;

    const dt = Math.min(0.033, (now - state.bossLastTime) / 1000);
    state.bossLastTime = now;

    updateBoss(dt);
    drawBoss(now / 1000);

    requestAnimationFrame(bossLoop);
  }

  function drawLevel(time) {
    const ctx = dom.levelCtx;
    const cameraX = state.cameraX;

    clearArena(ctx);
    drawForestBackdrop(ctx, cameraX, time);
    drawForestGround(ctx, -cameraX, CONFIG.worldWidth);
    drawGate(ctx, cameraX, time);
    drawPickups(ctx, cameraX, time);
    drawEnemies(ctx, cameraX, time);
    drawAttackFlash(ctx, state.levelPlayer, CONFIG.levelAttackReach, cameraX);
    drawWitchPlayer(ctx, state.levelPlayer, cameraX, time);
    drawDebugHitboxHint(ctx, state.levelPlayer, cameraX);
  }

  function drawBoss(time) {
    const ctx = dom.bossCtx;
    const boss = state.boss;

    clearArena(ctx);
    drawForestBackdrop(ctx, 0, time);
    drawForestGround(ctx, 0, 960);

    if (boss.telegraph > 0 && boss.telegraphType === "slam") {
      drawSlamWarning(ctx, bossSlamZone(), time);
    }

    if (boss.windup > 0) {
      drawSlamActive(ctx, bossSlamZone(), time);
    }

    if (boss.telegraph > 0 && boss.telegraphType === "glob") {
      drawGlobCharge(ctx, boss, time);
    }

    boss.projectiles.forEach((projectile) => drawProjectile(ctx, projectile, time));
    drawKingSlime(ctx, boss, time);
    drawAttackFlash(ctx, state.bossPlayer, CONFIG.bossAttackReach, 0);
    drawWitchPlayer(ctx, state.bossPlayer, 0, time);
    drawDebugHitboxHint(ctx, state.bossPlayer, 0);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "16px system-ui";
    ctx.fillText(`King Slime hits left: ${Math.max(0, Math.ceil(boss.hp / 10))}`, 20, 34);
  }

  function clearArena(ctx) {
    ctx.clearRect(0, 0, 960, 540);
    const gradient = ctx.createLinearGradient(0, 0, 0, 430);
    gradient.addColorStop(0, COLORS.skyTop);
    gradient.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 540);
  }

  function drawForestBackdrop(ctx, cameraX, time) {
    ctx.save();
    ctx.fillStyle = COLORS.leafGlow;
    for (let i = 0; i < 9; i += 1) {
      const x = ((i * 150 - cameraX * 0.12) % 1120) - 100;
      ctx.beginPath();
      ctx.ellipse(x, 82 + (i % 3) * 34, 72, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    drawTreeLayer(ctx, cameraX * 0.16, 72, COLORS.forestBack, 0.8);
    drawTreeLayer(ctx, cameraX * 0.32, 132, COLORS.forestMid, 0.58);
    drawTreeLayer(ctx, cameraX * 0.52, 196, COLORS.forestNear, 0.74);

    ctx.fillStyle = "rgba(251, 191, 36, 0.18)";
    for (let i = 0; i < 12; i += 1) {
      const x = ((i * 93 - cameraX * 0.22 + Math.sin(time + i) * 8) % 1040) - 40;
      const y = 120 + ((i * 41) % 210);
      ctx.fillRect(x, y, 3, 3);
    }
    ctx.restore();
  }

  function drawTreeLayer(ctx, cameraX, baseY, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (let x = -120; x < 1100; x += 96) {
      const drawX = x - (cameraX % 96);
      const trunkH = 210 + ((x * 7) % 70);
      ctx.fillRect(drawX + 38, baseY + 160 - trunkH, 20, trunkH);
      ctx.beginPath();
      ctx.moveTo(drawX - 12, baseY + 160 - trunkH + 65);
      ctx.lineTo(drawX + 48, baseY + 160 - trunkH - 30);
      ctx.lineTo(drawX + 110, baseY + 160 - trunkH + 65);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(drawX, baseY + 160 - trunkH + 18);
      ctx.lineTo(drawX + 48, baseY + 160 - trunkH - 64);
      ctx.lineTo(drawX + 96, baseY + 160 - trunkH + 18);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawForestGround(ctx, offsetX, width) {
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(offsetX, CONFIG.groundY, width, 110);
    ctx.fillStyle = COLORS.groundTop;
    ctx.fillRect(offsetX, CONFIG.groundY, width, 10);
    ctx.fillStyle = "rgba(34, 197, 94, 0.18)";
    for (let x = 0; x < width; x += 50) {
      ctx.fillRect(offsetX + x, CONFIG.groundY - 2, 26, 3);
    }
    ctx.fillStyle = "rgba(15,23,42,.38)";
    for (let x = 0; x < width; x += 100) {
      ctx.fillRect(offsetX + x + 10, CONFIG.groundY + 28, 62, 8);
    }
  }

  function drawGate(ctx, cameraX, time) {
    const x = CONFIG.gateX - cameraX;
    ctx.save();
    ctx.translate(x + 24, 378);
    ctx.fillStyle = "rgba(192, 132, 252, 0.15)";
    ctx.beginPath();
    ctx.ellipse(0, 4, 48 + Math.sin(time * 4) * 3, 78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b21a8";
    ctx.fillRect(-22, -50, 44, 100);
    ctx.fillStyle = "#f9a8d4";
    ctx.fillRect(-13, -39, 26, 78);
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(-5, -5, 10, 10);
    ctx.restore();
  }

  function drawPickups(ctx, cameraX, time) {
    state.levelPickups.forEach((pickup) => {
      if (pickup.collected) return;
      const x = pickup.x - cameraX;
      const y = pickup.y + Math.sin(time * 5) * 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "rgba(192,132,252,.20)";
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = COLORS.magic;
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawEnemies(ctx, cameraX, time) {
    state.levelEnemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      if (enemy.kind === "slime") drawSmallSlime(ctx, enemy, cameraX, time);
      if (enemy.kind === "goblin") drawGoblin(ctx, enemy, cameraX, time);
      if (enemy.kind === "bat") drawBat(ctx, enemy, cameraX, time);

      ctx.fillStyle = "#fff";
      ctx.font = "12px system-ui";
      ctx.fillText(String(enemy.hp), enemy.x - cameraX + enemy.w / 2 - 3, enemy.y - 7);
    });
  }

  function drawSmallSlime(ctx, enemy, cameraX, time) {
    const x = enemy.x - cameraX + enemy.w / 2;
    const y = enemy.y + enemy.h;
    const squash = 1 + Math.abs(Math.sin(enemy.t * 4.8)) * 0.18;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.12 / squash, squash);
    ctx.fillStyle = "rgba(16,185,129,.22)";
    ctx.beginPath();
    ctx.ellipse(0, 2, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.slimeDark;
    ctx.beginPath();
    ctx.ellipse(0, -16, 21, 18, 0, Math.PI, 0);
    ctx.lineTo(21, 0);
    ctx.quadraticCurveTo(0, 12, -21, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.slime;
    ctx.beginPath();
    ctx.ellipse(0, -17, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d1fae5";
    ctx.fillRect(-7, -20, 4, 4);
    ctx.fillRect(5, -20, 4, 4);
    ctx.restore();
  }

  function drawGoblin(ctx, enemy, cameraX, time) {
    const x = enemy.x - cameraX + enemy.w / 2;
    const y = enemy.y + enemy.h;
    const stride = Math.sin(time * 10) * 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.dir > 0 ? 1 : -1, 1);
    ctx.fillStyle = COLORS.goblinDark;
    ctx.fillRect(-12, -28, 8, 28 + stride);
    ctx.fillRect(5, -28, 8, 28 - stride);
    ctx.fillStyle = COLORS.goblin;
    ctx.fillRect(-18, -58, 36, 32);
    ctx.fillStyle = "#a3e635";
    ctx.beginPath();
    ctx.ellipse(0, -70, 17, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-12, -71);
    ctx.lineTo(-30, -79);
    ctx.lineTo(-13, -62);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -71);
    ctx.lineTo(30, -79);
    ctx.lineTo(13, -62);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(4, -73, 4, 4);
    ctx.fillStyle = "#78350f";
    ctx.fillRect(14, -44, 28, 8);
    ctx.fillStyle = "#eab308";
    ctx.fillRect(36, -46, 8, 12);
    ctx.restore();
  }

  function drawBat(ctx, enemy, cameraX, time) {
    const x = enemy.x - cameraX + enemy.w / 2;
    const y = enemy.y + enemy.h / 2;
    const flap = Math.sin(time * 15) * 13;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(enemy.dir > 0 ? 1 : -1, 1);
    ctx.fillStyle = "rgba(124,45,18,.6)";
    ctx.beginPath();
    ctx.moveTo(-8, 1);
    ctx.quadraticCurveTo(-42, -24 - flap, -38, 20);
    ctx.lineTo(-9, 13);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.quadraticCurveTo(42, -24 + flap, 38, 20);
    ctx.lineTo(9, 13);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.bat;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.moveTo(-8, -8);
    ctx.lineTo(-14, -18);
    ctx.lineTo(-4, -11);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(14, -18);
    ctx.lineTo(4, -11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(-5, -3, 4, 4);
    ctx.fillRect(4, -3, 4, 4);
    ctx.restore();
  }

  function drawAttackFlash(ctx, actor, reach, cameraX) {
    if (!actor || actor.attackFlash <= 0) return;

    const hitbox = attackBox(actor, reach);
    const alpha = actor.attackFlash / 0.14;
    ctx.save();
    ctx.globalAlpha = 0.35 + alpha * 0.35;
    ctx.fillStyle = COLORS.trim;
    ctx.beginPath();
    if (actor.face > 0) {
      ctx.ellipse(hitbox.x - cameraX + reach * 0.48, hitbox.y + 18, reach * 0.58, 26, -0.25, -0.9, 0.9);
    } else {
      ctx.ellipse(hitbox.x - cameraX + reach * 0.52, hitbox.y + 18, reach * 0.58, 26, 0.25, Math.PI - 0.9, Math.PI + 0.9);
    }
    ctx.fill();
    ctx.restore();
  }

  function drawWitchPlayer(ctx, player, cameraX, time) {
    if (!player) return;

    const x = player.x - cameraX;
    const y = player.y;
    const cx = x + player.w / 2;
    const footY = y + player.h;
    const invulnerable = !canHazardHit(player);
    const flicker = invulnerable && Math.floor(Date.now() / 70) % 2;
    const run = Math.min(1, Math.abs(player.vx) / CONFIG.levelWalkSpeed);
    const bob = player.onGround ? Math.sin(time * 10) * run * 2 : -2;
    const lean = player.dashing > 0 ? player.face * 10 : player.face * run * 3;

    ctx.save();
    ctx.translate(cx, footY + bob);
    ctx.scale(player.face, 1);
    ctx.rotate((lean * Math.PI) / 180);
    ctx.globalAlpha = flicker ? 0.62 : 1;

    if (player.dashing > 0) drawDashTrail(ctx);

    drawWitchCape(ctx, player, time);
    drawWitchLegs(ctx, player, time);
    drawWitchBody(ctx, player);
    drawWitchArms(ctx, player);
    drawWitchHead(ctx, time);
    drawWitchHat(ctx, time);

    ctx.restore();
  }

  function drawDashTrail(ctx) {
    ctx.fillStyle = "rgba(244, 114, 182, 0.18)";
    for (let i = 1; i <= 3; i += 1) {
      ctx.fillRect(-21 - i * 13, -70 + i * 5, 22, 55 - i * 7);
    }
  }

  function drawWitchCape(ctx, player, time) {
    const flutter = Math.sin(time * 6) * 3;
    ctx.fillStyle = COLORS.cape;
    ctx.beginPath();
    ctx.moveTo(-18, -58);
    ctx.quadraticCurveTo(-31, -38, -24, -12 + flutter);
    ctx.lineTo(18, -14);
    ctx.lineTo(16, -58);
    ctx.closePath();
    ctx.fill();
    if (player.armor >= 2) {
      ctx.fillStyle = COLORS.capeInner;
      ctx.beginPath();
      ctx.moveTo(-14, -55);
      ctx.quadraticCurveTo(-23, -36, -19, -18 + flutter);
      ctx.lineTo(10, -17);
      ctx.lineTo(9, -55);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawWitchLegs(ctx, player, time) {
    const stride = player.onGround ? Math.sin(time * 12) * Math.min(1, Math.abs(player.vx) / CONFIG.walkSpeed) * 5 : 2;
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(-11, -31, 8, 20 + stride);
    ctx.fillRect(4, -31, 8, 20 - stride);
    ctx.fillStyle = COLORS.boot;
    ctx.fillRect(-13, -15 + stride, 11, 17);
    ctx.fillRect(3, -15 - stride, 11, 17);
    ctx.fillRect(-15, -2 + stride, 14, 5);
    ctx.fillRect(3, -2 - stride, 14, 5);
  }

  function drawWitchBody(ctx, player) {
    ctx.fillStyle = player.armor > 0 ? COLORS.outfit : "#d8b4fe";
    ctx.beginPath();
    ctx.moveTo(-14, -61);
    ctx.lineTo(14, -61);
    ctx.lineTo(18, -28);
    ctx.lineTo(8, -22);
    ctx.lineTo(-8, -22);
    ctx.lineTo(-18, -28);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = COLORS.outfitDark;
    ctx.fillRect(-14, -45, 28, 7);

    if (player.armor >= 3) {
      ctx.fillStyle = COLORS.trim;
      ctx.fillRect(-15, -61, 30, 4);
      ctx.fillRect(-2, -58, 4, 30);
    }
  }

  function drawWitchArms(ctx, player) {
    const attackLift = player.attackFlash > 0 ? -14 : 0;
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(-23, -55, 8, 24);
    ctx.fillRect(15, -55 + attackLift, 8, 24);
    ctx.fillStyle = COLORS.outfitDark;
    ctx.fillRect(18, -35 + attackLift, 13, 5);
  }

  function drawWitchHead(ctx, time) {
    ctx.fillStyle = COLORS.skin;
    ctx.beginPath();
    ctx.arc(0, -76, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.hair;
    ctx.beginPath();
    ctx.ellipse(-2, -82, 17, 14, -0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.hairDark;
    ctx.beginPath();
    ctx.ellipse(-12, -68 + Math.sin(time * 5) * 1.5, 7, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, -69 + Math.cos(time * 5) * 1.2, 6, 14, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(4, -78, 3, 3);
  }

  function drawWitchHat(ctx, time) {
    ctx.fillStyle = COLORS.hat;
    ctx.beginPath();
    ctx.ellipse(0, -88, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-14, -89);
    ctx.quadraticCurveTo(-3, -126 + Math.sin(time * 2) * 1.5, 14, -91);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.capeInner;
    ctx.fillRect(-13, -92, 27, 4);
  }

  function drawKingSlime(ctx, boss, time) {
    const hit = boss.hitFlash > 0;
    const wobble = Math.sin(time * 5) * 6;
    const squash = 1 + Math.sin(time * 3) * 0.035;

    ctx.save();
    ctx.translate(boss.x + boss.w / 2, boss.y + boss.h);
    ctx.scale(1 / squash, squash);

    ctx.fillStyle = "rgba(49,46,129,.32)";
    ctx.beginPath();
    ctx.ellipse(0, 7, 82, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    const bodyGradient = ctx.createRadialGradient(-20, -64, 16, 0, -42, 96);
    bodyGradient.addColorStop(0, hit ? "#fef3c7" : COLORS.slimeCore);
    bodyGradient.addColorStop(0.38, hit ? "#fbbf24" : COLORS.slimeBoss);
    bodyGradient.addColorStop(1, COLORS.slimeBossDark);
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(-66, 0);
    ctx.quadraticCurveTo(-70, -64 + wobble, -8, -92);
    ctx.quadraticCurveTo(54, -72 - wobble, 66, 0);
    ctx.quadraticCurveTo(22, 15, -66, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgba(240,171,252,.45)";
    ctx.beginPath();
    ctx.ellipse(-14, -46, 25, 16, -0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fef3c7";
    ctx.fillRect(-24, -54, 8, 8);
    ctx.fillRect(18, -54, 8, 8);

    ctx.fillStyle = COLORS.trim;
    ctx.beginPath();
    ctx.moveTo(-24, -82);
    ctx.lineTo(-10, -106);
    ctx.lineTo(2, -86);
    ctx.lineTo(18, -108);
    ctx.lineTo(28, -79);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawSlamWarning(ctx, zone, time) {
    ctx.save();
    ctx.fillStyle = "rgba(251,113,133,.16)";
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.strokeStyle = "rgba(251,113,133,.65)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w / 2, 24 + Math.sin(time * 18) * 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawSlamActive(ctx, zone, time) {
    ctx.save();
    ctx.fillStyle = "rgba(251,113,133,.32)";
    ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    ctx.fillStyle = "rgba(255,255,255,.28)";
    ctx.beginPath();
    ctx.ellipse(zone.x + zone.w / 2, zone.y + zone.h / 2, zone.w / 2, 22 + Math.sin(time * 40) * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawGlobCharge(ctx, boss, time) {
    const r = 18 + Math.sin(time * 18) * 4;
    ctx.save();
    ctx.fillStyle = "rgba(192,132,252,.2)";
    ctx.beginPath();
    ctx.arc(boss.x + boss.w / 2, boss.y + 50, r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(52,211,153,.72)";
    ctx.beginPath();
    ctx.arc(boss.x + boss.w / 2, boss.y + 50, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawProjectile(ctx, projectile, time) {
    ctx.save();
    ctx.fillStyle = "rgba(52,211,153,.18)";
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.slime;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, 12 + Math.sin(time * 12) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawDebugHitboxHint(ctx, actor, cameraX) {
    if (!actor) return;
    ctx.save();
    ctx.strokeStyle = "rgba(56,189,248,.18)";
    ctx.lineWidth = 1;
    ctx.strokeRect(actor.x - cameraX, actor.y, actor.w, actor.h);
    ctx.restore();
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function centerX(rect) {
    return rect.x + rect.w / 2;
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
