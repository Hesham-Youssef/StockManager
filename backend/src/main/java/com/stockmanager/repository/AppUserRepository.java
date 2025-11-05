package com.stockmanager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.stockmanager.entity.AppUser;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
}