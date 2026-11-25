import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { LuMail, LuLock, LuEye, LuEyeOff, LuArrowRight } from "react-icons/lu";
import AuthShell from "./AuthShell";

const defaultState = {
  email: "",
  password: "",
};

const BASEURL = "https://mobappssolutiondevelopment.com/agoda_app/api/adminAuth";

function Login() {
  const navigate = useNavigate();
  const [state, setState] = useState(defaultState);
  const [loading, setLoading] = useState(false);
  const [error] = useState({
    errors: {},
    isError: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const loginApproved = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitData = (e) => {
    e.preventDefault();
    setLoading(true);
    axios
      .post(`${BASEURL}/login`, {
        email: state.email,
        password: state.password,
      })
      .then((response) => {
        if (response.data.success) {
          const token = response.data.token;
          const name = response.data.data.name;
          const adminId = response.data.data.id;
          const phone = response.data.data.phone;
          const email = response.data.data.email;
          const adminImage = response.data.data.adminImage;
          const role = response.data.data.role;
          const permissions = response.data.data.permissions;
          localStorage.setItem("token", token);
          localStorage.setItem("name", name);
          localStorage.setItem("email", email);
          localStorage.setItem("phone", phone);
          localStorage.setItem("adminImage", adminImage);
          localStorage.setItem("role", role);
          localStorage.setItem("adminId", adminId);
          localStorage.setItem("permissions", JSON.stringify(permissions));
          Swal.fire(response.data.message, "", "success");
          navigate("/admin");
        }
      })
      .catch((err) => {
        console.log(err);
        Swal.fire(err?.response?.data?.message || "Login failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <AuthShell
        title="Welcome Back"
        subtitle="Sign in with your administrator credentials"
      >
        <form onSubmit={submitData}>
          <div className="auth-field-group">
            <label htmlFor="login-email" className="auth-field-label">
              Email Address
            </label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <LuMail />
              </span>
              <input
                id="login-email"
                className="auth-input"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="admin@cheaprooms.mv"
                onChange={loginApproved}
                value={state.email}
                required
              />
            </div>
            {error.isError && error.errors?.response?.data?.emailExistanceMessage && (
              <span className="auth-error">
                {error.errors.response.data.emailExistanceMessage}
              </span>
            )}
          </div>

          <div className="auth-field-group">
            <div className="auth-label-row">
              <label htmlFor="login-password" className="auth-field-label" style={{ margin: 0 }}>
                Password
              </label>
              <span
                className="auth-inline-link"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </span>
            </div>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                <LuLock />
              </span>
              <input
                id="login-password"
                className="auth-input"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={loginApproved}
                value={state.password}
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                aria-label="Toggle password visibility"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <LuEyeOff /> : <LuEye />}
              </button>
            </div>
            {error.isError && error.errors?.response?.data?.passwordExistanceMessage && (
              <span className="auth-error">
                {error.errors.response.data.passwordExistanceMessage}
              </span>
            )}
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <>
                <span>Sign In</span>
                <LuArrowRight style={{ fontSize: "16px" }} />
              </>
            )}
          </button>
        </form>
      </AuthShell>
      <ToastContainer />
    </>
  );
}

export default Login;
