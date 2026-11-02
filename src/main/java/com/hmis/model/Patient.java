package com.hmis.model;

import jakarta.persistence.*;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 20)
    private String dob;

    private Integer age;

    @Column(length = 20)
    private String gender;

    @Column(length = 100)
    private String dept;

    @Column(name = "assigned_doctor", length = 100)
    private String assignedDoctor;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(length = 10)
    private String blood;

    @Column(length = 255)
    private String address;

    @Column(name = "emg_name", length = 100)
    private String emgName;

    @Column(name = "emg_phone", length = 20)
    private String emgPhone;

    @Column(name = "reg_date", length = 20)
    private String regDate;

    public Patient() {}

    public Patient(String id, String name, String dob, Integer age, String gender, String dept, String assignedDoctor,
                   String phone, String email, String blood, String address, String emgName, String emgPhone, String regDate) {
        this.id = id;
        this.name = name;
        this.dob = dob;
        this.age = age;
        this.gender = gender;
        this.dept = dept;
        this.assignedDoctor = assignedDoctor;
        this.phone = phone;
        this.email = email;
        this.blood = blood;
        this.address = address;
        this.emgName = emgName;
        this.emgPhone = emgPhone;
        this.regDate = regDate;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getDept() { return dept; }
    public void setDept(String dept) { this.dept = dept; }

    public String getAssignedDoctor() { return assignedDoctor; }
    public void setAssignedDoctor(String assignedDoctor) { this.assignedDoctor = assignedDoctor; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getBlood() { return blood; }
    public void setBlood(String blood) { this.blood = blood; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getEmgName() { return emgName; }
    public void setEmgName(String emgName) { this.emgName = emgName; }

    public String getEmgPhone() { return emgPhone; }
    public void setEmgPhone(String emgPhone) { this.emgPhone = emgPhone; }

    public String getRegDate() { return regDate; }
    public void setRegDate(String regDate) { this.regDate = regDate; }
}
