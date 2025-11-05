package com.stockmanager.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class StockDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal currentPrice;
    private Instant lastUpdate;
    private List<Long> exchangeIds;
}