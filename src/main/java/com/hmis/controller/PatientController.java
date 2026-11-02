package com.hmis.controller;

import com.hmis.model.Patient;
import com.hmis.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientRepository patientRepository;

    public PatientController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public List<Patient> getAllPatients(@RequestParam(required = false) String doctor,
                                        @RequestParam(required = false) String search) {
        List<Patient> list = patientRepository.findAll();

        if (doctor != null && !doctor.trim().isEmpty()) {
            String docLower = doctor.toLowerCase().replace("dr.", "").trim();
            list = list.stream().filter(p -> {
                String pDoc = p.getAssignedDoctor() != null ? p.getAssignedDoctor().toLowerCase().replace("dr.", "").trim() : "";
                return pDoc.contains(docLower) || docLower.contains(pDoc);
            }).toList();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream().filter(p ->
                (p.getName() != null && p.getName().toLowerCase().contains(q)) ||
                (p.getId() != null && p.getId().toLowerCase().contains(q)) ||
                (p.getPhone() != null && p.getPhone().contains(q))
            ).toList();
        }

        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable String id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        if (patient.getId() == null || patient.getId().isEmpty()) {
            long count = patientRepository.count() + 1;
            patient.setId(String.format("P%03d", count));
        }
        if (patient.getRegDate() == null || patient.getRegDate().isEmpty()) {
            patient.setRegDate(LocalDate.now().toString());
        }
        Patient saved = patientRepository.save(patient);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable String id, @RequestBody Patient patientDetails) {
        Optional<Patient> opt = patientRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Patient p = opt.get();
        if (patientDetails.getName() != null) p.setName(patientDetails.getName());
        if (patientDetails.getDob() != null) p.setDob(patientDetails.getDob());
        if (patientDetails.getAge() != null) p.setAge(patientDetails.getAge());
        if (patientDetails.getGender() != null) p.setGender(patientDetails.getGender());
        if (patientDetails.getBlood() != null) p.setBlood(patientDetails.getBlood());
        if (patientDetails.getDept() != null) p.setDept(patientDetails.getDept());
        if (patientDetails.getAssignedDoctor() != null) p.setAssignedDoctor(patientDetails.getAssignedDoctor());
        if (patientDetails.getPhone() != null) p.setPhone(patientDetails.getPhone());
        if (patientDetails.getEmail() != null) p.setEmail(patientDetails.getEmail());
        if (patientDetails.getAddress() != null) p.setAddress(patientDetails.getAddress());
        if (patientDetails.getEmgName() != null) p.setEmgName(patientDetails.getEmgName());
        if (patientDetails.getEmgPhone() != null) p.setEmgPhone(patientDetails.getEmgPhone());

        return ResponseEntity.ok(patientRepository.save(p));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable String id) {
        if (!patientRepository.existsById(id)) return ResponseEntity.notFound().build();
        patientRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
