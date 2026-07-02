async function loadData() {
  try {
    const response = await fetch("lists.json");
    if (!response.ok) throw new Error("Failed to load lists.json");
    return await response.json();
  } catch (err) {
    console.error("JSON load error:", err);
    return { videos: [], futureVideos: [] };
  }
}

function buildTagsHTML(tags) {
  if (!tags || tags.length === 0) return "";
  return `<div class="tags">${tags
    .map(t => `<span class="tag">${t}</span>`)
    .join("")}</div>`;
}

function getVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

function buildList(container, items, startRank) {
  for (let l = 0; l < items.length; l++) {
    const v = items[l];
    const rank = startRank + l;
    const id = getVideoId(v.url);

    const thumbSrc =
      v.thumb || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null);

    const thumbHTML = thumbSrc
      ? `<img src="${thumbSrc}" alt="thumbnail" />`
      : `<span class="play-tri"></span>`;

    const a = document.createElement("a");
    a.href = v.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    if (v.unverified) {
      a.classList.add("unverified-item");
      const pct = Math.min(100, Math.max(0, v.progress ?? 0));

      a.innerHTML = `
        <div class="thumb thumb-overlay-wrap">
          ${thumbHTML}
          <div class="unverified-label">Unverified</div>
        </div>
        <div class="info">
          <div class="name">${v.name}</div>
          <div class="url">${pct}% progress</div>
          ${buildTagsHTML(v.tags)}
        </div>
        <div class="rank">
          <div>${String(rank).padStart(2, "0")}</div>
          <div class="unverified-badge">Unverified</div>
        </div>`;
    } else {
      a.innerHTML = `
        <div class="thumb">${thumbHTML}</div>
        <div class="info">
          <div class="name">${v.name}</div>
          <div class="url">${v.url}</div>
          ${buildTagsHTML(v.tags)}
        </div>
        <div class="rank">${String(rank).padStart(2, "0")}</div>`;
    }

    container.appendChild(a);
  }
}

/* -------------------------------------------------------
   PLAYER COMPLETIONS - add players and their verified
   demon completions here. names must match the list
   exactly (case-sensitive).
------------------------------------------------------- */

const playerCompletions = {

  "wPopoff": ["Society (V)", "Amethyst (V)", "Thinking Space II (1)", "Tidal Wave", "BOOBAWAMBA", "Every End", "Subsuming Vortex (1)", "Silent clubstep", "andromeda", "Avernus", "Anathema", "Acheron", "Spectre", "roses and flowers (V)", "Menace", "Abyss of Darkness", "Defeated Circles", "Tunnel of Despair (1)", "Kyouki", "Subterminal Point", "Slaughterhouse", "KOCMOC", "The Lightning Rod", "Deimos", "Eyes in the Water", "KOSETSU", "Firework", "Silentlocked", "MINUSdry", "Saul Goodman", "Apocalyptic Trilogy", "The Hallucination", "Loops of Fury", "Deadlier Clubstep", "Edge of Destiny"],
  //BUOC
  "Zoink": ["Amethyst (1)", "Thinking Space II (V)", "Flamewall (1)", "Tidal Wave (V)", "ORBIT (V)", "Nullscapes (V)", "Quanteuse processing (V)", "BOOBAWAMBA", "Every End (1)", "Penumbral", "Ashley Wave Trials (V)", "Subsuming Vortex", "Silent clubstep (1)", "andromeda (1)", "Avernus (V)", "Anathema", "Acheron (V)", "Spectre", "Menace", "Abyss of Darkness", "The Bloop (V)", "Defeated Circles (V)", "Tunnel of Despair (V)", "Kyouki (1)", "Subterminal Point (1)", "Slaughterhouse (1)", "KOCMOC (1)", "The Lightning Rod (1)", "Deimos (1)", "Sakupen Circles", "Eyes in the Water", "KOSETSU", "Through The Gates (V)", "Firework", "Silentlocked (1)", "CONVULSION", "MINUSdry", "Saul Goodman (1)", "Apocalyptic Trilogy", "The Hallucination", "COMBUSTION (1)", "Deadlier Clubstep", "Edge of Destiny (1)"],
  "Cuatrocientos": ["Flamewall (V)", "Voltage (1)", "Through The Gates", "The Hallucination"],
  //BUOC
  "zLevii": ["Flamewall", "Anathema", "Acheron", "Spectre", "Kyouki", "Slaughterhouse", "KOCMOC", "CHIL", "Deimos", "Eyes in the Water", "KOSETSU", "Through The Gates", "Firework", "CONVULSION", "MINUSdry", "Saul Goodman", "The Hallucination", "COMBUSTION", "Deadlier Clubstep", "Edge of Destiny"],
  "Trick": ["Tidal Wave (1)", "Silent clubstep", "Avernus", "Anathema", "Acheron", "Spectre", "Abyss of Darkness (1)", "Tunnel of Despair", "Kyouki", "Subterminal Point", "Slaughterhouse", "KOCMOC (V)", "The Lightning Rod", "Deimos", "Sakupen Circles", "Eyes in the Water", "KOSETSU", "Firework (V)", "MINUSdry", "Saul Goodman", "Apocalyptic Trilogy", "The Hallucination", "COMBUSTION", "Deadlier Clubstep", "Edge of Destiny"],
  "Taiago": ["Tidal Wave", "andromeda (V)", "Avernus", "Acheron", "Tunnel of Despair", "Kyouki", "Slaughterhouse", "Sakupen Circles", "KOSETSU (V)", "Firework", "Saul Goodman", "COMBUSTION", "Edge of Destiny"],
  "A6": ["Tidal Wave", "Subsuming Vortex", "andromeda", "Avernus", "Anathema (1)", "Acheron", "Defeated Circles", "Tunnel of Despair", "Slaughterhouse"],
  //BUOC
  "Netermind": ["Tidal Wave", "Silent clubstep", "andromeda", "Avernus", "Anathema", "Acheron", "Menace", "Abyss of Darkness", "Defeated Circles (1)", "Tunnel of Despair", "Subterminal Point", "Slaughterhouse", "KOCMOC", "The Lightning Rod", "Deimos", "Sakupen Circles", "Eyes in the Water (1)", "KOSETSU", "Firework", "Silentlocked", "The Salt Factory", "MINUSdry", "Saul Goodman", "Apocalyptic Trilogy", "The Hallucination", "COMBUSTION", "Edge of Destiny"],
  //BUOC
  "JesseGamingGD": ["Tidal Wave", "Acheron", "Spectre", "Slaughterhouse", "Deimos", "Firework", "MINUSdry", "The Hallucination", "Edge of Destiny"],
  "레전드아잉몰라요": ["Tidal Wave", "Slaughterhouse", "KOCMOC"],
  "Nickname09": ["Green Bullet (V)", "Ashley Wave Trials (1)", "andromeda", "Avernus", "Acheron", "Tunnel of Despair", "Kyouki", "KOCMOC", "The Salt Factory (V)"],
  "dovv1n": ["ORBIT (1)", "Quanteuse processing (1)", "Every End", "Penumbral (1)", "Silent clubstep", "andromeda", "Spectre", "CONVULSION", "COMBUSTION"],
  "Glowgmd": ["SARY NEVER CLEAR (V)"],
  "noname228gg": ["SARY NEVER CLEAR (1)", "Silent clubstep", "Abyss of Darkness"],
  "spookkd": ["Nullscapes (1)", "Kyouki", "Slaughterhouse"],
  "whfyre": ["Nullscapes", "Silent clubstep", "Based After Based (1)", "Subterminal Point", "Sakupen Circles", "Through The Gates", "MINUSdry"],
  //BUOC
  "Hover": ["Nullscapes", "Silent clubstep", "Acheron", "Slaughterhouse", "Sakupen Circles", "Firework", "MINUSdry", "Saul Goodman", "The Hallucination", "Deadlier Clubstep", "Edge of Destiny"],
  "w3rty": ["Nullscapes", "Every End", "Penumbral (V)", "andromeda", "Avernus", "Anathema", "Acheron", "Spectre", "Tunnel of Despair", "Kyouki", "Slaughterhouse"],
  //BUOC
  "Theitha": ["Nullscapes", "Slaughterhouse", "Eyes in the Water", "Saul Goodman"],
  "Cryostazz": ["Nullscapes", "Slaughterhouse"],
  "benbotwyd": ["Nullscapes"],
  //BUOC
  "seregiusz": ["Quanteuse processing"],
  "eastshark": ["BOOBAWAMBA (V)", "Avernus", "Acheron", "Spectre", "Kyouki", "Slaughterhouse", "Sakupen Circles", "Eyes in the Water", "Voltage", "KOSETSU", "Firework", "Silentlocked", "MINUSdry", "Apocalyptic Trilogy", "The Hallucination", "COMBUSTION", "Edge of Destiny"],
  "agonom": ["BOOBAWAMBA (1)", "Through The Gates", "The Salt Factory", "Deadlier Clubstep"],
  "Vorten": ["BOOBAWAMBA", "Avernus", "Acheron", "Spectre", "Abyss of Darkness", "Defeated Circles", "Tunnel of Despair", "Kyouki", "Slaughterhouse", "Sevvend Clubstep (V)"],
  "cbremner": ["BOOBAWAMBA"],
  "ad3usgmd": ["Sakupen circles (V)", "Slaughterhouse", "Sakupen Circles"],
  "ROZE": ["Sakupen circles (1)", "Silent clubstep", "Aquamarine (1)", "Anathema", "Acheron", "roses and flowers (1)", "Abyss of Darkness", "Avernus", "Defeated Circles", "Tunnel of Despair", "Slaughterhouse", "KOCMOC", "wocky circles (V)"],
  "totalgd": ["Sakupen circles"],
  //BUOC
  "Bacon": ["Sakupen circles", "Lesopowal (V)", "Penumbral", "Aquamarine", "Avernus", "Slaughterhouse"],
  "BONN GD": ["Herr Machine (V)"],
  "Hqmy": ["Every End (V)", "andromeda", "Acheron", "Kyouki", "Slaughterhouse", "KOSETSU (1)", "MINUSdry", "Saul Goodman", "COMBUSTION"],
  "garbag": ["Every End"],
  "Stefan Boss": ["Every End", "Acheron", "Abyss of Darkness", "The Hallucination", "COMBUSTION", "Deadlier Clubstep", "Edge of Destiny"],
  //BUOC
  "N3bulA_": ["Every End"],
  "PlusrMinus": ["Every End", "Firework"],
  "TFIBB": ["Every End", "Kyouki", "The Lightning Rod", "Silentlocked (V)", "MINUSdry", "The Hallucination"],
  "lanx": ["Every End", "Tunnel of Despair", "Eyes in the Water", "The Salt Factory", "MINUSdry", "COMBUSTION"],
  "Samot": ["Every End", "Based After Based", "Firework", "The Hallucination"],
  "bims": ["Every End", "Menace"],
  "Seturan": ["Every End", "Silent clubstep", "Abyss of Darkness", "Slaughterhouse", "Sakupen Circles", "Eyes in the Water", "Saul Goodman", "Deadlier Clubstep"],
  "NailedGD": ["Every End"],
  "Brumik": ["Every End", "Subterminal Point"],
  "SeptaGon7": ["Old Orochi (V)", "Through The Gates (1)"],
  "Wity": ["Ultra Paracosm (V)", "Sakupen Circles", "The Hallucination"],
  "apuu": ["Subconscious (V)"],
  "Cursed": ["Subsuming Vortex (V)", "Acheron", "Abyss of Darkness (V)", "Tunnel of Despair", "Slaughterhouse", "KOCMOC", "Map Of Problematique (1)", "Sakupen Circles (1)", "Exens Limit (V)", "Firework", "The Hallucination"],
  "weyolll3": ["Subsuming Vortex", "Avernus", "Acheron", "Spectre", "Defeated Circles", "Kyouki", "Slaughterhouse", "Deimos", "Sakupen Circles", "KOSETSU", "poocubed", "Calibrate (1)", "MINUSdry", "Saul Goodman", "The Hallucination"],
  "zoe": ["Silent clubstep (V)", "Acheron", "Slaughterhouse", "KOCMOC", "Element 111 Rg (V)", "Sakupen Circles"],
  "구아이": ["Silent clubstep", "KOCMOC", "zorin", "Ronaldo Circles (V)"],
  "MostDefinitelyAlbert": ["Silent clubstep", "Acheron", "Spectre", "Slaughterhouse", "Deimos", "Firework", "Apocalyptic Trilogy", "Netherix"],
  "Laniakea": ["andromeda", "Abyss of Darkness", "Kyouki", "Slaughterhouse", "The Lightning Rod", "Deimos", "Sakupen Circles", "Firework", "NOMAD (V)", "poocubed", "MINUSdry", "COMBUSTION", "Edge of Destiny", "COMBUSTION", "Edge of Destiny"],
  "Sharkified": ["andromeda", "Acheron", "Defeated Circles", "Tunnel of Despair", "Kyouki", "Slaughterhouse", "KOCMOC", "CHIL", "KOSETSU", "Firework", "Saul Goodman", "The Hallucination"],
  //BUOC
  "kloone": ["KILLSTEALER (V)", "Anathema", "Acheron", "Kyouki", "Subterminal Point", "Slaughterhouse", "KOCMOC", "The Lightning Rod", "CONVULSION", "Saul Goodman"],
  "seels": ["Aquamarine (V)", "Map Of Problematique (V)", "Sakupen Circles"],
  "Diamond": ["Silent clubstep", "Avernus (1)", "Slaughterhouse", "Sakupen Circles (V)"],
  "Yumira": ["Avernus", "Acropolis Circles (V)"],
  "Mizukii": ["Avernus", "Anathema", "Acheron", "Abyss of Darkness", "Kyouki", "Thinking Space II Legacy (1)", "Slaughterhouse", "Firework", "MINUSdry", "Saul Goodman", "The Hallucination", "COMBUSTION", "Deadlier Clubstep"],
  //BUOC
  "Abdieldevil": ["Avernus", "Acheron", "Slaughterhouse", "KOCMOC", "CHIL (1)", "Through The Gates", "Saul Goodman", "COMBUSTION", "Edge of Destiny"],
  "Whizkid05": ["Anathema (V)", "Menace (V)", "The Lightning Rod", "Eyes in the Water", "Firework", "The Salt Factory (1)", "CONVULSION (V)", "Saul Goodman", "Edge of Destiny"],
  "PoCle": ["Anathema", "Abyss of Darkness", "Subterminal Point (V)", "Slaughterhouse", "Deimos", "Eyes in the Water", "MINUSdry", "Edge of Destiny"],
  "Sevant": ["Diabolic ClubStep (V)", "Apocalyptic Trilogy"],
  "Doggie": ["Silent clubstep", "Avernus", "Acheron (1)", "Abyss of Darkness", "Slaughterhouse (V)", "KOCMOC", "Deimos (V)", "Firework", "Edge of Destiny"],
  "PersonHuman42": ["Spectre (V)", "Slaughterhouse", "Firework", "MINUSdry", "Apocalyptic Trilogy", "The Hallucination", "Edge of Destiny"],
  "Thnnder": ["Acheron", "Spectre", "Menace (1)", "Abyss of Darkness", "Slaughterhouse", "Eyes in the Water", "KOSETSU", "Firework", "MINUSdry", "Saul Goodman", "The Hallucination", "COMBUSTION", "Deadlier Clubstep", "Edge of Destiny"],
  "Joker": ["Acheron", "Deimos", "ETERNALtheory (1)"],
  "Eandis": ["Acheron", "Unnerfed Innards (V)"],
  "Komet01": ["Acheron", "Subterminal Point", "Slaughterhouse", "KOCMOC", "KOSETSU", "MINUSdry", "Saul Goodman", "Sevvend Clubstep", "COMBUSTION", "Edge of Destiny"],
  "Ekskriptn": ["Acheron", "Silent clubstep", "Anathema", "Slaughterhouse", "Deimos", "Sakupen Circles", "Firework", "Always Miss You (V)", "The Hallucination", "ETERNALtheory",],
  "KrNati": ["Menace", "Battle of the Shades", "The Hallucination"],
  "ViperVenom95": ["Abyss of Darkness", "Kyouki", "Deimos", "Firework", "MINUSdry (1)", "Saul Goodman", "The Hallucination", "Edge of Destiny", "Saul Goodman", "The Hallucination", "Edge of Destiny"],
  "Zeronium": ["Abyss of Darkness", "Thinking Space II Legacy (V)", "Deimos", "Edge of Destiny"],
  "dils thik": ["Abyss of Darkness (Old) (V)"],
  "Hipo": ["SWI Slithium (V)", "Slaughterhouse", "Through The Gates", "Firework", "Saul Goodman", "The Hallucination"],
  "出見塩": ["Kyouki (V)"],
  "cobrablitz": ["Kyouki", "Slaughterhouse", "The Hallucination"],
  "Blebae": ["Kyouki", "Firework", "Calibrate (V)", "Saul Goodman"],
  "goobs": ["Kyouki", "NOMAD", "BEING HOME (V)", "Sevvend Clubstep"],
  "DiamondSplash": ["Based After Based (V)", "Kyouki", "Firework", "Edge of Destiny"],
  "Lino": ["Subterminal Point"],
  "Superjavicon": ["Slaughterhouse", "Deimos", "Snowbound (1)", "poocubed", "Saul Goodman", "The Hallucination", "COMBUSTION", "Edge of Destiny", "The Hallucination", "COMBUSTION", "Edge of Destiny"],
  "Yanlici": ["Slaughterhouse"],
  "nebnoob": ["Unnerfed Zodiac (V)"],
  "McCoco": ["CHIL (V)"],
  "Amplitron": ["CHIL", "NOMAD", "Snowbound (V)", "CONVULSION"],
  "Lavatrex": ["The Lightning Rod (V)"],
  "Scotchtape": ["Deimos", "Master of Puppets (V)", "Apocalyptic Trilogy", "Sevvend Clubstep", "Stellar Night"],
  "spcreat": ["Maniacal Chains (V)"],
  "Tuggy": ["Sakupen Circles", "Stellar Night (V)"],
  "Skylar": ["Sakupen Circles", "Exens Limit (1)"],
  "LordVadercraft": ["Centipede (V)", "Eyes in the Water (V)", "Firework"],
  "maybee": ["Voltage (V)"],
  "Aidaen": ["Ace (V)", "Firework"],
  "Crisis": ["Firework (1)"],
  "Kyasshukodo": ["Firework", "poocubed (V)"],
  "Hyperlith": ["Firework", "ETERNALtheory (V)"],
  "TheLuin": ["Temporal Origin (V)"],
  "veshel": ["VOID (V)"],
  "Kyy": ["Eclipse (V)", "poocubed"],
  "Q1M": ["far apart (V)"],
  "MegaCatMan": ["BANG BANG BANG (V)"],
  "Varium": ["MINUSdry (V)"],
  "jupi": ["Kintetsu (V)", "Saul Goodman"],
  "bloom": ["Saul Goodman (V)", "Edge of Destiny"],
  "Slithium": ["Saul Goodman", "COMBUSTION (V)"],
  "Gnamolor": ["Haunted Ship (V)"],
  "Polterghast": ["Apocalyptic Trilogy (V)", "Edge of Destiny (V)"],
  "Jenath": ["Apocalyptic Trilogy (1)", "Deadlier Clubstep (V)"],
  "VoTcHi": ["The Hallucination (V)"],
  "tteokk": ["COMBUSTION", "Loops of Fury (1)"],
  "Cork": ["Loops of Fury (V)"],
  "aubbie": ["diviners sage (V)"]

};

/* -------------------------------------------------------
   STATS BUILDER - do not touch below
------------------------------------------------------- */

const TOP_POINTS = 11590.434640730844;
const DECAY = 1.125;

// points for rank r (1-indexed), decays by 1.125x each step
function pointsForRank(r) {
  return TOP_POINTS / Math.pow(DECAY, r - 1);
}

function buildStats(container, videos, players) {

  // build a case-sensitive lookup: name -> rank (1-indexed)
  // first occurrence wins for duplicate names
  const rankLookup = {};
  for (let l = 0; l < videos.length; l++) {
    if (rankLookup[videos[l].name] === undefined) rankLookup[videos[l].name] = l + 1;
  }

  // internal alias — "Abyss of Darkness (Old)" maps to the RWBEfS4mLbw entry
  const oldAbyssRank = videos.findIndex(v => v.url.includes("RWBEfS4mLbw")) + 1;
  if (oldAbyssRank > 0) rankLookup["Abyss of Darkness (Old)"] = oldAbyssRank;

  // internal alias — "Thinking Space II Legacy" maps to the RJedeB2wHCA entry
  const tsLegacyRank = videos.findIndex(v => v.url.includes("RJedeB2wHCA")) + 1;
  if (tsLegacyRank > 0) rankLookup["Thinking Space II Legacy"] = tsLegacyRank;

  // compute each player's total and breakdown
  const entries = Object.entries(players).map(([player, completions]) => {
    let rawTotal = 0;
    const breakdown = completions.map(levelName => {
      const verified = levelName.includes(" (V)");
      const firstVictor = levelName.includes(" (1)");
      const lookupName = levelName.replace(" (V)", "").replace(" (1)", "");
      const multiplier = (verified ? 1.5 : 1) * (firstVictor ? 1.25 : 1);
      const rank = rankLookup[lookupName];
      const pts = rank !== undefined ? pointsForRank(rank) * multiplier : 0;
      rawTotal += pts;
      return { name: levelName, rank, pts, verified, firstVictor };
    });

    // penalty: players with fewer completions score lower
    // factor approaches 1 as completions grow, ~0.39 at 1, ~0.63 at 2, ~0.78 at 3 …
    const matchedCount = breakdown.filter(b => b.rank !== undefined).length;
    const penaltyFactor = 1 - Math.exp(-matchedCount / 2);
    const total = rawTotal * penaltyFactor;

    return { player, total, rawTotal, penaltyFactor, breakdown };
  });

  // sort descending by total points
  entries.sort((a, b) => b.total - a.total);

  const rankLabels = ["gold", "silver", "bronze"];

  for (let l = 0; l < entries.length; l++) {
    const { player, total, rawTotal, penaltyFactor, breakdown } = entries[l];
    const placeClass = rankLabels[l] ?? "";
    const matchedCount = breakdown.filter(b => b.rank !== undefined).length;

    const card = document.createElement("div");
    card.className = "stats-card";

    card.innerHTML = `
      <div class="stats-rank ${placeClass}">${String(l + 1).padStart(2, "0")}</div>
      <div class="stats-info">
        <div class="stats-name">${player}</div>
        <div class="stats-count">${matchedCount} completion${matchedCount !== 1 ? "s" : ""}</div>
      </div>
      <div class="stats-points">
        <div class="stats-points-value">${total.toFixed(1)}</div>
        <div class="stats-points-label">points</div>
      </div>`;

    card.addEventListener("click", () => openProfile(player, total, rawTotal, penaltyFactor, breakdown));
    container.appendChild(card);
  }
}

// profile overlay logic
const overlay = document.getElementById("profile-overlay");
const modalName = document.getElementById("profile-modal-name");
const modalPts = document.getElementById("profile-modal-pts");
const completionList = document.getElementById("profile-completion-list");

function openProfile(player, total, rawTotal, penaltyFactor, breakdown) {
  modalName.textContent = player;
  modalPts.textContent = total.toFixed(1) + " points";

  // show penalty breakdown if it meaningfully differs from raw
  let penaltyEl = document.getElementById("profile-modal-penalty");
  if (!penaltyEl) {
    penaltyEl = document.createElement("div");
    penaltyEl.id = "profile-modal-penalty";
    penaltyEl.style.cssText = "font-size:0.75rem;opacity:0.65;margin-top:2px;";
    modalPts.insertAdjacentElement("afterend", penaltyEl);
  }
  const pct = (penaltyFactor * 100).toFixed(1);
  penaltyEl.textContent = `${rawTotal.toFixed(1)} raw × ${pct}% completion factor`;

  completionList.innerHTML = "";

  // matched completions sorted by rank
  const matched = breakdown
    .filter(b => b.rank !== undefined)
    .sort((a, b) => a.rank - b.rank);

  const unmatched = breakdown.filter(b => b.rank === undefined);

  for (let l = 0; l < matched.length; l++) {
    const { name, rank, pts, verified, firstVictor } = matched[l];
    const displayName = name.replace(" (V)", "").replace(" (1)", "");
    const verifyBadge = verified ? ` <span style="font-size:0.65rem;font-weight:700;color:#f6c84a;letter-spacing:0.05em;">VERIFIED</span>` : "";
    const fvBadge = firstVictor ? ` <span style="font-size:0.65rem;font-weight:700;color:#3af6c8;letter-spacing:0.05em;">1ST VICTOR</span>` : "";
    const row = document.createElement("div");
    row.className = "profile-completion-row";
    row.innerHTML = `
      <span class="profile-completion-name">${displayName}${verifyBadge}${fvBadge}</span>
      <span class="profile-completion-rank">#${rank}</span>
      <span class="profile-completion-pts">+${pts.toFixed(1)}</span>`;
    completionList.appendChild(row);
  }

  for (let l = 0; l < unmatched.length; l++) {
    const row = document.createElement("div");
    row.className = "profile-unmatched";
    row.textContent = `${unmatched[l].name} (not on main list)`;
    completionList.appendChild(row);
  }

  overlay.classList.add("open");
}

document.getElementById("profile-close").addEventListener("click", () => {
  overlay.classList.remove("open");
});

overlay.addEventListener("click", e => {
  if (e.target === overlay) overlay.classList.remove("open");
});

// tab switching
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + target).classList.add("active");
  });
});

// load data and build everything
loadData().then(data => {
  const { videos, futureVideos } = data;
  buildList(document.getElementById("list"), videos, 1);
  buildList(document.getElementById("future-list"), futureVideos, 1);
  buildStats(document.getElementById("stats-list"), videos, playerCompletions);
});
