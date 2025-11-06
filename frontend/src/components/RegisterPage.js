// src/components/RegisterPage.jsx
import React, { useState, useMemo } from "react";
import { register } from "../api/api";
import { toast } from "react-toastify";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // --- Password strength calculation ---
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthLabel = useMemo(() => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { label: "Very Weak", color: "danger" };
      case 2:
        return { label: "Weak", color: "warning" };
      case 3:
        return { label: "Medium", color: "info" };
      case 4:
        return { label: "Strong", color: "success" };
      default:
        return { label: "Weak", color: "warning" };
    }
  }, [passwordStrength]);

  // --- Username validation ---
  const isUsernameValid = useMemo(() => {
    const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,19}$/;
    return usernameRegex.test(username);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isUsernameValid) {
      alert(
        "Username must be 3-20 characters, start with a letter, and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }
    if (passwordStrength < 3) {
      alert("Password too weak. Please follow the recommendations.");
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      window.location.href = "/login";
    } catch {
      toast.error("User name is already taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-3 text-center">Register</h3>
      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="mb-3">
          <input
            type="text"
            className={`form-control ${username && !isUsernameValid ? "is-invalid" : ""}`}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {username && !isUsernameValid && (
            <div className="invalid-feedback">
              Username must be 3-20 characters, start with a letter, and only letters, numbers, or underscores.
            </div>
          )}
        </div>

        {/* Password */}
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {/* Password strength */}
          {password && (
            <>
              <div className="progress mt-1" style={{ height: "6px" }}>
                <div
                  className={`progress-bar bg-${strengthLabel.color}`}
                  role="progressbar"
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                />
              </div>
              <small className={`text-${strengthLabel.color}`}>{strengthLabel.label}</small>
              <ul className="mb-0 mt-1" style={{ fontSize: "0.8rem" }}>
                <li className={password.length >= 8 ? "text-success" : "text-muted"}>At least 8 characters</li>
                <li className={/[A-Z]/.test(password) ? "text-success" : "text-muted"}>Uppercase letter</li>
                <li className={/[0-9]/.test(password) ? "text-success" : "text-muted"}>Number</li>
                <li className={/[^A-Za-z0-9]/.test(password) ? "text-success" : "text-muted"}>Special character</li>
              </ul>
            </>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p className="mt-3 text-center">
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
}

export default RegisterPage;
