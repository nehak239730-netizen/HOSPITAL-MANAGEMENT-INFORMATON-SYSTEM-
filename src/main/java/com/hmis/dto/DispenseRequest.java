package com.hmis.dto;

public class DispenseRequest {
    private String patientId;
    private String patientName;
    private String medicineId;
    private int qty;
    private String ref;
    private String remarks;
    private String dispensedBy;

    public DispenseRequest() {}

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getMedicineId() { return medicineId; }
    public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

    public int getQty() { return qty; }
    public void setQty(int qty) { this.qty = qty; }

    public String getRef() { return ref; }
    public void setRef(String ref) { this.ref = ref; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getDispensedBy() { return dispensedBy; }
    public void setDispensedBy(String dispensedBy) { this.dispensedBy = dispensedBy; }
}
