package com.shoperp.controller;

import com.shoperp.model.DealerBill;
import com.shoperp.repository.DealerBillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dealer-bills")
public class DealerBillController {
    
    @Autowired
    private DealerBillRepository repository;

    @GetMapping
    public List<DealerBill> list() {
        return repository.findAll();
    }

    @GetMapping("/dealer/{id}")
    public List<DealerBill> getDealerBills(@PathVariable Long id) {
        return repository.findByDealerId(id);
    }

    @PostMapping
    public DealerBill save(@RequestBody DealerBill bill) {
        return repository.save(bill);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
