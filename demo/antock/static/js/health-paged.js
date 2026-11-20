let currentPage = 1;
let totalPages = 1;
let pageSize = 10;
let totalElements = 0;
let healthData = [];
let filteredData = [];
let sortColumn = 'checkedAt';
let sortDirection = 'desc';
let autoRefreshInterval = null;
let isAutoRefreshEnabled = true;

document.addEventListener('DOMContentLoaded', function() {
    initializeHealthPaged();
});

function initializeHealthPaged() {
    initializeEventListeners();
    initializeFilters();
    initializePagination();
    loadHealthData();
    initializeAutoRefresh();
    initializeExportOptions();
    initializeRefreshButton();
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    } else {
        const checkChartJs = () => {
            if (typeof Chart !== 'undefined') {
                initializeCharts();
            } else {
                setTimeout(checkChartJs, 500);
            }
        };
        setTimeout(checkChartJs, 1000);
    }
}

function initializeEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('page-btn')) {
            const page = parseInt(e.target.dataset.page);
            if (page && page !== currentPage) {
                goToPage(page);
            }
        }
    });
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sort-btn')) {
            const column = e.target.dataset.column;
            if (column) {
                sortData(column);
            }
        }
    });
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('health-filter')) {
            applyFilters();
        }
    });
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshHealthData);
    }
    const autoRefreshToggle = document.getElementById('autoRefreshToggle');
    if (autoRefreshToggle) {
        autoRefreshToggle.addEventListener('change', function() {
            toggleAutoRefresh(this.checked);
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F5') {
            e.preventDefault();
            refreshHealthData();
        }
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            refreshHealthData();
        }
    });
}

function initializeFilters() {
    const filterForm = document.getElementById('healthFilters');
    if (filterForm) {
        const statusFilter = document.getElementById('statusFilter');
        const componentFilter = document.getElementById('componentFilter');
        const dateFromFilter = document.getElementById('dateFromFilter');
        const dateToFilter = document.getElementById('dateToFilter');
        if (dateFromFilter && !dateFromFilter.value) {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            dateFromFilter.value = yesterday.toISOString().split('T')[0];
        }
        if (dateToFilter && !dateToFilter.value) {
            const today = new Date();
            dateToFilter.value = today.toISOString().split('T')[0];
        }
    }
}

function initializePagination() {
    updatePaginationDisplay();
}

function initializeAutoRefresh() {
    if (isAutoRefreshEnabled) {
        autoRefreshInterval = setInterval(() => {
            loadHealthData();
        }, 30000);
        showAutoRefreshIndicator();
    }
}

function toggleAutoRefresh(enabled) {
    isAutoRefreshEnabled = enabled;
    if (enabled) {
        initializeAutoRefresh();
    } else {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        hideAutoRefreshIndicator();
    }
}

function showAutoRefreshIndicator() {
    let indicator = document.getElementById('autoRefreshIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoRefreshIndicator';
        indicator.className = 'health-paged-auto-refresh';
        indicator.innerHTML = '<i class="bi bi-arrow-clockwise"></i> 자동 새로고침 활성';
        document.body.appendChild(indicator);
    }
}

function hideAutoRefreshIndicator() {
    const indicator = document.getElementById('autoRefreshIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function initializeRefreshButton() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.disabled = true;
            this.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> 새로고침 중...';
            loadHealthData().finally(() => {
                this.disabled = false;
                this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> 새로고침';
            });
        });
    }
}

function initializeExportOptions() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            showExportOptions();
        });
    }
}

async function loadHealthData() {
    try {
        showLoading();
        const params = new URLSearchParams({
            page: currentPage - 1,
            size: pageSize,
            sort: `${sortColumn},${sortDirection}`
        });
        const filters = getFilterValues();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        const response = await fetch(`/api/v1/health/history?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success && data.data) {
            healthData = data.data.content || data.data;
            totalElements = data.data.totalElements || data.data.length;
            totalPages = data.data.totalPages || Math.ceil(totalElements / pageSize);
            filteredData = [...healthData];
            renderHealthTable();
            updatePaginationDisplay();
            updateStats();
        } else {
            throw new Error(data.message || '데이터를 가져올 수 없습니다.');
        }
    } catch (error) {
        showError('헬스 데이터를 로드할 수 없습니다: ' + error.message);
    } finally {
        hideLoading();
    }
}

function getFilterValues() {
    return {
        status: document.getElementById('statusFilter')?.value || '',
        component: document.getElementById('componentFilter')?.value || '',
        dateFrom: document.getElementById('dateFromFilter')?.value || '',
        dateTo: document.getElementById('dateToFilter')?.value || ''
    };
}

function applyFilters() {
    const filters = getFilterValues();
    let filtered = [...healthData];
    if (filters.status) {
        filtered = filtered.filter(item => {
            const status = item.healthy ? 'up' : 'down';
            return status === filters.status;
        });
    }
    if (filters.component) {
        filtered = filtered.filter(item =>
            item.component && item.component.toLowerCase().includes(filters.component.toLowerCase())
        );
    }
    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.checkedAt || item.checkedAtAsDate);
            return itemDate >= fromDate;
        });
    }
    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(item => {
            const itemDate = new Date(item.checkedAt || item.checkedAtAsDate);
            return itemDate <= toDate;
        });
    }
    filteredData = filtered;
    currentPage = 1;
    renderHealthTable();
    updatePaginationDisplay();
}

function sortData(column) {
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    filteredData.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        if (column === 'checkedAt' || column === 'checkedAtAsDate') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }
        if (column === 'responseTime') {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        }
        if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
    renderHealthTable();
    updateSortIndicators();
}

function updateSortIndicators() {
    document.querySelectorAll('.sort-btn').forEach(btn => {
        const column = btn.dataset.column;
        const icon = btn.querySelector('i');
        if (column === sortColumn) {
            icon.className = sortDirection === 'asc' ? 'bi bi-sort-up' : 'bi bi-sort-down';
        } else {
            icon.className = 'bi bi-sort';
        }
    });
}

function renderHealthTable() {
    const tbody = document.getElementById('healthTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                    데이터가 없습니다.
                </td>
            </tr>
        `;
        return;
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);
    const pageData = filteredData.slice(startIndex, endIndex);
    pageData.forEach((item, index) => {
        const row = createHealthTableRow(item, startIndex + index);
        tbody.appendChild(row);
    });
}

function createHealthTableRow(item, index) {
    const row = document.createElement('tr');
    row.className = 'health-paged-fade-in';
    const statusClass = item.healthy ? 'up' : 'down';
    const statusText = item.healthy ? 'UP' : 'DOWN';
    const responseTime = item.responseTime || 0;
    const responseTimeClass = getResponseTimeClass(responseTime);
    row.innerHTML = `
        <td>${formatDate(item.checkedAt || item.checkedAtAsDate)}</td>
        <td>
            <span class="health-paged-status-badge ${statusClass}">
                ${statusText}
            </span>
        </td>
        <td>
            <span class="health-paged-response-time ${responseTimeClass}">
                ${responseTime}ms
            </span>
        </td>
        <td>${item.component || 'N/A'}</td>
        <td>${item.checkType || 'N/A'}</td>
        <td>${item.message || 'N/A'}</td>
    `;
    return row;
}

function getResponseTimeClass(responseTime) {
    if (responseTime < 100) return 'fast';
    if (responseTime < 500) return 'medium';
    return 'slow';
}

function updateStats() {
    const totalUp = filteredData.filter(item => item.healthy).length;
    const totalDown = filteredData.filter(item => !item.healthy).length;
    const avgResponseTime = filteredData.reduce((sum, item) => sum + (item.responseTime || 0), 0) / filteredData.length;
    updateStatCard('totalChecks', totalElements);
    updateStatCard('upStatus', totalUp);
    updateStatCard('downStatus', totalDown);
    updateStatCard('avgResponseTime', Math.round(avgResponseTime || 0));
}

function updateStatCard(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value.toLocaleString();
    }
}

function updatePaginationDisplay() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) return;
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, filteredData.length);
    paginationContainer.innerHTML = `
        <div class="health-paged-pagination">
            <button class="btn btn-outline-primary page-btn" data-page="1" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-left"></i>
            </button>
            <button class="btn btn-outline-primary page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="bi bi-chevron-left"></i>
            </button>
            ${generatePageNumbers()}
            <button class="btn btn-outline-primary page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-right"></i>
            </button>
            <button class="btn btn-outline-primary page-btn" data-page="${totalPages}" ${currentPage === totalPages ? 'disabled' : ''}>
                <i class="bi bi-chevron-double-right"></i>
            </button>
            <div class="page-info">
                ${startItem}-${endItem} / ${filteredData.length} 항목
            </div>
        </div>
    `;
}

function generatePageNumbers() {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        pages.push(`
            <button class="btn ${isActive ? 'btn-primary active' : 'btn-outline-primary'} page-btn" data-page="${i}">
                ${i}
            </button>
        `);
    }
    return pages.join('');
}

function goToPage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
    renderHealthTable();
    updatePaginationDisplay();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initializeCharts() {
    if (typeof Chart === 'undefined') return;
    initializeResponseTimeChart();
    initializeAvailabilityChart();
    initializeSuccessRateChart();
}

function initializeResponseTimeChart() {
    const canvas = document.getElementById('responseTimeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    window.responseTimeChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: '응답 시간 (ms)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '응답 시간 (ms)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
    updateResponseTimeChart();
}

function updateResponseTimeChart() {
    if (!window.responseTimeChartInstance) return;
    const chart = window.responseTimeChartInstance;
    const labels = [];
    const data = [];
    filteredData.slice(-20).forEach(item => {
        labels.push(formatTime(item.checkedAt || item.checkedAtAsDate));
        data.push(item.responseTime || 0);
    });
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}

function initializeAvailabilityChart() {
    const canvas = document.getElementById('availabilityChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    window.availabilityChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['가용', '불가용'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
    updateAvailabilityChart();
}

function updateAvailabilityChart() {
    if (!window.availabilityChartInstance) return;
    const totalUp = filteredData.filter(item => item.healthy).length;
    const totalDown = filteredData.filter(item => !item.healthy).length;
    window.availabilityChartInstance.data.datasets[0].data = [totalUp, totalDown];
    window.availabilityChartInstance.update();
}

function initializeSuccessRateChart() {
    const canvas = document.getElementById('successRateChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    window.successRateChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['성공', '실패'],
            datasets: [{
                data: [0, 0],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
    updateSuccessRateChart();
}

function updateSuccessRateChart() {
    if (!window.successRateChartInstance) return;
    const totalUp = filteredData.filter(item => item.healthy).length;
    const totalDown = filteredData.filter(item => !item.healthy).length;
    window.successRateChartInstance.data.datasets[0].data = [totalUp, totalDown];
    window.successRateChartInstance.update();
}

function showExportOptions() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">데이터 내보내기</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary" onclick="exportData('csv')">
                            <i class="bi bi-file-earmark-spreadsheet"></i> CSV로 내보내기
                        </button>
                        <button class="btn btn-success" onclick="exportData('json')">
                            <i class="bi bi-file-earmark-code"></i> JSON으로 내보내기
                        </button>
                        <button class="btn btn-info" onclick="exportData('excel')">
                            <i class="bi bi-file-earmark-excel"></i> Excel로 내보내기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

function exportData(format) {
    try {
        const data = filteredData.map(item => ({
            '체크 시간': formatDate(item.checkedAt || item.checkedAtAsDate),
            '상태': item.healthy ? 'UP' : 'DOWN',
            '응답 시간': item.responseTime || 0,
            '컴포넌트': item.component || 'N/A',
            '체크 타입': item.checkType || 'N/A',
            '메시지': item.message || 'N/A'
        }));
        let content, mimeType, extension;
        switch (format) {
            case 'csv':
                content = convertToCSV(data);
                mimeType = 'text/csv;charset=utf-8;';
                extension = 'csv';
                break;
            case 'json':
                content = JSON.stringify(data, null, 2);
                mimeType = 'application/json;charset=utf-8;';
                extension = 'json';
                break;
            case 'excel':
                content = convertToCSV(data);
                mimeType = 'application/vnd.ms-excel;charset=utf-8;';
                extension = 'xls';
                break;
            default:
                throw new Error('지원하지 않는 형식입니다.');
        }
        const blob = new Blob(['\uFEFF' + content], { type: mimeType });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `health-data-${formatDate(new Date(), 'YYYY-MM-DD')}.${extension}`;
        link.click();
        showSuccess('데이터가 성공적으로 내보내졌습니다.');
    } catch (error) {
        showError('데이터 내보내기에 실패했습니다: ' + error.message);
    }
}

function convertToCSV(data) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header =>
                `"${(row[header] || '').toString().replace(/"/g, '""')}"`
            ).join(',')
        )
    ].join('\n');
    return csvContent;
}

async function refreshHealthData() {
    try {
        showLoading();
        await loadHealthData();
        showSuccess('데이터가 새로고침되었습니다.');
    } catch (error) {
        showError('새로고침에 실패했습니다: ' + error.message);
    }
}

function showLoading() {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
}

function hideLoading() {
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function showError(message) {
    showAlert(message, 'danger');
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `health-paged-alert alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        <i class="bi bi-${getAlertIcon(type)}"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'danger': return 'exclamation-triangle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

function formatTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

window.healthPaged = {
    loadHealthData,
    refreshHealthData,
    goToPage,
    sortData,
    applyFilters,
    exportData,
    toggleAutoRefresh
};