/* ============================================================
   HMIS - Hospital Management Information System
   Application Logic (app.js)
   ============================================================ */

'use strict';

/* ══════════════════════════════════════════════
   DATA STORE (in-memory, localStorage backed)
══════════════════════════════════════════════ */
const DB = {
  patients:     [],
  appointments: [],
  medical:      [],
  medicines:    [],
  bills:        [],
  doctors:      [],
  users:        [],
  departments:  [],
  dispenseLog:  [],
};

let currentUser = null;
let sidebarOpen = true;

/* ══════════════════════════════════════════════
   JAVA BACKEND & MYSQL REST API CONNECTOR
══════════════════════════════════════════════ */
const API_BASE = (window.location.protocol.startsWith('http'))
  ? (window.location.port === '8080' ? '/api' : 'http://localhost:8080/api')
  : 'http://localhost:8080/api';

let isBackendConnected = false;

async function syncDataFromBackend() {
  try {
    const [pts, appts, meds, rx, bills, docs, depts, usrs, logs] = await Promise.all([
      fetch(`${API_BASE}/patients`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/appointments`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/medicines`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/medical`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/bills`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/doctors`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/departments`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/users`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API_BASE}/dispense`).then(r => r.ok ? r.json() : null).catch(() => null)
    ]);
    if (Array.isArray(pts) && pts.length) DB.patients = pts;
    if (Array.isArray(appts) && appts.length) DB.appointments = appts;
    if (Array.isArray(meds) && meds.length) DB.medicines = meds;
    if (Array.isArray(rx) && rx.length) DB.medical = rx;
    if (Array.isArray(bills) && bills.length) DB.bills = bills;
    if (Array.isArray(docs) && docs.length) DB.doctors = docs;
    if (Array.isArray(depts) && depts.length) DB.departments = depts;
    if (Array.isArray(usrs) && usrs.length) DB.users = usrs;
    if (Array.isArray(logs) && logs.length) DB.dispenseLog = logs;
    isBackendConnected = true;
    updateBackendBadge(true);
  } catch (e) {
    console.warn('Backend sync failed:', e);
    isBackendConnected = false;
    updateBackendBadge(false);
  }
}

async function checkBackendStatus() {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      isBackendConnected = true;
      updateBackendBadge(true);
      await syncDataFromBackend();
    } else {
      isBackendConnected = false;
      updateBackendBadge(false);
    }
  } catch (err) {
    isBackendConnected = false;
    updateBackendBadge(false);
  }
}

function updateBackendBadge(online) {
  const badgeLogin = document.getElementById('backend-status-login');
  if (badgeLogin) {
    badgeLogin.innerHTML = online 
      ? '🟢 Connected to Java Backend &amp; MySQL' 
      : '🟡 Local In-Memory Mode (Java Offline)';
    badgeLogin.style.background = online ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)';
    badgeLogin.style.color = online ? '#059669' : '#d97706';
  }
  const badgeTop = document.getElementById('backend-status-topbar');
  if (badgeTop) {
    badgeTop.innerHTML = online 
      ? '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;"></span> MySQL Connected' 
      : '<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#f59e0b;"></span> Local Mode';
    badgeTop.style.color = online ? '#059669' : '#d97706';
  }
}

/* ══════════════════════════════════════════════
   ROLE DEFINITIONS
══════════════════════════════════════════════ */
const ROLE_CONFIG = {
  administrator: {
    label: 'Administrator',
    color: '#6366f1',
    pages: ['dashboard','patients','appointments','medical','pharmacy','billing','doctors','departments','users','history'],
    nav: [
      { id:'dashboard',    icon:'📊', label:'Dashboard' },
      { id:'patients',     icon:'🧑‍⚕️', label:'Patients' },
      { id:'appointments', icon:'📅', label:'Appointments' },
      { id:'medical',      icon:'📋', label:'Medical Records' },
      { id:'pharmacy',     icon:'💊', label:'Pharmacy' },
      { id:'billing',      icon:'💳', label:'Billing' },
      { id:'doctors',      icon:'👨‍⚕️', label:'Doctors & Schedules' },
      { id:'departments',  icon:'🏢', label:'Departments' },
      { id:'users',        icon:'👥', label:'User Management' },
      { id:'history',      icon:'🗂️', label:'Patient History' },
    ],
    stats: ['patients','appointments','doctors','bills','medicines','departments'],
  },
  doctor: {
    label: 'Doctor / Radiologist',
    color: '#10b981',
    pages: ['dashboard','patients','appointments','medical','history'],
    nav: [
      { id:'dashboard',    icon:'📊', label:'Dashboard' },
      { id:'patients',     icon:'🧑‍⚕️', label:'My Patients' },
      { id:'appointments', icon:'📅', label:'My Appointments' },
      { id:'medical',      icon:'📋', label:'Prescriptions & Records' },
      { id:'history',      icon:'🗂️', label:'Patient History' },
    ],
    stats: ['appointments','myPatients','medicalRecords'],
  },
  pharmacist: {
    label: 'Pharmacist',
    color: '#f59e0b',
    pages: ['dashboard','pharmacy','dispense','medical'],
    nav: [
      { id:'dashboard', icon:'📊', label:'Dashboard' },
      { id:'pharmacy',  icon:'💊', label:'Medicine Stock' },
      { id:'dispense',  icon:'🧴', label:'Dispense Medicine' },
      { id:'medical',   icon:'📋', label:'Prescriptions (View)' },
    ],
    stats: ['medicines','lowStock','dispensed','prescriptions'],
  },
  registration: {
    label: 'Registration Staff',
    color: '#0ea5e9',
    pages: ['dashboard','patients','appointments','billing','history'],
    nav: [
      { id:'dashboard',    icon:'📊', label:'Dashboard' },
      { id:'patients',     icon:'🧑‍⚕️', label:'Patient Registration' },
      { id:'appointments', icon:'📅', label:'Appointments' },
      { id:'billing',      icon:'💳', label:'Billing' },
      { id:'history',      icon:'🗂️', label:'Visit History' },
    ],
    stats: ['patients','todayPatients','appointments','bills'],
  },
};

/* ══════════════════════════════════════════════
   SAMPLE / SEED DATA
══════════════════════════════════════════════ */
function seedData() {
  DB.doctors = [
    { id:'D001', name:'Dr. Anil Sharma',  spec:'Cardiology',      phone:'9876543210', email:'anil@hospital.com',   days:'Mon, Wed, Fri', status:'Available' },
    { id:'D002', name:'Dr. Priya Verma',  spec:'Neurology',       phone:'9876543211', email:'priya@hospital.com',  days:'Tue, Thu, Sat', status:'Available' },
    { id:'D003', name:'Dr. Rahul Mehta',  spec:'Orthopedics',     phone:'9876543212', email:'rahul@hospital.com',  days:'Mon, Tue, Wed', status:'Available' },
    { id:'D004', name:'Dr. Sunita Gupta', spec:'Pediatrics',      phone:'9876543213', email:'sunita@hospital.com', days:'All Weekdays',  status:'Available' },
    { id:'D005', name:'Dr. Vikram Singh', spec:'General Medicine', phone:'9876543214', email:'vikram@hospital.com', days:'Mon to Sat',    status:'On Leave'  },
  ];

  DB.departments = [
    { id:'DEPT01', name:'Cardiology',      head:'Dr. Anil Sharma',  beds:30, location:'Floor 2, Block A', status:'Active' },
    { id:'DEPT02', name:'Neurology',       head:'Dr. Priya Verma',  beds:20, location:'Floor 3, Block B', status:'Active' },
    { id:'DEPT03', name:'Orthopedics',     head:'Dr. Rahul Mehta',  beds:25, location:'Floor 1, Block C', status:'Active' },
    { id:'DEPT04', name:'Pediatrics',      head:'Dr. Sunita Gupta', beds:15, location:'Floor 4, Block A', status:'Active' },
    { id:'DEPT05', name:'General Medicine',head:'Dr. Vikram Singh',  beds:40, location:'Floor 1, Block A', status:'Active' },
  ];

  DB.patients = [
    { id:'P001', name:'Rajesh Kumar',  dob:'1985-04-12', age:39, gender:'Male',   dept:'Cardiology',      assignedDoctor:'Dr. Anil Sharma',  phone:'9123456780', email:'rajesh@gmail.com', blood:'B+',  address:'12 Gandhi Nagar, Delhi',    emgName:'Meena Kumar', emgPhone:'9123456781', regDate:'2024-01-15' },
    { id:'P002', name:'Sunita Devi',   dob:'1992-08-22', age:32, gender:'Female', dept:'Neurology',       assignedDoctor:'Dr. Priya Verma',  phone:'9123456781', email:'sunita@gmail.com', blood:'O+',  address:'45 Nehru Colony, Jaipur',   emgName:'Ravi Devi',   emgPhone:'9123456782', regDate:'2024-02-03' },
    { id:'P003', name:'Arjun Patel',   dob:'2000-11-05', age:24, gender:'Male',   dept:'Orthopedics',     assignedDoctor:'Dr. Rahul Mehta',  phone:'9123456782', email:'arjun@gmail.com',  blood:'A+',  address:'78 MG Road, Ahmedabad',     emgName:'Hema Patel',  emgPhone:'9123456783', regDate:'2024-03-10' },
    { id:'P004', name:'Kavita Sharma', dob:'1978-03-18', age:46, gender:'Female', dept:'Pediatrics',      assignedDoctor:'Dr. Sunita Gupta', phone:'9123456783', email:'kavita@gmail.com', blood:'AB-', address:'90 Civil Lines, Agra',      emgName:'Arun Sharma', emgPhone:'9123456784', regDate:'2024-04-22' },
    { id:'P005', name:'Mohammed Ali',  dob:'1965-12-01', age:59, gender:'Male',   dept:'General Medicine',assignedDoctor:'Dr. Vikram Singh', phone:'9123456784', email:'mali@gmail.com',   blood:'O-',  address:'34 Station Road, Lucknow',  emgName:'Sara Ali',    emgPhone:'9123456785', regDate:'2024-05-07' },
    { id:'P006', name:'Sunil Verma',   dob:'1975-06-20', age:49, gender:'Male',   dept:'Cardiology',      assignedDoctor:'Dr. Anil Sharma',  phone:'9123456785', email:'sunil.v@gmail.com', blood:'A+', address:'15 Ring Road, Delhi',       emgName:'Anita Verma', emgPhone:'9123456786', regDate:'2024-05-18' },
  ];

  const today = new Date().toISOString().split('T')[0];
  DB.appointments = [
    { id:'A001', patientId:'P001', patientName:'Rajesh Kumar',  doctorId:'D001', doctorName:'Dr. Anil Sharma',  date:today, time:'09:00', reason:'Chest pain check-up',            status:'Scheduled' },
    { id:'A002', patientId:'P002', patientName:'Sunita Devi',   doctorId:'D002', doctorName:'Dr. Priya Verma',  date:today, time:'10:30', reason:'Headaches and dizziness',         status:'Completed' },
    { id:'A003', patientId:'P003', patientName:'Arjun Patel',   doctorId:'D003', doctorName:'Dr. Rahul Mehta',  date:today, time:'11:00', reason:'Knee injury follow-up',           status:'Scheduled' },
    { id:'A004', patientId:'P004', patientName:'Kavita Sharma', doctorId:'D004', doctorName:'Dr. Sunita Gupta', date:today, time:'12:00', reason:'Child consultation & vaccination', status:'Scheduled' },
    { id:'A005', patientId:'P006', patientName:'Sunil Verma',   doctorId:'D001', doctorName:'Dr. Anil Sharma',  date:today, time:'14:30', reason:'Cardiac rehabilitation follow-up', status:'Scheduled' },
    { id:'A006', patientId:'P005', patientName:'Mohammed Ali',  doctorId:'D005', doctorName:'Dr. Vikram Singh', date:today, time:'15:30', reason:'General health evaluation',        status:'Scheduled' },
  ];

  DB.medical = [
    { id:'MR001', patientId:'P001', patientName:'Rajesh Kumar', doctorId:'D001', doctorName:'Dr. Anil Sharma', diagnosis:'Hypertension – Stage 1', caseSummary:'Patient presents with elevated BP 150/95. History of hypertension for 3 years.', medicines:'Amlodipine 5mg, Metoprolol 50mg', tests:'ECG, Blood Pressure Monitoring, Lipid Profile', treatment:'Prescribed antihypertensives. Lifestyle modification advised.', notes:'Reduce sodium intake. Follow up in 2 weeks.', date:'2024-10-10' },
    { id:'MR002', patientId:'P002', patientName:'Sunita Devi',  doctorId:'D002', doctorName:'Dr. Priya Verma',  diagnosis:'Migraine', caseSummary:'Recurring episodes of severe headache with photophobia for 6 months.', medicines:'Sumatriptan 50mg, Ibuprofen 400mg', tests:'MRI Brain, EEG', treatment:'Prescribed triptans for acute attacks. Preventive therapy initiated.', notes:'Avoid bright lights and stress triggers.', date:'2024-10-12' },
    { id:'MR003', patientId:'P003', patientName:'Arjun Patel',  doctorId:'D003', doctorName:'Dr. Rahul Mehta',  diagnosis:'Ligament sprain – right knee', caseSummary:'Sports injury during football. Swelling and pain in right knee.', medicines:'Diclofenac Gel, Calcium tablets', tests:'X-Ray Knee, MRI Knee', treatment:'RICE protocol. Physiotherapy recommended for 3 weeks.', notes:'Rest, ice pack. No strenuous activity for 3 weeks.', date:'2024-10-15' },
    { id:'MR004', patientId:'P006', patientName:'Sunil Verma',   doctorId:'D001', doctorName:'Dr. Anil Sharma',  diagnosis:'Coronary Artery Disease', caseSummary:'Post-angioplasty routine evaluation. Stable vital signs.', medicines:'Atorvastatin 40mg, Aspirin 75mg', tests:'Lipid Profile, Stress Echo', treatment:'Stent patency maintained. Moderate aerobic activity prescribed.', notes:'Maintain low fat diet. Next visit in 1 month.', date:'2024-10-18' },
    { id:'MR005', patientId:'P004', patientName:'Kavita Sharma', doctorId:'D004', doctorName:'Dr. Sunita Gupta', diagnosis:'Pediatric Bronchitis', caseSummary:'Child presented with persistent cough and chest congestion. No wheezing.', medicines:'Amoxicillin 250mg, Paracetamol 500mg', tests:'Chest X-Ray, Blood Count', treatment:'5-day antibiotic course and steam inhalation advised.', notes:'Warm fluids, monitor temperature. Review in 5 days.', date:'2024-10-19' },
    { id:'MR006', patientId:'P005', patientName:'Mohammed Ali',  doctorId:'D005', doctorName:'Dr. Vikram Singh', diagnosis:'Type 2 Diabetes Mellitus', caseSummary:'Elevated fasting blood sugar 168 mg/dL with fatigue. Under care for 1 year.', medicines:'Metformin 500mg', tests:'HbA1c, Fasting Blood Sugar, Lipid Profile', treatment:'Oral hypoglycemic agent prescribed. Dietary glycemic control advised.', notes:'Follow diabetic diet plan. Walk 30 minutes daily.', date:'2024-10-20' },
  ];

  DB.medicines = [
    { id:'MED001', name:'Paracetamol 500mg', category:'Analgesic',  qty:500, price:2.50,  expiry:'2026-12-31', mfr:'Sun Pharma',     storage:'Shelf A1', minQty:50,  status:'In Stock'    },
    { id:'MED002', name:'Amoxicillin 250mg', category:'Antibiotic', qty:200, price:8.00,  expiry:'2026-06-30', mfr:'Cipla',          storage:'Shelf B2', minQty:30,  status:'In Stock'    },
    { id:'MED003', name:'Amlodipine 5mg',    category:'Cardiac',    qty:15,  price:5.00,  expiry:'2025-09-30', mfr:'Dr. Reddys',     storage:'Cabinet C',minQty:20,  status:'Low Stock'   },
    { id:'MED004', name:'Metformin 500mg',   category:'Diabetic',   qty:300, price:3.50,  expiry:'2027-03-31', mfr:'Ranbaxy',        storage:'Shelf A3', minQty:40,  status:'In Stock'    },
    { id:'MED005', name:'Vitamin D3 60K IU', category:'Vitamins',   qty:0,   price:45.00, expiry:'2025-04-30', mfr:'Mankind Pharma', storage:'Cold Store',minQty:10, status:'Out of Stock'},
    { id:'MED006', name:'Ibuprofen 400mg',   category:'Analgesic',  qty:180, price:4.00,  expiry:'2026-08-31', mfr:'Abbott',         storage:'Shelf A2', minQty:30,  status:'In Stock'    },
  ];

  DB.bills = [
    { id:'B001', patientId:'P001', patientName:'Rajesh Kumar',  date:'2024-10-10', consultation:500, medicine:120, tests:800,  other:0,   total:1420, status:'Paid'    },
    { id:'B002', patientId:'P002', patientName:'Sunita Devi',   date:'2024-10-12', consultation:800, medicine:75,  tests:3500, other:0,   total:4375, status:'Pending' },
    { id:'B003', patientId:'P003', patientName:'Arjun Patel',   date:'2024-10-15', consultation:600, medicine:250, tests:600,  other:100, total:1550, status:'Paid'    },
    { id:'B004', patientId:'P006', patientName:'Sunil Verma',   date:'2024-10-18', consultation:700, medicine:310, tests:1200, other:0,   total:2210, status:'Paid'    },
    { id:'B005', patientId:'P004', patientName:'Kavita Sharma', date:'2024-10-19', consultation:400, medicine:150, tests:400,  other:0,   total:950,  status:'Paid'    },
    { id:'B006', patientId:'P005', patientName:'Mohammed Ali',  date:'2024-10-20', consultation:500, medicine:100, tests:700,  other:0,   total:1300, status:'Paid'    },
  ];

  DB.users = [
    { id:'U001', username:'admin',    password:'admin123',  role:'administrator', name:'Admin User',        email:'admin@hospital.com',  status:'Active' },
    { id:'U002', username:'drAnil',   password:'doctor123', role:'doctor',        name:'Dr. Anil Sharma',   email:'anil@hospital.com',   status:'Active' },
    { id:'U003', username:'drPriya',  password:'doctor123', role:'doctor',        name:'Dr. Priya Verma',   email:'priya@hospital.com',  status:'Active' },
    { id:'U004', username:'drRahul',  password:'doctor123', role:'doctor',        name:'Dr. Rahul Mehta',   email:'rahul@hospital.com',  status:'Active' },
    { id:'U005', username:'drSunita', password:'doctor123', role:'doctor',        name:'Dr. Sunita Gupta',  email:'sunita@hospital.com', status:'Active' },
    { id:'U006', username:'drVikram', password:'doctor123', role:'doctor',        name:'Dr. Vikram Singh',  email:'vikram@hospital.com', status:'Active' },
    { id:'U007', username:'pharmRaj', password:'pharm123',  role:'pharmacist',    name:'Rajni Pharma',      email:'rajni@hospital.com',  status:'Active' },
    { id:'U008', username:'regStaff', password:'reg123',    role:'registration',  name:'Sita Kumari',       email:'sita@hospital.com',   status:'Active' },
  ];

  DB.dispenseLog = [
    { id:'DL001', patientId:'P001', patientName:'Rajesh Kumar', medicineId:'MED003', medicineName:'Amlodipine 5mg', qty:30, ref:'MR001', dispensedBy:'pharmRaj', datetime:'2024-10-10 10:15' },
  ];
}

/* ══════════════════════════════════════════════
   COUNTERS
══════════════════════════════════════════════ */
let counters = { P:6, A:6, MR:6, MED:6, B:6, D:5, U:8, DEPT:5, DL:1 };
let showMyPatientsOnly = true;
let showMyAppointmentsOnly = true;

function nextId(prefix) {
  counters[prefix]++;
  const padded = String(counters[prefix]).padStart(3,'0');
  const map = { P:'P', A:'A', MR:'MR', MED:'MED', B:'B', D:'D', U:'U' };
  return map[prefix] + padded;
}

/* ══════════════════════════════════════════════
   DOCTOR ASSIGNMENT & PERMISSION HELPERS
══════════════════════════════════════════════ */
function isAssignedToDoctor(patient, doctorName) {
  if (!patient || !doctorName) return false;
  const pDoc = (patient.assignedDoctor || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();
  const dName = doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
  if (!pDoc || !dName) return false;
  return pDoc.includes(dName) || dName.includes(pDoc);
}

function isDoctorAppointment(appt, doctorName) {
  if (!appt || !doctorName) return false;
  const aDoc = (appt.doctorName || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();
  const dName = doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
  if (!aDoc || !dName) return false;
  return aDoc.includes(dName) || dName.includes(aDoc);
}

function isDoctorMedicalRecord(record, doctorName) {
  if (!record || !doctorName) return false;
  const rDoc = (record.doctorName || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();
  const dName = doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').trim();
  if (rDoc && dName && (rDoc.includes(dName) || dName.includes(rDoc))) return true;
  // Also match if the patient associated with the record is assigned to this doctor
  const pat = DB.patients.find(p => p.id === record.patientId);
  return isAssignedToDoctor(pat, doctorName);
}

/* ══════════════════════════════════════════════
   LOGIN / LOGOUT
══════════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const role     = document.getElementById('role-select').value;

  if (!username || !password || !role) {
    showLoginError('Please enter username, password, and select your role.');
    return;
  }

  // 1. Try Java Backend Authentication First
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
      signal: AbortSignal.timeout(2500)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      currentUser = { username: data.username, role: data.role, name: data.name };
      await syncDataFromBackend();
      document.getElementById('login-screen').style.display = 'none';
      const app = document.getElementById('app');
      app.style.display = 'flex';
      initApp();
      return;
    } else if (res.status === 400 || !data.success) {
      showLoginError(data.message || 'Login failed.');
      return;
    }
  } catch (err) {
    console.info('Backend unreachable, trying local fallback authentication...', err);
  }

  // 2. Fallback to Local In-Memory Check
  const user = DB.users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    showLoginError(`Account "${username}" not found. Please check your username or Sign Up.`);
    return;
  }

  if (user.password !== password) {
    showLoginError('Incorrect password. Please verify and try again.');
    return;
  }

  if (user.role !== role) {
    const regLabel = ROLE_CONFIG[user.role]?.label || user.role;
    const selLabel = ROLE_CONFIG[role]?.label || role;
    showLoginError(`Role mismatch: Account "${username}" is registered as "${regLabel}", not "${selLabel}". Please select the correct role.`);
    return;
  }

  if (user.status !== 'Active') {
    showLoginError('This user account is currently inactive. Please contact the Administrator.');
    return;
  }

  currentUser = { username: user.username, role: user.role, name: user.name };
  document.getElementById('login-screen').style.display = 'none';
  const app = document.getElementById('app');
  app.style.display = 'flex';
  initApp();
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}

/* ── Tab Switch ── */
function switchTab(tab) {
  document.getElementById('panel-signin').style.display = tab === 'signin' ? 'block' : 'none';
  document.getElementById('panel-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tab-signin').classList.toggle('active', tab === 'signin');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('login-error').style.display  = 'none';
  document.getElementById('signup-error').style.display = 'none';
  document.getElementById('signup-success').style.display = 'none';
}

/* ── Sign Up ── */
async function handleSignup(e) {
  e.preventDefault();
  const errEl     = document.getElementById('signup-error');
  const successEl = document.getElementById('signup-success');
  errEl.style.display     = 'none';
  successEl.style.display = 'none';

  const fullname = document.getElementById('su-fullname').value.trim();
  const username = document.getElementById('su-username').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const phone    = document.getElementById('su-phone').value.trim();
  const role     = document.getElementById('su-role').value;
  const password = document.getElementById('su-password').value;
  const confirm  = document.getElementById('su-confirm').value;

  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.style.display = 'block'; return;
  }
  if (password !== confirm) {
    errEl.textContent = 'Passwords do not match. Please re-enter.';
    errEl.style.display = 'block'; return;
  }

  const newUser = {
    username,
    name: fullname,
    email,
    phone,
    role,
    status: 'Active',
    password
  };

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    if (!res.ok) {
      const data = await res.json();
      errEl.textContent = data.message || 'Registration failed.';
      errEl.style.display = 'block';
      return;
    }
  } catch (err) {
    const exists = DB.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      errEl.textContent = `Username "${username}" is already taken. Please choose another.`;
      errEl.style.display = 'block'; return;
    }
    newUser.id = 'U' + String(++counters.U).padStart(3,'0');
    DB.users.push(newUser);
  }

  successEl.textContent = `✅ Account created successfully! You can now Sign In as "${username}".`;
  successEl.style.display = 'block';
  document.getElementById('signup-form').reset();

  setTimeout(() => {
    switchTab('signin');
    document.getElementById('username').value = username;
  }, 2000);
}

function logout() {
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('login-form').reset();
  document.getElementById('login-error').style.display = 'none';
}

/* ══════════════════════════════════════════════
   APP INIT
══════════════════════════════════════════════ */
function initApp() {
  const cfg = ROLE_CONFIG[currentUser.role];

  // Set sidebar user info
  document.getElementById('user-avatar').textContent     = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('sidebar-username').textContent = currentUser.name;
  document.getElementById('sidebar-role').textContent    = cfg.label;
  document.getElementById('topbar-role-badge').textContent = cfg.label;
  document.getElementById('topbar-user').textContent     = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('topbar-role-badge').style.background = hexToAlpha(cfg.color, 0.12);
  document.getElementById('topbar-role-badge').style.color      = cfg.color;

  // Build sidebar nav
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  cfg.nav.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.id = 'nav-' + item.id;
    btn.innerHTML = `<span class="nav-icon">${item.icon}</span><span class="nav-label">${item.label}</span>`;
    btn.onclick = () => navigateTo(item.id);
    nav.appendChild(btn);
  });

  // Populate dropdowns
  populateDropdowns();

  // Go to dashboard
  navigateTo('dashboard');

  // Handle responsive
  if (window.innerWidth <= 900) {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    sidebarOpen = false;
  }
}

function hexToAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function populateDropdowns() {
  // Patient dropdowns
  ['a-patient','rx-patient','b-patient','disp-patient'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Patient</option>';
    
    // For doctor in prescription modal: show ONLY patients assigned to this doctor
    let list = DB.patients;
    if (id === 'rx-patient' && currentUser && currentUser.role === 'doctor') {
      list = DB.patients.filter(p => isAssignedToDoctor(p, currentUser.name));
    }

    list.forEach(p => {
      sel.innerHTML += `<option value="${p.id}">${p.name} (${p.id})</option>`;
    });
  });

  // Doctor dropdowns
  ['a-doctor','rx-doctor','p-assigned-doctor','dept-head'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '<option value="">Select Doctor</option>';

    // For doctor prescribing: lock to currentUser
    if (id === 'rx-doctor' && currentUser && currentUser.role === 'doctor') {
      sel.innerHTML = `<option value="${currentUser.name}" selected>${currentUser.name}</option>`;
      sel.disabled = true;
      return;
    } else if (id === 'rx-doctor') {
      sel.disabled = false;
    }

    DB.doctors.forEach(d => {
      const avail = d.status === 'Available';
      const disabled = (id !== 'dept-head' && !avail) ? 'disabled' : '';
      const label = (id !== 'dept-head' && !avail) ? ` (Unavailable)` : '';
      sel.innerHTML += `<option value="${d.name}" ${disabled}>${d.name} – ${d.spec}${label}</option>`;
    });
  });
  // Department dropdown
  const deptSel = document.getElementById('p-dept');
  if (deptSel) {
    deptSel.innerHTML = '<option value="">Select Department</option>';
    DB.departments.forEach(d => {
      deptSel.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    });
  }
  // Medicine dispense dropdown
  const medSel = document.getElementById('disp-medicine');
  if (medSel) {
    medSel.innerHTML = '<option value="">Select Medicine</option>';
    DB.medicines.filter(m => m.qty > 0).forEach(m => {
      medSel.innerHTML += `<option value="${m.id}">${m.name} (Stock: ${m.qty})</option>`;
    });
  }
}

/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
function navigateTo(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  // Show target
  const page = document.getElementById('page-' + pageId);
  if (page) page.style.display = 'block';

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + pageId);
  if (navBtn) navBtn.classList.add('active');

  // Update topbar title
  const cfg = ROLE_CONFIG[currentUser.role];
  const navItem = cfg.nav.find(n => n.id === pageId);
  document.getElementById('topbar-title').textContent = navItem ? navItem.label : 'Dashboard';

  // Apply role permissions for the target page
  updatePagePermissions(pageId);

  // Render page content
  switch(pageId) {
    case 'dashboard':    renderDashboard();    break;
    case 'patients':     renderPatients();     break;
    case 'appointments': renderAppointments(); break;
    case 'medical':      renderMedical();      break;
    case 'pharmacy':     renderPharmacy();     break;
    case 'billing':      renderBilling();      break;
    case 'doctors':      renderDoctors();      break;
    case 'departments':  renderDepartments();  break;
    case 'users':        renderUsers();        break;
    case 'dispense':     renderDispenseLog();  break;
    case 'history':      clearHistory();       break;
  }

  // On mobile: close sidebar after nav
  if (window.innerWidth <= 900) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

/* ══════════════════════════════════════════════
   ROLE PERMISSIONS & ACCESS CONTROLS
══════════════════════════════════════════════ */
function updatePagePermissions(pageId) {
  if (!currentUser) return;
  const role = currentUser.role;

  // 1. Appointments page
  const addApptBtn    = document.getElementById('btn-add-appointment');
  const apptPageTitle = document.getElementById('appointments-page-title');
  if (addApptBtn) {
    // Only Registration Staff schedules visiting patient appointments
    addApptBtn.style.display = (role === 'registration') ? 'inline-flex' : 'none';
  }
  if (apptPageTitle) {
    apptPageTitle.textContent = (role === 'doctor') ? 'My Appointments & Schedule' : 'Appointments';
  }

  // 2. Patients page
  const addPatBtn     = document.getElementById('btn-add-patient');
  const patientsTitle = document.getElementById('patients-page-title');
  if (addPatBtn) {
    // Patient registration is handled exclusively by Registration Staff
    addPatBtn.style.display = (role === 'registration') ? 'inline-flex' : 'none';
  }
  if (patientsTitle) {
    patientsTitle.textContent = (role === 'doctor') ? 'My Assigned Patients' : 'Patient Management';
  }

  // 3. Medical Records page
  const addPrescBtn    = document.getElementById('btn-add-prescription');
  const medicalTitle   = document.getElementById('medical-page-title');
  if (addPrescBtn) {
    // Only Doctor can add prescriptions and order diagnostic tests
    addPrescBtn.style.display = (role === 'doctor') ? 'inline-flex' : 'none';
  }
  if (medicalTitle) {
    medicalTitle.textContent = (role === 'pharmacist') 
      ? 'Prescriptions & Medical Records (View Only)' 
      : (role === 'doctor')
        ? 'Assigned Patient Records & Prescriptions'
        : 'Medical Records & Prescriptions';
  }

  // 4. Pharmacy page
  const addMedBtn = document.getElementById('btn-add-medicine');
  if (addMedBtn) {
    // Medicine stock is managed exclusively by Pharmacist
    addMedBtn.style.display = (role === 'pharmacist') ? 'inline-flex' : 'none';
  }

  // 5. Billing page
  const addBillBtn = document.getElementById('btn-add-bill');
  if (addBillBtn) {
    // Patient visit billing is handled at the registration desk
    addBillBtn.style.display = (role === 'registration') ? 'inline-flex' : 'none';
  }

  // 6. Patient History page
  const histPageTitle = document.getElementById('history-page-title');
  if (histPageTitle) {
    histPageTitle.textContent = (role === 'doctor') ? 'My Assigned Patients History' : 'Patient History';
  }

  // Ensure dropdowns are synced with doctor role
  populateDropdowns();
}

/* ══════════════════════════════════════════════
   DASHBOARD RENDER
══════════════════════════════════════════════ */
function renderDashboard() {
  const role = currentUser.role;
  const cfg  = ROLE_CONFIG[role];

  document.getElementById('dash-welcome').textContent =
    `Welcome back, ${currentUser.name}! Here's what's happening today.`;

  const statsGrid = document.getElementById('stats-grid');
  statsGrid.innerHTML = '';

  const allStats = {
    patients:       { label:'Total Patients',         value: DB.patients.length,                                                          icon:'🧑‍⚕️', cls:'blue'   },
    appointments:   { label:"Today's Appointments",   value: (role === 'doctor') ? DB.appointments.filter(a=>a.date===today() && isDoctorAppointment(a, currentUser.name)).length : DB.appointments.filter(a=>a.date===today()).length, icon:'📅', cls:'green'  },
    doctors:        { label:'Active Doctors',          value: DB.doctors.filter(d=>d.status==='Available').length,                          icon:'👨‍⚕️', cls:'purple' },
    bills:          { label:'Total Bills',             value: DB.bills.length,                                                             icon:'💳', cls:'amber'  },
    medicines:      { label:'Medicine Types',          value: DB.medicines.length,                                                         icon:'💊', cls:'teal'   },
    departments:    { label:'Departments',             value: DB.departments.length,                                                       icon:'🏢', cls:'purple' },
    medicalRecords: { label:'Assigned Records',        value: (role === 'doctor') ? DB.medical.filter(r=>isDoctorMedicalRecord(r, currentUser.name)).length : DB.medical.length, icon:'📋', cls:'blue'   },
    lowStock:       { label:'Low / Out of Stock',      value: DB.medicines.filter(m=>m.status!=='In Stock').length,                        icon:'⚠️', cls:'red'    },
    dispensed:      { label:'Medicines Dispensed',     value: DB.dispenseLog.length,                                                       icon:'🧴', cls:'green'  },
    prescriptions:  { label:'Prescriptions',           value: DB.medical.length,                                                           icon:'📋', cls:'green'  },
    myPatients:     { label:'My Assigned Patients',    value: DB.patients.filter(p=>isAssignedToDoctor(p, currentUser.name)).length, icon:'🧑‍⚕️', cls:'green' },
    todayPatients:  { label:"Today's Registrations",  value: DB.patients.filter(p=>p.regDate===today()).length,                           icon:'📅', cls:'teal'   },
  };

  cfg.stats.forEach(key => {
    const s = allStats[key];
    if (!s) return;
    const div = document.createElement('div');
    div.className = `stat-card ${s.cls}`;
    div.innerHTML = `
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-info">
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`;
    statsGrid.appendChild(div);
  });

  // Recent patients (Doctor only sees their assigned patients)
  const ptBody = document.getElementById('recent-patients-tbody');
  const recentList = (role === 'doctor')
    ? DB.patients.filter(p => isAssignedToDoctor(p, currentUser.name)).slice(-5).reverse()
    : DB.patients.slice(-5).reverse();

  ptBody.innerHTML = recentList.length ? recentList.map(p => {
    const appt = DB.appointments.find(a => a.patientId === p.id);
    return `<tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.name}</td>
      <td>${p.assignedDoctor || (appt ? appt.doctorName : '—')}</td>
      <td><span class="badge ${appt ? 'badge-green' : 'badge-gray'}">${appt ? appt.status : 'No Appt'}</span></td>
    </tr>`;
  }).join('') : `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);padding:16px;">${role === 'doctor' ? 'No patients assigned to you yet' : 'No patients registered yet'}</td></tr>`;

  // Today's appointments (Doctor only sees their own appointments)
  const todayAppts = (role === 'doctor')
    ? DB.appointments.filter(a => a.date === today() && isDoctorAppointment(a, currentUser.name))
    : DB.appointments.filter(a => a.date === today());
  const apptBody = document.getElementById('today-appointments-tbody');
  apptBody.innerHTML = todayAppts.length ? todayAppts.map(a => `
    <tr>
      <td>${a.time}</td>
      <td>${a.patientName}</td>
      <td>${a.doctorName}</td>
    </tr>`).join('') :
    `<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:16px;">${role === 'doctor' ? 'No consultations scheduled for you today' : 'No appointments today'}</td></tr>`;
}

/* ══════════════════════════════════════════════
   PATIENTS RENDER
══════════════════════════════════════════════ */
function renderPatients(list) {
  const role = currentUser ? currentUser.role : '';
  let data = list !== undefined ? list : DB.patients;

  // Doctor role: STRICT ISOLATION - ONLY view assigned patients
  if (role === 'doctor') {
    data = data.filter(p => isAssignedToDoctor(p, currentUser.name));
  }

  const body = document.getElementById('patients-tbody');
  if (!body) return;
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="8" class="empty-cell">${role === 'doctor' ? 'No patients currently assigned to you.' : 'No patients found.'}</td></tr>`;
    return;
  }
  body.innerHTML = data.map(p => `
    <tr>
      <td><strong>${p.id}</strong></td>
      <td>${p.name}</td>
      <td>${p.age || calcAge(p.dob)} / ${p.gender}</td>
      <td><span class="badge badge-blue">${p.dept || '—'}</span></td>
      <td>${p.assignedDoctor || '—'}</td>
      <td>${p.phone}</td>
      <td><span class="badge badge-purple">${p.blood || 'N/A'}</span></td>
      <td>
        <button class="btn-icon" title="View Patient Details & History" onclick="viewPatient('${p.id}')">👁️</button>
        ${role === 'registration' ? `
          <button class="btn-icon" title="Edit Patient Info" onclick="editPatient('${p.id}')">✏️</button>
          <button class="btn-icon danger" title="Delete Patient" onclick="deleteRecord('patients','${p.id}', renderPatients)">🗑️</button>
        ` : ''}
      </td>
    </tr>`).join('');
}

function toggleMyPatients(myOnly) {
  showMyPatientsOnly = myOnly;
  const btnAll = document.getElementById('btn-all-patients');
  const btnMy  = document.getElementById('btn-my-patients');
  if (btnAll) btnAll.classList.toggle('active', !myOnly);
  if (btnMy)  btnMy.classList.toggle('active', myOnly);
  renderPatients();
}

function filterPatients() {
  const q = document.getElementById('patient-search').value.toLowerCase().trim();
  let pool = DB.patients;
  if (currentUser && currentUser.role === 'doctor') {
    pool = pool.filter(p => isAssignedToDoctor(p, currentUser.name));
  }
  renderPatients(pool.filter(p =>
    p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.phone && p.phone.includes(q))
  ));
}

async function addPatient(e) {
  e.preventDefault();
  if (currentUser.role !== 'registration') {
    showToast('Permission Denied: Patient registration is handled exclusively by Registration Staff.', 'error');
    return;
  }
  const dob = document.getElementById('p-dob').value;
  const assignedDoc = document.getElementById('p-assigned-doctor').value;
  const p = {
    id:             'P' + String(++counters.P).padStart(3,'0'),
    name:           document.getElementById('p-name').value.trim(),
    dob,
    age:            calcAge(dob),
    gender:         document.getElementById('p-gender').value,
    blood:          document.getElementById('p-blood').value,
    dept:           document.getElementById('p-dept').value,
    assignedDoctor: assignedDoc,
    phone:          document.getElementById('p-phone').value.trim(),
    email:          document.getElementById('p-email').value.trim(),
    address:        document.getElementById('p-address').value.trim(),
    emgName:        document.getElementById('p-emg-name').value.trim(),
    emgPhone:       document.getElementById('p-emg-phone').value.trim(),
    regDate:        today(),
  };

  try {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p)
    });
    if (res.ok) {
      const saved = await res.json();
      p.id = saved.id;
    }
  } catch (err) {
    console.warn('API call failed, stored locally:', err);
  }

  DB.patients.push(p);
  populateDropdowns();
  closeModal('modal-add-patient');
  document.getElementById('form-add-patient').reset();
  renderPatients();
  showToast(`Patient ${p.name} registered with ID ${p.id}!`, 'success');
}

function viewPatient(id) {
  const p = DB.patients.find(x => x.id === id);
  if (!p) return;
  if (currentUser && currentUser.role === 'doctor' && !isAssignedToDoctor(p, currentUser.name)) {
    showToast('Access Denied: You are authorized to view records of your assigned patients only.', 'error');
    return;
  }
  const records = DB.medical.filter(m => m.patientId === id);
  const appts   = DB.appointments.filter(a => a.patientId === id);
  const bills   = DB.bills.filter(b => b.patientId === id);

  document.getElementById('detail-modal-title').textContent = `Patient: ${p.name}`;
  document.getElementById('detail-modal-body').innerHTML = `
    <div class="detail-grid" style="margin-bottom:20px;">
      <div class="detail-item"><div class="label">Patient ID</div><div class="value">${p.id}</div></div>
      <div class="detail-item"><div class="label">Full Name</div><div class="value">${p.name}</div></div>
      <div class="detail-item"><div class="label">Date of Birth</div><div class="value">${formatDate(p.dob)}</div></div>
      <div class="detail-item"><div class="label">Age</div><div class="value">${p.age || calcAge(p.dob)} years</div></div>
      <div class="detail-item"><div class="label">Gender</div><div class="value">${p.gender}</div></div>
      <div class="detail-item"><div class="label">Blood Group</div><div class="value">${p.blood || 'N/A'}</div></div>
      <div class="detail-item"><div class="label">Department</div><div class="value">${p.dept || '—'}</div></div>
      <div class="detail-item"><div class="label">Assigned Doctor</div><div class="value">${p.assignedDoctor || '—'}</div></div>
      <div class="detail-item"><div class="label">Phone</div><div class="value">${p.phone}</div></div>
      <div class="detail-item"><div class="label">Email</div><div class="value">${p.email || '—'}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Address</div><div class="value">${p.address || '—'}</div></div>
      <div class="detail-item"><div class="label">Emergency Contact</div><div class="value">${p.emgName || '—'}</div></div>
      <div class="detail-item"><div class="label">Emergency Phone</div><div class="value">${p.emgPhone || '—'}</div></div>
    </div>
    <hr style="border:none;border-top:1px solid var(--border);margin-bottom:16px;"/>
    <div style="margin-bottom:12px;"><strong>Medical Records (${records.length})</strong></div>
    ${records.length ? records.map(r=>`
      <div class="record-item">
        <div class="record-date">${formatDate(r.date)} &nbsp;·&nbsp; ${r.doctorName}</div>
        <div class="record-doctor">${r.diagnosis}</div>
        ${r.caseSummary ? `<div class="record-diagnosis" style="margin-top:4px;">📋 ${r.caseSummary}</div>` : ''}
        ${r.treatment ? `<div class="record-diagnosis" style="margin-top:4px;">🩺 ${r.treatment}</div>` : ''}
        <div class="record-meds">💊 ${r.medicines || 'None'}</div>
        ${r.tests ? `<div class="record-meds">🔬 ${r.tests}</div>` : ''}
      </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">No medical records.</p>'}
    <div style="margin:16px 0 8px;"><strong>Appointments (${appts.length})</strong></div>
    ${appts.length ? appts.map(a=>`
      <div class="record-item" style="border-left-color:var(--success)">
        <div class="record-date">${formatDate(a.date)} at ${a.time}</div>
        <div class="record-doctor">${a.doctorName}</div>
        <div class="record-diagnosis">${a.reason || '—'} <span class="badge badge-${statusBadgeClass(a.status)}">${a.status}</span></div>
      </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">No appointments.</p>'}
    <div style="margin:16px 0 8px;"><strong>Bills (${bills.length})</strong></div>
    ${bills.length ? bills.map(b=>`
      <div class="record-item" style="border-left-color:var(--warning)">
        <div class="record-date">Bill ${b.id} &nbsp;·&nbsp; ${formatDate(b.date)}</div>
        <div class="record-doctor">Total: ₹${b.total.toFixed(2)}</div>
        <div><span class="badge badge-${b.status==='Paid'?'green':'amber'}">${b.status}</span></div>
      </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">No bills.</p>'}
  `;
  openModal('modal-view-detail');
}

function editPatient(id) {
  if (currentUser.role !== 'registration') {
    showToast('Permission Denied: Patient information is maintained exclusively by Registration Staff.', 'error');
    return;
  }
  const p = DB.patients.find(x => x.id === id);
  if (!p) return;
  document.getElementById('p-name').value     = p.name;
  document.getElementById('p-dob').value      = p.dob;
  document.getElementById('p-gender').value   = p.gender;
  document.getElementById('p-blood').value    = p.blood || '';
  document.getElementById('p-phone').value    = p.phone;
  document.getElementById('p-email').value    = p.email || '';
  document.getElementById('p-address').value  = p.address || '';
  document.getElementById('p-emg-name').value = p.emgName || '';
  document.getElementById('p-emg-phone').value= p.emgPhone || '';
  openModal('modal-add-patient');
  document.querySelector('#modal-add-patient .modal-header h3').textContent = 'Update Patient';
  document.querySelector('#form-add-patient button[type=submit]').textContent = 'Update Patient';
  document.getElementById('form-add-patient').onsubmit = async function(e) {
    e.preventDefault();
    p.name    = document.getElementById('p-name').value.trim();
    p.dob     = document.getElementById('p-dob').value;
    p.age     = calcAge(p.dob);
    p.gender  = document.getElementById('p-gender').value;
    p.blood   = document.getElementById('p-blood').value;
    p.phone   = document.getElementById('p-phone').value.trim();
    p.email   = document.getElementById('p-email').value.trim();
    p.address = document.getElementById('p-address').value.trim();
    p.emgName = document.getElementById('p-emg-name').value.trim();
    p.emgPhone= document.getElementById('p-emg-phone').value.trim();

    try {
      await fetch(`${API_BASE}/patients/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      });
    } catch (err) {
      console.warn('API update failed:', err);
    }

    closeModal('modal-add-patient');
    document.getElementById('form-add-patient').reset();
    document.querySelector('#modal-add-patient .modal-header h3').textContent = 'Register New Patient';
    document.querySelector('#form-add-patient button[type=submit]').textContent = 'Register Patient';
    document.getElementById('form-add-patient').onsubmit = addPatient;
    renderPatients();
    showToast('Patient record updated!', 'success');
  };
}

/* ══════════════════════════════════════════════
   APPOINTMENTS RENDER
══════════════════════════════════════════════ */
function renderAppointments(list) {
  const role = currentUser ? currentUser.role : '';
  let data = list !== undefined ? list : DB.appointments;

  // Doctor role: STRICT ISOLATION - ONLY view their own appointments
  if (role === 'doctor') {
    data = data.filter(a => isDoctorAppointment(a, currentUser.name));
  }

  const body = document.getElementById('appointments-tbody');
  if (!body) return;

  if (!data.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty-cell">${role === 'doctor' ? 'No appointments scheduled for you.' : 'No appointments found.'}</td></tr>`;
    return;
  }
  body.innerHTML = data.map(a => `
    <tr>
      <td><strong>${a.id}</strong></td>
      <td>${a.patientName}</td>
      <td>${a.doctorName}</td>
      <td>${formatDate(a.date)}</td>
      <td>${a.time}</td>
      <td><span class="badge badge-${statusBadgeClass(a.status)}">${a.status}</span></td>
      <td>
        <button class="btn-icon" title="View Details" onclick="viewAppointment('${a.id}')">👁️</button>
        ${a.status==='Scheduled' && (role === 'doctor' || role === 'registration') ? `<button class="btn-icon" title="Mark Completed" onclick="completeAppointment('${a.id}')">✅</button>` : ''}
        ${a.status==='Scheduled' && role === 'registration' ? `<button class="btn-icon danger" title="Cancel Appointment" onclick="cancelAppointment('${a.id}')">❌</button>` : ''}
      </td>
    </tr>`).join('');
}

function toggleMyAppointments(myOnly) {
  showMyAppointmentsOnly = myOnly;
  const btnMy  = document.getElementById('btn-my-appts');
  const btnAll = document.getElementById('btn-all-appts');
  if (btnMy)  btnMy.classList.toggle('active', myOnly);
  if (btnAll) btnAll.classList.toggle('active', !myOnly);
  renderAppointments();
}

function filterAppointments() {
  const q = document.getElementById('appt-search').value.toLowerCase().trim();
  let pool = DB.appointments;
  if (currentUser && currentUser.role === 'doctor') {
    pool = pool.filter(a => isDoctorAppointment(a, currentUser.name));
  }
  renderAppointments(pool.filter(a =>
    a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
  ));
}

async function addAppointment(e) {
  e.preventDefault();
  if (currentUser.role !== 'registration') {
    showToast('Permission Denied: Appointments are scheduled exclusively by Registration Staff.', 'error');
    return;
  }
  const patSel = document.getElementById('a-patient');
  const docSel = document.getElementById('a-doctor');
  const a = {
    id:          'A' + String(++counters.A).padStart(3,'0'),
    patientId:   patSel.value,
    patientName: patSel.options[patSel.selectedIndex].text.split(' (')[0],
    doctorId:    docSel.value,
    doctorName:  docSel.options[docSel.selectedIndex].text.split(' –')[0],
    date:        document.getElementById('a-date').value,
    time:        document.getElementById('a-time').value,
    reason:      document.getElementById('a-reason').value.trim(),
    status:      'Scheduled',
  };

  try {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(a)
    });
    if (res.ok) {
      const saved = await res.json();
      a.id = saved.id;
    }
  } catch(err) {
    console.warn('API appointment save failed:', err);
  }

  DB.appointments.push(a);
  closeModal('modal-add-appointment');
  document.getElementById('form-add-appointment').reset();
  renderAppointments();
  showToast('Appointment scheduled successfully!', 'success');
}

async function completeAppointment(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (a) {
    a.status = 'Completed';
    try {
      await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
    } catch(err) { console.warn(err); }
    renderAppointments();
    showToast('Appointment marked as completed.', 'info');
  }
}

async function cancelAppointment(id) {
  if (currentUser.role !== 'registration') {
    showToast('Permission Denied: Appointments can only be cancelled by Registration Staff.', 'error');
    return;
  }
  const a = DB.appointments.find(x => x.id === id);
  if (a && a.status !== 'Cancelled') {
    a.status = 'Cancelled';
    try {
      await fetch(`${API_BASE}/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' })
      });
    } catch(err) { console.warn(err); }
    renderAppointments();
    showToast('Appointment cancelled.', 'info');
  }
}

function viewAppointment(id) {
  const a = DB.appointments.find(x => x.id === id);
  if (!a) return;
  if (currentUser && currentUser.role === 'doctor' && !isDoctorAppointment(a, currentUser.name)) {
    showToast('Access Denied: You can only view appointments scheduled for you.', 'error');
    return;
  }
  document.getElementById('detail-modal-title').textContent = `Appointment ${a.id}`;
  document.getElementById('detail-modal-body').innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><div class="label">Appointment ID</div><div class="value">${a.id}</div></div>
      <div class="detail-item"><div class="label">Status</div><div class="value"><span class="badge badge-${statusBadgeClass(a.status)}">${a.status}</span></div></div>
      <div class="detail-item"><div class="label">Patient</div><div class="value">${a.patientName}</div></div>
      <div class="detail-item"><div class="label">Doctor</div><div class="value">${a.doctorName}</div></div>
      <div class="detail-item"><div class="label">Date</div><div class="value">${formatDate(a.date)}</div></div>
      <div class="detail-item"><div class="label">Time</div><div class="value">${a.time}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Reason</div><div class="value">${a.reason || '—'}</div></div>
    </div>`;
  openModal('modal-view-detail');
}

/* ══════════════════════════════════════════════
   MEDICAL RECORDS RENDER
══════════════════════════════════════════════ */
function renderMedical(list) {
  const role = currentUser ? currentUser.role : '';
  let data = list !== undefined ? list : DB.medical;

  // Doctor role: STRICT ISOLATION - ONLY view clinical records for assigned patients or created by this doctor
  if (role === 'doctor') {
    data = data.filter(r => isDoctorMedicalRecord(r, currentUser.name));
  }

  const body = document.getElementById('medical-tbody');
  if (!body) return;
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="8" class="empty-cell">${role === 'doctor' ? 'No clinical records found for your assigned patients.' : 'No records found.'}</td></tr>`;
    return;
  }
  body.innerHTML = data.map(r => `
    <tr>
      <td><strong>${r.id}</strong></td>
      <td>${r.patientName}</td>
      <td>${r.doctorName}</td>
      <td>${r.diagnosis}</td>
      <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${r.medicines}">${r.medicines || '—'}</td>
      <td>${r.tests || '—'}</td>
      <td>${formatDate(r.date)}</td>
      <td>
        <button class="btn-icon" title="View Details" onclick="viewMedical('${r.id}')">👁️</button>
        ${role === 'doctor' ? `
          <button class="btn-icon danger" title="Delete" onclick="deleteRecord('medical','${r.id}', renderMedical)">🗑️</button>
        ` : ''}
      </td>
    </tr>`).join('');
}

function filterMedical() {
  const q = document.getElementById('medical-search').value.toLowerCase().trim();
  let pool = DB.medical;
  if (currentUser && currentUser.role === 'doctor') {
    pool = pool.filter(r => isDoctorMedicalRecord(r, currentUser.name));
  }
  renderMedical(pool.filter(r =>
    r.patientName.toLowerCase().includes(q) || r.patientId.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q)
  ));
}

async function addPrescription(e) {
  e.preventDefault();
  if (currentUser.role !== 'doctor') {
    showToast('Permission Denied: Only Doctors / Radiologists can issue prescriptions, case summaries, and medical records.', 'error');
    return;
  }
  const patSel = document.getElementById('rx-patient');
  const docSel = document.getElementById('rx-doctor');

  // Verify patient is assigned to this doctor if doctor role
  if (currentUser.role === 'doctor') {
    const selectedPat = DB.patients.find(p => p.id === patSel.value);
    if (!selectedPat || !isAssignedToDoctor(selectedPat, currentUser.name)) {
      showToast('Access Denied: You can only issue prescriptions for your assigned patients.', 'error');
      return;
    }
  }

  const docObj = DB.doctors.find(d => 
    d.name.toLowerCase().includes(docSel.value.toLowerCase()) || 
    (currentUser.role === 'doctor' && isAssignedToDoctor({ assignedDoctor: d.name }, currentUser.name))
  );
  const docId = docObj ? docObj.id : (currentUser.role === 'doctor' ? 'D001' : docSel.value);
  const docName = (currentUser.role === 'doctor') ? currentUser.name : docSel.options[docSel.selectedIndex].text.split(' –')[0];

  const r = {
    id:          'MR' + String(++counters.MR).padStart(3,'0'),
    patientId:   patSel.value,
    patientName: patSel.options[patSel.selectedIndex].text.split(' (')[0],
    doctorId:    docId,
    doctorName:  docName,
    diagnosis:   document.getElementById('rx-diagnosis').value.trim(),
    caseSummary: document.getElementById('rx-case-summary').value.trim(),
    medicines:   document.getElementById('rx-medicines').value.trim(),
    tests:       document.getElementById('rx-tests').value.trim(),
    treatment:   document.getElementById('rx-treatment').value.trim(),
    notes:       document.getElementById('rx-notes').value.trim(),
    date:        today(),
  };

  try {
    const res = await fetch(`${API_BASE}/medical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(r)
    });
    if (res.ok) {
      const saved = await res.json();
      r.id = saved.id;
    }
  } catch(err) {
    console.warn('API medical record save failed:', err);
  }

  DB.medical.push(r);
  closeModal('modal-add-prescription');
  document.getElementById('form-add-prescription').reset();
  renderMedical();
  showToast('Medical record & prescription saved!', 'success');
}

function viewMedical(id) {
  const r = DB.medical.find(x => x.id === id);
  if (!r) return;
  if (currentUser && currentUser.role === 'doctor' && !isDoctorMedicalRecord(r, currentUser.name)) {
    showToast('Access Denied: You can only view clinical records of patients assigned to you.', 'error');
    return;
  }
  document.getElementById('detail-modal-title').textContent = `Medical Record ${r.id}`;
  document.getElementById('detail-modal-body').innerHTML = `
    <div class="detail-grid" style="margin-bottom:20px;">
      <div class="detail-item"><div class="label">Record ID</div><div class="value">${r.id}</div></div>
      <div class="detail-item"><div class="label">Date</div><div class="value">${formatDate(r.date)}</div></div>
      <div class="detail-item"><div class="label">Patient</div><div class="value">${r.patientName} (${r.patientId})</div></div>
      <div class="detail-item"><div class="label">Doctor</div><div class="value">${r.doctorName}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Diagnosis</div><div class="value">${r.diagnosis}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Case Summary</div><div class="value">${r.caseSummary || '—'}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Prescribed Medicines</div><div class="value">${r.medicines || '—'}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Diagnostic Tests Ordered</div><div class="value">${r.tests || '—'}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Treatment Details</div><div class="value">${r.treatment || '—'}</div></div>
      <div class="detail-item" style="grid-column:span 2"><div class="label">Doctor Notes</div><div class="value">${r.notes || '—'}</div></div>
    </div>`;
  openModal('modal-view-detail');
}

/* ══════════════════════════════════════════════
   PHARMACY RENDER
══════════════════════════════════════════════ */
function renderPharmacy(list) {
  const role = currentUser ? currentUser.role : '';
  const data = list || DB.medicines;
  const body = document.getElementById('pharmacy-tbody');
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="9" class="empty-cell">No medicines found.</td></tr>`;
    return;
  }
  body.innerHTML = data.map(m => {
    const statusCls = m.status === 'In Stock' ? 'badge-green' : m.status === 'Low Stock' ? 'badge-amber' : 'badge-red';
    return `<tr>
      <td><strong>${m.id}</strong></td>
      <td>${m.name}</td>
      <td>${m.category}</td>
      <td>${m.qty}</td>
      <td>${formatDate(m.expiry)}</td>
      <td>₹${Number(m.price).toFixed(2)}</td>
      <td>${m.storage || '—'}</td>
      <td><span class="badge ${statusCls}">${m.status}</span></td>
      <td>
        ${role === 'pharmacist' ? `
          <button class="btn-icon" title="Update Stock" onclick="updateStock('${m.id}')">📦</button>
          <button class="btn-icon danger" title="Delete" onclick="deleteRecord('medicines','${m.id}', renderPharmacy)">🗑️</button>
        ` : '<span style="color:var(--text-muted);font-size:0.8rem;">View Only</span>'}
      </td>
    </tr>`;
  }).join('');
}

function filterMedicines() {
  const q = document.getElementById('pharmacy-search').value.toLowerCase();
  renderPharmacy(DB.medicines.filter(m =>
    m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
  ));
}

async function addMedicine(e) {
  e.preventDefault();
  if (currentUser.role !== 'pharmacist') {
    showToast('Permission Denied: Medicine stock is managed exclusively by the Pharmacist.', 'error');
    return;
  }
  const qty = parseInt(document.getElementById('m-qty').value);
  const minQty = parseInt(document.getElementById('m-min-qty').value) || 20;
  const m = {
    id:       'MED' + String(++counters.MED).padStart(3,'0'),
    name:     document.getElementById('m-name').value.trim(),
    category: document.getElementById('m-category').value,
    qty,
    price:    parseFloat(document.getElementById('m-price').value),
    expiry:   document.getElementById('m-expiry').value,
    mfr:      document.getElementById('m-mfr').value.trim(),
    storage:  document.getElementById('m-storage').value.trim(),
    minQty,
    status:   qty === 0 ? 'Out of Stock' : qty < minQty ? 'Low Stock' : 'In Stock',
  };

  try {
    const res = await fetch(`${API_BASE}/medicines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m)
    });
    if (res.ok) {
      const saved = await res.json();
      m.id = saved.id;
    }
  } catch(err) { console.warn(err); }

  DB.medicines.push(m);
  populateDropdowns();
  closeModal('modal-add-medicine');
  document.getElementById('form-add-medicine').reset();
  renderPharmacy();
  showToast(`${m.name} added to stock!`, 'success');
}

async function updateStock(id) {
  if (currentUser.role !== 'pharmacist') {
    showToast('Permission Denied: Medicine stock can only be updated by the Pharmacist.', 'error');
    return;
  }
  const m = DB.medicines.find(x => x.id === id);
  if (!m) return;
  const newQty = prompt(`Update stock for ${m.name}\nCurrent quantity: ${m.qty}\nEnter new quantity:`);
  if (newQty === null || newQty.trim() === '') return;
  const qty = parseInt(newQty);
  if (isNaN(qty) || qty < 0) { showToast('Invalid quantity.', 'error'); return; }
  m.qty    = qty;
  m.status = qty === 0 ? 'Out of Stock' : qty < 20 ? 'Low Stock' : 'In Stock';

  try {
    await fetch(`${API_BASE}/medicines/${id}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qty })
    });
  } catch(err) { console.warn(err); }

  renderPharmacy();
  showToast(`Stock updated for ${m.name}: ${qty} units`, 'success');
}

/* ══════════════════════════════════════════════
   BILLING RENDER
══════════════════════════════════════════════ */
function renderBilling(list) {
  const role = currentUser ? currentUser.role : '';
  const data = list || DB.bills;
  const body = document.getElementById('billing-tbody');
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="9" class="empty-cell">No bills found.</td></tr>`;
    return;
  }
  body.innerHTML = data.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>${b.patientName}</td>
      <td>${formatDate(b.date)}</td>
      <td>₹${Number(b.consultation).toFixed(2)}</td>
      <td>₹${Number(b.medicine).toFixed(2)}</td>
      <td>₹${Number(b.tests).toFixed(2)}</td>
      <td><strong>₹${Number(b.total).toFixed(2)}</strong></td>
      <td><span class="badge badge-${b.status==='Paid'?'green':'amber'}">${b.status}</span></td>
      <td>
        <button class="btn-icon" title="View Bill" onclick="viewBill('${b.id}')">👁️</button>
        ${(role === 'registration' && b.status==='Pending') ? `<button class="btn-icon" title="Mark Paid" onclick="markPaid('${b.id}')">✅</button>` : ''}
        ${role === 'registration' ? `<button class="btn-icon danger" title="Delete" onclick="deleteRecord('bills','${b.id}', renderBilling)">🗑️</button>` : ''}
      </td>
    </tr>`).join('');
}

function filterBills() {
  const q = document.getElementById('billing-search').value.toLowerCase();
  renderBilling(DB.bills.filter(b =>
    b.patientName.toLowerCase().includes(q) || b.id.toLowerCase().includes(q)
  ));
}

async function addBill(e) {
  e.preventDefault();
  if (currentUser.role !== 'registration') {
    showToast('Permission Denied: Billing generation is handled exclusively by Registration Staff at desk.', 'error');
    return;
  }
  const patSel = document.getElementById('b-patient');
  const consult = parseFloat(document.getElementById('b-consult').value)||0;
  const med     = parseFloat(document.getElementById('b-medicine').value)||0;
  const tests   = parseFloat(document.getElementById('b-tests').value)||0;
  const other   = parseFloat(document.getElementById('b-other').value)||0;
  const b = {
    id:          'B' + String(++counters.B).padStart(3,'0'),
    patientId:   patSel.value,
    patientName: patSel.options[patSel.selectedIndex].text.split(' (')[0],
    date:        document.getElementById('b-date').value,
    consultation: consult,
    medicine:    med,
    tests,
    other,
    total:       consult + med + tests + other,
    status:      'Pending',
  };

  try {
    const res = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b)
    });
    if (res.ok) {
      const saved = await res.json();
      b.id = saved.id;
    }
  } catch(err) { console.warn(err); }

  DB.bills.push(b);
  closeModal('modal-add-bill');
  document.getElementById('form-add-bill').reset();
  document.getElementById('bill-total-preview').textContent = '0.00';
  renderBilling();
  showToast(`Bill ${b.id} generated for ${b.patientName}!`, 'success');
}

async function markPaid(id) {
  const b = DB.bills.find(x => x.id === id);
  if (b) {
    b.status = 'Paid';
    try {
      await fetch(`${API_BASE}/bills/${id}/pay`, { method: 'PUT' });
    } catch(err) { console.warn(err); }
    renderBilling();
    showToast('Bill marked as paid.', 'success');
  }
}

function viewBill(id) {
  const b = DB.bills.find(x => x.id === id);
  if (!b) return;
  document.getElementById('detail-modal-title').textContent = `Invoice ${b.id}`;
  document.getElementById('detail-modal-body').innerHTML = `
    <div style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:#fff;padding:20px;border-radius:10px;margin-bottom:20px;">
      <div style="font-size:1.3rem;font-weight:800;">HOSPITAL INVOICE</div>
      <div style="opacity:0.85;font-size:0.85rem;margin-top:4px;">Bill ID: ${b.id} &nbsp;·&nbsp; Date: ${formatDate(b.date)}</div>
    </div>
    <div class="detail-grid" style="margin-bottom:20px;">
      <div class="detail-item"><div class="label">Patient</div><div class="value">${b.patientName}</div></div>
      <div class="detail-item"><div class="label">Status</div><div class="value"><span class="badge badge-${b.status==='Paid'?'green':'amber'}">${b.status}</span></div></div>
    </div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <tr style="background:#f8fafc;"><th style="padding:10px;text-align:left;font-size:0.8rem;color:var(--text-muted);">Description</th><th style="padding:10px;text-align:right;font-size:0.8rem;color:var(--text-muted);">Amount</th></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:10px;">Consultation Fee</td><td style="padding:10px;text-align:right;">₹${Number(b.consultation).toFixed(2)}</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:10px;">Medicine Charges</td><td style="padding:10px;text-align:right;">₹${Number(b.medicine).toFixed(2)}</td></tr>
      <tr style="border-bottom:1px solid var(--border)"><td style="padding:10px;">Test Charges</td><td style="padding:10px;text-align:right;">₹${Number(b.tests).toFixed(2)}</td></tr>
      ${b.other ? `<tr style="border-bottom:1px solid var(--border)"><td style="padding:10px;">Other Charges</td><td style="padding:10px;text-align:right;">₹${Number(b.other).toFixed(2)}</td></tr>` : ''}
      <tr style="background:#f0f9ff;font-weight:700;"><td style="padding:12px;font-size:1rem;">TOTAL</td><td style="padding:12px;text-align:right;font-size:1rem;color:var(--primary);">₹${Number(b.total).toFixed(2)}</td></tr>
    </table>`;
  openModal('modal-view-detail');
}

/* ══════════════════════════════════════════════
   DOCTORS RENDER
══════════════════════════════════════════════ */
function renderDoctors(list) {
  const data = list || DB.doctors;
  const body = document.getElementById('doctors-tbody');
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="6" class="empty-cell">No doctors found.</td></tr>`;
    return;
  }
  body.innerHTML = data.map(d => `
    <tr>
      <td><strong>${d.id}</strong></td>
      <td>${d.name}</td>
      <td>${d.spec}</td>
      <td>${d.phone}</td>
      <td><span class="badge badge-${d.status==='Available'?'green':'amber'}">${d.status}</span></td>
      <td>
        <button class="btn-icon" title="Toggle Availability" onclick="toggleDoctorStatus('${d.id}')">🔄</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteRecord('doctors','${d.id}', renderDoctors)">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterDoctors() {
  const q = document.getElementById('doctor-search').value.toLowerCase();
  renderDoctors(DB.doctors.filter(d =>
    d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q)
  ));
}

async function addDoctor(e) {
  e.preventDefault();
  if (currentUser.role !== 'administrator') {
    showToast('Permission Denied: Only Administrator can prepare and manage doctor schedules.', 'error');
    return;
  }
  const d = {
    id:     'D' + String(++counters.D).padStart(3,'0'),
    name:   document.getElementById('d-name').value.trim(),
    spec:   document.getElementById('d-spec').value.trim(),
    phone:  document.getElementById('d-phone').value.trim(),
    email:  document.getElementById('d-email').value.trim(),
    days:   document.getElementById('d-days').value.trim(),
    status: 'Available',
  };

  try {
    const res = await fetch(`${API_BASE}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    if (res.ok) {
      const saved = await res.json();
      d.id = saved.id;
    }
  } catch(err) { console.warn(err); }

  DB.doctors.push(d);
  populateDropdowns();
  closeModal('modal-add-doctor');
  document.getElementById('form-add-doctor').reset();
  renderDoctors();
  showToast(`${d.name} added!`, 'success');
}

async function toggleDoctorStatus(id) {
  const d = DB.doctors.find(x => x.id === id);
  if (d) {
    d.status = d.status === 'Available' ? 'On Leave' : 'Available';
    try {
      await fetch(`${API_BASE}/doctors/${id}/toggle-status`, { method: 'PUT' });
    } catch(err) { console.warn(err); }
    populateDropdowns();
    renderDoctors();
    showToast(`${d.name} status: ${d.status}`, 'info');
  }
}

/* ══════════════════════════════════════════════
   USERS RENDER
══════════════════════════════════════════════ */
function renderUsers() {
  const body = document.getElementById('users-tbody');
  body.innerHTML = DB.users.map(u => `
    <tr>
      <td><strong>${u.id}</strong></td>
      <td>${u.username}</td>
      <td><span class="badge badge-${roleBadge(u.role)}">${ROLE_CONFIG[u.role]?.label || u.role}</span></td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><span class="badge badge-${u.status==='Active'?'green':'red'}">${u.status}</span></td>
      <td>
        <button class="btn-icon" title="Toggle Status" onclick="toggleUserStatus('${u.id}')">🔄</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteRecord('users','${u.id}', renderUsers)">🗑️</button>
      </td>
    </tr>`).join('');
}

async function addUser(e) {
  e.preventDefault();
  if (currentUser.role !== 'administrator') {
    showToast('Permission Denied: Only Administrator creates user accounts.', 'error');
    return;
  }
  const u = {
    id:       'U' + String(++counters.U).padStart(3,'0'),
    name:     document.getElementById('u-name').value.trim(),
    username: document.getElementById('u-username').value.trim(),
    email:    document.getElementById('u-email').value.trim(),
    role:     document.getElementById('u-role').value,
    status:   'Active',
    password: 'user123',
  };

  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(u)
    });
    if (res.ok) {
      const saved = await res.json();
      u.id = saved.id;
    }
  } catch(err) { console.warn(err); }

  DB.users.push(u);
  closeModal('modal-add-user');
  document.getElementById('form-add-user').reset();
  renderUsers();
  showToast(`User ${u.username} created!`, 'success');
}

async function toggleUserStatus(id) {
  const u = DB.users.find(x => x.id === id);
  if (u) {
    u.status = u.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch(`${API_BASE}/users/${id}/toggle-status`, { method: 'PUT' });
    } catch(err) { console.warn(err); }
    renderUsers();
  }
}

/* ══════════════════════════════════════════════
   DEPARTMENTS (Administrator)
══════════════════════════════════════════════ */
function renderDepartments() {
  const body = document.getElementById('departments-tbody');
  if (!DB.departments.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty-cell">No departments found.</td></tr>`;
    return;
  }
  body.innerHTML = DB.departments.map(d => `
    <tr>
      <td><strong>${d.id}</strong></td>
      <td>${d.name}</td>
      <td>${d.head || '—'}</td>
      <td>${d.beds}</td>
      <td>${d.location || '—'}</td>
      <td><span class="badge badge-${d.status==='Active'?'green':'red'}">${d.status}</span></td>
      <td>
        <button class="btn-icon" title="Toggle Status" onclick="toggleDeptStatus('${d.id}')">🔄</button>
        <button class="btn-icon danger" title="Delete" onclick="deleteRecord('departments','${d.id}', renderDepartments)">🗑️</button>
      </td>
    </tr>`).join('');
}

async function addDepartment(e) {
  e.preventDefault();
  if (currentUser.role !== 'administrator') {
    showToast('Permission Denied: Only Administrator can maintain hospital departments.', 'error');
    return;
  }
  const headSel = document.getElementById('dept-head');
  const d = {
    id:       'DEPT' + String(++counters.DEPT).padStart(2,'0'),
    name:     document.getElementById('dept-name').value.trim(),
    head:     headSel.options[headSel.selectedIndex].text,
    beds:     parseInt(document.getElementById('dept-beds').value) || 0,
    location: document.getElementById('dept-location').value.trim(),
    status:   'Active',
  };

  try {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d)
    });
    if (res.ok) {
      const saved = await res.json();
      d.id = saved.id;
    }
  } catch(err) { console.warn(err); }

  DB.departments.push(d);
  populateDropdowns();
  closeModal('modal-add-department');
  document.getElementById('form-add-department').reset();
  renderDepartments();
  showToast(`Department "${d.name}" added!`, 'success');
}

async function toggleDeptStatus(id) {
  const d = DB.departments.find(x => x.id === id);
  if (d) {
    d.status = d.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await fetch(`${API_BASE}/departments/${id}/toggle-status`, { method: 'PUT' });
    } catch(err) { console.warn(err); }
    renderDepartments();
    showToast(`${d.name} is now ${d.status}.`, 'info');
  }
}

async function dispenseMedicine(e) {
  e.preventDefault();
  if (currentUser.role !== 'pharmacist') {
    showToast('Permission Denied: Medicine dispensing is restricted exclusively to Pharmacists.', 'error');
    return;
  }
  const patSel  = document.getElementById('disp-patient');
  const medSel  = document.getElementById('disp-medicine');
  const qty     = parseInt(document.getElementById('disp-qty').value);
  const medId   = medSel.value;
  const medicine = DB.medicines.find(m => m.id === medId);

  if (!medicine) { showToast('Medicine not found.', 'error'); return; }
  if (medicine.qty < qty) {
    showToast(`Insufficient stock! Available: ${medicine.qty} units.`, 'error');
    return;
  }

  // Deduct stock locally
  medicine.qty -= qty;
  medicine.status = medicine.qty === 0 ? 'Out of Stock' : medicine.qty < (medicine.minQty||20) ? 'Low Stock' : 'In Stock';

  const log = {
    id:           'DL' + String(++counters.DL).padStart(3,'0'),
    patientId:    patSel.value,
    patientName:  patSel.options[patSel.selectedIndex].text.split(' (')[0],
    medicineId:   medId,
    medicineName: medicine.name,
    qty,
    ref:          document.getElementById('disp-ref').value.trim(),
    remarks:      document.getElementById('disp-remarks').value.trim(),
    dispensedBy:  currentUser.username,
    datetime:     new Date().toLocaleString('en-IN'),
  };

  try {
    const res = await fetch(`${API_BASE}/dispense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log)
    });
    if (res.ok) {
      const saved = await res.json();
      log.id = saved.id;
    }
  } catch(err) { console.warn(err); }

  DB.dispenseLog.push(log);
  populateDropdowns();
  closeModal('modal-dispense');
  document.getElementById('form-dispense').reset();
  renderDispenseLog();
  showToast(`✅ Dispensed ${qty} units of ${medicine.name} to ${log.patientName}`, 'success');
}

function renderDispenseLog(list) {
  const data = list || DB.dispenseLog;
  const body = document.getElementById('dispense-tbody');
  if (!data.length) {
    body.innerHTML = `<tr><td colspan="7" class="empty-cell">No dispense records yet.</td></tr>`;
    return;
  }
  body.innerHTML = [...data].reverse().map(d => `
    <tr>
      <td><strong>${d.id}</strong></td>
      <td>${d.patientName}</td>
      <td>${d.medicineName}</td>
      <td>${d.qty} units</td>
      <td>${d.ref || '—'}</td>
      <td>${d.dispensedBy}</td>
      <td>${d.datetime}</td>
    </tr>`).join('');
}

function filterDispense() {
  const q = document.getElementById('dispense-search').value.toLowerCase();
  renderDispenseLog(DB.dispenseLog.filter(d =>
    d.patientName.toLowerCase().includes(q) || d.medicineName.toLowerCase().includes(q) || d.id.toLowerCase().includes(q)
  ));
}

/* ══════════════════════════════════════════════
   PATIENT HISTORY
══════════════════════════════════════════════ */
function searchHistory() {
  const q = document.getElementById('history-search').value.toLowerCase().trim();
  const result  = document.getElementById('history-result');
  const empty   = document.getElementById('history-empty');

  if (!q) {
    result.style.display = 'none';
    empty.style.display = 'block';
    empty.querySelector('p').textContent = (currentUser && currentUser.role === 'doctor')
      ? 'Search for one of your assigned patients to view their complete history'
      : 'Search for a patient to view their complete history';
    return;
  }

  // Doctor role: Check if patient belongs to another doctor
  if (currentUser && currentUser.role === 'doctor') {
    const unassignedPatient = DB.patients.find(p =>
      (p.name.toLowerCase().includes(q) || p.id.toLowerCase() === q || (p.phone && p.phone.includes(q))) &&
      !isAssignedToDoctor(p, currentUser.name)
    );
    if (unassignedPatient) {
      result.style.display = 'none';
      empty.style.display = 'block';
      empty.querySelector('p').innerHTML = `
        <div style="max-width:520px;margin:12px auto;padding:16px 20px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:10px;text-align:left;">
          <div style="font-weight:700;color:#b91c1c;margin-bottom:6px;display:flex;align-items:center;gap:8px;font-size:0.95rem;">
            ⚠️ Access Restricted: Confidential Patient History
          </div>
          <div style="font-size:0.88rem;color:var(--text-primary);line-height:1.5;">
            Patient <strong>${unassignedPatient.name}</strong> (${unassignedPatient.id}) is assigned to <strong>${unassignedPatient.assignedDoctor || 'another physician'}</strong>.
            <br><br>
            Per HMIS role permissions and clinical confidentiality, doctors are strictly restricted to accessing records and history of <em>their own assigned patients</em>.
          </div>
        </div>
      `;
      return;
    }
  }

  let pool = DB.patients;
  if (currentUser && currentUser.role === 'doctor') {
    pool = pool.filter(p => isAssignedToDoctor(p, currentUser.name));
  }

  const patient = pool.find(p =>
    p.name.toLowerCase().includes(q) || p.id.toLowerCase() === q || (p.phone && p.phone.includes(q))
  );

  if (!patient) {
    result.style.display = 'none';
    empty.style.display = 'block';
    empty.querySelector('p').textContent = (currentUser && currentUser.role === 'doctor')
      ? 'No matching patient found among your assigned patients.'
      : 'No patient found. Try a different name or ID.';
    return;
  }

  empty.style.display = 'none';
  result.style.display = 'block';

  const records  = DB.medical.filter(r => r.patientId === patient.id);
  const appts    = DB.appointments.filter(a => a.patientId === patient.id);
  const bills    = DB.bills.filter(b => b.patientId === patient.id);
  const totalPaid = bills.filter(b=>b.status==='Paid').reduce((s,b)=>s+b.total,0);

  result.innerHTML = `
    <div class="history-header">
      <h3>${patient.name}</h3>
      <p>${patient.id} &nbsp;·&nbsp; ${patient.gender}, ${patient.age||calcAge(patient.dob)} yrs &nbsp;·&nbsp; Blood: ${patient.blood||'N/A'} &nbsp;·&nbsp; 📞 ${patient.phone} &nbsp;·&nbsp; 🩺 Doctor: ${patient.assignedDoctor || '—'}</p>
    </div>
    <div class="history-meta">
      <div class="history-meta-item"><div class="label">Registered</div><div class="value">${formatDate(patient.regDate)}</div></div>
      <div class="history-meta-item"><div class="label">Total Visits</div><div class="value">${appts.length}</div></div>
      <div class="history-meta-item"><div class="label">Medical Records</div><div class="value">${records.length}</div></div>
      <div class="history-meta-item"><div class="label">Total Paid</div><div class="value">₹${totalPaid.toFixed(2)}</div></div>
      <div class="history-meta-item"><div class="label">Address</div><div class="value">${patient.address||'—'}</div></div>
      <div class="history-meta-item"><div class="label">Emergency</div><div class="value">${patient.emgName||'—'} (${patient.emgPhone||'—'})</div></div>
    </div>
    <div class="history-section">
      <h4>Medical Records & Prescriptions (${records.length})</h4>
      ${records.length ? records.map(r=>`
        <div class="record-item">
          <div class="record-date">${formatDate(r.date)} &nbsp;·&nbsp; ${r.doctorName}</div>
          <div class="record-doctor"><em>${r.diagnosis}</em></div>
          ${r.caseSummary ? `<div class="record-diagnosis" style="margin-top:4px;">📋 <strong>Case Summary:</strong> ${r.caseSummary}</div>` : ''}
          ${r.treatment   ? `<div class="record-diagnosis" style="margin-top:4px;">🩺 <strong>Treatment:</strong> ${r.treatment}</div>` : ''}
          ${r.medicines   ? `<div class="record-meds" style="margin-top:4px;">💊 <strong>Medicines:</strong> ${r.medicines}</div>` : ''}
          ${r.tests       ? `<div class="record-meds" style="margin-top:4px;">🔬 <strong>Tests:</strong> ${r.tests}</div>` : ''}
          ${r.notes       ? `<div class="record-diagnosis" style="margin-top:4px;">📝 <strong>Doctor Notes:</strong> ${r.notes}</div>` : ''}
        </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">No medical records found.</p>'}
    </div>
    <div class="history-section">
      <h4>Appointments (${appts.length})</h4>
      ${appts.length ? appts.map(a=>`
        <div class="record-item" style="border-left-color:var(--success)">
          <div class="record-date">${formatDate(a.date)} at ${a.time}</div>
          <div class="record-doctor">${a.doctorName}</div>
          <div class="record-diagnosis">${a.reason||'—'} &nbsp; <span class="badge badge-${statusBadgeClass(a.status)}">${a.status}</span></div>
        </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">No appointments found.</p>'}
    </div>
    <div class="history-section">
      <h4>Billing History (${bills.length})</h4>
      ${bills.length ? bills.map(b=>`
        <div class="record-item" style="border-left-color:var(--warning)">
          <div class="record-date">Bill ${b.id} &nbsp;·&nbsp; ${formatDate(b.date)}</div>
          <div class="record-doctor">Total: ₹${Number(b.total).toFixed(2)} &nbsp; <span class="badge badge-${b.status==='Paid'?'green':'amber'}">${b.status}</span></div>
          <div class="record-diagnosis">Consultation: ₹${b.consultation} | Medicine: ₹${b.medicine} | Tests: ₹${b.tests}</div>
        </div>`).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">No billing records found.</p>'}
    </div>`;
}

function clearHistory() {
  document.getElementById('history-result').style.display = 'none';
  document.getElementById('history-empty').style.display  = 'block';
  document.getElementById('history-empty').querySelector('p').textContent = (currentUser && currentUser.role === 'doctor')
    ? 'Search for one of your assigned patients to view their complete history'
    : 'Search for a patient to view their complete history';
  document.getElementById('history-search').value = '';
}

/* ══════════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════════ */
function openModal(id) {
  // Role-based permission guards
  if (currentUser) {
    const role = currentUser.role;
    if (id === 'modal-add-appointment' && role !== 'registration') {
      showToast('Permission Denied: Appointments are scheduled exclusively by Registration Staff.', 'error');
      return;
    }
    if (id === 'modal-add-patient' && role !== 'registration') {
      showToast('Permission Denied: Patient registration is handled exclusively by Registration Staff.', 'error');
      return;
    }
    if (id === 'modal-add-prescription' && role !== 'doctor') {
      showToast('Permission Denied: Only Doctors / Radiologists can issue prescriptions and update case summaries.', 'error');
      return;
    }
    if (id === 'modal-add-medicine' && role !== 'pharmacist') {
      showToast('Permission Denied: Medicine stock is managed exclusively by the Pharmacist.', 'error');
      return;
    }
    if (id === 'modal-add-bill' && role !== 'registration') {
      showToast('Permission Denied: Billing generation is restricted to Registration Staff.', 'error');
      return;
    }
    if (['modal-add-doctor', 'modal-add-user', 'modal-add-department'].includes(id) && role !== 'administrator') {
      showToast('Permission Denied: Only Administrator has access to this management function.', 'error');
      return;
    }
  }

  const el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeModal(this.id);
  });
});

/* ══════════════════════════════════════════════
   SIDEBAR TOGGLE
══════════════════════════════════════════════ */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const wrapper = document.querySelector('.main-wrapper');
  if (window.innerWidth <= 900) {
    sidebar.classList.toggle('open');
  } else {
    sidebar.classList.toggle('collapsed');
    wrapper.classList.toggle('expanded');
  }
}

/* ══════════════════════════════════════════════
   GENERAL DELETE
══════════════════════════════════════════════ */
async function deleteRecord(collection, id, rerenderFn) {
  if (currentUser) {
    const role = currentUser.role;
    if (collection === 'patients' && role !== 'registration') {
      showToast('Permission Denied: Patient records can only be deleted by Registration Staff.', 'error');
      return;
    }
    if (collection === 'medical' && role !== 'doctor') {
      showToast('Permission Denied: Only Doctors can delete medical records.', 'error');
      return;
    }
    if (collection === 'medicines' && role !== 'pharmacist') {
      showToast('Permission Denied: Only Pharmacist can modify pharmacy stock.', 'error');
      return;
    }
    if (collection === 'bills' && role !== 'registration') {
      showToast('Permission Denied: Invoices can only be deleted by Registration Staff.', 'error');
      return;
    }
    if (['doctors', 'departments', 'users'].includes(collection) && role !== 'administrator') {
      showToast('Permission Denied: Only Administrator can manage system records.', 'error');
      return;
    }
  }

  if (!confirm('Are you sure you want to delete this record?')) return;

  try {
    const endpointMap = {
      patients: 'patients',
      appointments: 'appointments',
      medical: 'medical',
      medicines: 'medicines',
      bills: 'bills',
      doctors: 'doctors',
      departments: 'departments',
      users: 'users'
    };
    if (endpointMap[collection]) {
      await fetch(`${API_BASE}/${endpointMap[collection]}/${id}`, { method: 'DELETE' });
    }
  } catch(err) {
    console.warn('API delete call failed:', err);
  }

  DB[collection] = DB[collection].filter(x => x.id !== id);
  rerenderFn();
  showToast('Record deleted.', 'info');
}

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

/* ══════════════════════════════════════════════
   BILL TOTAL LIVE PREVIEW
══════════════════════════════════════════════ */
['b-consult','b-medicine','b-tests','b-other'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateBillPreview);
});

function updateBillPreview() {
  const sum = ['b-consult','b-medicine','b-tests','b-other']
    .reduce((acc, id) => acc + (parseFloat(document.getElementById(id).value)||0), 0);
  document.getElementById('bill-total-preview').textContent = sum.toFixed(2);
}

/* ══════════════════════════════════════════════
   UTILITY HELPERS
══════════════════════════════════════════════ */
function today() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

function calcAge(dob) {
  if (!dob) return '—';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function statusBadgeClass(status) {
  const map = {
    'Scheduled': 'blue',
    'Completed': 'green',
    'Cancelled': 'red',
    'Pending':   'amber',
    'Paid':      'green',
  };
  return map[status] || 'gray';
}

function roleBadge(role) {
  const map = {
    administrator: 'purple',
    doctor:        'green',
    pharmacist:    'amber',
    registration:  'blue',
  };
  return map[role] || 'gray';
}

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
seedData();
checkBackendStatus();
