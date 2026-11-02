package com.hmis.repository;

import com.hmis.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, String> {
    List<Bill> findByPatientId(String patientId);
    List<Bill> findByStatusIgnoreCase(String status);
}
