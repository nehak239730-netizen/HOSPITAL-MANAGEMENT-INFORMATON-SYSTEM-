package com.hmis.repository;

import com.hmis.model.DispenseLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispenseLogRepository extends JpaRepository<DispenseLog, String> {
    List<DispenseLog> findByPatientId(String patientId);
    List<DispenseLog> findByMedicineId(String medicineId);
}
