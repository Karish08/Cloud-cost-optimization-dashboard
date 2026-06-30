// ==========================================
// CONFIGURATIONS
// ==========================================
const API_URL = 'http://localhost:8080/api';

// ==========================================
// APPLICATION STATE
// ==========================================
let state = {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    currentView: 'overview',
    resources: [],
    recommendations: [],
    costSummary: null,
    costForecast: []
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authErrorMsg = document.getElementById('auth-error-msg');
const authSuccessMsg = document.getElementById('auth-success-msg');
const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const logoutBtn = document.getElementById('logout-btn');
const refreshDataBtn = document.getElementById('refresh-data-btn');

const menuItems = document.querySelectorAll('.menu-item');
const views = document.querySelectorAll('.dashboard-view');
const viewTitle = document.getElementById('view-title');

// KPI fields
const kpiRunRate = document.getElementById('kpi-run-rate');
const kpiSpent = document.getElementById('kpi-spent');
const kpiSavings = document.getElementById('kpi-savings');

// Recommendations
const quickRecsList = document.getElementById('quick-recs-list');
const recCountBadge = document.getElementById('rec-count-badge');
const fullRecsGrid = document.getElementById('full-recs-grid');

// Tables
const dashboardResourcesTable = document.getElementById('dashboard-resources-table').querySelector('tbody');
const resourcesListBody = document.getElementById('resources-list-body');
const viewAllResourcesBtn = document.getElementById('view-all-resources-btn');

// Search & Filter
const resourceSearch = document.getElementById('resource-search');
const providerFilters = document.getElementById('provider-filters');

// User profile initials
const userAvatar = document.getElementById('user-avatar-initials');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');

// Modal Elements
const addResourceModal = document.getElementById('add-resource-modal');
const btnOpenAddResource = document.getElementById('btn-open-add-resource');
const modalCloseBtn = document.getElementById('modal-close-btn');
const btnCancelAddResource = document.getElementById('btn-cancel-add-resource');
const addResourceForm = document.getElementById('add-resource-form');

// Notifications
const dashboardNotification = document.getElementById('dashboard-notification');

// Create tooltip container dynamically
const tooltip = document.createElement('div');
tooltip.className = 'chart-tooltip';
document.body.appendChild(tooltip);

// ==========================================
// API CLIENT UTILITIES
// ==========================================
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const config = {
        method,
        headers
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (response.status === 401 || response.status === 403) {
            const reason = `Auth error: request to ${endpoint} failed with status ${response.status}.`;
            console.warn(reason);
            handleLogout(reason);
            throw new Error(reason);
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API Request failed');
        }

        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error.message);
        throw error;
    }
}

// ==========================================
// STARTUP INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    if (state.token && state.user) {
        showDashboard();
    } else {
        showAuth();
    }
    setupAuthListeners();
    setupNavListeners();
    setupDashboardListeners();
}

function showDashboard() {
    authContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    
    // Set user profile
    if (state.user) {
        profileName.textContent = state.user.name || 'User';
        profileEmail.textContent = state.user.email || '';
        const initial = (state.user.name || 'U').charAt(0).toUpperCase();
        userAvatar.textContent = initial;
    }

    switchView('overview');
    fetchDashboardData();
}

function showAuth() {
    dashboardContainer.classList.add('hidden');
    authContainer.classList.remove('hidden');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authErrorMsg.classList.add('hidden');
    authSuccessMsg.classList.add('hidden');
}

// ==========================================
// EVENT LISTENERS
// ==========================================
function setupAuthListeners() {
    goToRegister.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authErrorMsg.classList.add('hidden');
        authSuccessMsg.classList.add('hidden');
    });

    goToLogin.addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        authErrorMsg.classList.add('hidden');
        authSuccessMsg.classList.add('hidden');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authErrorMsg.classList.add('hidden');
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const data = await apiRequest('/auth/login', 'POST', { email, password });
            
            // Save state
            state.token = data.token;
            state.user = { name: data.name, email: data.email };
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(state.user));

            showDashboard();
            loginForm.reset();
        } catch (error) {
            authErrorMsg.textContent = error.message || 'Invalid email or password.';
            authErrorMsg.classList.remove('hidden');
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        authErrorMsg.classList.add('hidden');
        authSuccessMsg.classList.add('hidden');

        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            const data = await apiRequest('/auth/register', 'POST', { name, email, password });
            
            authSuccessMsg.textContent = data.message || 'Account created successfully! Please sign in.';
            authSuccessMsg.classList.remove('hidden');
            registerForm.reset();
            
            // Auto switch to login after delay
            setTimeout(() => {
                goToLogin.click();
            }, 2000);
        } catch (error) {
            authErrorMsg.textContent = error.message || 'Registration failed.';
            authErrorMsg.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => handleLogout());
}

function handleLogout(reason = null) {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showAuth();
    if (reason) {
        authErrorMsg.textContent = reason;
        authErrorMsg.classList.remove('hidden');
    }
}

function setupNavListeners() {
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = item.getAttribute('data-view');
            switchView(viewName);
        });
    });

    viewAllResourcesBtn.addEventListener('click', () => {
        switchView('resources');
    });
}

function setupDashboardListeners() {
    refreshDataBtn.addEventListener('click', async () => {
        showToast("Synchronizing multicloud cost metrics and analyzing resources...", "info");
        try {
            // Trigger refresh by loading the data again
            await fetchDashboardData();
            showToast("Multi-cloud synchronization finished successfully.", "success");
        } catch (error) {
            showToast("Failed to sync cloud costs: " + error.message, "danger");
        }
    });

    // Local filters for Resources View
    resourceSearch.addEventListener('input', applyFilters);
    
    const filterTabs = providerFilters.querySelectorAll('.btn-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            applyFilters();
        });
    });

    // Modal Open/Close Handling
    btnOpenAddResource.addEventListener('click', () => {
        addResourceModal.classList.add('active');
    });

    const closeModal = () => {
        addResourceModal.classList.remove('active');
        addResourceForm.reset();
    };

    modalCloseBtn.addEventListener('click', closeModal);
    btnCancelAddResource.addEventListener('click', closeModal);
    addResourceModal.addEventListener('click', (e) => {
        if (e.target === addResourceModal) {
            closeModal();
        }
    });

    // Modal Submit Handling (API Call & Dashboard Sync)
    addResourceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            provider: document.getElementById('res-provider').value,
            resourceType: document.getElementById('res-type').value,
            resourceName: document.getElementById('res-name').value,
            region: document.getElementById('res-region').value,
            allocatedMemoryGB: parseFloat(document.getElementById('res-allocated-mem').value),
            actualUsedMemoryGB: parseFloat(document.getElementById('res-used-mem').value),
            allocatedCpuPercent: parseFloat(document.getElementById('res-allocated-cpu').value),
            actualCpuPercent: parseFloat(document.getElementById('res-used-cpu').value),
            costPerDay: parseFloat(document.getElementById('res-cost').value)
        };

        showToast("Analyzing manual resource metrics...", "info");
        
        try {
            const result = await apiRequest('/resources', 'POST', payload);
            
            let statusText = result.status.replace('_', ' ');
            let message = `Resource "${result.resource.name}" saved. Engine status: ${statusText}.`;
            if (result.estimatedSavings > 0) {
                message += ` Potential savings: $${result.estimatedSavings.toFixed(2)}/mo.`;
            } else {
                message += ` Operating at optimal health.`;
            }
            
            showToast(message, result.status === 'HEALTHY' ? 'success' : 'warning');
            
            closeModal();
            await fetchDashboardData();
        } catch (error) {
            showToast("Failed to analyze resource: " + error.message, "danger");
        }
    });
}

function switchView(viewName) {
    state.currentView = viewName;
    
    // Toggle active menu class
    menuItems.forEach(item => {
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Show selected view panel
    views.forEach(view => {
        if (view.id === `view-${viewName}`) {
            view.classList.remove('hidden');
        } else {
            view.classList.add('hidden');
        }
    });

    // Update view title headers
    if (viewName === 'overview') {
        viewTitle.textContent = 'Overview';
    } else if (viewName === 'resources') {
        viewTitle.textContent = 'Cloud Resource Directory';
        applyFilters();
    } else if (viewName === 'recommendations') {
        viewTitle.textContent = 'Active Savings Recommendations';
    }
}

// ==========================================
// CORE DATA FETCHING
// ==========================================
async function fetchDashboardData() {
    try {
        const [summary, forecast, resources, recs] = await Promise.all([
            apiRequest('/costs/summary'),
            apiRequest('/costs/forecast'),
            apiRequest('/resources'),
            apiRequest('/recommendations')
        ]);

        state.costSummary = summary;
        state.costForecast = forecast;
        state.resources = resources;
        state.recommendations = recs;

        renderDashboard();
    } catch (error) {
        console.error("Error loading dashboard data", error);
        showToast("Error retrieving multicloud data. Re-login might be required.", "danger");
    }
}

// ==========================================
// RENDER METHODS
// ==========================================
function renderDashboard() {
    renderKPIs();
    renderSpendChart();
    renderRecentResourcesTable();
    renderRecommendations();
    renderDetailedResourcesTable();
}

function renderKPIs() {
    if (!state.costSummary) return;

    // Formatting helpers
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    kpiRunRate.textContent = formatCurrency(state.costSummary.monthlyRunRate);
    kpiSpent.textContent = formatCurrency(state.costSummary.totalSpent30Days);
    kpiSavings.textContent = formatCurrency(state.costSummary.potentialSavings);
}

function renderRecentResourcesTable() {
    dashboardResourcesTable.innerHTML = '';
    
    // Show top 5 highest cost resources for preview
    const sortedResources = [...state.resources]
        .sort((a, b) => b.costPerDay - a.costPerDay)
        .slice(0, 5);

    if (sortedResources.length === 0) {
        dashboardResourcesTable.innerHTML = `<tr><td colspan="7" class="empty-state">No resources tracked.</td></tr>`;
        return;
    }

    sortedResources.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${truncate(res.resourceId, 16)}</code></td>
            <td><strong>${res.name}</strong></td>
            <td><span class="res-badge badge-${res.provider.toLowerCase()}">${res.provider}</span></td>
            <td><code>${res.resourceType}</code></td>
            <td><span class="text-secondary">${res.region}</span></td>
            <td><strong>$${res.costPerDay.toFixed(2)}</strong></td>
            <td><span class="res-badge ${getStatusBadgeClass(res.status)}">${formatStatus(res.status)}</span></td>
        `;
        dashboardResourcesTable.appendChild(tr);
    });
}

function renderDetailedResourcesTable() {
    resourcesListBody.innerHTML = '';
    
    // We will render filtered items in the applyFilters function
    applyFilters();
}

function applyFilters() {
    if (state.currentView !== 'resources') return;

    const searchTerm = resourceSearch.value.toLowerCase();
    const selectedProvider = providerFilters.querySelector('.btn-tab.active').getAttribute('data-provider');

    const filtered = state.resources.filter(res => {
        const matchesSearch = 
            res.resourceId.toLowerCase().includes(searchTerm) || 
            res.name.toLowerCase().includes(searchTerm) || 
            res.region.toLowerCase().includes(searchTerm) ||
            res.resourceType.toLowerCase().includes(searchTerm);
        
        const matchesProvider = selectedProvider === 'ALL' || res.provider === selectedProvider;

        return matchesSearch && matchesProvider;
    });

    resourcesListBody.innerHTML = '';

    if (filtered.length === 0) {
        resourcesListBody.innerHTML = `<tr><td colspan="7" class="empty-state">No matching cloud resources found.</td></tr>`;
        return;
    }

    filtered.forEach(res => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${res.resourceId}</code></td>
            <td><strong>${res.name}</strong></td>
            <td><span class="res-badge badge-${res.provider.toLowerCase()}">${res.provider}</span></td>
            <td><code>${res.resourceType}</code></td>
            <td><span class="text-secondary">${res.region}</span></td>
            <td><strong>$${res.costPerDay.toFixed(2)}</strong></td>
            <td><span class="res-badge ${getStatusBadgeClass(res.status)}">${formatStatus(res.status)}</span></td>
        `;
        resourcesListBody.appendChild(tr);
    });
}

function renderRecommendations() {
    quickRecsList.innerHTML = '';
    fullRecsGrid.innerHTML = '';

    const activeRecs = state.recommendations.filter(r => !r.isApplied);
    recCountBadge.textContent = `${activeRecs.length} Active`;

    if (activeRecs.length === 0) {
        const emptyEl = `<p class="empty-state">All systems optimized! No active waste detected.</p>`;
        quickRecsList.innerHTML = emptyEl;
        fullRecsGrid.innerHTML = `<div style="grid-column: 1/-1" class="glass-card"><p class="empty-state">All systems optimized! No recommendations available.</p></div>`;
        return;
    }

    activeRecs.forEach(rec => {
        // Quick sidebar list card
        const recCard = document.createElement('div');
        recCard.className = 'rec-card';
        recCard.innerHTML = `
            <div class="rec-header">
                <div class="rec-title-group">
                    <span class="rec-res-name">${rec.resource.name}</span>
                    <span class="rec-res-meta">${rec.resource.provider} &bull; ${rec.resource.region}</span>
                </div>
                <span class="badge ${getActionBadgeClass(rec.actionType)}">${rec.actionType}</span>
            </div>
            <p class="rec-reason">${rec.reasoning}</p>
            <div class="rec-footer">
                <div class="rec-savings-group">
                    <span class="rec-savings-label">Est. Savings</span>
                    <span class="rec-savings-val">$${rec.estimatedSavingsPerMonth.toFixed(2)}/mo</span>
                </div>
                <button class="btn btn-apply-rec" data-rec-id="${rec.id}">Apply</button>
            </div>
        `;
        quickRecsList.appendChild(recCard);

        // Full recommendation grid card for full view page
        const gridCard = document.createElement('div');
        gridCard.className = 'glass-card rec-grid-card';
        gridCard.innerHTML = `
            <div class="rec-header">
                <div class="rec-title-group">
                    <span class="rec-res-name" style="font-size:1.1rem">${rec.resource.name}</span>
                    <span class="rec-res-meta">${rec.resource.provider} &bull; ${rec.resource.region} &bull; ${rec.resource.resourceType}</span>
                </div>
                <span class="badge ${getActionBadgeClass(rec.actionType)}" style="font-size:0.8rem; padding: 0.35rem 0.75rem">${rec.actionType}</span>
            </div>
            <hr style="border: 0; border-top:1px solid var(--border-color)">
            <p class="rec-reason">${rec.reasoning}</p>
            <div class="rec-footer">
                <div class="rec-savings-group">
                    <span class="rec-savings-label">Current Cost / Est. Savings</span>
                    <span class="text-primary" style="font-size:0.85rem">Current: $${rec.currentCostPerMonth.toFixed(2)}/mo</span>
                    <span class="rec-savings-val" style="font-size:1.1rem">$${rec.estimatedSavingsPerMonth.toFixed(2)}/mo</span>
                </div>
                <button class="btn btn-apply-rec btn-primary" data-rec-id="${rec.id}" style="background:var(--grad-emerald)">Apply Optimization</button>
            </div>
        `;
        fullRecsGrid.appendChild(gridCard);
    });

    // Attach Apply event listeners
    const applyButtons = document.querySelectorAll('.btn-apply-rec');
    applyButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const recId = btn.getAttribute('data-rec-id');
            await applyRecommendation(recId);
        });
    });
}

async function applyRecommendation(recId) {
    showToast("Applying recommendation optimization to cloud instances...", "info");
    try {
        const response = await apiRequest(`/recommendations/${recId}/apply`, 'POST');
        showToast(response.message || "Optimization recommendation applied successfully!", "success");
        // Refetch and update
        await fetchDashboardData();
    } catch (error) {
        showToast("Failed to apply recommendation: " + error.message, "danger");
    }
}

// ==========================================
// SVG CHART DRAWING LOGIC (AI Cost Forecast)
// ==========================================
function renderSpendChart() {
    const svg = document.getElementById('spend-chart');
    svg.innerHTML = ''; // Clear previous

    if (!state.costForecast || state.costForecast.length === 0) {
        return;
    }

    const data = state.costForecast;

    // SVG parameters
    const width = 800;
    const height = 350;
    const padding = { top: 30, right: 40, bottom: 40, left: 60 };

    // Get max/min values for scaling
    const allValues = data.map(d => d.actualSpend !== null ? d.actualSpend : d.forecastSpend);
    const maxVal = Math.max(...allValues) * 1.1; // Add 10% headroom
    const minVal = 0; // Cost starts at 0

    // Coordinate mapping functions
    const getX = (index) => padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
    const getY = (val) => height - padding.bottom - ((val - minVal) / (maxVal - minVal)) * (height - padding.top - padding.bottom);

    // Create defs for gradients
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
        <linearGradient id="grad-actual-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="grad-forecast-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.0"/>
        </linearGradient>
    `;
    svg.appendChild(defs);

    // 1. Draw grid lines (horizontal Y axis markers)
    const yGridTicks = 5;
    for (let i = 0; i <= yGridTicks; i++) {
        const gridVal = minVal + (i / yGridTicks) * (maxVal - minVal);
        const yPos = getY(gridVal);

        // Grid line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', padding.left);
        line.setAttribute('y1', yPos);
        line.setAttribute('x2', width - padding.right);
        line.setAttribute('y2', yPos);
        line.setAttribute('class', 'grid-line');
        svg.appendChild(line);

        // Y label text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', padding.left - 10);
        text.setAttribute('y', yPos + 4);
        text.setAttribute('text-anchor', 'end');
        text.textContent = `$${Math.round(gridVal)}`;
        svg.appendChild(text);
    }

    // 2. Draw dates / X-axis marks (e.g. 5 indices evenly spaced)
    const xGridTicks = 6;
    for (let i = 0; i < xGridTicks; i++) {
        const index = Math.round((i / (xGridTicks - 1)) * (data.length - 1));
        const item = data[index];
        if (!item) continue;

        const xPos = getX(index);

        // X label text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', xPos);
        text.setAttribute('y', height - padding.bottom + 20);
        text.setAttribute('text-anchor', 'middle');
        
        // Format date: Short month/day
        const dObj = new Date(item.date);
        const label = dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        text.textContent = label;
        svg.appendChild(text);
    }

    // Split data into actual vs forecast lists
    const actualPoints = [];
    const forecastPoints = [];

    data.forEach((d, idx) => {
        if (d.actualSpend !== null) {
            actualPoints.push({ x: getX(idx), y: getY(d.actualSpend), val: d.actualSpend, date: d.date, isActual: true });
        }
        if (d.forecastSpend !== null) {
            forecastPoints.push({ x: getX(idx), y: getY(d.forecastSpend), val: d.forecastSpend, date: d.date, isActual: false });
        }
    });

    // To make them connect seamlessly, actual's last point must connect to forecast's first point
    if (actualPoints.length > 0 && forecastPoints.length > 0) {
        const lastActual = actualPoints[actualPoints.length - 1];
        forecastPoints.unshift({
            x: lastActual.x,
            y: lastActual.y,
            val: lastActual.val,
            date: lastActual.date,
            isActual: false
        });
    }

    // Helper: generate path instructions
    const getPathD = (points) => {
        if (points.length === 0) return '';
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        return d;
    };

    // Helper: generate area path instructions (closing the loop back to base line)
    const getAreaD = (points) => {
        if (points.length === 0) return '';
        const base = height - padding.bottom;
        let d = `M ${points[0].x} ${base} L ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        d += ` L ${points[points.length - 1].x} ${base} Z`;
        return d;
    };

    // 3. Draw area gradients under paths
    if (actualPoints.length > 0) {
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        areaPath.setAttribute('d', getAreaD(actualPoints));
        areaPath.setAttribute('class', 'chart-area-actual');
        svg.appendChild(areaPath);
    }
    if (forecastPoints.length > 0) {
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        areaPath.setAttribute('d', getAreaD(forecastPoints));
        areaPath.setAttribute('class', 'chart-area-forecast');
        svg.appendChild(areaPath);
    }

    // 4. Draw paths
    if (actualPoints.length > 0) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', getPathD(actualPoints));
        path.setAttribute('class', 'chart-path-actual');
        svg.appendChild(path);
    }
    if (forecastPoints.length > 0) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', getPathD(forecastPoints));
        path.setAttribute('class', 'chart-path-forecast');
        svg.appendChild(path);
    }

    // 5. Draw interaction nodes (dots) for hovering tooltips
    const allPoints = [...actualPoints, ...forecastPoints.slice(1)]; // Skip duplicated connecting point
    allPoints.forEach(pt => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pt.x);
        circle.setAttribute('cy', pt.y);
        circle.setAttribute('r', '4');
        circle.setAttribute('class', `chart-point ${pt.isActual ? 'actual' : 'forecast'}`);
        
        // Tooltip listeners
        circle.addEventListener('mousemove', (e) => {
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 45}px`;
            
            const formattedDate = new Date(pt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
            const labelType = pt.isActual ? 'Actual Cost' : 'Predicted Cost';
            
            tooltip.innerHTML = `
                <div class="chart-tooltip-date">${formattedDate}</div>
                <div class="chart-tooltip-value" style="color: ${pt.isActual ? '#60a5fa' : '#c084fc'}">
                    ${labelType}: $${pt.val.toFixed(2)}
                </div>
            `;
        });

        circle.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });

        svg.appendChild(circle);
    });

    // 6. Draw axis lines
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', padding.left);
    xAxis.setAttribute('y1', height - padding.bottom);
    xAxis.setAttribute('x2', width - padding.right);
    xAxis.setAttribute('y2', height - padding.bottom);
    xAxis.setAttribute('class', 'axis-line');
    svg.appendChild(xAxis);

    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', padding.left);
    yAxis.setAttribute('y1', padding.top);
    yAxis.setAttribute('x2', padding.left);
    yAxis.setAttribute('y2', height - padding.bottom);
    yAxis.setAttribute('class', 'axis-line');
    svg.appendChild(yAxis);
}

// ==========================================
// HELPER METHODS
// ==========================================
function getStatusBadgeClass(status) {
    switch(status) {
        case 'HEALTHY': return 'status-healthy';
        case 'IDLE': return 'status-idle';
        case 'OVER_PROVISIONED': return 'status-over';
        case 'UNUSED_STORAGE': return 'status-unused';
        default: return '';
    }
}

function getActionBadgeClass(action) {
    switch(action) {
        case 'SHUTDOWN': return 'badge-shutdown';
        case 'RESIZE': return 'badge-resize';
        case 'CHEAPER_TIER': return 'badge-tier';
        default: return '';
    }
}

function formatStatus(status) {
    return status.replace('_', ' ');
}

function truncate(str, max) {
    if (str.length <= max) return str;
    return str.substring(0, max) + '...';
}

function showToast(message, type = "success") {
    dashboardNotification.textContent = message;
    dashboardNotification.className = `alert alert-toast alert-${type}`;
    dashboardNotification.classList.remove('hidden');

    // Fade out after 4 seconds
    setTimeout(() => {
        dashboardNotification.classList.add('hidden');
    }, 4000);
}
