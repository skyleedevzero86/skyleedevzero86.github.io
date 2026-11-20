
document.addEventListener('DOMContentLoaded', function() {
    initCorpPage();
});

function initCorpPage() {
    initBizNoFormatting();
    initSearchFormEnter();
    initTableRowClick();
    initDeleteConfirm();
    initPagination();
}

function initBizNoFormatting() {
    const bizNoInputs = document.querySelectorAll('input[name="bizNo"], input[id="bizNo"]');
    
    bizNoInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            if (value.length <= 10) {
                if (value.length > 5) {
                    value = value.substring(0, 3) + '-' + value.substring(3, 5) + '-' + value.substring(5);
                } else if (value.length > 3) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                e.target.value = value;
            }
        });
    });
}

function initSearchFormEnter() {
    const searchForms = document.querySelectorAll('.search-form');
    
    searchForms.forEach(form => {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    form.submit();
                }
            });
        });
    });
}

function initTableRowClick() {
    const tableRows = document.querySelectorAll('tbody tr[onclick]');
    
    tableRows.forEach(row => {
        row.style.cursor = 'pointer';
        row.addEventListener('click', function(e) {
            if (e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                eval(onclick);
            }
        });
    });
}

function initDeleteConfirm() {
    const deleteButtons = document.querySelectorAll('button[onclick*="deleteCorp"]');
    
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

function initPagination() {
    const paginationLinks = document.querySelectorAll('.pagination a[onclick*="goToPage"]');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                eval(onclick);
            }
        });
    });
}

function resetForm() {
    const form = document.querySelector('.search-form');
    if (form) {
        const inputs = form.querySelectorAll('input[type="text"]');
        inputs.forEach(input => {
            input.value = '';
        });
        
        window.location.href = __antockUrl('/corp/list');
    }
}

function viewDetail(corpId) {
    window.location.href = __antockUrl('/corp/detail/' + corpId);
}

function deleteCorp(corpId, bizNm) {
    if (confirm(`'${bizNm}' 법인을 삭제하시겠습니까?`)) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/corp/delete/${corpId}`;

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

function goToPage(pageNum) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', pageNum);
    if (!params.has('size')) params.set('size', '20');
    if (!params.has('sort')) params.set('sort', 'id,desc');
    window.location.search = params.toString();
}

function editCorp(corpId) {
    window.location.href = __antockUrl('/corp/modify/' + corpId);
}

function searchSimilar() {
    const corpName = document.querySelector('.corp-name')?.textContent || '';
    const city = document.querySelector('[data-city]')?.getAttribute('data-city') || '';
    const district = document.querySelector('[data-district]')?.getAttribute('data-district') || '';

    const searchUrl = '/corp/search?city=' + encodeURIComponent(city) +
        '&district=' + encodeURIComponent(district);

    window.location.href = __antockUrl(searchUrl);
}

function exportCorpInfo() {
    const corpInfo = {
        id: document.querySelector('[data-corp-id]')?.getAttribute('data-corp-id') || '',
        bizNm: document.querySelector('.corp-name')?.textContent || '',
        bizNo: document.querySelector('.bizno-display')?.textContent || '',
        corpRegNo: document.querySelector('[data-corp-reg-no]')?.getAttribute('data-corp-reg-no') || '',
        sellerId: document.querySelector('[data-seller-id]')?.getAttribute('data-seller-id') || '',
        address: document.querySelector('.address-display')?.textContent || '',
        regionCd: document.querySelector('[data-region-cd]')?.getAttribute('data-region-cd') || '',
        username: document.querySelector('[data-username]')?.getAttribute('data-username') || ''
    };

    const dataStr = JSON.stringify(corpInfo, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = '법인정보_' + corpInfo.bizNm + '_' + new Date().getTime() + '.json';
    link.click();
}

function goBack() {
    if (document.referrer && document.referrer.includes('/corp/search')) {
        window.history.back();
    } else {
        window.location.href = __antockUrl('/corp/search');
    }
}

function validateCorpForm() {
    const form = document.getElementById('corpForm');
    if (!form) return true;

    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach((field) => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    });

    if (!isValid) {
        showAlert('필수 항목을 모두 입력해주세요.', 'danger');
    }

    return isValid;
}

function initCKEditor() {
    if (typeof CKEDITOR !== 'undefined') {
        CKEDITOR.replace("description", {
            height: 200,
            removePlugins: "elementspath,resize",
            toolbar: [
                { name: "document", items: ["Source"] },
                {
                    name: "clipboard",
                    items: [
                        "Cut", "Copy", "Paste", "PasteText", "PasteFromWord",
                        "-", "Undo", "Redo"
                    ]
                },
                {
                    name: "editing",
                    items: [
                        "Find", "Replace", "-", "SelectAll", "-",
                        "SpellChecker", "Scayt"
                    ]
                },
                "/",
                {
                    name: "basicstyles",
                    items: [
                        "Bold", "Italic", "Underline", "Strike",
                        "Subscript", "Superscript", "-", "RemoveFormat"
                    ]
                },
                {
                    name: "paragraph",
                    items: [
                        "NumberedList", "BulletedList", "-", "Outdent", "Indent",
                        "-", "Blockquote", "CreateDiv", "-", "JustifyLeft",
                        "JustifyCenter", "JustifyRight", "JustifyBlock",
                        "-", "BidiLtr", "BidiRtl"
                    ]
                },
                { name: "links", items: ["Link", "Unlink", "Anchor"] },
                {
                    name: "insert",
                    items: [
                        "Image", "Flash", "Table", "HorizontalRule",
                        "Smiley", "SpecialChar", "PageBreak", "Iframe"
                    ]
                },
                "/",
                { name: "styles", items: ["Styles", "Format", "Font", "FontSize"] },
                { name: "colors", items: ["TextColor", "BGColor"] },
                { name: "tools", items: ["Maximize", "ShowBlocks"] }
            ]
        });
    }
}

function initCorpSearchAutocomplete() {
    const searchInputs = document.querySelectorAll('input[name="bizNm"], input[id="bizNm"]');

    searchInputs.forEach(input => {
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const query = this.value.trim();
                if (query.length >= 2) {
                    searchCorpSuggestions(query, this);
                }
            }, 300);
        });
    });
}

function searchCorpSuggestions(query, input) {
    console.log('Searching for:', query);
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            goBack();
        }

        if (e.ctrlKey && e.key === 'c' && !window.getSelection().toString()) {
            const corpName = document.querySelector('.corp-name');
            if (corpName) {
                e.preventDefault();
                copyToClipboard(corpName.textContent);
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initCorpPage();
    initCKEditor();
    initCorpSearchAutocomplete();
    initKeyboardShortcuts();
});