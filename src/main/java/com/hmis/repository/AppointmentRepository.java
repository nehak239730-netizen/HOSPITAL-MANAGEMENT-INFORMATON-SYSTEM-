package com.hmis.repository;

import com.hmis.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {
    List<Appointment> findByPatientId(String patientId);
    List<Appointment> findByDate(String date);
    List<Appointment> findByDoctorNameContainingIgnoreCase(String doctorName);
    List<Appointment> findByDateAndDoctorNameContainingIgnoreCase(String date, String doctorName);
}
