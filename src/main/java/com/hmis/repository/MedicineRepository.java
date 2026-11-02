package com.hmis.repository;

import com.hmis.model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, String> {
    List<Medicine> findByStatusIgnoreCase(String status);
    List<Medicine> findByQtyGreaterThan(int minQty);
}
