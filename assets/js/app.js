/* ============================================
   APP.JS — Shared Application Logic
   ============================================ */

/* ---- Component Loader ---- */
function loadComponents() {
    var sidebarEl = document.getElementById('sidebar-include');
    if (sidebarEl && !document.querySelector('.sidebar')) {
        fetch('/components/sidebar.html')
            .then(r => r.text())
            .then(t => {
                sidebarEl.innerHTML = t;
                highlightActiveSidebarLink();
                initSPANavigation();
            });
    }

    fetch('/components/topbar.html')
        .then(r => r.text())
        .then(t => {
            document.getElementById('topbar-include').innerHTML = t;
        });

    fetch('/components/footer.html')
        .then(r => r.text())
        .then(t => {
            document.getElementById('footer-include').innerHTML = t;
        });
}

/* ---- Dark Mode (init before components) ---- */
(function () {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

/* ---- Theme Toggle ---- */
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

/* ---- Toast Notification ---- */
function showToast(message, type) {
    type = type || 'info';
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add('show'); });
    setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
}

/* ---- Export Placeholder ---- */
function handleExport(type) {
    type = type || 'data';
    showToast('Preparing ' + type + ' export…', 'info');
    setTimeout(function () {
        showToast(type.charAt(0).toUpperCase() + type.slice(1) + ' export downloaded!', 'success');
    }, 1500);
}

/* ---- Pagination ---- */
function handlePage(n) {
    showToast('Navigating to page ' + n, 'info');
}

/* ---- Confirm Dangerous Action ---- */
function confirmAction(action, callback) {
    if (confirm('Are you sure you want to ' + action + '? This cannot be undone.')) {
        if (callback) callback();
        else showToast(action + ' completed', 'success');
    }
}

/* ---- Initialize on DOMContentLoaded ---- */
document.addEventListener('DOMContentLoaded', function () {
    loadComponents();
    wireButtons();
    initTableSearch();
    initSPANavigation();
});

/* ---- Global Table Search ---- */
function initTableSearch() {
    var searchInputs = document.querySelectorAll('.filter-search');
    searchInputs.forEach(function (input) {
        input.addEventListener('input', function (e) {
            var searchTerm = e.target.value.toLowerCase().trim();
            // Find the closest table container (usually data-table inside table-wrapper)
            var card = e.target.closest('.card, .page-content');
            if (!card) return;
            var table = card.querySelector('.data-table');
            if (!table) return;
            var tbody = table.querySelector('tbody');
            if (!tbody) return;

            var rows = tbody.querySelectorAll('tr');
            var matchCount = 0;

            rows.forEach(function (row) {
                // If there's an empty state row, ignore it
                if (row.classList.contains('empty-state-row')) return;

                var text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                    matchCount++;
                } else {
                    row.style.display = 'none';
                }
            });

            // Handle Empty State
            var emptyRow = tbody.querySelector('.empty-state-row');
            if (matchCount === 0) {
                if (!emptyRow) {
                    var colCount = table.querySelectorAll('thead th').length || 1;
                    emptyRow = document.createElement('tr');
                    emptyRow.className = 'empty-state-row';
                    emptyRow.innerHTML = '<td colspan="' + colCount + '"><div class="empty-state" style="display:block"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div class="empty-state-title">No results found</div><p>We couldn\'t find anything matching "' + e.target.value + '".</p></div></td>';
                    tbody.appendChild(emptyRow);
                } else {
                    emptyRow.style.display = '';
                    emptyRow.querySelector('p').textContent = 'We couldn\'t find anything matching "' + e.target.value + '".';
                }
            } else if (emptyRow) {
                emptyRow.style.display = 'none';
            }
        });
    });
}

/* ---- Auto-wire Missing Button Handlers ---- */
function wireButtons() {
    document.body.addEventListener('click', function (e) {
        var btn = e.target.closest('button, a.btn');
        if (!btn) return;
        if (btn.getAttribute('onclick')) return;
        if (btn.tagName === 'A' && btn.getAttribute('href') && btn.getAttribute('href') !== '#') return;
        if (btn.classList.contains('page-btn')) return;
        if (btn.classList.contains('modal-close')) return;

        var text = btn.textContent.trim().toLowerCase();

        // Export buttons
        if (text.includes('export')) {
            e.preventDefault();
            var pageType = document.querySelector('.page-title');
            var pg = pageType ? pageType.textContent : 'Data';
            openModal('exportConfig', { scope: pg });
            return;
        }

        // Filter buttons
        if (text.includes('filter')) {
            e.preventDefault();
            openModal('filter');
            return;
        }

        // Add Account
        if (text.includes('add account')) {
            e.preventDefault();
            openModal('addAccount');
            return;
        }

        // Add / New Subscription
        if (text.includes('add subscription') || text.includes('new subscription')) {
            e.preventDefault();
            openModal('addSubscription');
            return;
        }

        // Create Invoice
        if (text.includes('create invoice')) {
            e.preventDefault();
            openModal('createInvoice');
            return;
        }

        // Send Invoice
        if (text.includes('send invoice')) {
            e.preventDefault();
            openModal('sendInvoice');
            return;
        }

        // Schedule Report
        if (text.includes('schedule report')) {
            e.preventDefault();
            openModal('scheduleReport');
            return;
        }

        // Generate Key
        if (text.includes('generate key')) {
            e.preventDefault();
            openModal('generateKey');
            return;
        }

        // Invite Member
        if (text.includes('invite member')) {
            e.preventDefault();
            openModal('inviteMember');
            return;
        }

        // Save Changes / Save Preferences / Save Settings / Save Billing
        if (text.includes('save')) {
            e.preventDefault();
            showToast('Changes saved successfully!', 'success');
            return;
        }

        // Print
        if (text.includes('print')) {
            e.preventDefault();
            showToast('Preparing print view…', 'info');
            setTimeout(function () { window.print(); }, 500);
            return;
        }

        // Download PDF
        if (text.includes('download pdf')) {
            e.preventDefault();
            showToast('PDF downloaded!', 'success');
            return;
        }

        // Pause
        if (text.includes('pause')) {
            e.preventDefault();
            openModal('confirmPause');
            return;
        }

        // Change Plan
        if (text.includes('change plan') || text.includes('upgrade plan')) {
            e.preventDefault();
            openModal('changePlan');
            return;
        }

        // Payment Method
        if (text.includes('payment method') || text.includes('add card')) {
            e.preventDefault();
            openModal('managePayment');
            return;
        }

        // Table action buttons
        if (btn.classList.contains('table-action-btn')) {
            e.preventDefault();
            var title = btn.getAttribute('title') || '';
            var tl = title.toLowerCase();
            if (tl.includes('edit')) {
                // Find row context for edit
                var row = btn.closest('tr');
                var name = '';
                if (row) {
                    var nameEl = row.querySelector('.user-name');
                    name = nameEl ? nameEl.textContent : '';
                }
                openModal('editItem', { name: name, title: title });
            } else if (tl.includes('duplicate')) {
                showToast('Item duplicated successfully!', 'success');
            } else if (tl.includes('send') || tl.includes('reminder')) {
                showToast('Reminder email sent!', 'success');
            } else if (tl.includes('receipt')) {
                showToast('Receipt downloaded', 'success');
            } else if (tl.includes('retry')) {
                showToast('Retrying payment…', 'info');
            } else {
                showToast(title + ' action triggered', 'info');
            }
            return;
        }

        // Detail page edit buttons
        if (btn.classList.contains('btn-secondary') && text.includes('edit') && !text.includes('profile')) {
            e.preventDefault();
            openModal('editDetail');
            return;
        }

        // Missing module generic actions
        if (text.includes('contact csm') || text.includes('schedule call') || text.includes('send offer')) {
            e.preventDefault();
            showToast('Customer outreach initiated.', 'success');
            return;
        }

        if (text.includes('merge') || text.includes('close ticket') || text.includes('send & update')) {
            e.preventDefault();
            showToast('Ticket updated successfully.', 'success');
            return;
        }

        if (text.includes('process payment')) {
            e.preventDefault();
            showToast('Payment processing initiated.', 'info');
            return;
        }

        // Feature Flags
        if (text.includes('create flag') || (text.includes('manage') && btn.closest('.data-table'))) {
            e.preventDefault();
            openModal('manageFlag');
            return;
        }

        // Support Tickets
        if (text.includes('create ticket')) {
            e.preventDefault();
            openModal('createTicket');
            return;
        }

        // Partners
        if (text.includes('add partner') || text.includes('edit profile')) {
            e.preventDefault();
            openModal('managePartner');
            return;
        }

        // Cancel / Delete (danger actions)
        if (btn.classList.contains('btn-danger')) {
            e.preventDefault();
            openModal('confirmDelete', { action: text });
            return;
        }
    });
}

/* ============================================
   MODAL SYSTEM
   ============================================ */

var _modalOverlay = null;

function _ensureOverlay() {
    if (!_modalOverlay) {
        _modalOverlay = document.createElement('div');
        _modalOverlay.className = 'modal-overlay';
        _modalOverlay.id = 'modal-overlay';
        document.body.appendChild(_modalOverlay);
        // Close on backdrop click
        _modalOverlay.addEventListener('click', function (e) {
            if (e.target === _modalOverlay) closeModal();
        });
        // Close on ESC
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && _modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });
    }
    return _modalOverlay;
}

function openModal(type, data) {
    var overlay = _ensureOverlay();
    var html = _getModalHTML(type, data || {});
    overlay.innerHTML = html;
    // Trigger reflow then animate in
    requestAnimationFrame(function () {
        overlay.classList.add('active');
    });
}

function closeModal() {
    if (_modalOverlay) {
        _modalOverlay.classList.remove('active');
        setTimeout(function () {
            _modalOverlay.innerHTML = '';
        }, 300);
    }
}

function submitModal(type) {
    var messages = {
        addAccount: 'Account created successfully!',
        addSubscription: 'Subscription created successfully!',
        createInvoice: 'Invoice created successfully!',
        sendInvoice: 'Invoice sent successfully!',
        scheduleReport: 'Report scheduled successfully!',
        generateKey: 'API key generated successfully!',
        inviteMember: 'Invitation sent successfully!',
        editItem: 'Changes saved successfully!',
        editDetail: 'Changes saved successfully!',
        confirmDelete: 'Item deleted successfully.',
        confirmPause: 'Subscription paused.',
        filter: 'Filters applied.',
        manageFlag: 'Feature flag saved successfully!',
        createTicket: 'Support ticket created successfully!',
        managePartner: 'Partner profile saved successfully!'
    };
    closeModal();
    setTimeout(function () {
        showToast(messages[type] || 'Action completed!', type === 'confirmDelete' ? 'info' : 'success');
    }, 350);
}

/* ---- Modal Templates ---- */
function _getModalHTML(type, data) {
    var templates = {
        addAccount: _modalWrap('Add New Account', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Organization Name <span class="required">*</span></label>',
            '    <input type="text" class="form-input" placeholder="e.g. Acme Corp">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Contact Email <span class="required">*</span></label>',
            '    <input type="email" class="form-input" placeholder="admin@company.com">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Plan</label>',
            '    <select class="form-select"><option>Starter — $29/mo</option><option>Professional — $99/mo</option><option>Enterprise — $399/mo</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Billing Cycle</label>',
            '    <select class="form-select"><option>Monthly</option><option>Yearly (save 17%)</option></select>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-label">Contact Person</label>',
            '    <input type="text" class="form-input" placeholder="John Doe">',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-label">Notes</label>',
            '    <textarea class="form-textarea" rows="2" placeholder="Optional notes about this account…"></textarea>',
            '  </div>',
            '</div>'
        ].join('\n'), 'addAccount', 'Create Account'),

        addSubscription: _modalWrap('Add New Subscription', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Account <span class="required">*</span></label>',
            '    <select class="form-select"><option>Select account…</option><option>Acme Corp</option><option>Beta Labs</option><option>CloudSync Inc</option><option>DataSphere</option><option>NexaFlow</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Plan <span class="required">*</span></label>',
            '    <select class="form-select"><option>Starter — $29/mo</option><option>Professional — $99/mo</option><option>Enterprise — $399/mo</option><option>Free Trial — 14 days</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Start Date</label>',
            '    <input type="date" class="form-input" value="2026-03-03">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Billing Cycle</label>',
            '    <select class="form-select"><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-check"><input type="checkbox" checked> Auto-renew subscription</label>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-check"><input type="checkbox"> Send welcome email to account owner</label>',
            '  </div>',
            '</div>'
        ].join('\n'), 'addSubscription', 'Create Subscription'),

        createInvoice: _modalWrap('Create New Invoice', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Account <span class="required">*</span></label>',
            '    <select class="form-select"><option>Select account…</option><option>Acme Corp</option><option>Beta Labs</option><option>CloudSync Inc</option><option>DataSphere</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Invoice Number</label>',
            '    <input type="text" class="form-input" value="INV-2026-090" readonly>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Amount <span class="required">*</span></label>',
            '    <div class="input-group"><input type="number" class="form-input" placeholder="0.00"><span class="input-addon">USD</span></div>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Due Date</label>',
            '    <input type="date" class="form-input" value="2026-04-03">',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-label">Description</label>',
            '    <textarea class="form-textarea" rows="2" placeholder="Invoice line items or description…"></textarea>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-check"><input type="checkbox" checked> Send invoice to customer immediately</label>',
            '  </div>',
            '</div>'
        ].join('\n'), 'createInvoice', 'Create Invoice'),

        sendInvoice: _modalWrap('Send Invoice', [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Recipient Email <span class="required">*</span></label>',
            '    <input type="email" class="form-input" placeholder="billing@company.com">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Subject</label>',
            '    <input type="text" class="form-input" value="Invoice INV-2026-089 from SubsAdmin">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Message</label>',
            '    <textarea class="form-textarea" rows="3">Please find attached your invoice. Payment is due within 30 days.</textarea>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-check"><input type="checkbox" checked> Attach PDF copy</label>',
            '  </div>',
            '</div>'
        ].join('\n'), 'sendInvoice', 'Send Invoice'),

        scheduleReport: _modalWrap('Schedule Report', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Report Type <span class="required">*</span></label>',
            '    <select class="form-select"><option>Revenue Summary</option><option>Subscription Growth</option><option>Churn Analysis</option><option>Usage Report</option><option>Full Dashboard Export</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Frequency</label>',
            '    <select class="form-select"><option>Weekly (Monday)</option><option>Bi-weekly</option><option>Monthly (1st)</option><option>Quarterly</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Format</label>',
            '    <select class="form-select"><option>PDF</option><option>CSV</option><option>Excel (.xlsx)</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Start Date</label>',
            '    <input type="date" class="form-input" value="2026-03-10">',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-label">Recipients <span class="required">*</span></label>',
            '    <input type="text" class="form-input" placeholder="admin@company.com, cfo@company.com">',
            '    <span class="form-hint">Separate multiple emails with commas</span>',
            '  </div>',
            '</div>'
        ].join('\n'), 'scheduleReport', 'Schedule Report'),

        generateKey: _modalWrap('Generate API Key', [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Key Name <span class="required">*</span></label>',
            '    <input type="text" class="form-input" placeholder="e.g. Production API Key">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Permissions</label>',
            '    <select class="form-select"><option>Read Only</option><option>Read & Write</option><option>Full Access (Admin)</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Expiry</label>',
            '    <select class="form-select"><option>Never</option><option>30 days</option><option>90 days</option><option>1 year</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Rate Limit</label>',
            '    <select class="form-select"><option>1,000 req/min</option><option>5,000 req/min</option><option>10,000 req/min</option><option>Unlimited</option></select>',
            '  </div>',
            '</div>'
        ].join('\n'), 'generateKey', 'Generate Key'),

        inviteMember: _modalWrap('Invite Team Member', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Full Name <span class="required">*</span></label>',
            '    <input type="text" class="form-input" placeholder="Jane Smith">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Email <span class="required">*</span></label>',
            '    <input type="email" class="form-input" placeholder="jane@company.com">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Role</label>',
            '    <select class="form-select"><option>Admin</option><option>Manager</option><option>Billing</option><option>Viewer</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Department</label>',
            '    <select class="form-select"><option>Engineering</option><option>Sales</option><option>Finance</option><option>Operations</option></select>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-check"><input type="checkbox" checked> Send welcome email with login instructions</label>',
            '  </div>',
            '</div>'
        ].join('\n'), 'inviteMember', 'Send Invitation'),

        editItem: _modalWrap('Edit ' + (data.name || 'Item'), [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Name</label>',
            '    <input type="text" class="form-input" value="' + (data.name || '') + '">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Status</label>',
            '    <select class="form-select"><option>Active</option><option>Inactive</option><option>Trial</option><option>Paused</option><option>Cancelled</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Notes</label>',
            '    <textarea class="form-textarea" rows="2" placeholder="Add notes…"></textarea>',
            '  </div>',
            '</div>'
        ].join('\n'), 'editItem', 'Save Changes'),

        editDetail: _modalWrap('Edit Details', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Plan</label>',
            '    <select class="form-select"><option>Starter — $29/mo</option><option selected>Professional — $99/mo</option><option>Enterprise — $399/mo</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Billing Cycle</label>',
            '    <select class="form-select"><option selected>Monthly</option><option>Quarterly</option><option>Yearly</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Auto-Renew</label>',
            '    <select class="form-select"><option selected>Enabled</option><option>Disabled</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Payment Method</label>',
            '    <select class="form-select"><option selected>Visa •••• 4242</option><option>MasterCard •••• 8888</option><option>Add new card…</option></select>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-label">Notes</label>',
            '    <textarea class="form-textarea" rows="2" placeholder="Internal notes…"></textarea>',
            '  </div>',
            '</div>'
        ].join('\n'), 'editDetail', 'Save Changes'),

        manageFlag: _modalWrap('Manage Feature Flag', [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Flag Name</label>',
            '    <input type="text" class="form-input" placeholder="e.g. New Dashboard V2">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Key</label>',
            '    <input type="text" class="form-input" placeholder="e.g. dashboard_v2_enabled">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Target Plan</label>',
            '    <select class="form-select"><option>All Plans</option><option>Enterprise Only</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Rollout Percentage</label>',
            '    <input type="range" style="width:100%" min="0" max="100" value="0">',
            '  </div>',
            '</div>'
        ].join('\n'), 'manageFlag', 'Save Feature Flag'),

        createTicket: _modalWrap('Create Support Ticket', [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Customer / Account</label>',
            '    <select class="form-select"><option>Select Account</option><option>Acme Corp</option><option>TechFlow Inc</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Subject</label>',
            '    <input type="text" class="form-input" placeholder="Issue summary">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Priority</label>',
            '    <select class="form-select"><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Description</label>',
            '    <textarea class="form-textarea" rows="3" placeholder="Detailed description of the issue..."></textarea>',
            '  </div>',
            '</div>'
        ].join('\n'), 'createTicket', 'Submit Ticket'),

        managePartner: _modalWrap('Manage Partner', [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Partner Name</label>',
            '    <input type="text" class="form-input" placeholder="Company or Individual Name">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Type</label>',
            '    <select class="form-select"><option>Affiliate</option><option>Reseller</option><option>Agency</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Commission Structure</label>',
            '    <select class="form-select"><option>20% RevShare</option><option>30% RevShare</option><option>$10 CPA</option></select>',
            '  </div>',
            '</div>'
        ].join('\n'), 'managePartner', 'Save Partner'),

        confirmDelete: _modalDanger(
            (data.action || 'delete').indexOf('cancel') >= 0 ? 'Cancel Subscription' : 'Confirm Deletion',
            (data.action || 'delete').indexOf('cancel') >= 0
                ? 'Are you sure you want to cancel this subscription? The customer will lose access at the end of the current billing period.'
                : 'Are you sure you want to delete this item? This action <strong>cannot be undone</strong> and all associated data will be permanently removed.',
            'confirmDelete',
            (data.action || 'delete').indexOf('cancel') >= 0 ? 'Cancel Subscription' : 'Delete Permanently'
        ),

        confirmPause: _modalDanger(
            'Pause Subscription',
            'Pausing this subscription will temporarily suspend the customer\'s access. They will not be billed during the pause period. You can resume at any time.',
            'confirmPause',
            'Pause Subscription'
        ),

        filter: _modalWrap('Filter Results', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Status</label>',
            '    <select class="form-select"><option>All Statuses</option><option>Active</option><option>Trial</option><option>Paused</option><option>Cancelled</option><option>Expired</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Plan</label>',
            '    <select class="form-select"><option>All Plans</option><option>Starter</option><option>Professional</option><option>Enterprise</option><option>Free Trial</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Date Range</label>',
            '    <select class="form-select"><option>All Time</option><option>Last 7 days</option><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Sort By</label>',
            '    <select class="form-select"><option>Newest First</option><option>Oldest First</option><option>Name A–Z</option><option>Name Z–A</option><option>Amount High–Low</option><option>Amount Low–High</option></select>',
            '  </div>',
            '</div>'
        ].join('\n'), 'filter', 'Apply Filters'),

        exportConfig: _modalWrap('Export ' + (data.scope || 'Data'), [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">Format</label>',
            '    <select class="form-select"><option>CSV (.csv)</option><option>Excel (.xlsx)</option><option>PDF (.pdf)</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Date Range</label>',
            '    <select class="form-select"><option>All Time</option><option>This Month</option><option>Last 30 Days</option><option>Year to Date</option><option>Custom Range…</option></select>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-label">Data Columns</label>',
            '    <select class="form-select"><option>All Standard Columns</option><option>Essential Only</option><option>Custom Selection…</option></select>',
            '  </div>',
            '</div>'
        ].join('\n'), 'exportConfig', 'Generate Export'),

        changePlan: _modalWrap('Change Subscription Plan', [
            '<div class="form-grid">',
            '  <div class="form-group">',
            '    <label class="form-label">New Plan</label>',
            '    <select class="form-select"><option>Starter — $29/mo</option><option>Professional — $99/mo</option><option selected>Enterprise — $399/mo</option></select>',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Billing Cycle</label>',
            '    <select class="form-select"><option selected>Monthly</option><option>Yearly (Save 17%)</option></select>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <label class="form-check"><input type="checkbox" checked> Prorate differences and apply to next invoice</label>',
            '  </div>',
            '  <div class="form-group full-width">',
            '    <div class="modal-message" style="background:var(--gray-50);padding:var(--space-3);border-radius:var(--radius-md);margin-top:var(--space-2)">',
            '       <strong>Estimated Proration:</strong> $24.50 credit applied towards new plan.',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n'), 'changePlan', 'Confirm Plan Change'),

        managePayment: _modalWrap('Add Payment Method', [
            '<div class="form-grid cols-1">',
            '  <div class="form-group">',
            '    <label class="form-label">Cardholder Name</label>',
            '    <input type="text" class="form-input" placeholder="Name on card">',
            '  </div>',
            '  <div class="form-group">',
            '    <label class="form-label">Card Number</label>',
            '    <input type="text" class="form-input" placeholder="0000 0000 0000 0000">',
            '  </div>',
            '  <div class="form-group" style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">',
            '    <div>',
            '      <label class="form-label">Expiry (MM/YY)</label>',
            '      <input type="text" class="form-input" placeholder="MM/YY">',
            '    </div>',
            '    <div>',
            '      <label class="form-label">CVC</label>',
            '      <input type="text" class="form-input" placeholder="123">',
            '    </div>',
            '  </div>',
            '  <div class="form-group" style="margin-top:var(--space-2)">',
            '    <label class="form-check"><input type="checkbox" checked> Make this my default payment method</label>',
            '  </div>',
            '</div>'
        ].join('\n'), 'managePayment', 'Save Card'),

        signOut: _modalDanger(
            'Sign Out',
            'Are you sure you want to sign out of SubsAdmin? You will need to enter your credentials to access the dashboard again.',
            'signOut',
            'Sign Out'
        )
    };

    return templates[type] || _modalWrap('Action', '<p class="modal-message">This feature is being configured.</p>', type, 'OK');
}

/* ---- Modal Builders ---- */
function _modalWrap(title, bodyHTML, submitType, submitLabel) {
    return [
        '<div class="modal">',
        '  <div class="modal-header">',
        '    <h3 class="modal-title">' + title + '</h3>',
        '    <button class="modal-close" onclick="closeModal()">✕</button>',
        '  </div>',
        '  <div class="modal-body">' + bodyHTML + '</div>',
        '  <div class="modal-footer">',
        '    <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>',
        '    <button class="btn btn-primary" onclick="submitModal(\'' + submitType + '\')">' + submitLabel + '</button>',
        '  </div>',
        '</div>'
    ].join('\n');
}

function _modalDanger(title, message, submitType, submitLabel) {
    return [
        '<div class="modal modal-danger">',
        '  <div class="modal-header">',
        '    <h3 class="modal-title">' + title + '</h3>',
        '    <button class="modal-close" onclick="closeModal()">✕</button>',
        '  </div>',
        '  <div class="modal-body">',
        '    <div class="modal-icon danger">⚠️</div>',
        '    <p class="modal-message">' + message + '</p>',
        '  </div>',
        '  <div class="modal-footer">',
        '    <button class="btn btn-secondary" onclick="closeModal()">Go Back</button>',
        '    <button class="btn btn-danger" onclick="submitModal(\'' + submitType + '\')">' + submitLabel + '</button>',
        '  </div>',
        '</div>'
    ].join('\n');
}

/* ============================================
   SPA-LIKE NAVIGATION
   ============================================ */

function highlightActiveSidebarLink() {
    document.querySelectorAll('.sidebar-link').forEach(function (l) {
        // Reset all links
        l.style.background = '';
        l.style.color = '';
        l.style.fontWeight = '';
        l.style.borderLeft = '';
        // Highlight active
        if (location.pathname.includes(l.dataset.page)) {
            l.style.background = 'var(--sidebar-active-bg,#EEF2FF)';
            l.style.color = 'var(--sidebar-active-text,#4F46E5)';
            l.style.fontWeight = '600';
            l.style.borderLeft = '3px solid var(--sidebar-active-border,#4F46E5)';
        }
    });
}

var _spaNavigating = false;

function navigateTo(url, pushState) {
    if (_spaNavigating) return;
    _spaNavigating = true;

    var pageContent = document.querySelector('.page-content');
    if (!pageContent) {
        // Fallback: full navigation
        window.location.href = url;
        return;
    }

    // Fade out current content
    pageContent.classList.add('page-fade-out');

    // After fade completes, fetch and swap
    setTimeout(function () {
        fetch(url)
            .then(function (r) { return r.text(); })
            .then(function (html) {
                // Parse the fetched HTML
                var parser = new DOMParser();
                var doc = parser.parseFromString(html, 'text/html');
                var newContent = doc.querySelector('.page-content');
                var newTitle = doc.querySelector('title');

                if (newContent) {
                    // Swap interior content
                    pageContent.innerHTML = newContent.innerHTML;
                    // Copy class name (e.g. dashboard-page, accounts-page)
                    pageContent.className = newContent.className;
                    // Ensure fade-out is on for the swap frame
                    pageContent.classList.add('page-fade-out');
                }

                // Update title
                if (newTitle) {
                    document.title = newTitle.textContent;
                }

                // Push to browser history
                if (pushState !== false) {
                    history.pushState({ url: url }, document.title, url);
                }

                // Update sidebar highlight
                highlightActiveSidebarLink();

                // Re-wire interactive elements for new content
                wireButtons();
                initTableSearch();

                // Fade in after a tiny paint frame
                requestAnimationFrame(function () {
                    pageContent.classList.remove('page-fade-out');
                });

                // Scroll to top
                window.scrollTo(0, 0);

                _spaNavigating = false;
            })
            .catch(function () {
                // On error, do a full navigation
                window.location.href = url;
            });
    }, 200); // matches CSS transition duration
}

function initSPANavigation() {
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
        // Remove any previously attached SPA handler
        if (link._spaHandler) {
            link.removeEventListener('click', link._spaHandler);
        }
        link._spaHandler = function (e) {
            e.preventDefault();
            var href = link.getAttribute('href');
            if (href && href !== location.pathname) {
                navigateTo(href, true);
            }
        };
        link.addEventListener('click', link._spaHandler);
    });
}

// Handle browser Back/Forward
window.addEventListener('popstate', function (e) {
    if (e.state && e.state.url) {
        navigateTo(e.state.url, false);
    } else {
        navigateTo(location.pathname, false);
    }
});

// Set initial history state
if (history.replaceState) {
    history.replaceState({ url: location.pathname }, document.title, location.pathname);
}
