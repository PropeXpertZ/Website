// ================= GLOBAL LOADERS (Header & Footer) =================
document.addEventListener("DOMContentLoaded", () => {
    const mainEl = document.querySelector("main") || document.getElementById("page") || document.body;
    if (mainEl && !mainEl.id) mainEl.id = "main";
    if (mainEl) { try { mainEl.setAttribute("tabindex", "-1"); } catch(e) {} }
    // 1. Load Header
    const headerPlaceholder = document.getElementById("header-placeholder");
    if (headerPlaceholder) {
        fetch("header.html")
            .then(response => response.text())
            .then(data => {
                headerPlaceholder.innerHTML = data;
                console.log("Header loaded successfully");
                initHeaderDropdown();
                const navLinks = headerPlaceholder.querySelectorAll('nav a');
                const cur = window.location.pathname.split('/').pop();
                navLinks.forEach(a => {
                    const href = a.getAttribute('href') || '';
                    const base = href.split('/').pop();
                    if (base === cur) a.classList.add('active');
                });
                const headerEl = headerPlaceholder.querySelector('header');
                const burger = headerPlaceholder.querySelector('.hamburger');
                if (headerEl && burger) {
                    burger.addEventListener('click', () => {
                        const open = headerEl.classList.toggle('open');
                        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
                        burger.classList.toggle('active', open);
                    });
                    document.addEventListener('click', (e) => {
                        if (!headerEl.contains(e.target)) {
                            headerEl.classList.remove('open');
                            burger.setAttribute('aria-expanded', 'false');
                            burger.classList.remove('active');
                        }
                    });
                }
            })
            .catch(err => console.error("Error loading header:", err));
    }

    // 2. Load Footer & Init Visitor Counter
    const footerPlaceholder = document.getElementById("footer-placeholder");
    if (footerPlaceholder) {
        fetch("footer.html")
            .then(response => response.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
                console.log("Footer loaded successfully");
                
                // === CALL VISITOR LOGIC HERE AFTER FOOTER LOADS ===
                updateVisitorCount(); 
            })
            .catch(err => console.error("Error loading footer:", err));
    }

  // 3. Load Loan Contact Form dynamically
  const loanContactPlaceholder = document.getElementById("loan-contact-placeholder");
  if (loanContactPlaceholder) {
    fetch("loan-contact-form.html")
      .then(r => r.text())
      .then(html => {
        loanContactPlaceholder.innerHTML = html;
      })
      .catch(err => console.error("Error loading loan contact form:", err));
  }
  initServicesReveal();
  const bankTrack = document.getElementById('bankTrack');
  if (bankTrack) initManualCarousel('bankTrack');
});

// =========================
// 1. UTILITIES & TABS
// =========================

// --- NEW: PAGE VISITOR LOGIC ---
function updateVisitorCount() {
    const countElement = document.getElementById("visitor-count");
    
    // Safety check: ensure element exists
    if (!countElement) return; 

    let currentCount = parseInt(localStorage.getItem("pageVisitorCount") || '12528', 10);
    const ref = document.referrer || '';
    let sameOrigin = false;
    try {
      if (ref) sameOrigin = new URL(ref).origin === window.location.origin;
    } catch(e) { sameOrigin = false; }
    const sessionIncr = sessionStorage.getItem('px_visit_incr') === '1';
    const shouldIncrement = !sameOrigin && !sessionIncr;

    if (shouldIncrement) {
      currentCount += 1;
      try { sessionStorage.setItem('px_visit_incr', '1'); } catch(e) {}
      try { localStorage.setItem("pageVisitorCount", String(currentCount)); } catch(e) {}
    } else {
      // Ensure baseline is stored so it doesn't reset between pages
      if (!localStorage.getItem("pageVisitorCount")) {
        try { localStorage.setItem("pageVisitorCount", String(currentCount)); } catch(e) {}
      }
    }

    // Update text with comma formatting (e.g. 12,529)
    countElement.innerText = currentCount.toLocaleString();
}

function initHeaderDropdown() {
    const dd = document.querySelector('.dropdown');
    if (!dd) return;
    const btn = dd.querySelector('.dropbtn');
    const content = dd.querySelector('.dropdown-content');
    if (!btn || !content) return;
    const isMobile = () => window.matchMedia('(max-width: 900px)').matches;
    function toggle(e) {
        if (!isMobile()) return;
        e.preventDefault();
        dd.classList.toggle('open');
    }
    btn.addEventListener('click', toggle);
    document.addEventListener('click', (e) => {
        if (!isMobile()) return;
        if (!dd.contains(e.target)) dd.classList.remove('open');
    });
}

function initManualCarousel(trackId) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const container = track.parentElement;
  const prev = container.querySelector('.carousel-prev');
  const next = container.querySelector('.carousel-next');
  let index = 0;
  const gap = 24; // Updated gap to match CSS
  
  function cardWidth() {
    const card = track.querySelector('.bank-card');
    return (card ? card.getBoundingClientRect().width : 0) + gap;
  }
  
  function perView() {
    const cw = cardWidth();
    if (!cw || cw === gap) return 3;
    return Math.max(1, Math.round(container.clientWidth / cw));
  }
  
  function maxIndex() {
    const count = track.children.length;
    return Math.max(0, count - perView());
  }
  
  function render() {
    const x = -index * cardWidth();
    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.transform = `translateX(${x}px)`;
  }
  
  function go(delta) {
    const max = maxIndex();
    index += delta;
    
    if (index > max) {
      index = 0; // Loop to start
    } else if (index < 0) {
      index = max; // Loop to end
    }
    
    render();
  }
  
  if (prev) prev.addEventListener('click', () => go(-1));
  if (next) next.addEventListener('click', () => go(1));
  
  // Touch support
  let startX = 0;
  container.addEventListener('touchstart', (e) => startX = e.touches[0].clientX);
  container.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    if (startX - endX > 50) go(1);
    else if (endX - startX > 50) go(-1);
  });

  window.addEventListener('resize', () => {
    index = Math.min(index, maxIndex());
    render();
  });
  
  render();
}
 
 
function initServicesReveal() {
  const sec = document.querySelector('.services-section');
  if (!sec) return;
  const items = Array.from(sec.querySelectorAll('.services-item'));
  if (!items.length) return;
  let revealed = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && !revealed) {
        revealed = true;
        items.forEach((el, i) => setTimeout(() => el.classList.add('enter'), i * 70));
        io.disconnect();
      }
    });
  }, { threshold: 0.2 });
  io.observe(sec);
}
 
 
function openTab(i) {
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const panels = Array.from(document.querySelectorAll('.tab-content'));
    tabs.forEach((t, x) => {
        const sel = x === i;
        t.classList.toggle('active', sel);
        t.setAttribute('aria-selected', sel ? 'true' : 'false');
        t.setAttribute('tabindex', sel ? '0' : '-1');
    });
    panels.forEach((c, x) => {
        const sel = x === i;
        c.classList.toggle('active', sel);
        c.setAttribute('aria-hidden', sel ? 'false' : 'true');
    });
    if (i === 0) calculateEmi();
    else if (i === 1) calculateEligibility();
    else if (i === 2) calculateSwitch();
    else if (i === 3) calculatePrepayment();
    else if (i === 4) calculateRateImpact();
    else if (i === 5) calculateRepayment(false);
}

function initTabs() {
    const tabsWrap = document.querySelector('.tabs');
    if (!tabsWrap) return;
    tabsWrap.setAttribute('role', 'tablist');
    const tabs = Array.from(tabsWrap.querySelectorAll('.tab'));
    const panels = Array.from(document.querySelectorAll('.tab-content'));
    tabs.forEach((t, i) => {
        t.setAttribute('role', 'tab');
        t.id = t.id || `tab-${i}`;
        t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
        t.setAttribute('tabindex', t.classList.contains('active') ? '0' : '-1');
        const panel = panels[i];
        if (panel) {
            panel.id = panel.id || `panel-${i}`;
            panel.setAttribute('role', 'tabpanel');
            panel.setAttribute('aria-labelledby', t.id);
            panel.setAttribute('aria-hidden', panel.classList.contains('active') ? 'false' : 'true');
        }
        t.addEventListener('keydown', (e) => {
            const key = e.key;
            let idx = tabs.indexOf(document.activeElement);
            if (key === 'ArrowRight') { e.preventDefault(); const ni = Math.min(idx + 1, tabs.length - 1); tabs[ni].focus(); openTab(ni); }
            else if (key === 'ArrowLeft') { e.preventDefault(); const ni = Math.max(idx - 1, 0); tabs[ni].focus(); openTab(ni); }
            else if (key === 'Home') { e.preventDefault(); tabs[0].focus(); openTab(0); }
            else if (key === 'End') { e.preventDefault(); tabs[tabs.length - 1].focus(); openTab(tabs.length - 1); }
            else if (key === 'Enter' || key === ' ') { e.preventDefault(); openTab(idx); }
        });
    });
}

// Number to Words (Indian System)
function numberToWordsIndian(num) {
    if (!num || num <= 0) return "";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function convert(n) {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
        return "";
    }
    let n = Math.floor(num);
    let res = "";
    if (n >= 10000000) { res += convert(Math.floor(n / 10000000)) + " Crore "; n %= 10000000; }
    if (n >= 100000) { res += convert(Math.floor(n / 100000)) + " Lakh "; n %= 100000; }
    if (n >= 1000) { res += convert(Math.floor(n / 1000)) + " Thousand "; n %= 1000; }
    if (n > 0) res += convert(n);
    return res.trim() + " Rupees Only";
}

function updateWords(inputId, outputId) {
    const el = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    if(el && output) output.innerText = numberToWordsIndian(el.value);
}

// Form Validation
function validateMobile() {
    const input = document.getElementById('mobileInput');
    const errorMsg = document.getElementById('mobileError');
    if(!input) return;
    const val = input.value.toString();
    if (val.length > 0 && val.length < 10) {
        if(errorMsg) errorMsg.style.display = 'block';
    } else {
        if(errorMsg) errorMsg.style.display = 'none';
    }
}

function togglePropertyLogic() {
    const yesRadio = document.querySelector('input[name="final"][value="yes"]');
    if(!yesRadio) return;
    const isYes = yesRadio.checked;
    const tokenQ = document.getElementById('tokenQuestion');
    const planningQ = document.getElementById('planningQuestion');
    if(tokenQ && planningQ) {
        tokenQ.style.display = isYes ? 'block' : 'none';
        planningQ.style.display = isYes ? 'none' : 'block';
    }
}
function initSimpleSearch() {
    const input = document.getElementById('simpleSearchInput');
    const btn = document.getElementById('simpleSearchGo');
    const qBtns = document.querySelectorAll('.quick-buttons button');
  const tiles = document.querySelectorAll('.search-actions .search-tile');
  const home = document.body.classList.contains('home');
    const routes = [
        { keys: ['apartment','apartments','flat','flats'], url: 'apartments.html' },
        { keys: ['villa','villas'], url: 'villas.html' },
        { keys: ['plot','plots','open plots','land','lands'], url: 'open-plots.html' },
        { keys: ['commercial','shop','office'], url: 'commercial.html' },
        { keys: ['farm','farm house'], url: 'farm-house.html' },
        { keys: ['emi','loan','calculator'], url: 'loan-calculator-tools.html?calc=emi' },
    ];
    function resolve(q) {
        const s = (q || '').toLowerCase();
        for (const r of routes) {
            if (r.keys.some(k => s.includes(k))) return r.url;
        }
        return 'apartments.html';
    }
  function applyTypeFilter(type) {
    const sel = document.getElementById('msType');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.value === type);
      if (opt) sel.value = type;
    }
    const cards = document.querySelectorAll('#propTrack .card.elite-item, #featuredTrack .card.elite-item');
    cards.forEach(c => {
      const t = c.dataset.type;
      const show = !type || !t || t === type;
      c.style.display = show ? '' : 'none';
    });
    const ms = document.querySelector('.mega-search');
    if (ms) ms.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
    function go() {
        const q = input ? input.value : '';
        const typeSel = document.getElementById('msType');
        const byType = typeSel && typeSel.value;
        const direct = {
            'apartments': 'apartments.html',
            'villas': 'villas.html',
            'open-plots': 'open-plots.html',
            'commercial': 'commercial.html',
            'farm-house': 'farm-house.html'
        };
        if (home) {
          if (byType) { applyTypeFilter(byType); return; }
          const url = resolve(q);
          const type = decodeURIComponent(url.replace('.html',''));
          applyTypeFilter(type);
          return;
        }
        if (byType && direct[byType]) { window.location.href = direct[byType]; return; }
        window.location.href = resolve(q);
    }
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); go(); });
    if (input) {
        if (!input.placeholder) input.placeholder = 'Search apartments, villas, plots or EMI';
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    }
    qBtns.forEach(b => {
        b.addEventListener('click', (e) => {
            const url = b.getAttribute('data-go');
            if (!url) return;
            window.location.href = url;
        });
    });
  tiles.forEach(b => {
    b.addEventListener('click', () => {
      const url = b.getAttribute('data-go');
      if (!url) return;
      window.location.href = url;
    });
  });
  const gridLinks = document.querySelectorAll('#propTrack a.card.elite-item, #featuredTrack a.card.elite-item');
  gridLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      const t = a.dataset.type;
      const go = a.dataset.go;
      if (!home) return;
      if (go) { e.preventDefault(); window.location.href = go; return; }
      if (t) { e.preventDefault(); e.stopPropagation(); applyTypeFilter(t); }
    });
  });
}

// =========================
// 2. CIRCULAR CAROUSEL (Infinite Loop)
// =========================
function initSlider() { /* disabled auto-move for bankTrack */ }

// =========================
// 3. CALCULATOR LOGIC
// =========================
function getEMI(p, r, n_yrs) {
    if (r === 0) return p / (n_yrs * 12);
    let mr = r / 12 / 100;
    let months = n_yrs * 12;
    return p * mr * Math.pow(1 + mr, months) / (Math.pow(1 + mr, months) - 1);
}

function clampNum(x, min = 0, max = Number.MAX_SAFE_INTEGER) {
    const n = parseFloat(x);
    if (isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
}
function clampYears(y) { return clampNum(y, 0, 50); }
function clampRate(r) { return clampNum(r, 0, 30); }
function clampMonths(m, max) { return Math.round(Math.min(Math.max(parseInt(m) || 0, 0), Math.round(max))); }

function fmt(val) { return '₹' + Math.round(Math.abs(val || 0)).toLocaleString('en-IN'); }

function calculateEmi() {
    const loanAmt = document.getElementById('loanAmt');
    if(!loanAmt) return;

    const p = clampNum(loanAmt.value, 0);
    const rate = clampRate(document.getElementById('loanRate').value);
    const tenure = clampYears(document.getElementById('loanTenure').value);
    const emi = getEMI(p, rate, tenure);
    const total = emi * tenure * 12;
    const interest = total - p;
    document.getElementById('emiValue').innerText = fmt(emi);
    document.getElementById('pText').innerText = fmt(p);
    document.getElementById('iText').innerText = fmt(interest);
    
    const circ = 2 * Math.PI * 75;
    const pPct = total > 0 ? p / total : 0;
    const pDash = pPct * circ;
    const pArc = document.getElementById('pArc');
    const iArc = document.getElementById('iArc');
    
    if(pArc && iArc) {
        pArc.style.strokeDasharray = `${pDash} ${circ}`;
        iArc.style.strokeDasharray = `${(1 - pPct) * circ} ${circ}`;
        iArc.style.strokeDashoffset = `-${pDash}`;
    }
}

function calculateEligibility() {
    if(!document.getElementById('income')) return;
    const inc = clampNum(document.getElementById('income').value, 0);
    const ex = clampNum(document.getElementById('existing').value, 0);
    const r = clampRate(document.getElementById('eligRate').value) / 12 / 100;
    const n = clampYears(document.getElementById('eligTenure').value) * 12;
    const maxEmi = Math.max(0, (inc * 0.5) - ex);
    if (maxEmi > 0 && r > 0) {
        const loan = maxEmi * (1 - Math.pow(1 + r, -n)) / r;
        document.getElementById('eligEmi').innerText = fmt(maxEmi);
        document.getElementById('eligAmt').innerText = '₹' + (loan / 100000).toFixed(2) + ' Lac';
    } else {
        document.getElementById('eligEmi').innerText = "₹0";
        document.getElementById('eligAmt').innerText = "₹0 Lac";
    }
}

function calculateSwitch() {
    if(!document.getElementById('csLoan')) return;
    const p = clampNum(document.getElementById('csLoan').value, 0);
    const tenure = clampYears(document.getElementById('csTenure').value);
    const paid = clampMonths(document.getElementById('csPaid').value, tenure * 12);
    const r1 = clampRate(document.getElementById('csRate').value);
    const nsFeePct = clampNum(document.getElementById('nsFee').value, 0, 100);
    const nsTenure = clampYears(document.getElementById('nsTenure').value);
    const r2 = clampRate(document.getElementById('nsRate').value);
    
    const mr1 = r1/12/100;
    const emi1 = getEMI(p, r1, tenure);
    let balance = p;
    for(let i=1; i<=paid; i++) balance -= (emi1 - (balance * mr1));
    const outstanding = balance;
    const currentIntRemaining = (emi1 * (tenure*12 - paid)) - outstanding;
    const procFee = (outstanding * nsFeePct) / 100;
    const emi2 = getEMI(outstanding, r2, nsTenure);
    const newIntTotal = (emi2 * nsTenure * 12) - outstanding;
    const saving = currentIntRemaining - newIntTotal - procFee;

    document.getElementById('switchSaving').innerText = fmt(saving);
    document.getElementById('switchOutP').innerText = fmt(outstanding);
    document.getElementById('switchCurInt').innerText = fmt(currentIntRemaining);
    document.getElementById('switchNewInt').innerText = fmt(newIntTotal);
    document.getElementById('switchNewEmi').innerText = fmt(emi2);
}

function calculatePrepayment() {
    if(!document.getElementById('ppLoan')) return;
    const loan = clampNum(document.getElementById('ppLoan').value, 0);
    const paidMonths = clampMonths(document.getElementById('ppPaid').value, 600);
    const remMonths = clampMonths(document.getElementById('ppTenure').value, 600);
    const rate = clampRate(document.getElementById('ppRate').value);
    const ppAmt = clampNum(document.getElementById('ppAmt').value, 0, loan);
    
    const mr = rate/12/100;
    const emi = getEMI(loan, rate, (paidMonths + remMonths)/12);
    let balance = loan;
    for(let i=1; i<=paidMonths; i++) balance -= (emi - (balance * mr));
    const currentInterestRem = (emi * remMonths) - balance;
    
    const newBalance = Math.max(0, balance - ppAmt);
    let newMonths = 0;
    if(newBalance > 0 && emi > (newBalance * mr)) {
        newMonths = Math.log(emi / (emi - newBalance * mr)) / Math.log(1 + mr);
    }
    const newInterestTotal = (emi * newMonths) - newBalance;
    const totalSaving = currentInterestRem - newInterestTotal;

    document.getElementById('ppSaved').innerText = fmt(totalSaving);
    document.getElementById('ppCurInt').innerText = fmt(currentInterestRem);
    document.getElementById('ppNewInt').innerText = fmt(newInterestTotal);
    document.getElementById('ppCurTen').innerText = (remMonths/12).toFixed(1) + " yrs";
    document.getElementById('ppNewTen').innerText = (newMonths/12).toFixed(1) + " yrs";
    document.getElementById('ppCurPay').innerText = fmt(balance + currentInterestRem);
    document.getElementById('ppNewPay').innerText = fmt(newBalance + newInterestTotal);
}

function calculateRateImpact() {
    if(!document.getElementById('riLoan')) return;
    const p = clampNum(document.getElementById('riLoan').value, 0);
    const n = clampYears(document.getElementById('riTenure').value);
    const r1 = clampRate(document.getElementById('riOldRate').value);
    const r2 = clampRate(document.getElementById('riNewRate').value);
    
    const emi1 = getEMI(p, r1, n);
    const emi2 = getEMI(p, r2, n);
    const totalSaving = (emi1 - emi2) * (n * 12);
    
    document.getElementById('riTotalSave').innerText = fmt(totalSaving);
    document.getElementById('riCurEmi').innerText = fmt(emi1);
    document.getElementById('riNewEmi').innerText = fmt(emi2);
    
    const mr2 = r2 / 12 / 100;
    if (r2 < r1 && emi1 > (p * mr2)) {
        const newMonths = Math.log(emi1 / (emi1 - p * mr2)) / Math.log(1 + mr2);
        document.getElementById('riTenureSave').innerText = Math.round((n * 12) - newMonths) + " Months";
        document.getElementById('riCurTen').innerText = n + " yrs";
        document.getElementById('riNewTen').innerText = (newMonths/12).toFixed(1) + " yrs";
    } else {
        document.getElementById('riTenureSave').innerText = "0 Months";
    }
}

// UPDATED: calculateRepayment with Scroll Flag
function calculateRepayment(shouldScroll = false) {
    if(!document.getElementById('rcLoan')) return;
    const p = clampNum(document.getElementById('rcLoan').value, 0);
    const n = clampYears(document.getElementById('rcTenure').value);
    const r = clampRate(document.getElementById('rcRate').value);
    const paid = clampMonths(document.getElementById('rcPaid').value, n * 12);
    
    const emi = getEMI(p, r, n);
    const mr = r / 12 / 100;
    
    let balance = p, pPaid = 0, iPaid = 0, rows = "";
    for(let i=1; i<= (n * 12); i++) {
        let iPart = balance * mr;
        let pPart = emi - iPart;
        if(i <= paid) { pPaid += pPart; iPaid += iPart; }
        balance -= pPart;
        
        const highlightClass = (i === paid) ? 'class="highlight-row"' : '';
        rows += `<tr ${highlightClass}><td>${i}</td><td>${fmt(pPart)}</td><td>${fmt(iPart)}</td><td>${fmt(emi)}</td><td>${fmt(Math.max(0, balance))}</td></tr>`;
    }
    
    document.getElementById('rcPPaid').innerText = fmt(pPaid);
    document.getElementById('rcPOut').innerText = fmt(p - pPaid);
    document.getElementById('rcIPaid').innerText = fmt(iPaid);
    const totalInt = (emi * n * 12) - p;
    document.getElementById('rcIOut').innerText = fmt(totalInt - iPaid);
    document.getElementById('rcEmiVal').innerText = fmt(emi);
    document.getElementById('rcTotP').innerText = fmt(p);
    document.getElementById('rcTotI').innerText = fmt(totalInt);
  document.getElementById('amortBody').innerHTML = rows;
    const amort = document.querySelector('.table-container');
    if (amort && shouldScroll) {
        amort.hidden = false;
        amort.classList.remove('hidden');
    }
    
    // Only scroll if requested (usually for the installment box or button)
    if(shouldScroll) {
        const hlRow = document.querySelector('.highlight-row');
        if(hlRow) hlRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else if (amort) amort.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    const loanInput = document.getElementById('rcLoan');
    const calcBox = loanInput ? loanInput.closest('.calc-box') : null;
    const rightCol = calcBox ? calcBox.querySelector('.calc-right') : null;
    const chartWrap = document.getElementById('rcChartWrap');
    if (chartWrap && rightCol) {
        const legend = rightCol.querySelector('.legend');
        chartWrap.remove();
        if (legend && legend.querySelector('#rcPText')) legend.remove();
    }
}

// =========================
// 4. INITIALIZATION
// =========================
function arrangeLoanSwitchRows() {
    const getGroup = (id) => document.getElementById(id)?.closest('.calc-group') || null;
    const csLoanGroup = getGroup('csLoan');
    const csPaidGroup = getGroup('csPaid');
    const csTenureGroup = getGroup('csTenure');
    const csRateGroup = getGroup('csRate');
    const nsFeeGroup = getGroup('nsFee');
    const nsTenureGroup = getGroup('nsTenure');
    const nsRateGroup = getGroup('nsRate');
    if (!csLoanGroup) return;
    const left = csLoanGroup.closest('.calc-left');
    if (!left || left.dataset.arranged === '1') return;
    left.querySelectorAll('hr').forEach(hr => hr.style.display = 'none');
    left.querySelectorAll('h3').forEach(h => {
        if ((h.textContent || '').toLowerCase().includes('new loan details')) h.style.display = 'none';
    });
    const pairGrid = document.createElement('div');
    pairGrid.className = 'switch-grid';
    const makeRow = (a, b) => {
        if (!a || !b) return null;
        const row = document.createElement('div');
        row.className = 'calc-row';
        row.appendChild(a);
        row.appendChild(b);
        return row;
    };
    const rows = [
        makeRow(csPaidGroup, nsFeeGroup),
        makeRow(csTenureGroup, nsTenureGroup),
        makeRow(csRateGroup, nsRateGroup),
    ].filter(Boolean);
    if (!rows.length) return;
    rows.forEach(r => pairGrid.appendChild(r));
    const insertAfter = (ref, node) => { ref.parentNode.insertBefore(node, ref.nextSibling); };
    insertAfter(csLoanGroup, pairGrid);
    left.dataset.arranged = '1';
}

function arrangePrepaymentRows() {
    const makeRow = (groups, insertBeforeEl) => {
        const valid = groups.every(g => g && g.parentElement);
        if (!valid) return null;
        const row = document.createElement('div');
        row.className = 'calc-row';
        const parent = insertBeforeEl ? insertBeforeEl.parentElement : groups[0].parentElement;
        if (!parent) return null;
        parent.insertBefore(row, insertBeforeEl || groups[0]);
        groups.forEach(g => row.appendChild(g));
        return row;
    };
    const ppPaidGroup = document.getElementById('ppPaid')?.closest('.calc-group');
    const ppRateGroup = document.getElementById('ppRate')?.closest('.calc-group');
    if (ppPaidGroup && ppRateGroup) {
        const alreadyInRow = !!ppPaidGroup.closest('.calc-row') || !!ppRateGroup.closest('.calc-row');
        if (!alreadyInRow) makeRow([ppPaidGroup, ppRateGroup], ppPaidGroup);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const pairs = [
        ['heroLoanAmt', 'heroWords'],
        ['loanAmt','amountWords'], 
        ['income','incomeWords'], 
        ['csLoan','csWords'], 
        ['ppLoan','ppWords'], 
        ['ppAmt','ppAmtWords'], 
        ['riLoan','riWords'], 
        ['rcLoan','rcWords']
    ];
    pairs.forEach(p => updateWords(p[0], p[1]));
    
    // Init Sliders
    initSlider();
    initTabs();
    arrangeLoanSwitchRows();
    arrangePrepaymentRows();
    initReveal();
    initHeroParallax();

    // Run all calculators once (Safely)
    calculateEmi(); 
    calculateEligibility(); 
    calculateSwitch(); 
    calculatePrepayment(); 
    calculateRateImpact(); 
    calculateRepayment(false); // Do not scroll on load
    
    // Init form
    togglePropertyLogic(); 
    initSimpleSearch();
    prefillFromQuery();
    pruneMissingPartnerLogos();
    
    initAutoTrack('propTrack');
    initAutoTrack('loanTrack');
    /* bankTrack now manual with arrows */
    initAutoTrack('featuredTrack');
    initAutoTrack('customerTrack');
    initChatBot();
    const pageTrack = document.getElementById('pageTrack');
    if (pageTrack) initAutoTrack('pageTrack');
    const amortInit = document.querySelector('.table-container');
    const calcParam = new URLSearchParams(window.location.search).get('calc');
    if (amortInit && !(calcParam === 'repayment' || calcParam === 'amortization')) {
        amortInit.hidden = true;
        amortInit.classList.add('hidden');
    }
    
    // Offers page: init loan amount meter beside contact form
    (function initOfferMeter(){
      const slider = document.getElementById('loanRange');
      const box = document.getElementById('offerLoanAmt');
      const goBtn = document.querySelector('.get-started-btn');
      if (!slider || !box) return;
      const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
      const updateView = (val) => {
        val = clamp(parseInt(val || '0', 10), 1000000, 50000000);
        slider.value = val;
        try { box.value = val.toLocaleString('en-IN'); } catch(e) { box.value = String(val); }
      };
      const onSlider = (e) => updateView(e.target.value);
      const onManual = (e) => {
        let v = parseInt(String(e.target.value || '').replace(/,/g,''), 10);
        if (isNaN(v)) v = 1000000;
        updateView(v);
      };
      const adjust = (delta) => {
        let current = parseInt(String(box.value || '').replace(/,/g,''), 10);
        if (isNaN(current)) current = 1000000;
        updateView(current + delta);
      };
      slider.addEventListener('input', onSlider);
      box.addEventListener('change', onManual);
      const decBtn = document.querySelector('.inc-btn.dec');
      const incBtn = document.querySelector('.inc-btn.inc');
      if (decBtn) decBtn.addEventListener('click', () => adjust(-100000));
      if (incBtn) incBtn.addEventListener('click', () => adjust(100000));
      updateView(5000000);
      if (goBtn) {
        goBtn.addEventListener('click', () => {
          let current = parseInt(String(box.value || '').replace(/,/g,''), 10);
          if (isNaN(current)) current = 5000000;
          current = clamp(current, 1000000, 50000000);
          const url = `loan-calculator-tools.html?calc=emi&loanAmt=${current}`;
          window.location.href = url;
        });
      }
    })();
});

function initReveal() {
  const els = Array.from(document.querySelectorAll('.section, .offers-section, .partners-list-section, .hero, .hero-section, .search-panel, .tool-heading-container, .calc-box, .table-container'));
  els.forEach(el => el.classList.add('reveal'));
  const show = (el) => el.classList.add('reveal-visible');
  try {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) show(e.target); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    els.forEach(el => io.observe(el));
  } catch(e) {
    els.forEach(show);
  }
}

function initHeroParallax() {
  const heroContent = document.querySelector('.hero .hero-content') || document.querySelector('.hero-section .hero-container');
  if (!heroContent) return;
  const apply = () => {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { heroContent.style.transform = ''; return; }
    const y = Math.max(0, Math.min(window.scrollY, 300));
    const t = Math.round(y * 0.06);
    heroContent.style.transform = `translateY(${t}px)`;
  };
  apply();
  window.addEventListener('scroll', apply, { passive: true });
  window.addEventListener('resize', apply);
}
// ================= Contact Form =================

function handleSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const btn = form.querySelector('button');
  let isValid = true;

  document.querySelectorAll('.error').forEach(el => el.textContent = '');

  const name = form.name.value.trim();
  const email = form.email.value;
  const phone = form.phone.value.trim();
  const prefix = form.querySelector('.prefix-select') ? form.querySelector('.prefix-select').value : '+91';
  const cc = String(prefix).replace(/\D/g, '');
  const phoneDigits = String(phone).replace(/\D/g, '');
  const phoneFull = `${cc}${phoneDigits}`;
  const interest = form.interest.value;
  const budget = form.budget.value;
  const locality = form.locality.value;
  const message = form.message.value.trim();
  const honeypot = form.honeypot.value;

  if (honeypot) return;

  if (!name) { document.getElementById('nameError').textContent = 'Name is required.'; isValid = false; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { document.getElementById('emailError').textContent = 'Valid email required.'; isValid = false; }
  if (!/^\d{10}$/.test(phone)) { document.getElementById('phoneError').textContent = 'Valid 10-digit phone required.'; isValid = false; }
  if (!interest) { document.getElementById('interestError').textContent = 'Please select interest.'; isValid = false; }
  const budgetEl = form.querySelector('select[name="budget"]');
  if (!budget) { budgetEl && budgetEl.setCustomValidity('Please select budget'); budgetEl && budgetEl.reportValidity(); isValid = false; } else { budgetEl && budgetEl.setCustomValidity(''); }
  const localityEl = form.querySelector('select[name="locality"]');
  if (!locality) { localityEl && localityEl.setCustomValidity('Please select locality'); localityEl && localityEl.reportValidity(); isValid = false; } else { localityEl && localityEl.setCustomValidity(''); }
  if (!message) { document.getElementById('messageError').textContent = 'Message is required.'; isValid = false; }

  if (!isValid) return;

  btn.disabled = true;
  btn.textContent = 'Submitting...';

  // Replace with your deployed Apps Script web app URL
  const SCRIPT_ENDPOINT = window.SCRIPT_ENDPOINT || 'https://script.google.com/macros/s/AKfycby8sVY6Q0G0Sm71KU3qbd_gJIwUIjNR0XdaJoiXia0gX1P5WmWerbNJyIz94gP124Fu7g/exec';
 
  const payload = { name, email, phone: phoneFull, interest, budget, locality, message };
  const submitJson = () => fetch(SCRIPT_ENDPOINT, { method: 'POST', mode: 'cors', body: JSON.stringify(payload) });
  const submitForm = () => fetch(SCRIPT_ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) });
  const handleRes = async (res) => {
    let ok = false;
    try {
      const j = await res.json();
      ok = j && j.status === 'success';
    } catch (e) {
      ok = res && (res.type === 'opaque' || res.status === 0 || res.status === 200);
    }
    if (!ok) throw new Error('Rejected');
  };
  submitJson()
    .then(handleRes)
    .catch(() => submitForm().then(handleRes))
    .then(() => {
      document.getElementById('contactSection').style.display = 'none';
      document.getElementById('successScreen').style.display = 'block';
      window.scrollTo(0, 0);
      if (window.PXChat && typeof window.PXChat.promptReview === 'function') {
        window.PXChat.promptReview();
      }
    })
    .catch(() => {
      alert('Submission failed. Please try again.');
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = 'Submit Enquiry';
      form.reset();
    });
}

function resetForm() {
  document.getElementById('successScreen').style.display = 'none';
  document.getElementById('contactSection').style.display = 'block';
  window.scrollTo(0, 0);
}

// Independent Carousel Logic
const autoTracks = {};

function initAutoTrack(trackId) {
    const track = document.getElementById(trackId);
    if (!track || !track.parentElement) return;
    const card = track.querySelector('.card, .bank-card, .carousel-item, .logo-card');
    if (!card) return;
    track.style.transition = 'none';
    if (track.dataset.driftClone !== '1') {
        const children = Array.from(track.children);
        children.forEach(ch => track.appendChild(ch.cloneNode(true)));
        track.dataset.driftClone = '1';
    }
    function compute() {
        const container = track.parentElement;
        autoTracks[trackId] = autoTracks[trackId] || {};
        const state = autoTracks[trackId];
        state.containerWidth = container.clientWidth;
        state.loopWidth = Math.max(0, Math.round(track.scrollWidth / 2)); // original width before cloning
        state.pointerRange = Math.max(0, state.loopWidth - state.containerWidth);
        state.paused = state.paused || false;
        state.offset = Math.min(state.offset || 0, state.pointerRange);
        state.speed = parseFloat(track.dataset.speed || state.speed || 12);
        state.reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // No overrides; honor reduced motion for all tracks
        if (state.reduceMotion) state.paused = true;
    }
    compute();
    const state = autoTracks[trackId];
    function apply() {
        track.style.transform = `translateX(-${state.offset}px)`;
    }
    function loop(ts) {
        if (!state.lastTs) state.lastTs = ts;
        const dt = (ts - state.lastTs) / 1000;
        state.lastTs = ts;
        if (!state.paused) {
            state.offset += state.speed * dt;
            if (state.loopWidth > 0) {
                if (state.offset > state.loopWidth) state.offset = state.offset - state.loopWidth;
            } else {
                state.offset = 0;
            }
            apply();
        }
        state.rafId = requestAnimationFrame(loop);
    }
    if (state.rafId) cancelAnimationFrame(state.rafId);
    state.rafId = requestAnimationFrame(loop);
    const container = track.parentElement;
    if (trackId !== 'customerTrack') {
      container.addEventListener('mouseenter', () => { state.paused = true; });
      container.addEventListener('mouseleave', () => { state.paused = false; });
      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        state.offset = Math.round(ratio * state.pointerRange);
        apply();
      });
    }
    container.addEventListener('click', (e) => {
        const link = e.target.closest('a[href]');
        if (!link) return;
        const go = link.getAttribute('data-go');
        const href = link.getAttribute('href');
        const target = go || href;
        if (!target || target === '#') { e.preventDefault(); return; }
        e.preventDefault();
        window.location.href = target;
    });
    window.addEventListener('resize', () => { compute(); apply(); });
    document.addEventListener('visibilitychange', () => {
        state.paused = document.hidden || state.reduceMotion || state.paused;
    });
}

// Remove partner cards without valid images, keep spacing and grid size
function pruneMissingPartnerLogos() {
  const track = document.getElementById('partnersTrack');
  if (!track) return;
  const cards = Array.from(track.querySelectorAll('.logo-card'));
  cards.forEach(card => {
    const img = card.querySelector('img.logo-img');
    const hasFallbackText = !!card.querySelector('.bank-label');
    if (!img || img.style.display === 'none' || hasFallbackText) {
      card.remove();
      return;
    }
    if (img.complete) {
      if (img.naturalWidth < 2 || img.naturalHeight < 2) card.remove();
    } else {
      img.addEventListener('error', () => { card.remove(); });
      img.addEventListener('load', () => {
        if (img.naturalWidth < 2 || img.naturalHeight < 2) card.remove();
      });
    }
  });
}

// Ensure clicks on any carousel items navigate correctly (including cloned nodes)
document.addEventListener('click', (e) => {
  const link = e.target.closest('#featuredTrack a.card, #loanTrack a.card, #propTrack a.card, #pageTrack a.card, a.card.elite-item');
  if (!link) return;
  const target = link.getAttribute('data-go') || link.getAttribute('href');
  if (!target || target === '#') return;
  e.preventDefault();
  window.location.href = target;
});

function prefillFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const loanAmtParam = params.get('loanAmt');
  if (loanAmtParam) {
    const loanAmtInput = document.getElementById('loanAmt');
    if (loanAmtInput) {
      loanAmtInput.value = loanAmtParam;
      const wordsEl = document.getElementById('amountWords');
      if (wordsEl) wordsEl.innerText = numberToWordsIndian(loanAmtParam);
      calculateEmi();
    }
  }
  const calc = params.get('calc');
  if (calc) {
    let idx = 0;
    if (calc === 'emi') idx = 0;
    else if (calc === 'eligibility') idx = 1;
    else if (calc === 'switch') idx = 2;
    else if (calc === 'prepayment') idx = 3;
    else if (calc === 'rate') idx = 4;
    else if (calc === 'repayment' || calc === 'amortization') idx = 5;
    openTab(idx);
    const tools = document.getElementById('emi-tools');
    if (tools) tools.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (idx === 5) {
      calculateRepayment(true);
      const amort = document.querySelector('.table-container');
      if (amort) {
        amort.hidden = false;
        amort.classList.remove('hidden');
      }
    }
  }
  const loc = params.get('loc');
  if (loc) {
    const sel = document.getElementById('msType');
    if (sel) {
      sel.value = loc.toLowerCase();
      sel.dispatchEvent(new Event('change'));
      sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    try { localStorage.setItem('px_last_loc', loc.toLowerCase()); } catch(e) {}
  }
  const budget = params.get('budget');
  if (budget) {
    const bSel = document.getElementById('msBudget');
    if (bSel) {
      bSel.value = budget;
      bSel.dispatchEvent(new Event('change'));
    }
    try { localStorage.setItem('px_last_budget', budget); } catch(e) {}
  }
}

(function ensurePrefillInit(){
  const run = () => { try { prefillFromQuery(); } catch(e) {} };
  if (document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
 

// =========================
// 5. CHAT BOT WIDGET
// =========================
function initChatBot() {
  if (document.querySelector('.chatbot')) return;
  const container = document.createElement('div');
  container.className = 'chatbot';
  container.setAttribute('aria-live', 'polite');
  try {
    const isSmall = Math.min(window.innerWidth, window.innerHeight) <= 520;
    container.style.position = 'fixed';
    container.style.right = '18px';
    container.style.bottom = (isSmall ? 64 : 48) + 'px';
    container.style.zIndex = '999999';
  } catch(e) {}
  // rely on CSS for positioning and safe-area insets

  const toggle = document.createElement('button');
  toggle.className = 'chat-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'chatWindow');
  toggle.setAttribute('title', 'Chat');
  toggle.innerHTML = `
    <svg class="chat-face" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g class="status-chat">
        <path d="M5 7 H19 A2 2 0 0 1 21 9 V15 A2 2 0 0 1 19 17 H12 L9 19 V17 H5 A2 2 0 0 1 3 15 V9 A2 2 0 0 1 5 7 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
        <circle cx="9" cy="12" r="0.9"/>
        <circle cx="12" cy="12" r="0.9"/>
        <circle cx="15" cy="12" r="0.9"/>
      </g>
      <g class="status-typing">
        <circle cx="10" cy="16" r="0.6"/>
        <circle cx="12" cy="16" r="0.6"/>
        <circle cx="14" cy="16" r="0.6"/>
      </g>
      <g class="status-loading">
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="12 14"/>
      </g>
    </svg>
    <span class="chat-unread" hidden>0</span>
  `;

  const win = document.createElement('div');
  win.className = 'chat-window';
  win.id = 'chatWindow';
  win.setAttribute('role','dialog');
  win.setAttribute('aria-modal','true');
  win.setAttribute('aria-labelledby','chatTitle');
  win.hidden = true;
  win.innerHTML = `
    <div class="chat-header">
      <div class="chat-title" id="chatTitle"><svg class="chat-face" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="status-chat"><path d="M5 7 H19 A2 2 0 0 1 21 9 V15 A2 2 0 0 1 19 17 H12 L9 19 V17 H5 A2 2 0 0 1 3 15 V9 A2 2 0 0 1 5 7 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path><circle cx="9" cy="12" r="1.1"></circle><circle cx="12" cy="12" r="1.1"></circle><circle cx="15" cy="12" r="1.1"></circle></g></svg><span>Assistant</span></div>
      <button class="chat-close" aria-label="Close">×</button>
    </div>
    <div class="chat-body" role="log" aria-live="polite"></div>
    <form class="chat-input" autocomplete="off">
      <input type="text" name="q" placeholder="Type your message..." aria-label="Message" />
      <button type="submit">Send</button>
    </form>
  `;

  container.appendChild(toggle);
  container.appendChild(win);
  document.body.appendChild(container);
  try {
    const posRaw = localStorage.getItem('px_chat_pos_v1');
    if (posRaw) {
      const pos = JSON.parse(posRaw);
      if (typeof pos.left === 'number' && typeof pos.top === 'number') {
        container.style.right = 'auto';
        container.style.bottom = 'auto';
        container.style.left = pos.left + 'px';
        container.style.top = pos.top + 'px';
      }
    }
  } catch(e) {}
  ensureChatVisible(container, win);
  const setExpr = (mode) => {
    const all = ['expr-typing','expr-warning','expr-chat','expr-loading'];
    all.forEach(x => toggle.classList.remove(x));
    if (mode) toggle.classList.add('expr-' + mode);
  };
  animateBot(toggle, 'fun-bounce');
  setExpr('chat');
  const getColor = (el) => {
    const cs = window.getComputedStyle(el);
    return cs.backgroundColor || 'rgba(0,0,0,0)';
  };
  const parseRGBA = (c) => {
    if (!c) return { r:0,g:0,b:0,a:0 };
    if (c.startsWith('rgb')) {
      const m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d\.]+))?\)/);
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
    }
    if (c[0] === '#') {
      let r=0,g=0,b=0;
      if (c.length === 4) { r = parseInt(c[1]+c[1],16); g = parseInt(c[2]+c[2],16); b = parseInt(c[3]+c[3],16); }
      else if (c.length >= 7) { r = parseInt(c.slice(1,3),16); g = parseInt(c.slice(3,5),16); b = parseInt(c.slice(5,7),16); }
      return { r, g, b, a: 1 };
    }
    return { r:0,g:0,b:0,a:0 };
  };
  const luminance = ({r,g,b}) => {
    const srgb = [r,g,b].map(v => v/255).map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
    return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
  };
  let contrastScheduled = false;
  const scheduleContrast = () => {
    if (contrastScheduled) return;
    contrastScheduled = true;
    requestAnimationFrame(() => { contrastScheduled = false; updateChatContrast(); });
  };
  const updateChatContrast = () => {
    const rect = toggle.getBoundingClientRect();
    const cx = Math.round(rect.left + rect.width/2);
    const cy = Math.round(rect.top + rect.height/2);
    const prevContainer = container.style.pointerEvents;
    const prevToggle = toggle.style.pointerEvents;
    container.style.pointerEvents = 'none';
    toggle.style.pointerEvents = 'none';
    let el = document.elementFromPoint(cx, cy) || document.body;
    container.style.pointerEvents = prevContainer || '';
    toggle.style.pointerEvents = prevToggle || '';
    let bg = getColor(el);
    let tries = 0;
    while (tries < 12) {
      const rgba = parseRGBA(bg);
      if (rgba.a && rgba.a > 0) { 
        const lum = luminance(rgba);
        const isDark = lum < 0.45;
        toggle.classList.toggle('theme-on-dark', isDark);
        toggle.classList.toggle('theme-on-light', !isDark);
        const hdr = win.querySelector('.chat-header');
        if (hdr) hdr.classList.toggle('alt', !isDark);
        return;
      }
      el = el.parentElement || document.body;
      bg = getColor(el);
      tries++;
    }
    toggle.classList.remove('theme-on-dark');
    toggle.classList.remove('theme-on-light');
  };
  updateChatContrast();
  window.addEventListener('scroll', scheduleContrast, { passive: true });
  window.addEventListener('resize', scheduleContrast);
  try {
    const mo = new MutationObserver(() => scheduleContrast());
    mo.observe(document.body, { childList: true, subtree: true });
  } catch(e) {}
  // crest icon: no hover face changes
  try { enableChatDrag(container, toggle, win); } catch(e) {}

  const body = win.querySelector('.chat-body');
  const form = win.querySelector('.chat-input');
  const closeBtn = win.querySelector('.chat-close');
  let unreadCount = 0;
  const unreadBadge = toggle.querySelector('.chat-unread');
  let trapHandler = null;
  const getFocusable = () => {
    const sel = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(win.querySelectorAll(sel)).filter(el => el.offsetParent !== null);
  };
  const trapFocus = () => {
    const nodes = getFocusable();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    win.addEventListener('keydown', trapHandler);
  };
  const releaseFocusTrap = () => {
    if (trapHandler) { win.removeEventListener('keydown', trapHandler); trapHandler = null; }
  };
  const logEvent = (name, data = {}) => {
    try {
      const k = 'px_analytics_v1';
      const arr = JSON.parse(localStorage.getItem(k) || '[]');
      arr.push({ name, data, ts: Date.now() });
      localStorage.setItem(k, JSON.stringify(arr));
    } catch(e) {}
    try { console.log('[analytics]', name, data); } catch(e) {}
  };
  const formatTime = (d) => {
    try {
      const hh = d.getHours() % 12 || 12;
      const mm = String(d.getMinutes()).padStart(2,'0');
      const ap = d.getHours() >= 12 ? 'PM' : 'AM';
      return `${hh}:${mm} ${ap}`;
    } catch(e) { return ''; }
  };
  const updateUnread = () => {
    const val = unreadCount > 9 ? '9+' : String(unreadCount);
    unreadBadge.textContent = val;
    unreadBadge.hidden = unreadCount <= 0;
  };
  const adjustChatSize = () => {
    try {
      const tRect = toggle.getBoundingClientRect();
      const margin = 12;
      const avail = Math.max(240, tRect.top - margin);
      const h = Math.max(260, Math.min(720, avail - margin));
      win.style.maxHeight = h + 'px';
    } catch(e) {}
  };
  const incUnread = (n = 1) => {
    unreadCount += n;
    updateUnread();
  };
  restoreHistory(body);
  try {
    const ro = new ResizeObserver(() => ensureChatVisible(container, win));
    ro.observe(win);
  } catch(e) {}

  function friendlyGreeting() {
    const msgs = [
      "Hi! I’m your friendly assistant. Want to explore properties or loan tools first? 🙂",
      "Welcome! Let’s find the perfect home or the best loan rates. What should we start with? 🏠✨",
      "Hello! Pick a category and I’ll guide you step by step. 🤝",
      "Hey there! Properties, loans, locations or budgets—I’ve got shortcuts for all. 🚀"
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  function openChat() {
    logEvent('chat_open');
    win.hidden = false;
    win.classList.add('visible');
    try { container.style.pointerEvents = 'auto'; } catch(e) {}
    adjustChatSize();
    try {
      const tRect = toggle.getBoundingClientRect();
      const wRect = win.getBoundingClientRect();
      const tCx = Math.round(tRect.left + tRect.width / 2);
      const tCy = Math.round(tRect.top + tRect.height / 2);
      const wCx = Math.round(wRect.left + wRect.width / 2);
      const wCy = Math.round(wRect.top + Math.min(60, wRect.height / 5));
      const dx = tCx - wCx;
      const dy = tCy - wCy;
      win.style.setProperty('--genie-x', dx + 'px');
      win.style.setProperty('--genie-y', dy + 'px');
      win.classList.add('genie');
      win.addEventListener('animationend', () => { win.classList.remove('genie'); }, { once: true });
    } catch(e) {}
    toggle.setAttribute('aria-expanded','true');
    toggle.classList.add('open');
    setExpr('chat');
    const idle = toggle.querySelector('.bot-idle');
    if (idle) idle.style.display = 'none';
    ensureChatVisible(container, win);
    animateBot(toggle, 'fun-pop');
    unreadCount = 0; updateUnread();
    try { const inp = form.querySelector('input'); if (inp) inp.focus(); } catch(e) {}
    trapFocus();
    try { localStorage.setItem('px_chat_greeted_once', '1'); } catch(e) {}
    if (!body.dataset.greeted) {
      body.dataset.greeted = '1';
      appendBot(friendlyGreeting());
      appendActions([
        { label: 'Properties' },
        { label: 'Loans' },
        { label: 'Locations' },
        { label: 'Budget' },
        { label: 'Offers' },
        { label: 'Contact' }
      ]);
    }
    scheduleContrast();
  }
  function closeChat() {
    win.classList.remove('visible');
    setTimeout(() => { 
      win.hidden = true; 
      ensureChatVisible(container, win);
      body.innerHTML = '';
      delete body.dataset.greeted;
      try { localStorage.removeItem('px_chat_history_v1'); } catch(e) {}
    }, 180);
    releaseFocusTrap();
    try { container.style.pointerEvents = 'none'; } catch(e) {}
    toggle.setAttribute('aria-expanded','false');
    toggle.classList.remove('open');
    const idle = toggle.querySelector('.bot-idle');
    if (idle) idle.style.display = '';
    animateBot(toggle, 'fun-pop');
    setExpr(null);
    scheduleContrast();
    logEvent('chat_close');
  }

  toggle.addEventListener('click', () => {
    if (win.hidden) openChat(); else closeChat();
  });
  closeBtn.addEventListener('click', closeChat);
  document.addEventListener('keydown', (e) => { if (!win.hidden && e.key === 'Escape') closeChat(); });
  let funPaused = false;
  let funTimer = null;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.addEventListener('resize', () => { if (!win.hidden) adjustChatSize(); });
  function scheduleFun() {
    if (funTimer) clearTimeout(funTimer);
    if (reduceMotion) return;
    const energetic = toggle.classList.contains('energetic');
    const baseDelay = energetic ? 3000 : 5000;
    const jitter = energetic ? 3500 : 6000;
    funTimer = setTimeout(() => {
      if (funPaused || toggle.classList.contains('open')) { scheduleFun(); return; }
      const acts = [
        { k: 'bounce', d: 900 },
        { k: 'spin', d: energetic ? 900 : 1100 },
        { k: 'dance', d: energetic ? 900 : 1200 },
        { k: 'wink', d: 600 },
        { k: 'antenna', d: energetic ? 900 : 1200 },
        { k: 'hop', d: energetic ? 800 : 900 },
        { k: 'pop', d: 700 },
        { k: 'wobble', d: energetic ? 900 : 1000 },
        { k: 'shimmer', d: 1400 },
        { k: 'breath', d: 1200 }
      ];
      const pick = acts[Math.floor(Math.random() * acts.length)];
      toggle.classList.add('fun-' + pick.k);
      setTimeout(() => {
        toggle.classList.remove('fun-' + pick.k);
        scheduleFun();
      }, pick.d);
    }, baseDelay + Math.floor(Math.random() * jitter));
  }
  scheduleFun();
  toggle.classList.add('energetic');
  toggle.addEventListener('mouseenter', () => { funPaused = true; });
  toggle.addEventListener('mouseleave', () => { funPaused = false; });
  document.addEventListener('visibilitychange', () => { funPaused = document.hidden || reduceMotion; });
  try {
    const greeted = localStorage.getItem('px_chat_greeted_once') === '1';
    const allow = !reduceMotion && !greeted;
    if (allow) setTimeout(() => { if (win.hidden) animateBot(toggle, 'fun-breath'); }, 2500);
  } catch(e) {}
  try {
    const p = (window.location.pathname || '').toLowerCase();
    if (p.includes('loan-calculator-tools.html')) {
      const k = 'px_views_loan_tools';
      const c = Number(localStorage.getItem(k) || '0') + 1;
      localStorage.setItem(k, String(c));
      logEvent('page_loan_tools_view', { count: c });
    }
  } catch(e) {}
  try {
    const partnerSec = document.getElementById('trusted-partners') || document.getElementById('partnersTrack');
    if (partnerSec) {
      const io = new IntersectionObserver((ents) => {
        ents.forEach(ent => {
          if (ent.isIntersecting && win.hidden) {
            logEvent('partners_visible', {});
          }
        });
      }, { threshold: 0.5 });
      io.observe(partnerSec);
    }
  } catch(e) {}

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[name="q"]');
    const text = (input.value || '').trim();
    if (!text) return;
    appendUser(text);
    body.scrollTop = body.scrollHeight;
    input.value = '';
    typing(true);
    setExpr('loading');
    animateBot(toggle, 'fun-spin');
    setTimeout(() => {
      typing(false);
      const { reply, actions } = resolveReply(text);
      appendBot(reply);
      if (actions && actions.length) appendActions(actions);
      body.scrollTop = body.scrollHeight;
      saveHistory(body);
      setExpr('chat');
    }, 700);
  });
  const inputEl = form.querySelector('input[name="q"]');
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.dispatchEvent(new Event('submit')); }
  });

  function appendUser(text) {
    const el = document.createElement('div');
    el.className = 'msg user';
    el.textContent = text;
    const tm = document.createElement('span');
    tm.className = 'msg-time';
    tm.textContent = formatTime(new Date());
    el.appendChild(tm);
    body.appendChild(el);
    ensureChatVisible(container, win);
  }
  function appendBot(text) {
    const el = document.createElement('div');
    el.className = 'msg bot';
    el.textContent = text;
    const tm = document.createElement('span');
    tm.className = 'msg-time';
    tm.textContent = formatTime(new Date());
    el.appendChild(tm);
    body.appendChild(el);
    ensureChatVisible(container, win);
    if (win.hidden) incUnread(1);
  }
  let typingEl = null;
  function typing(on = true) {
    if (on) {
      typingEl = document.createElement('div');
      typingEl.className = 'msg bot';
      typingEl.innerHTML = '<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
      body.appendChild(typingEl);
      ensureChatVisible(container, win);
      setExpr('typing');
    } else if (typingEl) {
      body.removeChild(typingEl);
      typingEl = null;
      ensureChatVisible(container, win);
      if (win.hidden) setExpr(null);
    }
  }
  function appendActions(actions) {
    const wrap = document.createElement('div');
    wrap.className = 'chat-actions';
    actions.forEach(a => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip-action';
      b.textContent = a.label;
      b.addEventListener('click', () => { 
        logEvent('chat_action_click', { label: a.label, url: a.url });
        appendUser(a.label);
        const follow = getFollowUps(a.label);
        if (follow && follow.length) {
          appendBot('Here are some options based on your choice:');
          appendActions(follow);
        } else if (a.url) {
          window.location.href = a.url; 
        }
      });
      wrap.appendChild(b);
    });
    const el = document.createElement('div');
    el.className = 'msg bot';
    el.appendChild(wrap);
    body.appendChild(el);
    saveHistory(body);
    ensureChatVisible(container, win);
    if (win.hidden) incUnread(1);
  }
  function getFollowUps(label) {
    const l = (label || '').toLowerCase();
    if (l.includes('propert')) {
      return [
        { label: 'Apartments', url: 'apartments.html' },
        { label: 'Villas', url: 'villas.html' },
        { label: 'Open Plots', url: 'open-plots.html' },
        { label: 'Commercial', url: 'commercial.html' },
        { label: 'Farm House', url: 'farm-house.html' }
      ];
    }
    if (l.includes('loan')) {
      return [
        { label: 'EMI Planner', url: 'loan-calculator-tools.html?calc=emi' },
        { label: 'Eligibility', url: 'loan-calculator-tools.html?calc=eligibility' },
        { label: 'Switch', url: 'loan-calculator-tools.html?calc=switch' },
        { label: 'Prepayment', url: 'loan-calculator-tools.html?calc=prepayment' },
        { label: 'Rate Impact', url: 'loan-calculator-tools.html?calc=rate' },
        { label: 'Repayment', url: 'loan-calculator-tools.html?calc=repayment' }
      ];
    }
    if (l.includes('location')) {
      return [
        { label: 'Tellapur', url: 'index.html?loc=tellapur' },
        { label: 'Kokapet', url: 'index.html?loc=kokapet' },
        { label: 'Gachibowli', url: 'index.html?loc=gachibowli' },
        { label: 'Financial District', url: 'index.html?loc=financial-district' }
      ];
    }
    if (l.includes('budget')) {
      return [
        { label: 'Under ₹50L', url: 'loan-calculator-tools.html?calc=emi&loanAmt=5000000' },
        { label: '₹50L–₹1Cr', url: 'loan-calculator-tools.html?calc=emi&loanAmt=10000000' },
        { label: '₹1Cr–₹2Cr', url: 'loan-calculator-tools.html?calc=emi&loanAmt=20000000' },
        { label: '₹2Cr+', url: 'loan-calculator-tools.html?calc=emi&loanAmt=25000000' }
      ];
    }
    if (l.includes('offer')) {
      return [
        { label: 'Explore Offers', url: 'offers.html' },
        { label: 'Bank Partners', url: 'loan-calculator-tools.html#partners' }
      ];
    }
    if (l.includes('contact') || l.includes('support') || l.includes('help')) {
      return [
        { label: 'Help Center', url: 'help-center.html' },
        { label: 'Sales Enquiry', url: 'sales-enquiry.html' },
        { label: 'Contact', url: 'contact.html' }
      ];
    }
    if (l.includes('apartment')) {
      return [
        { label: '₹50L–₹1Cr', url: 'index.html?loc=financial-district&budget=50-100l' },
        { label: '₹1Cr–₹2Cr', url: 'index.html?loc=kokapet&budget=1-2cr' },
        { label: '₹2Cr+', url: 'index.html?loc=gachibowli&budget=2cr-plus' },
        { label: 'Open EMI', url: 'loan-calculator-tools.html?calc=emi' }
      ];
    }
    if (l.includes('villa')) {
      return [
        { label: 'Tellapur', url: 'index.html?loc=tellapur' },
        { label: 'Kokapet', url: 'index.html?loc=kokapet' },
        { label: 'Gachibowli', url: 'index.html?loc=gachibowli' },
        { label: 'See Villas', url: 'villas.html' }
      ];
    }
    if (l.includes('plot') || l.includes('land')) {
      return [
        { label: 'Under ₹50L', url: 'index.html?budget=under-50l' },
        { label: '₹50L–₹1Cr', url: 'index.html?budget=50-100l' },
        { label: '₹1Cr–₹2Cr', url: 'index.html?budget=1-2cr' },
        { label: 'See Plots', url: 'open-plots.html' }
      ];
    }
    if (l.includes('emi') || l.includes('loan')) {
      return [
        { label: 'EMI Planner', url: 'loan-calculator-tools.html?calc=emi' },
        { label: 'Eligibility', url: 'loan-calculator-tools.html?calc=eligibility' },
        { label: 'Rate Impact', url: 'loan-calculator-tools.html?calc=rate' },
        { label: 'Repayment', url: 'loan-calculator-tools.html?calc=repayment' }
      ];
    }
    if (l.includes('commercial')) {
      return [
        { label: 'See Commercial', url: 'commercial.html' },
        { label: 'Financial District', url: 'index.html?loc=financial-district' }
      ];
    }
    if (l.includes('farm')) {
      return [
        { label: 'See Farm Houses', url: 'farm-house.html' },
        { label: 'Under ₹2Cr', url: 'loan-calculator-tools.html?calc=emi&loanAmt=20000000' }
      ];
    }
    return [];
  }
  function appendCard(cfg) {
    const el = document.createElement('div');
    el.className = 'msg bot';
    const card = document.createElement('div');
    card.className = 'offer-card';
    const img = document.createElement('img');
    img.src = cfg.img;
    img.alt = cfg.title || '';
    img.loading = 'lazy';
    img.onerror = function() { this.src = 'assets/logos/bob.svg'; this.onerror = null; };
    const info = document.createElement('div');
    info.className = 'offer-info';
    const title = document.createElement('div');
    title.className = 'offer-title';
    title.textContent = cfg.title || '';
    const desc = document.createElement('div');
    desc.className = 'offer-desc';
    desc.textContent = cfg.desc || '';
    const cta = document.createElement('button');
    cta.className = 'offer-cta';
    cta.textContent = cfg.ctaLabel || 'View';
    cta.addEventListener('click', () => { 
      logEvent('chat_card_click', { title: cfg.title, url: cfg.url });
      window.location.href = cfg.url; 
    });
    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(cta);
    card.appendChild(img);
    card.appendChild(info);
    el.appendChild(card);
    body.appendChild(el);
    ensureChatVisible(container, win);
  }
  function resolveReply(q) {
    const s = q.toLowerCase();
    if (/(hello|hi|hey)/.test(s)) {
      return { reply: "Hello! What would you like to explore—apartments, villas, plots, or loan tools? 👋", actions: [] };
    }
    if (/(how are you|how r u|how's it going)/.test(s)) {
      return { reply: "Feeling electric and ready to help! What are we hunting—homes or loans today? ⚡🙂", actions: [{ label: 'Apartments', url: 'apartments.html' }, { label: 'Loan Tools', url: 'loan-calculator-tools.html?calc=emi' }] };
    }
    if (/(joke|funny|make me laugh|laugh)/.test(s)) {
      const jokes = [
        "Why did the house apply for a loan? It wanted a little more space to grow! 🏠😄",
        "I’m reading a book on mortgages—it’s full of interest! 🏦😄",
        "My EMI and I are in a long‑term relationship: it checks in every month. 📅😉",
        "I asked for a low rate; the bank said, “We appreciate your interest.” 😌📈",
        "Wanted a plot; turns out the story thickened. 📖🏡",
        "Ceilings so high, even my dreams feel short. ✨🏠",
        "The staircase is ambitious—always taking steps to improve. 🪜😆",
        "I like my homes like my Wi‑Fi—strong connections everywhere. 📶🏡",
        "Open floor plans? I need space for my plans to open. 🗺️😄",
        "Told my broker I want room for growth—they showed me a garden. 🌿🏡"
      ];
      const pick = jokes[Math.floor(Math.random() * jokes.length)];
      return { reply: pick, actions: [{ label: 'EMI Planner', url: 'loan-calculator-tools.html?calc=emi' }] };
    }
    if (/(time|clock)/.test(s)) {
      try { return { reply: "It’s " + new Date().toLocaleTimeString() + ". Perfect time to explore properties. ⏰", actions: [] }; } catch(e) { return { reply: "Time to find your dream home! ⏰", actions: [] }; }
    }
    if (/(name|who are you|who r u)/.test(s)) {
      return { reply: "I’m your PropXpertz assistant—friendly, funny, and focused on getting you the best properties and loans. 🤖✨", actions: [{ label: 'Explore Offers', url: 'offers.html' }] };
    }
    if (/(thanks|thank you|ty|thx)/.test(s)) {
      return { reply: "Anytime! Want to check villas or EMI next? 🙌", actions: [{ label: 'Villas', url: 'villas.html' }, { label: 'EMI', url: 'loan-calculator-tools.html?calc=emi' }] };
    }
    if (/(bye|goodbye|see ya)/.test(s)) {
      return { reply: "Bye! I’ll be here when you’re back—hover for a wave. 👋", actions: [] };
    }
    if (/(feature|features|tool|tools|section|sections|capabilities|functionality)/.test(s)) {
      return { reply: "You can use the search, browse property categories, view featured listings and partners, and try loan tools: EMI, Eligibility, Switch, Prepayment, Rate Impact, and Repayment. 🧭", actions: [{ label: 'EMI', url: 'loan-calculator-tools.html?calc=emi' }, { label: 'Eligibility', url: 'loan-calculator-tools.html?calc=eligibility' }, { label: 'Rate Impact', url: 'loan-calculator-tools.html?calc=rate' }] };
    }
    if (/(ad|ads|advert|advertisement|promotion|offer|offers)/.test(s)) {
      return { reply: "Promotions appear in Offers and partner bank sections. Content is user‑friendly and focused on loan deals and rewards. 🎁", actions: [{ label: 'Explore Offers', url: 'offers.html' }, { label: 'Bank Partners', url: 'loan-calculator-tools.html#partners' }] };
    }
    if (/(navigation|menu|header|footer)/.test(s)) {
      return { reply: "Use the header for primary pages and the footer for quick links, social profiles, and app downloads. The homepage highlights featured properties and loan tools. 🏠", actions: [{ label: 'Apartments', url: 'apartments.html' }, { label: 'Loan Tools', url: 'loan-calculator-tools.html?calc=emi' }] };
    }
    if (/(help|support|contact|enquiry|sales)/.test(s)) {
      return { reply: "For assistance, open the Help Center or submit a Sales Enquiry with your requirements. 📩", actions: [{ label: 'Help Center', url: 'help-center.html' }, { label: 'Sales Enquiry', url: 'sales-enquiry.html' }] };
    }
    if (/(emi|calculator|loan|interest|rate)/.test(s)) {
      return { reply: "Use the loan calculators to plan EMI, assess eligibility, compare a switch, prepay, check rate impact, or view the repayment schedule. 🧮", actions: [{ label: 'Open EMI', url: 'loan-calculator-tools.html?calc=emi' }, { label: 'Eligibility', url: 'loan-calculator-tools.html?calc=eligibility' }, { label: 'Repayment', url: 'loan-calculator-tools.html?calc=repayment' }] };
    }
    if (/(tellapur|kokapet|gachibowli|financial district)/.test(s)) {
      const m = s.match(/tellapur|kokapet|gachibowli|financial district/);
      const loc = m ? m[0].replace(/\s+/g,'-') : 'tellapur';
      return { reply: "Got it. I’ll focus listings for that area. 📍", actions: [{ label: 'See Listings', url: 'index.html?loc=' + loc }] };
    }
    if (/(budget|price|range|under|over)/.test(s)) {
      return { reply: "Pick a range and I’ll align suggestions. 💰", actions: [
        { label: 'Under ₹50L', url: 'loan-calculator-tools.html?calc=emi&loanAmt=5000000' },
        { label: '₹50L–₹1Cr', url: 'loan-calculator-tools.html?calc=emi&loanAmt=10000000' },
        { label: '₹1Cr–₹2Cr', url: 'loan-calculator-tools.html?calc=emi&loanAmt=20000000' },
        { label: '₹2Cr+', url: 'loan-calculator-tools.html?calc=emi&loanAmt=25000000' }
      ] };
    }
    if (/(backend|admin|private|internal|server|database|credentials)/.test(s)) {
      return { reply: "I can help with public site questions and content. I cannot discuss private or internal details. 🔒", actions: [{ label: 'Help Center', url: 'help-center.html' }] };
    }
    if (/(apartment|flat|apartments)/.test(s)) {
      return { reply: "Great choice! Here are apartments curated for you. 🏢", actions: [{ label: 'Browse Apartments', url: 'apartments.html' }] };
    }
    if (/(villa|villas)/.test(s)) {
      return { reply: "Exploring premium villas near you. 🏡", actions: [{ label: 'Browse Villas', url: 'villas.html' }] };
    }
    if (/(plot|plots|open plot|land|lands)/.test(s)) {
      return { reply: "Let’s look at open plots and land available. 🧭", actions: [{ label: 'Open Plots', url: 'open-plots.html' }] };
    }
    if (/(commercial|office|shop)/.test(s)) {
      return { reply: "Here are commercial options to consider. 🏢", actions: [{ label: 'Commercial Spaces', url: 'commercial.html' }] };
    }
    if (/(farm|farm house)/.test(s)) {
      return { reply: "Find serene farm houses for weekend living. 🌿", actions: [{ label: 'Farm Houses', url: 'farm-house.html' }] };
    }
    return { reply: "Ask me about site features, offers, property types, or loan tools. I’ll guide you to the right section. ✨", actions: [{ label: 'Apartments', url: 'apartments.html' }, { label: 'Villas', url: 'villas.html' }, { label: 'Open Plots', url: 'open-plots.html' }, { label: 'Loan EMI', url: 'loan-calculator-tools.html?calc=emi' }] };
  }
}

function enableChatDrag(container, handle, win) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  let pointerDown = false;
  let suppressClick = false;
  const threshold = 6;
  const margin = 8;
  const start = (clientX, clientY) => {
    dragging = false;
    startX = clientX;
    startY = clientY;
    const rect = container.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
  };
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const move = (clientX, clientY) => {
    if (!pointerDown) return;
    if (!dragging) {
      if (Math.abs(clientX - startX) > threshold || Math.abs(clientY - startY) > threshold) {
        const rect = container.getBoundingClientRect();
        container.style.right = 'auto';
        container.style.bottom = 'auto';
        container.style.left = rect.left + 'px';
        container.style.top = rect.top + 'px';
        dragging = true;
        suppressClick = true;
        handle.classList.add('face-drag');
      } else {
        return;
      }
    }
    const maxW = window.innerWidth;
    const maxH = window.innerHeight;
    const cRect = container.getBoundingClientRect();
    let left = clamp(clientX - offsetX, margin, maxW - cRect.width - margin);
    let top = clamp(clientY - offsetY, margin, maxH - cRect.height - margin);
    // If window is open, ensure it doesn't overflow viewport to the right/bottom
    if (!win.hidden) {
      const winWidth = win.offsetWidth || 0;
      const winHeight = Math.min(win.offsetHeight || 0, maxH);
      left = clamp(left, margin, maxW - winWidth - margin);
      top = clamp(top, margin, maxH - winHeight - margin);
    }
    container.style.left = left + 'px';
    container.style.top = top + 'px';
    try { window.dispatchEvent(new Event('px_chat_moved')); } catch(e) {}
  };
  const end = () => { 
    dragging = false; 
    pointerDown = false;
    setTimeout(() => { suppressClick = false; }, 0);
    handle.classList.remove('face-drag');
    try {
      const rect = container.getBoundingClientRect();
      const pos = { left: Math.round(rect.left), top: Math.round(rect.top) };
      localStorage.setItem('px_chat_pos_v1', JSON.stringify(pos));
    } catch(e) {}
  };
  const onPointerDown = (e) => {
    const p = e.touches ? e.touches[0] : e;
    pointerDown = true;
    start(p.clientX, p.clientY);
  };
  const onPointerMove = (e) => {
    const p = e.touches ? e.touches[0] : e;
    if (e.touches) { if (pointerDown) e.preventDefault(); }
    move(p.clientX, p.clientY);
  };
  handle.addEventListener('mousedown', onPointerDown);
  document.addEventListener('mousemove', onPointerMove);
  document.addEventListener('mouseup', end);
  handle.addEventListener('touchstart', onPointerDown, { passive: true });
  document.addEventListener('touchmove', onPointerMove, { passive: false });
  document.addEventListener('touchend', end);
  handle.addEventListener('click', (e) => {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  window.addEventListener('resize', () => {
    const rect = container.getBoundingClientRect();
    const left = clamp(rect.left, margin, window.innerWidth - rect.width - margin);
    const top = clamp(rect.top, margin, window.innerHeight - rect.height - margin);
    container.style.left = left + 'px';
    container.style.top = top + 'px';
  });
}

function ensureChatVisible(container, win) {
  const margin = 8;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const hasFreePos = !!(container.style.left || container.style.top);
  if (!hasFreePos) return; // keep docked bottom-right if not dragged
  const rect = container.getBoundingClientRect();
  const maxW = window.innerWidth;
  const maxH = window.innerHeight;
  const winWidth = win.offsetWidth || 0;
  const winHeight = Math.min(win.offsetHeight || 0, maxH);
  const left = clamp(rect.left, margin, maxW - winWidth - margin);
  const top = clamp(rect.top, margin, maxH - winHeight - margin);
  container.style.left = left + 'px';
  container.style.top = top + 'px';
}

function animateBot(toggle, mode) {
  const modes = ['fun-bounce','fun-spin','fun-dance','fun-hop','fun-wink','fun-antenna','fun-pop','fun-wobble','fun-shimmer','fun-breath'];
  modes.forEach(m => toggle.classList.remove(m));
  if (mode) {
    toggle.classList.add('energetic');
    toggle.classList.add(mode);
    setTimeout(() => { toggle.classList.remove(mode); }, 900);
  }
}

function saveHistory(bodyEl) {
  const rows = Array.from(bodyEl.querySelectorAll('.msg')).map(m => {
    const role = m.classList.contains('user') ? 'user' : 'bot';
    const text = m.textContent || '';
    return { role, text };
  });
  try { localStorage.setItem('px_chat_history_v1', JSON.stringify(rows.slice(-40))); } catch(e) {}
}

function restoreHistory(bodyEl) {
  let rows = [];
  try { rows = JSON.parse(localStorage.getItem('px_chat_history_v1') || '[]'); } catch(e) {}
  rows.forEach(r => {
    const el = document.createElement('div');
    el.className = 'msg ' + (r.role === 'user' ? 'user' : 'bot');
    el.textContent = r.text;
    bodyEl.appendChild(el);
  });
  if (rows.length) bodyEl.dataset.greeted = '1';
}

window.PXChat = {
  open: () => {
    const t = document.querySelector('.chat-toggle');
    const w = document.getElementById('chatWindow');
    if (!t || !w) return;
    if (w.hidden) t.click();
  },
  promptReview: () => {
    const t = document.querySelector('.chat-toggle');
    const w = document.getElementById('chatWindow');
    const b = w ? w.querySelector('.chat-body') : null;
    if (!t || !w || !b) return;
    if (w.hidden) t.click();
    const el = document.createElement('div');
    el.className = 'msg bot';
    const wrap = document.createElement('div');
    wrap.className = 'rating-row';
    wrap.innerHTML = `
      <div class="rating-stars" role="radiogroup" aria-label="Rate your experience">
        <button aria-label="1 star">★</button>
        <button aria-label="2 stars">★</button>
        <button aria-label="3 stars">★</button>
        <button aria-label="4 stars">★</button>
        <button aria-label="5 stars">★</button>
      </div>
      <textarea class="rating-text" rows="2" placeholder="Share a quick review"></textarea>
      <button class="rating-submit">Submit</button>
    `;
    el.appendChild(document.createTextNode('Thanks for your submission! Could you rate your experience? ⭐'));
    el.appendChild(wrap);
    b.appendChild(el);
    b.scrollTop = b.scrollHeight;
    const stars = wrap.querySelectorAll('.rating-stars button');
    let sel = 0;
    stars.forEach((s, i) => {
      s.addEventListener('click', () => {
        sel = i + 1;
        stars.forEach((x, j) => x.classList.toggle('on', j < sel));
      });
    });
    wrap.querySelector('.rating-submit').addEventListener('click', () => {
      const txt = wrap.querySelector('.rating-text').value.trim();
      const payload = { stars: sel, text: txt, ts: Date.now() };
      try { localStorage.setItem('px_chat_review', JSON.stringify(payload)); } catch(e) {}
      const thx = document.createElement('div');
      thx.className = 'msg bot';
      thx.textContent = sel ? `Thank you! Rated ${sel}/5. Your feedback helps us improve. 🙌` : 'Thank you for your feedback! 🙌';
      b.appendChild(thx);
      b.scrollTop = b.scrollHeight;
    });
  }
};
function downloadAmortCsv() {
  const table = document.getElementById('amortTable');
  if (!table) return;
  const rows = Array.from(table.querySelectorAll('tr')).map(tr => 
    Array.from(tr.children).map(td => td.innerText.trim().replace(/a\^/g, String.fromCharCode(8377)))
  );
  const csv = rows.map(r => r.map(x => `"${x.replace(/"/g,'""')}"`).join(',')).join('\n');
  const bom = '\ufeff';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'amortization.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printAmort() {
  const table = document.getElementById('amortTable');
  if (!table) { window.print(); return; }
  const w = window.open('', 'PRINT', 'height=600,width=800');
  if (!w) { window.print(); return; }
  w.document.write('<html><head><title>Amortization Schedule</title>');
  w.document.write('<style>table{width:100%;border-collapse:collapse;font-family:Inter,sans-serif}th,td{padding:8px;border-bottom:1px solid #eee;text-align:left}thead th{position:sticky;top:0;background:#fff}</style>');
  w.document.write('</head><body>');
  w.document.write(table.outerHTML);
  w.document.write('</body></html>');
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

(function ensureChatBoot() {
  if (document.querySelector('.chatbot')) return;
  const boot = () => { if (!document.querySelector('.chatbot')) try { initChatBot(); } catch(e) {} };
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
  setTimeout(boot, 1200);
  try {
    setInterval(() => {
      if (!document.querySelector('.chatbot')) boot();
    }, 3000);
  } catch(e) {}
})();
