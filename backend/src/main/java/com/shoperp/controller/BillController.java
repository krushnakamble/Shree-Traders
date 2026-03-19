package com.shoperp.controller;

import com.shoperp.model.Bill;
import com.shoperp.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
// Removed local CrossOrigin as we now have a Global WebConfig
public class BillController {

    @Autowired
    private BillService billService;

    @GetMapping("/customer/{id}")
    public List<Bill> getCustomerBills(@PathVariable Long id) {
        return billService.getBillsByCustomer(id);
    }

    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @PostMapping
    public ResponseEntity<?> createBill(@RequestBody Bill bill) {
        try {
            return ResponseEntity.ok(billService.createBill(bill));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/update")
    public ResponseEntity<?> updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        try {
            System.out.println("Updating Bill Record: ID=" + id + " Total=" + bill.getTotalAmount() + " Paid=" + bill.getPaidAmount());
            return ResponseEntity.ok(billService.updateBill(id, bill));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Server Failure: " + e.getMessage());
        }
    }
}
