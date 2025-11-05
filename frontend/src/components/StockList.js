import React, { useEffect, useState, useMemo } from "react";
import {
  getStocks,
  createStock,
  updateStockPrice,
  deleteStock,
  getExchanges,
} from "../api/api";
import { toast } from "react-toastify";
import useWebSocket from "../api/useWebSocket";

function StockList() {
  const [stocks, setStocks] = useState([]);
  const [exchanges, setExchanges] = useState({});
  const [newStock, setNewStock] = useState({
    name: "",
    price: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [editingPriceValue, setEditingPriceValue] = useState("");

  // New: sorting & search state
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useWebSocket({
    onStockUpdate: (updated) => {
      setStocks((prev) => {
        const index = prev.findIndex((s) => s.id === updated.id);
        if (index !== -1) {
          // exists → overwrite
          const newArr = [...prev];
          newArr[index] = updated;
          return newArr;
        } else {
          // doesn't exist → insert
          return [...prev, updated];
        }
      });
    },
    onStockDelete: (deletedId) => {
      setStocks((prev) => prev.filter((s) => s.id !== deletedId));
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [stockRes, exchangeRes] = await Promise.all([
        getStocks(),
        getExchanges(),
      ]);
      const exchangeMap = {};
      exchangeRes.data.forEach((ex) => {
        exchangeMap[ex.id] = ex;
      });
      setExchanges(exchangeMap);
      setStocks(stockRes.data);
    } catch (err) {
      toast.error("Failed to load stocks or exchanges");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newStock.name || !newStock.price) {
      toast.warn("Please fill in all required fields");
      return;
    }
    try {
      await createStock({
        name: newStock.name,
        description: newStock.description,
        currentPrice: parseFloat(newStock.price),
      });
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
    const value = parseFloat(editingPriceValue);
    if (isNaN(value) || value <= 0) {
      toast.error("Invalid price. Enter a positive number.");
      return;
    }
    try {
      await updateStockPrice(stockId, value);
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
      toast.info("Stock deleted");
      loadData();
    } catch {
      toast.error("Failed to delete stock");
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString();
  };

  // === Sorting Logic ===
  const handleSort = (key) => {
    setSortConfig((prev) => {
      const direction =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
  };

  const sortedStocks = useMemo(() => {
    let sorted = [...stocks];

    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === "string") {
          return sortConfig.direction === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }
      });
    }
    return sorted;
  }, [stocks, sortConfig]);

  // === Search / Filtering Logic ===
  const filteredStocks = useMemo(() => {
    return sortedStocks.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sortedStocks, searchQuery]);

  const renderSortArrow = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div>
      <h3 className="mb-3">Stocks</h3>

      {/* SEARCH BAR */}
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <form onSubmit={handleCreate} className="row g-2 w-75">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Stock Name"
              value={newStock.name}
              onChange={(e) =>
                setNewStock({ ...newStock, name: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Price"
              value={newStock.price}
              onChange={(e) =>
                setNewStock({ ...newStock, price: e.target.value })
              }
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={newStock.description}
              onChange={(e) =>
                setNewStock({ ...newStock, description: e.target.value })
              }
            />
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Add
            </button>
          </div>
        </form>

        {/* SEARCH FIELD */}
        <input
          type="text"
          className="form-control ms-3"
          style={{ maxWidth: "250px" }}
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* STOCKS TABLE */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table table-striped">
          <thead className="table-dark">
            <tr className="text-nowrap">
              <th className="flex align-items-center" onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                ID{renderSortArrow("id")}
              </th>
              <th
                onClick={() => handleSort("name")}
                style={{ cursor: "pointer" }}
              >
                Name{renderSortArrow("name")}
              </th>
              <th
                onClick={() => handleSort("description")}
                style={{ cursor: "pointer" }}
              >
                Description{renderSortArrow("description")}
              </th>
              <th
                onClick={() => handleSort("currentPrice")}
                style={{ cursor: "pointer" }}
              >
                Price{renderSortArrow("currentPrice")}
              </th>
              <th>Exchanges</th>
              <th
                onClick={() => handleSort("lastUpdate")}
                style={{ cursor: "pointer" }}
              >
                Last Update{renderSortArrow("lastUpdate")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="align-middle">
            {filteredStocks.map((stock) => (
              <tr
                key={stock.id}
                className={editingPriceId === stock.id ? "table-warning" : ""}
              >
                <td>{stock.id}</td>
                <td>{stock.name}</td>
                <td>{stock.description}</td>
                <td className="text-nowrap">
                  {editingPriceId === stock.id ? (
                    <div className="text-nowrap d-flex justify-content-between align-items-center">
                      <input
                        type="number"
                        className="form-control form-control-sm me-2"
                        value={editingPriceValue}
                        onChange={(e) => setEditingPriceValue(e.target.value)}
                        min="0"
                      />
                      <button
                        className="btn btn-sm btn-success me-1"
                        onClick={() => savePrice(stock.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setEditingPriceId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="text-nowrap d-flex justify-content-between align-items-center">
                      <span>
                        $
                        {Number.isFinite(stock.currentPrice)
                          ? stock.currentPrice.toFixed(2)
                          : "N/A"}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary ms-2"
                        onClick={() => startEditingPrice(stock)}
                      >
                        Edit Price
                      </button>
                    </div>
                  )}
                </td>
                <td>
                  {stock.exchangeIds?.length ? (
                    stock.exchangeIds.map((id) => {
                      const ex = exchanges[id];
                      if (!ex)
                        return (
                          <span key={id} className="badge bg-secondary me-1">
                            #{id}
                          </span>
                        );
                      return (
                        <span
                          key={id}
                          className={`badge me-1 ${
                            ex.liveInMarket ? "bg-success" : "bg-secondary"
                          }`}
                          title={`${ex.name} (${
                            ex.liveInMarket ? "Live" : "Inactive"
                          })`}
                        >
                          {ex.name}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>{formatDate(stock.lastUpdate)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(stock.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredStocks.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted">
                  No matching stocks found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default StockList;
