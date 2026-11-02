package com.hmis.controller;

import com.hmis.dto.AuthResponse;
import com.hmis.dto.LoginRequest;
import com.hmis.model.User;
import com.hmis.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        if (request.getUsername() == null || request.getPassword() == null || request.getRole() == null) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Please enter username, password, and select your role."));
        }

        Optional<User> userOpt = userRepository.findByUsernameIgnoreCase(request.getUsername().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Account \"" + request.getUsername() + "\" not found. Please check your username or Sign Up."));
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Incorrect password. Please verify and try again."));
        }

        if (!user.getRole().equalsIgnoreCase(request.getRole().trim())) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Role mismatch: Account \"" + user.getUsername() + "\" is registered as \"" + user.getRole() + "\", not \"" + request.getRole() + "\"."));
        }

        if (!"Active".equalsIgnoreCase(user.getStatus())) {
            return ResponseEntity.badRequest().body(AuthResponse.error("This user account is currently inactive. Please contact the Administrator."));
        }

        return ResponseEntity.ok(AuthResponse.ok(user.getUsername(), user.getName(), user.getRole()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getPassword() == null || user.getRole() == null) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Missing required fields for registration."));
        }

        if (userRepository.existsByUsernameIgnoreCase(user.getUsername().trim())) {
            return ResponseEntity.badRequest().body(AuthResponse.error("Username \"" + user.getUsername() + "\" is already taken."));
        }

        long count = userRepository.count() + 1;
        if (user.getId() == null || user.getId().isEmpty()) {
            user.setId(String.format("U%03d", count));
        }
        user.setStatus("Active");

        userRepository.save(user);
        return ResponseEntity.ok(AuthResponse.ok(user.getUsername(), user.getName(), user.getRole()));
    }
}
