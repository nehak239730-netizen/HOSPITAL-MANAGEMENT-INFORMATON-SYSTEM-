package com.hmis.controller;

import com.hmis.model.User;
import com.hmis.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        if (user.getId() == null || user.getId().isEmpty()) {
            long count = userRepository.count() + 1;
            user.setId(String.format("U%03d", count));
        }
        if (user.getStatus() == null || user.getStatus().isEmpty()) {
            user.setStatus("Active");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("user123");
        }
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleStatus(@PathVariable String id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        User u = opt.get();
        u.setStatus("Active".equalsIgnoreCase(u.getStatus()) ? "Inactive" : "Active");
        return ResponseEntity.ok(userRepository.save(u));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
