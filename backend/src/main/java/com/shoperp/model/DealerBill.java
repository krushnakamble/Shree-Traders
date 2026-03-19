package com.shoperp.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dealer_bills")
public class DealerBill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "dealer_id", nullable = false)
    private Dealer dealer;

    private Double totalAmount; // Purchase amount (What we owe)
    private Double paidAmount = 0.0; // What we paid to dealer
    private Integer quantity = 0; // Quantity of items purchased
    private Double rate = 0.0; // Price per item
    private Double expenditure = 0.0; // Extra costs like transport/tax
    private String remarks;
    private LocalDateTime createdAt = LocalDateTime.now();

    public DealerBill() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Dealer getDealer() { return dealer; }
    public void setDealer(Dealer dealer) { this.dealer = dealer; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public Double getExpenditure() { return expenditure; }
    public void setExpenditure(Double expenditure) { this.expenditure = expenditure; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getRemainingAmount() {
        return (totalAmount != null ? totalAmount : 0.0) - (paidAmount != null ? paidAmount : 0.0);
    }
}
