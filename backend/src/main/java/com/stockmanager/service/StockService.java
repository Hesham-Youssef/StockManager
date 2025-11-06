package com.stockmanager.service;


import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stockmanager.entity.Stock;
import com.stockmanager.entity.StockPriceHistory;
import com.stockmanager.exception.NotFoundException;
import com.stockmanager.repository.StockExchangeRepository;
import com.stockmanager.repository.StockPriceHistoryRepository;
import com.stockmanager.repository.StockRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class StockService {
    private final StockRepository stockRepository;
    private final StockExchangeRepository stockExchangeRepository;
    private final StockPriceHistoryRepository stockPriceHistoryRepository;

    public List<Stock> listAll(){
        return stockRepository.findAll();
    }

    public Stock getById(Long id){
        return stockRepository.findById(id).orElseThrow(() -> new NotFoundException("Stock not found: " + id));
    }
    
    public List<StockPriceHistory> getPriceHistory(Long stockId) {
        return stockPriceHistoryRepository.findByStockIdOrderByTimestampAsc(stockId);
    }

    @Transactional
    public Stock create(String name, String description, BigDecimal currentPrice){
        Stock s = new Stock();
        s.setName(name);
        s.setDescription(description);
        s.setCurrentPrice(currentPrice);
        
        Instant currInstant = Instant.now();        
        s.setLastUpdate(currInstant);

        StockPriceHistory history = StockPriceHistory.builder()
            .stock(s)
            .price(currentPrice)
            .timestamp(currInstant)
            .build();
        s.getPriceHistory().add(history);
        return stockRepository.save(s);
    }

    @Transactional
    public Stock updatePrice(Long id, BigDecimal newPrice) {

        Stock s = stockRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Stock not found: " + id));

        Instant currInstant = Instant.now();

        // Save current price in history
        StockPriceHistory history = StockPriceHistory.builder()
                .stock(s)
                .price(newPrice)
                .timestamp(currInstant)
                .build();
        s.getPriceHistory().add(history);

        // Update current price
        s.setCurrentPrice(newPrice);
        s.setLastUpdate(currInstant);
        return stockRepository.save(s);
    }

    @Transactional
    public void delete(Long stockId) {
        List<Long> affectedExchangeIds = stockExchangeRepository.findIdsByStockId(stockId);
        // Ahhh, can be made way more efficient, but would have to utilize some of the database engine
        // capabilites, but since currently we are just using an in-memory database, so good enough for now
        stockRepository.removeStockFromAllExchanges(stockId);
        stockRepository.deleteById(stockId);
        stockExchangeRepository.deactivateIfBelowStockThreshold(affectedExchangeIds, 10);
    }

}
