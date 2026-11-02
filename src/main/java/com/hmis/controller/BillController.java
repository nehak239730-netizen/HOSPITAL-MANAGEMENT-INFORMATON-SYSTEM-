package com.hmis.controller;

import com.hmis.model.Bill;
import com.hmis.repository.BillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillRepository billRepository;

    public BillController(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @GetMapping
    public List<Bill> getAllBills(@RequestParam(required = false) String patientId,
                                  @RequestParam(required = false) String search) {
        List<Bill> list = billRepository.findAll();

        if (patientId != null && !patientId.trim().isEmpty()) {
            list = list.stream().filter(b -> patientId.equalsIgnoreCase(b.getPatientId())).toList();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase().trim();
            list = list.stream().filter(b ->
                (b.getPatientName() != null && b.getPatientName().toLowerCase().contains(q)) ||
                (b.getId() != null && b.getId().toLowerCase().contains(q))
            ).toList();
        }

        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable String id) {
        return billRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Bill> createBill(@RequestBody Bill bill) {
        if (bill.getId() == null || bill.getId().isEmpty()) {
            long count = billRepository.count() + 1;
            bill.setId(String.format("B%03d", count));
        }
        if (bill.getDate() == null || bill.getDate().isEmpty()) {
            bill.setDate(LocalDate.now().toString());
        }
        if (bill.getStatus() == null || bill.getStatus().isEmpty()) {
            bill.setStatus("Pending");
        }
        if (bill.getTotal() == null || bill.getTotal().doubleValue() == 0) {
            bill.setTotal(bill.getConsultation().add(bill.getMedicine()).add(bill.getTests()).add(bill.getOther()));
        }
        return ResponseEntity.ok(billRepository.save(bill));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<Bill> markPaid(@PathVariable String id) {
        Optional<Bill> opt = billRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Bill b = opt.get();
        b.setStatus("Paid");
        return ResponseEntity.ok(billRepository.save(b));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable String id) {
        if (!billRepository.existsById(id)) return ResponseEntity.notFound().build();
        billRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
