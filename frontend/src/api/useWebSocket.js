// src/hooks/useWebSocket.js
import { useEffect } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export default function useWebSocket({ onExchangeUpdate, onExchangeDelete, onStockUpdate, onStockDelete }) {
  useEffect(() => {
    const client = new Client({
      brokerURL: undefined, // we are using SockJS
      connectHeaders: {},
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      webSocketFactory: () => new SockJS(window._env_?.REACT_APP_WS_BASE_URL || process.env.REACT_APP_WS_BASE_URL),
    });

    client.onConnect = () => {
      console.log("Connected to WebSocket");

      client.subscribe("/topic/exchanges", (msg) => {
        const exchange = JSON.parse(msg.body);
        console.log(exchange);
        
        onExchangeUpdate?.(exchange);
      });

      client.subscribe("/topic/exchanges/delete", (msg) => {
        const id = JSON.parse(msg.body);
        onExchangeDelete?.(id);
      });

      client.subscribe("/topic/stocks", (msg) => {
        const stock = JSON.parse(msg.body);
        console.log(stock);
        
        onStockUpdate?.(stock);
      });

      client.subscribe("/topic/stocks/delete", (msg) => {
        const id = JSON.parse(msg.body);
        onStockDelete?.(id);
      });
    };

    client.activate();

    return () => client.deactivate();
  }, [onExchangeUpdate, onExchangeDelete, onStockUpdate, onStockDelete]);
}
