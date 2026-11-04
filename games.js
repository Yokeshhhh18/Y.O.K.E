// Y.O.K.E. v8 Interactive Games Module (games.js)
// Includes: 1) X-O (Tic-Tac-Toe) vs Y.O.K.E. AI   2) Yes-or-No Tanglish Love Game with Dodging "No" Button
(function () {
  const $ = (id) => document.getElementById(id);
  const her = (typeof CONFIG !== "undefined" && CONFIG.HER_NAME) || "Dhanya";
  const you = (typeof CONFIG !== "undefined" && CONFIG.YOUR_NAME) || "Yokesh";

  // Web Audio sound effects for games
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
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => playGameTone(f, 0.22, "triangle"), i * 110);
    });
  }

  // ---------- Modal Navigation ----------
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
  // GAME 1: X-O (TIC-TAC-TOE) — DHANYA (💗 X) vs Y.O.K.E. AI (🤖 O)
  // =========================================================
  let board = Array(9).fill("");
  let xoOver = false;
  let xoLocked = false;
  const scores = { her: 0, yoke: 0, draw: 0 };

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diags
  ];

  // Coordinates (% of board) for drawing animated SVG winning strike line
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
      .map(
        (val, idx) => `
      <button type="button" class="xo-cell ${val ? "taken " + val.toLowerCase() : ""}" data-idx="${idx}" ${val || xoOver ? "disabled" : ""}>
        <span class="xo-mark">${val === "X" ? "💗" : val === "O" ? "🤖" : ""}</span>
        <small class="xo-sub">${val === "X" ? "X" : val === "O" ? "O" : ""}</small>
      </button>`
      )
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
      $("xoStatus").textContent = `Un turn dhan chellam (${her} = 💗 X)! Tap any box 👇`;
    }
  }

  function pickSmartAIMove(b) {
    const empty = b.map((v, i) => (v === "" ? i : -1)).filter((i) => i !== -1);
    if (empty.length === 0) return -1;

    // 70% smart play, 30% playful so Dhanya has fun winning too!
    if (Math.random() < 0.72) {
      // 1. Can AI win this turn?
      for (const idx of empty) {
        const copy = b.slice();
        copy[idx] = "O";
        if (checkWinner(copy)?.winner === "O") return idx;
      }
      // 2. Block Dhanya if she is about to win
      for (const idx of empty) {
        const copy = b.slice();
        copy[idx] = "X";
        if (checkWinner(copy)?.winner === "X") return idx;
      }
      // 3. Take center if open
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
    if ($("xoStatus")) $("xoStatus").textContent = "🤖 Y.O.K.E. AI yosikkudhu… 🤔";

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
      if ($("xoStatus")) $("xoStatus").textContent = "Un turn chellam! 💗";
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
      if ($("xoStatus")) $("xoStatus").textContent = `🥳 Woooow ${her} jeichuta! Queen always wins 👑💗`;
      chatMsg = `🎮 X-O Game: Yayy chellam! Nee enna (Y.O.K.E. AI-ah) jeichuta 🥳👑 Birthday girl ku neraya kisses & chocolates! 🍫💗`;
    } else if (res.winner === "O") {
      scores.yoke++;
      playGameTone(340, 0.28, "sawtooth");
      if ($("xoStatus")) $("xoStatus").textContent = "🤖 Y.O.K.E. AI jeichuten! 😜 Punishment: Oru cute smile pannu 😁💗";
      chatMsg = `🎮 X-O la naan jeichuten 😜 Aana ennoda boss ${you}-kum enakkum eppovume nee dhan real winner chellam! 💗`;
    } else {
      scores.draw++;
      if ($("xoStatus")) $("xoStatus").textContent = "🤝 Match Draw! Namma rendu perume semmatough-u 😍";
      chatMsg = `🎮 X-O Game Draw aagiduchu chellam 🤝 Innoru round vilayaduvoma? 😏`;
    }
    updateScoreUI();
    if (typeof window.addBotGameSummary === "function") {
      window.addBotGameSummary(chatMsg);
    }
  }

  // =========================================================
  // GAME 2: YES OR NO (TANGLISH LOVE EDITION WITH DODGING NO BUTTON!)
  // =========================================================
  const YN_QUESTIONS = [
    {
      q: `Innaiku Birthday Queen ${her} ulagathulaye semma azhaga irukkala? 👑✨`,
      yesReply: "Adhu dhan unmai! En boss Yokesh-oda kannuku nee eppovume angel dhan 😍💗"
    },
    {
      q: `Yokesh unakkaga உருவாக்குன indha Y.O.K.E. AI surprise unakku pidichirukka chellam? 🤖💝`,
      yesReply: "Aww romba happy da! Avan ethana naal ukkandhu idha aasaiya senjan theriyuma 🥰"
    },
    {
      q: `Yokesh unna evloooo love panran nu unakku theriyuma thangam? 🙈💞`,
      yesReply: "Infinity-kum mela! Adha solla dhan enna மாதிரி oru AI-ye avan train panni vechirukkan 💗"
    },
    {
      q: `Ippo udane Yokesh-ku oru tight hug & cute selfie anuppuriya? 🤗📸`,
      yesReply: "Superrrr! Marakkama avanukku anuppi vidu, avan semmaiya குதிப்பான் 🥳💗"
    },
    {
      q: `Next treat-la Yokesh-kubriyani + ice cream vaangi thariya chellam? 🍛🍦`,
      yesReply: "Haha deal locked 🔒! Screenshot eduthu Yokesh-kitta solliduven 😂💛"
    },
    {
      q: `Eppovume ipdiye sirichite, happy-ah Yokesh koodave iruppiya chellam? 💍💗`,
      yesReply: "Promise locked forever! Happy Birthday en chella kuttyma 👑💖✨"
    }
  ];

  const DODGE_TAUNTS = [
    "Pidikka mudiyuma? 😜",
    "No button work aagadhu chellam! 🙈",
    "Yokesh AI code-la 'No' option-eh kidaiyadhu 😂",
    "Olunga YES tap pannu thangam 💗",
    "Inga vandhuteneyyy! 🏃‍♂️💨"
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

  function renderYNQuestion() {
    const box = $("ynCardBody");
    if (!box) return;

    if (ynIndex >= YN_QUESTIONS.length) {
      window.YOKE_FX?.confetti();
      playWinFanfare();
      box.innerHTML = `
        <div class="yn-complete">
          <div class="yn-trophy">👑💖🎉</div>
          <h3 id="ynSummaryScore">${ynYesCount} / ${YN_QUESTIONS.length} YES!</h3>
          <p>100% Certified Cutest Birthday Girl &amp; ${you}'s Forever Queen!</p>
          <button type="button" id="ynReplayBtn" class="game-action-btn">🔄 Play Again</button>
        </div>
      `;
      $("ynReplayBtn")?.addEventListener("click", initYN);
      if (typeof window.addBotGameSummary === "function") {
        window.addBotGameSummary(`💕 Yes or No Game-la ${ynYesCount}/${YN_QUESTIONS.length} YES sonna en chellam! Perfect score 👑💗`);
      }
      return;
    }

    const item = YN_QUESTIONS[ynIndex];
    dodgeCount = 0;
    box.innerHTML = `
      <div class="yn-progress">Question ${ynIndex + 1} of ${YN_QUESTIONS.length}</div>
      <div class="yn-question">${item.q}</div>
      <div id="ynReaction" class="yn-reaction">Tap YES or try tapping NO 😏</div>
      <div class="yn-arena" id="ynArena">
        <button type="button" id="ynYes" class="yn-btn yes">YES 💗</button>
        <button type="button" id="ynNo" class="yn-btn no">NO 🙈</button>
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
      }, 1700);
    });

    function dodgeNoButton(e) {
      if (e) e.preventDefault();
      dodgeCount++;
      playGameTone(740, 0.08, "square");
      const rect = arena.getBoundingClientRect();
      const bW = noBtn.offsetWidth || 95;
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
      // Make YES button grow slightly each time she tries to click NO!
      const scale = Math.min(1.28, 1 + dodgeCount * 0.05);
      if (yesBtn) yesBtn.style.transform = `scale(${scale})`;
    }

    noBtn?.addEventListener("pointerenter", dodgeNoButton);
    noBtn?.addEventListener("pointerdown", dodgeNoButton);
    noBtn?.addEventListener("click", dodgeNoButton);
  }

  // ---------- Wire DOM Events ----------
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
