package com.stockmanager.repository;


import com.stockmanager.entity.StockPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockPriceHistoryRepository extends JpaRepository<StockPriceHistory, Long> {
    List<StockPriceHistory> findByStockIdOrderByTimestampAsc(Long stockId);
    List<StockPriceHistory> findByStockIdOrderByTimestampDesc(Long stockId);
}