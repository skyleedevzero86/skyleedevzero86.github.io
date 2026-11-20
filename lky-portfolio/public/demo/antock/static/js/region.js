document.addEventListener('DOMContentLoaded', function() {
    initializeRegionPage();
});

function initializeRegionPage() {
    initializeTableSorting();
    initializeSearch();
    initializeRowSelection();
    initializeTooltips();
}

function initializeTableSorting() {
    const sortableHeaders = document.querySelectorAll('.table th.sortable');

    sortableHeaders.forEach((header, index) => {
        header.addEventListener('click', () => sortTable(index));
    });
}

function sortTable(columnIndex) {
    const table = document.querySelector('.table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const isNumericColumn = [0, 3, 4, 5, 6].includes(columnIndex);

    const currentOrder = table.dataset.sortOrder || 'asc';
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    table.dataset.sortOrder = newOrder;

    rows.sort((a, b) => {
        const aVal = a.cells[columnIndex].textContent.trim();
        const bVal = b.cells[columnIndex].textContent.trim();

        let comparison;
        if (isNumericColumn) {
            const aNum = parseFloat(aVal.replace(/[^0-9.-]/g, '')) || 0;
            const bNum = parseFloat(bVal.replace(/[^0-9.-]/g, '')) || 0;
            comparison = aNum - bNum;
        } else {
            comparison = aVal.localeCompare(bVal, 'ko');
        }

        return newOrder === 'asc' ? comparison : -comparison;
    });

    rows.forEach(row => tbody.appendChild(row));

    updateSortIcons(columnIndex, newOrder);
}

function updateSortIcons(activeColumn, order) {
    const headers = document.querySelectorAll('.table th.sortable');

    headers.forEach((header, index) => {
        const icon = header.querySelector('i');
        if (index === activeColumn) {
            icon.className = order === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down';
        } else {
            icon.className = 'bi bi-arrow-down-up';
        }
    });
}

function initializeSearch() {
    const searchInput = document.getElementById('regionSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRegions();
            }
        });

        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(searchRegions, 300);
        });
    }
}

function searchRegions() {
    const searchTerm = document.getElementById('regionSearch').value.toLowerCase().trim();
    const rows = document.querySelectorAll('#regionTableBody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        const siNm = row.cells[1].textContent.toLowerCase();
        const sggNm = row.cells[2].textContent.toLowerCase();
        const fullRegion = `${siNm} ${sggNm}`;

        if (!searchTerm ||
            siNm.includes(searchTerm) ||
            sggNm.includes(searchTerm) ||
            fullRegion.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });

    updateSearchResultMessage(visibleCount, searchTerm);
}

function updateSearchResultMessage(visibleCount, searchTerm) {
    let messageElement = document.getElementById('searchResultMessage');

    if (visibleCount === 0 && searchTerm) {
        if (!messageElement) {
            messageElement = document.createElement('tr');
            messageElement.id = 'searchResultMessage';
            messageElement.innerHTML = `
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="bi bi-search"></i> 검색 결과가 없습니다.
                </td>
            `;
            document.getElementById('regionTableBody').appendChild(messageElement);
        }
        messageElement.style.display = '';
    } else if (messageElement) {
        messageElement.style.display = 'none';
    }
}

function initializeRowSelection() {
    const tableRows = document.querySelectorAll('#regionTableBody tr');

    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('button') ||
                e.target.closest('a') ||
                e.target.closest('form')) {
                return;
            }

            selectRow(this);
        });
    });
}

function selectRow(row) {
    document.querySelectorAll('tbody tr').forEach(r => {
        r.classList.remove('table-active');
    });

    row.classList.add('table-active');

    const regionInfo = {
        siNm: row.dataset.region,
        sggNm: row.dataset.sgg,
        totalCount: row.cells[3].textContent.trim(),
        percentage: row.cells[4].textContent.trim()
    };

    dispatchRegionSelectEvent(regionInfo);
}

function dispatchRegionSelectEvent(regionInfo) {
    const event = new CustomEvent('regionSelected', {
        detail: regionInfo
    });
    document.dispatchEvent(event);
}

function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function resetFilters() {
    const searchInput = document.getElementById('regionSearch');
    if (searchInput) {
        searchInput.value = '';
    }

    const rows = document.querySelectorAll('#regionTableBody tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    const messageElement = document.getElementById('searchResultMessage');
    if (messageElement) {
        messageElement.style.display = 'none';
    }

    showToast('필터가 초기화되었습니다.', 'success');
}

function filterByStatus(status) {
    const rows = document.querySelectorAll('#regionTableBody tr');
    let visibleCount = 0;

    rows.forEach(row => {
        if (status === '전체') {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = '';
            visibleCount++;
        }
    });

    showToast(`${status} 필터가 적용되었습니다.`, 'info');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();

    const toastElement = document.createElement('div');
    toastElement.className = `toast align-items-center text-white bg-${type} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

function exportTableData(format = 'csv') {
    const table = document.querySelector('.table');
    const rows = table.querySelectorAll('tbody tr:not(#searchResultMessage)');
    const headers = Array.from(table.querySelectorAll('thead th'))
        .slice(0, -1)
        .map(th => th.textContent.trim().replace(/\s+/g, ' '));

    let data = [];
    data.push(headers);

    rows.forEach(row => {
        if (row.style.display !== 'none') {
            const rowData = Array.from(row.cells)
                .slice(0, -1)
                .map(cell => cell.textContent.trim().replace(/\s+/g, ' '));
            data.push(rowData);
        }
    });

    if (format === 'csv') {
        exportToCSV(data);
    } else if (format === 'json') {
        exportToJSON(data);
    }
}

function exportToCSV(data) {
    const csvContent = data.map(row =>
        row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `지역별_통계_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}

function exportToJSON(data) {
    const headers = data[0];
    const jsonData = data.slice(1).map(row => {
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = row[index];
        });
        return obj;
    });

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json;charset=utf-8;'
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `지역별_통계_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
}

function updateCharts() {
    const visibleRows = Array.from(document.querySelectorAll('#regionTableBody tr'))
        .filter(row => row.style.display !== 'none' && row.id !== 'searchResultMessage');

    if (window.topRegionsChart) {
        updateTopRegionsChart(visibleRows);
    }

    if (window.provinceChart) {
        updateProvinceChart(visibleRows);
    }
}

function updateTopRegionsChart(visibleRows) {
    const chartData = visibleRows.slice(0, 10).map(row => ({
        name: `${row.cells[1].textContent.trim()} ${row.cells[2].textContent.trim()}`,
        count: parseInt(row.cells[3].textContent.replace(/[^0-9]/g, ''))
    }));

    window.topRegionsChart.data.labels = chartData.map(d => d.name);
    window.topRegionsChart.data.datasets[0].data = chartData.map(d => d.count);
    window.topRegionsChart.update();
}

function updateProvinceChart(visibleRows) {
    const provinceStats = {};

    visibleRows.forEach(row => {
        const province = row.cells[1].textContent.trim();
        const count = parseInt(row.cells[3].textContent.replace(/[^0-9]/g, ''));

        if (!provinceStats[province]) {
            provinceStats[province] = 0;
        }
        provinceStats[province] += count;
    });

    window.provinceChart.data.labels = Object.keys(provinceStats);
    window.provinceChart.data.datasets[0].data = Object.values(provinceStats);
    window.provinceChart.update();
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('regionSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }

    if (e.key === 'Escape') {
        resetFilters();
    }
});

document.addEventListener('regionSelected', function(e) {
    console.log('지역 선택됨:', e.detail);
});