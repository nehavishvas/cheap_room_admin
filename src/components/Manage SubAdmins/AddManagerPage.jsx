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
// import PersonIcon from "@mui/icons-material/Person";

const ManagerAdd = () => {
  const [newManager, setNewManager] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Manager",
    adminImage: null,
    permissions: [],
  });

  const [adminImage, setAdminImage] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const token = localStorage.getItem("token");

  // Fetch permissions from API on component mount
  useEffect(() => {
    axios
      .post(`${BaseUrl}permissions`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data.success) {
          setPermissions(response.data.data);
        } else {
          toast.error("Failed to fetch permissions.");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error fetching permissions.");
      });
  }, [token]);

  // Handle input changes for the new manager fields
  const handleAddManagerChange = (e) => {
    const { name, value } = e.target;
    setNewManager((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image change (if you are adding image upload)
  const handleImageChange = (e) => {
    setAdminImage(e.target.files[0]);
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setNewManager((prev) => {
      const permissions = checked
        ? [...prev.permissions, value]
        : prev.permissions.filter((perm) => perm !== value);
      return { ...prev, permissions };
    });
  };

  // Handle form submission for adding a new manager
  const handleAddManagerSubmit = () => {
    const formData = new FormData();
    formData.append("name", newManager.name);
    formData.append("email", newManager.email);
    formData.append("phone", newManager.phone);
    formData.append("password", newManager.password);
    formData.append("role", "Manager");

    // Send selected permissions as an array
    newManager.permissions.forEach((permission) => {
      formData.append("permissions[]", permission);
    });

    if (adminImage) {
      formData.append("adminImage", adminImage);
    }

    axios
      .post(`${BaseUrl}addUser`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Manager added successfully!");
        setNewManager({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "Manager",
          adminImage: null,
          permissions: [],
        });
        setAdminImage(null);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to add manager");
        }
      });
  };
  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: 2, marginTop: "-20px" }}>
      <div className="row">
        <div className="col-12 col-md-12 mb-4">
          <Card variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, color: "#1b4339" }}>
              Add New Manager
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <div className="row">
              <div className="col-md-6">
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Name</Typography>
                  <TextField
                    name="name"
                    value={newManager.name}
                    onChange={handleAddManagerChange}
                    fullWidth
                    margin="normal"
                  />
                </div>
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Email</Typography>
                  <TextField
                    name="email"
                    value={newManager.email}
                    onChange={handleAddManagerChange}
                    fullWidth
                    margin="normal"
                  />
                </div>
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Phone No</Typography>
                  <TextField
                    name="phone"
                    value={newManager.phone}
                    onChange={handleAddManagerChange}
                    fullWidth
                    margin="normal"
                  />
                </div>
                <div className="mb-4">
                  <Typography sx={{ fontWeight: 600 }}>Password</Typography>
                  <TextField
                    name="password"
                    value={newManager.password}
                    onChange={handleAddManagerChange}
                    fullWidth
                    margin="normal"
                    type="password"
                  />
                </div>

                {/* Image Upload Field (optional) */}
                <div className="mb-4">
                  <Button variant="outlined" component="label" fullWidth margin="normal">
                    Upload Image
                    <input
                      type="file"
                      hidden
                      onChange={handleImageChange}
                    />
                  </Button>
                  {adminImage && (
                    <Typography variant="body1" sx={{ mt: 0.5, color: '#147a8bff' }}>
                      {adminImage.name}
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
                    {permissions.slice(0, Math.ceil(permissions.length / 2)).map((perm, index) => (
                      <div className="col-md-6" key={index}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={perm}
                              onChange={handlePermissionChange}
                              checked={newManager.permissions.includes(perm)}
                            />
                          }
                          label={perm}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="row">
                    {permissions.slice(Math.ceil(permissions.length / 2)).map((perm, index) => (
                      <div className="col-md-6" key={index}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              value={perm}
                              onChange={handlePermissionChange}
                              checked={newManager.permissions.includes(perm)}
                            />
                          }
                          label={perm}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center the Add Manager Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ width: "300px", marginTop: '10px', marginBottom: '10px', padding: '11px' }}
                  onClick={handleAddManagerSubmit}
                >
                  Add Manager
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
export default ManagerAdd;
