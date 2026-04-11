// ============================================================
//  WuWa Team Tracker — app.js
// ============================================================

// ---- STATE -------------------------------------------------
var state = {
  pages: [],
  currentPage: 0
};

var activeElementFilter = null;

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function findHero(id) {
  for (var i = 0; i < HEROES.length; i++) if (HEROES[i].id === id) return HEROES[i];
  return null;
}

function findWeapon(id) {
  for (var i = 0; i < WEAPONS.length; i++) if (WEAPONS[i].id === id) return WEAPONS[i];
  return null;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---- PERSISTENCE -------------------------------------------
function save() {
  try { localStorage.setItem("wuwa_v3", JSON.stringify(state)); } catch(e) {}
}

function load() {
  try {
    var raw = localStorage.getItem("wuwa_v3");
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.pages && parsed.pages.length > 0) {
        state = parsed;
        return;
      }
    }
  } catch(e) {}
  // Default: one empty page
  state = { pages: [{ id: uid(), name: "Page 1", teams: [] }], currentPage: 0 };
}

// ---- USAGE TRACKING ----------------------------------------
function usagesOnPage() {
  var page = state.pages[state.currentPage];
  var counts = {};
  for (var t = 0; t < page.teams.length; t++) {
    for (var s = 0; s < page.teams[t].heroes.length; s++) {
      var slot = page.teams[t].heroes[s];
      if (slot) counts[slot.heroId] = (counts[slot.heroId] || 0) + 1;
    }
  }
  return counts;
}

function heroAvailable(heroId) {
  var hero = findHero(heroId);
  if (!hero) return false;
  var counts = usagesOnPage();
  var used = counts[heroId] || 0;
  return used < (hero.canUseMultiple ? 2 : 1);
}

// ---- ELEMENT FILTER ----------------------------------------
function renderElementFilters() {
  var bar = document.getElementById("elementFilters");
  bar.innerHTML = "";

  // All button
  var allBtn = document.createElement("button");
  allBtn.className = "elem-btn" + (activeElementFilter === null ? " active" : "");
  allBtn.textContent = "All";
  allBtn.addEventListener("click", function() {
    activeElementFilter = null;
    renderElementFilters();
    renderPool();
  });
  bar.appendChild(allBtn);

  // Collect unique elements in order
  var seen = {};
  var elements = [];
  for (var i = 0; i < HEROES.length; i++) {
    var el = HEROES[i].element;
    if (!seen[el]) { seen[el] = true; elements.push(el); }
  }
  elements.sort();

  for (var e = 0; e < elements.length; e++) {
    (function(elem) {
      var btn = document.createElement("button");
      var isActive = activeElementFilter === elem;
      btn.className = "elem-btn" + (isActive ? " active" : "");
      btn.style.borderColor = isActive ? (ELEMENT_COLORS[elem] || "#888") : "";
      btn.style.color = isActive ? "#fff" : (ELEMENT_COLORS[elem] || "#aaa");

      var img = document.createElement("img");
      img.src = "icons/elements/" + elem + ".png";
      img.alt = elem;
      img.className = "elem-icon";
      img.onerror = function() { this.style.display = "none"; };

      var label = document.createElement("span");
      label.textContent = elem;

      btn.appendChild(img);
      btn.appendChild(label);
      btn.addEventListener("click", function() {
        activeElementFilter = (activeElementFilter === elem) ? null : elem;
        renderElementFilters();
        renderPool();
      });
      bar.appendChild(btn);
    })(elements[e]);
  }
}

// ---- HERO POOL ---------------------------------------------
function renderPool() {
  var pool = document.getElementById("heroPool");
  pool.innerHTML = "";
  var counts = usagesOnPage();

  var list = [];
  for (var i = 0; i < HEROES.length; i++) {
    if (!activeElementFilter || HEROES[i].element === activeElementFilter) {
      list.push(HEROES[i]);
    }
  }

  if (list.length === 0) {
    pool.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:1rem">No heroes for this element.</div>';
    return;
  }

  for (var h = 0; h < list.length; h++) {
    (function(hero) {
      var used = counts[hero.id] || 0;
      var max = hero.canUseMultiple ? 2 : 1;
      var exhausted = used >= max;

      var card = document.createElement("div");
      card.className = "pool-hero" + (exhausted ? " exhausted" : "");
      card.draggable = !exhausted;
      card.dataset.heroId = hero.id;

      var elemColor = ELEMENT_COLORS[hero.element] || "#888";
      var is5 = hero.rarity === "5*";

      card.innerHTML =
        '<div class="hero-avatar" style="border-color:' + (is5 ? "var(--rarity5)" : "var(--rarity4)") + '">' +
          '<img src="icons/heroes/' + hero.id + '.png" alt="' + escHtml(hero.name) + '" ' +
               'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span class="hero-initial" style="display:none">' + hero.name[0] + '</span>' +
          (hero.canUseMultiple ? '<span class="multi-badge">x2</span>' : '') +
          (exhausted ? '<span class="exhausted-overlay">✓</span>' : '') +
          '<span class="rarity-pip">' + hero.rarity + '</span>' +
        '</div>' +
        '<span class="pool-name">' + escHtml(hero.name) + '</span>' +
        '<span class="pool-elem" style="color:' + elemColor + '">' + hero.element + '</span>';

      if (!exhausted) {
        card.addEventListener("dragstart", function(e) {
          e.dataTransfer.setData("heroId", hero.id);
          e.dataTransfer.effectAllowed = "move";
          card.classList.add("dragging");
        });
        card.addEventListener("dragend", function() { card.classList.remove("dragging"); });
      }

      pool.appendChild(card);
    })(list[h]);
  }
}

// ---- TEAMS -------------------------------------------------
function defaultTeam() {
  var page = state.pages[state.currentPage];
  return {
    id: uid(),
    name: "Team " + (page.teams.length + 1),
    heroes: [null, null, null],
    damage: "",
    buff: null
  };
}

function renderTeams() {
  var page = state.pages[state.currentPage];
  var grid = document.getElementById("teamsGrid");
  grid.innerHTML = "";

  if (page.teams.length === 0) {
    grid.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:1rem">No teams yet. Click "+ Add Team" to create one.</div>';
    return;
  }

  for (var ti = 0; ti < page.teams.length; ti++) {
    (function(team, teamIndex) {
      var cost = calcTeamCost(team);
      var card = document.createElement("div");
      card.className = "team-card";

      // Build hero slots HTML
      var slotsHtml = "";
      for (var si = 0; si < team.heroes.length; si++) {
        slotsHtml += buildSlotHTML(team.heroes[si], teamIndex, si);
      }

      // Build buffs HTML
      var buffsHtml = "";
      for (var bi = 0; bi < BUFFS.length; bi++) {
        var b = BUFFS[bi];
        buffsHtml +=
          '<button class="buff-btn' + (team.buff === b.id ? " active" : "") + '" data-buff="' + b.id + '" title="' + escHtml(b.desc) + '">' +
            '<img src="icons/buffs/' + b.id + '.png" alt="' + escHtml(b.name) + '" onerror="this.style.display=\'none\'">' +
            '<span>' + escHtml(b.name) + '</span>' +
          '</button>';
      }

      card.innerHTML =
        '<div class="team-top">' +
          '<input class="team-name-input" value="' + escHtml(team.name) + '" placeholder="Team name">' +
          '<div class="team-top-right">' +
            '<span class="cost-badge">Cost: ' + cost + '</span>' +
            '<button class="btn-del-team" title="Remove team">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="team-slots">' + slotsHtml + '</div>' +
        '<div class="team-bottom">' +
          '<div class="damage-row">' +
            '<label>Damage</label>' +
            '<input class="damage-input" type="number" min="0" placeholder="0" value="' + escHtml(team.damage || "") + '">' +
          '</div>' +
          '<div class="buff-row">' +
            '<label>Buff</label>' +
            '<div class="buff-options">' + buffsHtml + '</div>' +
          '</div>' +
        '</div>';

      // ---- Team name change
      card.querySelector(".team-name-input").addEventListener("change", function(e) {
        state.pages[state.currentPage].teams[teamIndex].name = e.target.value;
        save();
      });

      // ---- Remove team
      card.querySelector(".btn-del-team").addEventListener("click", function() {
        if (!confirm("Remove this team?")) return;
        state.pages[state.currentPage].teams.splice(teamIndex, 1);
        save(); fullRender();
      });

      // ---- Damage input
      card.querySelector(".damage-input").addEventListener("input", function(e) {
        state.pages[state.currentPage].teams[teamIndex].damage = e.target.value;
        save();
        var costEl = card.querySelector(".cost-badge");
        if (costEl) costEl.textContent = "Cost: " + calcTeamCost(state.pages[state.currentPage].teams[teamIndex]);
      });

      // ---- Buff buttons
      var buffBtns = card.querySelectorAll(".buff-btn");
      for (var bb = 0; bb < buffBtns.length; bb++) {
        (function(btn) {
          btn.addEventListener("click", function() {
            var bid = btn.dataset.buff;
            var cur = state.pages[state.currentPage].teams[teamIndex].buff;
            state.pages[state.currentPage].teams[teamIndex].buff = (cur === bid) ? null : bid;
            save(); renderTeams();
          });
        })(buffBtns[bb]);
      }

      // ---- Slot drag/drop and click
      var slots = card.querySelectorAll(".hero-slot");
      for (var ss = 0; ss < slots.length; ss++) {
        (function(slotEl, slotIndex) {
          slotEl.addEventListener("dragover", function(e) { e.preventDefault(); slotEl.classList.add("drag-over"); });
          slotEl.addEventListener("dragleave", function() { slotEl.classList.remove("drag-over"); });
          slotEl.addEventListener("drop", function(e) {
            e.preventDefault();
            slotEl.classList.remove("drag-over");
            var heroId = e.dataTransfer.getData("heroId");
            if (!heroId || !heroAvailable(heroId)) return;
            var hero = findHero(heroId);
            if (!hero.canUseMultiple) {
              // Remove from other slots on this page
              var pg = state.pages[state.currentPage];
              for (var t2 = 0; t2 < pg.teams.length; t2++) {
                for (var s2 = 0; s2 < pg.teams[t2].heroes.length; s2++) {
                  var sl = pg.teams[t2].heroes[s2];
                  if (sl && sl.heroId === heroId) pg.teams[t2].heroes[s2] = null;
                }
              }
            }
            state.pages[state.currentPage].teams[teamIndex].heroes[slotIndex] = { heroId: heroId, seq: 0, weapon: WEAPONS[0].id };
            save(); fullRender();
          });
          slotEl.addEventListener("click", function() {
            if (slotEl.classList.contains("empty")) openPickModal(teamIndex, slotIndex);
          });
        })(slots[ss], parseInt(slots[ss].dataset.si));
      }

      // ---- Filled slot buttons
      var detailBtns = card.querySelectorAll(".slot-detail-btn");
      for (var db = 0; db < detailBtns.length; db++) {
        (function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            var ti2 = parseInt(btn.dataset.ti);
            var si2 = parseInt(btn.dataset.si);
            openHeroModal(ti2, si2, state.pages[state.currentPage].teams[ti2].heroes[si2]);
          });
        })(detailBtns[db]);
      }

      var removeBtns = card.querySelectorAll(".slot-remove-btn");
      for (var rb = 0; rb < removeBtns.length; rb++) {
        (function(btn) {
          btn.addEventListener("click", function(e) {
            e.stopPropagation();
            var ti2 = parseInt(btn.dataset.ti);
            var si2 = parseInt(btn.dataset.si);
            state.pages[state.currentPage].teams[ti2].heroes[si2] = null;
            save(); fullRender();
          });
        })(removeBtns[rb]);
      }

      grid.appendChild(card);
    })(page.teams[ti], ti);
  }
}

function buildSlotHTML(slot, ti, si) {
  if (!slot) {
    return '<div class="hero-slot empty" data-ti="' + ti + '" data-si="' + si + '">' +
             '<span class="empty-label">Drop or click</span>' +
           '</div>';
  }
  var hero = findHero(slot.heroId);
  var weapon = findWeapon(slot.weapon) || WEAPONS[0];
  var elemColor = hero ? (ELEMENT_COLORS[hero.element] || "#888") : "#888";
  var is5 = hero && hero.rarity === "5*";
  var sigTag = weapon.signature ? '<span class="sig-tag">SIG</span>' : "";

  return '<div class="hero-slot filled" data-ti="' + ti + '" data-si="' + si + '">' +
    '<div class="slot-img" style="border-color:' + (is5 ? "var(--rarity5)" : "var(--rarity4)") + '">' +
      '<img src="icons/heroes/' + slot.heroId + '.png" alt="' + escHtml(hero ? hero.name : slot.heroId) + '" ' +
           'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
      '<span class="hero-initial" style="display:none">' + (hero ? hero.name[0] : "?") + '</span>' +
    '</div>' +
    '<div class="slot-info">' +
      '<span class="slot-name">' + escHtml(hero ? hero.name : slot.heroId) + '</span>' +
      '<div class="slot-tags">' +
        '<span class="seq-tag">S' + (slot.seq || 0) + '</span>' +
        '<span class="rarity-tag ' + (is5 ? "r5" : "r4") + '">' + (hero ? hero.rarity : "") + '</span>' +
        '<span class="weapon-tag">' +
          '<img src="icons/weapons/' + slot.weapon + '.png" alt="" onerror="this.style.display=\'none\'">' +
          escHtml(weapon.name) + sigTag +
        '</span>' +
      '</div>' +
    '</div>' +
    '<div class="slot-btns">' +
      '<button class="slot-detail-btn" data-ti="' + ti + '" data-si="' + si + '" title="Edit">⚙</button>' +
      '<button class="slot-remove-btn" data-ti="' + ti + '" data-si="' + si + '" title="Remove">✕</button>' +
    '</div>' +
  '</div>';
}

// ---- HERO DETAIL MODAL -------------------------------------
function openHeroModal(ti, si, slot) {
  var hero = findHero(slot.heroId);
  var modal = document.getElementById("heroModal");
  var content = document.getElementById("modalContent");
  var elemColor = hero ? (ELEMENT_COLORS[hero.element] || "#888") : "#888";
  var is5 = hero && hero.rarity === "5*";

  // Build seq buttons
  var seqHtml = "";
  for (var n = 0; n <= 6; n++) {
    seqHtml += '<button class="seq-btn' + ((slot.seq || 0) === n ? " active" : "") + '" data-seq="' + n + '">S' + n + '</button>';
  }

  // Build weapon buttons
  var wpnHtml = "";
  for (var w = 0; w < WEAPONS.length; w++) {
    var wp = WEAPONS[w];
    wpnHtml +=
      '<button class="wpn-btn' + (slot.weapon === wp.id ? " active" : "") + (wp.signature ? " is-sig" : "") + '" data-wid="' + wp.id + '">' +
        '<img src="icons/weapons/' + wp.id + '.png" alt="" onerror="this.style.display=\'none\'">' +
        '<span>' + escHtml(wp.name) + (wp.signature ? " ★" : "") + '</span>' +
      '</button>';
  }

  content.innerHTML =
    '<div class="modal-hero-head">' +
      '<div class="modal-avatar" style="border-color:' + (is5 ? "var(--rarity5)" : "var(--rarity4)") + '">' +
        '<img src="icons/heroes/' + slot.heroId + '.png" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
        '<span class="hero-initial" style="display:none">' + (hero ? hero.name[0] : "?") + '</span>' +
      '</div>' +
      '<div>' +
        '<div class="modal-hero-name">' + escHtml(hero ? hero.name : slot.heroId) + '</div>' +
        '<div>' +
          '<span style="color:' + elemColor + ';font-size:0.85rem">' + (hero ? hero.element : "") + '</span>' +
          '<span class="rarity-tag ' + (is5 ? "r5" : "r4") + '" style="margin-left:8px">' + (hero ? hero.rarity : "") + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="field-group"><label>Sequence Level</label><div class="seq-row">' + seqHtml + '</div></div>' +
    '<div class="field-group"><label>Weapon <span style="color:var(--gold);font-size:0.72rem">(★ = Signature weapon)</span></label>' +
    '<div class="wpn-grid">' + wpnHtml + '</div></div>';

  modal.style.display = "flex";

  // Seq buttons
  var seqBtns = content.querySelectorAll(".seq-btn");
  for (var sb = 0; sb < seqBtns.length; sb++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        state.pages[state.currentPage].teams[ti].heroes[si].seq = parseInt(btn.dataset.seq);
        save();
        for (var x = 0; x < seqBtns.length; x++) seqBtns[x].classList.remove("active");
        btn.classList.add("active");
        renderTeams();
      });
    })(seqBtns[sb]);
  }

  // Weapon buttons
  var wpnBtns = content.querySelectorAll(".wpn-btn");
  for (var wb = 0; wb < wpnBtns.length; wb++) {
    (function(btn) {
      btn.addEventListener("click", function() {
        state.pages[state.currentPage].teams[ti].heroes[si].weapon = btn.dataset.wid;
        save();
        for (var x = 0; x < wpnBtns.length; x++) wpnBtns[x].classList.remove("active");
        btn.classList.add("active");
        renderTeams();
      });
    })(wpnBtns[wb]);
  }
}

document.getElementById("modalClose").addEventListener("click", function() {
  document.getElementById("heroModal").style.display = "none";
});
document.getElementById("heroModal").addEventListener("click", function(e) {
  if (e.target === e.currentTarget) e.currentTarget.style.display = "none";
});

// ---- PICK MODAL --------------------------------------------
function openPickModal(ti, si) {
  var counts = usagesOnPage();
  var grid = document.getElementById("pickGrid");
  grid.innerHTML = "";

  for (var h = 0; h < HEROES.length; h++) {
    (function(hero) {
      var used = counts[hero.id] || 0;
      var max = hero.canUseMultiple ? 2 : 1;
      var exhausted = used >= max;
      var elemColor = ELEMENT_COLORS[hero.element] || "#888";
      var is5 = hero.rarity === "5*";

      var btn = document.createElement("button");
      btn.className = "pick-btn" + (exhausted ? " exhausted" : "");
      btn.disabled = exhausted;
      btn.innerHTML =
        '<div class="hero-avatar" style="border-color:' + (is5 ? "var(--rarity5)" : "var(--rarity4)") + '">' +
          '<img src="icons/heroes/' + hero.id + '.png" alt="' + escHtml(hero.name) + '" ' +
               'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
          '<span class="hero-initial" style="display:none">' + hero.name[0] + '</span>' +
          '<span class="rarity-pip">' + hero.rarity + '</span>' +
        '</div>' +
        '<span class="pick-name">' + escHtml(hero.name) + '</span>' +
        '<span class="pick-elem" style="color:' + elemColor + '">' + hero.element + '</span>';

      btn.addEventListener("click", function() {
        if (exhausted) return;
        state.pages[state.currentPage].teams[ti].heroes[si] = { heroId: hero.id, seq: 0, weapon: WEAPONS[0].id };
        save(); fullRender();
        document.getElementById("pickModal").style.display = "none";
      });
      grid.appendChild(btn);
    })(HEROES[h]);
  }
  document.getElementById("pickModal").style.display = "flex";
}

document.getElementById("pickModalClose").addEventListener("click", function() {
  document.getElementById("pickModal").style.display = "none";
});
document.getElementById("pickModal").addEventListener("click", function(e) {
  if (e.target === e.currentTarget) e.currentTarget.style.display = "none";
});

// ---- TABS / PAGES ------------------------------------------
function renderTabs() {
  var tabs = document.getElementById("pageTabs");
  tabs.innerHTML = "";

  for (var i = 0; i < state.pages.length; i++) {
    (function(page, idx) {
      var tab = document.createElement("button");
      tab.className = "page-tab" + (idx === state.currentPage ? " active" : "");

      var nameSpan = document.createElement("span");
      nameSpan.className = "tab-name";
      nameSpan.contentEditable = "true";
      nameSpan.textContent = page.name;
      nameSpan.addEventListener("blur", function() {
        state.pages[idx].name = nameSpan.textContent.trim() || "Page";
        save();
      });
      nameSpan.addEventListener("keydown", function(e) {
        if (e.key === "Enter") { e.preventDefault(); nameSpan.blur(); }
      });

      var delBtn = document.createElement("button");
      delBtn.className = "tab-del";
      delBtn.textContent = "×";
      delBtn.addEventListener("click", function(e) {
        e.stopPropagation();
        if (state.pages.length === 1) { alert("Cannot delete the last page."); return; }
        if (!confirm("Delete this page?")) return;
        state.pages.splice(idx, 1);
        if (state.currentPage >= state.pages.length) state.currentPage = state.pages.length - 1;
        save(); fullRender();
      });

      tab.appendChild(nameSpan);
      tab.appendChild(delBtn);
      tab.addEventListener("click", function(e) {
        if (e.target === nameSpan) return;
        state.currentPage = idx;
        save(); fullRender();
      });

      tabs.appendChild(tab);
    })(state.pages[i], i);
  }

  var pageLabel = document.getElementById("pageLabel");
  if (pageLabel) pageLabel.textContent = "— " + state.pages[state.currentPage].name;
}

// ---- SORT --------------------------------------------------
document.getElementById("btnSortDamage").addEventListener("click", function() {
  var teams = state.pages[state.currentPage].teams;
  teams.sort(function(a, b) {
    return (parseFloat(b.damage) || 0) - (parseFloat(a.damage) || 0);
  });
  save(); renderTeams();
});

// ---- PDF ---------------------------------------------------
document.getElementById("btnExportPdf").addEventListener("click", function() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF library not loaded yet. Wait a moment and try again.");
    return;
  }
  var jsPDF = window.jspdf.jsPDF;
  var page = state.pages[state.currentPage];
  var pageName = page.name;

  // Sort copy lowest → highest damage
  var sorted = page.teams.slice().sort(function(a, b) {
    return (parseFloat(a.damage) || 0) - (parseFloat(b.damage) || 0);
  });

  var doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("WuWa Team Report — " + pageName, 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text("Sorted: lowest to highest damage  •  " + new Date().toLocaleDateString(), 14, 22);
  doc.setTextColor(0, 0, 0);

  var rows = [];
  for (var i = 0; i < sorted.length; i++) {
    var team = sorted[i];
    var cost = calcTeamCost(team);
    var heroLines = [];
    for (var s = 0; s < team.heroes.length; s++) {
      var slot = team.heroes[s];
      if (!slot) { heroLines.push("—"); continue; }
      var hero = findHero(slot.heroId);
      var weapon = findWeapon(slot.weapon);
      var sig = weapon && weapon.signature ? " [SIG]" : "";
      var seq = slot.seq || 0;
      heroLines.push((hero ? hero.name : slot.heroId) + " S" + seq + sig);
    }
    var buff = null;
    for (var b = 0; b < BUFFS.length; b++) if (BUFFS[b].id === team.buff) { buff = BUFFS[b]; break; }
    rows.push([
      i + 1,
      team.name,
      heroLines.join("\n"),
      cost,
      team.damage ? Number(team.damage).toLocaleString() : "—",
      buff ? buff.name : "—"
    ]);
  }

  doc.autoTable({
    startY: 28,
    head: [["#", "Team", "Heroes  (Seq · Weapon)", "Cost", "Damage", "Buff"]],
    body: rows,
    styles: { fontSize: 8, cellPadding: 3, valign: "top", lineColor: [210, 215, 225], lineWidth: 0.2 },
    headStyles: { fillColor: [18, 21, 31], textColor: [200, 169, 110], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 8,  halign: "center" },
      1: { cellWidth: 45 },
      2: { cellWidth: 95 },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 32, halign: "right" },
      5: { cellWidth: 35 }
    },
    alternateRowStyles: { fillColor: [240, 242, 250] },
    rowPageBreak: "avoid"
  });

  var total = doc.internal.getNumberOfPages();
  for (var p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("Page " + p + " / " + total, doc.internal.pageSize.getWidth() - 22, doc.internal.pageSize.getHeight() - 6);
  }

  doc.save("wuwa_" + pageName.replace(/\s+/g, "_") + "_report.pdf");
});

// ---- HEADER BUTTONS ----------------------------------------
document.getElementById("btnNewPage").addEventListener("click", function() {
  state.pages.push({ id: uid(), name: "Page " + (state.pages.length + 1), teams: [] });
  state.currentPage = state.pages.length - 1;
  save(); fullRender();
});

document.getElementById("btnAddTeam").addEventListener("click", function() {
  state.pages[state.currentPage].teams.push(defaultTeam());
  save(); fullRender();
});

document.getElementById("btnExportJson").addEventListener("click", function() {
  var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "wuwa_teams.json";
  a.click();
});

document.getElementById("btnImport").addEventListener("click", function() {
  document.getElementById("importFile").click();
});

document.getElementById("importFile").addEventListener("change", function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var imported = JSON.parse(ev.target.result);
      if (!imported.pages) throw new Error("Invalid format — missing pages.");
      state = imported;
      save(); fullRender();
      alert("Imported successfully!");
    } catch(err) {
      alert("Import failed: " + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

// ---- FULL RENDER -------------------------------------------
function fullRender() {
  renderTabs();
  renderElementFilters();
  renderPool();
  renderTeams();
}

// ---- INIT --------------------------------------------------
load();
if (state.currentPage >= state.pages.length) state.currentPage = 0;
fullRender();
