package com.stockmanager.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String password;
    private String role; // optional: "ADMIN" or "USER"
}
