package com.hmis.controller;

import com.hmis.model.Appointment;
import com.hmis.repository.AppointmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;

    public AppointmentController(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping
    public List<Appointment> getAllAppointments(@RequestParam(required = false) String doctor,
                                                @RequestParam(required = false) String date,
                                                @RequestParam(required = false) String search) {
        List<Appointment> list = appointmentRepository.findAll();

        if (date != null && !date.trim().isEmpty()) {
            list = list.stream().filter(a -> date.equals(a.getDate())).toList();
        }

        if (doctor != null && !doctor.trim().isEmpty()) {
            String docLower = doctor.toLowerCase().replace("dr.", "").trim();
            list = list.stream().filter(a -> {
                String aDoc = a.getDoctorName() != null ? a.getDoctorName().toLowerCase().replace("dr.", "").trim() : "";
                return aDoc.contains(docLower) || docLower.contains(aDoc);
            }).toList();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream().filter(a ->
                (a.getPatientName() != null && a.getPatientName().toLowerCase().contains(q)) ||
                (a.getDoctorName() != null && a.getDoctorName().toLowerCase().contains(q)) ||
                (a.getId() != null && a.getId().toLowerCase().contains(q))
            ).toList();
        }

        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable String id) {
        return appointmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        if (appointment.getId() == null || appointment.getId().isEmpty()) {
            long count = appointmentRepository.count() + 1;
            appointment.setId(String.format("A%03d", count));
        }
        if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) {
            appointment.setStatus("Scheduled");
        }
        if (appointment.getDate() == null || appointment.getDate().isEmpty()) {
            appointment.setDate(LocalDate.now().toString());
        }
        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Appointment> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        Optional<Appointment> opt = appointmentRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Appointment a = opt.get();
        String newStatus = body.get("status");
        if (newStatus != null) {
            a.setStatus(newStatus);
            appointmentRepository.save(a);
        }
        return ResponseEntity.ok(a);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable String id) {
        if (!appointmentRepository.existsById(id)) return ResponseEntity.notFound().build();
        appointmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
