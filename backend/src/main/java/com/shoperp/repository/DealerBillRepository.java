package com.shoperp.repository;

import com.shoperp.model.DealerBill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DealerBillRepository extends JpaRepository<DealerBill, Long> {
    List<DealerBill> findByDealerId(Long dealerId);
}
