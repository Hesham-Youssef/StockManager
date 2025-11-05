package com.stockmanager.dto;


import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
public class ExchangeDto {
    private Long id;
    private String name;
    private String description;
    private boolean liveInMarket;
    private List<Long> stockIds;
}