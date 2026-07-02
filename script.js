//Load data
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

//Import json
async function loadCompletions() {
  try {
    const response = await fetch("completions.json");
    playerCompletions = await response.json();
    return playerCompletions;
  } catch (err) {
    console.error("Failed to load completions.json:", err);
    return {};
  }
}

function buildTagsHTML(tags) {
  return !tags?.length
    ? ""
    : `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>`;
}

function getVideoId(url) {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

function buildList(container, items, startRank) {
  items.forEach((v, i) => {
    const rank = startRank + i;
    const id = getVideoId(v.url);
    const thumbSrc = v.thumb || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null);
    const thumbHTML = thumbSrc ? `<img src="${thumbSrc}" alt="thumbnail" />` : `<span class="play-tri"></span>`;

    const a = document.createElement("a");
    a.href = v.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";

    if (v.unverified) {
      const pct = Math.min(100, Math.max(0, v.progress ?? 0));
      a.classList.add("unverified-item");
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
  });
}

let playerCompletions = {};

const TOP_POINTS = 11590.434640730844;
const DECAY = 1.125;

function pointsForRank(r) {
  return TOP_POINTS / Math.pow(DECAY, r - 1);
}

function buildStats(container, videos, players) {
  const rankLookup = {};

  videos.forEach((v, i) => {
    if (rankLookup[v.name] === undefined) rankLookup[v.name] = i + 1;
  });

  const oldAbyssRank = videos.findIndex(v => v.url.includes("RWBEfS4mLbw")) + 1;
  if (oldAbyssRank > 0) rankLookup["Abyss of Darkness (Old)"] = oldAbyssRank;

  const tsLegacyRank = videos.findIndex(v => v.url.includes("RJedeB2wHCA")) + 1;
  if (tsLegacyRank > 0) rankLookup["Thinking Space II Legacy"] = tsLegacyRank;

  const entries = Object.entries(players).map(([player, completions]) => {
    let rawTotal = 0;

    const breakdown = completions.map(levelName => {
      const verified = levelName.includes(" (V)");
      const firstVictor = levelName.includes(" (1)");
      const lookupName = levelName.replace(" (V)", "").replace(" (1)", "");
      const multiplier = (verified ? 1.5 : 1) * (firstVictor ? 1.25 : 1);
      const rank = rankLookup[lookupName];
      const pts = rank ? pointsForRank(rank) * multiplier : 0;
      rawTotal += pts;
      return { name: levelName, rank, pts, verified, firstVictor };
    });

    const matchedCount = breakdown.filter(b => b.rank).length;
    const penaltyFactor = 1 - Math.exp(-matchedCount / 2);
    const total = rawTotal * penaltyFactor;

    return { player, total, rawTotal, penaltyFactor, breakdown };
  });

  entries.sort((a, b) => b.total - a.total);

  const rankLabels = ["gold", "silver", "bronze"];

  entries.forEach((entry, i) => {
    const { player, total, rawTotal, penaltyFactor, breakdown } = entry;
    const matchedCount = breakdown.filter(b => b.rank).length;

    const card = document.createElement("div");
    card.className = "stats-card";

    card.innerHTML = `
      <div class="stats-rank ${rankLabels[i] ?? ""}">${String(i + 1).padStart(2, "0")}</div>
      <div class="stats-info">
        <div class="stats-name">${player}</div>
        <div class="stats-count">${matchedCount} completion${matchedCount !== 1 ? "s" : ""}</div>
      </div>
      <div class="stats-points">
        <div class="stats-points-value">${total.toFixed(1)}</div>
        <div class="stats-points-label">points</div>
      </div>`;

    card.addEventListener("click", () =>
      openProfile(player, total, rawTotal, penaltyFactor, breakdown)
    );

    container.appendChild(card);
  });
}

const overlay = document.getElementById("profile-overlay");
const modalName = document.getElementById("profile-modal-name");
const modalPts = document.getElementById("profile-modal-pts");
const completionList = document.getElementById("profile-completion-list");

function openProfile(player, total, rawTotal, penaltyFactor, breakdown) {
  modalName.textContent = player;
  modalPts.textContent = `${total.toFixed(1)} points`;

  let penaltyEl = document.getElementById("profile-modal-penalty");
  if (!penaltyEl) {
    penaltyEl = document.createElement("div");
    penaltyEl.id = "profile-modal-penalty";
    penaltyEl.style.cssText = "font-size:0.75rem;opacity:0.65;margin-top:2px;";
    modalPts.insertAdjacentElement("afterend", penaltyEl);
  }

  penaltyEl.textContent = `${rawTotal.toFixed(1)} raw × ${(penaltyFactor * 100).toFixed(1)}%`;

  completionList.innerHTML = "";

  const matched = breakdown.filter(b => b.rank).sort((a, b) => a.rank - b.rank);
  const unmatched = breakdown.filter(b => !b.rank);

  matched.forEach(({ name, rank, pts, verified, firstVictor }) => {
    const displayName = name.replace(" (V)", "").replace(" (1)", "");
    const verifyBadge = verified ? ` <span class="verify-badge">VERIFIED</span>` : "";
    const fvBadge = firstVictor ? ` <span class="fv-badge">1ST VICTOR</span>` : "";

    const row = document.createElement("div");
    row.className = "profile-completion-row";
    row.innerHTML = `
      <span class="profile-completion-name">${displayName}${verifyBadge}${fvBadge}</span>
      <span class="profile-completion-rank">#${rank}</span>
      <span class="profile-completion-pts">+${pts.toFixed(1)}</span>`;
    completionList.appendChild(row);
  });

  unmatched.forEach(u => {
    const row = document.createElement("div");
    row.className = "profile-unmatched";
    row.textContent = `${u.name} (not on main list)`;
    completionList.appendChild(row);
  });

  overlay.classList.add("open");
}

document.getElementById("profile-close").addEventListener("click", () => {
  overlay.classList.remove("open");
});

overlay.addEventListener("click", e => {
  if (e.target === overlay) overlay.classList.remove("open");
});

//Roulette
let lastPercentage = 0;
let skipsRemaining = 0;
let gameActive = false;
let currentLevel = 1;
const lockedLevels = new Set();

document.getElementById("roullete-start-btn").addEventListener("click", () => {
  if (gameActive) return alert("Already started. Refresh to restart.");

  gameActive = true;
  lastPercentage = 0;
  currentLevel = 1;
  lockedLevels.clear();
  skipsRemaining = parseInt(document.getElementById("roullete-skip-count").value) || 0;

  document.getElementById("roullete-list").innerHTML = "";
  addRoullete(1, false);
});

function disableOldButtons() {
  const containers = document.querySelectorAll("#roullete-list .roullete-container");
  containers.forEach((c, i) => {
    if (i === containers.length - 1) return;
    c.querySelectorAll("button, input").forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
    });
  });
}

function addRoullete(best, contains_future) {
  if (!gameActive) return;

  const includeFuture = document.getElementById("roullete-include-future").checked;

  loadData().then(data => {
    const { videos, futureVideos } = data;
    const sourceList = includeFuture
      ? (Math.random() < 0.5 ? videos : futureVideos)
      : videos;

    const v = sourceList[Math.floor(Math.random() * sourceList.length)];
    const list = document.getElementById("roullete-list");

    const container = document.createElement("a");
    container.className = "roullete-container";
    container.target = "_blank";
    container.rel = "noopener noreferrer";

    const thumb = document.createElement("div");
    thumb.className = "thumb";

    const id = getVideoId(v.url);
    const thumbSrc = v.thumb || (id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null);
    const thumbnail = document.createElement("img");
    thumbnail.src = thumbSrc || "fallback.png";
    thumbnail.alt = v.name || "thumbnail";
    thumb.appendChild(thumbnail);

    const info = document.createElement("div");
    info.className = "info";

    const name_div = document.createElement("div");
    name_div.className = "name";
    name_div.textContent = v.name || "Unknown";

    const input = document.createElement("div");
    input.className = "input";

    const best_input = document.createElement("input");
    best_input.placeholder = `Enter at least ${lastPercentage + 1}%`;

    const submit_best = document.createElement("button");
    submit_best.textContent = "Submit";

    const skip_button = document.createElement("button");
    skip_button.textContent = `Skip (${skipsRemaining})`;

    const giveup_button = document.createElement("button");
    giveup_button.textContent = "Give Up";

    input.append(best_input, submit_best, skip_button, giveup_button);
    info.append(name_div, input);

    const rank = document.createElement("div");
    rank.className = "rank";
    rank.textContent = currentLevel;

    container.append(thumb, info, rank);
    list.appendChild(container);

    disableOldButtons();

    submit_best.addEventListener("click", () => {
      if (!gameActive) return;
      if (lockedLevels.has(currentLevel)) return alert("Already submitted.");

      const value = parseFloat(best_input.value);
      if (isNaN(value)) return alert("Enter a valid number.");
      if (value < lastPercentage + 1) return alert(`You must enter at least ${lastPercentage + 1}%`);

      lockedLevels.add(currentLevel);
      lastPercentage = value;
      currentLevel++;
      addRoullete(1, false);
    });

    skip_button.addEventListener("click", () => {
      if (!gameActive) return;
      if (skipsRemaining <= 0) return alert("No skips left.");

      skipsRemaining--;
      lockedLevels.add(currentLevel);
      currentLevel++;
      addRoullete(1, false);
    });

    giveup_button.addEventListener("click", () => {
      gameActive = false;
      alert("You gave up. Refresh to restart.");
    });
  });
}

//Build all lists
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + target).classList.add("active");
  });
});

Promise.all([loadData(), loadCompletions()]).then(([data]) => {
  const { videos, futureVideos } = data;
  buildList(document.getElementById("list"), videos, 1);
  buildList(document.getElementById("future-list"), futureVideos, 1);
  buildStats(document.getElementById("stats-list"), videos, playerCompletions);
});
