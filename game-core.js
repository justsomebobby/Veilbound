(() => {
  "use strict";

  const BUILD = "v4.0-encounter-proto";
  const CFG = {
    dashCost: 8,
    worldW: 1800,
    gateX: 1690,
    groundY: 430,
    gravity: 1500,
    walk: 230,
    dash: 360,
    jump: -620,
    levelReach: 54,
    bossReach: 62,
    trapFirstLayerDelay: 1.05,
    trapLayerInterval: 1.5,
    trapEscapeRequired: 10,
    loopHealthDrain: 8,
  };

  const C = {
    sky1: "#171332", sky2: "#0f172a", ground: "#2b1f24", groundTop: "#4b2e28",
    pink: "#f472b6", pinkDark: "#be185d", outfit: "#f9a8d4", outfitDark: "#831843",
    skin: "#f1bda3", black: "#111827", trim: "#fbbf24", magic: "#c084fc",
    slime: "#34d399", slimeDark: "#065f46", boss: "#7c3aed", bossDark: "#312e81",
    goblin: "#84cc16", bat: "#7c2d12", danger: "#fb7185", white: "#e5e7eb",
  };

  const dom = {};
  const state = {
    screen: "menu", levelRun: false, bossRun: false, levelLast: 0, bossLast: 0, cam: 0,
    p: null, bp: null, boss: null, enemies: [], traps: [], pickups: [], encounter: null,
    levelInput: { left: false, right: false }, bossInput: { left: false, right: false },
    levelAtkLock: false, bossAtkLock: false,
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    ids(["safeHub","menu","hub","customize","gallery","game","boss","result","hubText","resultText","resultStats","levelCanvas","bossCanvas","armorDots","levelHealth","levelHealthFill","levelEnergy","levelMessage","levelLeft","levelRight","levelJump","levelAttack","levelDash","levelRestart","bossArmorDots","bossPlayerHealth","bossPlayerHealthFill","bossEnergy","bossHitsLeft","bossHealthFill","bossMessage","bossLeft","bossRight","bossJump","bossAttack","bossDash","bossRestart"]);
    dom.levelCtx = dom.levelCanvas.getContext("2d");
    dom.bossCtx = dom.bossCanvas.getContext("2d");
    document.querySelectorAll("[data-build-tag]").forEach((tag) => tag.textContent = BUILD);
    wireNavigation();
    wireControls();
    preventBrowserGestures();
    restartLevel();
    showScreen("menu");
  }

  function ids(list) { list.forEach((id) => dom[id] = document.getElementById(id)); }

  function wireNavigation() {
    document.addEventListener("click", (event) => {
      const go = event.target && event.target.dataset ? event.target.dataset.go : null;
      if (go) showScreen(go);
    });
    dom.safeHub.addEventListener("click", () => showScreen("hub"));
    dom.levelRestart.addEventListener("click", restartLevel);
    dom.bossRestart.addEventListener("click", startBoss);
  }

  function wireControls() {
    bindHold(dom.levelLeft, () => levelHold("left", true), () => levelHold("left", false));
    bindHold(dom.levelRight, () => levelHold("right", true), () => levelHold("right", false));
    bindPress(dom.levelJump, () => levelAction("jump"));
    bindPress(dom.levelAttack, () => levelAction("attack"));
    bindPress(dom.levelDash, () => levelAction("dash"));

    bindHold(dom.bossLeft, () => state.bossInput.left = true, () => state.bossInput.left = false);
    bindHold(dom.bossRight, () => state.bossInput.right = true, () => state.bossInput.right = false);
    bindPress(dom.bossJump, () => jump(state.bp));
    bindPress(dom.bossAttack, bossAttack);
    bindPress(dom.bossDash, () => dash(state.bp, setBossMessage, updateBossHud));
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
    const release = (event) => { event.preventDefault(); active = false; button.blur(); };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  function bindHold(button, down, up) {
    let active = false;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (active) return;
      active = true;
      down();
      button.blur();
    });
    const release = (event) => {
      event.preventDefault();
      if (!active) return;
      active = false;
      up();
      button.blur();
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", release);
  }

  function preventBrowserGestures() {
    document.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
    window.addEventListener("contextmenu", (event) => event.preventDefault());
    document.addEventListener("selectstart", (event) => event.preventDefault());
    document.addEventListener("dragstart", (event) => event.preventDefault());
    document.addEventListener("gesturestart", (event) => event.preventDefault());
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("is-active"));
    (dom[id] || dom.hub).classList.add("is-active");
    state.screen = id;
    state.levelRun = false;
    state.bossRun = false;
    state.levelInput.left = state.levelInput.right = false;
    state.bossInput.left = state.bossInput.right = false;
    if (id === "game") startLevel();
    if (id === "boss") startBoss();
    window.scrollTo(0, 0);
  }

  function player(overrides = {}) {
    return { x: 70, y: 360, w: 34, h: 66, vx: 0, vy: 0, face: 1, onGround: false, armor: 3, health: 100, energy: 0, attackFlash: 0, invulnerable: 0, dashing: 0, intangible: 0, gateReached: false, ...overrides };
  }

  function restartLevel() {
    state.levelAtkLock = false;
    state.encounter = null;
    state.cam = 0;
    state.p = player();
    state.enemies = [enemy("slime", 500, 396, 38, 34, 1, { jumpy: true }), enemy("goblin", 930, 382, 50, 48, 2), enemy("bat", 1240, 250, 46, 34, 2, { flying: true })];
    state.traps = [trap(690, 405), trap(1120, 405)];
    state.pickups = [{ x: 720, y: 330, collected: false }, { x: 1420, y: 320, collected: false }];
    setLevelMessage("Forest path: traps now grab and require escape");
    updateLevelHud();
    drawLevel(0);
  }

  function startLevel() { restartLevel(); state.levelRun = true; state.levelLast = performance.now(); requestAnimationFrame(levelLoop); }
  function enemy(kind, x, y, w, h, hp, opt = {}) { return { kind, x, y, w, h, hp, maxHp: hp, dir: opt.dir || -1, flying: !!opt.flying, jumpy: !!opt.jumpy, t: 0 }; }
  function trap(x, y) { return { x, y, w: 92, h: 25, active: false, used: false, t: 0 }; }

  function startBoss() {
    const src = state.p || player({ energy: 20 });
    state.bossAtkLock = false;
    state.bp = player({ x: 110, armor: src.armor, health: src.health, energy: Math.max(20, src.energy) });
    state.boss = { x: 670, y: 326, w: 120, h: 104, hp: 100, maxHp: 100, hitFlash: 0, cooldown: 0.65, windup: 0, telegraph: 0, telegraphType: "", lastAttackType: "glob", projectiles: [] };
    setBossMessage(`Build ${BUILD}`);
    updateBossHud();
    drawBoss(0);
    state.bossRun = true;
    state.bossLast = performance.now();
    requestAnimationFrame(bossLoop);
  }

  function setLevelMessage(text) { dom.levelMessage.textContent = text; }
  function setBossMessage(text) { dom.bossMessage.textContent = text; }
  function dots(n) { return [1,2,3].map((i) => `<i class="dot ${i <= n ? "" : "is-empty"}"></i>`).join(""); }

  function updateLevelHud() {
    const p = state.p;
    dom.armorDots.innerHTML = dots(p.armor);
    dom.levelHealth.textContent = Math.max(0, Math.ceil(p.health));
    dom.levelHealthFill.style.width = `${clamp(p.health, 0, 100)}%`;
    dom.levelEnergy.textContent = Math.floor(p.energy);
    updateDashButton(dom.levelDash, p.energy);
  }

  function updateBossHud() {
    const p = state.bp, b = state.boss;
    dom.bossArmorDots.innerHTML = dots(p.armor);
    dom.bossPlayerHealth.textContent = Math.max(0, Math.ceil(p.health));
    dom.bossPlayerHealthFill.style.width = `${clamp(p.health, 0, 100)}%`;
    dom.bossEnergy.textContent = Math.floor(p.energy);
    dom.bossHitsLeft.textContent = Math.max(0, Math.ceil(b.hp / 10));
    dom.bossHealthFill.style.width = `${clamp(b.hp, 0, 100)}%`;
    updateDashButton(dom.bossDash, p.energy);
  }

  function updateDashButton(button, energy) { button.classList.toggle("is-locked", energy < CFG.dashCost); button.disabled = false; }

  function levelHold(dir, value) { if (state.encounter && value) { struggle(); return; } state.levelInput[dir] = value; }
  function levelAction(action) { if (state.encounter) { struggle(); return; } if (action === "jump") jump(state.p); if (action === "attack") levelAttack(); if (action === "dash") dash(state.p, setLevelMessage, updateLevelHud); }
  function jump(p) { if (p && p.onGround) { p.vy = CFG.jump; p.onGround = false; } }

  function dash(p, msg, hud) {
    if (!p || p.energy < CFG.dashCost) return;
    p.energy -= CFG.dashCost;
    p.dashing = 0.42; p.invulnerable = 0.8; p.intangible = 0.95; p.vx = CFG.dash * p.face;
    msg("Intangible"); hud();
  }

  function levelAttack() {
    const p = state.p;
    if (!p || state.levelAtkLock) return;
    state.levelAtkLock = true; setTimeout(() => state.levelAtkLock = false, 120);
    p.attackFlash = 0.14; p.energy = Math.min(100, p.energy + 4);
    const target = nearestEnemy(attackBox(p, CFG.levelReach), state.enemies, p);
    if (target) { target.hp -= 1; p.energy = Math.min(100, p.energy + 16); setLevelMessage(target.hp <= 0 ? "Enemy down" : `${target.kind} HP ${target.hp}/${target.maxHp}`); }
    else setLevelMessage("Miss");
    updateLevelHud();
  }

  function bossAttack() {
    const p = state.bp, b = state.boss;
    if (!p || !b || state.bossAtkLock || b.hp <= 0) return;
    state.bossAtkLock = true; setTimeout(() => state.bossAtkLock = false, 150);
    p.attackFlash = 0.14; p.energy = Math.min(100, p.energy + 4);
    if (rectsOverlap(attackBox(p, CFG.bossReach), b)) {
      b.hp -= 10; b.hitFlash = 0.18; p.energy = Math.min(100, p.energy + 14);
      setBossMessage(b.hp > 0 ? `King Slime: ${Math.ceil(b.hp / 10)} hits left` : "King Slime defeated");
      updateBossHud(); if (b.hp <= 0) finishBoss();
    } else { setBossMessage("Miss"); updateBossHud(); }
  }

  function finishBoss() {
    const p = state.bp, b = state.boss;
    b.hp = 0; state.bossRun = false; updateBossHud();
    setBossMessage("King Slime defeated");
    dom.hubText.textContent = "Level 1 clear: King Slime defeated.";
    dom.resultText.textContent = "King Slime defeated. Forest route cleared.";
    dom.resultStats.textContent = `Remaining health: ${Math.max(0, Math.ceil(p.health))} | Armor layers: ${p.armor} | Energy: ${Math.floor(p.energy)}`;
    setTimeout(() => showScreen("result"), 800);
  }

  function nearestEnemy(box, enemies, p) {
    let best = null, dist = Infinity;
    enemies.forEach((e) => { if (e.hp > 0 && rectsOverlap(box, e)) { const d = Math.abs(centerX(p) - centerX(e)); if (d < dist) { dist = d; best = e; } } });
    return best;
  }

  function attackBox(a, reach) { return { x: a.face > 0 ? a.x + a.w : a.x - reach, y: a.y + 10, w: reach, h: 38 }; }
  function canHit(a) { return a && a.invulnerable <= 0 && a.dashing <= 0 && a.intangible <= 0 && !state.encounter; }
  function canBossHit(a) { return a && a.invulnerable <= 0 && a.dashing <= 0 && a.intangible <= 0; }

  function hurtLevel(ignoreArmor) {
    const p = state.p; if (!canHit(p)) return;
    p.invulnerable = 1; p.energy = Math.min(100, p.energy + 12);
    if (p.armor > 0 && !ignoreArmor) { p.armor -= 1; setLevelMessage("Armor layer hit"); } else { p.health -= 25; setLevelMessage("Health damage"); }
    updateLevelHud(); if (p.health <= 0) setTimeout(restartLevel, 700);
  }

  function hurtBoss(ignoreArmor) {
    const p = state.bp; if (!canBossHit(p)) return;
    p.invulnerable = 1; p.energy = Math.min(100, p.energy + 12);
    if (p.armor > 0 && !ignoreArmor) { p.armor -= 1; setBossMessage("Armor layer hit"); } else { p.health -= 18; setBossMessage("Health damage"); }
    updateBossHud(); if (p.health <= 0) setTimeout(startBoss, 700);
  }

  function updateActor(a, input, dt, maxX, walk = CFG.walk) {
    a.attackFlash = Math.max(0, a.attackFlash - dt); a.invulnerable = Math.max(0, a.invulnerable - dt); a.dashing = Math.max(0, a.dashing - dt); a.intangible = Math.max(0, a.intangible - dt);
    const axis = Number(input.right) - Number(input.left);
    if (axis) { a.face = axis; a.vx = axis * (a.dashing > 0 ? CFG.dash : walk); } else if (a.dashing <= 0) a.vx *= 0.82;
    a.vy += CFG.gravity * dt; a.x += a.vx * dt; a.y += a.vy * dt;
    if (a.y + a.h >= CFG.groundY) { a.y = CFG.groundY - a.h; a.vy = 0; a.onGround = true; } else a.onGround = false;
    a.x = clamp(a.x, 20, maxX);
  }

  function updateLevel(dt) {
    const p = state.p;
    if (state.encounter) { updateEncounter(dt); state.cam = clamp(p.x - 330, 0, CFG.worldW - 960); return; }
    updateActor(p, state.levelInput, dt, CFG.worldW - 80, CFG.walk); state.cam = clamp(p.x - 330, 0, CFG.worldW - 960);
    state.traps.forEach((t) => { t.t += dt; if (!t.used && rectsOverlap(p, t) && canHit(p)) startEncounter(t); });
    state.enemies.forEach((e) => { if (e.hp <= 0) return; updateEnemy(e, dt); if (rectsOverlap(p, e)) hurtLevel(e.flying); });
    state.pickups.forEach((pick) => { if (!pick.collected && distance(p.x + 17, p.y + 33, pick.x, pick.y) < 42) { pick.collected = true; p.energy = Math.min(100, p.energy + 25); setLevelMessage("Pickup"); updateLevelHud(); } });
    if (p.x > CFG.gateX && !p.gateReached) { p.gateReached = true; setLevelMessage("Boss gate reached"); setTimeout(() => showScreen("boss"), 450); }
  }

  function updateEnemy(e, dt) {
    e.t += dt;
    if (e.flying) { e.x += e.dir * 82 * dt; e.y = 245 + Math.sin(e.t * 3) * 38; if (e.x < 1150 || e.x > 1440) e.dir *= -1; return; }
    if (e.jumpy) { e.x += e.dir * 58 * dt; e.y = CFG.groundY - e.h - Math.abs(Math.sin(e.t * 4.8)) * 42; if (e.x < 390 || e.x > 760) e.dir *= -1; return; }
    e.x += e.dir * 65 * dt; if (e.x < 840 || e.x > 1080) e.dir *= -1; e.y = CFG.groundY - e.h;
  }

  function startEncounter(t) {
    const p = state.p;
    t.active = true; p.vx = 0; p.vy = 0; p.dashing = 0; p.intangible = 0; p.invulnerable = 0;
    p.x = clamp(t.x + t.w / 2 - p.w / 2, 20, CFG.worldW - 80); p.y = CFG.groundY - p.h;
    state.levelInput.left = state.levelInput.right = false;
    state.encounter = { phase: "escape", source: t, progress: 0, required: CFG.trapEscapeRequired, layerTimer: CFG.trapFirstLayerDelay, layerInterval: CFG.trapLayerInterval, healthDrain: CFG.loopHealthDrain };
    setLevelMessage("Snared! Tap Jump / Atk / Dash to escape"); updateLevelHud();
  }

  function struggle() {
    const e = state.encounter; if (!e || e.phase !== "escape") return;
    e.progress = Math.min(e.required, e.progress + 1); setLevelMessage(`Escaping trap: ${e.progress}/${e.required}`);
    if (e.progress >= e.required) escapeEncounter();
  }

  function updateEncounter(dt) {
    const e = state.encounter, p = state.p; if (!e) return;
    p.vx = 0; p.vy = 0; p.y = CFG.groundY - p.h;
    if (e.phase === "escape") {
      e.layerTimer -= dt;
      if (e.layerTimer <= 0) {
        if (p.armor > 0) { p.armor -= 1; setLevelMessage(p.armor > 0 ? "Trap removed one layer" : "Capture loop triggered"); updateLevelHud(); }
        if (p.armor <= 0) { e.phase = "captureLoop"; setLevelMessage("Capture loop placeholder - health draining"); updateLevelHud(); return; }
        e.layerTimer += e.layerInterval;
      }
    }
    if (e.phase === "captureLoop") {
      p.health = Math.max(0, p.health - e.healthDrain * dt); updateLevelHud();
      if (p.health <= 0) { e.phase = "failed"; setLevelMessage("Failure loop - Restart or Hub"); }
    }
  }

  function escapeEncounter() { const e = state.encounter; if (!e) return; e.source.used = true; e.source.active = false; state.encounter = null; state.p.invulnerable = 0.8; setLevelMessage("Escaped the snare"); updateLevelHud(); }

  function updateBoss(dt) {
    const p = state.bp, b = state.boss; updateActor(p, state.bossInput, dt, 820);
    b.hitFlash = Math.max(0, b.hitFlash - dt); b.cooldown -= dt; b.windup = Math.max(0, b.windup - dt);
    if (b.telegraph > 0) { b.telegraph -= dt; if (b.telegraph <= 0) releaseBossAttack(); }
    b.x += Math.sign(centerX(p) - centerX(b)) * 36 * dt; b.x = clamp(b.x, 520, 820);
    if (b.cooldown <= 0 && b.telegraph <= 0 && b.windup <= 0) { b.cooldown = 1.05; beginBossAttack(); }
    if (b.windup > 0 && canBossHit(p) && rectsOverlap(p, bossSlamZone())) hurtBoss(false);
    b.projectiles.forEach((proj) => updateProjectile(proj, p, dt)); b.projectiles = b.projectiles.filter((proj) => proj.life > 0 && proj.x > -80 && proj.x < 1040);
    if (canBossHit(p) && rectsOverlap(p, b)) hurtBoss(false);
  }

  function beginBossAttack() { const p = state.bp, b = state.boss, glob = Math.abs(centerX(p) - centerX(b)) > 215 || b.lastAttackType === "slam"; b.telegraph = glob ? 0.38 : 0.3; b.telegraphType = glob ? "glob" : "slam"; b.lastAttackType = b.telegraphType; setBossMessage(glob ? "King Slime forms a glob" : "King Slime swells up"); }
  function releaseBossAttack() { const p = state.bp, b = state.boss; if (b.telegraphType === "slam") b.windup = 0.22; if (b.telegraphType === "glob") { const dir = centerX(p) < centerX(b) ? -1 : 1; b.projectiles.push({ x: b.x + b.w / 2, y: b.y + 50, w: 28, h: 28, vx: dir * 290, life: 2.8, ignoreUntilClear: false }); } b.telegraphType = ""; }
  function updateProjectile(proj, p, dt) { proj.x += proj.vx * dt; proj.life -= dt; const touching = rectsOverlap(p, proj); if (!touching) { proj.ignoreUntilClear = false; return; } if (!canBossHit(p)) { proj.ignoreUntilClear = true; return; } if (proj.ignoreUntilClear) return; proj.life = 0; hurtBoss(false); }
  function bossSlamZone() { const b = state.boss; return { x: b.x - 74, y: b.y + 18, w: b.w + 148, h: 82 }; }

  function levelLoop(now) { if (!state.levelRun) return; const dt = Math.min(0.033, (now - state.levelLast) / 1000); state.levelLast = now; updateLevel(dt); drawLevel(now / 1000); requestAnimationFrame(levelLoop); }
  function bossLoop(now) { if (!state.bossRun) return; const dt = Math.min(0.033, (now - state.bossLast) / 1000); state.bossLast = now; updateBoss(dt); drawBoss(now / 1000); requestAnimationFrame(bossLoop); }

  function drawLevel(time) { const ctx = dom.levelCtx, cam = state.cam; clear(ctx); forest(ctx, cam, time); ground(ctx, -cam, CFG.worldW); traps(ctx, cam, time); gate(ctx, cam, time); pickups(ctx, cam, time); enemies(ctx, cam, time); attackFx(ctx, state.p, CFG.levelReach, cam); witch(ctx, state.p, cam, time); trapWrap(ctx, state.p, cam, time); hitbox(ctx, state.p, cam); encounterOverlay(ctx); }
  function drawBoss(time) { const ctx = dom.bossCtx, b = state.boss; clear(ctx); forest(ctx, 0, time); ground(ctx, 0, 960); if (b.telegraph > 0 && b.telegraphType === "slam") slamWarn(ctx, bossSlamZone(), time); if (b.windup > 0) slamActive(ctx, bossSlamZone(), time); if (b.telegraph > 0 && b.telegraphType === "glob") globCharge(ctx, b, time); b.projectiles.forEach((proj) => projectile(ctx, proj, time)); kingSlime(ctx, b, time); attackFx(ctx, state.bp, CFG.bossReach, 0); witch(ctx, state.bp, 0, time); hitbox(ctx, state.bp, 0); ctx.fillStyle = C.white; ctx.font = "16px system-ui"; ctx.fillText(`King Slime hits left: ${Math.max(0, Math.ceil(b.hp / 10))}`, 20, 34); }

  function clear(ctx) { const g = ctx.createLinearGradient(0, 0, 0, 430); g.addColorStop(0, C.sky1); g.addColorStop(1, C.sky2); ctx.clearRect(0, 0, 960, 540); ctx.fillStyle = g; ctx.fillRect(0, 0, 960, 540); }
  function forest(ctx, cam) { treeLayer(ctx, cam * 0.16, 72, "#1e1b4b", 0.8); treeLayer(ctx, cam * 0.32, 132, "#312e81", 0.58); treeLayer(ctx, cam * 0.52, 196, "#111827", 0.74); }
  function treeLayer(ctx, cam, baseY, color, alpha) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; for (let x = -120; x < 1100; x += 96) { const dx = x - (cam % 96), h = 210 + ((x * 7) % 70); ctx.fillRect(dx + 38, baseY + 160 - h, 20, h); ctx.beginPath(); ctx.moveTo(dx - 12, baseY + 160 - h + 65); ctx.lineTo(dx + 48, baseY + 160 - h - 30); ctx.lineTo(dx + 110, baseY + 160 - h + 65); ctx.closePath(); ctx.fill(); } ctx.restore(); }
  function ground(ctx, ox, w) { ctx.fillStyle = C.ground; ctx.fillRect(ox, CFG.groundY, w, 110); ctx.fillStyle = C.groundTop; ctx.fillRect(ox, CFG.groundY, w, 10); }
  function traps(ctx, cam, time) { state.traps.forEach((t) => { const x = t.x - cam; ctx.save(); ctx.globalAlpha = t.used ? 0.28 : 1; ctx.fillStyle = t.active ? "rgba(244,114,182,.45)" : "rgba(52,211,153,.28)"; ctx.beginPath(); ctx.ellipse(x + t.w / 2, t.y + t.h / 2, t.w / 2, t.h / 2 + Math.sin(time * 5 + t.x) * 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "rgba(209,250,229,.55)"; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 12 + i * 20, t.y + 18); ctx.quadraticCurveTo(x + 8 + i * 24, t.y - 12 - Math.sin(time * 6 + i) * 8, x + 22 + i * 20, t.y + 8); ctx.stroke(); } ctx.restore(); }); }
  function gate(ctx, cam, time) { const x = CFG.gateX - cam; ctx.save(); ctx.translate(x + 24, 378); ctx.fillStyle = "rgba(192,132,252,.15)"; ctx.beginPath(); ctx.ellipse(0, 4, 48 + Math.sin(time * 4) * 3, 78, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#6b21a8"; ctx.fillRect(-22, -50, 44, 100); ctx.fillStyle = "#f9a8d4"; ctx.fillRect(-13, -39, 26, 78); ctx.restore(); }
  function pickups(ctx, cam, time) { state.pickups.forEach((p) => { if (p.collected) return; ctx.fillStyle = C.magic; ctx.beginPath(); ctx.arc(p.x - cam, p.y + Math.sin(time * 5) * 4, 13, 0, Math.PI * 2); ctx.fill(); }); }
  function enemies(ctx, cam, time) { state.enemies.forEach((e) => { if (e.hp <= 0) return; if (e.kind === "slime") slime(ctx, e, cam); if (e.kind === "goblin") goblin(ctx, e, cam); if (e.kind === "bat") bat(ctx, e, cam, time); ctx.fillStyle = "#fff"; ctx.font = "12px system-ui"; ctx.fillText(String(e.hp), e.x - cam + e.w / 2 - 3, e.y - 7); }); }
  function slime(ctx, e, cam) { ctx.fillStyle = C.slimeDark; ctx.beginPath(); ctx.ellipse(e.x - cam + e.w / 2, e.y + e.h - 12, 22, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.slime; ctx.beginPath(); ctx.ellipse(e.x - cam + e.w / 2, e.y + e.h - 17, 16, 12, 0, 0, Math.PI * 2); ctx.fill(); }
  function goblin(ctx, e, cam) { const x = e.x - cam, y = e.y; ctx.fillStyle = C.goblin; ctx.fillRect(x + 8, y + 18, 34, 30); ctx.beginPath(); ctx.ellipse(x + 25, y + 9, 17, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#0f172a"; ctx.fillRect(x + 29, y + 6, 4, 4); }
  function bat(ctx, e, cam, time) { const x = e.x - cam + e.w / 2, y = e.y + e.h / 2, flap = Math.sin(time * 15) * 13; ctx.fillStyle = "rgba(124,45,18,.6)"; ctx.beginPath(); ctx.moveTo(x - 8, y); ctx.quadraticCurveTo(x - 42, y - 24 - flap, x - 38, y + 20); ctx.lineTo(x - 9, y + 13); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.quadraticCurveTo(x + 42, y - 24 + flap, x + 38, y + 20); ctx.lineTo(x + 9, y + 13); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.bat; ctx.beginPath(); ctx.ellipse(x, y, 15, 12, 0, 0, Math.PI * 2); ctx.fill(); }

  function attackFx(ctx, a, reach, cam) { if (!a || a.attackFlash <= 0) return; const b = attackBox(a, reach); ctx.fillStyle = "rgba(251,191,36,.65)"; ctx.beginPath(); ctx.ellipse(b.x - cam + reach / 2, b.y + 18, reach * 0.58, 26, 0, 0, Math.PI * 2); ctx.fill(); }
  function witch(ctx, p, cam, time) { if (!p) return; const x = p.x - cam + p.w / 2, y = p.y + p.h, flicker = (p.invulnerable > 0 || p.dashing > 0 || p.intangible > 0) && Math.floor(Date.now() / 70) % 2; ctx.save(); ctx.translate(x, y + (p.onGround ? Math.sin(time * 10) * Math.min(1, Math.abs(p.vx) / CFG.walk) * 2 : -2)); ctx.scale(p.face, 1); ctx.globalAlpha = flicker ? 0.62 : 1; if (p.dashing > 0) { ctx.fillStyle = "rgba(244,114,182,.18)"; ctx.fillRect(-60, -62, 42, 42); } ctx.fillStyle = C.black; ctx.beginPath(); ctx.moveTo(-18, -58); ctx.quadraticCurveTo(-31, -38, -24, -12); ctx.lineTo(18, -14); ctx.lineTo(16, -58); ctx.closePath(); ctx.fill(); if (p.armor >= 2) { ctx.fillStyle = C.pink; ctx.fillRect(-17, -54, 24, 34); } ctx.fillStyle = p.armor > 0 ? C.outfit : "#d8b4fe"; ctx.fillRect(-14, -61, 28, 36); ctx.fillStyle = C.skin; ctx.fillRect(-11, -31, 8, 20); ctx.fillRect(4, -31, 8, 20); ctx.fillStyle = C.boot; ctx.fillRect(-13, -15, 11, 17); ctx.fillRect(3, -15, 11, 17); ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -76, 13, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.pink; ctx.beginPath(); ctx.ellipse(-2, -82, 17, 14, -0.22, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.black; ctx.beginPath(); ctx.ellipse(0, -88, 28, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, -89); ctx.quadraticCurveTo(-3, -126, 14, -91); ctx.closePath(); ctx.fill(); ctx.restore(); }
  function trapWrap(ctx, p, cam, time) { const e = state.encounter; if (!e || !p) return; const x = p.x - cam + p.w / 2, y = p.y + p.h; ctx.strokeStyle = e.phase === "escape" ? "rgba(52,211,153,.9)" : "rgba(244,114,182,.9)"; ctx.lineWidth = 5; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x - 36 + i * 18, y + 2); ctx.quadraticCurveTo(x - 28 + i * 12, y - 35 - Math.sin(time * 7 + i) * 8, x - 18 + i * 9, y - 18); ctx.stroke(); } }
  function encounterOverlay(ctx) { const e = state.encounter; if (!e) return; ctx.fillStyle = "rgba(15,23,42,.72)"; ctx.fillRect(180, 22, 600, e.phase === "escape" ? 86 : 108); ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.strokeRect(180, 22, 600, e.phase === "escape" ? 86 : 108); ctx.fillStyle = "#fff"; ctx.font = "18px system-ui"; if (e.phase === "escape") { ctx.fillText("TRAPPED — tap Jump / Atk / Dash to escape", 205, 52); ctx.fillStyle = "#374151"; ctx.fillRect(205, 68, 420, 18); ctx.fillStyle = C.slime; ctx.fillRect(205, 68, 420 * (e.progress / e.required), 18); ctx.fillStyle = "#cbd5e1"; ctx.font = "14px system-ui"; ctx.fillText(`Escape ${e.progress}/${e.required}    Next layer: ${Math.max(0, e.layerTimer).toFixed(1)}s`, 640, 83); } else { ctx.fillText(e.phase === "failed" ? "FAILURE LOOP PLACEHOLDER" : "CAPTURE LOOP PLACEHOLDER", 205, 52); ctx.fillStyle = "#cbd5e1"; ctx.font = "15px system-ui"; ctx.fillText("Health drains here. Use Restart or Hub to exit this prototype state.", 205, 82); } }
  function kingSlime(ctx, b, time) { const hit = b.hitFlash > 0, wobble = Math.sin(time * 5) * 6; ctx.save(); ctx.translate(b.x + b.w / 2, b.y + b.h); const grad = ctx.createRadialGradient(-20, -64, 16, 0, -42, 96); grad.addColorStop(0, hit ? "#fef3c7" : "#f0abfc"); grad.addColorStop(0.4, hit ? "#fbbf24" : C.boss); grad.addColorStop(1, C.bossDark); ctx.fillStyle = grad; ctx.beginPath(); ctx.moveTo(-66, 0); ctx.quadraticCurveTo(-70, -64 + wobble, -8, -92); ctx.quadraticCurveTo(54, -72 - wobble, 66, 0); ctx.quadraticCurveTo(22, 15, -66, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.white; ctx.fillRect(-24, -54, 8, 8); ctx.fillRect(18, -54, 8, 8); ctx.fillStyle = C.trim; ctx.beginPath(); ctx.moveTo(-24, -82); ctx.lineTo(-10, -106); ctx.lineTo(2, -86); ctx.lineTo(18, -108); ctx.lineTo(28, -79); ctx.closePath(); ctx.fill(); ctx.restore(); }
  function slamWarn(ctx, z, time) { ctx.fillStyle = "rgba(251,113,133,.16)"; ctx.fillRect(z.x, z.y, z.w, z.h); ctx.strokeStyle = "rgba(251,113,133,.65)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(z.x + z.w / 2, z.y + z.h / 2, z.w / 2, 24 + Math.sin(time * 18) * 4, 0, 0, Math.PI * 2); ctx.stroke(); }
  function slamActive(ctx, z, time) { ctx.fillStyle = "rgba(251,113,133,.32)"; ctx.fillRect(z.x, z.y, z.w, z.h); ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.ellipse(z.x + z.w / 2, z.y + z.h / 2, z.w / 2, 22 + Math.sin(time * 40) * 2, 0, 0, Math.PI * 2); ctx.fill(); }
  function globCharge(ctx, b, time) { const r = 18 + Math.sin(time * 18) * 4; ctx.fillStyle = "rgba(192,132,252,.2)"; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 50, r + 18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(52,211,153,.72)"; ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + 50, r, 0, Math.PI * 2); ctx.fill(); }
  function projectile(ctx, p, time) { ctx.fillStyle = "rgba(52,211,153,.18)"; ctx.beginPath(); ctx.arc(p.x, p.y, 25, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = C.slime; ctx.beginPath(); ctx.arc(p.x, p.y, 12 + Math.sin(time * 12) * 1.5, 0, Math.PI * 2); ctx.fill(); }
  function hitbox(ctx, a, cam) { if (!a) return; ctx.strokeStyle = "rgba(56,189,248,.18)"; ctx.strokeRect(a.x - cam, a.y, a.w, a.h); }

  function rectsOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function centerX(r) { return r.x + r.w / 2; }
  function distance(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
})();
