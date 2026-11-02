package com.hmis.model;

import jakarta.persistence.*;

@Entity
@Table(name = "doctors")
public class Doctor {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String spec;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 100)
    private String days;

    @Column(nullable = false, length = 20)
    private String status = "Available"; // Available, On Leave

    public Doctor() {}

    public Doctor(String id, String name, String spec, String phone, String email, String days, String status) {
        this.id = id;
        this.name = name;
        this.spec = spec;
        this.phone = phone;
        this.email = email;
        this.days = days;
        this.status = status != null ? status : "Available";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpec() { return spec; }
    public void setSpec(String spec) { this.spec = spec; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDays() { return days; }
    public void setDays(String days) { this.days = days; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
