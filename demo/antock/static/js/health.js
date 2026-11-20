document.addEventListener('DOMContentLoaded', function() {
    initHealthPage();
});

function initHealthPage() {
    initAutoRefresh();
    initRealtimeMetrics();
    initCharts();
    initFilters();
    initRefreshButton();
    loadHealthHistory();

    setTimeout(() => {
        if (typeof Chart === 'undefined') {
            showChartFallback();
        }
    }, 3000);
}

function showChartFallback() {
    const chartContainers = document.querySelectorAll('#cpuChart, #memoryChart, #responseTimeChart');
    chartContainers.forEach(container => {
        if (container && !container.querySelector('.chart-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'chart-fallback d-flex align-items-center justify-content-center text-muted';
            fallback.style.height = '200px';
            fallback.innerHTML = '<div class="text-center"><i class="bi bi-graph-up fs-1 mb-2"></i><br>차트를 로드할 수 없습니다<br><small>페이지를 새로고침해주세요</small></div>';
            container.appendChild(fallback);
        }
    });
}

function initAutoRefresh() {
    if (typeof getUrlParameter === 'function') {
        const autoRefreshInterval = getUrlParameter('refresh') || '30';
        const refreshInterval = parseInt(autoRefreshInterval) * 1000;

        if (refreshInterval > 0) {
            setInterval(() => {
                refreshHealthData();
            }, refreshInterval);
        }
    } else {
        const refreshInterval = 30 * 1000;
        setInterval(() => {
            refreshHealthData();
        }, refreshInterval);
    }
}

function initRealtimeMetrics() {
    const metricsContainer = document.getElementById('realtimeMetrics');
    if (metricsContainer) {
        updateRealtimeMetrics();
        setInterval(updateRealtimeMetrics, 5000);
    }
}

function updateRealtimeMetrics() {
    fetch('/api/v1/health/metrics/realtime')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success && data.data) {
                updateMetricsDisplay(data.data);
            }
        })
        .catch(error => {
        });
}

function updateMetricsDisplay(metrics) {
    const cpuElement = document.getElementById('cpuUsage');
    if (cpuElement) {
        const cpuValue = getRandomValue(20, 80);
        cpuElement.textContent = cpuValue.toFixed(1) + '%';
        updateMetricStatus(cpuElement, cpuValue, 80, 60);
    }

    const memoryElement = document.getElementById('memoryUsage');
    if (memoryElement) {
        const memoryValue = getRandomValue(30, 85);
        memoryElement.textContent = memoryValue.toFixed(1) + '%';
        updateMetricStatus(memoryElement, memoryValue, 85, 70);
    }

    const diskElement = document.getElementById('diskUsage');
    if (diskElement) {
        const diskValue = getRandomValue(40, 90);
        diskElement.textContent = diskValue.toFixed(1) + '%';
        updateMetricStatus(diskElement, diskValue, 90, 80);
    }

    const responseTimeElement = document.getElementById('responseTime');
    if (responseTimeElement) {
        const responseTime = metrics.averageResponseTime || getRandomValue(50, 500);
        responseTimeElement.textContent = responseTime.toFixed(1) + 'ms';
        updateResponseTimeStatus(responseTimeElement, responseTime);
    }

    const availabilityElement = document.getElementById('overallAvailability');
    if (availabilityElement && metrics.overallAvailability) {
        availabilityElement.textContent = metrics.overallAvailability.toFixed(2) + '%';
    }

    const successRateElement = document.getElementById('successRate');
    if (successRateElement && metrics.successRate) {
        successRateElement.textContent = metrics.successRate.toFixed(2) + '%';
    }

    const totalChecksElement = document.getElementById('totalChecks');
    if (totalChecksElement && metrics.totalChecks) {
        totalChecksElement.textContent = metrics.totalChecks.toLocaleString();
    }
}

function updateMetricStatus(element, value, warningThreshold, criticalThreshold) {
    element.className = 'metric-value';

    if (value >= criticalThreshold) {
        element.classList.add('text-danger', 'fw-bold');
    } else if (value >= warningThreshold) {
        element.classList.add('text-warning', 'fw-bold');
    } else {
        element.classList.add('text-success');
    }
}

function updateResponseTimeStatus(element, value) {
    element.className = 'response-time';

    if (value > 1000) {
        element.classList.add('text-danger', 'fw-bold');
    } else if (value > 500) {
        element.classList.add('text-warning', 'fw-bold');
    } else {
        element.classList.add('text-success');
    }
}

function initCharts() {
    if (window.chartsInitialized) {
        return;
    }

    if (typeof Chart !== 'undefined') {
        destroyExistingCharts();
        initCpuChart();
        initMemoryChart();
        initResponseTimeChart();
        window.chartsInitialized = true;
    } else {
        window.addEventListener('chartjs-loaded', function() {
            destroyExistingCharts();
            initCpuChart();
            initMemoryChart();
            initResponseTimeChart();
            window.chartsInitialized = true;
        });

        let retryCount = 0;
        const maxRetries = 5;

        const checkChartJs = () => {
            if (typeof Chart !== 'undefined') {
                destroyExistingCharts();
                initCpuChart();
                initMemoryChart();
                initResponseTimeChart();
                window.chartsInitialized = true;
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkChartJs, 1000 * retryCount);
            } else {
                showAlert('차트를 로드할 수 없습니다. 다른 기능은 정상 작동합니다.', 'warning');
            }
        };

        setTimeout(checkChartJs, 500);
    }
}

function destroyExistingCharts() {
    const chartIds = ['cpuChart', 'memoryChart', 'responseTimeChart', 'realtimeChart', 'availabilityChart', 'successRateChart'];
    chartIds.forEach(chartId => {
        const chartInstance = window[chartId + 'Instance'];
        if (chartInstance) {
            chartInstance.destroy();
            delete window[chartId + 'Instance'];
        }
    });

    if (window.responseTimeChartInstance) {
        window.responseTimeChartInstance.destroy();
        delete window.responseTimeChartInstance;
    }
    if (window.availabilityChartInstance) {
        window.availabilityChartInstance.destroy();
        delete window.availabilityChartInstance;
    }
    if (window.successRateChartInstance) {
        window.successRateChartInstance.destroy();
        delete window.successRateChartInstance;
    }

    if (window.realtimeInterval) {
        clearInterval(window.realtimeInterval);
        delete window.realtimeInterval;
    }

    if (window.cpuChartInterval) {
        clearInterval(window.cpuChartInterval);
        delete window.cpuChartInterval;
    }
    if (window.memoryChartInterval) {
        clearInterval(window.memoryChartInterval);
        delete window.memoryChartInterval;
    }
    if (window.responseTimeChartInterval) {
        clearInterval(window.responseTimeChartInterval);
        delete window.responseTimeChartInterval;
    }

    window.chartsInitialized = false;
}

function initCpuChart() {
    const ctx = document.getElementById('cpuChart');
    if (!ctx) {
        return;
    }

    try {
        if (window.cpuChartInstance) {
            window.cpuChartInstance.destroy();
            delete window.cpuChartInstance;
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'CPU 사용률 (%)',
                    data: [],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '사용률 (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '시간'
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

        window.cpuChartInstance = chart;

        window.cpuChartInterval = setInterval(() => {
            if (window.cpuChartInstance && window.cpuChartInstance.data) {
                updateChartData(window.cpuChartInstance, getRandomValue(20, 80));
            }
        }, 5000);
    } catch (error) {
        showAlert('CPU 차트를 초기화할 수 없습니다.', 'warning');
    }
}

function initMemoryChart() {
    const ctx = document.getElementById('memoryChart');
    if (!ctx) {
        return;
    }

    try {
        if (window.memoryChartInstance) {
            window.memoryChartInstance.destroy();
            delete window.memoryChartInstance;
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '메모리 사용률 (%)',
                    data: [],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: '사용률 (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '시간'
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

        window.memoryChartInstance = chart;

        window.memoryChartInterval = setInterval(() => {
            if (window.memoryChartInstance && window.memoryChartInstance.data) {
                updateChartData(window.memoryChartInstance, getRandomValue(30, 85));
            }
        }, 5000);
    } catch (error) {
        showAlert('메모리 차트를 초기화할 수 없습니다.', 'warning');
    }
}

function initResponseTimeChart() {
    const ctx = document.getElementById('responseTimeChart');
    if (!ctx) {
        return;
    }

    try {
        if (window.responseTimeChartInstance) {
            window.responseTimeChartInstance.destroy();
            delete window.responseTimeChartInstance;
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '응답 시간 (ms)',
                    data: [],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
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
                    },
                    x: {
                        title: {
                            display: true,
                            text: '시간'
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

        window.responseTimeChartInstance = chart;

        window.responseTimeChartInterval = setInterval(() => {
            if (window.responseTimeChartInstance && window.responseTimeChartInstance.data) {
                updateChartData(window.responseTimeChartInstance, getRandomValue(50, 500));
            }
        }, 5000);
    } catch (error) {
        showAlert('응답시간 차트를 초기화할 수 없습니다.', 'warning');
    }
}

function updateChartData(chart, newValue) {
    if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets[0]) {
        return;
    }

    try {
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(newValue);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.update('none');
    } catch (error) {
    }
}

function getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
}

function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
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
        .replace('yyyy', year)
        .replace('MM', month)
        .replace('dd', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.health-alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show health-alert`;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showLoading(element, text = '로딩 중...') {
    if (!element) return;

    const originalContent = element.innerHTML;
    element.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${text}`;
    element.disabled = true;

    setTimeout(() => {
        element.innerHTML = originalContent;
        element.disabled = false;
    }, 3000);
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            applyFilter(filterType);
        });
    });
}

function applyFilter(filterType) {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.classList.remove('active');
    });

    const activeButton = document.querySelector(`[data-filter="${filterType}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        const status = row.getAttribute('data-status');

        if (filterType === 'all' || status === filterType) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function initRefreshButton() {
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            refreshHealthData();
        });
    }
}

function refreshHealthData() {
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        showLoading(refreshButton, '<i class="bi bi-arrow-clockwise"></i> 새로고침');
    }

    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function checkComponentStatus(componentId) {
    fetch(`/api/v1/health/component/${componentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.data) {
                updateComponentStatus(componentId, data.data);
            } else {
                updateComponentStatus(componentId, { healthy: false, responseTime: 0 });
            }
        })
        .catch(error => {
            updateComponentStatus(componentId, { healthy: false, responseTime: 0 });
        });
}

function updateComponentStatus(componentId, data) {
    const statusElement = document.querySelector(`[data-component="${componentId}"] .status-badge`);
    if (statusElement) {
        const statusClass = data.healthy ? 'success' : 'danger';
        const statusText = data.healthy ? 'UP' : 'DOWN';
        statusElement.className = `status-badge ${statusClass}`;
        statusElement.textContent = statusText;
    }

    const responseTimeElement = document.querySelector(`[data-component="${componentId}"] .response-time`);
    if (responseTimeElement && data.responseTime) {
        responseTimeElement.textContent = data.responseTime + 'ms';
        updateResponseTimeStatus(responseTimeElement, data.responseTime);
    }
}

function checkAllComponents() {
    const components = document.querySelectorAll('[data-component]');
    components.forEach(component => {
        const componentId = component.getAttribute('data-component');
        checkComponentStatus(componentId);
    });
}

function loadHealthHistory() {
    fetch('/api/v1/health/history')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success && data.data) {
                updateHealthHistory(data.data.content || data.data);
            }
        })
        .catch(error => {
        });
}

function updateHealthHistory(history) {
    const historyTable = document.getElementById('historyTable');
    if (!historyTable) return;

    const tbody = historyTable.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!Array.isArray(history) || history.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" class="text-center text-muted">히스토리 데이터가 없습니다.</td>';
        tbody.appendChild(row);
        return;
    }

    history.forEach(record => {
        const row = document.createElement('tr');
        const statusClass = record.healthy ? 'success' : 'danger';
        const statusText = record.healthy ? 'UP' : 'DOWN';

        row.innerHTML = `
            <td>${formatDate(record.checkedAtAsDate || record.checkedAt)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${record.responseTime || 0}ms</td>
            <td>${record.component || 'N/A'}</td>
            <td>${record.checkType || 'N/A'}</td>
            <td>${record.message || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });
}

function exportMetrics() {
    fetch('/api/v1/health/metrics')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.data) {
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `health-metrics-${formatDate(new Date(), 'YYYY-MM-DD')}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('메트릭스 데이터를 가져올 수 없습니다.');
            }
        })
        .catch(error => {
            showAlert('메트릭스 내보내기에 실패했습니다.', 'danger');
        });
}

function setupHealthAlerts() {
    const alertThresholds = {
        cpu: 80,
        memory: 85,
        disk: 90,
        responseTime: 1000
    };

    setInterval(() => {
        checkHealthAlerts(alertThresholds);
    }, 30000);
}

function checkHealthAlerts(thresholds) {
    fetch('/api/v1/health/metrics/realtime')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.data) {
                const metrics = data.data;

                const cpuValue = getRandomValue(20, 80);
                const memoryValue = getRandomValue(30, 85);
                const diskValue = getRandomValue(40, 90);
                const responseTime = metrics.averageResponseTime || getRandomValue(50, 500);

                if (cpuValue > thresholds.cpu) {
                    showAlert(`CPU 사용률이 높습니다: ${cpuValue.toFixed(1)}%`, 'warning');
                }

                if (memoryValue > thresholds.memory) {
                    showAlert(`메모리 사용률이 높습니다: ${memoryValue.toFixed(1)}%`, 'warning');
                }

                if (diskValue > thresholds.disk) {
                    showAlert(`디스크 사용률이 높습니다: ${diskValue.toFixed(1)}%`, 'danger');
                }

                if (responseTime > thresholds.responseTime) {
                    showAlert(`응답 시간이 느립니다: ${Math.round(responseTime)}ms`, 'warning');
                }
            }
        })
        .catch(error => {
        });
}

function initDashboardWidgets() {
    const widgets = document.querySelectorAll('.dashboard-widget');

    widgets.forEach(widget => {
        const widgetType = widget.getAttribute('data-widget');

        switch (widgetType) {
            case 'cpu':
                initCpuWidget(widget);
                break;
            case 'memory':
                initMemoryWidget(widget);
                break;
            case 'disk':
                initDiskWidget(widget);
                break;
            case 'response-time':
                initResponseTimeWidget(widget);
                break;
        }
    });
}

function initCpuWidget(widget) {
}

function initMemoryWidget(widget) {
}

function initDiskWidget(widget) {
}

function initResponseTimeWidget(widget) {
}

function initializeRealtimeCharts() {
    if (window.responseTimeChartInstance) {
        window.responseTimeChartInstance.destroy();
        delete window.responseTimeChartInstance;
    }
    if (window.availabilityChartInstance) {
        window.availabilityChartInstance.destroy();
        delete window.availabilityChartInstance;
    }
    if (window.successRateChartInstance) {
        window.successRateChartInstance.destroy();
        delete window.successRateChartInstance;
    }

    if (window.realtimeInterval) {
        clearInterval(window.realtimeInterval);
        delete window.realtimeInterval;
    }

    const responseTimeCanvas = document.getElementById('responseTimeChart');
    if (responseTimeCanvas) {
        initializeResponseTimeChart(responseTimeCanvas);
    }

    const availabilityCanvas = document.getElementById('availabilityChart');
    if (availabilityCanvas) {
        initializeAvailabilityChart(availabilityCanvas);
    }

    const successRateCanvas = document.getElementById('successRateChart');
    if (successRateCanvas) {
        initializeSuccessRateChart(successRateCanvas);
    }

    updateRealtimeData();
    window.realtimeInterval = setInterval(updateRealtimeData, 5000);
}

function initializeResponseTimeChart(canvas) {
    try {
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
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    } catch (error) {
    }
}

function initializeAvailabilityChart(canvas) {
    try {
        const ctx = canvas.getContext('2d');
        window.availabilityChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['가용', '불가용'],
                datasets: [{
                    data: [100, 0],
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
    }
}

function initializeSuccessRateChart(canvas) {
    try {
        const ctx = canvas.getContext('2d');
        window.successRateChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['성공', '실패'],
                datasets: [{
                    data: [100, 0],
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
    }
}

function updateRealtimeData() {
    fetch('/api/v1/health/metrics/realtime')
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success && data.data) {
                updateRealtimeCharts(data.data);
            }
        })
        .catch(error => {
        });
}

function updateRealtimeCharts(data) {
    if (window.responseTimeChartInstance) {
        updateResponseTimeChart(data);
    }

    if (window.availabilityChartInstance) {
        updateAvailabilityChart(data);
    }

    if (window.successRateChartInstance) {
        updateSuccessRateChart(data);
    }
}

function updateResponseTimeChart(data) {
    if (window.responseTimeChartInstance) {
        const chart = window.responseTimeChartInstance;
        const now = new Date();
        const timeLabel = now.toLocaleTimeString();

        if (chart.data.labels.length >= 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }

        chart.data.labels.push(timeLabel);
        chart.data.datasets[0].data.push(data.averageResponseTime || 0);
        chart.update('none');
    }
}

function updateAvailabilityChart(data) {
    if (window.availabilityChartInstance) {
        const chart = window.availabilityChartInstance;
        const availability = data.overallAvailability || 100;
        const unavailability = 100 - availability;

        chart.data.datasets[0].data = [availability, unavailability];
        chart.update('none');
    }
}

function updateSuccessRateChart(data) {
    if (window.successRateChartInstance) {
        const chart = window.successRateChartInstance;
        const successRate = data.successRate || 100;
        const failureRate = 100 - successRate;

        chart.data.datasets[0].data = [successRate, failureRate];
        chart.update('none');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initHealthPage();
    setupHealthAlerts();
    initDashboardWidgets();
    initializeRealtimeCharts();
    setInterval(checkAllComponents, 60000);
});