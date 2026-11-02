package com.hmis.controller;

import com.hmis.model.Department;
import com.hmis.repository.DepartmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;

    public DepartmentController(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable String id) {
        return departmentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        if (department.getId() == null || department.getId().isEmpty()) {
            long count = departmentRepository.count() + 1;
            department.setId(String.format("DEPT%02d", count));
        }
        if (department.getStatus() == null || department.getStatus().isEmpty()) {
            department.setStatus("Active");
        }
        return ResponseEntity.ok(departmentRepository.save(department));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Department> toggleStatus(@PathVariable String id) {
        Optional<Department> opt = departmentRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Department d = opt.get();
        d.setStatus("Active".equalsIgnoreCase(d.getStatus()) ? "Inactive" : "Active");
        return ResponseEntity.ok(departmentRepository.save(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable String id) {
        if (!departmentRepository.existsById(id)) return ResponseEntity.notFound().build();
        departmentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
