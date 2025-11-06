package com.stockmanager.controller;


import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.stockmanager.dto.CreateStockRequest;
import com.stockmanager.dto.PriceUpdateRequest;
import com.stockmanager.dto.StockDto;
import com.stockmanager.entity.Stock;
import com.stockmanager.service.StockService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {
    private final StockService stockService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<?> listAll(){
        var list = stockService.listAll().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id){
        return ResponseEntity.ok(toDto(stockService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateStockRequest req){
        Stock created = stockService.create(req.getName(), req.getDescription(), req.getCurrentPrice());
        StockDto dto = toDto(created);
        messagingTemplate.convertAndSend("/topic/stocks", dto);
        return ResponseEntity.status(201).body(dto);
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<?> updatePrice(@PathVariable Long id, @Valid @RequestBody PriceUpdateRequest req){
        var updated = stockService.updatePrice(id, req.getCurrentPrice());
        StockDto dto = toDto(updated);
        messagingTemplate.convertAndSend("/topic/stocks", dto);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        stockService.delete(id);
        messagingTemplate.convertAndSend("/topic/stocks/delete", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getPriceHistory(@PathVariable Long id) {
        var history = stockService.getPriceHistory(id).stream()
            .map(h -> Map.of("price", h.getPrice(), "timestamp", h.getTimestamp()))
            .toList();
        return ResponseEntity.ok(history);
    }

    private StockDto toDto(Stock s){
        StockDto dto = new StockDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setDescription(s.getDescription());
        dto.setCurrentPrice(s.getCurrentPrice());
        dto.setLastUpdate(s.getLastUpdate());
        dto.setExchangeIds(s.getExchanges().stream().map(e -> e.getId()).collect(Collectors.toList()));
        return dto;
    }
}