package com.stockmanager;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.stockmanager.entity.Stock;
import com.stockmanager.entity.StockExchange;
import com.stockmanager.exception.BusinessRuleException;
import com.stockmanager.exception.NotFoundException;
import com.stockmanager.repository.StockExchangeRepository;
import com.stockmanager.repository.StockRepository;
import com.stockmanager.service.StockExchangeService;

public class StockExchangeServiceTest {

    private StockExchangeRepository exchangeRepository;
    private StockRepository stockRepository;
    private StockExchangeService service;

    @BeforeEach
    public void setup() {
        exchangeRepository = mock(StockExchangeRepository.class);
        stockRepository = mock(StockRepository.class);
        service = new StockExchangeService(exchangeRepository, stockRepository);
    }

    @Test
    public void testCreateExchangeSuccess() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setName("NYSE");
        ex.setDescription("Big Exchange");
        ex.setLiveInMarket(false);

        when(exchangeRepository.save(any())).thenReturn(ex);

        StockExchange created = service.create("NYSE", "Big Exchange", false);

        assertNotNull(created);
        assertEquals("NYSE", created.getName());
        assertFalse(created.isLiveInMarket());
        verify(exchangeRepository).save(any());
    }

    @Test
    public void testCreateExchangeLiveWithFewStocksFails() {
        StockExchange ex = new StockExchange();
        ex.setStocks(new HashSet<>()); // empty set

        when(exchangeRepository.save(any())).thenReturn(ex);

        BusinessRuleException exThrown = assertThrows(BusinessRuleException.class,
                () -> service.create("NASDAQ", "Tech Exchange", true));
        assertEquals("Exchange must have at least 10 stocks to be live", exThrown.getMessage());
    }

    @Test
    public void testUpdateExchangeSuccess() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setName("NYSE");
        ex.setDescription("Old Desc");
        ex.setLiveInMarket(false);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.update(1L, "NYSE", "New Desc", false);

        assertEquals("New Desc", updated.getDescription());
        assertFalse(updated.isLiveInMarket());
    }

    @Test
    public void testUpdateExchangeLiveWithFewStocksFails() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setStocks(new HashSet<>()); // empty set

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));

        BusinessRuleException thrown = assertThrows(BusinessRuleException.class,
                () -> service.update(1L, "NYSE", "Desc", true));
        assertEquals("Exchange must have at least 10 stocks to be live", thrown.getMessage());
    }

    @Test
    public void testUpdateExchangeNotFound() {
        when(exchangeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class,
                () -> service.update(999L, "X", "Desc", false));
    }

    @Test
    public void testDeleteExchangeSuccess() {
        when(exchangeRepository.existsById(1L)).thenReturn(true);
        doNothing().when(exchangeRepository).deleteById(1L);

        assertDoesNotThrow(() -> service.delete(1L));
        verify(exchangeRepository).deleteById(1L);
    }

    @Test
    public void testDeleteExchangeNotFound() {
        when(exchangeRepository.existsById(999L)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> service.delete(999L));
    }

    @Test
    public void testAddStockToExchangeSuccess() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setStocks(new HashSet<>());

        Stock stock = new Stock();
        stock.setId(10L);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(stockRepository.findById(10L)).thenReturn(Optional.of(stock));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.addStockToExchange(1L, 10L);

        assertEquals(1, updated.getStocks().size());
        assertTrue(updated.getStocks().contains(stock));
    }

    @Test
    public void testAddStockAlreadyExistsFails() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        Stock stock = new Stock();
        stock.setId(10L);
        ex.getStocks().add(stock);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(stockRepository.findById(10L)).thenReturn(Optional.of(stock));

        BusinessRuleException thrown = assertThrows(BusinessRuleException.class,
                () -> service.addStockToExchange(1L, 10L));
        assertEquals("Stock already exists in this exchange", thrown.getMessage());
    }

    @Test
    public void testRemoveStockFromExchangeSuccess() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        Stock stock = new Stock();
        stock.setId(10L);
        ex.getStocks().add(stock);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.removeStockFromExchange(1L, 10L);

        assertEquals(0, updated.getStocks().size());
    }

    @Test
    public void testRemoveStockFromExchangeNotLinkedFails() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));

        assertThrows(NotFoundException.class, () -> service.removeStockFromExchange(1L, 999L));
    }

    @Test
    public void testRemoveStockSetsLiveToFalseIfBelow10() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setLiveInMarket(true);
        // only 1 stock, removing it should drop below 10
        Stock stock = new Stock();
        stock.setId(1L);
        ex.getStocks().add(stock);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.removeStockFromExchange(1L, 1L);

        assertFalse(updated.isLiveInMarket());
    }

    @Test
    public void testGetByIdSuccess() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));

        StockExchange found = service.getById(1L);
        assertEquals(1L, found.getId());
    }

    @Test
    public void testGetByIdNotFound() {
        when(exchangeRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.getById(999L));
    }

    @Test
    public void testListAll() {
        StockExchange ex1 = new StockExchange();
        ex1.setId(1L);
        StockExchange ex2 = new StockExchange();
        ex2.setId(2L);

        when(exchangeRepository.findAll()).thenReturn(Arrays.asList(ex1, ex2));

        List<StockExchange> all = service.listAll();
        assertEquals(2, all.size());
    }


    
    @Test
    public void testAddMultipleStocksToExchange() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);

        Stock s1 = new Stock(); s1.setId(1L);
        Stock s2 = new Stock(); s2.setId(2L);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(stockRepository.findById(1L)).thenReturn(Optional.of(s1));
        when(stockRepository.findById(2L)).thenReturn(Optional.of(s2));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated1 = service.addStockToExchange(1L, 1L);
        StockExchange updated2 = service.addStockToExchange(1L, 2L);

        assertEquals(2, updated2.getStocks().size());
        assertTrue(updated2.getStocks().containsAll(Arrays.asList(s1, s2)));
    }

    @Test
    public void testRemoveStockDoesNotThrowWhenMultipleExist() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);

        Stock s1 = new Stock(); s1.setId(1L);
        Stock s2 = new Stock(); s2.setId(2L);

        ex.getStocks().addAll(Arrays.asList(s1, s2));

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.removeStockFromExchange(1L, 1L);

        assertEquals(1, updated.getStocks().size());
        assertTrue(updated.getStocks().contains(s2));
    }

    @Test
    public void testUpdateExchangeKeepsLiveIfEnoughStocks() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setLiveInMarket(true);

        // 10 stocks
        for (long i = 1; i <= 10; i++) {
            Stock s = new Stock();
            s.setId(i);
            ex.getStocks().add(s);
        }

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.update(1L, "UpdatedName", "UpdatedDesc", true);

        assertEquals(10, updated.getStocks().size());
        assertTrue(updated.isLiveInMarket());
        assertEquals("UpdatedName", updated.getName());
        assertEquals("UpdatedDesc", updated.getDescription());
    }

    @Test
    public void testAddStockThrowsNotFoundIfExchangeMissing() {
        when(exchangeRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(BusinessRuleException.class, () -> service.addStockToExchange(999L, 1L));
    }

    @Test
    public void testAddStockThrowsNotFoundIfStockMissing() {
        StockExchange ex = new StockExchange(); ex.setId(1L);
        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(stockRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(BusinessRuleException.class, () -> service.addStockToExchange(1L, 999L));
    }

    @Test
    public void testRemoveStockBelow10AutomaticallyDisablesLive() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setLiveInMarket(true);

        // 2 stocks
        Stock s1 = new Stock(); s1.setId(1L);
        Stock s2 = new Stock(); s2.setId(2L);
        ex.getStocks().add(s1);
        ex.getStocks().add(s2);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // remove one
        StockExchange updated = service.removeStockFromExchange(1L, 1L);

        assertFalse(updated.isLiveInMarket()); // below 10 disables live
        assertEquals(1, updated.getStocks().size());
        assertTrue(updated.getStocks().contains(s2));
    }

    @Test
    public void testRemoveStockKeepsLiveIfAbove10() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setLiveInMarket(true);

        // 11 stocks
        for (long i = 1; i <= 11; i++) {
            Stock s = new Stock(); s.setId(i);
            ex.getStocks().add(s);
        }

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(exchangeRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        StockExchange updated = service.removeStockFromExchange(1L, 1L);

        assertTrue(updated.isLiveInMarket());
        assertEquals(10, updated.getStocks().size());
    }

    @Test
    public void testAddStockAndLiveValidation() {
        StockExchange ex = new StockExchange();
        ex.setId(1L);
        ex.setLiveInMarket(true);
        ex.setStocks(new HashSet<>()); // empty

        Stock s = new Stock(); s.setId(1L);

        when(exchangeRepository.findById(1L)).thenReturn(Optional.of(ex));
        when(stockRepository.findById(1L)).thenReturn(Optional.of(s));

        BusinessRuleException thrown = assertThrows(BusinessRuleException.class,
                () -> service.update(1L, null, null, true));
        assertEquals("Exchange must have at least 10 stocks to be live", thrown.getMessage());
    }
}
