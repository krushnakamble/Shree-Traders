package com.shoperp.controller;

import com.shoperp.model.Dealer;
import com.shoperp.repository.DealerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dealers")
public class DealerController {
    
    @Autowired
    private DealerRepository repository;

    @GetMapping
    public List<Dealer> list() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dealer> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Dealer save(@RequestBody Dealer d) {
        return repository.save(d);
    }

    @PutMapping("/{id}")
    public Dealer update(@PathVariable Long id, @RequestBody Dealer d) {
        d.setId(id);
        return repository.save(d);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
