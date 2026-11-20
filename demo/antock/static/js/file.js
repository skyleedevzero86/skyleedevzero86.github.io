document.addEventListener('DOMContentLoaded', function() {
    initFilePage();
});

function initFilePage() {
    initFileUploadModal();
    initFileTable();
    initFileDeleteConfirm();
    initFileDownload();
    initDragAndDrop();
    initFilePreview();
}

function initFileUploadModal() {
    const modal = document.getElementById('fileUploadModal');
    const openBtn = document.getElementById('openUploadModal');
    const closeBtn = document.getElementById('closeUploadModal');

    if (openBtn && modal) {
        openBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            closeFileUploadModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeFileUploadModal();
            }
        });
    }
}

function closeFileUploadModal() {
    const modal = document.getElementById('fileUploadModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function initFileTable() {
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }

            tableRows.forEach(r => r.classList.remove('table-active'));
            this.classList.add('table-active');
        });
    });

    initTableSorting();
}

function initTableSorting() {
    const sortableHeaders = document.querySelectorAll('th[data-sort]');

    sortableHeaders.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const sortField = this.getAttribute('data-sort');
            const currentSort = getUrlParameter('sort');
            const currentOrder = getUrlParameter('order');

            let newOrder = 'asc';
            if (currentSort === sortField && currentOrder === 'asc') {
                newOrder = 'desc';
            }

            setUrlParameter('sort', sortField);
            setUrlParameter('order', newOrder);
            window.location.reload();
        });
    });
}

function initFileDeleteConfirm() {
    const deleteButtons = document.querySelectorAll('button[onclick*="deleteFile"]');

    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const onclick = this.getAttribute('onclick');
            if (onclick) {
                eval(onclick);
            }
        });
    });
}

function deleteFile(fileId, fileName) {
    if (confirm(`'${fileName}' 파일을 삭제하시겠습니까?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/web/files/delete/${fileId}`;

        const csrfToken = getCsrfToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        document.body.appendChild(form);
        form.submit();
    }
}

function initFileDownload() {
    const downloadButtons = document.querySelectorAll('a[href*="/download/"]');

    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const url = this.getAttribute('href');
            const fileName = this.getAttribute('data-filename') || 'download';

            downloadFile(url, fileName);
        });
    });
}

function initDragAndDrop() {
    const dropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');

    if (dropZone && fileInput) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileList(files);
            }
        });

        dropZone.addEventListener('click', function() {
            fileInput.click();
        });

        fileInput.addEventListener('change', function() {
            updateFileList(this.files);
        });
    }
}

function updateFileList(files) {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;

    fileList.innerHTML = '';

    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <i class="bi bi-file-earmark"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeFile(${index})">
                <i class="bi bi-x"></i>
            </button>
        `;
        fileList.appendChild(fileItem);
    });
}

function removeFile(index) {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);

        files.forEach((file, i) => {
            if (i !== index) {
                dt.items.add(file);
            }
        });

        fileInput.files = dt.files;
        updateFileList(dt.files);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initFilePreview() {
    const previewButtons = document.querySelectorAll('button[onclick*="previewFile"]');

    previewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const onclick = this.getAttribute('onclick');
            if (onclick) {
                eval(onclick);
            }
        });
    });
}

function previewFile(fileId, fileName) {
    const previewUrl = `/web/files/preview/${fileId}`;
    window.open(previewUrl, '_blank', 'width=800,height=600');
}

function showUploadProgress() {
    const progressContainer = document.getElementById('uploadProgress');
    if (progressContainer) {
        progressContainer.style.display = 'block';
    }
}

function hideUploadProgress() {
    const progressContainer = document.getElementById('uploadProgress');
    if (progressContainer) {
        progressContainer.style.display = 'none';
    }
}

function updateUploadProgress(percent) {
    const progressBar = document.getElementById('uploadProgressBar');
    if (progressBar) {
        progressBar.style.width = percent + '%';
        progressBar.setAttribute('aria-valuenow', percent);
    }
}

function searchFiles() {
    const searchInput = document.getElementById('fileSearch');
    if (searchInput) {
        const query = searchInput.value.trim();
        if (query) {
            setUrlParameter('search', query);
        } else {
            const url = new URL(window.location);
            url.searchParams.delete('search');
            window.history.pushState({}, '', url);
        }
        window.location.reload();
    }
}

function filterFiles(type) {
    setUrlParameter('type', type);
    window.location.reload();
}

function sortFiles(field, order) {
    setUrlParameter('sort', field);
    setUrlParameter('order', order);
    window.location.reload();
}

function toggleAllFiles() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const fileCheckboxes = document.querySelectorAll('input[name="selectedFiles"]');

    if (selectAllCheckbox) {
        fileCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }
}

function deleteSelectedFiles() {
    const selectedFiles = document.querySelectorAll('input[name="selectedFiles"]:checked');

    if (selectedFiles.length === 0) {
        showAlert('삭제할 파일을 선택해주세요.', 'warning');
        return;
    }

    if (confirm(`선택된 ${selectedFiles.length}개의 파일을 삭제하시겠습니까?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/web/files/bulk-delete';

        const csrfToken = getCsrfToken();
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        selectedFiles.forEach(checkbox => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'fileIds';
            input.value = checkbox.value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }
}

function editFileInfo(fileId) {
    window.location.href = __antockUrl(`/web/files/edit/${fileId}`);
}

function saveFileInfo() {
    const form = document.querySelector('form[action*="/update/"]');
    if (form) {
        if (validateFileForm()) {
            form.submit();
        }
    }
}

function validateFileForm() {
    const description = document.getElementById('description');

    if (!description || !description.value.trim()) {
        showAlert('파일 설명을 입력해주세요.', 'danger');
        return false;
    }

    return true;
}

function submitFileUpload() {
    const form = document.getElementById('fileUploadForm');
    if (!form) return;

    const fileInput = document.getElementById('fileInput');
    if (!fileInput || !fileInput.files.length) {
        showAlert('업로드할 파일을 선택해주세요.', 'warning');
        return;
    }

    if (validateFileUploadForm()) {
        showUploadProgress();
        form.submit();
    }
}

function validateFileUploadForm() {
    const fileInput = document.getElementById('fileInput');
    const description = document.getElementById('fileDescription');

    if (!fileInput.files.length) {
        showAlert('업로드할 파일을 선택해주세요.', 'warning');
        return false;
    }

    const maxSize = 10 * 1024 * 1024;
    for (let file of fileInput.files) {
        if (file.size > maxSize) {
            showAlert(`파일 크기가 너무 큽니다. (${file.name})`, 'danger');
            return false;
        }
    }

    return true;
}