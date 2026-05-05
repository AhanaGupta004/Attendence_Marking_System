// LocalStorage Keys
const KEYS = {
    STUDENTS: 'attendance_students',
    LAST_ROLL_NO: 'attendance_last_roll_no',
    ATTENDANCE: 'attendance_records'
};

const NUM_SUBJECTS = 6;
const ADMIN_PASS = 'admin123';

// App State
const appState = {
    students: [],
    lastRollNo: 0,
    attendance: []
};

let modalAction = null;

// Application Initialization
function init() {
    loadData();
    setDefaultDate();
    app.showHome();
}

function loadData() {
    const studentsRaw = localStorage.getItem(KEYS.STUDENTS);
    const lastRollNoRaw = localStorage.getItem(KEYS.LAST_ROLL_NO);
    const attendanceRaw = localStorage.getItem(KEYS.ATTENDANCE);

    if (studentsRaw) appState.students = JSON.parse(studentsRaw);
    if (lastRollNoRaw) appState.lastRollNo = parseInt(lastRollNoRaw, 10);
    if (attendanceRaw) appState.attendance = JSON.parse(attendanceRaw);
    
    updateStudentSelects();
    renderStudentTable();
}

function saveData() {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(appState.students));
    localStorage.setItem(KEYS.LAST_ROLL_NO, appState.lastRollNo.toString());
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(appState.attendance));
    
    updateStudentSelects();
    renderStudentTable();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    
    const markDate = document.getElementById('mark-date');
    const checkDate = document.getElementById('check-date');
    const studentCheckDate = document.getElementById('student-check-date');
    
    markDate.value = today;
    checkDate.value = today;
    studentCheckDate.value = today;
    
    // Prevent future dates
    markDate.max = today;
    checkDate.max = today;
    studentCheckDate.max = today;
}

// Toast Utility
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
    
    setTimeout(() => {
        toast.className = 'toast hidden';
    }, 3000);
}

// Application Methods Namespace
const app = {
    // --- Navigation & Views ---
    showHome: () => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
        document.getElementById('admin-password').value = '';
    },
    
    showAdminLogin: () => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-admin-login').classList.add('active');
        document.getElementById('admin-password').focus();
    },
    
    showStudentPanel: () => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-student-dashboard').classList.add('active');
    },

    // --- Admin Logic ---
    handleAdminLogin: (e) => {
        e.preventDefault();
        const pass = document.getElementById('admin-password').value;
        if (pass === ADMIN_PASS) {
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-admin-dashboard').classList.add('active');
            app.switchAdminTab('mark');
            showToast('Login successful!');
        } else {
            showToast('Wrong password. Try again.', 'error');
            document.getElementById('admin-password').value = '';
        }
    },
    
    logoutAdmin: () => {
        app.showHome();
        showToast('Logged out successfully.');
    },
    
    switchAdminTab: (tabId) => {
        // Handle buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        if(typeof event !== 'undefined' && event && event.target && event.target.classList) {
            event.target.classList.add('active');
        } else {
            const btn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
            if(btn) btn.classList.add('active');
        }
        
        // Handle content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`tab-${tabId}`).classList.add('active');
    },

    // --- Modal Logic ---
    showModal: (title, desc, onConfirm) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-desc').textContent = desc;
        modalAction = onConfirm;
        document.getElementById('modal-confirm-btn').onclick = () => {
            if(modalAction) modalAction();
            app.closeModal();
        };
        document.getElementById('modal-confirm').classList.remove('hidden');
    },
    
    closeModal: () => {
        document.getElementById('modal-confirm').classList.add('hidden');
        modalAction = null;
    },

    // --- Backup & Restore Logic ---
    exportData: () => {
        const dataStr = JSON.stringify(appState, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Data exported successfully!');
    },

    handleFileSelect: (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('btn-import-select').textContent = file.name;
            document.getElementById('btn-import-confirm').classList.remove('hidden');
        }
    },

    importData: () => {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedState = JSON.parse(e.target.result);
                if (importedState.students && typeof importedState.lastRollNo !== 'undefined' && importedState.attendance) {
                    app.showModal('Confirm Import', 'This will overwrite all current data. Proceed?', () => {
                        appState.students = importedState.students;
                        appState.lastRollNo = importedState.lastRollNo;
                        appState.attendance = importedState.attendance;
                        saveData();
                        showToast('Data imported successfully!');
                        // reset UI
                        document.getElementById('btn-import-select').textContent = 'Select JSON File';
                        document.getElementById('btn-import-confirm').classList.add('hidden');
                        fileInput.value = '';
                    });
                } else {
                    showToast('Invalid backup file format.', 'error');
                }
            } catch (err) {
                showToast('Error parsing JSON backup file.', 'error');
            }
        };
        reader.readAsText(file);
    },

    // --- Student Management ---
    addStudent: (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('new-student-name');
        const name = nameInput.value.trim();
        
        if (!name) return;
        
        appState.lastRollNo += 1;
        const newStudent = { name, rollNo: appState.lastRollNo };
        appState.students.push(newStudent);
        
        saveData();
        showToast(`Student added: ${name} (Roll No: ${appState.lastRollNo})`);
        nameInput.value = '';
    },
    
    deleteStudent: (e) => {
        e.preventDefault();
        const idInput = document.getElementById('delete-student-id');
        const rollNo = parseInt(idInput.value, 10);
        
        const student = appState.students.find(s => s.rollNo === rollNo);
        if(!student) {
            showToast('Student not found.', 'error');
            return;
        }

        app.showModal('Delete Student', `Are you sure you want to delete ${student.name} (Roll: ${rollNo})? All their attendance records will be permanently deleted.`, () => {
            appState.students = appState.students.filter(s => s.rollNo !== rollNo);
            appState.attendance = appState.attendance.filter(a => a.rollNo !== rollNo);
            saveData();
            showToast(`Student ${rollNo} deleted successfully.`);
            idInput.value = '';
        });
    },

    // --- Attendance Management ---
    markAttendance: (e) => {
        e.preventDefault();
        const studentSelect = document.getElementById('mark-student');
        if (!studentSelect.value) {
            showToast('Please select a student', 'error');
            return;
        }
        
        const rollNo = parseInt(studentSelect.value, 10);
        const date = document.getElementById('mark-date').value;
        const today = new Date().toISOString().split('T')[0];
        
        if (date > today) {
            showToast('Cannot mark attendance for a future date!', 'error');
            return;
        }
        
        // Delete existing record for this student on this date to overwrite
        appState.attendance = appState.attendance.filter(a => !(a.rollNo === rollNo && a.date === date));
        
        const record = { rollNo, date };
        for (let i = 1; i <= NUM_SUBJECTS; i++) {
            record[`sub${i}`] = parseInt(document.getElementById(`sub-${i}`).value, 10);
        }
        
        appState.attendance.push(record);
        saveData();
        showToast(`Attendance marked for Roll No: ${rollNo} on ${date}`);
    },

    // --- Admin Stats ---
    adminCheckTotalAttendance: (e) => {
        e.preventDefault();
        const rollNo = parseInt(document.getElementById('check-total-rollno').value, 10);
        renderStatsTable('admin-stats-result', rollNo, null, 'Total');
    },
    
    adminCheckDateAttendance: (e) => {
        e.preventDefault();
        const rollNo = parseInt(document.getElementById('check-date-rollno').value, 10);
        const date = document.getElementById('check-date').value;
        renderStatsTable('admin-stats-result', rollNo, date, 'Date');
    },

    // --- Student Stats ---
    studentCheckTotalAttendance: (e) => {
        e.preventDefault();
        const rollNo = parseInt(document.getElementById('student-total-rollno').value, 10);
        renderStatsTable('student-stats-result', rollNo, null, 'Total');
    },
    
    studentCheckDateAttendance: (e) => {
        e.preventDefault();
        const rollNo = parseInt(document.getElementById('student-date-rollno').value, 10);
        const date = document.getElementById('student-check-date').value;
        renderStatsTable('student-stats-result', rollNo, date, 'Date');
    }
};

// --- DOM Render Helpers ---

function updateStudentSelects() {
    const markSelect = document.getElementById('mark-student');
    if (!markSelect) return;
    
    markSelect.innerHTML = '<option value="" disabled selected>Select a student...</option>';
    appState.students.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.rollNo;
        opt.textContent = `${s.name} (Roll: ${s.rollNo})`;
        markSelect.appendChild(opt);
    });
}

function renderStudentTable() {
    const tbody = document.querySelector('#students-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (appState.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color: var(--text-muted);">No students found</td></tr>';
        return;
    }
    
    appState.students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.rollNo}</td><td>${s.name}</td>`;
        tbody.appendChild(tr);
    });
}

let activeChartAdmin = null;
let activeChartStudent = null;

function renderStatsTable(containerId, rollNo, date, mode) {
    const container = document.getElementById(containerId);
    container.classList.remove('hidden');
    container.classList.add('glass-panel');
    
    const student = appState.students.find(s => s.rollNo === rollNo);
    if (!student) {
        container.innerHTML = `<p style="color:var(--danger)">Student with Roll No ${rollNo} not found.</p>`;
        return;
    }

    let records = appState.attendance.filter(a => a.rollNo === rollNo);
    let titleStr = `Total Attendance for ${student.name} (Roll No: ${rollNo})`;
    
    if (mode === 'Date') {
        records = records.filter(a => a.date === date);
        titleStr = `Attendance on ${date} for ${student.name} (Roll No: ${rollNo})`;
    }

    const totals = { sub1: 0, sub2: 0, sub3: 0, sub4: 0, sub5: 0, sub6: 0 };
    records.forEach(r => {
        for(let i=1; i<=NUM_SUBJECTS; i++) totals[`sub${i}`] += r[`sub${i}`];
    });

    let html = `<h4>${titleStr}</h4>`;
    
    if (records.length === 0) {
        html += `<p style="color:var(--text-muted); margin-top:1rem; font-size:0.9rem;">No attendance records found for this query.</p>`;
        container.innerHTML = html;
        return;
    }

    // Add Chart container
    html += `<div style="margin-top: 1.5rem; position: relative; height: 300px; width: 100%;"><canvas id="chart-${containerId}"></canvas></div>`;
    container.innerHTML = html;
    
    // Render Chart.js
    const ctx = document.getElementById(`chart-${containerId}`).getContext('2d');
    
    if (containerId === 'admin-stats-result' && activeChartAdmin) activeChartAdmin.destroy();
    if (containerId === 'student-stats-result' && activeChartStudent) activeChartStudent.destroy();

    const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5', 'Subject 6'],
            datasets: [{
                label: 'Classes Attended',
                data: [totals.sub1, totals.sub2, totals.sub3, totals.sub4, totals.sub5, totals.sub6],
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0, color: '#9ca3af' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: {
                    ticks: { color: '#9ca3af' },
                    grid: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8
                }
            }
        }
    });

    if (containerId === 'admin-stats-result') activeChartAdmin = chartInstance;
    else activeChartStudent = chartInstance;
}

// Bootstrap
window.addEventListener('DOMContentLoaded', init);
