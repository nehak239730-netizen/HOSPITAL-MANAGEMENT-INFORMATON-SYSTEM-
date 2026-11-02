package com.hmis.controller;

import com.hmis.dto.DispenseRequest;
import com.hmis.model.DispenseLog;
import com.hmis.model.Medicine;
import com.hmis.repository.DispenseLogRepository;
import com.hmis.repository.MedicineRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/dispense")
public class DispenseLogController {

    private final DispenseLogRepository dispenseLogRepository;
    private final MedicineRepository medicineRepository;

    public DispenseLogController(DispenseLogRepository dispenseLogRepository,
                                 MedicineRepository medicineRepository) {
        this.dispenseLogRepository = dispenseLogRepository;
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public List<DispenseLog> getAllDispenseLogs(@RequestParam(required = false) String patientId) {
        if (patientId != null && !patientId.trim().isEmpty()) {
            return dispenseLogRepository.findByPatientId(patientId);
        }
        return dispenseLogRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> dispenseMedicine(@RequestBody DispenseRequest req) {
        Optional<Medicine> medOpt = medicineRepository.findById(req.getMedicineId());
        if (medOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Medicine not found with ID: " + req.getMedicineId());
        }

        Medicine med = medOpt.get();
        if (med.getQty() < req.getQty()) {
            return ResponseEntity.badRequest().body("Insufficient stock! Available: " + med.getQty() + " units.");
        }

        // Deduct inventory
        med.setQty(med.getQty() - req.getQty());
        med.updateStatus();
        medicineRepository.save(med);

        // Record log
        long count = dispenseLogRepository.count() + 1;
        String id = String.format("DL%03d", count);
        String formattedNow = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));

        DispenseLog log = new DispenseLog(
                id,
                req.getPatientId(),
                req.getPatientName(),
                med.getId(),
                med.getName(),
                req.getQty(),
                req.getRef(),
                req.getRemarks(),
                req.getDispensedBy(),
                formattedNow
        );

        DispenseLog saved = dispenseLogRepository.save(log);
        return ResponseEntity.ok(saved);
    }
}
