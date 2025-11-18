const $ = (id) => document.getElementById(id);

// Application State
let currentUser = null;
let currentRole = null;
let productionData = [];
let taskData = [];
let inventoryData = [];
let editingProductionId = null;
let editingTaskId = null;
let editingInventoryId = null;

const STORAGE_KEYS = {
    session: 'nah-session',
    production: 'productionData',
    tasks: 'taskData',
    inventory: 'inventoryData'
};
const DATA_STORAGE_KEYS = [
    STORAGE_KEYS.production,
    STORAGE_KEYS.tasks,
    STORAGE_KEYS.inventory
];

const CLIENT_ID = `nah-client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const SYNC_CHANNEL = 'nah-app-sync-channel';
const broadcastChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel(SYNC_CHANNEL)
    : null;

// Default users for demo (in production, this should be server-side authentication)
const defaultUsers = {
    supervisor: { username: 'supervisor', password: 'supervisor123', role: 'supervisor' },
    operator: { username: 'operator', password: 'operator123', role: 'operator' },
    staff: { username: 'staff', password: 'staff123', role: 'staff' }
};

// Role Permissions
const rolePermissions = {
    supervisor: {
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canViewAll: true
    },
    operator: {
        canAdd: true,
        canEdit: true,
        canDelete: false,
        canViewAll: true
    },
    staff: {
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canViewAll: true
    }
};

const productionStatuses = {
    semai: 'Semai',
    penjemuran: 'Penjemuran',
    pembibitan: 'Pembibitan',
    peremajaan: 'Peremajaan',
    pembesaran: 'Pembesaran',
    panen: 'Panen',
    sukses: 'Sukses',
    gagal: 'Gagal'
};

const taskStatusLabels = {
    belum: 'Belum Dikerjakan',
    sedang: 'Sedang Dikerjakan',
    selesai: 'Selesai Dikerjakan'
};

// DOM References
const loginPage = $('loginPage');
const dashboardPage = $('dashboardPage');
const loginForm = $('loginForm');
const loginError = $('loginError');
const usernameInput = $('username');
const passwordInput = $('password');
const roleSelect = $('role');
const currentUserEl = $('currentUser');
const currentRoleEl = $('currentRole');
const logoutBtn = $('logoutBtn');

const totalProduksiEl = $('totalProduksi');
const totalSuksesEl = $('totalSukses');
const totalGagalEl = $('totalGagal');
const totalBerlangsungEl = $('totalBerlangsung');
const totalTaskBelumEl = $('totalTaskBelum');
const totalTaskSedangEl = $('totalTaskSedang');
const totalTaskSelesaiEl = $('totalTaskSelesai');
const totalBahanEl = $('totalBahan');
const stokRendahEl = $('stokRendah');
const stokCukupEl = $('stokCukup');

const addProductionBtn = $('addProductionBtn');
const addTaskBtn = $('addTaskBtn');
const addInventoryBtn = $('addInventoryBtn');
const statusFilter = $('statusFilter');
const taskStatusFilter = $('taskStatusFilter');
const inventoryCategoryFilter = $('inventoryCategoryFilter');
const inventorySearchInput = $('inventorySearch');

const productionTableBody = $('productionTableBody');
const taskTableBody = $('taskTableBody');
const inventoryTableBody = $('inventoryTableBody');
const productionActionHeader = $('actionHeader');
const taskActionHeader = $('taskActionHeader');
const inventoryActionHeader = $('inventoryActionHeader');

const productionModal = $('productionModal');
const productionForm = $('productionForm');
const productionModalClose = productionModal?.querySelector('.close');
const productionCancelBtn = $('cancelBtn');

const taskModal = $('taskModal');
const taskForm = $('taskForm');
const taskModalClose = taskModal?.querySelector('.close-task');
const taskCancelBtn = $('cancelTaskBtn');

const inventoryModal = $('inventoryModal');
const inventoryForm = $('inventoryForm');
const inventoryModalClose = inventoryModal?.querySelector('.close-inventory');
const inventoryCancelBtn = $('cancelInventoryBtn');

// Utility helpers
const publishSync = (key) => {
    if (!key) return;
    try {
        broadcastChannel?.postMessage({ key, senderId: CLIENT_ID, timestamp: Date.now() });
    } catch (error) {
        console.warn('Gagal mengirim pesan sinkronisasi', error);
    }
};

const persistArray = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        publishSync(key);
    } catch (error) {
        console.error('Gagal menyimpan data ke localStorage', error);
    }
};

const persistSession = (sessionData) => {
    try {
        if (sessionData) {
            localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionData));
        } else {
            localStorage.removeItem(STORAGE_KEYS.session);
        }
        publishSync(STORAGE_KEYS.session);
    } catch (error) {
        console.error('Gagal memperbarui sesi', error);
    }
};

const loadArray = (key) => {
    try {
        const parsed = JSON.parse(localStorage.getItem(key));
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

function seedData() {
    productionData = loadArray(STORAGE_KEYS.production);
    taskData = loadArray(STORAGE_KEYS.tasks);
    inventoryData = loadArray(STORAGE_KEYS.inventory);

    if (productionData.length === 0) {
        productionData = [
            {
                id: 1,
                name: 'Selada Hidroponik Batch 1',
                date: '2024-01-15',
                status: 'semai',
                notes: 'Produksi selada dalam sistem NFT',
                nutrientType: 'AB Mix Premium',
                nutrientAmount: 1.5
            },
            {
                id: 2,
                name: 'Bayam Hidroponik Batch 1',
                date: '2024-01-20',
                status: 'pembibitan',
                notes: 'Proses pembibitan dalam media rockwool',
                nutrientType: 'AB Mix Premium',
                nutrientAmount: 1.2
            },
            {
                id: 3,
                name: 'Kangkung Hidroponik Batch 1',
                date: '2024-01-10',
                status: 'panen',
                notes: 'Siap dipanen minggu depan',
                nutrientType: 'AB Mix Reguler',
                nutrientAmount: 1.8
            },
            {
                id: 4,
                name: 'Pakcoy Hidroponik Batch 1',
                date: '2024-01-25',
                status: 'sukses',
                notes: 'Produksi berhasil dengan hasil panen optimal',
                nutrientType: 'AB Mix Premium',
                nutrientAmount: 2
            },
            {
                id: 5,
                name: 'Sawi Hidroponik Batch 1',
                date: '2024-02-01',
                status: 'gagal',
                notes: 'Gagal karena masalah nutrisi',
                nutrientType: 'AB Mix Reguler',
                nutrientAmount: 1
            }
        ];
        persistArray(STORAGE_KEYS.production, productionData);
    }

    if (taskData.length === 0) {
        taskData = [
            {
                id: 1,
                title: 'Pemeliharaan sistem NFT',
                assignee: 'Staff A',
                deadline: '2024-02-15',
                status: 'belum',
                description: 'Melakukan pengecekan sistem NFT untuk batch selada'
            },
            {
                id: 2,
                title: 'Penambahan nutrisi hidroponik',
                assignee: 'Operator B',
                deadline: '2024-02-10',
                status: 'sedang',
                description: 'Mengatur nutrisi pada fase pembesaran'
            },
            {
                id: 3,
                title: 'Pemanenan selada batch 1',
                assignee: 'Staff C',
                deadline: '2024-02-05',
                status: 'selesai',
                description: 'Menjamin panen sesuai standar kualitas'
            }
        ];
        persistArray(STORAGE_KEYS.tasks, taskData);
    }

    if (inventoryData.length === 0) {
        inventoryData = [
            {
                id: 1,
                name: 'Nutrisi AB Mix Premium',
                category: 'nutrisi',
                initialStock: 50,
                usage: 12,
                unit: 'liter'
            },
            {
                id: 2,
                name: 'Benih Selada Hijau',
                category: 'benih',
                initialStock: 2000,
                usage: 750,
                unit: 'butir'
            },
            {
                id: 3,
                name: 'Rockwool Medium',
                category: 'media',
                initialStock: 300,
                usage: 40,
                unit: 'blok'
            }
        ];
        persistArray(STORAGE_KEYS.inventory, inventoryData);
    }
}

function hydrateCollectionsFromStorage() {
    productionData = loadArray(STORAGE_KEYS.production);
    taskData = loadArray(STORAGE_KEYS.tasks);
    inventoryData = loadArray(STORAGE_KEYS.inventory);
}

function refreshDashboardTables() {
    if (!dashboardPage?.classList.contains('active')) return;
    updateAccessControls();
    updateStatistics();
    renderProductionTable(statusFilter ? statusFilter.value : 'all');
    renderTaskTable(taskStatusFilter ? taskStatusFilter.value : 'all');
    renderInventoryTable(
        inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all',
        inventorySearchInput ? inventorySearchInput.value : ''
    );
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}

function remainingStock(item) {
    return Math.max(item.initialStock - item.usage, 0);
}

function stockStatus(item) {
    const remaining = remainingStock(item);
    const threshold = item.initialStock * 0.25;
    return remaining <= threshold ? 'Perlu Restock' : 'Stok Aman';
}

function updateStatistics() {
    if (totalProduksiEl) totalProduksiEl.textContent = productionData.length;
    if (totalSuksesEl) totalSuksesEl.textContent = productionData.filter(p => p.status === 'sukses').length;
    if (totalGagalEl) totalGagalEl.textContent = productionData.filter(p => p.status === 'gagal').length;
    if (totalBerlangsungEl) {
        totalBerlangsungEl.textContent = productionData.filter(p => !['sukses', 'gagal'].includes(p.status)).length;
    }

    const belum = taskData.filter(t => t.status === 'belum').length;
    const sedang = taskData.filter(t => t.status === 'sedang').length;
    const selesai = taskData.filter(t => t.status === 'selesai').length;
    if (totalTaskBelumEl) totalTaskBelumEl.textContent = belum;
    if (totalTaskSedangEl) totalTaskSedangEl.textContent = sedang;
    if (totalTaskSelesaiEl) totalTaskSelesaiEl.textContent = selesai;

    if (totalBahanEl) totalBahanEl.textContent = inventoryData.length;
    const lowStock = inventoryData.filter(item => remainingStock(item) <= item.initialStock * 0.25).length;
    if (stokRendahEl) stokRendahEl.textContent = lowStock;
    if (stokCukupEl) stokCukupEl.textContent = inventoryData.length - lowStock;
}

function renderProductionTable(filterStatus = 'all') {
    if (!productionTableBody) return;
    productionTableBody.innerHTML = '';
    const permissions = rolePermissions[currentRole] || {};

    const filtered = filterStatus === 'all'
        ? productionData
        : productionData.filter(item => item.status === filterStatus);

    if (productionActionHeader) {
        productionActionHeader.hidden = !(permissions.canEdit || permissions.canDelete);
    }

    if (filtered.length === 0) {
        const row = document.createElement('tr');
        const colSpan = (permissions.canEdit || permissions.canDelete) ? 8 : 7;
        row.innerHTML = `<td colspan="${colSpan}" style="text-align:center; padding:24px; color:var(--text-light);">Tidak ada data produksi</td>`;
        productionTableBody.appendChild(row);
        return;
    }

    filtered.forEach(item => {
        const row = document.createElement('tr');
        const nutrientType = item.nutrientType?.trim() || '-';
        const nutrientAmount = typeof item.nutrientAmount === 'number'
            ? `${item.nutrientAmount.toFixed(2)} liter`
            : (item.nutrientAmount || '-');
        const statusLabel = productionStatuses[item.status] || item.status;
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${formatDate(item.date)}</td>
            <td><span class="status-badge ${item.status}">${statusLabel}</span></td>
            <td>${item.notes || '-'}</td>
            <td>${nutrientType}</td>
            <td>${nutrientAmount}</td>
            ${permissions.canEdit || permissions.canDelete ? `
                <td>
                    <div class="action-buttons">
                        ${permissions.canEdit ? `<button class="btn btn-warning" data-action="edit" data-id="${item.id}">Edit</button>` : ''}
                        ${permissions.canDelete ? `<button class="btn btn-danger" data-action="delete" data-id="${item.id}">Hapus</button>` : ''}
                    </div>
                </td>
            ` : ''}
        `;
        productionTableBody.appendChild(row);
    });
}

function renderTaskTable(filterStatus = 'all') {
    if (!taskTableBody) return;
    taskTableBody.innerHTML = '';
    const permissions = rolePermissions[currentRole] || {};

    if (taskActionHeader) {
        taskActionHeader.style.display = (permissions.canEdit || permissions.canDelete) ? '' : 'none';
    }

    const filtered = filterStatus === 'all'
        ? taskData
        : taskData.filter(task => task.status === filterStatus);

    if (filtered.length === 0) {
        const row = document.createElement('tr');
        const colSpan = (permissions.canEdit || permissions.canDelete) ? 6 : 5;
        row.innerHTML = `<td colspan="${colSpan}" style="text-align:center; padding:24px; color:var(--text-light);">Tidak ada tugas</td>`;
        taskTableBody.appendChild(row);
        return;
    }

    filtered.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.assignee}</td>
            <td>${formatDate(task.deadline)}</td>
            <td><span class="status-badge ${task.status}">${taskStatusLabels[task.status] || task.status}</span></td>
            <td>${task.description || '-'}</td>
            ${permissions.canEdit || permissions.canDelete ? `
                <td>
                    <div class="action-buttons">
                        ${permissions.canEdit ? `<button class="btn btn-warning" data-task-action="edit" data-id="${task.id}">Edit</button>` : ''}
                        ${permissions.canDelete ? `<button class="btn btn-danger" data-task-action="delete" data-id="${task.id}">Hapus</button>` : ''}
                    </div>
                </td>
            ` : ''}
        `;
        taskTableBody.appendChild(row);
    });
}

function renderInventoryTable(category = 'all', searchTerm = '') {
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = '';
    const permissions = rolePermissions[currentRole] || {};

    if (inventoryActionHeader) {
        inventoryActionHeader.style.display = (permissions.canEdit || permissions.canDelete) ? '' : 'none';
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = inventoryData.filter(item => {
        const matchCategory = category === 'all' ? true : item.category === category;
        const matchSearch = normalizedSearch ? item.name.toLowerCase().includes(normalizedSearch) : true;
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        const row = document.createElement('tr');
        const colSpan = (permissions.canEdit || permissions.canDelete) ? 8 : 7;
        row.innerHTML = `<td colspan="${colSpan}" style="text-align:center; padding:24px; color:var(--text-light);">Tidak ada data inventaris</td>`;
        inventoryTableBody.appendChild(row);
        return;
    }

    filtered.forEach(item => {
        const remaining = remainingStock(item);
        const statusText = stockStatus(item);
        const lowStock = remaining <= item.initialStock * 0.25;
        const statusClass = lowStock ? 'gagal' : 'sukses';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.initialStock}</td>
            <td>${item.usage}</td>
            <td>${remaining}</td>
            <td>${item.unit}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            ${permissions.canEdit || permissions.canDelete ? `
                <td>
                    <div class="action-buttons">
                        ${permissions.canEdit ? `<button class="btn btn-warning" data-inventory-action="edit" data-id="${item.id}">Edit</button>` : ''}
                        ${permissions.canDelete ? `<button class="btn btn-danger" data-inventory-action="delete" data-id="${item.id}">Hapus</button>` : ''}
                    </div>
                </td>
            ` : ''}
        `;
        inventoryTableBody.appendChild(row);
    });
}

function updateAccessControls() {
    const permissions = rolePermissions[currentRole] || {};
    if (addProductionBtn) addProductionBtn.hidden = !permissions.canAdd;
    if (addTaskBtn) addTaskBtn.style.display = permissions.canAdd ? '' : 'none';
    if (addInventoryBtn) addInventoryBtn.style.display = permissions.canAdd ? '' : 'none';
}

function openProductionModal(title = 'Tambah Produksi Baru') {
    editingProductionId = null;
    productionForm?.reset();
    const titleEl = $('modalTitle');
    if (titleEl) titleEl.textContent = title;
    if ($('productionDate')) $('productionDate').valueAsDate = new Date();
    productionModal?.classList.add('active');
}

function showDashboard() {
    if (!dashboardPage || !loginPage) return;
    loginPage.classList.remove('active');
    dashboardPage.classList.add('active');
    if (currentUserEl) currentUserEl.textContent = currentUser || '';
    if (currentRoleEl) currentRoleEl.textContent = currentRole || '';
    loginError.textContent = '';
    refreshDashboardTables();
}

function showLoginPage() {
    if (!dashboardPage || !loginPage) return;
    dashboardPage.classList.remove('active');
    loginPage.classList.add('active');
    currentUser = null;
    currentRole = null;
    if (currentUserEl) currentUserEl.textContent = '';
    if (currentRoleEl) currentRoleEl.textContent = '';
}

function handleExternalStateChange(key) {
    if (!key) return;
    if (key === STORAGE_KEYS.session) {
        restoreSession();
        return;
    }
    if (!DATA_STORAGE_KEYS.includes(key)) return;
    hydrateCollectionsFromStorage();
    refreshDashboardTables();
}

function setupRealtimeSync() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
        if (!event || event.storageArea !== localStorage) return;
        handleExternalStateChange(event.key);
    });

    if (broadcastChannel) {
        broadcastChannel.addEventListener('message', (event) => {
            const { key, senderId } = event.data || {};
            if (!key || senderId === CLIENT_ID) return;
            handleExternalStateChange(key);
        });
    }
}

function restoreSession() {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.session));
        if (stored?.username && stored?.role && defaultUsers[stored.role]) {
            currentUser = stored.username;
            currentRole = stored.role;
            showDashboard();
            return;
        }
    } catch {
        // ignore
    }
    showLoginPage();
}

function handleLogin(event) {
    event.preventDefault();
    const username = usernameInput?.value.trim().toLowerCase();
    const password = passwordInput?.value;
    const role = roleSelect?.value;

    if (!username || !password || !role) {
        loginError.textContent = 'Lengkapi semua field login terlebih dahulu.';
        return;
    }

    const expectedUser = defaultUsers[role];
    if (!expectedUser || expectedUser.username !== username || expectedUser.password !== password) {
        loginError.textContent = 'Username, password, atau jabatan tidak sesuai.';
        return;
    }

    currentUser = username;
    currentRole = role;
    persistSession({ username, role });
    loginForm.reset();
    showDashboard();
}

function handleLogout() {
    persistSession(null);
    showLoginPage();
}

// Event bindings
loginForm?.addEventListener('submit', handleLogin);
logoutBtn?.addEventListener('click', handleLogout);

addProductionBtn?.addEventListener('click', () => {
    editingProductionId = null;
    openProductionModal('Tambah Produksi Baru');
});
productionModalClose?.addEventListener('click', () => productionModal?.classList.remove('active'));
productionCancelBtn?.addEventListener('click', () => productionModal?.classList.remove('active'));

productionForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('productionName').value.trim();
    const date = $('productionDate').value;
    const status = $('productionStatus').value;
    const notes = $('productionNotes').value;
    const nutrientType = $('productionNutrientType').value.trim();
    const nutrientAmount = parseFloat($('productionNutrientAmount').value) || 0;

    if (!name || !date || !status) {
        alert('Nama, tanggal, dan status wajib diisi.');
        return;
    }

    if (editingProductionId) {
        const idx = productionData.findIndex(item => item.id === editingProductionId);
        if (idx !== -1) {
            productionData[idx] = {
                ...productionData[idx],
                name,
                date,
                status,
                notes,
                nutrientType,
                nutrientAmount
            };
        }
    } else {
        const newId = productionData.length ? Math.max(...productionData.map(item => item.id)) + 1 : 1;
        productionData.push({
            id: newId,
            name,
            date,
            status,
            notes,
            nutrientType,
            nutrientAmount
        });
    }

    persistArray(STORAGE_KEYS.production, productionData);
    productionModal?.classList.remove('active');
    renderProductionTable(statusFilter ? statusFilter.value : 'all');
    updateStatistics();
});

productionTableBody?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    if (!action) return;
    const id = Number(target.dataset.id);
    if (action === 'edit') {
        const production = productionData.find(item => item.id === id);
        if (!production) return;
        editingProductionId = id;
        $('productionName').value = production.name;
        $('productionDate').value = production.date;
        $('productionStatus').value = production.status;
        $('productionNotes').value = production.notes || '';
        $('productionNutrientType').value = production.nutrientType || '';
        $('productionNutrientAmount').value = typeof production.nutrientAmount === 'number'
            ? production.nutrientAmount
            : '';
        const titleEl = $('modalTitle');
        if (titleEl) titleEl.textContent = 'Edit Produksi';
        productionModal?.classList.add('active');
    } else if (action === 'delete') {
        if (!confirm('Apakah Anda yakin ingin menghapus data produksi ini?')) return;
        productionData = productionData.filter(item => item.id !== id);
        persistArray(STORAGE_KEYS.production, productionData);
        renderProductionTable(statusFilter ? statusFilter.value : 'all');
        updateStatistics();
    }
});

statusFilter?.addEventListener('change', (event) => {
    renderProductionTable(event.target.value);
});

taskStatusFilter?.addEventListener('change', (event) => {
    renderTaskTable(event.target.value);
});

addTaskBtn?.addEventListener('click', () => {
    editingTaskId = null;
    taskForm?.reset();
    const titleEl = $('taskModalTitle');
    if (titleEl) titleEl.textContent = 'Tambah Tugas Baru';
    taskModal?.classList.add('active');
});

taskModalClose?.addEventListener('click', () => taskModal?.classList.remove('active'));
taskCancelBtn?.addEventListener('click', () => taskModal?.classList.remove('active'));

taskForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = $('taskTitle').value.trim();
    const assignee = $('taskAssignee').value.trim();
    const deadline = $('taskDeadline').value;
    const status = $('taskStatus').value;
    const description = $('taskDescription').value.trim();

    if (!title || !assignee || !deadline) {
        alert('Judul, penanggung jawab, dan deadline wajib diisi.');
        return;
    }

    if (editingTaskId) {
        const idx = taskData.findIndex(task => task.id === editingTaskId);
        if (idx !== -1) {
            taskData[idx] = { ...taskData[idx], title, assignee, deadline, status, description };
        }
    } else {
        const newId = taskData.length ? Math.max(...taskData.map(task => task.id)) + 1 : 1;
        taskData.push({ id: newId, title, assignee, deadline, status, description });
    }

    persistArray(STORAGE_KEYS.tasks, taskData);
    taskModal?.classList.remove('active');
    renderTaskTable(taskStatusFilter ? taskStatusFilter.value : 'all');
    updateStatistics();
});

taskTableBody?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.taskAction;
    if (!action) return;
    const id = Number(target.dataset.id);
    if (action === 'edit') {
        const task = taskData.find(item => item.id === id);
        if (!task) return;
        editingTaskId = id;
        $('taskTitle').value = task.title;
        $('taskAssignee').value = task.assignee;
        $('taskDeadline').value = task.deadline;
        $('taskStatus').value = task.status;
        $('taskDescription').value = task.description || '';
        const titleEl = $('taskModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Tugas';
        taskModal?.classList.add('active');
    } else if (action === 'delete') {
        if (!confirm('Apakah Anda yakin ingin menghapus tugas ini?')) return;
        taskData = taskData.filter(task => task.id !== id);
        persistArray(STORAGE_KEYS.tasks, taskData);
        renderTaskTable(taskStatusFilter ? taskStatusFilter.value : 'all');
        updateStatistics();
    }
});

addInventoryBtn?.addEventListener('click', () => {
    editingInventoryId = null;
    inventoryForm?.reset();
    const titleEl = $('inventoryModalTitle');
    if (titleEl) titleEl.textContent = 'Tambah Bahan Baru';
    inventoryModal?.classList.add('active');
});

inventoryModalClose?.addEventListener('click', () => inventoryModal?.classList.remove('active'));
inventoryCancelBtn?.addEventListener('click', () => inventoryModal?.classList.remove('active'));

inventoryForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = $('inventoryName').value.trim();
    const category = $('inventoryCategory').value;
    const initialStock = parseFloat($('inventoryInitialStock').value) || 0;
    const unit = $('inventoryUnit').value.trim();
    const usage = parseFloat($('inventoryUsage').value) || 0;

    if (!name || !category || !unit) {
        alert('Nama bahan, kategori, dan satuan wajib diisi.');
        return;
    }

    const payload = { name, category, initialStock, unit, usage };

    if (editingInventoryId) {
        const idx = inventoryData.findIndex(item => item.id === editingInventoryId);
        if (idx !== -1) {
            inventoryData[idx] = { ...inventoryData[idx], ...payload };
        }
    } else {
        const newId = inventoryData.length ? Math.max(...inventoryData.map(item => item.id)) + 1 : 1;
        inventoryData.push({ id: newId, ...payload });
    }

    persistArray(STORAGE_KEYS.inventory, inventoryData);
    inventoryModal?.classList.remove('active');
    renderInventoryTable(
        inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all',
        inventorySearchInput ? inventorySearchInput.value : ''
    );
    updateStatistics();
});

inventoryTableBody?.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.inventoryAction;
    if (!action) return;
    const id = Number(target.dataset.id);
    if (action === 'edit') {
        const item = inventoryData.find(entry => entry.id === id);
        if (!item) return;
        editingInventoryId = id;
        $('inventoryName').value = item.name;
        $('inventoryCategory').value = item.category;
        $('inventoryInitialStock').value = item.initialStock;
        $('inventoryUnit').value = item.unit;
        $('inventoryUsage').value = item.usage;
        const titleEl = $('inventoryModalTitle');
        if (titleEl) titleEl.textContent = 'Edit Bahan';
        inventoryModal?.classList.add('active');
    } else if (action === 'delete') {
        if (!confirm('Apakah Anda yakin ingin menghapus bahan ini?')) return;
        inventoryData = inventoryData.filter(entry => entry.id !== id);
        persistArray(STORAGE_KEYS.inventory, inventoryData);
        renderInventoryTable(
            inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all',
            inventorySearchInput ? inventorySearchInput.value : ''
        );
        updateStatistics();
    }
});

inventoryCategoryFilter?.addEventListener('change', (event) => {
    renderInventoryTable(event.target.value, inventorySearchInput ? inventorySearchInput.value : '');
});

inventorySearchInput?.addEventListener('input', (event) => {
    renderInventoryTable(
        inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all',
        event.target.value
    );
});

// Initialize
seedData();
restoreSession();
setupRealtimeSync();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js').catch((error) => {
            console.error('Registrasi service worker gagal:', error);
        });
    });
}

