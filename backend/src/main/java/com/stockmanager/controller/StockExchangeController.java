package com.stockmanager.controller;


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

import com.stockmanager.dto.AddStockRequest;
import com.stockmanager.dto.CreateExchangeRequest;
import com.stockmanager.dto.ExchangeDto;
import com.stockmanager.entity.StockExchange;
import com.stockmanager.service.StockExchangeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/exchanges")
@RequiredArgsConstructor
public class StockExchangeController {
    private final StockExchangeService exchangeService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<?> listAll(){
        var list = exchangeService.listAll().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id){
        return ResponseEntity.ok(toDto(exchangeService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateExchangeRequest req){
        StockExchange created = exchangeService.create(req.getName(), req.getDescription(), req.getLiveInMarket() != null ? req.getLiveInMarket() : false);
        ExchangeDto dto = toDto(created);
        messagingTemplate.convertAndSend("/topic/exchanges", dto);
        return ResponseEntity.status(201).body(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CreateExchangeRequest req){
        var updated = exchangeService.update(id, req.getName(), req.getDescription(), req.getLiveInMarket());
        ExchangeDto dto = toDto(updated);
        messagingTemplate.convertAndSend("/topic/exchanges", dto);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        exchangeService.delete(id);
        messagingTemplate.convertAndSend("/topic/exchanges/delete", id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/stocks")
    public ResponseEntity<?> addStock(@PathVariable Long id, @Valid @RequestBody AddStockRequest req){
        var updated = exchangeService.addStockToExchange(id, req.getStockId());
        ExchangeDto dto = toDto(updated);
        messagingTemplate.convertAndSend("/topic/exchanges", dto);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}/stocks/{stockId}")
    public ResponseEntity<?> removeStock(@PathVariable Long id, @PathVariable Long stockId){
        var updated = exchangeService.removeStockFromExchange(id, stockId);
        ExchangeDto dto = toDto(updated);
        messagingTemplate.convertAndSend("/topic/exchanges", dto);
        return ResponseEntity.ok(dto);
    }

    private ExchangeDto toDto(StockExchange ex){
        ExchangeDto dto = new ExchangeDto();
        dto.setId(ex.getId());
        dto.setName(ex.getName());
        dto.setDescription(ex.getDescription());
        dto.setLiveInMarket(ex.isLiveInMarket());
        dto.setStockIds(ex.getStocks().stream().map(s -> s.getId()).collect(Collectors.toList()));
        return dto;
    }
}