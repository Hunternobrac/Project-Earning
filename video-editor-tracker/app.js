// Video Editor Performance & Income Tracker
// Application Logic

let projects = [];
let selectedProjectIds = new Set();
let revenueChart = null;
let statusChart = null;
let financialChart = null;

// Seed Data
const defaultProjects = [
  {
    id: "p1",
    title: "Tech Review - iPhone 17 Pro Launch",
    client: "TechTalk Channel",
    status: "Completed",
    budget: 18000,
    paid: 18000,
    payStatus: "Paid",
    rawLength: 45,
    finalLength: 12,
    hours: 14,
    dueDate: "2026-06-10",
    completedDate: "2026-06-08"
  },
  {
    id: "p2",
    title: "Summer Vlog - Bali Highlights Ep 1",
    client: "Alex Travels",
    status: "Review",
    budget: 25000,
    paid: 10000,
    payStatus: "Partial",
    rawLength: 120,
    finalLength: 18,
    hours: 22,
    dueDate: "2026-06-28",
    completedDate: ""
  },
  {
    id: "p3",
    title: "Commercial Ad - Organic Coffee Roast",
    client: "Coffee Roasters Inc",
    status: "Color & Sound",
    budget: 40000,
    paid: 0,
    payStatus: "Unpaid",
    rawLength: 30,
    finalLength: 1.5,
    hours: 8,
    dueDate: "2026-07-02",
    completedDate: ""
  },
  {
    id: "p4",
    title: "TikTok & Reel Pack - June Series",
    client: "FitLife Academy",
    status: "Completed",
    budget: 15000,
    paid: 15000,
    payStatus: "Paid",
    rawLength: 15,
    finalLength: 3,
    hours: 5.5,
    dueDate: "2026-06-15",
    completedDate: "2026-06-14"
  },
  {
    id: "p5",
    title: "Mindset Podcast - Episode 12",
    client: "Mindset Podcast",
    status: "Footage Received",
    budget: 12000,
    paid: 0,
    payStatus: "Unpaid",
    rawLength: 90,
    finalLength: 45,
    hours: 6,
    dueDate: "2026-07-05",
    completedDate: ""
  },
  {
    id: "p6",
    title: "Real Estate Luxury Tour - Skyvilla",
    client: "Prime Properties",
    status: "Completed",
    budget: 30000,
    paid: 30000,
    payStatus: "Paid",
    rawLength: 60,
    finalLength: 5,
    hours: 16,
    dueDate: "2026-06-20",
    completedDate: "2026-06-19"
  }
];

// Document Load Initiator
document.addEventListener("DOMContentLoaded", () => {
  initDatabase();
  switchView('dashboard');
  populateFilterOptions();
  renderDashboard();
});

// Database Initialization
function initDatabase() {
  const localData = localStorage.getItem("editor_tracker_projects");
  if (localData) {
    projects = JSON.parse(localData);
  } else {
    projects = [...defaultProjects];
    saveToLocalStorage();
  }
}

function saveToLocalStorage() {
  localStorage.setItem("editor_tracker_projects", JSON.stringify(projects));
}

// Log Activity/Milestone
function logMilestone(activity, timeText) {
  const log = document.getElementById("activity-log");
  if (!log) return;

  const colors = ["#10b981", "#06b6d4", "#f59e0b", "#8b5cf6", "#ef4444"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const div = document.createElement("div");
  div.className = "activity-item";
  div.innerHTML = `
    <div class="activity-dot" style="background-color: ${randomColor}"></div>
    <div class="activity-info">
      <p>${activity}</p>
      <span class="activity-time">${timeText}</span>
    </div>
  `;
  log.prepend(div);
}

// Generate Recent Milestones List
function generateMilestones() {
  const log = document.getElementById("activity-log");
  if (!log) return;
  log.innerHTML = "";

  // Completed projects milestones
  const completed = projects.filter(p => p.status === "Completed");
  completed.forEach(p => {
    logMilestone(`Completed video edit: <strong>${p.title}</strong> for <strong>${p.client}</strong>.`, `Cleared on ${p.completedDate}`);
  });

  // Unpaid invoices milestones
  const unpaid = projects.filter(p => p.payStatus === "Unpaid");
  unpaid.forEach(p => {
    logMilestone(`Invoice pending: <strong>₹${p.budget.toLocaleString('en-IN')}</strong> outstanding from <strong>${p.client}</strong>.`, `Due by ${p.dueDate}`);
  });

  if (log.innerHTML === "") {
    log.innerHTML = "<div style='color:var(--text-muted);font-size:0.85rem;'>No recent activity. Get started by adding a project!</div>";
  }
}

// Theme Management
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  body.setAttribute("data-theme", newTheme);
  
  // Icon toggling
  const moon = document.getElementById("theme-icon-moon");
  const sun = document.getElementById("theme-icon-sun");
  if (newTheme === "light") {
    moon.style.display = "none";
    sun.style.display = "block";
  } else {
    moon.style.display = "block";
    sun.style.display = "none";
  }

  // Re-render charts for color scheme adaptation
  renderCharts();
}

// Navigation between tabs
function switchView(viewName) {
  // Update nav-item styling
  document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
  document.getElementById(`nav-${viewName}`).classList.add("active");

  // Toggle page visibility
  document.querySelectorAll(".page-view").forEach(view => view.classList.remove("active"));
  document.getElementById(`view-${viewName}`).classList.add("active");

  // Action states based on views
  if (viewName === "dashboard") {
    renderDashboard();
  } else if (viewName === "sheet") {
    renderSpreadsheet();
    selectedProjectIds.clear();
    updateBulkInvoiceButton();
  } else if (viewName === "analytics") {
    renderAnalytics();
  } else if (viewName === "clients") {
    renderClients();
  }
}

// Financial Statistics Calculation
function calculateStats() {
  const today = new Date("2026-06-26"); // Mock current date representing USER_METADATA
  const currentMonthStr = "2026-06"; // Current Month

  // Monthly Income: Sum of paid amounts for completed/paid projects in current month
  let monthlyIncome = 0;
  // Unpaid balance: Sum of all unpaid parts across all projects
  let unpaidBalance = 0;
  // Hours spent vs edited duration
  let totalHours = 0;
  let totalFinalMinutes = 0;
  // Turnaround times
  let turnaroundTotalDays = 0;
  let turnaroundCount = 0;

  // Backlog counters
  let backlogCount = 0;
  let backlogValue = 0;

  projects.forEach(p => {
    const isCompleted = p.status === "Completed";
    const due = p.budget - p.paid;

    // 1. Calculate Monthly Income: sum of paid values for items completed in current month
    // OR if paid in current month (assume completed date is payment date)
    if (p.completedDate && p.completedDate.startsWith(currentMonthStr)) {
      monthlyIncome += p.paid;
    }
    
    // 2. Unpaid Balance calculation (Budget - Paid Amount)
    if (due > 0) {
      unpaidBalance += due;
    }

    // 3. Efficiency Calculations
    if (p.hours > 0 && p.finalLength > 0) {
      totalHours += p.hours;
      totalFinalMinutes += p.finalLength;
    }

    // 4. Turnaround Time calculation
    if (isCompleted && p.dueDate && p.completedDate) {
      const dueDt = new Date(p.dueDate);
      const startDt = new Date(dueDt.getTime() - (7 * 24 * 60 * 60 * 1000));
      const compDt = new Date(p.completedDate);
      const diffTime = Math.abs(compDt - startDt);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      turnaroundTotalDays += diffDays;
      turnaroundCount++;
    }

    // 5. Incomplete backlog calculation
    if (!isCompleted) {
      backlogCount++;
      backlogValue += due;
    }
  });

  const efficiency = totalFinalMinutes > 0 ? (totalHours / totalFinalMinutes) : 0;
  const turnaround = turnaroundCount > 0 ? (turnaroundTotalDays / turnaroundCount) : 0;

  return {
    monthlyIncome,
    unpaidBalance,
    efficiency,
    turnaround,
    backlogCount,
    backlogValue
  };
}

// Render Dashboard View
function renderDashboard() {
  const stats = calculateStats();

  // Populate UI values
  document.getElementById("stat-monthly-income").textContent = `₹${stats.monthlyIncome.toLocaleString('en-IN')}`;
  document.getElementById("stat-unpaid-income").textContent = `₹${stats.unpaidBalance.toLocaleString('en-IN')}`;
  document.getElementById("stat-efficiency").textContent = `${stats.efficiency.toFixed(1)}h/min`;
  document.getElementById("stat-turnaround").textContent = `${stats.turnaround.toFixed(1)} days`;
  
  // Backlog values
  document.getElementById("stat-backlog-count").textContent = stats.backlogCount;
  document.getElementById("stat-backlog-value").textContent = `₹${stats.backlogValue.toLocaleString('en-IN')}`;

  // Draw charts & milestones list
  renderCharts();
  generateMilestones();
}

// Chart.js Rendering Engine
function renderCharts() {
  const theme = document.body.getAttribute("data-theme") || "dark";
  const gridColor = theme === "dark" ? "#2b2e38" : "#cbd5e1";
  const labelColor = theme === "dark" ? "#94a3b8" : "#64748b";
  const titleColor = theme === "dark" ? "#e2e8f0" : "#0f172a";

  // --- CHART 1: MONTHLY REVENUES (Bar Chart) ---
  const revCtx = document.getElementById("revenueChart");
  if (!revCtx) return;

  if (revenueChart) {
    revenueChart.destroy();
  }

  // Parse project values into monthly breakdown
  const monthlyData = {};
  projects.forEach(p => {
    let month = "Ongoing";
    if (p.completedDate) {
      const d = new Date(p.completedDate);
      month = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    } else if (p.dueDate) {
      const d = new Date(p.dueDate);
      month = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    }
    
    if (!monthlyData[month]) {
      monthlyData[month] = { paid: 0, budget: 0 };
    }
    monthlyData[month].paid += p.paid;
    monthlyData[month].budget += p.budget;
  });

  const months = Object.keys(monthlyData);
  const paidRevenues = months.map(m => monthlyData[m].paid);
  const totalBudgets = months.map(m => monthlyData[m].budget);

  revenueChart = new Chart(revCtx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Revenue Received (₹)',
          data: paidRevenues,
          backgroundColor: '#06b6d4',
          borderRadius: 4
        },
        {
          label: 'Total Project Value (₹)',
          data: totalBudgets,
          backgroundColor: '#10b981',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: labelColor }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: labelColor }
        }
      },
      plugins: {
        legend: {
          labels: { color: labelColor }
        }
      }
    }
  });

  // --- CHART 2: PROJECT STATUS BREAKDOWN (Doughnut) ---
  const statusCtx = document.getElementById("statusBreakdownChart");
  if (statusCtx) {
    if (statusChart) {
      statusChart.destroy();
    }

    const stages = {
      "Footage Received": 0,
      "Rough Cut": 0,
      "Color & Sound": 0,
      "Review": 0,
      "Completed": 0
    };

    projects.forEach(p => {
      if (stages[p.status] !== undefined) {
        stages[p.status]++;
      }
    });

    statusChart = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(stages),
        datasets: [{
          data: Object.values(stages),
          backgroundColor: ['#94a3b8', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: labelColor }
          }
        }
      }
    });
  }

  // --- CHART 3: FINANCIAL HEALTH (Pie Chart) ---
  const finCtx = document.getElementById("financialPieChart");
  if (finCtx) {
    if (financialChart) {
      financialChart.destroy();
    }

    let totalPaid = 0;
    let totalDues = 0;

    projects.forEach(p => {
      totalPaid += p.paid;
      totalDues += (p.budget - p.paid);
    });

    financialChart = new Chart(finCtx, {
      type: 'pie',
      data: {
        labels: ['Amount Paid (Cleared)', 'Amount Due (Unpaid)'],
        datasets: [{
          data: [totalPaid, totalDues],
          backgroundColor: ['#10b981', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: labelColor }
          }
        }
      }
    });
  }
}

// Render Spreadsheet / Table View
function renderSpreadsheet() {
  const tableBody = document.getElementById("project-table-body");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  const filterClient = document.getElementById("filter-client").value;
  const filterStatus = document.getElementById("filter-status").value;
  const filterMonth = document.getElementById("filter-month").value;

  let filteredProjects = projects;

  // Search input filter
  const searchQuery = document.getElementById("global-search").value.toLowerCase();
  if (searchQuery) {
    filteredProjects = filteredProjects.filter(p => 
      p.title.toLowerCase().includes(searchQuery) || 
      p.client.toLowerCase().includes(searchQuery)
    );
  }

  // Dropdown Filters
  if (filterClient !== "all") {
    filteredProjects = filteredProjects.filter(p => p.client === filterClient);
  }

  if (filterStatus !== "all") {
    filteredProjects = filteredProjects.filter(p => p.status === filterStatus);
  }

  if (filterMonth !== "all") {
    filteredProjects = filteredProjects.filter(p => {
      const dateStr = p.completedDate || p.dueDate;
      if (!dateStr) return false;
      return dateStr.startsWith(filterMonth);
    });
  }

  // Populate row count
  document.getElementById("filtered-count").textContent = filteredProjects.length;
  document.getElementById("total-count").textContent = projects.length;

  // Render rows
  filteredProjects.forEach(p => {
    const due = p.budget - p.paid;
    const isChecked = selectedProjectIds.has(p.id) ? "checked" : "";
    const isSelectedRow = selectedProjectIds.has(p.id) ? "selected" : "";

    const tr = document.createElement("tr");
    tr.className = isSelectedRow;
    tr.innerHTML = `
      <td style="text-align: center;">
        <input type="checkbox" ${isChecked} onchange="toggleSelectProject('${p.id}', this)">
      </td>
      <td><strong>${p.title}</strong></td>
      <td>${p.client}</td>
      <td>₹${p.budget.toLocaleString('en-IN')}</td>
      <td>₹${p.paid.toLocaleString('en-IN')}</td>
      <td style="color: ${due > 0 ? 'var(--danger)' : 'var(--text-main)'}">₹${due.toLocaleString('en-IN')}</td>
      <td>
        <select class="badge ${getStatusBadgeClass(p.status)}" onchange="updateProjectStatusInline('${p.id}', this.value)">
          <option value="Footage Received" ${p.status === "Footage Received" ? "selected" : ""}>Footage Received</option>
          <option value="Rough Cut" ${p.status === "Rough Cut" ? "selected" : ""}>Rough Cut</option>
          <option value="Color & Sound" ${p.status === "Color & Sound" ? "selected" : ""}>Color & Sound</option>
          <option value="Review" ${p.status === "Review" ? "selected" : ""}>Review</option>
          <option value="Completed" ${p.status === "Completed" ? "selected" : ""}>Completed</option>
        </select>
      </td>
      <td>
        <select class="badge ${getPayBadgeClass(p.payStatus)}" onchange="updateProjectPaymentStatusInline('${p.id}', this.value)">
          <option value="Unpaid" ${p.payStatus === "Unpaid" ? "selected" : ""}>Unpaid</option>
          <option value="Partial" ${p.payStatus === "Partial" ? "selected" : ""}>Partial</option>
          <option value="Paid" ${p.payStatus === "Paid" ? "selected" : ""}>Paid</option>
        </select>
      </td>
      <td>${p.rawLength || '-'}</td>
      <td>${p.finalLength || '-'}</td>
      <td>${renderTimerCell(p)}</td>
      <td>${p.dueDate || '-'}</td>
      <td>${p.completedDate || '-'}</td>
      <td style="text-align: center;">
        <div style="display:flex; justify-content:center; gap:6px;">
          <!-- Create Invoice Button -->
          <button class="action-icon-btn" onclick="openSingleInvoice('${p.id}')" title="Invoice">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </button>
          
          <!-- Edit button -->
          <button class="action-icon-btn" onclick="openEditProjectModal('${p.id}')" title="Edit">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
          
          <!-- Delete button -->
          <button class="action-icon-btn" style="color:var(--danger);" onclick="deleteProject('${p.id}')" title="Delete">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function renderTimerCell(p) {
  const isRunning = p.timerStart !== undefined && p.timerStart !== null;
  const hours = p.hours || 0;
  
  if (isRunning) {
    const elapsedMs = Date.now() - p.timerStart;
    const currentTotal = hours + (elapsedMs / 3600000);
    return `
      <div class="timer-container" id="timer-display-${p.id}" data-start="${p.timerStart}" data-logged="${hours}">
        <span class="timer-dot"></span>
        <span>${currentTotal.toFixed(2)}h</span>
        <button class="timer-btn active" onclick="toggleTimer('${p.id}')" title="Pause Timer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;">
            <path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;
  } else {
    return `
      <div class="timer-container">
        <span>${hours.toFixed(1)}h</span>
        <button class="timer-btn" onclick="toggleTimer('${p.id}')" title="Start Timer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" style="width:12px;height:12px;">
            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    `;
  }
}

function toggleTimer(id) {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return;

  const p = projects[idx];
  const now = Date.now();
  const isRunning = p.timerStart !== undefined && p.timerStart !== null;

  if (isRunning) {
    const elapsedMs = now - p.timerStart;
    p.hours = (p.hours || 0) + (elapsedMs / 3600000);
    p.timerStart = null;
    logMilestone(`Stopped timer for: <strong>${p.title}</strong>. Logged <strong>${(elapsedMs/3600000).toFixed(2)} hours</strong>.`, "Just now");
  } else {
    // Stop all other timers
    projects.forEach(otherProj => {
      if (otherProj.timerStart) {
        const elapsed = now - otherProj.timerStart;
        otherProj.hours = (otherProj.hours || 0) + (elapsed / 3600000);
        otherProj.timerStart = null;
      }
    });

    p.timerStart = now;
    logMilestone(`Started timer for: <strong>${p.title}</strong>. Tracking editing time... ⏱️`, "Just now");
  }

  saveToLocalStorage();
  renderSpreadsheet();
}

function updateRunningTimers() {
  const activeDisplays = document.querySelectorAll('[id^="timer-display-"]');
  if (activeDisplays.length === 0) return;

  activeDisplays.forEach(el => {
    const startTime = parseInt(el.getAttribute("data-start"));
    const loggedHours = parseFloat(el.getAttribute("data-logged"));
    if (isNaN(startTime) || isNaN(loggedHours)) return;

    const elapsedMs = Date.now() - startTime;
    const currentTotal = loggedHours + (elapsedMs / 3600000);
    
    const timeSpan = el.querySelector('span:not(.timer-dot)');
    if (timeSpan) {
      timeSpan.textContent = `${currentTotal.toFixed(2)}h`;
    }
  });
}

// Global update interval
if (!window.timerIntervalInitialized) {
  setInterval(updateRunningTimers, 1000);
  window.timerIntervalInitialized = true;
}

function updateProjectStatusInline(id, newStatus) {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return;

  const oldStatus = projects[idx].status;

  // If timer is running, stop it first!
  if (newStatus === "Completed" && projects[idx].timerStart) {
    const elapsedMs = Date.now() - projects[idx].timerStart;
    projects[idx].hours = (projects[idx].hours || 0) + (elapsedMs / 3600000);
    projects[idx].timerStart = null;
  }

  projects[idx].status = newStatus;

  // If status changed to Completed, add Completed Date (today) and celebrate!
  if (newStatus === "Completed" && oldStatus !== "Completed") {
    const today = new Date();
    projects[idx].completedDate = today.toISOString().split('T')[0];
    triggerCelebration();
    logMilestone(`Celebrated milestone! <strong>${projects[idx].title}</strong> is now marked as Completed! 🎉`, "Just now");
  } else if (oldStatus === "Completed" && newStatus !== "Completed") {
    projects[idx].completedDate = "";
  }

  saveToLocalStorage();
  renderSpreadsheet();
}

function updateProjectPaymentStatusInline(id, newPayStatus) {
  const idx = projects.findIndex(p => p.id === id);
  if (idx === -1) return;

  const oldPayStatus = projects[idx].payStatus;
  projects[idx].payStatus = newPayStatus;

  // Auto set paid amount if marked Paid
  if (newPayStatus === "Paid" && oldPayStatus !== "Paid") {
    projects[idx].paid = projects[idx].budget;
    triggerCelebration();
    logMilestone(`Celebrated milestone! <strong>${projects[idx].title}</strong> is now fully Paid! 🎉`, "Just now");
  } else if (newPayStatus === "Unpaid") {
    projects[idx].paid = 0;
  }

  saveToLocalStorage();
  renderSpreadsheet();
}

// Helpers for badges
function getStatusBadgeClass(status) {
  switch (status) {
    case "Footage Received": return "badge-status-footage";
    case "Rough Cut": return "badge-status-rough";
    case "Color & Sound": return "badge-status-color";
    case "Review": return "badge-status-review";
    case "Completed": return "badge-status-completed";
    default: return "";
  }
}

function getPayBadgeClass(payStatus) {
  switch (payStatus) {
    case "Paid": return "badge-pay-paid";
    case "Unpaid": return "badge-pay-unpaid";
    case "Partial": return "badge-pay-partial";
    default: return "";
  }
}

// Populate search drop-downs dynamically
function populateFilterOptions() {
  const clientSelect = document.getElementById("filter-client");
  const monthSelect = document.getElementById("filter-month");

  if (!clientSelect || !monthSelect) return;

  // Clear except first option
  clientSelect.innerHTML = '<option value="all">All Clients</option>';
  monthSelect.innerHTML = '<option value="all">All Months</option>';

  const clients = new Set();
  const months = new Set();

  projects.forEach(p => {
    if (p.client) clients.add(p.client);
    
    const dateStr = p.completedDate || p.dueDate;
    if (dateStr && dateStr.length >= 7) {
      months.add(dateStr.substring(0, 7)); // YYYY-MM
    }
  });

  // Sort and append
  Array.from(clients).sort().forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    clientSelect.appendChild(opt);
  });

  Array.from(months).sort().reverse().forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    const dateObj = new Date(m + "-01");
    opt.textContent = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    monthSelect.appendChild(opt);
  });
}

function applyFilters() {
  renderSpreadsheet();
}

function handleSearch(val) {
  renderSpreadsheet();
}

// Grid checkbox control handlers
function toggleSelectAll(masterCheckbox) {
  selectedProjectIds.clear();
  if (masterCheckbox.checked) {
    projects.forEach(p => selectedProjectIds.add(p.id));
  }
  renderSpreadsheet();
  updateBulkInvoiceButton();
}

function toggleSelectProject(id, cb) {
  if (cb.checked) {
    selectedProjectIds.add(id);
  } else {
    selectedProjectIds.delete(id);
  }
  
  // Update select-all master state
  const master = document.getElementById("select-all-checkbox");
  if (master) {
    master.checked = (selectedProjectIds.size === projects.length);
  }

  renderSpreadsheet();
  updateBulkInvoiceButton();
}

function updateBulkInvoiceButton() {
  const btn = document.getElementById("bulk-invoice-btn");
  const countSpan = document.getElementById("bulk-invoice-count");
  if (!btn) return;

  if (selectedProjectIds.size > 0) {
    btn.style.display = "inline-flex";
    countSpan.textContent = selectedProjectIds.size;
  } else {
    btn.style.display = "none";
  }
}

// Render detailed analytics page
function renderAnalytics() {
  // Financial calculation summaries
  let totalBudget = 0;
  let totalPaid = 0;
  let totalFinalMinutes = 0;
  let totalRawMinutes = 0;
  let totalHours = 0;
  let completedCount = 0;

  projects.forEach(p => {
    totalBudget += p.budget;
    totalPaid += p.paid;
    if (p.status === "Completed") {
      completedCount++;
    }
    if (p.finalLength) totalFinalMinutes += p.finalLength;
    if (p.rawLength) totalRawMinutes += p.rawLength;
    if (p.hours) totalHours += p.hours;
  });

  const avgBudget = projects.length > 0 ? (totalBudget / projects.length) : 0;
  const earnPerMin = totalFinalMinutes > 0 ? (totalBudget / totalFinalMinutes) : 0;
  const footageRatio = totalFinalMinutes > 0 ? (totalRawMinutes / totalFinalMinutes) : 0;
  const hourlyWage = totalHours > 0 ? (totalBudget / totalHours) : 0;

  document.getElementById("analytic-avg-budget").textContent = `₹${avgBudget.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
  document.getElementById("analytic-earn-per-min").textContent = `₹${earnPerMin.toLocaleString('en-IN', {maximumFractionDigits: 0})}/min`;
  document.getElementById("analytic-footage-ratio").textContent = `${footageRatio.toFixed(1)}:1`;
  document.getElementById("analytic-hourly-wage").textContent = `₹${hourlyWage.toLocaleString('en-IN', {maximumFractionDigits: 0})}/hr`;

  renderCharts();
}

// Project Modal Control
function openAddProjectModal() {
  document.getElementById("modal-title").textContent = "New Project";
  document.getElementById("project-form").reset();
  document.getElementById("project-id").value = "";
  document.getElementById("project-modal").classList.add("active");
}

function openEditProjectModal(id) {
  const p = projects.find(item => item.id === id);
  if (!p) return;

  document.getElementById("modal-title").textContent = "Edit Project";
  document.getElementById("project-id").value = p.id;
  document.getElementById("p-title").value = p.title;
  document.getElementById("p-client").value = p.client;
  document.getElementById("p-status").value = p.status;
  document.getElementById("p-budget").value = p.budget;
  document.getElementById("p-paid").value = p.paid;
  document.getElementById("p-pay-status").value = p.payStatus;
  document.getElementById("p-raw-length").value = p.rawLength || "";
  document.getElementById("p-final-length").value = p.finalLength || "";
  document.getElementById("p-hours").value = p.hours || "";
  document.getElementById("p-due-date").value = p.dueDate || "";
  document.getElementById("p-comp-date").value = p.completedDate || "";

  document.getElementById("project-modal").classList.add("active");
}

function closeProjectModal() {
  document.getElementById("project-modal").classList.remove("active");
}

function autoCalculatePaymentStatus() {
  const budget = parseFloat(document.getElementById("p-budget").value) || 0;
  const paid = parseFloat(document.getElementById("p-paid").value) || 0;
  const payStatusSelect = document.getElementById("p-pay-status");

  if (paid >= budget && budget > 0) {
    payStatusSelect.value = "Paid";
  } else if (paid > 0 && paid < budget) {
    payStatusSelect.value = "Partial";
  } else {
    payStatusSelect.value = "Unpaid";
  }
}

// Save Project (Add / Edit)
function saveProject(e) {
  e.preventDefault();

  const id = document.getElementById("project-id").value;
  const title = document.getElementById("p-title").value;
  const client = document.getElementById("p-client").value;
  const status = document.getElementById("p-status").value;
  const budget = parseFloat(document.getElementById("p-budget").value) || 0;
  const paid = parseFloat(document.getElementById("p-paid").value) || 0;
  const payStatus = document.getElementById("p-pay-status").value;
  const rawLength = parseFloat(document.getElementById("p-raw-length").value) || null;
  const finalLength = parseFloat(document.getElementById("p-final-length").value) || null;
  const hours = parseFloat(document.getElementById("p-hours").value) || null;
  const dueDate = document.getElementById("p-due-date").value;
  const completedDate = document.getElementById("p-comp-date").value;

  const isNew = !id;
  
  if (isNew) {
    const newProj = {
      id: "p_" + Date.now(),
      title, client, status, budget, paid, payStatus,
      rawLength, finalLength, hours, dueDate, completedDate
    };
    projects.push(newProj);
    logMilestone(`Added project: <strong>${title}</strong> for <strong>${client}</strong>.`, "Just now");
  } else {
    const idx = projects.findIndex(item => item.id === id);
    if (idx !== -1) {
      const oldProj = projects[idx];
      // Celebrate if project has transitioned to Completed or Paid just now
      const justCompleted = (status === "Completed" && oldProj.status !== "Completed");
      const justPaid = (payStatus === "Paid" && oldProj.payStatus !== "Paid");

      projects[idx] = {
        id, title, client, status, budget, paid, payStatus,
        rawLength, finalLength, hours, dueDate, completedDate
      };

      if (justCompleted || justPaid) {
        triggerCelebration();
        logMilestone(`Celebrated milestone! <strong>${title}</strong> is now marked as ${justCompleted ? 'Completed' : 'fully Paid'}! 🎉`, "Just now");
      } else {
        logMilestone(`Updated project details: <strong>${title}</strong>.`, "Just now");
      }
    }
  }

  saveToLocalStorage();
  closeProjectModal();
  populateFilterOptions();
  
  // Re-render active screens
  const activeView = document.querySelector(".page-view.active").id;
  if (activeView === "view-dashboard") renderDashboard();
  else if (activeView === "view-sheet") renderSpreadsheet();
  else if (activeView === "view-analytics") renderAnalytics();
}

function deleteProject(id) {
  const p = projects.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Are you sure you want to delete "${p.title}"?`)) {
    projects = projects.filter(item => item.id !== id);
    selectedProjectIds.delete(id);
    logMilestone(`Deleted project: <strong>${p.title}</strong>.`, "Just now");
    saveToLocalStorage();
    populateFilterOptions();
    
    // Refresh table or dashboards
    const activeView = document.querySelector(".page-view.active").id;
    if (activeView === "view-dashboard") renderDashboard();
    else if (activeView === "view-sheet") {
      renderSpreadsheet();
      updateBulkInvoiceButton();
    }
    else if (activeView === "view-analytics") renderAnalytics();
  }
}

// Celebration (Confetti) trigger
function triggerCelebration() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b']
  });
}

// EXPORT TO EXCEL / CSV FUNCTION
function exportToCSV() {
  if (projects.length === 0) {
    alert("No projects to export.");
    return;
  }

  const csvRows = [];
  // Headers
  const headers = [
    "Project ID", "Video Title", "Client Name", "Editing Stage", 
    "Total Budget (INR)", "Amount Paid (INR)", "Remaining Due (INR)", 
    "Payment Status", "Raw Size (Min)", "Final Size (Min)", 
    "Edit Hours Spent", "Due Date", "Completed Date"
  ];
  csvRows.push(headers.join(","));

  projects.forEach(p => {
    const due = p.budget - p.paid;
    const row = [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.client.replace(/"/g, '""')}"`,
      p.status,
      p.budget,
      p.paid,
      due,
      p.payStatus,
      p.rawLength || "",
      p.finalLength || "",
      p.hours || "",
      p.dueDate || "",
      p.completedDate || ""
    ];
    csvRows.push(row.join(","));
  });

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Video_Editor_Projects_Export_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// INVOICE GENERATION SYSTEM
let activeInvoiceProjects = [];

function openSingleInvoice(id) {
  const p = projects.find(item => item.id === id);
  if (!p) return;
  
  activeInvoiceProjects = [p];
  generateInvoicePreview();
}

function openCombinedInvoiceModal() {
  if (selectedProjectIds.size === 0) return;

  // Filter selected items
  const selected = projects.filter(p => selectedProjectIds.has(p.id));
  
  // Validation: Check if all belong to the same client
  const clientNames = new Set(selected.map(p => p.client));
  if (clientNames.size > 1) {
    alert("Warning: Selected projects belong to different clients. Please select projects from a single client to generate a combined invoice.");
    return;
  }

  activeInvoiceProjects = selected;
  generateInvoicePreview();
}

function generateInvoicePreview() {
  if (activeInvoiceProjects.length === 0) return;

  // Determine client details from projects
  const clientName = activeInvoiceProjects[0].client;
  document.getElementById("prev-client-name").textContent = clientName;

  // Dates
  const today = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById("prev-invoice-date").textContent = today.toLocaleDateString("en-US", options);
  
  // Invoice Number
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  document.getElementById("prev-invoice-num").textContent = `INV-${randomNum}`;

  // Populate Items Table
  const itemsBody = document.getElementById("invoice-items-body");
  itemsBody.innerHTML = "";

  let subtotal = 0;
  let totalPaid = 0;
  let totalDue = 0;

  activeInvoiceProjects.forEach(p => {
    const due = p.budget - p.paid;
    subtotal += p.budget;
    totalPaid += p.paid;
    totalDue += due;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${p.title}</strong> - Editing Services</td>
      <td class="text-right">₹${p.budget.toLocaleString('en-IN')}</td>
      <td class="text-right">₹${p.paid.toLocaleString('en-IN')}</td>
      <td class="text-right">₹${due.toLocaleString('en-IN')}</td>
    `;
    itemsBody.appendChild(tr);
  });

  // Totals
  document.getElementById("prev-subtotal").textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  document.getElementById("prev-total-paid").textContent = `₹${totalPaid.toLocaleString('en-IN')}`;
  document.getElementById("prev-grand-total").textContent = `₹${totalDue.toLocaleString('en-IN')}`;

  // Update editor inputs
  updateInvoicePreview();

  // Show modal
  document.getElementById("invoice-modal").classList.add("active");
}

function updateInvoicePreview() {
  const name = document.getElementById("inv-editor-name").value;
  const email = document.getElementById("inv-editor-email").value;
  const payInfo = document.getElementById("inv-payment-details").value;
  const terms = document.getElementById("inv-due-terms").value;

  // Set previews
  document.getElementById("prev-editor-name").textContent = name || "Your Studios";
  document.getElementById("prev-editor-email").textContent = email || "hello@studios.com";
  document.getElementById("prev-payment-details").textContent = payInfo || "None specified";
  document.getElementById("prev-due-terms").textContent = terms || "Due on receipt";
}

function closeInvoiceModal() {
  document.getElementById("invoice-modal").classList.remove("active");
}

function printInvoice() {
  window.print();
}

// CLIENTS LIST & SLIDE PANEL LOGIC
function renderClients() {
  const grid = document.getElementById("clients-grid");
  if (!grid) return;
  grid.innerHTML = "";

  // Aggregate stats by client
  const clientMap = {};
  projects.forEach(p => {
    const name = p.client || "Unknown Client";
    if (!clientMap[name]) {
      clientMap[name] = {
        name: name,
        projectCount: 0,
        totalRevenue: 0,
        totalDues: 0
      };
    }
    clientMap[name].projectCount++;
    clientMap[name].totalRevenue += p.paid;
    clientMap[name].totalDues += (p.budget - p.paid);
  });

  const clients = Object.values(clientMap);
  document.getElementById("client-total-count").textContent = clients.length;

  if (clients.length === 0) {
    grid.innerHTML = "<div style='color:var(--text-muted);grid-column: span 3;'>No clients found. Add a project to register a client profile!</div>";
    return;
  }

  // Render cards
  clients.forEach(c => {
    const card = document.createElement("div");
    card.className = "client-card";
    card.setAttribute("onclick", `openClientSlidePanel('${c.name.replace(/'/g, "\\'")}')`);
    card.innerHTML = `
      <div class="client-title">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="width:20px;height:20px;color:var(--accent);">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        <span>${c.name}</span>
      </div>
      <div class="client-meta-grid">
        <div class="client-meta-item">
          <span>Projects</span>
          <span class="val">${c.projectCount}</span>
        </div>
        <div class="client-meta-item">
          <span>Revenue Cleared</span>
          <span class="val success">₹${c.totalRevenue.toLocaleString('en-IN')}</span>
        </div>
        <div class="client-meta-item" style="grid-column: span 2; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 4px;">
          <span>Outstanding Dues</span>
          <span class="val ${c.totalDues > 0 ? 'danger' : ''}">₹${c.totalDues.toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

let activeSlideClientName = "";

function openClientSlidePanel(clientName) {
  activeSlideClientName = clientName;
  
  const clientProjects = projects.filter(p => p.client === clientName);
  let totalRevenue = 0;
  let totalDues = 0;

  clientProjects.forEach(p => {
    totalRevenue += p.paid;
    totalDues += (p.budget - p.paid);
  });

  // Set header details
  document.getElementById("slide-client-name").textContent = clientName;
  document.getElementById("slide-client-revenue").textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  document.getElementById("slide-client-dues").textContent = `₹${totalDues.toLocaleString('en-IN')}`;

  // Populate projects list
  const listContainer = document.getElementById("slide-client-projects");
  listContainer.innerHTML = "";

  clientProjects.forEach(p => {
    const due = p.budget - p.paid;
    const item = document.createElement("div");
    item.className = "slide-project-item";
    
    // Check if it's completed
    const dateText = p.status === "Completed" ? `Delivered on ${p.completedDate}` : `Due by ${p.dueDate || 'N/A'}`;
    const badgeClass = p.status === "Completed" ? 'badge-status-completed' : (p.status === 'Review' ? 'badge-status-review' : 'badge-status-rough');

    item.innerHTML = `
      <div class="top-row">
        <span class="proj-title">${p.title}</span>
        <span class="badge ${badgeClass}">${p.status}</span>
      </div>
      <div class="details-row">
        <span>Budget: ₹${p.budget.toLocaleString('en-IN')}</span>
        <span style="color: ${due > 0 ? 'var(--danger)' : 'var(--success)'}">Due: ₹${due.toLocaleString('en-IN')}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--text-muted);text-align:right;">
        ${dateText}
      </div>
    `;
    listContainer.appendChild(item);
  });

  // Toggle invoice button state
  const invBtn = document.getElementById("slide-client-invoice-btn");
  if (totalDues > 0) {
    invBtn.removeAttribute("disabled");
    invBtn.style.opacity = "1";
    invBtn.style.cursor = "pointer";
  } else {
    invBtn.setAttribute("disabled", "true");
    invBtn.style.opacity = "0.5";
    invBtn.style.cursor = "not-allowed";
  }

  // Open panel classes
  document.getElementById("client-panel-backdrop").classList.add("active");
  document.getElementById("client-slide-panel").classList.add("open");
}

function closeClientSlidePanel() {
  document.getElementById("client-panel-backdrop").classList.remove("active");
  document.getElementById("client-slide-panel").classList.remove("open");
}

function generateClientCombinedInvoice() {
  if (!activeSlideClientName) return;

  const clientProjects = projects.filter(p => p.client === activeSlideClientName);
  
  // Choose projects that have outstanding dues
  const unpaidProjects = clientProjects.filter(p => (p.budget - p.paid) > 0);

  if (unpaidProjects.length === 0) {
    alert("This client has cleared all payments. No outstanding invoices to generate.");
    return;
  }

  // Load them into the invoice generator modal
  activeInvoiceProjects = unpaidProjects;
  closeClientSlidePanel();
  generateInvoicePreview();
}
