import React, { useEffect, useState, useMemo } from "react";
import {
  getStocks,
  createStock,
  updateStockPrice,
  deleteStock,
  getExchanges,
  getStockPriceHistory,
} from "../api/api";
import { toast } from "react-toastify";
import useWebSocket from "../api/useWebSocket";
import { Line } from "react-chartjs-2";
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

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [exchanges, setExchanges] = useState({});
  const [newStock, setNewStock] = useState({ name: "", price: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");

  // Sorting & search
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");

  // Track expanded stock rows for history charts
  const [expandedStock, setExpandedStock] = useState(null);
  const [stockHistories, setStockHistories] = useState({}); // { stockId: [{price, timestamp}] }

  // --- Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // --- WebSocket updates
  useWebSocket({
    onStockUpdate: (updated) => {
      setStocks((prev) => {
        const index = prev.findIndex((s) => s.id === updated.id);
        if (index !== -1) {
          const newArr = [...prev];
          newArr[index] = updated;
          return newArr;
        } else {
          return [...prev, updated];
        }
      });

      // Append to history if chart expanded
      setStockHistories((prev) => {
        if (!prev[updated.id]) return prev;
        return {
          ...prev,
          [updated.id]: [...prev[updated.id], { price: updated.currentPrice, timestamp: new Date() }],
        };
      });
    },
    onStockDelete: (deletedId) => {
      setStocks((prev) => prev.filter((s) => s.id !== deletedId));
      setStockHistories((prev) => {
        const copy = { ...prev };
        delete copy[deletedId];
        return copy;
      });
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stockRes, exchangeRes] = await Promise.all([getStocks(), getExchanges()]);
      const exchangeMap = {};
      exchangeRes.data.forEach((ex) => (exchangeMap[ex.id] = ex));
      setExchanges(exchangeMap);
      setStocks(stockRes.data);
    } catch {
      toast.error("Failed to load stocks or exchanges");
    } finally {
      setLoading(false);
    }
  };

  // --- CRUD operations
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newStock.name || !newStock.price) {
      toast.warn("Please fill in required fields");
      return;
    }
    try {
      await createStock({ name: newStock.name, description: newStock.description, currentPrice: parseFloat(newStock.price) });
      toast.success("Stock created successfully");
      setNewStock({ name: "", price: "", description: "" });
      loadData();
    } catch {
      toast.error("Failed to create stock");
    }
  };

  const startEditingPrice = (stock) => {
    setEditingPriceId(stock.id);
    setEditingPriceValue(stock.currentPrice);
  };

  const savePrice = async (stockId) => {
    const val = parseFloat(editingPriceValue);
    if (isNaN(val) || val <= 0) {
      toast.error("Invalid price");
      return;
    }
    try {
      await updateStockPrice(stockId, val);
      toast.success("Stock price updated");
      setEditingPriceId(null);
      setEditingPriceValue("");
      loadData();
    } catch {
      toast.error("Failed to update price");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this stock?")) return;
    try {
      await deleteStock(id);
      toast.info("Deleted");
      loadData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const toggleExpand = async (stockId) => {
    if (expandedStock === stockId) {
      setExpandedStock(null);
      return;
    }

    // Load history
    try {
      const res = await getStockPriceHistory(stockId);
      setStockHistories((prev) => ({
        ...prev,
        [stockId]: res.data.map((h) => ({ price: h.price, timestamp: new Date(h.timestamp) })),
      }));
      setExpandedStock(stockId);
    } catch {
      toast.error("Failed to load stock history");
    }
  };

  const formatDate = (isoString) => (isoString ? new Date(isoString).toLocaleString() : "N/A");

  // --- Sorting
  const handleSort = (key) => setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));

  const sortedStocks = useMemo(() => {
    let sorted = [...stocks];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valA = a[sortConfig.key] ?? "";
        const valB = b[sortConfig.key] ?? "";
        if (typeof valA === "string") return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
      });
    }
    return sorted;
  }, [stocks, sortConfig]);

  // --- Filtering
  const filteredStocks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return sortedStocks.filter((s) => {
      const stockNameMatch = s.name.toLowerCase().includes(query);
      const descriptionMatch = s.description?.toLowerCase().includes(query);
      const exchangeNameMatch = s.exchangeIds?.some((id) => {
        const ex = exchanges[id];
        return ex?.name.toLowerCase().includes(query);
      });

      return stockNameMatch || descriptionMatch || exchangeNameMatch;
    });
  }, [sortedStocks, searchQuery, exchanges]);

  const renderSortArrow = (columnKey) => (sortConfig.key === columnKey ? (sortConfig.direction === "asc" ? " ▲" : " ▼") : null);

  return (
    <div>
      <h3 className="mb-3">Stocks</h3>

      {/* CREATE + SEARCH */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <form onSubmit={handleCreate} className="row g-2 w-75">
          <div className="col-md-3">
            <input type="text" className="form-control" placeholder="Stock Name" value={newStock.name} onChange={(e) => setNewStock({ ...newStock, name: e.target.value })} required />
          </div>
          <div className="col-md-3">
            <input type="number" className="form-control" placeholder="Price" value={newStock.price} onChange={(e) => setNewStock({ ...newStock, price: e.target.value })} required />
          </div>
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Description" value={newStock.description} onChange={(e) => setNewStock({ ...newStock, description: e.target.value })} />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">Add</button>
          </div>
        </form>
        <input type="text" className="form-control ms-3" style={{ maxWidth: 250 }} placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {/* STOCKS TABLE */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-striped">
          <thead className="table-dark">
            <tr className="text-nowrap">
              <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>ID{renderSortArrow("id")}</th>
              <th onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>Name{renderSortArrow("name")}</th>
              <th onClick={() => handleSort("description")} style={{ cursor: "pointer" }}>Description{renderSortArrow("description")}</th>
              <th onClick={() => handleSort("currentPrice")} style={{ cursor: "pointer" }}>Price{renderSortArrow("currentPrice")}</th>
              <th>Exchanges</th>
              <th onClick={() => handleSort("lastUpdate")} style={{ cursor: "pointer" }}>Last Update{renderSortArrow("lastUpdate")}</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {filteredStocks.map((stock) => (
              <React.Fragment key={stock.id}>
                <tr className={editingPriceId === stock.id ? "table-warning" : ""}>
                  <td>{stock.id}</td>
                  <td>{stock.name}</td>
                  <td>{stock.description}</td>
                  <td className="text-nowrap">
                    {editingPriceId === stock.id ? (
                      <div className="text-nowrap d-flex justify-content-between align-items-center">
                        <input type="number" className="form-control form-control-sm me-2" value={editingPriceValue} onChange={(e) => setEditingPriceValue(e.target.value)} min="0" />
                        <button className="btn btn-sm btn-success me-1" onClick={() => savePrice(stock.id)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingPriceId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="text-nowrap d-flex justify-content-between align-items-center">
                        <span>${Number.isFinite(stock.currentPrice) ? stock.currentPrice.toFixed(2) : "N/A"}</span>
                        <div>
                          <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => startEditingPrice(stock)}>Edit Price</button>
                          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => toggleExpand(stock.id)}>{expandedStock === stock.id ? "Hide History" : "Show History"}</button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    {stock.exchangeIds?.map((id) => {
                      const ex = exchanges[id];
                      return (
                        <span key={id} className={`badge me-1 ${ex?.liveInMarket ? "bg-success" : "bg-secondary"}`}>
                          {ex?.name || `#${id}`}
                        </span>
                      );
                    }) || <span className="text-muted">—</span>}
                  </td>
                  <td>{formatDate(stock.lastUpdate)}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(stock.id)}>Delete</button>
                  </td>
                </tr>

                {/* Historical price chart */}
                {expandedStock === stock.id && stockHistories[stock.id] && (
                  <tr>
                    <td colSpan={7}>
                      <Line
                        data={{
                          labels: stockHistories[stock.id].map((h) => h.timestamp.toLocaleString()),
                          datasets: [{ label: "Price ($)", data: stockHistories[stock.id].map((h) => h.price), borderColor: "rgb(75,192,192)", fill: false, tension: 0.1 }],
                        }}
                        options={{ responsive: true }}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-muted">No matching stocks found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockList;
