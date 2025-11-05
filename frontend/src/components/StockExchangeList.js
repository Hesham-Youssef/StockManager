import React, { useEffect, useState } from "react";
import {
  getExchanges,
  createExchange,
  updateExchange,
  deleteExchange,
  addStockToExchange,
  removeStockFromExchange,
  getStocks,
} from "../api/api";
import { toast } from "react-toastify";
import useWebSocket from "../api/useWebSocket";

const StockExchangeList = () => {
  const [exchanges, setExchanges] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [newForm, setNewForm] = useState({ name: "", description: "", liveInMarket: false });
  const [editingExchanges, setEditingExchanges] = useState({});
  const [selectedStockId, setSelectedStockId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useWebSocket({
    onExchangeUpdate: (updated) => {
      setExchanges((prev) => {
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
    onExchangeDelete: (deletedId) => {
      setExchanges((prev) => prev.filter((ex) => ex.id !== deletedId));
    },
  });


  const loadData = async () => {
    try {
      const [exRes, stRes] = await Promise.all([getExchanges(), getStocks()]);
      setExchanges(exRes.data);
      setStocks(stRes.data);
    } catch {
      toast.error("Failed to load data");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newForm.name || !newForm.description) return toast.warn("Please fill in all fields");
    try {
      await createExchange(newForm);
      toast.success("Exchange created!");
      setNewForm({ name: "", description: "", liveInMarket: false });
      loadData();
    } catch {
      toast.error("Failed to create exchange");
    }
  };

  const startEditing = (ex) => {
    setEditingExchanges((prev) => ({
      ...prev,
      [ex.id]: { name: ex.name, description: ex.description, liveInMarket: ex.liveInMarket },
    }));
  };

  const cancelEditing = (id) => {
    setEditingExchanges((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const saveEditing = async (id) => {
    const form = editingExchanges[id];
    if (!form.name || !form.description) return toast.warn("Please fill in all fields");
    try {
      await updateExchange(id, form);
      toast.success("Exchange updated!");
      cancelEditing(id);
      loadData();
    } catch {
      toast.error("Failed to update exchange");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this exchange?")) return;
    try {
      await deleteExchange(id);
      toast.success("Exchange deleted!");
      loadData();
    } catch {
      toast.error("Failed to delete exchange");
    }
  };

  const handleAddStock = async (exchangeId) => {
    if (!selectedStockId) return toast.warning("Please select a stock first");
    const exchange = exchanges.find((ex) => ex.id === exchangeId);
    if (!exchange) return toast.error("Exchange not found");
    if (exchange.stockIds.includes(parseInt(selectedStockId))) return toast.info("Stock already listed");
    try {
      await addStockToExchange(exchangeId, selectedStockId);
      toast.success("Stock added!");
      setSelectedStockId("");
      loadData();
    } catch {
      toast.error("Failed to add stock");
    }
  };

  const handleRemoveStock = async (exchangeId, stockId) => {
    try {
      await removeStockFromExchange(exchangeId, stockId);
      toast.success("Stock removed!");
      loadData();
    } catch {
      toast.error("Failed to remove stock");
    }
  };

  const getExchangeStats = (exchange) => {
    const listedStocks = exchange.stockIds
      .map((sid) => stocks.find((s) => s.id === sid))
      .filter(Boolean);
    const totalStocks = listedStocks.length;
    const totalPrice = listedStocks.reduce((sum, s) => sum + s.currentPrice, 0);
    return { totalStocks, totalPrice };
  };

  /** --- Filtering + Sorting --- */
  const filteredExchanges = exchanges
    .filter((ex) => {
      const lower = searchTerm.toLowerCase();
      const stockNames = ex.stockIds
        .map((sid) => stocks.find((s) => s.id === sid)?.name?.toLowerCase() || "")
        .join(" ");
      const matchesSearch =
        ex.name.toLowerCase().includes(lower) ||
        ex.description.toLowerCase().includes(lower) ||
        stockNames.includes(lower);
      return showLiveOnly ? ex.liveInMarket && matchesSearch : matchesSearch;
    });

  const sortedExchanges = [...filteredExchanges].sort((a, b) => {
    const { totalStocks: aCount, totalPrice: aPrice } = getExchangeStats(a);
    const { totalStocks: bCount, totalPrice: bPrice } = getExchangeStats(b);
    const key = sortConfig.key;
    let valA = a[key] ?? "";
    let valB = b[key] ?? "";

    if (key === "totalStocks") {
      valA = aCount;
      valB = bCount;
    } else if (key === "totalPrice") {
      valA = aPrice;
      valB = bPrice;
    }

    if (typeof valA === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  return (
    <div className="container mt-4">
      <h3>Manage Stock Exchanges</h3>

      {/* SEARCH + FILTER BAR */}
      <div className="d-flex align-items-center mb-3">
        <div className="input-group flex-grow-1 me-3">
          <span className="input-group-text">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, description, or stock..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🔥 NEW: Show Live Only Toggle */}
        <button
          className={`btn ${showLiveOnly ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setShowLiveOnly(!showLiveOnly)}
        >
          {showLiveOnly ? "Showing Only Live" : "Show Only Live"}
        </button>
      </div>

      {/* NEW EXCHANGE FORM */}
      <form onSubmit={handleCreate} className="mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Exchange Name"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary w-100" type="submit">
              Create Exchange
            </button>
          </div>
        </div>
      </form>

      {/* SORT HEADER */}
      <div className="d-flex mb-3">
        <button
          className="btn btn-outline-secondary me-2"
          onClick={() => requestSort("name")}
        >
          Sort by Name {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
        </button>
        <button
          className="btn btn-outline-secondary me-2"
          onClick={() => requestSort("totalStocks")}
        >
          Sort by Total Stocks {sortConfig.key === "totalStocks" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
        </button>
        <button
          className="btn btn-outline-secondary"
          onClick={() => requestSort("totalPrice")}
        >
          Sort by Total Price {sortConfig.key === "totalPrice" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
        </button>
      </div>

      {/* EXCHANGE CARDS */}
      <div className="row">
        {sortedExchanges.length === 0 ? (
          <p className="text-muted">No exchanges found</p>
        ) : (
          sortedExchanges.map((ex) => {
            const editing = !!editingExchanges[ex.id];
            const form = editingExchanges[ex.id] || {};
            const { totalStocks, totalPrice } = getExchangeStats(ex);

            return (
              <div key={ex.id} className="col-md-6 mb-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    {editing ? (
                      <>
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={form.name}
                          onChange={(e) =>
                            setEditingExchanges((prev) => ({
                              ...prev,
                              [ex.id]: { ...prev[ex.id], name: e.target.value },
                            }))
                          }
                          placeholder="Exchange Name"
                        />
                        <input
                          type="text"
                          className="form-control mb-2"
                          value={form.description}
                          onChange={(e) =>
                            setEditingExchanges((prev) => ({
                              ...prev,
                              [ex.id]: { ...prev[ex.id], description: e.target.value },
                            }))
                          }
                          placeholder="Description"
                        />
                        <div className="form-check mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={form.liveInMarket}
                            onChange={(e) =>
                              setEditingExchanges((prev) => ({
                                ...prev,
                                [ex.id]: { ...prev[ex.id], liveInMarket: e.target.checked },
                              }))
                            }
                          />
                          <label className="form-check-label">Live in Market</label>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <button className="btn btn-sm btn-success" onClick={() => saveEditing(ex.id)}>
                            Save
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => cancelEditing(ex.id)}>
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h5 className="card-title">
                          {ex.name} {ex.liveInMarket ? "✅" : "❌"}
                        </h5>
                        <p className="card-text">{ex.description}</p>
                        <p className="card-text">
                          <strong>Total Stocks:</strong> {totalStocks} |{" "}
                          <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
                        </p>
                      </>
                    )}

                    {/* STOCK LIST */}
                    <h6>Stocks</h6>
                    {ex.stockIds.length === 0 ? (
                      <p className="text-muted">No stocks listed</p>
                    ) : (
                      <ul
                        className="list-group flex-grow-1 mb-2"
                        style={{ maxHeight: "150px", overflowY: "auto" }}
                      >
                        {ex.stockIds
                          .map((sid) => stocks.find((s) => s.id === sid))
                          .filter(Boolean)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((stock) => (
                            <li
                              key={stock.id}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <span>
                                {stock.name} (${stock.currentPrice.toFixed(2)})
                              </span>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveStock(ex.id, stock.id)}
                                disabled={editing}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                      </ul>
                    )}

                    {/* STOCK ADDING */}
                    <div className="d-flex gap-2 mt-auto">
                      <select
                        className="form-select form-select-sm flex-grow-1"
                        onChange={(e) => setSelectedStockId(e.target.value)}
                        disabled={editing}
                        value={selectedStockId}
                      >
                        <option value="">Select stock</option>
                        {stocks
                          .slice()
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} (${s.currentPrice.toFixed(2)})
                            </option>
                          ))}
                      </select>

                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAddStock(ex.id)}
                        disabled={editing}
                      >
                        Add
                      </button>
                    </div>

                    {!editing && (
                      <div className="mt-3 d-flex gap-2">
                        <button className="btn btn-sm btn-warning" onClick={() => startEditing(ex)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ex.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StockExchangeList;
