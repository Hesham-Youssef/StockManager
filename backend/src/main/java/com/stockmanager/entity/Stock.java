package com.stockmanager.entity;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "stock")
public class Stock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique=true, nullable=false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "current_price", precision = 19, scale = 4, nullable = false)
    private BigDecimal currentPrice;

    @Column(name = "last_update", nullable = false)
    private Instant lastUpdate;

    @Version
    private Long version;

    @ManyToMany(mappedBy = "stocks")
    private Set<StockExchange> exchanges = new HashSet<>();
}