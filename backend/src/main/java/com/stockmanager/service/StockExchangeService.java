package com.stockmanager.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.stockmanager.entity.Stock;
import com.stockmanager.entity.StockExchange;
import com.stockmanager.exception.BusinessRuleException;
import com.stockmanager.exception.NotFoundException;
import com.stockmanager.repository.StockExchangeRepository;
import com.stockmanager.repository.StockRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class StockExchangeService {
    private final StockExchangeRepository exchangeRepository;
    private final StockRepository stockRepository;

    public List<StockExchange> listAll(){
        return exchangeRepository.findAll();
    }

    public StockExchange getById(Long id){
        return exchangeRepository.findById(id).orElseThrow(() -> new NotFoundException("Exchange not found: " + id));
    }

    @Transactional
    public StockExchange create(String name, String description, boolean liveInMarket){
        StockExchange ex = new StockExchange();
        ex.setName(name);
        ex.setDescription(description);
        ex.setLiveInMarket(liveInMarket);
        // if liveInMarket true but no stocks yet, enforce later on set
        if (liveInMarket && ex.getStocks().size() < 10) {
            // we enforce rule strictly: cannot start live with <10 stocks
            throw new BusinessRuleException("Exchange must have at least 10 stocks to be live");
        }
        return exchangeRepository.save(ex);
    }

    @Transactional
    public StockExchange update(Long id, String name, String description, Boolean liveInMarket){
        StockExchange ex = getById(id);
        if (name != null) ex.setName(name);
        if (description != null) ex.setDescription(description);
        if (liveInMarket != null) {
            if (liveInMarket && ex.getStocks().size() < 10) {
                throw new BusinessRuleException("Exchange must have at least 10 stocks to be live");
            }
            ex.setLiveInMarket(liveInMarket);
        }
        return exchangeRepository.save(ex);
    }

    @Transactional
    public void delete(Long id){
        if (!exchangeRepository.existsById(id)) {
            throw new NotFoundException("Exchange not found: " + id);
        }
        exchangeRepository.deleteById(id);
    }

    @Transactional
    public StockExchange addStockToExchange(Long exchangeId, Long stockId) {
        StockExchange exchange = exchangeRepository.findById(exchangeId)
                .orElseThrow(() -> new BusinessRuleException("Exchange not found"));
        Stock stock = stockRepository.findById(stockId)
                .orElseThrow(() -> new BusinessRuleException("Stock not found"));

        boolean alreadyExists = exchange.getStocks().stream()
                .anyMatch(s -> s.getId().equals(stockId));
        if (alreadyExists) {
            throw new BusinessRuleException("Stock already exists in this exchange");
        }

        exchange.getStocks().add(stock);
        return exchangeRepository.save(exchange);
    }

    @Transactional
    public StockExchange removeStockFromExchange(Long exchangeId, Long stockId){
        StockExchange ex = getById(exchangeId);
        boolean removed = ex.getStocks().removeIf(st -> st.getId().equals(stockId));
        if (!removed) throw new NotFoundException("Stock not linked to exchange");
        // enforce rule: if stock count drops below 10, automatically set liveInMarket = false
        if (ex.getStocks().size() < 10 && ex.isLiveInMarket()) {
            ex.setLiveInMarket(false);
        }
        return exchangeRepository.save(ex);
    }
}