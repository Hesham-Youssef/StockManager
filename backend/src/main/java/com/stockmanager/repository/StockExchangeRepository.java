package com.stockmanager.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.stockmanager.entity.StockExchange;

public interface StockExchangeRepository extends JpaRepository<StockExchange, Long> {
    Optional<StockExchange> findByName(String name);

    // Get only the exchanges associated with a specific stock
    @Query(value = "SELECT exchange_id FROM stock_exchange_stock WHERE stock_id = :stockId", nativeQuery = true)
    List<Long> findIdsByStockId(Long stockId);

    @Modifying
    @Transactional
    @Query(value = """
        UPDATE stock_exchange
        SET live_in_market = false
        WHERE id IN (
            SELECT s.exchange_id
            FROM stock_exchange_stock s
            WHERE s.exchange_id IN :exchangeIds
            GROUP BY s.exchange_id
            HAVING COUNT(s.stock_id) < :threshold
        )
        """, nativeQuery = true)
    void deactivateIfBelowStockThreshold(List<Long> exchangeIds, int threshold);
}