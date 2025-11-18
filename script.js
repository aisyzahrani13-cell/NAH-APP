// Application State
let currentUser = null;
let currentRole = null;
let productionData = [];␊
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

function normalizeProductionData(data) {
    let shouldPersist = false;
    const normalized = data.map(item => {
        const updatedItem = { ...item };
        if (!('nutrientType' in updatedItem)) {
            updatedItem.nutrientType = '';
            shouldPersist = true;
        }
        if (!('nutrientAmount' in updatedItem)) {
            updatedItem.nutrientAmount = 0;
            shouldPersist = true;
        }
        return updatedItem;
    });

    if (shouldPersist) {
        localStorage.setItem('productionData', JSON.stringify(normalized));
    }

    return normalized;
}

// Initialize sample data if empty for production
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
    localStorage.setItem('productionData', JSON.stringify(productionData));
}

productionData = normalizeProductionData(productionData);

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
@@ -366,179 +400,199 @@ function updateStatistics() {
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
 const baseColumnCount = 7; // ID, Nama, Tanggal, Status, Catatan, Nutrisi Jenis, Nutrisi Jumlah
 const totalColumns = (permissions.canEdit || permissions.canDelete) ? baseColumnCount + 1 : baseColumnCount;

 if (filteredData.length === 0) {
        productionTableBody.innerHTML = `
            <tr>
                <td colspan="${totalColumns}" style="text-align: center; padding: 30px; color: var(--text-light);">
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
        const nutrientTypeText = production.nutrientType && production.nutrientType.trim() !== ''
            ? production.nutrientType
            : '-';
        const nutrientAmountText = typeof production.nutrientAmount === 'number'
            ? `${production.nutrientAmount.toFixed(2)} liter`
            : (production.nutrientAmount || '-');
        row.innerHTML = `
            <td>${production.id}</td>
            <td>${production.name}</td>
            <td>${formatDate(production.date)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${production.notes || '-'}</td>
            <td>${nutrientTypeText}</td>
            <td>${nutrientAmountText}</td>
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
        const nutrientType = $('productionNutrientType').value.trim();
        const nutrientAmount = parseFloat($('productionNutrientAmount').value) || 0;

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
                    notes,
                    nutrientType,
                    nutrientAmount
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
                notes,
                nutrientType,
                nutrientAmount
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
        if ($('productionNutrientType')) $('productionNutrientType').value = production.nutrientType || '';
        if ($('productionNutrientAmount')) $('productionNutrientAmount').value =
            (typeof production.nutrientAmount === 'number' ? production.nutrientAmount : '');
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

