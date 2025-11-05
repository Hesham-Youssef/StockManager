package com.stockmanager.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class CreateExchangeRequest {
    @NotBlank
    private String name;
    private String description;
    private Boolean liveInMarket = false;
}