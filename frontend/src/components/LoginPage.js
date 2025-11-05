import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as apiLogin } from "../api/api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiLogin(username, password);
      if (res.token) {
        login(res.token);
        toast.success("Login successful!");
        navigate("/exchanges");
      } else {
        toast.error("Invalid login response");
      }
    } catch (err) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center mb-4">Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Username</label>
          <input
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" className="btn btn-dark w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
