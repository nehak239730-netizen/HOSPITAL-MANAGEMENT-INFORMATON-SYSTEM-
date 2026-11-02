package com.hmis.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "medicines")
public class Medicine {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private int qty = 0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(length = 20)
    private String expiry;

    @Column(length = 100)
    private String mfr;

    @Column(length = 100)
    private String storage;

    @Column(name = "min_qty", nullable = false)
    private int minQty = 20;

    @Column(nullable = false, length = 20)
    private String status = "In Stock"; // In Stock, Low Stock, Out of Stock

    public Medicine() {}

    public Medicine(String id, String name, String category, int qty, BigDecimal price, String expiry,
                    String mfr, String storage, int minQty, String status) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.qty = qty;
        this.price = price;
        this.expiry = expiry;
        this.mfr = mfr;
        this.storage = storage;
        this.minQty = minQty;
        this.status = status != null ? status : (qty == 0 ? "Out of Stock" : qty < minQty ? "Low Stock" : "In Stock");
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public int getQty() { return qty; }
    public void setQty(int qty) {
        this.qty = qty;
        updateStatus();
    }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getExpiry() { return expiry; }
    public void setExpiry(String expiry) { this.expiry = expiry; }

    public String getMfr() { return mfr; }
    public void setMfr(String mfr) { this.mfr = mfr; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }

    public int getMinQty() { return minQty; }
    public void setMinQty(int minQty) {
        this.minQty = minQty;
        updateStatus();
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public void updateStatus() {
        if (this.qty <= 0) {
            this.status = "Out of Stock";
        } else if (this.qty < this.minQty) {
            this.status = "Low Stock";
        } else {
            this.status = "In Stock";
        }
    }
}
