package com.shoperp.config;

import com.shoperp.model.User;
import com.shoperp.model.Product;
import com.shoperp.model.Dealer;
import com.shoperp.model.Customer;
import com.shoperp.model.Bill;
import com.shoperp.repository.UserRepository;
import com.shoperp.repository.ProductRepository;
import com.shoperp.repository.DealerRepository;
import com.shoperp.repository.CustomerRepository;
import com.shoperp.repository.BillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DealerRepository dealerRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private BillRepository billRepository;

    @Override
    public void run(String... args) throws Exception {
        // Sample Users
        if (userRepository.count() == 0) {
            userRepository.save(new User(null, "admin@shoperp.com", "admin123", "admin"));
            userRepository.save(new User(null, "user@shoperp.com", "user123", "user"));
            System.out.println("Default users added.");
        }

        // Sample Products
        Product p1, p2, p3;
        if (productRepository.count() == 0) {
            p1 = productRepository.save(new Product(null, "Steel Bar - 12mm", "Construction", "STL-12MM", 500, 850.0));
            p2 = productRepository.save(new Product(null, "Cement - Grade A", "Materials", "CEM-GRDA", 1200, 420.0));
            p3 = productRepository.save(new Product(null, "Wall Tiles - White", "Interior", "TILE-WHT", 350, 65.0));
            productRepository.save(new Product(null, "Copper Wire - 2.5sqmm", "Electrical", "WRE-25SQ", 200, 1200.0));
            productRepository.save(new Product(null, "Circuit Breaker", "Electrical", "CB-MCB", 150, 450.0));
            System.out.println("Sample products added.");
        } else {
            List<Product> prods = productRepository.findAll();
            p1 = prods.get(0); p2 = prods.get(1); p3 = prods.get(2);
        }

        // Sample Dealers
        if (dealerRepository.count() == 0) {
            dealerRepository.save(new Dealer(null, "Bharat Steel Corp", "+91 9876543210", "123 Industrial Area, Mumbai"));
            dealerRepository.save(new Dealer(null, "Reliable Electricals", "+91 9876543211", "45 Market St, Delhi"));
            dealerRepository.save(new Dealer(null, "Modern Hardware", "+91 9876543212", "78 Main Rd, Pune"));
            System.out.println("Sample dealers added.");
        }

        // Sample Customers
        Customer c1, c2, c3;
        if (customerRepository.count() == 0) {
            c1 = customerRepository.save(new Customer(null, "Ramesh Patil", "9123456780", "Sadashiv Peth, Pune"));
            c2 = customerRepository.save(new Customer(null, "Suresh Gupta", "9123456781", "Matunga, Mumbai"));
            c3 = customerRepository.save(new Customer(null, "Anjali Deshmukh", "9123456782", "Kothrud, Pune"));
            System.out.println("Sample customers added.");
        } else {
            List<Customer> custs = customerRepository.findAll();
            c1 = custs.get(0); c2 = custs.get(1); c3 = custs.get(2);
        }

        // Sample Bills (Transactions)
        if (billRepository.count() == 0) {
            // Bill for Ramesh Patil
            Bill b1 = new Bill();
            b1.setCustomer(c1);
            b1.setTotalAmount(15000.0);
            b1.setPaidAmount(5000.0);
            b1.setRemarks("Steel bar purchase");
            billRepository.save(b1);

            // Receipt from Ramesh Patil
            Bill b2 = new Bill();
            b2.setCustomer(c1);
            b2.setTotalAmount(0.0);
            b2.setPaidAmount(2000.0);
            b2.setRemarks("Cash receipt against old baki");
            billRepository.save(b2);

            // Bill for Suresh Gupta
            Bill b3 = new Bill();
            b3.setCustomer(c2);
            b3.setTotalAmount(4500.0);
            b3.setPaidAmount(4500.0);
            b3.setRemarks("Cement - Paid full");
            billRepository.save(billRepository.save(b3));

            System.out.println("Sample bills added.");
        }
    }
}
