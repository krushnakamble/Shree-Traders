package com.shoperp.service;

import com.shoperp.model.Bill;
import com.shoperp.model.BillItem;
import com.shoperp.model.Product;
import com.shoperp.repository.BillRepository;
import com.shoperp.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Bill> getBillsByCustomer(Long customerId) {
        return billRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public boolean hasOutstandingBalance(Long customerId) {
        List<Bill> bills = getBillsByCustomer(customerId);
        double unpaid = bills.stream()
                .mapToDouble(b -> b.getTotalAmount() - (b.getPaidAmount() != null ? b.getPaidAmount() : 0.0))
                .sum();
        return unpaid > 0.01; // Using a small epsilon for double comparison
    }

    @Transactional
    public Bill createBill(Bill bill) {
        for (BillItem item : bill.getItems()) {
            item.setBill(bill);
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + item.getProduct().getId()));
            
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + product.getName());
            }
            
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        }
        return billRepository.save(bill);
    }

    @Transactional
    public Bill updateBill(Long id, Bill billDetails) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill not found"));
        
        if (billDetails.getTotalAmount() != null) {
            bill.setTotalAmount(billDetails.getTotalAmount());
        }
        if (billDetails.getPaidAmount() != null) {
            bill.setPaidAmount(billDetails.getPaidAmount());
        }
        if (billDetails.getRemarks() != null) {
            bill.setRemarks(billDetails.getRemarks());
        }
        
        return billRepository.save(bill);
    }
}
