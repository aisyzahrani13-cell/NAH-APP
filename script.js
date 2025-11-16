// Application State
let currentUser = null;
let currentRole = null;
let productionData = [];
let taskData = [];
let inventoryData = [];
let editingId = null;
let editingTaskId = null;
let editingInventoryId = null;
let updatingUsageId = null;

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

// Production Statuses
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

// Function to safely parse JSON or fallback array
function getParsedArrayLS(key) {
    let data;
    try {
        data = JSON.parse(localStorage.getItem(key));
        if (!Array.isArray(data)) data = [];
    } catch {
        data = [];
    }
    return data;
}

// Initialize state from localStorage or empty array if not found
productionData = getParsedArrayLS('productionData');
taskData = getParsedArrayLS('taskData');
inventoryData = getParsedArrayLS('inventoryData');

// Initialize sample data if empty for production
if (productionData.length === 0) {
    productionData = [
        {
            id: 1,
            name: 'Selada Hidroponik Batch 1',
            date: '2024-01-15',
            status: 'semai',
            notes: 'Produksi selada dalam sistem NFT'
        },
        {
            id: 2,
            name: 'Bayam Hidroponik Batch 1',
            date: '2024-01-20',
            status: 'pembibitan',
            notes: 'Proses pembibitan dalam media rockwool'
        },
        {
            id: 3,
            name: 'Kangkung Hidroponik Batch 1',
            date: '2024-01-10',
            status: 'panen',
            notes: 'Siap dipanen minggu depan'
        },
        {
            id: 4,
            name: 'Pakcoy Hidroponik Batch 1',
            date: '2024-01-25',
            status: 'sukses',
            notes: 'Produksi berhasil dengan hasil panen optimal'
        },
        {
            id: 5,
            name: 'Sawi Hidroponik Batch 1',
            date: '2024-02-01',
            status: 'gagal',
            notes: 'Gagal karena masalah nutrisi'
        }
    ];
    localStorage.setItem('productionData', JSON.stringify(productionData));
}

// Initialize sample task data if empty
if (taskData.length === 0) {
    taskData = [
        {
            id: 1,
            title: 'Pemeliharaan sistem NFT',
            assignee: 'Staff A',
            deadline: '2024-02-15',
            status: 'belum',
            description: 'Melakukan pengecekan dan pemeliharaan sistem NFT untuk batch selada'
        },
        {
            id: 2,
            title: 'Penambahan nutrisi hidroponik',
            assignee: 'Operator B',
            deadline: '2024-02-10',
            status: 'sedang',
            description: 'Menambahkan dan mengatur nutrisi untuk tanaman dalam fase pembesaran'
        },
        {
            id: 3,
            title: 'Pemanenan selada batch 1',
            assignee: 'Staff C',
            deadline: '2024-02-05',
            status: 'selesai',
            description: 'Pemanenan selada hidroponik batch pertama telah selesai dilakukan'
        },
        {
            id: 4,
            title: 'Pemindahan bibit ke sistem NFT',
            assignee: 'Operator A',
            deadline: '2024-02-20',
            status: 'belum',
            description: 'Memindahkan bibit dari media rockwool ke sistem NFT'
        },
        {
            id: 5,
            title: 'Pencatatan data pertumbuhan',
            assignee: 'Staff B',
            deadline: '2024-02-12',
            status: 'sedang',
            description: 'Mencatat data pertumbuhan tanaman setiap hari'
        }
    ];
    localStorage.setItem('taskData', JSON.stringify(taskData));
}

// Initialize sample inventory data if empty
if (inventoryData.length === 0) {
    inventoryData = [
        {
            id: 1,
            name: 'Nutrisi AB Mix Premium',
            category: 'nutrisi',
            initialStock: 50,
            usage: 12.5,
            unit: 'liter',
            minStock: 10
        },
        {
            id: 2,
            name: 'Benih Selada',
            category: 'benih',
            initialStock: 100,
            usage: 35,
            unit: 'pcs',
            minStock: 20
        },
        {
            id: 3,
            name: 'Sponge',
            category: 'media',
            initialStock: 200,
            usage: 80,
            unit: 'sheet',
            minStock: 50
        },
        {
            id: 4,
            name: 'Nutrisi AB Mix Standar',
            category: 'nutrisi',
            initialStock: 30,
            usage: 25,
            unit: 'liter',
            minStock: 5
        },
        {
            id: 5,
            name: 'Benih Bayam',
            category: 'benih',
            initialStock: 75,
            usage: 20,
            unit: 'pack',
            minStock: 15
        },
        {
            id: 6,
            name: 'Cocopeat',
            category: 'media',
            initialStock: 150,
            usage: 95,
            unit: 'kg',
            minStock: 30
        }
    ];
    localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
}

// DOM Elements (safe DOM lookup)
function $(id) { return document.getElementById(id); }
const loginPage = $('loginPage');
const dashboardPage = $('dashboardPage');
const loginForm = $('loginForm');
const loginError = $('loginError');
const logoutBtn = $('logoutBtn');
const currentUserSpan = $('currentUser');
const currentRoleBadge = $('currentRole');
const addProductionBtn = $('addProductionBtn');
const productionTableBody = $('productionTableBody');
const productionModal = $('productionModal');
const productionForm = $('productionForm');
const cancelBtn = $('cancelBtn');
const closeModal = document.querySelector('.close');
const statusFilter = $('statusFilter');
const actionHeader = $('actionHeader');
const totalProduksi = $('totalProduksi');
const totalSukses = $('totalSukses');
const totalGagal = $('totalGagal');
const totalBerlangsung = $('totalBerlangsung');
const addTaskBtn = $('addTaskBtn');
const taskTableBody = $('taskTableBody');
const taskModal = $('taskModal');
const taskForm = $('taskForm');
const cancelTaskBtn = $('cancelTaskBtn');
const closeTaskModal = document.querySelector('.close-task');
const taskStatusFilter = $('taskStatusFilter');
const taskActionHeader = $('taskActionHeader');
const totalTaskBelum = $('totalTaskBelum');
const totalTaskSedang = $('totalTaskSedang');
const totalTaskSelesai = $('totalTaskSelesai');
const addInventoryBtn = $('addInventoryBtn');
const inventoryTableBody = $('inventoryTableBody');
const inventoryModal = $('inventoryModal');
const inventoryForm = $('inventoryForm');
const cancelInventoryBtn = $('cancelInventoryBtn');
const closeInventoryModal = document.querySelector('.close-inventory');
const inventoryCategoryFilter = $('inventoryCategoryFilter');
const inventorySearch = $('inventorySearch');
const inventoryActionHeader = $('inventoryActionHeader');
const totalBahan = $('totalBahan');
const stokRendah = $('stokRendah');
const stokCukup = $('stokCukup');
const updateUsageModal = $('updateUsageModal');
const updateUsageForm = $('updateUsageForm');
const cancelUsageBtn = $('cancelUsageBtn');
const closeUsageModal = document.querySelector('.close-usage');

// Check if user is already logged in
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentRole');
    if (savedUser && savedRole && defaultUsers[savedRole]) {
        currentUser = savedUser;
        currentRole = savedRole;
        showDashboard();
    } else {
        showLogin();
    }
}

// Login Handler
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = $('username').value.trim();
        const password = $('password').value.trim();
        const role = $('role').value;

        const user = defaultUsers[role];
        if (user && username === user.username && password === user.password) {
            currentUser = username;
            currentRole = role;
            localStorage.setItem('currentUser', username);
            localStorage.setItem('currentRole', role);
            loginError.classList.remove('show');
            showDashboard();
        } else {
            loginError.textContent = 'Username, password, atau jabatan tidak valid!';
            loginError.classList.add('show');
        }
    });
}

// Logout Handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        currentRole = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        showLogin();
    });
}

// Show Login Page
function showLogin() {
    if (loginPage) loginPage.classList.add('active');
    if (dashboardPage) dashboardPage.classList.remove('active');
    if (loginForm) loginForm.reset();
    if (loginError) loginError.classList.remove('show');
}

// Show Dashboard
function showDashboard() {
    if (loginPage) loginPage.classList.remove('active');
    if (dashboardPage) dashboardPage.classList.add('active');
    if (currentUserSpan) currentUserSpan.textContent = `Pengguna: ${currentUser}`;
    if (currentRoleBadge) {
        currentRoleBadge.textContent = currentRole;
        currentRoleBadge.className = `badge ${currentRole}`;
    }
    updateUIByRole();
    updateStatistics();
    renderProductionTable();
    updateTaskStatistics();
    renderTaskTable();
    updateInventoryStatistics();
    renderInventoryTable();
}

// Update UI based on role permissions
function updateUIByRole() {
    const permissions = rolePermissions[currentRole] || {};
    if (addProductionBtn) addProductionBtn.style.display = permissions.canAdd ? 'block' : 'none';
    if (addTaskBtn) addTaskBtn.style.display = permissions.canAdd ? 'block' : 'none';
    if (addInventoryBtn) addInventoryBtn.style.display = permissions.canAdd ? 'block' : 'none';
    if (actionHeader) actionHeader.style.display = (permissions.canEdit || permissions.canDelete) ? 'table-cell' : 'none';
    if (taskActionHeader) taskActionHeader.style.display = (permissions.canEdit || permissions.canDelete) ? 'table-cell' : 'none';
    if (inventoryActionHeader) inventoryActionHeader.style.display = (permissions.canEdit || permissions.canDelete) ? 'table-cell' : 'none';
}

// Update Statistics
function updateStatistics() {
    const total = productionData.length;
    const sukses = productionData.filter(p => p.status === 'sukses').length;
    const gagal = productionData.filter(p => p.status === 'gagal').length;
    const berlangsung = productionData.filter(p =>
        !['sukses', 'gagal'].includes(p.status)
    ).length;

    if (totalProduksi) totalProduksi.textContent = total;
    if (totalSukses) totalSukses.textContent = sukses;
    if (totalGagal) totalGagal.textContent = gagal;
    if (totalBerlangsung) totalBerlangsung.textContent = berlangsung;
}

// Date Formatter with safety
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Render Production Table
function renderProductionTable(filterStatus = 'all') {
    if (!productionTableBody) return;
    productionTableBody.innerHTML = '';
    const permissions = rolePermissions[currentRole] || {};

    let filteredData = productionData;
    if (filterStatus !== 'all') {
        filteredData = productionData.filter(p => p.status === filterStatus);
    }

    if (filteredData.length === 0) {
        productionTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-light);">
                    Tidak ada data produksi
                </td>
            </tr>
        `;
        return;
    }

    filteredData.forEach(production => {
        const row = document.createElement('tr');
        const statusClass = production.status || '';
        const statusText = productionStatuses[production.status] || production.status;
        row.innerHTML = `
            <td>${production.id}</td>
            <td>${production.name}</td>
            <td>${formatDate(production.date)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${production.notes || '-'}</td>
            ${(permissions.canEdit || permissions.canDelete) ? `
                <td>
                    <div class="action-buttons">
                        ${permissions.canEdit ? `<button class="btn btn-warning" onclick="editProduction(${production.id})">Edit</button>` : ''}
                        ${permissions.canDelete ? `<button class="btn btn-danger" onclick="deleteProduction(${production.id})">Hapus</button>` : ''}
                    </div>
                </td>
            ` : ''}
        `;
        productionTableBody.appendChild(row);
    });
}

if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
        renderProductionTable(e.target.value);
    });
}

// Add Production Button Handler
if (addProductionBtn) {
    addProductionBtn.addEventListener('click', () => {
        editingId = null;
        if (productionForm) productionForm.reset();
        if ($('productionDate')) $('productionDate').valueAsDate = new Date();
        if ($('modalTitle')) $('modalTitle').textContent = 'Tambah Produksi Baru';
        if (productionModal) productionModal.classList.add('active');
    });
}

// Close Production Modal Handlers
if (closeModal) {
    closeModal.addEventListener('click', () => {
        if (productionModal) productionModal.classList.remove('active');
    });
}
if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        if (productionModal) productionModal.classList.remove('active');
    });
}
// Modal Overlay outside click close
window.addEventListener('click', (e) => {
    if (e.target === productionModal) {
        productionModal.classList.remove('active');
    }
});

// Production Form Handler
if (productionForm) {
    productionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('productionName').value.trim();
        const date = $('productionDate').value;
        const status = $('productionStatus').value;
        const notes = $('productionNotes').value;

        if (!name || !date || !status) {
            alert('Nama, tanggal, dan status produksi wajib diisi.');
            return;
        }

        if (editingId) {
            // Update existing production
            const index = productionData.findIndex(p => p.id === editingId);
            if (index !== -1) {
                productionData[index] = {
                    ...productionData[index],
                    name,
                    date,
                    status,
                    notes
                };
            }
        } else {
            // Add new production
            const newId = productionData.length > 0
                ? Math.max(...productionData.map(p => p.id)) + 1
                : 1;
            productionData.push({
                id: newId,
                name,
                date,
                status,
                notes
            });
        }
        localStorage.setItem('productionData', JSON.stringify(productionData));
        updateStatistics();
        renderProductionTable(statusFilter ? statusFilter.value : 'all');
        if (productionModal) productionModal.classList.remove('active');
        if (productionForm) productionForm.reset();
    });
}

// Edit Production
window.editProduction = function(id) {
    const production = productionData.find(p => p.id === id);
    if (production) {
        editingId = id;
        if ($('productionName')) $('productionName').value = production.name;
        if ($('productionDate')) $('productionDate').value = production.date;
        if ($('productionStatus')) $('productionStatus').value = production.status;
        if ($('productionNotes')) $('productionNotes').value = production.notes || '';
        if ($('modalTitle')) $('modalTitle').textContent = 'Edit Produksi';
        if (productionModal) productionModal.classList.add('active');
    }
};

// Delete Production
window.deleteProduction = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus data produksi ini?')) {
        productionData = productionData.filter(p => p.id !== id);
        localStorage.setItem('productionData', JSON.stringify(productionData));
        updateStatistics();
        renderProductionTable(statusFilter ? statusFilter.value : 'all');
    }
};

// Task Status Labels
const taskStatusLabels = {
    belum: 'Belum Dikerjakan',
    sedang: 'Sedang Dikerjakan',
    selesai: 'Selesai Dikerjakan'
};

// Update Task Statistics
function updateTaskStatistics() {
    const belum = taskData.filter(t => t.status === 'belum').length;
    const sedang = taskData.filter(t => t.status === 'sedang').length;
    const selesai = taskData.filter(t => t.status === 'selesai').length;

    if (totalTaskBelum) totalTaskBelum.textContent = belum;
    if (totalTaskSedang) totalTaskSedang.textContent = sedang;
    if (totalTaskSelesai) totalTaskSelesai.textContent = selesai;
}

// Render Task Table
function renderTaskTable(filterStatus = 'all') {
    if (!taskTableBody) return;
    taskTableBody.innerHTML = '';
    const permissions = rolePermissions[currentRole] || {};

    let filteredTasks = taskData;
    if (filterStatus !== 'all') {
        filteredTasks = taskData.filter(t => t.status === filterStatus);
    }

    // Sort tasks: belum -> sedang -> selesai
    filteredTasks.sort((a, b) => {
        const statusOrder = { belum: 1, sedang: 2, selesai: 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    if (filteredTasks.length === 0) {
        taskTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-light);">
                    Tidak ada data tugas
                </td>
            </tr>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const row = document.createElement('tr');
        const statusClass = task.status;
        const statusText = taskStatusLabels[task.status] || task.status;
        const deadlineDate = new Date(task.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);

        const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        let deadlineClass = '';
        let deadlineText = formatDate(task.deadline);

        if (daysUntilDeadline < 0) {
            deadlineClass = 'deadline-passed';
            deadlineText += ' (Terlewat)';
        } else if (daysUntilDeadline <= 2) {
            deadlineClass = 'deadline-soon';
            deadlineText += ` (${daysUntilDeadline} hari lagi)`;
        }

        row.innerHTML = `
            <td>${task.id}</td>
            <td>${task.title}</td>
            <td>${task.assignee}</td>
            <td class="${deadlineClass}">${deadlineText}</td>
            <td><span class="task-status-badge ${statusClass}">${statusText}</span></td>
            <td>${task.description || '-'}</td>
            ${(permissions.canEdit || permissions.canDelete) ? `
                <td>
                    <div class="action-buttons">
                        ${permissions.canEdit ? `<button class="btn btn-warning" onclick="editTask(${task.id})">Edit</button>` : ''}
                        ${permissions.canDelete ? `<button class="btn btn-danger" onclick="deleteTask(${task.id})">Hapus</button>` : ''}
                    </div>
                </td>
            ` : ''}
        `;
        taskTableBody.appendChild(row);
    });
}

// Task Status Filter Handler
if (taskStatusFilter) {
    taskStatusFilter.addEventListener('change', (e) => {
        renderTaskTable(e.target.value);
    });
}

// Add Task Button Handler
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        editingTaskId = null;
        if (taskForm) taskForm.reset();
        if ($('taskDeadline')) $('taskDeadline').valueAsDate = new Date();
        if ($('taskModalTitle')) $('taskModalTitle').textContent = 'Tambah Tugas Baru';
        if (taskModal) taskModal.classList.add('active');
    });
}

// Close Task Modal Handlers
if (closeTaskModal) {
    closeTaskModal.addEventListener('click', () => {
        if (taskModal) taskModal.classList.remove('active');
    });
}
if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', () => {
        if (taskModal) taskModal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        taskModal.classList.remove('active');
    }
});

// Task Form Handler
if (taskForm) {
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = $('taskTitle').value.trim();
        const assignee = $('taskAssignee').value.trim();
        const deadline = $('taskDeadline').value;
        const status = $('taskStatus').value;
        const description = $('taskDescription').value;

        if (!title || !assignee || !deadline || !status) {
            alert('Judul, penanggung jawab, deadline, dan status tugas wajib diisi.');
            return;
        }

        if (editingTaskId) {
            const index = taskData.findIndex(t => t.id === editingTaskId);
            if (index !== -1) {
                taskData[index] = {
                    ...taskData[index],
                    title,
                    assignee,
                    deadline,
                    status,
                    description
                };
            }
        } else {
            const newId = taskData.length > 0
                ? Math.max(...taskData.map(t => t.id)) + 1
                : 1;
            taskData.push({
                id: newId,
                title,
                assignee,
                deadline,
                status,
                description
            });
        }

        localStorage.setItem('taskData', JSON.stringify(taskData));
        updateTaskStatistics();
        renderTaskTable(taskStatusFilter ? taskStatusFilter.value : 'all');
        if (taskModal) taskModal.classList.remove('active');
        if (taskForm) taskForm.reset();
    });
}

// Edit Task
window.editTask = function(id) {
    const task = taskData.find(t => t.id === id);
    if (task) {
        editingTaskId = id;
        if ($('taskTitle')) $('taskTitle').value = task.title;
        if ($('taskAssignee')) $('taskAssignee').value = task.assignee;
        if ($('taskDeadline')) $('taskDeadline').value = task.deadline;
        if ($('taskStatus')) $('taskStatus').value = task.status;
        if ($('taskDescription')) $('taskDescription').value = task.description || '';
        if ($('taskModalTitle')) $('taskModalTitle').textContent = 'Edit Tugas';
        if (taskModal) taskModal.classList.add('active');
    }
};

// Delete Task
window.deleteTask = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
        taskData = taskData.filter(t => t.id !== id);
        localStorage.setItem('taskData', JSON.stringify(taskData));
        updateTaskStatistics();
        renderTaskTable(taskStatusFilter ? taskStatusFilter.value : 'all');
    }
};

// Inventory Category Labels
const inventoryCategoryLabels = {
    nutrisi: 'Nutrisi AB Mix',
    benih: 'Benih',
    media: 'Media Tanam'
};

// Calculate Remaining Stock
function calculateRemainingStock(item) {
    if (!item || typeof item.initialStock !== 'number' || typeof item.usage !== 'number') return 0;
    return Math.max(0, item.initialStock - item.usage);
}

// Get Stock Status
function getStockStatus(item) {
    const remaining = calculateRemainingStock(item);
    if (remaining === 0) {
        return { status: 'habis', label: 'Habis' };
    } else if (remaining <= item.minStock) {
        return { status: 'rendah', label: 'Stok Rendah' };
    } else {
        return { status: 'cukup', label: 'Stok Cukup' };
    }
}

// Update Inventory Statistics
function updateInventoryStatistics() {
    const total = inventoryData.length;
    let rendah = 0;
    let cukup = 0;

    inventoryData.forEach(item => {
        const stockStatus = getStockStatus(item);
        if (stockStatus.status === 'rendah' || stockStatus.status === 'habis') {
            rendah++;
        } else {
            cukup++;
        }
    });

    if (totalBahan) totalBahan.textContent = total;
    if (stokRendah) stokRendah.textContent = rendah;
    if (stokCukup) stokCukup.textContent = cukup;
}

// Render Inventory Table
function renderInventoryTable(categoryFilter = 'all', searchTerm = '') {
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = '';
    const permissions = rolePermissions[currentRole] || {};

    let filteredInventory = [...inventoryData];

    // Filter by category
    if (categoryFilter !== 'all') {
        filteredInventory = filteredInventory.filter(item => item.category === categoryFilter);
    }
    // Filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        filteredInventory = filteredInventory.filter(item =>
            item.name && item.name.toLowerCase().includes(searchLower)
        );
    }

    if (filteredInventory.length === 0) {
        inventoryTableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 30px; color: var(--text-light);">
                    Tidak ada data inventaris
                </td>
            </tr>
        `;
        return;
    }

    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        const remainingStock = calculateRemainingStock(item);
        const stockStatus = getStockStatus(item);
        const categoryLabel = inventoryCategoryLabels[item.category] || item.category;

        // Fallback for .toFixed in case data is not number
        const initialStockText = (typeof item.initialStock === 'number' ? item.initialStock.toFixed(2) : item.initialStock) + ' ' + (item.unit || '');
        const usageText = (typeof item.usage === 'number' ? item.usage.toFixed(2) : item.usage) + ' ' + (item.unit || '');
        const remainingStockText = (typeof remainingStock === 'number' ? remainingStock.toFixed(2) : remainingStock) + ' ' + (item.unit || '');

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td><span class="inventory-category-badge ${item.category}">${categoryLabel}</span></td>
            <td>${initialStockText}</td>
            <td>${usageText}</td>
            <td><strong>${remainingStockText}</strong></td>
            <td>${item.unit}</td>
            <td><span class="stock-status-badge ${stockStatus.status}">${stockStatus.label}</span></td>
            ${(permissions.canEdit || permissions.canDelete) ? `
                <td>
                    <div class="action-buttons">
                        ${permissions.canEdit ? `
                            <button class="btn btn-warning" onclick="editInventory(${item.id})" style="margin-bottom: 5px;">Edit</button>
                            <button class="btn btn-success" onclick="updateUsage(${item.id})" style="margin-bottom: 5px;">Update Pemakaian</button>
                        ` : ''}
                        ${permissions.canDelete ? `
                            <button class="btn btn-danger" onclick="deleteInventory(${item.id})">Hapus</button>
                        ` : ''}
                    </div>
                </td>
            ` : ''}
        `;
        inventoryTableBody.appendChild(row);
    });
}

// Inventory Category Filter Handler
if (inventoryCategoryFilter) {
    inventoryCategoryFilter.addEventListener('change', (e) => {
        renderInventoryTable(e.target.value, inventorySearch ? inventorySearch.value : '');
    });
}

// Inventory Search Handler
if (inventorySearch) {
    inventorySearch.addEventListener('input', (e) => {
        renderInventoryTable(inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all', e.target.value);
    });
}

// Add Inventory Button Handler
if (addInventoryBtn) {
    addInventoryBtn.addEventListener('click', () => {
        editingInventoryId = null;
        if (inventoryForm) inventoryForm.reset();
        if ($('inventoryUsage')) $('inventoryUsage').value = 0;
        if ($('inventoryMinStock')) $('inventoryMinStock').value = 0;
        if ($('inventoryModalTitle')) $('inventoryModalTitle').textContent = 'Tambah Bahan Baru';
        if (inventoryModal) inventoryModal.classList.add('active');
    });
}

// Close Inventory Modal Handlers
if (closeInventoryModal) {
    closeInventoryModal.addEventListener('click', () => {
        if (inventoryModal) inventoryModal.classList.remove('active');
    });
}

if (cancelInventoryBtn) {
    cancelInventoryBtn.addEventListener('click', () => {
        if (inventoryModal) inventoryModal.classList.remove('active');
    });
}

window.addEventListener('click', (e) => {
    if (e.target === inventoryModal) {
        inventoryModal.classList.remove('active');
    }
});

// Inventory Form Handler
if (inventoryForm) {
    inventoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('inventoryName').value.trim();
        const category = $('inventoryCategory').value;
        const initialStock = parseFloat($('inventoryInitialStock').value);
        const unit = $('inventoryUnit').value;
        const usage = parseFloat($('inventoryUsage').value) || 0;
        const minStock = parseFloat($('inventoryMinStock').value) || 0;

        if (!name || !category || isNaN(initialStock) || !unit) {
            alert('Nama bahan, kategori, stok awal, dan satuan wajib diisi.');
            return;
        }

        if (editingInventoryId) {
            // Update existing inventory
            const index = inventoryData.findIndex(item => item.id === editingInventoryId);
            if (index !== -1) {
                inventoryData[index] = {
                    ...inventoryData[index],
                    name,
                    category,
                    initialStock,
                    unit,
                    usage,
                    minStock
                };
            }
        } else {
            // Add new inventory
            const newId = inventoryData.length > 0
                ? Math.max(...inventoryData.map(item => item.id)) + 1
                : 1;
            inventoryData.push({
                id: newId,
                name,
                category,
                initialStock,
                unit,
                usage,
                minStock
            });
        }

        localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
        updateInventoryStatistics();
        renderInventoryTable(inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all', inventorySearch ? inventorySearch.value : '');
        if (inventoryModal) inventoryModal.classList.remove('active');
        if (inventoryForm) inventoryForm.reset();
    });
}

// Edit Inventory
window.editInventory = function(id) {
    const item = inventoryData.find(i => i.id === id);
    if (item) {
        editingInventoryId = id;
        if ($('inventoryName')) $('inventoryName').value = item.name;
        if ($('inventoryCategory')) $('inventoryCategory').value = item.category;
        if ($('inventoryInitialStock')) $('inventoryInitialStock').value = item.initialStock;
        if ($('inventoryUnit')) $('inventoryUnit').value = item.unit;
        if ($('inventoryUsage')) $('inventoryUsage').value = item.usage;
        if ($('inventoryMinStock')) $('inventoryMinStock').value = item.minStock;
        if ($('inventoryModalTitle')) $('inventoryModalTitle').textContent = 'Edit Bahan';
        if (inventoryModal) inventoryModal.classList.add('active');
    }
};

// Delete Inventory
window.deleteInventory = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus bahan ini?')) {
        inventoryData = inventoryData.filter(item => item.id !== id);
        localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
        updateInventoryStatistics();
        renderInventoryTable(inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all', inventorySearch ? inventorySearch.value : '');
    }
};

// Update Usage
window.updateUsage = function(id) {
    const item = inventoryData.find(i => i.id === id);
    if (item) {
        updatingUsageId = id;
        const remainingStock = calculateRemainingStock(item);
        if ($('updateUsageName')) $('updateUsageName').value = item.name;
        if ($('updateUsageCurrentStock')) $('updateUsageCurrentStock').value = `${remainingStock.toFixed(2)} ${item.unit}`;
        if ($('updateUsageAmount')) $('updateUsageAmount').value = '';
        if (updateUsageModal) updateUsageModal.classList.add('active');
    }
};

// Close Usage Modal Handlers
if (closeUsageModal) {
    closeUsageModal.addEventListener('click', () => {
        if (updateUsageModal) updateUsageModal.classList.remove('active');
    });
}
if (cancelUsageBtn) {
    cancelUsageBtn.addEventListener('click', () => {
        if (updateUsageModal) updateUsageModal.classList.remove('active');
    });
}
window.addEventListener('click', (e) => {
    if (e.target === updateUsageModal) {
        updateUsageModal.classList.remove('active');
    }
});

// Update Usage Form Handler
if (updateUsageForm) {
    updateUsageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usageAmount = parseFloat($('updateUsageAmount').value);

        if (isNaN(usageAmount) || usageAmount < 0) {
            alert('Jumlah pemakaian tidak boleh negatif!');
            return;
        }

        const index = inventoryData.findIndex(item => item.id === updatingUsageId);
        if (index !== -1) {
            const item = inventoryData[index];
            const newUsage = item.usage + usageAmount;
            const remainingStock = item.initialStock - newUsage;

            if (remainingStock < 0) {
                alert(`Pemakaian melebihi stok awal! Stok tersisa tidak boleh negatif.\nStok awal: ${item.initialStock.toFixed(2)} ${item.unit}\nPemakaian saat ini: ${item.usage.toFixed(2)} ${item.unit}`);
                return;
            }

            inventoryData[index] = {
                ...item,
                usage: newUsage
            };

            localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
            updateInventoryStatistics();
            renderInventoryTable(inventoryCategoryFilter ? inventoryCategoryFilter.value : 'all', inventorySearch ? inventorySearch.value : '');
            if (updateUsageModal) updateUsageModal.classList.remove('active');
            if (updateUsageForm) updateUsageForm.reset();
        }
    });
}

// Initialize App
checkAuth();
