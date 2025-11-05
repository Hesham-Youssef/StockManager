package com.stockmanager.controller;


import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
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
        return ResponseEntity.status(201).body(toDto(created));
    }

    @PutMapping("/{id}/price")
    public ResponseEntity<?> updatePrice(@PathVariable Long id, @Valid @RequestBody PriceUpdateRequest req){
        System.out.println(req);
        var updated = stockService.updatePrice(id, req.getCurrentPrice());
        return ResponseEntity.ok(toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        stockService.delete(id);
        return ResponseEntity.noContent().build();
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