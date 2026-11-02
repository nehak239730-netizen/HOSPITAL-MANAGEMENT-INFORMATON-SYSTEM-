package com.hmis.dto;

import java.util.Map;

public class DashboardStatsDTO {
    private long totalPatients;
    private long todayAppointments;
    private long activeDoctors;
    private long totalBills;
    private long medicineTypes;
    private long lowStockMedicines;
    private long departments;
    private long dispensedCount;
    private long medicalRecords;
    private Map<String, Object> roleSpecific;

    public DashboardStatsDTO() {}

    public long getTotalPatients() { return totalPatients; }
    public void setTotalPatients(long totalPatients) { this.totalPatients = totalPatients; }

    public long getTodayAppointments() { return todayAppointments; }
    public void setTodayAppointments(long todayAppointments) { this.todayAppointments = todayAppointments; }

    public long getActiveDoctors() { return activeDoctors; }
    public void setActiveDoctors(long activeDoctors) { this.activeDoctors = activeDoctors; }

    public long getTotalBills() { return totalBills; }
    public void setTotalBills(long totalBills) { this.totalBills = totalBills; }

    public long getMedicineTypes() { return medicineTypes; }
    public void setMedicineTypes(long medicineTypes) { this.medicineTypes = medicineTypes; }

    public long getLowStockMedicines() { return lowStockMedicines; }
    public void setLowStockMedicines(long lowStockMedicines) { this.lowStockMedicines = lowStockMedicines; }

    public long getDepartments() { return departments; }
    public void setDepartments(long departments) { this.departments = departments; }

    public long getDispensedCount() { return dispensedCount; }
    public void setDispensedCount(long dispensedCount) { this.dispensedCount = dispensedCount; }

    public long getMedicalRecords() { return medicalRecords; }
    public void setMedicalRecords(long medicalRecords) { this.medicalRecords = medicalRecords; }

    public Map<String, Object> getRoleSpecific() { return roleSpecific; }
    public void setRoleSpecific(Map<String, Object> roleSpecific) { this.roleSpecific = roleSpecific; }
}
