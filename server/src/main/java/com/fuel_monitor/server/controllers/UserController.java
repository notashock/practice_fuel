package com.fuel_monitor.server.controllers;

import com.fuel_monitor.server.models.entities.User;
import com.fuel_monitor.server.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        // Your SecurityConfig already ensures ONLY the Admin can reach this point
        return ResponseEntity.ok(userRepository.findAll());
    }
}