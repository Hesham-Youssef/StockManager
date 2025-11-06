package com.stockmanager;
import com.stockmanager.entity.Stock;
import com.stockmanager.entity.StockPriceHistory;
import com.stockmanager.exception.NotFoundException;
import com.stockmanager.repository.StockExchangeRepository;
import com.stockmanager.repository.StockPriceHistoryRepository;
import com.stockmanager.repository.StockRepository;
import com.stockmanager.service.StockService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class StockServiceTest {

    private StockRepository stockRepository;
    private StockExchangeRepository stockExchangeRepository;
    private StockPriceHistoryRepository stockPriceHistoryRepository;
    private StockService service;

    @BeforeEach
    public void setup() {
        stockRepository = mock(StockRepository.class);
        stockExchangeRepository = mock(StockExchangeRepository.class);
        stockPriceHistoryRepository = mock(StockPriceHistoryRepository.class);
        service = new StockService(stockRepository, stockExchangeRepository, stockPriceHistoryRepository);
    }

    @Test
    public void testListAll() {
        Stock s1 = new Stock();
        s1.setId(1L);
        Stock s2 = new Stock();
        s2.setId(2L);

        when(stockRepository.findAll()).thenReturn(Arrays.asList(s1, s2));

        List<Stock> result = service.listAll();

        assertEquals(2, result.size());
        verify(stockRepository).findAll();
    }

    @Test
    public void testGetByIdSuccess() {
        Stock s = new Stock();
        s.setId(1L);

        when(stockRepository.findById(1L)).thenReturn(Optional.of(s));

        Stock found = service.getById(1L);

        assertEquals(1L, found.getId());
    }

    @Test
    public void testGetByIdNotFound() {
        when(stockRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getById(999L));
    }

    @Test
    public void testGetPriceHistory() {
        StockPriceHistory h1 = StockPriceHistory.builder().price(new BigDecimal("100")).build();
        StockPriceHistory h2 = StockPriceHistory.builder().price(new BigDecimal("110")).build();

        when(stockPriceHistoryRepository.findByStockIdOrderByTimestampAsc(1L)).thenReturn(Arrays.asList(h1, h2));

        List<StockPriceHistory> history = service.getPriceHistory(1L);

        assertEquals(2, history.size());
        assertEquals(new BigDecimal("100"), history.get(0).getPrice());
    }

    @Test
    public void testCreateStock() {
        when(stockRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Stock created = service.create("Apple", "Tech stock", new BigDecimal("50.0"));

        assertNotNull(created);
        assertNotNull(created.getPriceHistory());
        assertFalse(created.getPriceHistory().isEmpty());
        assertEquals(new BigDecimal("50.0"), created.getCurrentPrice());
        verify(stockRepository).save(any());
    }

    @Test
    public void testUpdatePriceSuccess() {
        Stock s = new Stock();
        s.setId(1L);
        s.setCurrentPrice(new BigDecimal("50.0"));

        when(stockRepository.findById(1L)).thenReturn(Optional.of(s));
        when(stockRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        BigDecimal newPrice = new BigDecimal("55.5");
        Stock updated = service.updatePrice(1L, newPrice);

        assertEquals(newPrice, updated.getCurrentPrice());
        assertFalse(updated.getPriceHistory().isEmpty());
        assertEquals(newPrice, updated.getPriceHistory().get(0).getPrice()); // latest history
    }

    @Test
    public void testUpdatePriceStockNotFound() {
        when(stockRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.updatePrice(999L, new BigDecimal("100")));
    }

    @Test
    public void testDeleteStockSuccess() {
        when(stockExchangeRepository.findIdsByStockId(1L)).thenReturn(Arrays.asList(1L, 2L));
        doNothing().when(stockRepository).removeStockFromAllExchanges(1L);
        doNothing().when(stockRepository).deleteById(1L);
        doNothing().when(stockExchangeRepository).deactivateIfBelowStockThreshold(anyList(), eq(10));

        assertDoesNotThrow(() -> service.delete(1L));

        verify(stockRepository).removeStockFromAllExchanges(1L);
        verify(stockRepository).deleteById(1L);
        verify(stockExchangeRepository).deactivateIfBelowStockThreshold(Arrays.asList(1L, 2L), 10);
    }

    @Test
    public void testDeleteStockWithNoExchanges() {
        when(stockExchangeRepository.findIdsByStockId(1L)).thenReturn(Collections.emptyList());
        doNothing().when(stockRepository).removeStockFromAllExchanges(1L);
        doNothing().when(stockRepository).deleteById(1L);
        doNothing().when(stockExchangeRepository).deactivateIfBelowStockThreshold(anyList(), eq(10));

        assertDoesNotThrow(() -> service.delete(1L));

        verify(stockRepository).removeStockFromAllExchanges(1L);
        verify(stockRepository).deleteById(1L);
        verify(stockExchangeRepository).deactivateIfBelowStockThreshold(Collections.emptyList(), 10);
    }

    
    @Test
    public void testCreateStockAddsHistoryWithCorrectTimestamp() {
        when(stockRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        Instant before = Instant.now();
        Stock s = service.create("Tesla", "EV stock", new BigDecimal("200"));
        Instant after = Instant.now();

        assertEquals("Tesla", s.getName());
        assertEquals("EV stock", s.getDescription());
        assertEquals(new BigDecimal("200"), s.getCurrentPrice());

        assertNotNull(s.getPriceHistory());
        assertEquals(1, s.getPriceHistory().size());

        Instant histTime = s.getPriceHistory().get(0).getTimestamp();
        assertTrue(!histTime.isBefore(before) && !histTime.isAfter(after));
    }

    @Test
    public void testUpdatePriceAddsHistoryEntry() {
        Stock s = new Stock();
        s.setId(1L);
        s.setCurrentPrice(new BigDecimal("100"));
        when(stockRepository.findById(1L)).thenReturn(Optional.of(s));
        when(stockRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        BigDecimal newPrice = new BigDecimal("120");
        Stock updated = service.updatePrice(1L, newPrice);

        assertEquals(newPrice, updated.getCurrentPrice());
        assertEquals(1, updated.getPriceHistory().size());
        assertEquals(newPrice, updated.getPriceHistory().get(0).getPrice());
    }

    @Test
    public void testDeleteStockThrowsNoExceptionWhenListIsEmpty() {
        when(stockExchangeRepository.findIdsByStockId(1L)).thenReturn(Collections.emptyList());
        doNothing().when(stockRepository).removeStockFromAllExchanges(1L);
        doNothing().when(stockRepository).deleteById(1L);
        doNothing().when(stockExchangeRepository).deactivateIfBelowStockThreshold(Collections.emptyList(), 10);

        assertDoesNotThrow(() -> service.delete(1L));
    }

    @Test
    public void testCreateMultipleStocksMaintainSeparateHistory() {
        when(stockRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Stock s1 = service.create("StockA", "DescA", new BigDecimal("10"));
        Stock s2 = service.create("StockB", "DescB", new BigDecimal("20"));

        assertEquals(1, s1.getPriceHistory().size());
        assertEquals(1, s2.getPriceHistory().size());
        assertNotEquals(s1.getPriceHistory().get(0).getPrice(), s2.getPriceHistory().get(0).getPrice());
    }    
}