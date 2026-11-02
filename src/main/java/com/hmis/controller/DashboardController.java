package com.hmis.controller;

import com.hmis.dto.DashboardStatsDTO;
import com.hmis.repository.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final BillRepository billRepository;
    private final MedicineRepository medicineRepository;
    private final DepartmentRepository departmentRepository;
    private final DispenseLogRepository dispenseLogRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public DashboardController(PatientRepository patientRepository,
                               AppointmentRepository appointmentRepository,
                               DoctorRepository doctorRepository,
                               BillRepository billRepository,
                               MedicineRepository medicineRepository,
                               DepartmentRepository departmentRepository,
                               DispenseLogRepository dispenseLogRepository,
                               MedicalRecordRepository medicalRecordRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.billRepository = billRepository;
        this.medicineRepository = medicineRepository;
        this.departmentRepository = departmentRepository;
        this.dispenseLogRepository = dispenseLogRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @GetMapping("/stats")
    public DashboardStatsDTO getStats(@RequestParam(required = false) String role,
                                      @RequestParam(required = false) String doctor) {
        DashboardStatsDTO dto = new DashboardStatsDTO();
        String today = LocalDate.now().toString();

        dto.setTotalPatients(patientRepository.count());
        dto.setTodayAppointments(appointmentRepository.findByDate(today).size());
        dto.setActiveDoctors(doctorRepository.findByStatusIgnoreCase("Available").size());
        dto.setTotalBills(billRepository.count());
        dto.setMedicineTypes(medicineRepository.count());
        dto.setLowStockMedicines(medicineRepository.findByStatusIgnoreCase("Low Stock").size() +
                                 medicineRepository.findByStatusIgnoreCase("Out of Stock").size());
        dto.setDepartments(departmentRepository.count());
        dto.setDispensedCount(dispenseLogRepository.count());
        dto.setMedicalRecords(medicalRecordRepository.count());

        Map<String, Object> roleMap = new HashMap<>();
        if ("doctor".equalsIgnoreCase(role) && doctor != null && !doctor.trim().isEmpty()) {
            String docLower = doctor.toLowerCase().replace("dr.", "").trim();
            long myPatients = patientRepository.findAll().stream().filter(p -> {
                String d = p.getAssignedDoctor() != null ? p.getAssignedDoctor().toLowerCase().replace("dr.", "").trim() : "";
                return d.contains(docLower) || docLower.contains(d);
            }).count();

            long myTodayAppts = appointmentRepository.findByDate(today).stream().filter(a -> {
                String d = a.getDoctorName() != null ? a.getDoctorName().toLowerCase().replace("dr.", "").trim() : "";
                return d.contains(docLower) || docLower.contains(d);
            }).count();

            roleMap.put("myPatients", myPatients);
            roleMap.put("myTodayAppointments", myTodayAppts);
        }

        dto.setRoleSpecific(roleMap);
        return dto;
    }
}
