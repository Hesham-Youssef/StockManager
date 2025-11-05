package com.stockmanager.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "stock_exchange")
public class StockExchange {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "live_in_market", nullable = false)
    private boolean liveInMarket = false;

    @ManyToMany
    @JoinTable(name = "stock_exchange_stock",
            joinColumns = @JoinColumn(name = "exchange_id"),
            inverseJoinColumns = @JoinColumn(name = "stock_id"))
    private Set<Stock> stocks = new HashSet<>();
}