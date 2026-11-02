package com.hmis.controller;

import com.hmis.model.Medicine;
import com.hmis.repository.MedicineRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public List<Medicine> getAllMedicines(@RequestParam(required = false) String search,
                                         @RequestParam(required = false) Boolean availableOnly) {
        List<Medicine> list = medicineRepository.findAll();

        if (Boolean.TRUE.equals(availableOnly)) {
            list = list.stream().filter(m -> m.getQty() > 0).toList();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream().filter(m ->
                (m.getName() != null && m.getName().toLowerCase().contains(q)) ||
                (m.getId() != null && m.getId().toLowerCase().contains(q)) ||
                (m.getCategory() != null && m.getCategory().toLowerCase().contains(q))
            ).toList();
        }

        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable String id) {
        return medicineRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Medicine> createMedicine(@RequestBody Medicine medicine) {
        if (medicine.getId() == null || medicine.getId().isEmpty()) {
            long count = medicineRepository.count() + 1;
            medicine.setId(String.format("MED%03d", count));
        }
        medicine.updateStatus();
        return ResponseEntity.ok(medicineRepository.save(medicine));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Medicine> updateStock(@PathVariable String id, @RequestBody Map<String, Integer> body) {
        Optional<Medicine> opt = medicineRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Medicine m = opt.get();
        Integer newQty = body.get("qty");
        if (newQty != null && newQty >= 0) {
            m.setQty(newQty);
            medicineRepository.save(m);
        }
        return ResponseEntity.ok(m);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicine(@PathVariable String id) {
        if (!medicineRepository.existsById(id)) return ResponseEntity.notFound().build();
        medicineRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
