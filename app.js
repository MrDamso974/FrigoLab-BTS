(() => {
  const layer = document.getElementById("windowsLayer");
  const taskbarApps = document.getElementById("taskbarApps");
  const clock = document.getElementById("clock");
  const startBtn = document.getElementById("startBtn");
  const startMenu = document.getElementById("startMenu");
  const globalSearch = document.getElementById("globalSearch");

  const z = { top: 10 };
  const state = {
    windows: new Map(),
    themeAlt: false
  };

  const D = window.FRIGOLAB_DATA;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ---------- Clock ----------
  function tickClock(){
    const d = new Date();
    const pad = n => String(n).padStart(2,"0");
    clock.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())} • ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
  }
  tickClock(); setInterval(tickClock, 1000);

  // ---------- Z / Taskbar ----------
  function bringToFront(winEl){
    z.top += 1;
    winEl.style.zIndex = String(z.top);
    const id = winEl.dataset.id;
    for (const [wid] of state.windows){
      const btn = document.querySelector(`.taskApp[data-id="${wid}"]`);
      if (btn) btn.dataset.active = (wid === id) ? "true" : "false";
    }
  }

  function createTaskButton({id, title, icon}){
    const btn = document.createElement("button");
    btn.className = "taskApp";
    btn.dataset.id = id;
    btn.dataset.active = "true";
    btn.innerHTML = `<span class="dot" aria-hidden="true"></span><span>${icon} ${title}</span>`;
    btn.addEventListener("click", () => toggleMinimize(id));
    taskbarApps.appendChild(btn);
    return btn;
  }

  function toggleMinimize(id){
    const w = state.windows.get(id);
    if (!w) return;
    if (w.minimized){
      w.minimized = false;
      w.el.hidden = false;
      bringToFront(w.el);
    } else {
      w.minimized = true;
      w.el.hidden = true;
      const btn = document.querySelector(`.taskApp[data-id="${id}"]`);
      if (btn) btn.dataset.active = "false";
    }
  }

  function closeWindow(id){
    const w = state.windows.get(id);
    if (!w) return;

    // stop youtube/iframes
    w.el.querySelectorAll("iframe").forEach(f => f.src = f.src);

    w.el.remove();
    const btn = document.querySelector(`.taskApp[data-id="${id}"]`);
    if (btn) btn.remove();
    state.windows.delete(id);
  }

  function setMaximize(winEl, yes){
    winEl.dataset.max = yes ? "true" : "false";
  }

  // ---------- Dragging (plein écran) ----------
  function enableDrag(winEl, handle){
    let startX=0, startY=0, startL=0, startT=0, dragging=false;

    handle.addEventListener("pointerdown", (e) => {
      // ✅ ne pas drag quand on clique sur les boutons
      if (e.target.closest(".winControls")) return;
      if (winEl.dataset.max === "true") return;

      dragging = true;
      bringToFront(winEl);
      handle.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      startL = parseFloat(winEl.style.left || "40");
      startT = parseFloat(winEl.style.top || "120");
    });

    handle.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const maxL = window.innerWidth - winEl.offsetWidth;
      const maxT = window.innerHeight - winEl.offsetHeight - 70;

      winEl.style.left = clamp(startL + dx, 0, Math.max(0,maxL)) + "px";
      winEl.style.top  = clamp(startT + dy, 0, Math.max(0,maxT)) + "px";
    });

    handle.addEventListener("pointerup", () => dragging = false);
    handle.addEventListener("pointercancel", () => dragging = false);
  }

  // ---------- Resizing (plein écran) ----------
  function enableResize(winEl, handle){
    let startX=0, startY=0, startW=0, startH=0, resizing=false;

    handle.addEventListener("pointerdown", (e) => {
      if (winEl.dataset.max === "true") return;
      resizing = true;
      bringToFront(winEl);
      handle.setPointerCapture(e.pointerId);
      startX = e.clientX; startY = e.clientY;
      startW = winEl.offsetWidth;
      startH = winEl.offsetHeight;
    });

    handle.addEventListener("pointermove", (e) => {
      if (!resizing) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      const minW = 380, minH = 260;

      const maxW = window.innerWidth - parseFloat(winEl.style.left || "0") - 10;
      const maxH = window.innerHeight - parseFloat(winEl.style.top || "0") - 80;

      const w = clamp(startW + dx, minW, Math.max(minW, maxW));
      const h = clamp(startH + dy, minH, Math.max(minH, maxH));

      winEl.style.width = w + "px";
      winEl.style.height = h + "px";
    });

    handle.addEventListener("pointerup", () => resizing=false);
    handle.addEventListener("pointercancel", () => resizing=false);
  }

  // ---------- Content builders ----------
  function introHTML(){
    const systems = D.systems.map(s => `
      <div class="card">
        <div class="row" style="justify-content:space-between;">
          <div style="font-weight:900;">${s.icon} ${s.title}</div>
          <span class="badge"><strong>Cycle</strong> pédagogique</span>
        </div>
        <p class="p" style="margin-top:8px;">${s.text}</p>
      </div>
    `).join("");

    return `
      <div class="h1">Cours complet — Froid & Clim (version élève)</div>
      <p class="p">
        Objectif : comprendre le <strong>cycle frigorifique</strong>, connaître les <strong>composants</strong>,
        maîtriser les <strong>mesures terrain</strong> (P/T, surchauffe, sous-refroidissement) et diagnostiquer.
      </p>

      <div class="tip">
        <strong>Rappel terrain :</strong> on mesure l’échange (air/eau), puis on ajuste (charge/régulation) avec procédure.
      </div>

      <div class="h2">1) Architectures de systèmes</div>
      <div class="grid2">${systems}</div>

      <hr class="hr" />
      <div class="h2">2) Cycle frigorifique — étapes</div>
      <div class="grid2">
        <div class="card"><div style="font-weight:900;">🧠 1. Compression</div><p class="p">Augmente pression + température. Surveille refoulement et retour d’huile.</p></div>
        <div class="card"><div style="font-weight:900;">🌡️ 2. Condensation / gas cooler</div><p class="p">Rejette la chaleur. Condenseur sale → HP monte → surconsommation.</p></div>
        <div class="card"><div style="font-weight:900;">🧯 3. Détente</div><p class="p">Chute de pression : mélange liquide/gaz. TXV/EEV règlent la surchauffe.</p></div>
        <div class="card"><div style="font-weight:900;">❄️ 4. Évaporation</div><p class="p">Absorbe la chaleur. Débit air/eau crucial, dégivrage important.</p></div>
      </div>

      <hr class="hr" />
      <div class="h2">3) Indicateurs terrain (ordres de grandeur)</div>
      <div class="kpiRow">
        <div class="kpi"><div class="t">Surchauffe (SH)</div><div class="v">≈ 5 à 12 K</div><div class="small">selon système</div></div>
        <div class="kpi"><div class="t">Sous-refroidissement (SC)</div><div class="v">≈ 2 à 8 K</div><div class="small">selon condenseur/charge</div></div>
        <div class="kpi"><div class="t">ΔT air évaporateur</div><div class="v">≈ 6 à 12 K</div><div class="small">selon application</div></div>
        <div class="kpi"><div class="t">ΔT air condenseur</div><div class="v">≈ 10 à 20 K</div><div class="small">selon design</div></div>
      </div>
    `;
  }

  function refrigerantsHTML(){
    return `
      <div class="h1">Base des fluides frigorigènes</div>
      <p class="p">Filtre famille / sécurité. Valeurs GWP/ODP indicatives.</p>

      <div class="row">
        <input class="input" id="refSearch" type="search" placeholder="Rechercher : R290, CO2, A2L..." style="flex:1;" />
        <select id="refFamily">
          <option value="">Toutes familles</option>
          <option>HFC</option><option>HFC Blend</option><option>HFO</option><option>HFO Blend</option><option>Naturel</option><option>HCFC</option>
        </select>
        <select id="refSafety">
          <option value="">Toutes sécurités</option>
          <option>A1</option><option>A2L</option><option>A3</option><option>B2L</option>
        </select>
        <button class="btn" id="refReset">Reset</button>
      </div>

      <div style="margin-top:12px;">
        <table class="table">
          <thead>
            <tr>
              <th>Fluide</th><th>Famille</th><th>Sécurité</th><th>ODP</th><th>GWP</th><th>Glide</th><th>Usages</th><th>Notes</th>
            </tr>
          </thead>
          <tbody id="refTable"></tbody>
        </table>
      </div>
    `;
  }

  function componentsHTML(){
    const c = D.components;
    const list = (arr) => arr.map(x => `<li><strong>${x.name}</strong> — <span class="p">${x.notes}</span></li>`).join("");
    const essentials = c.essentials.map(x => `<li>${x}</li>`).join("");

    return `
      <div class="h1">Composants d’un système frigorifique</div>

      <div class="h2">Condenseurs</div>
      <div class="card"><ul class="p">${list(c.condensers)}</ul></div>

      <div class="h2">Détendeurs</div>
      <div class="card"><ul class="p">${list(c.expansion)}</ul></div>

      <div class="h2">Évaporateurs</div>
      <div class="card"><ul class="p">${list(c.evaporators)}</ul></div>

      <div class="h2">Compresseurs</div>
      <div class="card"><ul class="p">${list(c.compressors)}</ul></div>

      <hr class="hr" />
      <div class="h2">Composants indispensables autour du cycle</div>
      <div class="card"><ul class="p">${essentials}</ul></div>
    `;
  }

  function calculatorsHTML(){
    return `
      <div class="h1">Calculateurs technicien</div>
      <p class="p">Calculs simples à partir de mesures (SH, SC, estimation Q air, COP).</p>

      <div class="grid2">
        <div class="card">
          <div style="font-weight:900;">🔥 Surchauffe (SH)</div>
          <p class="p">SH = T aspiration − T sat BP</p>
          <div class="row">
            <input class="input" id="shTmeas" type="number" step="0.1" placeholder="T aspiration (°C)" />
            <input class="input" id="shTsat" type="number" step="0.1" placeholder="T sat BP (°C)" />
            <button class="btn" id="btnSH">Calculer</button>
          </div>
          <div class="badge" id="outSH" style="margin-top:10px;" hidden></div>
        </div>

        <div class="card">
          <div style="font-weight:900;">🧊 Sous-refroidissement (SC)</div>
          <p class="p">SC = T sat HP − T liquide</p>
          <div class="row">
            <input class="input" id="scTsat" type="number" step="0.1" placeholder="T sat HP (°C)" />
            <input class="input" id="scTliq" type="number" step="0.1" placeholder="T liquide (°C)" />
            <button class="btn" id="btnSC">Calculer</button>
          </div>
          <div class="badge" id="outSC" style="margin-top:10px;" hidden></div>
        </div>

        <div class="card">
          <div style="font-weight:900;">⚡ Puissance côté air (estimation)</div>
          <p class="p">Q ≈ ρ×Cp×Débit×ΔT</p>
          <div class="row">
            <input class="input" id="airFlow" type="number" step="1" placeholder="Débit air (m³/h)" />
            <input class="input" id="airDT" type="number" step="0.1" placeholder="ΔT air (K)" />
            <button class="btn" id="btnAirQ">Estimer</button>
          </div>
          <div class="badge" id="outAirQ" style="margin-top:10px;" hidden></div>
          <p class="small">Hypothèse : ρ≈1.2 kg/m³, Cp≈1.005 kJ/kg.K</p>
        </div>

        <div class="card">
          <div style="font-weight:900;">🏁 COP</div>
          <p class="p">COP = utile / électrique</p>
          <div class="row">
            <input class="input" id="copUseful" type="number" step="0.01" placeholder="Utile (kW)" />
            <input class="input" id="copElec" type="number" step="0.01" placeholder="Électrique (kW)" />
            <button class="btn" id="btnCOP">Calculer</button>
          </div>
          <div class="badge" id="outCOP" style="margin-top:10px;" hidden></div>
        </div>
      </div>
    `;
  }

  function diagnosticsHTML(){
    const rows = D.diagnostics.map(d => `
      <div class="card" style="margin-bottom:10px;">
        <div class="row" style="justify-content:space-between;">
          <div style="font-weight:900;">🔎 ${d.symptom}</div>
          <span class="badge"><strong>Guide</strong> terrain</span>
        </div>
        <div class="grid2" style="margin-top:10px;">
          <div>
            <div class="h2" style="margin-top:0;">Causes probables</div>
            <ul class="p">${d.causes.map(x=>`<li>${x}</li>`).join("")}</ul>
          </div>
          <div>
            <div class="h2" style="margin-top:0;">Actions / contrôles</div>
            <ul class="p">${d.actions.map(x=>`<li>${x}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    `).join("");

    return `
      <div class="h1">Diagnostic rapide</div>
      <p class="p">Compare symptômes ↔ mesures (SH/SC/HP/BP/ΔT/Intensité/échangeurs).</p>
      ${rows}
    `;
  }

  function safetyHTML(){
    return `
      <div class="h1">Sécurité & bonnes pratiques</div>

      <div class="grid2">
        <div class="card">
          <div style="font-weight:900;">🦺 EPI minimum</div>
          <ul class="p">
            <li>Lunettes, gants adaptés, chaussures</li>
            <li>Ventilation + détecteurs selon fluide</li>
            <li>Zone sans étincelles si A2L/A3</li>
          </ul>
        </div>
        <div class="card">
          <div style="font-weight:900;">🧯 Procédure pro</div>
          <ol class="p">
            <li>Identifier fluide & sécurité</li>
            <li>Récupération dans bouteille homologuée</li>
            <li>Tirage au vide</li>
            <li>Charge à la balance</li>
            <li>Test étanchéité selon règles</li>
          </ol>
        </div>
      </div>

      <div class="tip" style="margin-top:12px;">
        <strong>A2L/A3 :</strong> respecter limites de charge, ventilation, sources d’ignition.
      </div>
    `;
  }

  function noteHTML(){
    return `
      <div class="h1">Bloc-notes</div>
      <p class="p">Notes de cours / mesures terrain (stockage local navigateur).</p>
      <textarea class="input noteArea" id="noteText" placeholder="Mesures : BP=..., HP=..., SH=..., SC=..."></textarea>
      <div class="row" style="margin-top:10px;">
        <button class="btn" id="saveNote">Sauvegarder</button>
        <button class="btn" id="loadNote">Charger</button>
        <button class="btn" id="clearNote">Effacer</button>
        <span class="small">LocalStorage</span>
      </div>
    `;
  }

  function aboutHTML(){
    return `
      <div class="h1">À propos</div>
      <p class="p">
        FrigoLab est un site pédagogique “style bureau” pour apprendre le froid et pratiquer les calculs.
        Tu peux modifier les données dans <code>data.js</code>.
      </p>
    `;
  }

  function videosHTML(){
    return `
      <div class="h1">Vidéos pédagogiques</div>
      <p class="p">Deux vidéos intégrées. Tu peux les regarder ici sans quitter le site.</p>

      <div class="grid2">
        <div class="card">
          <div style="font-weight:900;">🎥 Vidéo 1</div>
          <p class="p">m6qXZJXNGpQ</p>
          <div style="border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.15); aspect-ratio:16/9;">
            <iframe
              src="https://www.youtube-nocookie.com/embed/m6qXZJXNGpQ"
              title="Vidéo 1"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              style="width:100%; height:100%; border:0;">
            </iframe>
          </div>
        </div>

        <div class="card">
          <div style="font-weight:900;">🎥 Vidéo 2</div>
          <p class="p">j9KwDp6RugM</p>
          <div style="border-radius:16px; overflow:hidden; border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.15); aspect-ratio:16/9;">
            <iframe
              src="https://www.youtube-nocookie.com/embed/j9KwDp6RugM"
              title="Vidéo 2"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              style="width:100%; height:100%; border:0;">
            </iframe>
          </div>
        </div>
      </div>
    `;
  }

  // ✅ Diagramme P-h
  function phDiagramHTML(){
    return `
      <div class="h1">Diagramme enthalpique (P-h) — Traceur</div>
      <p class="p">Entre P (bar) et h (kJ/kg) pour les points 1-2-3-4. Le cycle est tracé + tableau.</p>

      <div class="grid2" style="margin-top:12px;">
        <div class="card">
          <div style="font-weight:900;">🧾 Points</div>

          <table class="table" style="margin-top:10px;">
            <thead><tr><th>Pt</th><th>P (bar)</th><th>h (kJ/kg)</th><th>Label</th></tr></thead>
            <tbody>
              ${[1,2,3,4].map(i=>`
                <tr>
                  <td><strong>${i}</strong></td>
                  <td><input class="input" id="ph_p${i}" type="number" step="0.01"></td>
                  <td><input class="input" id="ph_h${i}" type="number" step="0.1"></td>
                  <td><input class="input" id="ph_l${i}" type="text" placeholder="ex: aspiration"></td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="row" style="margin-top:10px;">
            <button class="btn" id="btnPHDraw">Tracer</button>
            <button class="btn" id="btnPHExample">Exemple</button>
            <button class="btn" id="btnPHClear">Reset</button>
          </div>

          <div class="h2">Tableau</div>
          <div class="card" style="padding:0;">
            <table class="table" style="margin:0;">
              <thead><tr><th>Pt</th><th>P</th><th>h</th><th>Interprétation</th></tr></thead>
              <tbody id="phTableOut"><tr><td colspan="4">Clique “Tracer”.</td></tr></tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="row" style="justify-content:space-between;">
            <div style="font-weight:900;">📈 P-h</div>
            <span class="badge"><strong>log(P)</strong></span>
          </div>
          <canvas id="phCanvas" width="900" height="560"
            style="width:100%; height:auto; border-radius:16px; border:1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.15); margin-top:10px;">
          </canvas>
          <div class="small" style="margin-top:10px;">X : h (kJ/kg) • Y : P (bar) en log</div>
        </div>
      </div>
    `;
  }

  function converterHTML(){
    return `
      <div class="h1">Convertisseur</div>
      <div class="grid2">
        <div class="card">
          <div style="font-weight:900;">Densité ↔ Volume spécifique</div>
          <p class="p">ρ (kg/m³) ↔ v (m³/kg) avec v = 1/ρ</p>
          <div class="row">
            <input class="input" id="rho" type="number" step="0.0001" placeholder="ρ kg/m³">
            <button class="btn" id="toV">→ v</button>
            <input class="input" id="v" type="number" step="0.0000001" placeholder="v m³/kg">
            <button class="btn" id="toRho">→ ρ</button>
          </div>
          <div class="badge" id="convOut1" style="margin-top:10px;" hidden></div>
        </div>

        <div class="card">
          <div style="font-weight:900;">kg/h ↔ kg/s</div>
          <div class="row">
            <input class="input" id="kgh" type="number" step="0.01" placeholder="kg/h">
            <button class="btn" id="toKgs">→ kg/s</button>
            <input class="input" id="kgs" type="number" step="0.0001" placeholder="kg/s">
            <button class="btn" id="toKgh">→ kg/h</button>
          </div>
          <div class="badge" id="convOut2" style="margin-top:10px;" hidden></div>
        </div>

        <div class="card">
          <div style="font-weight:900;">°C ↔ K</div>
          <div class="row">
            <input class="input" id="c" type="number" step="0.1" placeholder="°C">
            <button class="btn" id="toK">→ K</button>
            <input class="input" id="k" type="number" step="0.1" placeholder="K">
            <button class="btn" id="toC">→ °C</button>
          </div>
          <div class="badge" id="convOut3" style="margin-top:10px;" hidden></div>
        </div>

        <div class="card">
          <div style="font-weight:900;">bar ↔ kPa</div>
          <div class="row">
            <input class="input" id="bar" type="number" step="0.01" placeholder="bar">
            <button class="btn" id="toKpa">→ kPa</button>
            <input class="input" id="kpa" type="number" step="0.1" placeholder="kPa">
            <button class="btn" id="toBar">→ bar</button>
          </div>
          <div class="badge" id="convOut4" style="margin-top:10px;" hidden></div>
        </div>
      </div>
    `;
  }

  // ---------- Window plumbing ----------
  function hydrateWindow(winEl, id){
    if (id === "win-refrigerants") renderRefrigerants(winEl);
    if (id === "win-calculators") bindCalculators(winEl);
    if (id === "win-note") bindNote(winEl);
    if (id === "win-phdiagram") bindPhDiagram(winEl);
    if (id === "win-converter") bindConverter(winEl);
  }

  function openWindow(def){
    const { id, title, icon, badge, contentHTML, width=720, height=520 } = def;

    if (state.windows.has(id)){
      const w = state.windows.get(id);
      w.minimized = false;
      w.el.hidden = false;
      bringToFront(w.el);
      return;
    }

    const win = document.createElement("section");
    win.className = "window";
    win.dataset.id = id;
    win.dataset.max = "false";

    const left = Math.round(40 + Math.random()*140);
    const top  = Math.round(110 + Math.random()*120);

    win.style.left = `${left}px`;
    win.style.top  = `${top}px`;
    win.style.width  = `${Math.min(width, window.innerWidth - 20)}px`;
    win.style.height = `${Math.min(height, window.innerHeight - 120)}px`;

    win.innerHTML = `
      <div class="winTitlebar">
        <div class="winTitle">
          <span aria-hidden="true">${icon}</span>
          <span>${title}</span>
          ${badge ? `<span class="winBadge">${badge}</span>` : ""}
        </div>
        <div class="winControls">
          <button class="winBtn" data-act="min" title="Réduire">—</button>
          <button class="winBtn" data-act="max" title="Agrandir">▢</button>
          <button class="winBtn close" data-act="close" title="Fermer">✕</button>
        </div>
      </div>
      <div class="winBody">${contentHTML}</div>
      <div class="resizeHandle" title="Redimensionner"></div>
    `;

    win.addEventListener("pointerdown", () => bringToFront(win));

    const titlebar = win.querySelector(".winTitlebar");
    const resize = win.querySelector(".resizeHandle");
    enableDrag(win, titlebar);
    enableResize(win, resize);

    // ✅ boutons control : stop propagation
    win.querySelectorAll(".winBtn").forEach(btn=>{
      btn.addEventListener("pointerdown", (e) => e.stopPropagation());
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const act = btn.dataset.act;
        if (act === "min") toggleMinimize(id);
        if (act === "close") closeWindow(id);
        if (act === "max"){
          const yes = win.dataset.max !== "true";
          setMaximize(win, yes);
          bringToFront(win);
        }
      });
    });

    layer.appendChild(win);
    bringToFront(win);

    state.windows.set(id, { el: win, minimized:false, title, icon });
    createTaskButton({id, title, icon});
    hydrateWindow(win, id);
  }

  // ---------- Binders ----------
  function renderRefrigerants(winEl){
    const tbody = winEl.querySelector("#refTable");
    const q = winEl.querySelector("#refSearch");
    const fam = winEl.querySelector("#refFamily");
    const saf = winEl.querySelector("#refSafety");
    const reset = winEl.querySelector("#refReset");

    const render = () => {
      const term = (q.value || "").trim().toLowerCase();
      const f = fam.value;
      const s = saf.value;

      const filtered = D.refrigerants.filter(r => {
        const hay = `${r.name} ${r.family} ${r.safety} ${r.uses} ${r.notes}`.toLowerCase();
        if (term && !hay.includes(term)) return false;
        if (f && r.family !== f) return false;
        if (s && r.safety !== s) return false;
        return true;
      });

      tbody.innerHTML = filtered.map(r => `
        <tr>
          <td><strong>${r.name}</strong></td>
          <td>${r.family}</td>
          <td>${r.safety}</td>
          <td>${r.odp ?? ""}</td>
          <td>${r.gwp ?? ""}</td>
          <td>${r.glide ?? ""}</td>
          <td>${r.uses ?? ""}</td>
          <td>${r.notes ?? ""}</td>
        </tr>
      `).join("") || `<tr><td colspan="8">Aucun résultat.</td></tr>`;
    };

    q.addEventListener("input", render);
    fam.addEventListener("change", render);
    saf.addEventListener("change", render);
    reset.addEventListener("click", () => { q.value=""; fam.value=""; saf.value=""; render(); });
    render();
  }

  function bindCalculators(winEl){
    const out = (el, txt) => { el.hidden = false; el.textContent = txt; };

    winEl.querySelector("#btnSH").addEventListener("click", () => {
      const a = Number(winEl.querySelector("#shTmeas").value);
      const b = Number(winEl.querySelector("#shTsat").value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return out(winEl.querySelector("#outSH"), "⚠️ Saisis deux températures valides.");
      out(winEl.querySelector("#outSH"), `Surchauffe SH = ${(a-b).toFixed(1)} K`);
    });

    winEl.querySelector("#btnSC").addEventListener("click", () => {
      const a = Number(winEl.querySelector("#scTsat").value);
      const b = Number(winEl.querySelector("#scTliq").value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return out(winEl.querySelector("#outSC"), "⚠️ Saisis deux températures valides.");
      out(winEl.querySelector("#outSC"), `Sous-refroidissement SC = ${(a-b).toFixed(1)} K`);
    });

    winEl.querySelector("#btnAirQ").addEventListener("click", () => {
      const flow_m3h = Number(winEl.querySelector("#airFlow").value);
      const dT = Number(winEl.querySelector("#airDT").value);
      if (!Number.isFinite(flow_m3h) || !Number.isFinite(dT)) return out(winEl.querySelector("#outAirQ"), "⚠️ Saisis débit et ΔT valides.");
      const flow_m3s = flow_m3h / 3600;
      const Q_kW = 1.2 * 1.005 * flow_m3s * dT;
      out(winEl.querySelector("#outAirQ"), `Puissance estimée ≈ ${Q_kW.toFixed(2)} kW`);
    });

    winEl.querySelector("#btnCOP").addEventListener("click", () => {
      const u = Number(winEl.querySelector("#copUseful").value);
      const e = Number(winEl.querySelector("#copElec").value);
      if (!Number.isFinite(u) || !Number.isFinite(e) || e <= 0) return out(winEl.querySelector("#outCOP"), "⚠️ kW valides (électrique > 0).");
      out(winEl.querySelector("#outCOP"), `COP = ${(u/e).toFixed(2)}`);
    });
  }

  function bindNote(winEl){
    const ta = winEl.querySelector("#noteText");
    const KEY = "frigolab_note_v1";
    winEl.querySelector("#loadNote").addEventListener("click", () => ta.value = localStorage.getItem(KEY) || "");
    winEl.querySelector("#saveNote").addEventListener("click", () => localStorage.setItem(KEY, ta.value || ""));
    winEl.querySelector("#clearNote").addEventListener("click", () => { ta.value=""; localStorage.removeItem(KEY); });
    ta.value = localStorage.getItem(KEY) || "";
  }

  function bindConverter(winEl){
    const badge = (id, txt) => { const el = winEl.querySelector(id); el.hidden=false; el.textContent=txt; };
    const n = (id) => Number(winEl.querySelector(id).value);

    winEl.querySelector("#toV").addEventListener("click", () => {
      const rho = n("#rho");
      if(!Number.isFinite(rho) || rho<=0) return badge("#convOut1","⚠️ ρ doit être > 0");
      const v = 1/rho;
      winEl.querySelector("#v").value = v;
      badge("#convOut1", `v = ${v.toPrecision(8)} m³/kg`);
    });

    winEl.querySelector("#toRho").addEventListener("click", () => {
      const v = n("#v");
      if(!Number.isFinite(v) || v<=0) return badge("#convOut1","⚠️ v doit être > 0");
      const rho = 1/v;
      winEl.querySelector("#rho").value = rho;
      badge("#convOut1", `ρ = ${rho.toPrecision(8)} kg/m³`);
    });

    winEl.querySelector("#toKgs").addEventListener("click", () => {
      const kgh = n("#kgh");
      if(!Number.isFinite(kgh)) return badge("#convOut2","⚠️ valeur invalide");
      const kgs = kgh/3600;
      winEl.querySelector("#kgs").value = kgs;
      badge("#convOut2", `${kgh} kg/h = ${kgs.toPrecision(8)} kg/s`);
    });

    winEl.querySelector("#toKgh").addEventListener("click", () => {
      const kgs = n("#kgs");
      if(!Number.isFinite(kgs)) return badge("#convOut2","⚠️ valeur invalide");
      const kgh = kgs*3600;
      winEl.querySelector("#kgh").value = kgh;
      badge("#convOut2", `${kgs} kg/s = ${kgh.toPrecision(8)} kg/h`);
    });

    winEl.querySelector("#toK").addEventListener("click", () => {
      const c = n("#c");
      if(!Number.isFinite(c)) return badge("#convOut3","⚠️ valeur invalide");
      const k = c + 273.15;
      winEl.querySelector("#k").value = k;
      badge("#convOut3", `${c} °C = ${k.toFixed(2)} K`);
    });

    winEl.querySelector("#toC").addEventListener("click", () => {
      const k = n("#k");
      if(!Number.isFinite(k)) return badge("#convOut3","⚠️ valeur invalide");
      const c = k - 273.15;
      winEl.querySelector("#c").value = c;
      badge("#convOut3", `${k} K = ${c.toFixed(2)} °C`);
    });

    winEl.querySelector("#toKpa").addEventListener("click", () => {
      const bar = n("#bar");
      if(!Number.isFinite(bar)) return badge("#convOut4","⚠️ valeur invalide");
      const kpa = bar*100;
      winEl.querySelector("#kpa").value = kpa;
      badge("#convOut4", `${bar} bar = ${kpa.toFixed(2)} kPa`);
    });

    winEl.querySelector("#toBar").addEventListener("click", () => {
      const kpa = n("#kpa");
      if(!Number.isFinite(kpa)) return badge("#convOut4","⚠️ valeur invalide");
      const bar = kpa/100;
      winEl.querySelector("#bar").value = bar;
      badge("#convOut4", `${kpa} kPa = ${bar.toFixed(4)} bar`);
    });
  }

  function bindPhDiagram(winEl){
    const canvas = winEl.querySelector("#phCanvas");
    const ctx = canvas.getContext("2d");
    const outTable = winEl.querySelector("#phTableOut");
    const get = (sel) => winEl.querySelector(sel);
    const log10 = (x) => Math.log(x)/Math.log(10);

    function readPoints(){
      const pts = [1,2,3,4].map(i => ({
        i,
        p: Number(get(`#ph_p${i}`).value),
        h: Number(get(`#ph_h${i}`).value),
        l: (get(`#ph_l${i}`).value || "").trim()
      }));
      const ok = pts.every(x => Number.isFinite(x.p) && x.p > 0 && Number.isFinite(x.h));
      return {pts, ok};
    }

    function computeBounds(pts){
      const hs = pts.map(x=>x.h);
      const ps = pts.map(x=>x.p);
      let hMin = Math.min(...hs), hMax = Math.max(...hs);
      let pMin = Math.min(...ps), pMax = Math.max(...ps);

      const hPad = Math.max(10, (hMax - hMin)*0.15);
      hMin -= hPad; hMax += hPad;
      pMin = Math.max(0.05, pMin*0.7);
      pMax = pMax*1.4;
      return {hMin,hMax,pMin,pMax};
    }

    function mapX(h,b){
      const W=canvas.width, padL=70, padR=20;
      return padL + ((h-b.hMin)/(b.hMax-b.hMin))*(W-padL-padR);
    }
    function mapY(p,b){
      const H=canvas.height, padT=20, padB=55;
      const lp=log10(p), lmin=log10(b.pMin), lmax=log10(b.pMax);
      const t=(lp-lmin)/(lmax-lmin);
      return padT + (1-t)*(H-padT-padB);
    }

    function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

    function drawBackground(b){
      const W=canvas.width, H=canvas.height;
      const padL=70, padR=20, padT=20, padB=55;

      ctx.fillStyle="rgba(0,0,0,0.10)";
      ctx.fillRect(0,0,W,H);

      ctx.strokeStyle="rgba(255,255,255,0.10)";
      ctx.lineWidth=1;

      for(let i=0;i<=10;i++){
        const x=padL + i*(W-padL-padR)/10;
        ctx.beginPath(); ctx.moveTo(x,padT); ctx.lineTo(x,H-padB); ctx.stroke();
      }
      for(let i=0;i<=8;i++){
        const y=padT + i*(H-padT-padB)/8;
        ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(W-padR,y); ctx.stroke();
      }

      ctx.strokeStyle="rgba(255,255,255,0.22)";
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(padL,padT);
      ctx.lineTo(padL,H-padB);
      ctx.lineTo(W-padR,H-padB);
      ctx.stroke();

      ctx.fillStyle="rgba(255,255,255,0.80)";
      ctx.font="16px system-ui";
      ctx.fillText("h (kJ/kg)", W/2 - 35, H-18);
      ctx.save();
      ctx.translate(18, H/2 + 30);
      ctx.rotate(-Math.PI/2);
      ctx.fillText("P (bar) — log", 0, 0);
      ctx.restore();
    }

    function drawCycle(pts,b){
      ctx.strokeStyle="rgba(255,106,0,0.95)";
      ctx.lineWidth=3;
      ctx.beginPath();
      pts.forEach((pt,idx)=>{
        const x=mapX(pt.h,b), y=mapY(pt.p,b);
        if(idx===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.lineTo(mapX(pts[0].h,b), mapY(pts[0].p,b));
      ctx.stroke();

      pts.forEach(pt=>{
        const x=mapX(pt.h,b), y=mapY(pt.p,b);
        ctx.fillStyle="rgba(255,255,255,0.95)";
        ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fill();

        ctx.fillStyle="rgba(255,255,255,0.85)";
        ctx.font="12px system-ui";
        const label = pt.l ? `${pt.i} (${pt.l})` : `${pt.i}`;
        ctx.fillText(label, x+8, y-8);
      });
    }

    function updateTable(pts){
      const interp = {
        1: "Sortie évaporateur / aspiration compresseur",
        2: "Refoulement compresseur",
        3: "Sortie condenseur (liquide)",
        4: "Après détendeur (mélange)"
      };
      outTable.innerHTML = pts.map(pt => `
        <tr>
          <td><strong>${pt.i}</strong></td>
          <td>${pt.p.toFixed(2)}</td>
          <td>${pt.h.toFixed(1)}</td>
          <td>${interp[pt.i] || ""}${pt.l ? ` — ${pt.l}` : ""}</td>
        </tr>
      `).join("");
    }

    function draw(){
      const {pts, ok} = readPoints();
      if(!ok){
        outTable.innerHTML = `<tr><td colspan="4">⚠️ Renseigne P>0 et h pour les 4 points.</td></tr>`;
        clear(); drawBackground({hMin:200,hMax:500,pMin:0.5,pMax:20});
        return;
      }
      const b=computeBounds(pts);
      clear(); drawBackground(b); drawCycle(pts,b); updateTable(pts);
    }

    winEl.querySelector("#btnPHDraw").addEventListener("click", draw);
    winEl.querySelector("#btnPHClear").addEventListener("click", () => {
      [1,2,3,4].forEach(i => { get(`#ph_p${i}`).value=""; get(`#ph_h${i}`).value=""; get(`#ph_l${i}`).value=""; });
      outTable.innerHTML = `<tr><td colspan="4">Clique “Tracer”.</td></tr>`;
      clear(); drawBackground({hMin:200,hMax:500,pMin:0.5,pMax:20});
    });
    winEl.querySelector("#btnPHExample").addEventListener("click", () => {
      get("#ph_p1").value="2.2";  get("#ph_h1").value="395"; get("#ph_l1").value="Aspiration";
      get("#ph_p2").value="10.5"; get("#ph_h2").value="455"; get("#ph_l2").value="Refoulement";
      get("#ph_p3").value="10.2"; get("#ph_h3").value="255"; get("#ph_l3").value="Liquide";
      get("#ph_p4").value="2.3";  get("#ph_h4").value="255"; get("#ph_l4").value="Après détente";
      draw();
    });

    clear(); drawBackground({hMin:200,hMax:500,pMin:0.5,pMax:20});
  }

  // ---------- WINDOWS ----------
  const WINDOWS = {
    "win-intro": { id:"win-intro", title:"Cours complet", icon:"📚", badge:"Cycle & méthode", contentHTML:introHTML(), width: 860, height: 560 },
    "win-refrigerants": { id:"win-refrigerants", title:"Fluides frigorigènes", icon:"🧪", badge:"Base + filtre", contentHTML:refrigerantsHTML(), width: 980, height: 560 },
    "win-components": { id:"win-components", title:"Composants", icon:"🧰", badge:"Tout le matériel", contentHTML:componentsHTML(), width: 900, height: 560 },
    "win-calculators": { id:"win-calculators", title:"Calculateurs", icon:"🧮", badge:"SH • SC • COP", contentHTML:calculatorsHTML(), width: 900, height: 560 },
    "win-phdiagram": { id:"win-phdiagram", title:"Diagramme P-h", icon:"📈", badge:"Tracé + tableau", contentHTML:phDiagramHTML(), width: 1100, height: 650 },
    "win-converter": { id:"win-converter", title:"Convertisseur", icon:"🔁", badge:"Unités", contentHTML:converterHTML(), width: 900, height: 560 },
    "win-videos": { id:"win-videos", title:"Vidéos", icon:"🎬", badge:"Cours", contentHTML:videosHTML(), width: 1100, height: 650 },
    "win-diagnostics": { id:"win-diagnostics", title:"Diagnostic", icon:"🔎", badge:"Symptômes → causes", contentHTML:diagnosticsHTML(), width: 860, height: 560 },
    "win-safety": { id:"win-safety", title:"Sécurité", icon:"🦺", badge:"Bonnes pratiques", contentHTML:safetyHTML(), width: 860, height: 520 },
    "win-note": { id:"win-note", title:"Bloc-notes", icon:"📝", badge:"local", contentHTML:noteHTML(), width: 640, height: 520 },
    "win-about": { id:"win-about", title:"À propos", icon:"ℹ️", badge:"FrigoLab", contentHTML:aboutHTML(), width: 660, height: 420 }
  };

  // ---------- Desktop open ----------
  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.open;
      if (WINDOWS[key]) openWindow(WINDOWS[key]);
      hideStart();
    });
  });

  // ---------- Start menu ----------
  function showStart(){
    startMenu.hidden = false;
    startBtn.setAttribute("aria-expanded","true");
    globalSearch?.focus();
  }
  function hideStart(){
    startMenu.hidden = true;
    startBtn.setAttribute("aria-expanded","false");
  }
  function toggleStart(){
    if (startMenu.hidden) showStart(); else hideStart();
  }
  startBtn.addEventListener("click", (e) => { e.stopPropagation(); toggleStart(); });
  document.addEventListener("click", (e) => {
    if (!startMenu.hidden && !startMenu.contains(e.target) && e.target !== startBtn) hideStart();
  });

  startMenu.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.open;
      if (WINDOWS[key]) openWindow(WINDOWS[key]);
      hideStart();
    });
  });

  document.getElementById("startNewNote").addEventListener("click", () => {
    openWindow(WINDOWS["win-note"]);
    hideStart();
  });

  document.getElementById("btnAbout").addEventListener("click", () => {
    openWindow(WINDOWS["win-about"]);
    hideStart();
  });

  document.getElementById("btnResetLayout").addEventListener("click", () => {
    for (const id of Array.from(state.windows.keys())) closeWindow(id);
    openWindow(WINDOWS["win-intro"]);
    openWindow(WINDOWS["win-refrigerants"]);
    hideStart();
  });

  // Start search shortcuts
  globalSearch.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const term = (globalSearch.value || "").trim().toLowerCase();
    if (!term) return;

    if (term.includes("r") || term.includes("co2") || term.includes("nh3") || term.includes("a2l") || term.includes("gwp")){
      openWindow(WINDOWS["win-refrigerants"]);
      setTimeout(() => {
        const w = state.windows.get("win-refrigerants");
        if (!w) return;
        const input = w.el.querySelector("#refSearch");
        input.value = globalSearch.value;
        input.dispatchEvent(new Event("input"));
      }, 50);
      hideStart(); return;
    }
    if (term.includes("cop") || term.includes("surchauffe") || term.includes("sous")){
      openWindow(WINDOWS["win-calculators"]); hideStart(); return;
    }
    if (term.includes("p-h") || term.includes("enthalpie") || term.includes("ph")){
      openWindow(WINDOWS["win-phdiagram"]); hideStart(); return;
    }
    if (term.includes("convert")){
      openWindow(WINDOWS["win-converter"]); hideStart(); return;
    }
    if (term.includes("video") || term.includes("vidéo")){
      openWindow(WINDOWS["win-videos"]); hideStart(); return;
    }
    if (term.includes("panne") || term.includes("hp") || term.includes("bp")){
      openWindow(WINDOWS["win-diagnostics"]); hideStart(); return;
    }
    openWindow(WINDOWS["win-intro"]); hideStart();
  });

  // ---------- Top buttons ----------
  document.getElementById("btnOpenAll").addEventListener("click", () => {
    ["win-intro","win-refrigerants","win-components","win-calculators","win-phdiagram","win-converter","win-videos","win-diagnostics","win-safety"]
      .forEach(k => openWindow(WINDOWS[k]));
  });
  document.getElementById("btnNewNote").addEventListener("click", () => openWindow(WINDOWS["win-note"]));

  document.getElementById("btnTheme").addEventListener("click", () => {
    state.themeAlt = !state.themeAlt;
    document.documentElement.style.setProperty("--bg0", state.themeAlt ? "#07060b" : "#0b0f14");
    document.documentElement.style.setProperty("--bg1", state.themeAlt ? "#120a10" : "#0f1520");
    document.documentElement.style.setProperty("--accent2", state.themeAlt ? "#ffd0aa" : "#ff9b4a");
  });

  // bouton dock vidéos -> fenêtre
  const btnOpenVideos = document.getElementById("btnOpenVideos");
  if (btnOpenVideos){
    btnOpenVideos.addEventListener("click", () => openWindow(WINDOWS["win-videos"]));
  }

  // ---------- Boot ----------
  openWindow(WINDOWS["win-intro"]);
})();