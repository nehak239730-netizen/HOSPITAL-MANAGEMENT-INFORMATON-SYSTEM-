package com.hmis.model;

import jakarta.persistence.*;

@Entity
@Table(name = "dispense_log")
public class DispenseLog {

    @Id
    @Column(length = 20)
    private String id;

    @Column(name = "patient_id", nullable = false, length = 20)
    private String patientId;

    @Column(name = "patient_name", nullable = false, length = 100)
    private String patientName;

    @Column(name = "medicine_id", nullable = false, length = 20)
    private String medicineId;

    @Column(name = "medicine_name", nullable = false, length = 150)
    private String medicineName;

    @Column(nullable = false)
    private int qty;

    @Column(length = 50)
    private String ref;

    @Column(length = 255)
    private String remarks;

    @Column(name = "dispensed_by", nullable = false, length = 50)
    private String dispensedBy;

    @Column(nullable = false, length = 50)
    private String datetime;

    public DispenseLog() {}

    public DispenseLog(String id, String patientId, String patientName, String medicineId, String medicineName,
                       int qty, String ref, String remarks, String dispensedBy, String datetime) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.medicineId = medicineId;
        this.medicineName = medicineName;
        this.qty = qty;
        this.ref = ref;
        this.remarks = remarks;
        this.dispensedBy = dispensedBy;
        this.datetime = datetime;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public int getQty() { return qty; }
    public void setQty(int qty) { this.qty = qty; }

    public String getRef() { return ref; }
    public void setRef(String ref) { this.ref = ref; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getDispensedBy() { return dispensedBy; }
    public void setDispensedBy(String dispensedBy) { this.dispensedBy = dispensedBy; }

    public String getDatetime() { return datetime; }
    public void setDatetime(String datetime) { this.datetime = datetime; }
}
