package com.hmis.model;

import jakarta.persistence.*;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 100)
    private String head;

    @Column(nullable = false)
    private int beds = 0;

    @Column(length = 150)
    private String location;

    @Column(nullable = false, length = 20)
    private String status = "Active";

    public Department() {}

    public Department(String id, String name, String head, int beds, String location, String status) {
        this.id = id;
        this.name = name;
        this.head = head;
        this.beds = beds;
        this.location = location;
        this.status = status != null ? status : "Active";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getHead() { return head; }
    public void setHead(String head) { this.head = head; }

    public int getBeds() { return beds; }
    public void setBeds(int beds) { this.beds = beds; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
