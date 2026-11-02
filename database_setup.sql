-- ============================================================
-- Hospital Management Information System (HMIS)
-- MySQL Database Setup & Seed Script
-- Compatible with MySQL 8.0+ / MariaDB 10.4+
-- ============================================================

CREATE DATABASE IF NOT EXISTS `hmis_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `hmis_db`;

-- ------------------------------------------------------------
-- 1. Table: users
-- Stores system user accounts for all roles
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(20) NOT NULL,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. Table: departments
-- Hospital clinical departments and bed capacities
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `head` VARCHAR(100) NULL,
  `beds` INT NOT NULL DEFAULT 0,
  `location` VARCHAR(150) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. Table: doctors
-- Doctor profiles, specialties, schedules and status
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `doctors`;
CREATE TABLE `doctors` (
  `id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `spec` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `days` VARCHAR(100) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Available',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. Table: patients
-- Patient registrations, demographics and emergency contacts
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `dob` VARCHAR(20) NULL,
  `age` INT NULL,
  `gender` VARCHAR(20) NULL,
  `dept` VARCHAR(100) NULL,
  `assigned_doctor` VARCHAR(100) NULL,
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  `blood` VARCHAR(10) NULL,
  `address` VARCHAR(255) NULL,
  `emg_name` VARCHAR(100) NULL,
  `emg_phone` VARCHAR(20) NULL,
  `reg_date` VARCHAR(20) NULL,
  PRIMARY KEY (`id`),
  INDEX idx_patient_name (`name`),
  INDEX idx_assigned_doc (`assigned_doctor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. Table: appointments
-- Outpatient consultations and appointments
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` VARCHAR(20) NOT NULL,
  `patient_id` VARCHAR(20) NOT NULL,
  `patient_name` VARCHAR(100) NOT NULL,
  `doctor_id` VARCHAR(20) NULL,
  `doctor_name` VARCHAR(100) NOT NULL,
  `date` VARCHAR(20) NOT NULL,
  `time` VARCHAR(20) NOT NULL,
  `reason` VARCHAR(255) NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
  PRIMARY KEY (`id`),
  INDEX idx_appt_patient (`patient_id`),
  INDEX idx_appt_doctor (`doctor_name`),
  INDEX idx_appt_date (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. Table: medical_records
-- Clinical diagnosis, treatment history and prescriptions
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `medical_records`;
CREATE TABLE `medical_records` (
  `id` VARCHAR(20) NOT NULL,
  `patient_id` VARCHAR(20) NOT NULL,
  `patient_name` VARCHAR(100) NOT NULL,
  `doctor_id` VARCHAR(20) NULL,
  `doctor_name` VARCHAR(100) NOT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `case_summary` TEXT NULL,
  `medicines` TEXT NULL,
  `tests` TEXT NULL,
  `treatment` TEXT NULL,
  `notes` TEXT NULL,
  `date` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX idx_med_patient (`patient_id`),
  INDEX idx_med_doctor (`doctor_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. Table: medicines
-- Pharmacy inventory, pricing, batch expiry and stock levels
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `medicines`;
CREATE TABLE `medicines` (
  `id` VARCHAR(20) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `qty` INT NOT NULL DEFAULT 0,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `expiry` VARCHAR(20) NULL,
  `mfr` VARCHAR(100) NULL,
  `storage` VARCHAR(100) NULL,
  `min_qty` INT NOT NULL DEFAULT 20,
  `status` VARCHAR(20) NOT NULL DEFAULT 'In Stock',
  PRIMARY KEY (`id`),
  INDEX idx_med_name (`name`),
  INDEX idx_med_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. Table: bills
-- Outpatient invoices, fee breakdown and payment status
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `bills`;
CREATE TABLE `bills` (
  `id` VARCHAR(20) NOT NULL,
  `patient_id` VARCHAR(20) NOT NULL,
  `patient_name` VARCHAR(100) NOT NULL,
  `date` VARCHAR(20) NOT NULL,
  `consultation` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `medicine` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tests` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `other` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  INDEX idx_bill_patient (`patient_id`),
  INDEX idx_bill_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. Table: dispense_log
-- Dispensing transactions performed by pharmacists
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `dispense_log`;
CREATE TABLE `dispense_log` (
  `id` VARCHAR(20) NOT NULL,
  `patient_id` VARCHAR(20) NOT NULL,
  `patient_name` VARCHAR(100) NOT NULL,
  `medicine_id` VARCHAR(20) NOT NULL,
  `medicine_name` VARCHAR(150) NOT NULL,
  `qty` INT NOT NULL,
  `ref` VARCHAR(50) NULL,
  `remarks` VARCHAR(255) NULL,
  `dispensed_by` VARCHAR(50) NOT NULL,
  `datetime` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX idx_disp_patient (`patient_id`),
  INDEX idx_disp_med (`medicine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA (Matching LOGIN_DETAILS.md and initial HMIS state)
-- ============================================================

-- 1. Users
INSERT INTO `users` (`id`, `username`, `password`, `role`, `name`, `email`, `phone`, `status`) VALUES
('U001', 'admin',    'admin123',  'administrator', 'Admin User',        'admin@hospital.com',  '9876540001', 'Active'),
('U002', 'drAnil',   'doctor123', 'doctor',        'Dr. Anil Sharma',   'anil@hospital.com',   '9876543210', 'Active'),
('U003', 'drPriya',  'doctor123', 'doctor',        'Dr. Priya Verma',   'priya@hospital.com',  '9876543211', 'Active'),
('U004', 'drRahul',  'doctor123', 'doctor',        'Dr. Rahul Mehta',   'rahul@hospital.com',  '9876543212', 'Active'),
('U005', 'drSunita', 'doctor123', 'doctor',        'Dr. Sunita Gupta',  'sunita@hospital.com', '9876543213', 'Active'),
('U006', 'drVikram', 'doctor123', 'doctor',        'Dr. Vikram Singh',  'vikram@hospital.com', '9876543214', 'Active'),
('U007', 'pharmRaj', 'pharm123',  'pharmacist',    'Rajni Pharma',      'rajni@hospital.com',  '9876540002', 'Active'),
('U008', 'regStaff', 'reg123',    'registration',  'Sita Kumari',       'sita@hospital.com',   '9876540003', 'Active');

-- 2. Departments
INSERT INTO `departments` (`id`, `name`, `head`, `beds`, `location`, `status`) VALUES
('DEPT01', 'Cardiology',       'Dr. Anil Sharma',  30, 'Floor 2, Block A', 'Active'),
('DEPT02', 'Neurology',        'Dr. Priya Verma',  20, 'Floor 3, Block B', 'Active'),
('DEPT03', 'Orthopedics',      'Dr. Rahul Mehta',  25, 'Floor 1, Block C', 'Active'),
('DEPT04', 'Pediatrics',       'Dr. Sunita Gupta', 15, 'Floor 4, Block A', 'Active'),
('DEPT05', 'General Medicine', 'Dr. Vikram Singh', 40, 'Floor 1, Block A', 'Active');

-- 3. Doctors
INSERT INTO `doctors` (`id`, `name`, `spec`, `phone`, `email`, `days`, `status`) VALUES
('D001', 'Dr. Anil Sharma',  'Cardiology',       '9876543210', 'anil@hospital.com',   'Mon, Wed, Fri', 'Available'),
('D002', 'Dr. Priya Verma',  'Neurology',        '9876543211', 'priya@hospital.com',  'Tue, Thu, Sat', 'Available'),
('D003', 'Dr. Rahul Mehta',  'Orthopedics',      '9876543212', 'rahul@hospital.com',  'Mon, Tue, Wed', 'Available'),
('D004', 'Dr. Sunita Gupta', 'Pediatrics',       '9876543213', 'sunita@hospital.com', 'All Weekdays',  'Available'),
('D005', 'Dr. Vikram Singh', 'General Medicine', '9876543214', 'vikram@hospital.com', 'Mon to Sat',    'On Leave');

-- 4. Patients
INSERT INTO `patients` (`id`, `name`, `dob`, `age`, `gender`, `dept`, `assigned_doctor`, `phone`, `email`, `blood`, `address`, `emg_name`, `emg_phone`, `reg_date`) VALUES
('P001', 'Rajesh Kumar',  '1985-04-12', 39, 'Male',   'Cardiology',       'Dr. Anil Sharma',  '9123456780', 'rajesh@gmail.com',  'B+',  '12 Gandhi Nagar, Delhi',    'Meena Kumar', '9123456781', '2024-01-15'),
('P002', 'Sunita Devi',   '1992-08-22', 32, 'Female', 'Neurology',        'Dr. Priya Verma',  '9123456781', 'sunita@gmail.com',  'O+',  '45 Nehru Colony, Jaipur',   'Ravi Devi',   '9123456782', '2024-02-03'),
('P003', 'Arjun Patel',   '2000-11-05', 24, 'Male',   'Orthopedics',      'Dr. Rahul Mehta',  '9123456782', 'arjun@gmail.com',   'A+',  '78 MG Road, Ahmedabad',     'Hema Patel',  '9123456783', '2024-03-10'),
('P004', 'Kavita Sharma', '1978-03-18', 46, 'Female', 'Pediatrics',       'Dr. Sunita Gupta', '9123456783', 'kavita@gmail.com',  'AB-', '90 Civil Lines, Agra',      'Arun Sharma', '9123456784', '2024-04-22'),
('P005', 'Mohammed Ali',  '1965-12-01', 59, 'Male',   'General Medicine', 'Dr. Vikram Singh', '9123456784', 'mali@gmail.com',    'O-',  '34 Station Road, Lucknow',  'Sara Ali',    '9123456785', '2024-05-07'),
('P006', 'Sunil Verma',   '1975-06-20', 49, 'Male',   'Cardiology',       'Dr. Anil Sharma',  '9123456785', 'sunil.v@gmail.com', 'A+',  '15 Ring Road, Delhi',        'Anita Verma', '9123456786', '2024-05-18');

-- 5. Appointments
INSERT INTO `appointments` (`id`, `patient_id`, `patient_name`, `doctor_id`, `doctor_name`, `date`, `time`, `reason`, `status`) VALUES
('A001', 'P001', 'Rajesh Kumar',  'D001', 'Dr. Anil Sharma',  CURDATE(), '09:00', 'Chest pain check-up',            'Scheduled'),
('A002', 'P002', 'Sunita Devi',   'D002', 'Dr. Priya Verma',  CURDATE(), '10:30', 'Headaches and dizziness',         'Completed'),
('A003', 'P003', 'Arjun Patel',   'D003', 'Dr. Rahul Mehta',  CURDATE(), '11:00', 'Knee injury follow-up',           'Scheduled'),
('A004', 'P004', 'Kavita Sharma', 'D004', 'Dr. Sunita Gupta', CURDATE(), '12:00', 'Child consultation & vaccination', 'Scheduled'),
('A005', 'P006', 'Sunil Verma',   'D001', 'Dr. Anil Sharma',  CURDATE(), '14:30', 'Cardiac rehabilitation follow-up', 'Scheduled'),
('A006', 'P005', 'Mohammed Ali',  'D005', 'Dr. Vikram Singh', CURDATE(), '15:30', 'General health evaluation',        'Scheduled');

-- 6. Medical Records
INSERT INTO `medical_records` (`id`, `patient_id`, `patient_name`, `doctor_id`, `doctor_name`, `diagnosis`, `case_summary`, `medicines`, `tests`, `treatment`, `notes`, `date`) VALUES
('MR001', 'P001', 'Rajesh Kumar',  'D001', 'Dr. Anil Sharma',  'Hypertension – Stage 1', 'Patient presents with elevated BP 150/95. History of hypertension for 3 years.', 'Amlodipine 5mg, Metoprolol 50mg', 'ECG, Blood Pressure Monitoring, Lipid Profile', 'Prescribed antihypertensives. Lifestyle modification advised.', 'Reduce sodium intake. Follow up in 2 weeks.', '2024-10-10'),
('MR002', 'P002', 'Sunita Devi',   'D002', 'Dr. Priya Verma',  'Migraine', 'Recurring episodes of severe headache with photophobia for 6 months.', 'Sumatriptan 50mg, Ibuprofen 400mg', 'MRI Brain, EEG', 'Prescribed triptans for acute attacks. Preventive therapy initiated.', 'Avoid bright lights and stress triggers.', '2024-10-12'),
('MR003', 'P003', 'Arjun Patel',   'D003', 'Dr. Rahul Mehta',  'Ligament sprain – right knee', 'Sports injury during football. Swelling and pain in right knee.', 'Diclofenac Gel, Calcium tablets', 'X-Ray Knee, MRI Knee', 'RICE protocol. Physiotherapy recommended for 3 weeks.', 'Rest, ice pack. No strenuous activity for 3 weeks.', '2024-10-15'),
('MR004', 'P006', 'Sunil Verma',   'D001', 'Dr. Anil Sharma',  'Coronary Artery Disease', 'Post-angioplasty routine evaluation. Stable vital signs.', 'Atorvastatin 40mg, Aspirin 75mg', 'Lipid Profile, Stress Echo', 'Stent patency maintained. Moderate aerobic activity prescribed.', 'Maintain low fat diet. Next visit in 1 month.', '2024-10-18'),
('MR005', 'P004', 'Kavita Sharma', 'D004', 'Dr. Sunita Gupta', 'Pediatric Bronchitis', 'Child presented with persistent cough and chest congestion. No wheezing.', 'Amoxicillin 250mg, Paracetamol 500mg', 'Chest X-Ray, Blood Count', '5-day antibiotic course and steam inhalation advised.', 'Warm fluids, monitor temperature. Review in 5 days.', '2024-10-19'),
('MR006', 'P005', 'Mohammed Ali',  'D005', 'Dr. Vikram Singh', 'Type 2 Diabetes Mellitus', 'Elevated fasting blood sugar 168 mg/dL with fatigue. Under care for 1 year.', 'Metformin 500mg', 'HbA1c, Fasting Blood Sugar, Lipid Profile', 'Oral hypoglycemic agent prescribed. Dietary glycemic control advised.', 'Follow diabetic diet plan. Walk 30 minutes daily.', '2024-10-20');

-- 7. Medicines
INSERT INTO `medicines` (`id`, `name`, `category`, `qty`, `price`, `expiry`, `mfr`, `storage`, `min_qty`, `status`) VALUES
('MED001', 'Paracetamol 500mg', 'Analgesic',  500,  2.50, '2026-12-31', 'Sun Pharma',     'Shelf A1',   50, 'In Stock'),
('MED002', 'Amoxicillin 250mg', 'Antibiotic', 200,  8.00, '2026-06-30', 'Cipla',          'Shelf B2',   30, 'In Stock'),
('MED003', 'Amlodipine 5mg',    'Cardiac',     15,  5.00, '2025-09-30', 'Dr. Reddys',     'Cabinet C',  20, 'Low Stock'),
('MED004', 'Metformin 500mg',   'Diabetic',   300,  3.50, '2027-03-31', 'Ranbaxy',        'Shelf A3',   40, 'In Stock'),
('MED005', 'Vitamin D3 60K IU', 'Vitamins',     0, 45.00, '2025-04-30', 'Mankind Pharma', 'Cold Store', 10, 'Out of Stock'),
('MED006', 'Ibuprofen 400mg',   'Analgesic',  180,  4.00, '2026-08-31', 'Abbott',         'Shelf A2',   30, 'In Stock');

-- 8. Bills
INSERT INTO `bills` (`id`, `patient_id`, `patient_name`, `date`, `consultation`, `medicine`, `tests`, `other`, `total`, `status`) VALUES
('B001', 'P001', 'Rajesh Kumar',  '2024-10-10', 500.00, 120.00,  800.00,   0.00, 1420.00, 'Paid'),
('B002', 'P002', 'Sunita Devi',   '2024-10-12', 800.00,  75.00, 3500.00,   0.00, 4375.00, 'Pending'),
('B003', 'P003', 'Arjun Patel',   '2024-10-15', 600.00, 250.00,  600.00, 100.00, 1550.00, 'Paid'),
('B004', 'P006', 'Sunil Verma',   '2024-10-18', 700.00, 310.00, 1200.00,   0.00, 2210.00, 'Paid'),
('B005', 'P004', 'Kavita Sharma', '2024-10-19', 400.00, 150.00,  400.00,   0.00,  950.00, 'Paid'),
('B006', 'P005', 'Mohammed Ali',  '2024-10-20', 500.00, 100.00,  700.00,   0.00, 1300.00, 'Paid');

-- 9. Dispense Log
INSERT INTO `dispense_log` (`id`, `patient_id`, `patient_name`, `medicine_id`, `medicine_name`, `qty`, `ref`, `remarks`, `dispensed_by`, `datetime`) VALUES
('DL001', 'P001', 'Rajesh Kumar', 'MED003', 'Amlodipine 5mg', 30, 'MR001', 'Routine prescription dispense', 'pharmRaj', '2024-10-10 10:15');
