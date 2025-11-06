import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { getStockPriceHistory } from "../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function StockHistoryChart({ stockId, livePrice }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, [stockId]);

  useEffect(() => {
    if (livePrice) {
      setHistory((prev) => [...prev, livePrice]);
    }
  }, [livePrice]);

  const loadHistory = async () => {
    try {
      const res = await getStockPriceHistory(stockId);
      setHistory(res.data.map((h) => ({ price: h.price, timestamp: new Date(h.timestamp) })));
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const chartData = {
    labels: history.map((h) => h.timestamp.toLocaleString()),
    datasets: [
      {
        label: "Price ($)",
        data: history.map((h) => h.price),
        borderColor: "rgb(75, 192, 192)",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = { responsive: true };

  return history.length > 0 ? <Line data={chartData} options={options} /> : <p>No history yet</p>;
}
