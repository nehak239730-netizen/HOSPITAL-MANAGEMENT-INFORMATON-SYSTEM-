package com.hmis.controller;

import com.hmis.model.MedicalRecord;
import com.hmis.model.Patient;
import com.hmis.repository.MedicalRecordRepository;
import com.hmis.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medical")
public class MedicalRecordController {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    public MedicalRecordController(MedicalRecordRepository medicalRecordRepository,
                                   PatientRepository patientRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
    }

    @GetMapping
    public List<MedicalRecord> getAllRecords(@RequestParam(required = false) String doctor,
                                             @RequestParam(required = false) String patientId,
                                             @RequestParam(required = false) String search) {
        List<MedicalRecord> list = medicalRecordRepository.findAll();

        if (patientId != null && !patientId.trim().isEmpty()) {
            list = list.stream().filter(r -> patientId.equalsIgnoreCase(r.getPatientId())).toList();
        }

        if (doctor != null && !doctor.trim().isEmpty()) {
            String docLower = doctor.toLowerCase().replace("dr.", "").trim();
            list = list.stream().filter(r -> {
                String rDoc = r.getDoctorName() != null ? r.getDoctorName().toLowerCase().replace("dr.", "").trim() : "";
                if (rDoc.contains(docLower) || docLower.contains(rDoc)) return true;
                // Also match if assigned to this doctor
                Optional<Patient> pOpt = patientRepository.findById(r.getPatientId());
                if (pOpt.isPresent()) {
                    String pDoc = pOpt.get().getAssignedDoctor() != null ? pOpt.get().getAssignedDoctor().toLowerCase().replace("dr.", "").trim() : "";
                    return pDoc.contains(docLower) || docLower.contains(pDoc);
                }
                return false;
            }).toList();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream().filter(r ->
                (r.getPatientName() != null && r.getPatientName().toLowerCase().contains(q)) ||
                (r.getPatientId() != null && r.getPatientId().toLowerCase().contains(q)) ||
                (r.getDiagnosis() != null && r.getDiagnosis().toLowerCase().contains(q))
            ).toList();
        }

        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalRecord> getRecordById(@PathVariable String id) {
        return medicalRecordRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MedicalRecord> createRecord(@RequestBody MedicalRecord record) {
        if (record.getId() == null || record.getId().isEmpty()) {
            long count = medicalRecordRepository.count() + 1;
            record.setId(String.format("MR%03d", count));
        }
        if (record.getDate() == null || record.getDate().isEmpty()) {
            record.setDate(LocalDate.now().toString());
        }
        return ResponseEntity.ok(medicalRecordRepository.save(record));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable String id) {
        if (!medicalRecordRepository.existsById(id)) return ResponseEntity.notFound().build();
        medicalRecordRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
