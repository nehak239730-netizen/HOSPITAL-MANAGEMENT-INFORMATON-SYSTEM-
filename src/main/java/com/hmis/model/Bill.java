package com.hmis.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bills")
public class Bill {

    @Id
    @Column(length = 20)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 20)
    private String patientId;

    @Column(name = "patient_name", nullable = false, length = 100)
    private String patientName;

    @Column(nullable = false, length = 20)
    private String date;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal consultation = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal medicine = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tests = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal other = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String status = "Pending"; // Pending, Paid

    public Bill() {}

    public Bill(String id, String patientId, String patientName, String date,
                BigDecimal consultation, BigDecimal medicine, BigDecimal tests, BigDecimal other,
                BigDecimal total, String status) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.date = date;
        this.consultation = consultation != null ? consultation : BigDecimal.ZERO;
        this.medicine = medicine != null ? medicine : BigDecimal.ZERO;
        this.tests = tests != null ? tests : BigDecimal.ZERO;
        this.other = other != null ? other : BigDecimal.ZERO;
        this.total = total != null ? total : this.consultation.add(this.medicine).add(this.tests).add(this.other);
        this.status = status != null ? status : "Pending";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public BigDecimal getConsultation() { return consultation; }
    public void setConsultation(BigDecimal consultation) { this.consultation = consultation; }

    public BigDecimal getMedicine() { return medicine; }
    public void setMedicine(BigDecimal medicine) { this.medicine = medicine; }

    public BigDecimal getTests() { return tests; }
    public void setTests(BigDecimal tests) { this.tests = tests; }

    public BigDecimal getOther() { return other; }
    public void setOther(BigDecimal other) { this.other = other; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
