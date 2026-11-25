import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";
import { baseUrl } from "../features/Api/BaseUrl";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";
import AuthShell from "./AuthShell";

function OtpGenerate() {
  const [otp, setOtp] = useState("");
  const [forgotErr, setForgotErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });
  const navigate = useNavigate();
  const forgotToken = localStorage.getItem("token");

  const submitData = (e) => {
    e.preventDefault();

    if (otp === "") {
      setForgotErr(true);
      return;
    }

    setForgotErr(false);
    setLoading(true);
    axios
      .post(
        `${baseUrl}verify-otp`,
        { otp: otp },
        {
          headers: {
            Authorization: `Bearer ${forgotToken}`,
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          const resetToken = response.data.token || response.data.resetToken;
          localStorage.setItem("resetToken", resetToken);
          Swal.fire(
            "OTP Verified Successfully!",
            "Proceed to reset your password.",
            "success"
          );
          navigate("/reset-password");
        }
      })
      .catch((err) => {
        console.log("OTP Verify Error:", err);
        setError({
          errors: err,
          isError: true,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <AuthShell
      stepBadge="Step 2 of 3"
      title="OTP Verification"
      subtitle="Enter the 6-digit verification code sent to your email address."
    >
      <form onSubmit={submitData}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "22px",
          }}
        >
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            containerStyle={{ gap: "8px", justifyContent: "center" }}
            inputStyle="otp-input-box"
            renderInput={(props) => <input {...props} />}
          />
          {forgotErr && (
            <span className="auth-error">Please enter your OTP!</span>
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
              <span>Verify Code</span>
              <LuArrowRight style={{ fontSize: "16px" }} />
            </>
          )}
        </button>

        <div className="auth-footer-link">
          <span
            className="auth-back-link"
            onClick={() => navigate("/forgot-password")}
          >
            <LuArrowLeft />
            <span>Change email or resend</span>
          </span>
        </div>
      </form>
    </AuthShell>
  );
}

export default OtpGenerate;
