package com.stockmanager.dto;


import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class PriceUpdateRequest {
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal currentPrice;
}