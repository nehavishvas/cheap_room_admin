import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import {
  Card,
  TextField,
  Button,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";

const UpdateSupervisor = () => {

  const { userId } = useParams();


  const [managerData, setManagerData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Supervisor",
    adminImage: null,
    permissions: [],

  });

  const [adminImageFile, setAdminImageFile] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const token = localStorage.getItem("token");

  // --- 1. Fetch All Permissions and Supervisor Details ---
  useEffect(() => {
    // Function to fetch Supervisor's existing data and permissions
    const fetchManagerData = () => {
      if (!userId) {
        toast.error("Supervisor ID not found.");
        return;
      }
      axios
        .post(
          `${BaseUrl}users/view`,
          { userId: userId, role: "Supervisor" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          const fullData = response.data.data;
          setManagerData((prev) => ({
            ...prev,
            name: fullData.name || "",
            email: fullData.email || "",
            phone: fullData.phone || "",
            permissions: fullData.permissions || [],

          }));
        })
        .catch((err) => {
          console.error("Supervisor data fetch error:", err);
          toast.error("Failed to fetch Supervisor details.");
        });
      axios
        .post(`${BaseUrl}permissions`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data.success) {
            setAllPermissions(response.data.data);
          } else {
            toast.error("Failed to fetch permissions list.");
          }
        })
        .catch((err) => {
          console.error("Permissions list fetch error:", err);
          toast.error("Error fetching permissions list.");
        });
    };

    fetchManagerData();
  }, [token, userId]);

  // Handle input changes
  const handleManagerChange = (e) => {
    const { name, value } = e.target;
    setManagerData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle new image file selection
  const handleImageChange = (e) => {
    setAdminImageFile(e.target.files[0]);
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setManagerData((prev) => {
      const permissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter((perm) => perm !== value);
      return { ...prev, permissions };
    });
  };


  const handleUpdateManagerSubmit = () => {
    if (!userId) {
      toast.error("Cannot update: Supervisor ID is missing.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("name", managerData.name);
    formData.append("email", managerData.email);
    formData.append("phone", managerData.phone);
    formData.append("role", "Supervisor");


    managerData.permissions.forEach((permission) => {
      formData.append("permissions[]", permission);
    });

    if (adminImageFile) {
      formData.append("adminImage", adminImageFile);
    }

    axios
      .post(`${BaseUrl}users/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Supervisor profile updated successfully!");

      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update Supervisor profile");
        }
      });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: 2, marginTop: "-20px" }}>
      <div className="row">
        <div className="col-12 col-md-12 mb-4">
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#1b4339" }}>
              Update Supervisor Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <div className="row">
              <div className="col-md-6">
                {/* Name Input */}
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Name</Typography>
                  <TextField
                    name="name"
                    value={managerData.name}
                    onChange={handleManagerChange}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </div>
                {/* Email Input */}
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Email</Typography>
                  <TextField
                    name="email"
                    value={managerData.email}
                    onChange={handleManagerChange}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </div>
                {/* Phone Input */}
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Phone No</Typography>
                  <TextField
                    name="phone"
                    value={managerData.phone}
                    onChange={handleManagerChange}
                    fullWidth
                    margin="normal"
                    size="small"
                  />
                </div>
                {/* Image Upload Field */}
                <div className="mb-4">
                  <Button variant="outlined" component="label" fullWidth margin="normal">
                    Upload New Image
                    <input
                      type="file"
                      hidden
                      onChange={handleImageChange}
                    />
                  </Button>
                  {adminImageFile && (
                    <Typography variant="body1" display="block" sx={{ mt: 1, color: 'green' }}>
                      {adminImageFile.name}
                    </Typography>
                  )}

                  {managerData.currentImage && (
                    <Typography variant="caption" display="block" sx={{ mt: 1, color: 'green' }}>
                      Current Image: {managerData.currentImage.substring(managerData.currentImage.lastIndexOf('/') + 1)}
                    </Typography>
                  )}

                </div>
              </div>

              <div className="col-md-6">
                {/* Permission checkboxes */}
                <div className="mb-4" style={{ marginLeft: '100px', marginTop: '5px' }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    Select Permissions 
                  </Typography>

                  {/* Create two columns for permissions */}
                  <div className="row">
                    {allPermissions.slice(0, Math.ceil(allPermissions.length / 2)).map((perm, index) => (
                      <div className="col-md-6" key={index}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={perm}
                              onChange={handlePermissionChange}
                              checked={managerData.permissions.includes(perm)}
                            />
                          }
                          label={perm}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="row">
                    {allPermissions.slice(Math.ceil(allPermissions.length / 2)).map((perm, index) => (
                      <div className="col-md-6" key={index}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={perm}
                              onChange={handlePermissionChange}
                              checked={managerData.permissions.includes(perm)}
                            />
                          }
                          label={perm}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ width: "300px", marginTop: '10px', marginBottom: '10px', padding: '11px' }}
                  onClick={handleUpdateManagerSubmit}
                >
                  Update Supervisor
                </Button>
              </Box>
            </div>
          </Card>
        </div>
      </div>
      <ToastContainer autoClose={800} />
    </Box>
  );
};

export default UpdateSupervisor;