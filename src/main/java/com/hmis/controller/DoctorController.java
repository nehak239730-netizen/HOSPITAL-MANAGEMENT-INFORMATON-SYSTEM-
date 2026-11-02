package com.hmis.controller;

import com.hmis.model.Doctor;
import com.hmis.repository.DoctorRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorRepository doctorRepository;

    public DoctorController(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    @GetMapping
    public List<Doctor> getAllDoctors(@RequestParam(required = false) String search) {
        List<Doctor> list = doctorRepository.findAll();

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream().filter(d ->
                (d.getName() != null && d.getName().toLowerCase().contains(q)) ||
                (d.getSpec() != null && d.getSpec().toLowerCase().contains(q)) ||
                (d.getId() != null && d.getId().toLowerCase().contains(q))
            ).toList();
        }

        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable String id) {
        return doctorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Doctor> createDoctor(@RequestBody Doctor doctor) {
        if (doctor.getId() == null || doctor.getId().isEmpty()) {
            long count = doctorRepository.count() + 1;
            doctor.setId(String.format("D%03d", count));
        }
        if (doctor.getStatus() == null || doctor.getStatus().isEmpty()) {
            doctor.setStatus("Available");
        }
        return ResponseEntity.ok(doctorRepository.save(doctor));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Doctor> toggleStatus(@PathVariable String id) {
        Optional<Doctor> opt = doctorRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Doctor d = opt.get();
        d.setStatus("Available".equalsIgnoreCase(d.getStatus()) ? "On Leave" : "Available");
        return ResponseEntity.ok(doctorRepository.save(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable String id) {
        if (!doctorRepository.existsById(id)) return ResponseEntity.notFound().build();
        doctorRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
