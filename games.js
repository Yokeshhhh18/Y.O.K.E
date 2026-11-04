// Y.O.K.E. v10 Interactive Games Module (games.js)
// 1) Chibi Doll Battle (Tic-Tac-Toe using Dhanya & Yokesh 3D Funko Pop avatars instead of X & O!)
// 2) The 6-Stage Funny & Enjoyable Tanglish Love Quest -> Ends with Yokesh's Cartoon Chibi Awarding Her the Gold Medal!
(function () {
  const $ = (id) => document.getElementById(id);
  const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
  const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";

  const HER_ICON = (typeof CONFIG !== "undefined" && CONFIG.XO_HER_ICON) || "images/xo_her.png";
  const ME_ICON = (typeof CONFIG !== "undefined" && CONFIG.XO_ME_ICON) || "images/xo_me.png";
  const MEDAL_PIC = (typeof CONFIG !== "undefined" && CONFIG.MEDAL_AWARD_PIC) || "images/medal_award.jpg";

  function playGameTone(freq = 520, dur = 0.14, type = "sine") {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!window._yokeGameAC) window._yokeGameAC = new AC();
      const ctx = window._yokeGameAC;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {}
  }

  function playWinFanfare() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      setTimeout(() => playGameTone(f, 0.22, "triangle"), i * 105);
    });
  }

  function openGamesModal(mode = "hub") {
    const modal = $("gamesModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    switchGameTab(mode);
  }

  function closeGamesModal() {
    $("gamesModal")?.classList.add("hidden");
  }

  function switchGameTab(tab) {
    ["gameHubView", "xoView", "ynView"].forEach((id) => {
      $(id)?.classList.toggle("hidden", id !== tab + "View" && !(tab === "hub" && id === "gameHubView"));
    });
    document.querySelectorAll(".gtab").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    if (tab === "xo") initXO();
    if (tab === "yn") initYN();
  }

  // =========================================================
  // GAME 1: 3D CHIBI DOLL BATTLE (DHANYA DOLL vs YOKESH AI DOLL)
  // =========================================================
  let board = Array(9).fill("");
  let xoOver = false;
  let xoLocked = false;
  const scores = { her: 0, yoke: 0, draw: 0 };

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const LINE_COORDS = {
    "0,1,2": [10, 16.6, 90, 16.6],
    "3,4,5": [10, 50.0, 90, 50.0],
    "6,7,8": [10, 83.3, 90, 83.3],
    "0,3,6": [16.6, 10, 16.6, 90],
    "1,4,7": [50.0, 10, 50.0, 90],
    "2,5,8": [83.3, 10, 83.3, 90],
    "0,4,8": [12, 12, 88, 88],
    "2,4,6": [88, 12, 12, 88]
  };

  function checkWinner(b) {
    for (const [a, c, d] of WIN_LINES) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) {
        return { winner: b[a], line: [a, c, d] };
      }
    }
    if (b.every((cell) => cell !== "")) return { winner: "draw", line: null };
    return null;
  }

  function renderXOBoard() {
    const grid = $("xoBoard");
    if (!grid) return;
    grid.innerHTML = board
      .map((val, idx) => {
        let inner = `<span class="xo-empty-dot">✨</span>`;
        if (val === "X") {
          inner = `<div class="xo-avatar-wrap her-token"><img src="${HER_ICON}" alt="${her}" class="xo-avatar-img"><span class="xo-badge">👑</span></div>`;
        } else if (val === "O") {
          inner = `<div class="xo-avatar-wrap me-token"><img src="${ME_ICON}" alt="${you}" class="xo-avatar-img"><span class="xo-badge">🤖</span></div>`;
        }
        return `
      <button type="button" class="xo-cell ${val ? "taken " + val.toLowerCase() : ""}" data-idx="${idx}" ${val || xoOver ? "disabled" : ""}>
        ${inner}
      </button>`;
      })
      .join("");
  }

  function drawWinStrike(line) {
    const svg = $("xoWinSvg");
    if (!svg) return;
    if (!line) {
      svg.innerHTML = "";
      svg.classList.add("hidden");
      return;
    }
    const key = line.join(",");
    const [x1, y1, x2, y2] = LINE_COORDS[key] || [10, 50, 90, 50];
    svg.classList.remove("hidden");
    svg.innerHTML = `<line x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%" class="win-stroke" />`;
  }

  function updateScoreUI() {
    if ($("scoreHer")) $("scoreHer").textContent = scores.her;
    if ($("scoreYoke")) $("scoreYoke").textContent = scores.yoke;
    if ($("scoreDraw")) $("scoreDraw").textContent = scores.draw;
  }

  function initXO() {
    board = Array(9).fill("");
    xoOver = false;
    xoLocked = false;
    drawWinStrike(null);
    renderXOBoard();
    updateScoreUI();
    if ($("xoStatus")) {
      $("xoStatus").textContent = `Un turn dhan chellam! Tap a box to place your Queen doll 👑👇`;
    }
  }

  function pickSmartAIMove(b) {
    const empty = b.map((v, i) => (v === "" ? i : -1)).filter((i) => i !== -1);
    if (empty.length === 0) return -1;

    if (Math.random() < 0.72) {
      for (const idx of empty) {
        const copy = b.slice();
        copy[idx] = "O";
        if (checkWinner(copy)?.winner === "O") return idx;
      }
      for (const idx of empty) {
        const copy = b.slice();
        copy[idx] = "X";
        if (checkWinner(copy)?.winner === "X") return idx;
      }
      if (b[4] === "") return 4;
    }
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function handleXOMove(idx) {
    if (xoOver || xoLocked || board[idx] !== "") return;
    board[idx] = "X";
    playGameTone(620, 0.12, "sine");
    renderXOBoard();

    let res = checkWinner(board);
    if (res) return finishXO(res);

    xoLocked = true;
    if ($("xoStatus")) $("xoStatus").textContent = "🤖 Y.O.K.E. AI doll move podudhu… 🤔";

    setTimeout(() => {
      const aiIdx = pickSmartAIMove(board);
      if (aiIdx !== -1) {
        board[aiIdx] = "O";
        playGameTone(440, 0.14, "triangle");
      }
      xoLocked = false;
      renderXOBoard();
      res = checkWinner(board);
      if (res) return finishXO(res);
      if ($("xoStatus")) $("xoStatus").textContent = "Un turn chellam! Place your doll 👑💗";
    }, 480);
  }

  function finishXO(res) {
    xoOver = true;
    if (res.line) {
      drawWinStrike(res.line);
      res.line.forEach((i) => {
        document.querySelector(`.xo-cell[data-idx="${i}"]`)?.classList.add("win-cell");
      });
    }

    let chatMsg = "";
    if (res.winner === "X") {
      scores.her++;
      playWinFanfare();
      window.YOKE_FX?.confetti();
      if ($("xoStatus")) $("xoStatus").textContent = `🥳 Woooow ${her} Doll jeichuta! Queen always rules 👑💗`;
      chatMsg = `🎮 Doll Battle: Yayy chellam! Unnoda Queen doll ennoda AI doll-ah jeichiduchu 🥳👑 Birthday girl-ku neraya chocolates! 🍫💗`;
    } else if (res.winner === "O") {
      scores.yoke++;
      playGameTone(340, 0.28, "sawtooth");
      if ($("xoStatus")) $("xoStatus").textContent = "🤖 Ennoda Y.O.K.E. AI doll jeichuten! 😜 Punishment: Oru cute smile pannu 😁💗";
      chatMsg = `🎮 Doll Battle-la naan jeichuten 😜 Aana ennoda creator ${you}-kum enakkum eppovume nee dhan real winner chellam! 💗`;
    } else {
      scores.draw++;
      if ($("xoStatus")) $("xoStatus").textContent = "🤝 Match Draw! Namma rendu dolls-ume semma cute & tough 😍";
      chatMsg = `🎮 Doll Battle Draw aagiduchu chellam 🤝 Innoru round vilayaduvoma? 😏`;
    }
    updateScoreUI();
    if (typeof window.addBotGameSummary === "function") {
      window.addBotGameSummary(chatMsg);
    }
  }

  // =========================================================
  // GAME 2: FUNNY & ENJOYABLE TANGLISH LOVE QUEST -> CHIBI MEDAL AWARD!
  // =========================================================
  const QUEST_STAGES = [
    {
      stageTitle: "Level 1: The Drama Queen Test 🎭",
      relicIcon: "👑",
      relicName: "Drama Queen Tiara",
      storyIntro: "First truth test before you can claim Yokesh's Chibi Gold Medal…",
      q: `Unmai sollu chellam — chinna vishayathuku kooda cute-ah kovapadra 'World's #1 Cutest Drama Queen' nee dhana? 😤👑`,
      yesReply: "😂 Haha othukitta! Aana nee kovapatta kooda Yokesh kannuku semma cute-ah dhan iruppa 😍 [👑 Drama Queen Tiara Unlocked!]"
    },
    {
      stageTitle: "Level 2: The Food & Briyani Law 🍛",
      relicIcon: "🍗",
      relicName: "Golden Leg Piece",
      storyIntro: "Every relationship has one golden rule about food…",
      q: `"Enakku pasikkala" nu sollitu Yokesh plate-la irukura best chicken piece & fries-ah aattaiya podradhu un favourite hobby dhana? 🍟😏`,
      yesReply: "🤣 Caught red-handed! Aana unakku ootti vidradhu dhana avanukku ulagathulaye pidicha vishayam! [🍗 Golden Leg Piece Unlocked!]"
    },
    {
      stageTitle: "Level 3: The '5-Minutes' Makeup Myth 💄",
      relicIcon: "🪞",
      relicName: "Magic Mirror",
      storyIntro: "Time-travel physics according to Dhanya…",
      q: `"Innum 5 mins-la ready aagiduven!" nu sollitu 1 hour kannadi munnadiye nikkiradhu unakku birthright dhana chellam? 💅⏰`,
      yesReply: "😜 Haha 1 hour wait pannalum, nee veliya varumbodhu Yokesh flat aagiduvan! [🪞 Magic Mirror Unlocked!]"
    },
    {
      stageTitle: "Level 4: The Midnight Reels Spammer 📱",
      relicIcon: "😂",
      relicName: "Meme Trophy",
      storyIntro: "Checking your 2:00 AM phone activity logs…",
      q: `Night 12 manikku thoongama Yokesh-ku 50 funny reels & food videos anuppi avana disturb panradhu semma jolly-ah irukka? 📲🤭`,
      yesReply: "🥳 Correct-u! Nee anuppura ovvoru reel-ayum avan sirichite paapan theriyuma! [😂 Meme Trophy Unlocked!]"
    },
    {
      stageTitle: "Level 5: The Birthday Briyani Ransom 🍦",
      relicIcon: "💳",
      relicName: "VIP Treat Pass",
      storyIntro: "Almost at the Medal Ceremony! Just one financial agreement left…",
      q: `Innaiku un Birthday-va vechi Yokesh pocket-ah gaali panni periya treat & ice cream vaanga plan potrukiya? 🍨💸`,
      yesReply: "😂 Deal locked! Unakkaga avanoda motha wallet-ayum thara ready-ah irukkan! [💳 VIP Treat Pass Unlocked!]"
    },
    {
      stageTitle: "Final Boss Level: The Lifetime Contract 💍",
      relicIcon: "🥇",
      relicName: "Yokesh's Gold Medal",
      storyIntro: "Final step to receive your Chibi Gold Medal from Yokesh!",
      q: `Enna dhan sanda potalum, lifetime full-ah Yokesh-ah torture pannite avan koodave happy-ah iruppiya chellam? 🥰💞`,
      yesReply: "🎉 6/6 QUEST COMPLETE! Prepare for your Official Chibi Gold Medal Ceremony from Yokesh! 🥇👑💖"
    }
  ];

  const DODGE_TAUNTS = [
    "Heyy poi solladha! Olunga YES tap pannu 😜",
    "No button-eh kedaiyadhu chellam, escape aagudhu paaru 🏃‍♂️💨",
    "Yokesh AI code-la 'NO' ku idame illa 😂",
    "Gold Medal venumna unmaiya othukitu YES tap pannu 🥇💗",
    "Pidikka mudiyuma? Inga vandhuteneyyy! 🙈✨"
  ];

  let ynIndex = 0;
  let ynYesCount = 0;
  let dodgeCount = 0;

  function initYN() {
    ynIndex = 0;
    ynYesCount = 0;
    dodgeCount = 0;
    renderYNQuestion();
  }

  function buildQuestMapHTML() {
    return `<div class="quest-map">
      ${QUEST_STAGES.map((st, idx) => {
        const done = idx < ynIndex;
        const current = idx === ynIndex;
        return `<div class="quest-node ${done ? "done" : ""} ${current ? "current" : ""}" title="${st.relicName}">
          <span class="q-icon">${done ? st.relicIcon : idx + 1}</span>
        </div>`;
      }).join('<div class="quest-connector"></div>')}
    </div>`;
  }

  function renderYNQuestion() {
    const box = $("ynCardBody");
    if (!box) return;

    if (ynIndex >= QUEST_STAGES.length) {
      window.YOKE_FX?.confetti();
      playWinFanfare();
      const relics = QUEST_STAGES.map((s) => `<span class="relic-badge" title="${s.relicName}">${s.relicIcon} ${s.relicName}</span>`).join("");
      box.innerHTML = `
        <div class="yn-complete medal-ceremony">
          ${buildQuestMapHTML()}
          <div class="medal-award-banner">
            <img src="${MEDAL_PIC}" alt="${you} awarding Gold Medal to ${her}" class="medal-award-img">
            <div class="medal-ribbon-tag">🥇 OFFICIAL CHIBI MEDAL CEREMONY 🥇</div>
          </div>
          <h3 id="ynSummaryScore">🏆 ${you} Awards ${her} the Gold Medal!</h3>
          <p class="quest-win-sub">For passing all 6 Funny Quests, Chibi <b>${you}</b> officially presents Chibi Queen <b>${her}</b> with the <b>“World's Cutest Drama Queen &amp; Forever Best Partner” Gold Medal!</b> 🎖️👑</p>
          <div class="relic-collection">${relics}</div>
          <div class="quest-final-actions">
            <button type="button" id="ynUnlockGiftBtn" class="game-action-btn gold-cta">🎁 Open Your Birthday Surprise</button>
            <button type="button" id="ynReplayBtn" class="game-action-btn secondary">🔄 Replay Funny Quest</button>
          </div>
        </div>
      `;
      $("ynReplayBtn")?.addEventListener("click", initYN);
      $("ynUnlockGiftBtn")?.addEventListener("click", () => {
        closeGamesModal();
        if (typeof window.triggerOpenGiftFromQuest === "function") {
          window.triggerOpenGiftFromQuest();
        } else {
          $("giftNavBtn")?.click();
        }
      });
      if (typeof window.addBotGameSummary === "function") {
        window.addBotGameSummary(`🥇 Medal Ceremony Complete! Ennoda Chibi Doll unakku "World's Cutest Drama Queen & Forever Partner" Gold Medal kuduthachu chellam! 🥳👑💗`);
      }
      return;
    }

    const item = QUEST_STAGES[ynIndex];
    dodgeCount = 0;
    box.innerHTML = `
      ${buildQuestMapHTML()}
      <div class="yn-progress">${item.stageTitle} • Badge: ${item.relicIcon} ${item.relicName}</div>
      <div class="quest-story-intro">${item.storyIntro}</div>
      <div class="yn-question">${item.q}</div>
      <div id="ynReaction" class="yn-reaction">Tap YES to claim ${item.relicIcon} (or try catching NO 😏)</div>
      <div class="yn-arena" id="ynArena">
        <button type="button" id="ynYes" class="yn-btn yes">AMA / YES ${item.relicIcon} 💗</button>
        <button type="button" id="ynNo" class="yn-btn no">ILLA / NO 🙈</button>
      </div>
    `;

    const yesBtn = $("ynYes");
    const noBtn = $("ynNo");
    const arena = $("ynArena");
    const react = $("ynReaction");

    yesBtn?.addEventListener("click", () => {
      ynYesCount++;
      playWinFanfare();
      window.YOKE_FX?.confetti();
      if (react) {
        react.textContent = item.yesReply;
        react.classList.add("pop-love");
      }
      yesBtn.disabled = true;
      if (noBtn) noBtn.style.display = "none";
      setTimeout(() => {
        ynIndex++;
        renderYNQuestion();
      }, 1950);
    });

    function dodgeNoButton(e) {
      if (e) e.preventDefault();
      dodgeCount++;
      playGameTone(740, 0.08, "square");
      const rect = arena.getBoundingClientRect();
      const bW = noBtn.offsetWidth || 105;
      const bH = noBtn.offsetHeight || 44;
      const maxX = Math.max(20, rect.width - bW - 14);
      const maxY = Math.max(20, rect.height - bH - 14);

      const newX = 10 + Math.floor(Math.random() * maxX);
      const newY = 10 + Math.floor(Math.random() * maxY);

      noBtn.style.position = "absolute";
      noBtn.style.left = newX + "px";
      noBtn.style.top = newY + "px";

      if (react) {
        react.textContent = DODGE_TAUNTS[dodgeCount % DODGE_TAUNTS.length];
      }
      const scale = Math.min(1.26, 1 + dodgeCount * 0.05);
      if (yesBtn) yesBtn.style.transform = `scale(${scale})`;
    }

    noBtn?.addEventListener("pointerenter", dodgeNoButton);
    noBtn?.addEventListener("pointerdown", dodgeNoButton);
    noBtn?.addEventListener("click", dodgeNoButton);
  }

  window.addEventListener("DOMContentLoaded", () => {
    $("gamesNavBtn")?.addEventListener("click", () => openGamesModal("hub"));
    $("closeGamesBtn")?.addEventListener("click", closeGamesModal);
    $("xoResetBtn")?.addEventListener("click", initXO);

    document.querySelectorAll(".gtab").forEach((b) => {
      b.addEventListener("click", () => switchGameTab(b.dataset.tab));
    });
    document.querySelectorAll(".hub-play-btn").forEach((b) => {
      b.addEventListener("click", () => switchGameTab(b.dataset.target));
    });

    $("xoBoard")?.addEventListener("click", (e) => {
      const cell = e.target.closest(".xo-cell");
      if (cell) handleXOMove(Number(cell.dataset.idx));
    });
  });

  window.YOKE_GAMES = {
    open: openGamesModal,
    close: closeGamesModal
  };
})();
