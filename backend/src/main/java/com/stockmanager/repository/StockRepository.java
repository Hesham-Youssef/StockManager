package com.stockmanager.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.stockmanager.entity.Stock;


public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByName(String name);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM stock_exchange_stock WHERE stock_id = :stockId", nativeQuery = true)
    void removeStockFromAllExchanges(Long stockId);
}