package com.shoperp.controller;

import com.shoperp.dto.LoginRequest;
import com.shoperp.dto.LoginResponse;
import com.shoperp.model.User;
import com.shoperp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // In a real app, use PasswordEncoder (e.g., BCrypt)
            if (user.getPassword().equals(request.getPassword()) && user.getRole().equals(request.getRole())) {
                return ResponseEntity.ok(new LoginResponse(
                        true, 
                        "Login successful", 
                        "dummy-jwt-token-for-" + user.getEmail(),
                        user.getEmail(),
                        user.getRole()
                ));
            }
        }
        
        return ResponseEntity.status(401).body(
                new LoginResponse(false, "Invalid credentials", null, null, null)
        );
    }
}
