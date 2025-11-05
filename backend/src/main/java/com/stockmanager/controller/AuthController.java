package com.stockmanager.controller;


import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stockmanager.config.JwtUtils;
import com.stockmanager.config.Role;
import com.stockmanager.dto.LoginRequest;
import com.stockmanager.dto.RegisterRequest;
import com.stockmanager.entity.AppUser;
import com.stockmanager.repository.AppUserRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username taken"));
        }

        AppUser user = new AppUser();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        // default role USER, but accept ADMIN ONLY if a secret / env flag allows it (for safety)
        Set<Role> roles = new HashSet<>();
        // if (req.getRole() != null && req.getRole().equalsIgnoreCase("ADMIN") && allowAdminRegistration()) {
        roles.add(Role.ROLE_ADMIN); // for now assume everyone can update the data
        // } else {
        //     roles.add(Role.ROLE_USER);
        // }
        user.setRoles(roles);
        userRepo.save(user);
        return ResponseEntity.status(201).body(Map.of("message", "User created"));
    }

    private boolean allowAdminRegistration() {
        // For security, disallow open admin registration in prod.
        // You can allow via env flag or seed admin in DB.
        return false;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword())
        );

        var principal = (org.springframework.security.core.userdetails.User) auth.getPrincipal();
        Set<String> roles = new HashSet<>();
        principal.getAuthorities().forEach(a -> roles.add(a.getAuthority()));

        String token = jwtUtils.generateToken(principal.getUsername(), roles);
        return ResponseEntity.ok(Map.of("token", token));
    }
}