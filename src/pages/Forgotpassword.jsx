import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { baseUrl } from "../features/Api/BaseUrl";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { LuMail, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import AuthShell from "./AuthShell";

const defaultState = {
  email: "",
};

function Forgotpassword() {
  const [state, setState] = useState(defaultState);
  const [forgotErr, setForgotErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });
  const navigate = useNavigate();

  const forgotPass = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitData = (e) => {
    e.preventDefault();
    if (state.email.trim() === "") {
      setForgotErr(true);
      return;
    }

    setForgotErr(false);
    setLoading(true);
    axios
      .post(`${baseUrl}forgot-password`, {
        email: state.email,
      })
      .then((response) => {
        if (response.data.success) {
          const forgotToken = response.data.token;
          localStorage.setItem("token", forgotToken);
          Swal.fire(
            "Check your email",
            "A password reset code was sent to your email.",
            "success"
          );
          navigate("/otp-generate");
        }
      })
      .catch((err) => {
        console.log(err);
        setError({
          errors: err,
          isError: true,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <AuthShell
      stepBadge="Password Recovery"
      title="Forgot Password?"
      subtitle="Enter your registered email address and we'll send you a 6-digit verification code."
    >
      <form onSubmit={submitData}>
        <div className="auth-field-group">
          <label htmlFor="forgot-email" className="auth-field-label">
            Email Address
          </label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">
              <LuMail />
            </span>
            <input
              id="forgot-email"
              className="auth-input"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@cheaprooms.mv"
              onChange={forgotPass}
              value={state.email}
            />
          </div>
          {forgotErr && (
            <span className="auth-error">Please enter your email address.</span>
          )}
          {error.isError && error.errors?.response?.data?.message && (
            <span className="auth-error">
              {error.errors.response.data.message}
            </span>
          )}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <>
              <span>Send Verification Code</span>
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

export default Forgotpassword;
