package com.hmis.repository;

import com.hmis.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {
    List<Patient> findByAssignedDoctorContainingIgnoreCase(String doctorName);
    List<Patient> findByRegDate(String regDate);
}
