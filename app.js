/**
 * LEAN QCO DASHBOARD - MINIMALIST ENGINE
 * Adhering to Ponytail (YAGNI & Anti-Bloat) & Taste Skill (Refined Scandinavian Aesthetic)
 */

let allRecords = [];
let filteredRecords = [];
let activeProcess = 'ALL';
let pieMode = 'count';
let currentLang = 'en'; // 'vi' or 'en'
let currentPage = 1;
let pageSize = 25;
let currentSort = { column: 'date', order: 'desc' };

let chartTrend = null;
let chartType = null;
let chartFocusModels = null;

// I18N DICTIONARY
const i18n = {
  vi: {
    brandTitle: 'Lean QCO',
    events: 'sự kiện',
    uploadCsv: 'Tải CSV',
    export: 'Xuất file',
    allProcesses: 'Tất cả xưởng',
    allYears: 'Tất cả năm',
    allMonths: 'Tất cả tháng',
    allTypes: 'Tất cả loại C/O',
    plannedOpt: 'Planned (Có KH)',
    unplannedOpt: 'Unplanned (Ngoài KH)',
    searchPlaceholder: 'Tìm kiếm model...',
    kpiCot: 'Thời gian C/O thực tế (COT)',
    kpiCopt: 'Mục tiêu kỹ thuật (COPT)',
    unitMin: 'phút',
    vsTarget: 'so với chuẩn:',
    exceededBadge: 'Vượt',
    achievedBadge: 'Đạt',
    stdTarget: 'Định mức chu kỳ chuẩn',
    kpiAdherence: 'Tỉ lệ đạt chuẩn (COT ≤ COPT)',
    adherenceCount: 'đạt chuẩn',
    kpiCost: 'Chi phí chuyển đổi',
    unplannedPrefix: 'Ngoài KH:',
    trendTitle: 'Xu hướng hiệu suất theo tháng',
    trendSub: 'Thời gian thực tế (COT) vs Mục tiêu kỹ thuật (COPT)',
    legendCot: 'COT Thực tế',
    legendCopt: 'COPT Mục tiêu',
    typeSplitTitle: 'Cơ cấu loại C/O',
    btnCount: 'Số lần',
    btnCost: 'Chi phí',
    topFocusTitle: 'Top Model trọng điểm',
    topFocusSub: 'COT cao nhất',
    recordsTitle: 'Nhật ký chuyển đổi mã',
    recordsSub: 'Lịch sử sự kiện và kiểm toán thời gian dừng máy',
    rowsPerPage: 'Số dòng/trang:',
    thDate: 'Ngày',
    thProcess: 'Xưởng',
    thPrevModel: 'Model trước',
    thTargetModel: 'Model sau',
    thCot: 'COT (phút)',
    thCopt: 'COPT (phút)',
    thVariance: 'Chênh lệch',
    thType: 'Loại C/O',
    thReason: 'Lý do / Ghi chú',
    thCost: 'Chi phí (VND)',
    showing: 'Hiển thị',
    to: 'đến',
    of: 'trong tổng',
    noRecords: 'Không có bản ghi phù hợp',
    footerText: 'Công ty TNHH Vietnam Samho • Hệ thống Quản trị & Tối ưu hóa Chuyển đổi mã Lean QCO & SMED',
    modalTitle: 'Nạp dữ liệu CSV',
    dropText: 'Nhấp để chọn hoặc kéo thả file CSV vào đây',
    dropSub: 'Hỗ trợ DATA_AUTOCUT, DATA_STITCHING, MERGE_DATA',
    modeAppend: 'Gộp thêm',
    modeReplace: 'Thay thế toàn bộ',
    btnCancel: 'Hủy'
  },
  en: {
    brandTitle: 'Lean QCO',
    events: 'events',
    uploadCsv: 'Upload CSV',
    export: 'Export',
    allProcesses: 'All Processes',
    allYears: 'All years',
    allMonths: 'All months',
    allTypes: 'Planned & Unplanned',
    plannedOpt: 'Planned',
    unplannedOpt: 'Unplanned',
    searchPlaceholder: 'Search model...',
    kpiCot: 'Actual COT',
    kpiCopt: 'Target COPT',
    unitMin: 'min',
    vsTarget: 'vs target:',
    exceededBadge: 'Late',
    achievedBadge: 'On-time',
    stdTarget: 'Standard cycle target',
    kpiAdherence: 'Adherence (COT ≤ COPT)',
    adherenceCount: 'on-target',
    kpiCost: 'Changeover Cost',
    unplannedPrefix: 'Unplanned:',
    trendTitle: 'Monthly Performance Trend',
    trendSub: 'Average Actual COT vs Standard Target COPT',
    legendCot: 'COT Actual',
    legendCopt: 'COPT Target',
    typeSplitTitle: 'Type Split',
    btnCount: 'Count',
    btnCost: 'Cost',
    topFocusTitle: 'Top Focus Models',
    topFocusSub: 'Highest COT',
    recordsTitle: 'Changeover Records',
    recordsSub: 'Historical event logs and duration audit',
    rowsPerPage: 'Rows per page:',
    thDate: 'Date',
    thProcess: 'Process',
    thPrevModel: 'Previous Model',
    thTargetModel: 'Target Model',
    thCot: 'COT (min)',
    thCopt: 'COPT (min)',
    thVariance: 'Variance',
    thType: 'Type',
    thReason: 'Reason / Notes',
    thCost: 'Cost ($)',
    showing: 'Showing',
    to: 'to',
    of: 'of',
    noRecords: 'No matching records',
    footerText: 'Vietnam Samho Co., Ltd. • Lean QCO & SMED Performance Audit System',
    modalTitle: 'Import QCO CSV',
    dropText: 'Click to select or drop CSV here',
    dropSub: 'Accepts DATA_AUTOCUT, DATA_STITCHING, MERGE_DATA',
    modeAppend: 'Append',
    modeReplace: 'Replace All',
    btnCancel: 'Cancel'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  loadData();
});

// INITIALIZE DATA
function loadData() {
  if (window.DEFAULT_QCO_DATA && Array.isArray(window.DEFAULT_QCO_DATA)) {
    allRecords = window.DEFAULT_QCO_DATA;
    onReady();
  } else {
    fetch('qco_data.json')
      .then(r => r.json())
      .then(d => {
        allRecords = d;
        onReady();
      })
      .catch(console.error);
  }
}

function onReady() {
  document.getElementById('statTotalLoaded').textContent = allRecords.length.toLocaleString();
  renderTabs();
  applyFilters();
}

// THEME TOGGLE
function initTheme() {
  const isDark = localStorage.getItem('qco_theme') !== 'light';
  document.documentElement.classList.toggle('dark', isDark);
  document.getElementById('themeIndicator').textContent = isDark ? '◑' : '◐';
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('qco_theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIndicator').textContent = isDark ? '◑' : '◐';
  renderCharts();
}

// LANGUAGE SWITCHER
function initLanguage() {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam === 'en' || langParam === 'vi') {
    currentLang = langParam;
  } else {
    currentLang = localStorage.getItem('qco_lang') || 'vi';
  }
  updateLanguageUI();
}

function toggleLanguage() {
  currentLang = currentLang === 'vi' ? 'en' : 'vi';
  localStorage.setItem('qco_lang', currentLang);
  updateLanguageUI();
  renderTabs();
  applyFilters();
}

function updateLanguageUI() {
  const t = i18n[currentLang];

  // Indicator
  if (currentLang === 'vi') {
    document.getElementById('langVi').className = 'font-bold text-blue-500';
    document.getElementById('langEn').className = 'text-zinc-400 dark:text-zinc-500 font-semibold';
  } else {
    document.getElementById('langEn').className = 'font-bold text-blue-500';
    document.getElementById('langVi').className = 'text-zinc-400 dark:text-zinc-500 font-semibold';
  }

  // Header
  document.getElementById('txtBrandTitle').textContent = t.brandTitle;
  document.getElementById('lblEventsUnit').textContent = t.events;
  document.getElementById('btnUploadCSV').textContent = t.uploadCsv;
  document.getElementById('btnExport').textContent = t.export;

  // Filter options
  document.getElementById('filterYear').options[0].text = t.allYears;
  document.getElementById('filterMonth').options[0].text = t.allMonths;
  for (let m = 1; m <= 12; m++) {
    const opt = document.getElementById('filterMonth').options[m];
    opt.text = currentLang === 'vi' ? `Tháng ${m}` : `Month ${m}`;
  }
  document.getElementById('filterType').options[0].text = t.allTypes;
  document.getElementById('filterType').options[1].text = t.plannedOpt;
  document.getElementById('filterType').options[2].text = t.unplannedOpt;
  document.getElementById('filterSearch').placeholder = t.searchPlaceholder;

  // KPIs
  document.getElementById('lblKpiCot').textContent = t.kpiCot;
  document.getElementById('lblKpiCopt').textContent = t.kpiCopt;
  document.getElementById('lblUnitMin1').textContent = t.unitMin;
  document.getElementById('lblUnitMin2').textContent = t.unitMin;
  document.getElementById('lblVsTarget').textContent = t.vsTarget;
  document.getElementById('lblStdTarget').textContent = t.stdTarget;
  document.getElementById('lblKpiAdherence').textContent = t.kpiAdherence;
  document.getElementById('lblKpiCost').textContent = t.kpiCost;
  document.getElementById('lblUnplannedPrefix').textContent = t.unplannedPrefix;

  // Chart titles & legends
  document.getElementById('txtTrendTitle').textContent = t.trendTitle;
  document.getElementById('txtTrendSub').textContent = t.trendSub;
  document.getElementById('lblLegendCot').textContent = t.legendCot;
  document.getElementById('lblLegendCopt').textContent = t.legendCopt;
  document.getElementById('txtTypeSplitTitle').textContent = t.typeSplitTitle;
  document.getElementById('btnPieCount').textContent = t.btnCount;
  document.getElementById('btnPieCost').textContent = t.btnCost;
  document.getElementById('txtTopFocusTitle').textContent = t.topFocusTitle;
  document.getElementById('txtTopFocusSub').textContent = t.topFocusSub;

  // Records Table
  document.getElementById('txtRecordsTitle').textContent = t.recordsTitle;
  document.getElementById('txtRecordsSub').textContent = t.recordsSub;
  document.getElementById('lblRowsPerPage').textContent = t.rowsPerPage;
  document.getElementById('thDate').textContent = t.thDate;
  document.getElementById('thProcess').textContent = t.thProcess;
  document.getElementById('thPrevModel').textContent = t.thPrevModel;
  document.getElementById('thTargetModel').textContent = t.thTargetModel;
  document.getElementById('thCot').textContent = t.thCot;
  document.getElementById('thCopt').textContent = t.thCopt;
  document.getElementById('thVariance').textContent = t.thVariance;
  document.getElementById('thType').textContent = t.thType;
  document.getElementById('thReason').textContent = t.thReason;
  document.getElementById('thCost').textContent = t.thCost;

  // Footer & Modal
  document.getElementById('footerText').textContent = t.footerText;
  document.getElementById('txtModalTitle').textContent = t.modalTitle;
  document.getElementById('txtDropText').textContent = t.dropText;
  document.getElementById('txtDropSub').textContent = t.dropSub;
  document.getElementById('lblModeAppend').textContent = t.modeAppend;
  document.getElementById('lblModeReplace').textContent = t.modeReplace;
  document.getElementById('btnCancelModal').textContent = t.btnCancel;
}

// TABS: PROCESS SWITCHER (EXCLUDING AUTOCUT)
function renderTabs() {
  const t = i18n[currentLang];
  const processes = ['ALL', ...new Set(allRecords.map(r => r.process).filter(Boolean))]
    .filter(p => p.toUpperCase() !== 'AUTOCUT')
    .sort((a,b) => {
      if (a === 'ALL') return -1;
      if (b === 'ALL') return 1;
      return a.localeCompare(b);
    });

  if (activeProcess === 'AUTOCUT') activeProcess = 'ALL';

  const container = document.getElementById('processTabsContainer');
  container.innerHTML = '';

  processes.forEach(proc => {
    const isAct = activeProcess === proc;
    const btn = document.createElement('button');
    btn.className = `px-3 py-1 rounded-md text-xs font-medium transition ${
      isAct 
        ? 'bg-zinc-800 text-white font-semibold' 
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
    }`;
    btn.textContent = proc === 'ALL' ? t.allProcesses : proc;
    btn.onclick = () => {
      activeProcess = proc;
      renderTabs();
      applyFilters();
    };
    container.appendChild(btn);
  });
}

// FILTER LOGIC
function applyFilters() {
  const year = document.getElementById('filterYear').value;
  const month = document.getElementById('filterMonth').value;
  const type = document.getElementById('filterType').value;
  const search = document.getElementById('filterSearch').value.trim().toLowerCase();

  filteredRecords = allRecords.filter(r => {
    if (activeProcess !== 'ALL' && r.process !== activeProcess) return false;
    if (year !== 'all' && (!r.date || !r.date.startsWith(year))) return false;
    if (month !== 'all') {
      if (!r.date || r.date.substring(5, 7) !== month) return false;
    }
    if (type !== 'all' && r.plan.toLowerCase() !== type.toLowerCase()) return false;
    if (search) {
      const match = (r.model1||'').toLowerCase().includes(search) ||
                    (r.model2||'').toLowerCase().includes(search) ||
                    (r.reason||'').toLowerCase().includes(search);
      if (!match) return false;
    }
    return true;
  });

  updateKPIs();
  renderCharts();
  currentPage = 1;
  renderTable();
}

function resetFilters() {
  document.getElementById('filterYear').value = 'all';
  document.getElementById('filterMonth').value = 'all';
  document.getElementById('filterType').value = 'all';
  document.getElementById('filterSearch').value = '';
  activeProcess = 'ALL';
  renderTabs();
  applyFilters();
}

// 4 CORE KPIS (CURRENCY SWITCHES WITH LANGUAGE)
function updateKPIs() {
  const t = i18n[currentLang];
  if (filteredRecords.length === 0) {
    document.getElementById('kpiAvgCOT').textContent = '0.0';
    document.getElementById('kpiAvgCOPT').textContent = '0.0';
    document.getElementById('kpiCOTDiffBadge').textContent = '-';
    document.getElementById('kpiAdherenceRate').textContent = '0%';
    document.getElementById('kpiAdherenceCount').textContent = `0 ${t.adherenceCount}`;
    document.getElementById('kpiTotalCost').textContent = formatCurrency(0);
    document.getElementById('kpiUnplannedCost').textContent = formatCurrency(0);
    return;
  }

  const n = filteredRecords.length;
  let sumCOT = 0, sumCOPT = 0, sumTotal = 0, sumUnplanned = 0;
  let onTargetCount = 0;

  filteredRecords.forEach(r => {
    sumCOT += (r.cot || 0);
    sumCOPT += (r.copt || 0);
    sumTotal += (r.total || 0);
    if (r.plan === 'Unplanned') sumUnplanned += (r.total || 0);
    if (r.cot <= r.copt) onTargetCount++;
  });

  const avgCOT = sumCOT / n;
  const avgCOPT = sumCOPT / n;
  const diff = avgCOT - avgCOPT;
  const adherence = Math.round((onTargetCount / n) * 100);

  document.getElementById('kpiAvgCOT').textContent = avgCOT.toFixed(1);
  document.getElementById('kpiAvgCOPT').textContent = avgCOPT.toFixed(1);

  const diffBadge = document.getElementById('kpiCOTDiffBadge');
  if (diff > 0) {
    diffBadge.textContent = `+${diff.toFixed(1)} ${t.unitMin}`;
    diffBadge.className = 'font-mono text-rose-400 font-medium';
  } else {
    diffBadge.textContent = `${diff.toFixed(1)} ${t.unitMin}`;
    diffBadge.className = 'font-mono text-emerald-400 font-medium';
  }

  document.getElementById('kpiAdherenceRate').textContent = `${adherence}%`;
  document.getElementById('kpiAdherenceCount').textContent = `${onTargetCount.toLocaleString()} / ${n.toLocaleString()} ${t.adherenceCount}`;

  document.getElementById('kpiTotalCost').textContent = formatCurrency(sumTotal);
  document.getElementById('kpiUnplannedCost').textContent = formatCurrency(sumUnplanned);
}

// FORMAT CURRENCY ACCORDING TO CURRENT LANGUAGE (EN -> $, VI -> VND)
function formatCurrency(v) {
  if (currentLang === 'en') {
    if (v >= 1e6) return '$' + (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'k';
    return '$' + Math.round(v).toLocaleString();
  } else {
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M VND';
    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k VND';
    return Math.round(v).toLocaleString() + ' VND';
  }
}

// PALETTE
function getThemeColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    textColor: isDark ? '#71717a' : '#71717a',
    gridColor: isDark ? '#27272a' : '#e4e4e7',
    blue: '#3b82f6',
    emerald: '#10b981',
    rose: '#f43f5e',
    barBg: isDark ? '#3f3f46' : '#d4d4d8'
  };
}

// RENDER CHARTS
function renderCharts() {
  renderTrend();
  renderType();
  renderFocusModels();
}

// 1. MONTHLY TREND (COT VS COPT)
function renderTrend() {
  const ctx = document.getElementById('chartTrend').getContext('2d');
  const tc = getThemeColors();
  const t = i18n[currentLang];

  const monthly = {};
  filteredRecords.forEach(r => {
    if (!r.date) return;
    const m = r.date.substring(0, 7);
    if (!monthly[m]) monthly[m] = { cotSum: 0, coptSum: 0, count: 0 };
    monthly[m].cotSum += (r.cot || 0);
    monthly[m].coptSum += (r.copt || 0);
    monthly[m].count++;
  });

  const sortedMonths = Object.keys(monthly).sort();
  const cot = sortedMonths.map(m => (monthly[m].cotSum / monthly[m].count).toFixed(1));
  const copt = sortedMonths.map(m => (monthly[m].coptSum / monthly[m].count).toFixed(1));

  if (chartTrend) chartTrend.destroy();

  chartTrend = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedMonths,
      datasets: [
        {
          type: 'line',
          label: t.legendCopt,
          data: copt,
          borderColor: tc.emerald,
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 2.5,
          tension: 0.1,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: t.legendCot,
          data: cot,
          backgroundColor: tc.blue,
          borderRadius: 3,
          maxBarThickness: 24,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          padding: 8,
          bodyFont: { family: 'JetBrains Mono', size: 11 },
          titleFont: { size: 11 },
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw} ${t.unitMin}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: tc.textColor, font: { family: 'JetBrains Mono', size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: { color: tc.textColor, font: { family: 'JetBrains Mono', size: 10 } },
          grid: { color: tc.gridColor },
          beginAtZero: true
        }
      }
    }
  });
}

// 2. TYPE DONUT
function switchPieMode(m) {
  pieMode = m;
  const isCount = m === 'count';
  document.getElementById('btnPieCount').className = isCount 
    ? 'px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm' 
    : 'px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium';
  document.getElementById('btnPieCost').className = !isCount 
    ? 'px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-medium shadow-sm' 
    : 'px-2 py-0.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-medium';
  renderType();
}

function renderType() {
  const ctx = document.getElementById('chartType').getContext('2d');
  const tc = getThemeColors();
  const t = i18n[currentLang];

  let pCount = 0, uCount = 0, pCost = 0, uCost = 0;
  filteredRecords.forEach(r => {
    if (r.plan === 'Planned') {
      pCount++;
      pCost += (r.total || 0);
    } else {
      uCount++;
      uCost += (r.total || 0);
    }
  });

  const data = pieMode === 'count' ? [pCount, uCount] : [Math.round(pCost), Math.round(uCost)];

  if (chartType) chartType.destroy();

  chartType = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: [currentLang === 'vi' ? 'Có KH' : 'Planned', currentLang === 'vi' ? 'Ngoài KH' : 'Unplanned'],
      datasets: [{
        data: data,
        backgroundColor: [tc.blue, tc.rose],
        borderColor: document.documentElement.classList.contains('dark') ? '#09090b' : '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'right',
          labels: { color: tc.textColor, boxWidth: 10, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw;
              const total = data[0] + data[1];
              const pct = total > 0 ? ((val / total) * 100).toFixed(0) : 0;
              return pieMode === 'count' 
                ? ` ${val.toLocaleString()} (${pct}%)` 
                : ` ${formatCurrency(val)} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// 3. TOP FOCUS MODELS (VIBRANT REFINED PRIORITY PALETTE)
function renderFocusModels() {
  const ctx = document.getElementById('chartFocusModels').getContext('2d');
  const tc = getThemeColors();
  const t = i18n[currentLang];

  const map = {};
  filteredRecords.forEach(r => {
    const m = r.model2 || 'Unknown';
    if (!map[m]) map[m] = { cotSum: 0, count: 0 };
    map[m].cotSum += (r.cot || 0);
    map[m].count++;
  });

  const list = Object.keys(map)
    .map(k => ({ model: k, avgCot: map[k].cotSum / map[k].count }))
    .sort((a,b) => b.avgCot - a.avgCot)
    .slice(0, 4);

  if (chartFocusModels) chartFocusModels.destroy();

  const barColors = ['#f43f5e', '#fb923c', '#eab308', '#38bdf8', '#a855f7'];

  chartFocusModels = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: list.map(x => x.model),
      datasets: [{
        data: list.map(x => x.avgCot.toFixed(1)),
        backgroundColor: list.map((_, i) => barColors[i % barColors.length]),
        borderRadius: 3,
        maxBarThickness: 14
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` COT: ${ctx.raw} ${t.unitMin}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: tc.textColor, font: { family: 'JetBrains Mono', size: 9 } },
          grid: { color: tc.gridColor },
          beginAtZero: true
        },
        y: {
          ticks: { color: tc.textColor, font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  });
}

// DATA TABLE & SORT
function sortTable(col) {
  if (currentSort.column === col) {
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
  } else {
    currentSort.column = col;
    currentSort.order = 'asc';
  }
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('tbodyDetail');
  tbody.innerHTML = '';
  const t = i18n[currentLang];

  const sorted = [...filteredRecords].sort((a,b) => {
    let va = a[currentSort.column];
    let vb = b[currentSort.column];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return currentSort.order === 'asc' ? -1 : 1;
    if (va > vb) return currentSort.order === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="py-4 text-center text-zinc-500 font-sans">${t.noRecords}</td></tr>`;
  } else {
    pageItems.forEach(r => {
      const diff = (r.cot || 0) - (r.copt || 0);
      const isExceeded = diff > 0;
      const typeDisplay = r.plan === 'Planned' 
        ? (currentLang === 'vi' ? 'Có KH' : 'Planned') 
        : (currentLang === 'vi' ? 'Ngoài KH' : 'Unplanned');

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors';
      tr.innerHTML = `
        <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">${r.date || '-'}</td>
        <td class="py-2 px-3 text-zinc-500 dark:text-zinc-400">${r.process}</td>
        <td class="py-2 px-3 text-zinc-700 dark:text-zinc-300 font-sans font-medium">${r.model1}</td>
        <td class="py-2 px-3 text-zinc-900 dark:text-white font-sans font-medium">${r.model2}</td>
        <td class="py-2 px-3 text-right font-medium text-zinc-900 dark:text-white">${(r.cot||0).toFixed(1)}</td>
        <td class="py-2 px-3 text-right text-zinc-400 dark:text-zinc-500">${(r.copt||0).toFixed(1)}</td>
        <td class="py-2 px-3 text-right ${isExceeded ? 'text-rose-500 font-medium' : 'text-emerald-500'}">
          ${isExceeded ? '+' : ''}${diff.toFixed(1)}
        </td>
        <td class="py-2 px-3 text-center">
          <span class="text-[10px] uppercase tracking-wider font-semibold ${r.plan === 'Planned' ? 'text-zinc-400' : 'text-rose-500'}">
            ${typeDisplay}
          </span>
        </td>
        <td class="py-2 px-3 text-zinc-400 dark:text-zinc-500 truncate max-w-[180px]" title="${r.reason || ''}">
          ${r.reason || '—'}
        </td>
        <td class="py-2 px-3 text-right text-zinc-700 dark:text-zinc-300 font-medium">${formatCurrency(r.total || 0)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  document.getElementById('paginationInfo').textContent = `${t.showing} ${start + 1} ${t.to} ${Math.min(start + pageSize, sorted.length)} ${t.of} ${sorted.length.toLocaleString()}`;
  renderPagination(totalPages);
}

function renderPagination(total) {
  const container = document.getElementById('paginationButtons');
  container.innerHTML = '';

  const btnPrev = document.createElement('button');
  btnPrev.className = `px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-black dark:hover:text-white'}`;
  btnPrev.textContent = '←';
  btnPrev.disabled = currentPage === 1;
  btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
  container.appendChild(btnPrev);

  const span = document.createElement('span');
  span.className = 'px-2 font-mono text-zinc-500 text-xs';
  span.textContent = `${currentPage} / ${total}`;
  container.appendChild(span);

  const btnNext = document.createElement('button');
  btnNext.className = `px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 ${currentPage === total ? 'opacity-30 cursor-not-allowed' : 'hover:text-black dark:hover:text-white'}`;
  btnNext.textContent = '→';
  btnNext.disabled = currentPage === total;
  btnNext.onclick = () => { if (currentPage < total) { currentPage++; renderTable(); } };
  container.appendChild(btnNext);
}

function changePageSize() {
  pageSize = parseInt(document.getElementById('selPageSize').value);
  currentPage = 1;
  renderTable();
}

// CSV EXPORT
function exportCurrentData() {
  if (filteredRecords.length === 0) return;
  const costColName = currentLang === 'en' ? 'Total Cost ($)' : 'Tổng Chi phí (VND)';
  const headers = ['Date', 'Process', '1st Model', '2nd Model', 'COT', 'COPT', costColName, 'Plan_Unplan', 'Reasons'];
  const rows = [headers.join(',')];

  filteredRecords.forEach(r => {
    rows.push([
      r.date,
      r.process,
      `"${(r.model1||'').replace(/"/g, '""')}"`,
      `"${(r.model2||'').replace(/"/g, '""')}"`,
      r.cot,
      r.copt,
      r.total,
      r.plan,
      `"${(r.reason||'').replace(/"/g, '""')}"`
    ].join(','));
  });

  const blob = new Blob(["\uFEFF" + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Lean_QCO_${activeProcess}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// UPLOAD MODAL
function openUploadModal() {
  document.getElementById('uploadModal').classList.remove('hidden');
}
function closeUploadModal() {
  document.getElementById('uploadModal').classList.add('hidden');
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const status = document.getElementById('uploadStatus');
  status.classList.remove('hidden');
  status.textContent = 'Reading CSV...';

  const mode = document.querySelector('input[name="uploadMode"]:checked').value;

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (res) => {
      const parsed = [];
      res.data.forEach((row, i) => {
        const d = row['Date'] || row['date'] || '';
        if (!d) return;
        const dateStr = d.includes('T') ? d.split('T')[0] : d.slice(0, 10);
        const m1 = (row['1st Model'] || row['model1'] || '').trim();
        const m2 = (row['2nd Model'] || row['model2'] || '').trim();
        if (!m1 && !m2) return;

        parsed.push({
          id: allRecords.length + i + 1,
          date: dateStr,
          process: (row['Process'] || file.name.split('.')[0]).toUpperCase(),
          model1: m1,
          model2: m2,
          cot: parseFloat(row['COT'] || 0) || 0,
          copt: parseFloat(row['COPT'] || 0) || 0,
          total: parseFloat(row['Total'] || 0) || 0,
          plan: (row['Plan_Unplan'] || 'Planned').includes('Unplan') ? 'Unplanned' : 'Planned',
          reason: (row['Reasons'] || '').trim()
        });
      });

      if (mode === 'replace') allRecords = parsed;
      else allRecords = [...allRecords, ...parsed];

      status.textContent = `Imported ${parsed.length} records.`;
      setTimeout(() => {
        closeUploadModal();
        onReady();
      }, 700);
    }
  });
}
