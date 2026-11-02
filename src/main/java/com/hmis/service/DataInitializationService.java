package com.hmis.service;

import com.hmis.model.*;
import com.hmis.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;

@Service
public class DataInitializationService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final MedicineRepository medicineRepository;
    private final BillRepository billRepository;
    private final DispenseLogRepository dispenseLogRepository;

    public DataInitializationService(UserRepository userRepository,
                                     DepartmentRepository departmentRepository,
                                     DoctorRepository doctorRepository,
                                     PatientRepository patientRepository,
                                     AppointmentRepository appointmentRepository,
                                     MedicalRecordRepository medicalRecordRepository,
                                     MedicineRepository medicineRepository,
                                     BillRepository billRepository,
                                     DispenseLogRepository dispenseLogRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.medicineRepository = medicineRepository;
        this.billRepository = billRepository;
        this.dispenseLogRepository = dispenseLogRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("✅ HMIS database already seeded.");
            return;
        }

        System.out.println("🌱 Initializing HMIS database with default records...");

        // 1. Users (Matching LOGIN_DETAILS.md)
        userRepository.saveAll(Arrays.asList(
            new User("U001", "admin",    "admin123",  "administrator", "Admin User",        "admin@hospital.com",  "9876540001", "Active"),
            new User("U002", "drAnil",   "doctor123", "doctor",        "Dr. Anil Sharma",   "anil@hospital.com",   "9876543210", "Active"),
            new User("U003", "drPriya",  "doctor123", "doctor",        "Dr. Priya Verma",   "priya@hospital.com",  "9876543211", "Active"),
            new User("U004", "drRahul",  "doctor123", "doctor",        "Dr. Rahul Mehta",   "rahul@hospital.com",  "9876543212", "Active"),
            new User("U005", "drSunita", "doctor123", "doctor",        "Dr. Sunita Gupta",  "sunita@hospital.com", "9876543213", "Active"),
            new User("U006", "drVikram", "doctor123", "doctor",        "Dr. Vikram Singh",  "vikram@hospital.com", "9876543214", "Active"),
            new User("U007", "pharmRaj", "pharm123",  "pharmacist",    "Rajni Pharma",      "rajni@hospital.com",  "9876540002", "Active"),
            new User("U008", "regStaff", "reg123",    "registration",  "Sita Kumari",       "sita@hospital.com",   "9876540003", "Active")
        ));

        // 2. Departments
        departmentRepository.saveAll(Arrays.asList(
            new Department("DEPT01", "Cardiology",       "Dr. Anil Sharma",  30, "Floor 2, Block A", "Active"),
            new Department("DEPT02", "Neurology",        "Dr. Priya Verma",  20, "Floor 3, Block B", "Active"),
            new Department("DEPT03", "Orthopedics",      "Dr. Rahul Mehta",  25, "Floor 1, Block C", "Active"),
            new Department("DEPT04", "Pediatrics",       "Dr. Sunita Gupta", 15, "Floor 4, Block A", "Active"),
            new Department("DEPT05", "General Medicine", "Dr. Vikram Singh", 40, "Floor 1, Block A", "Active")
        ));

        // 3. Doctors
        doctorRepository.saveAll(Arrays.asList(
            new Doctor("D001", "Dr. Anil Sharma",  "Cardiology",       "9876543210", "anil@hospital.com",   "Mon, Wed, Fri", "Available"),
            new Doctor("D002", "Dr. Priya Verma",  "Neurology",        "9876543211", "priya@hospital.com",  "Tue, Thu, Sat", "Available"),
            new Doctor("D003", "Dr. Rahul Mehta",  "Orthopedics",      "9876543212", "rahul@hospital.com",  "Mon, Tue, Wed", "Available"),
            new Doctor("D004", "Dr. Sunita Gupta", "Pediatrics",       "9876543213", "sunita@hospital.com", "All Weekdays",  "Available"),
            new Doctor("D005", "Dr. Vikram Singh", "General Medicine", "9876543214", "vikram@hospital.com", "Mon to Sat",    "On Leave")
        ));

        // 4. Patients
        patientRepository.saveAll(Arrays.asList(
            new Patient("P001", "Rajesh Kumar",  "1985-04-12", 39, "Male",   "Cardiology",       "Dr. Anil Sharma",  "9123456780", "rajesh@gmail.com",  "B+",  "12 Gandhi Nagar, Delhi",    "Meena Kumar", "9123456781", "2024-01-15"),
            new Patient("P002", "Sunita Devi",   "1992-08-22", 32, "Female", "Neurology",        "Dr. Priya Verma",  "9123456781", "sunita@gmail.com",  "O+",  "45 Nehru Colony, Jaipur",   "Ravi Devi",   "9123456782", "2024-02-03"),
            new Patient("P003", "Arjun Patel",   "2000-11-05", 24, "Male",   "Orthopedics",      "Dr. Rahul Mehta",  "9123456782", "arjun@gmail.com",   "A+",  "78 MG Road, Ahmedabad",     "Hema Patel",  "9123456783", "2024-03-10"),
            new Patient("P004", "Kavita Sharma", "1978-03-18", 46, "Female", "Pediatrics",       "Dr. Sunita Gupta", "9123456783", "kavita@gmail.com",  "AB-", "90 Civil Lines, Agra",      "Arun Sharma", "9123456784", "2024-04-22"),
            new Patient("P005", "Mohammed Ali",  "1965-12-01", 59, "Male",   "General Medicine", "Dr. Vikram Singh", "9123456784", "mali@gmail.com",    "O-",  "34 Station Road, Lucknow",  "Sara Ali",    "9123456785", "2024-05-07"),
            new Patient("P006", "Sunil Verma",   "1975-06-20", 49, "Male",   "Cardiology",       "Dr. Anil Sharma",  "9123456785", "sunil.v@gmail.com", "A+",  "15 Ring Road, Delhi",        "Anita Verma", "9123456786", "2024-05-18")
        ));

        // 5. Appointments
        String today = LocalDate.now().toString();
        appointmentRepository.saveAll(Arrays.asList(
            new Appointment("A001", "P001", "Rajesh Kumar",  "D001", "Dr. Anil Sharma",  today, "09:00", "Chest pain check-up",            "Scheduled"),
            new Appointment("A002", "P002", "Sunita Devi",   "D002", "Dr. Priya Verma",  today, "10:30", "Headaches and dizziness",         "Completed"),
            new Appointment("A003", "P003", "Arjun Patel",   "D003", "Dr. Rahul Mehta",  today, "11:00", "Knee injury follow-up",           "Scheduled"),
            new Appointment("A004", "P004", "Kavita Sharma", "D004", "Dr. Sunita Gupta", today, "12:00", "Child consultation & vaccination", "Scheduled"),
            new Appointment("A005", "P006", "Sunil Verma",   "D001", "Dr. Anil Sharma",  today, "14:30", "Cardiac rehabilitation follow-up", "Scheduled"),
            new Appointment("A006", "P005", "Mohammed Ali",  "D005", "Dr. Vikram Singh", today, "15:30", "General health evaluation",        "Scheduled")
        ));

        // 6. Medical Records
        medicalRecordRepository.saveAll(Arrays.asList(
            new MedicalRecord("MR001", "P001", "Rajesh Kumar",  "D001", "Dr. Anil Sharma",  "Hypertension – Stage 1", "Patient presents with elevated BP 150/95. History of hypertension for 3 years.", "Amlodipine 5mg, Metoprolol 50mg", "ECG, Blood Pressure Monitoring, Lipid Profile", "Prescribed antihypertensives. Lifestyle modification advised.", "Reduce sodium intake. Follow up in 2 weeks.", "2024-10-10"),
            new MedicalRecord("MR002", "P002", "Sunita Devi",   "D002", "Dr. Priya Verma",  "Migraine", "Recurring episodes of severe headache with photophobia for 6 months.", "Sumatriptan 50mg, Ibuprofen 400mg", "MRI Brain, EEG", "Prescribed triptans for acute attacks. Preventive therapy initiated.", "Avoid bright lights and stress triggers.", "2024-10-12"),
            new MedicalRecord("MR003", "P003", "Arjun Patel",   "D003", "Dr. Rahul Mehta",  "Ligament sprain – right knee", "Sports injury during football. Swelling and pain in right knee.", "Diclofenac Gel, Calcium tablets", "X-Ray Knee, MRI Knee", "RICE protocol. Physiotherapy recommended for 3 weeks.", "Rest, ice pack. No strenuous activity for 3 weeks.", "2024-10-15"),
            new MedicalRecord("MR004", "P006", "Sunil Verma",   "D001", "Dr. Anil Sharma",  "Coronary Artery Disease", "Post-angioplasty routine evaluation. Stable vital signs.", "Atorvastatin 40mg, Aspirin 75mg", "Lipid Profile, Stress Echo", "Stent patency maintained. Moderate aerobic activity prescribed.", "Maintain low fat diet. Next visit in 1 month.", "2024-10-18"),
            new MedicalRecord("MR005", "P004", "Kavita Sharma", "D004", "Dr. Sunita Gupta", "Pediatric Bronchitis", "Child presented with persistent cough and chest congestion. No wheezing.", "Amoxicillin 250mg, Paracetamol 500mg", "Chest X-Ray, Blood Count", "5-day antibiotic course and steam inhalation advised.", "Warm fluids, monitor temperature. Review in 5 days.", "2024-10-19"),
            new MedicalRecord("MR006", "P005", "Mohammed Ali",  "D005", "Dr. Vikram Singh", "Type 2 Diabetes Mellitus", "Elevated fasting blood sugar 168 mg/dL with fatigue. Under care for 1 year.", "Metformin 500mg", "HbA1c, Fasting Blood Sugar, Lipid Profile", "Oral hypoglycemic agent prescribed. Dietary glycemic control advised.", "Follow diabetic diet plan. Walk 30 minutes daily.", "2024-10-20")
        ));

        // 7. Medicines
        medicineRepository.saveAll(Arrays.asList(
            new Medicine("MED001", "Paracetamol 500mg", "Analgesic",  500, new BigDecimal("2.50"),  "2026-12-31", "Sun Pharma",     "Shelf A1",   50, "In Stock"),
            new Medicine("MED002", "Amoxicillin 250mg", "Antibiotic", 200, new BigDecimal("8.00"),  "2026-06-30", "Cipla",          "Shelf B2",   30, "In Stock"),
            new Medicine("MED003", "Amlodipine 5mg",    "Cardiac",     15, new BigDecimal("5.00"),  "2025-09-30", "Dr. Reddys",     "Cabinet C",  20, "Low Stock"),
            new Medicine("MED004", "Metformin 500mg",   "Diabetic",   300, new BigDecimal("3.50"),  "2027-03-31", "Ranbaxy",        "Shelf A3",   40, "In Stock"),
            new Medicine("MED005", "Vitamin D3 60K IU", "Vitamins",     0, new BigDecimal("45.00"), "2025-04-30", "Mankind Pharma", "Cold Store", 10, "Out of Stock"),
            new Medicine("MED006", "Ibuprofen 400mg",   "Analgesic",  180, new BigDecimal("4.00"),  "2026-08-31", "Abbott",         "Shelf A2",   30, "In Stock")
        ));

        // 8. Bills
        billRepository.saveAll(Arrays.asList(
            new Bill("B001", "P001", "Rajesh Kumar",  "2024-10-10", new BigDecimal("500.00"), new BigDecimal("120.00"),  new BigDecimal("800.00"),   BigDecimal.ZERO,           new BigDecimal("1420.00"), "Paid"),
            new Bill("B002", "P002", "Sunita Devi",   "2024-10-12", new BigDecimal("800.00"), new BigDecimal("75.00"),   new BigDecimal("3500.00"),  BigDecimal.ZERO,           new BigDecimal("4375.00"), "Pending"),
            new Bill("B003", "P003", "Arjun Patel",   "2024-10-15", new BigDecimal("600.00"), new BigDecimal("250.00"),  new BigDecimal("600.00"),   new BigDecimal("100.00"),  new BigDecimal("1550.00"), "Paid"),
            new Bill("B004", "P006", "Sunil Verma",   "2024-10-18", new BigDecimal("700.00"), new BigDecimal("310.00"),  new BigDecimal("1200.00"),  BigDecimal.ZERO,           new BigDecimal("2210.00"), "Paid"),
            new Bill("B005", "P004", "Kavita Sharma", "2024-10-19", new BigDecimal("400.00"), new BigDecimal("150.00"),  new BigDecimal("400.00"),   BigDecimal.ZERO,           new BigDecimal("950.00"),  "Paid"),
            new Bill("B006", "P005", "Mohammed Ali",  "2024-10-20", new BigDecimal("500.00"), new BigDecimal("100.00"),  new BigDecimal("700.00"),   BigDecimal.ZERO,           new BigDecimal("1300.00"), "Paid")
        ));

        // 9. Dispense Log
        dispenseLogRepository.save(
            new DispenseLog("DL001", "P001", "Rajesh Kumar", "MED003", "Amlodipine 5mg", 30, "MR001", "Routine prescription dispense", "pharmRaj", "2024-10-10 10:15")
        );

        System.out.println("✅ HMIS database initialized successfully with initial records.");
    }
}
