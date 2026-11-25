import React, { useState } from "react";
import { TextField, Button, InputLabel, InputAdornment, Typography } from "@mui/material";
import axios from "axios";
import { BaseUrl } from "../features/Api/BaseUrl";
import { toast, ToastContainer } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { LuLock } from "react-icons/lu";

const defaultState = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePassword = () => {
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });
  const [state, setState] = useState(defaultState);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const submitData = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const submitFormData = (e) => {
    e.preventDefault();
    setSubmitting(true);
    axios
      .post(
        `${BaseUrl}change-password`,
        {
          oldPassword: state.oldPassword,
          newPassword: state.newPassword,
          confirmPassword: state.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message);
        if (response.data.success) {
          setState(defaultState);
          setError({
            errors: {},
            isError: false,
          });
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to update password");
        setError({
          errors: err,
          isError: true,
        });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div style={{ maxWidth: "560px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        Change Password
      </Typography>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2eae7",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 2px 12px rgba(14, 47, 44, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "22px",
            paddingBottom: "18px",
            borderBottom: "1px solid #eef3f1",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#f2faf7",
              border: "1px solid #d7ece3",
              color: "#134e45",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              flexShrink: 0,
            }}
          >
            <LuLock />
          </div>
          <div>
            <h5 style={{ margin: "0 0 2px 0", fontSize: "16.5px", fontWeight: 700, color: "#0e2f2c" }}>
              Account Security
            </h5>
            <p style={{ margin: 0, fontSize: "13px", color: "#5d746e" }}>
              Update your password to keep your admin account protected.
            </p>
          </div>
        </div>

        {error.isError && error?.errors?.response?.data?.OldPasswordValidMessage && (
          <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>
            {error.errors.response.data.OldPasswordValidMessage}
          </div>
        )}

        <form onSubmit={submitFormData} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <InputLabel shrink style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px" }}>
              Current Password
            </InputLabel>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              name="oldPassword"
              placeholder="Enter current password"
              type={showOldPassword ? "text" : "password"}
              onChange={submitData}
              value={state.oldPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <span
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{ color: "#5d746e", cursor: "pointer", display: "flex" }}
                    >
                      {showOldPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {error.isError && error?.errors?.response?.data?.oldPasswordMessage && (
              <span style={{ color: "#dc2626", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {error.errors.response.data.oldPasswordMessage}
              </span>
            )}
          </div>

          <div>
            <InputLabel shrink style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px" }}>
              New Password
            </InputLabel>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              name="newPassword"
              placeholder="Enter new password"
              type={showNewPassword ? "text" : "password"}
              onChange={submitData}
              value={state.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <span
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{ color: "#5d746e", cursor: "pointer", display: "flex" }}
                    >
                      {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {error.isError && error?.errors?.response?.data?.passwordMessage && (
              <span style={{ color: "#dc2626", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {error.errors.response.data.passwordMessage}
              </span>
            )}
          </div>

          <div>
            <InputLabel shrink style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px" }}>
              Confirm New Password
            </InputLabel>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              name="confirmPassword"
              placeholder="Re-enter new password"
              type={showConfirmPassword ? "text" : "password"}
              onChange={submitData}
              value={state.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{ color: "#5d746e", cursor: "pointer", display: "flex" }}
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            {error.isError &&
              (error?.errors?.response?.data?.passwordMatchMessage ||
                error?.errors?.response?.data?.confirmPasswordMessage) && (
                <span style={{ color: "#dc2626", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {error.errors.response.data.passwordMatchMessage ||
                    error.errors.response.data.confirmPasswordMessage}
                </span>
              )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingTop: "12px",
              borderTop: "1px solid #eef3f1",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              style={{
                padding: "9px 26px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {submitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={800} />
    </div>
  );
};

export default ChangePassword;
