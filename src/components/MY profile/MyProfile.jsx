import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, InputLabel } from "@mui/material";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { LuCamera, LuUserCheck, LuSave } from "react-icons/lu";

const MyProfile = () => {
  const [data, setData] = useState({ name: "", email: "", phone: "", adminImage: "", role: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [imgError, setImgError] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  const getApi = () => {
    axios
      .post(
        `${BaseUrl}profile-view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setData(response.data.data);
        setSelectedFile(null);
        setSelectedFileName("");
        setImgError(false);
        const { name, email, adminImage, phone, role } = response.data.data;
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("adminImage", adminImage);
        localStorage.setItem("phone", phone);
        localStorage.setItem("role", role);
      })
      .catch((error) => {
        console.log(error?.response?.data || error.message);
        toast.error("Failed to fetch profile");
      });
  };

  useEffect(() => {
    getApi();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileName(file.name);
      setImgError(false);
    }
  };

  const handleUpdateProfile = () => {
    setSaving(true);
    const formData = new FormData();

    for (let key in data) {
      if (key !== "adminImage") {
        formData.append(key, data[key]);
      }
    }

    if (selectedFile) {
      formData.append("adminImage", selectedFile);
    }

    axios
      .post(`${BaseUrl}profile-update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        Swal.fire("Success", "Profile updated successfully", "success");
        window.dispatchEvent(new Event("profileUpdated"));
        getApi();
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update Profile");
        }
      })
      .finally(() => setSaving(false));
  };

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : data.adminImage;
  const initials =
    (data.name || "A")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "A";

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e2eae7",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 2px 12px rgba(14, 47, 44, 0.04)",
        }}
      >
        {/* Subtle Brand Cover Header */}
        <div
          style={{
            height: "108px",
            background: "linear-gradient(135deg, #0d2c28 0%, #15453e 65%, #1c584f 100%)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "24px",
              bottom: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "5px 12px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.12)",
              color: "#f5f2eb",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            <LuUserCheck style={{ color: "#eb943d", fontSize: "14px" }} />
            <span>{data.role || "Admin"}</span>
          </div>
        </div>

        <div style={{ padding: "0 28px 30px" }}>
          {/* Avatar + Identity Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: "16px",
              marginTop: "-48px",
              marginBottom: "28px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: "18px", flexWrap: "wrap" }}>
              <div style={{ position: "relative" }}>
                {previewUrl && !imgError ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    onError={() => setImgError(true)}
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid #ffffff",
                      boxShadow: "0 6px 18px rgba(14, 47, 44, 0.14)",
                      background: "#0e2f2c",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      borderRadius: "50%",
                      border: "4px solid #ffffff",
                      boxShadow: "0 6px 18px rgba(14, 47, 44, 0.14)",
                      background: "#0e2f2c",
                      color: "#eb943d",
                      fontSize: "28px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {initials}
                  </div>
                )}

                <label
                  htmlFor="adminImage"
                  title="Change profile photo"
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: "#eb943d",
                    color: "#ffffff",
                    border: "2px solid #ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.18)",
                  }}
                >
                  <LuCamera style={{ fontSize: "14px" }} />
                </label>

                <input
                  id="adminImage"
                  type="file"
                  accept="image/*"
                  name="adminImage"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>

              <div style={{ paddingBottom: "4px" }}>
                <h5
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: "19px",
                    fontWeight: 700,
                    color: "#0e2f2c",
                  }}
                >
                  {data.name || "Admin Account"}
                </h5>
                <span style={{ fontSize: "13px", color: "#5d746e" }}>
                  {data.email || "Manage your personal details and contact info"}
                </span>
                {selectedFileName && (
                  <div style={{ fontSize: "12px", color: "#eb943d", fontWeight: 600, marginTop: "3px" }}>
                    Selected: {selectedFileName}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2-Column Clean Form Grid */}
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <InputLabel
                shrink
                style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px", marginBottom: "2px" }}
              >
                Full Name
              </InputLabel>
              <TextField
                value={data.name || ""}
                onChange={handleChange}
                name="name"
                variant="outlined"
                fullWidth
                size="small"
              />
            </div>

            <div className="col-12 col-md-6">
              <InputLabel
                shrink
                style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px", marginBottom: "2px" }}
              >
                Email Address
              </InputLabel>
              <TextField
                value={data.email || ""}
                onChange={handleChange}
                name="email"
                variant="outlined"
                fullWidth
                size="small"
              />
            </div>

            <div className="col-12 col-md-6">
              <InputLabel
                shrink
                style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px", marginBottom: "2px" }}
              >
                Phone Number
              </InputLabel>
              <TextField
                value={data.phone || ""}
                onChange={handleChange}
                name="phone"
                variant="outlined"
                fullWidth
                size="small"
              />
            </div>

            <div className="col-12 col-md-6">
              <InputLabel
                shrink
                style={{ fontWeight: 600, color: "#3f5852", fontSize: "13px", marginBottom: "2px" }}
              >
                Admin Role
              </InputLabel>
              <TextField
                value={data.role || ""}
                name="role"
                variant="outlined"
                fullWidth
                size="small"
                disabled
                InputProps={{
                  style: { backgroundColor: "#f6f8f7" },
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid #eef3f1",
            }}
          >
            <Button
              variant="contained"
              onClick={handleUpdateProfile}
              disabled={saving}
              startIcon={<LuSave style={{ fontSize: "16px" }} />}
              style={{
                padding: "9px 24px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={800} />
    </div>
  );
};

export default MyProfile;
