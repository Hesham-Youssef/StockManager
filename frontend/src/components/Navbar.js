import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">Stock Manager</span>

        <div className="navbar-nav me-auto">
          {user && (
            <>
              <Link className="nav-link" to="/exchanges">
                Exchanges
              </Link>
              <Link className="nav-link" to="/stocks">
                Stocks
              </Link>
            </>
          )}
        </div>

        <div className="d-flex align-items-center text-light">
          {user ? (
            <>
              <span className="me-3">
                {user.username}{" "}
                {/* {user.roles.includes("ROLE_ADMIN") && "(Admin)"} */}
              </span>
              <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-light btn-sm me-2">
                Login
              </Link>
              <Link to="/register" className="btn btn-outline-light btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
