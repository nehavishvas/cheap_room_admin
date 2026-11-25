import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { baseUrl } from "../features/Api/BaseUrl";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { LuLock, LuEye, LuEyeOff, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import AuthShell from "./AuthShell";

const defaultState = {
  newPassword: "",
  confirmPassword: "",
};

function ResetPassword() {
  const [state, setState] = useState(defaultState);
  const [resetPassErr, setResetPassErr] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resetToken = localStorage.getItem("resetToken");

  const resetData = (e) => {
    e.preventDefault();

    if (!state.newPassword || !state.confirmPassword) {
      setResetPassErr(true);
      return;
    }

    if (state.newPassword !== state.confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    setResetPassErr(false);
    setLoading(true);

    axios
      .post(
        `${baseUrl}reset-password`,
        {
          newPassword: state.newPassword,
          confirmPassword: state.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${resetToken}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          Swal.fire(
            "Password Reset Successfully!",
            "You can now log in with your new password.",
            "success"
          );
          navigate("/");
        }
      })
      .catch((err) => {
        console.log("Reset Password Error:", err);
        setError({
          errors: err,
          isError: true,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <AuthShell
      stepBadge="Step 3 of 3"
      title="Reset Password"
      subtitle="Create a strong new password for your administrator account."
    >
      <form onSubmit={resetData}>
        {resetPassErr && (
          <span className="auth-error" style={{ marginBottom: "12px" }}>
            Please enter both password fields.
          </span>
        )}

        <div className="auth-field-group">
          <label htmlFor="reset-new-password" className="auth-field-label">
            New Password
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <LuLock />
            </span>
            <input
              id="reset-new-password"
              className="auth-input"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              onChange={handleChange}
              value={state.newPassword}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <LuEyeOff /> : <LuEye />}
            </button>
          </div>
          {error.isError && error.errors?.response?.data?.message && (
            <span className="auth-error">
              {error.errors.response.data.message}
            </span>
          )}
        </div>

        <div className="auth-field-group">
          <label htmlFor="reset-confirm-password" className="auth-field-label">
            Confirm Password
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <LuLock />
            </span>
            <input
              id="reset-confirm-password"
              className="auth-input"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              onChange={handleChange}
              value={state.confirmPassword}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <LuEyeOff /> : <LuEye />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <span>Reset Password</span>
              <LuArrowRight style={{ fontSize: "16px" }} />
            </>
          )}
        </button>

        <div className="auth-footer-link">
          <span className="auth-back-link" onClick={() => navigate("/")}>
            <LuArrowLeft />
            <span>Back to Sign In</span>
          </span>
        </div>
      </form>
    </AuthShell>
  );
}

export default ResetPassword;
