package com.physio.backend.service;

import com.physio.backend.model.User;
import com.physio.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User create(User user) {
        return userRepository.save(user);
    }

    // PATCH user details
    public User patch(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id).orElseThrow();
        updates.forEach((k, v) -> {
            switch (k) {
                case "role" -> user.setRole(v.toString());
                case "password" -> user.setPassword(v.toString());
            }
        });
        return userRepository.save(user);
    }

    public User update(Long id, User updatedUser) {
        return userRepository.findById(id)
                .map(existing -> {
                    existing.setName(updatedUser.getName());
                    existing.setEmail(updatedUser.getEmail());
                    existing.setPassword(updatedUser.getPassword());
                    existing.setRole(updatedUser.getRole());
                    return userRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    // 🧠 Old authenticate method (no role)
    public Optional<User> authenticate(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPassword().equals(password));
    }

    // ✅ NEW: Authenticate with role check
    public Optional<User> authenticate(String email, String password, String role) {
        return userRepository.findByEmail(email)
                .filter(user ->
                        user.getPassword().equals(password) &&
                                user.getRole().equalsIgnoreCase(role)
                );
    }
}
