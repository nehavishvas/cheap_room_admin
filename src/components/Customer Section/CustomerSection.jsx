import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../../features/Api/BaseUrl";
import { BaseUrl } from "../../features/Api/BaseUrl";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Switch from "@mui/material/Switch";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
const pageSize = 5;

import {
  ActionGroup,
  ViewActionBtn,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const CustomerSection = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [viewEdit, setViewEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
 const navigate = useNavigate();

  //  Edit form states
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);

  //Fetch Customers List
  const handleCustomerData = () => {
    axios
      .post(`${baseUrl}customers/list`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => setData(response.data.data))
      .catch((error) => console.error(error));
  };

  // Fetch initial data
  useEffect(() => {
    handleCustomerData();
  }, []);
  const handleChangeQuery = (e) => {
    setQuery(e.target.value);
  };

  const filteredData = data.filter((item) => {
    return (
      (item?.customer_id?.toLowerCase() || "").includes(
        query.toLowerCase()
      ) ||
      (item?.customer_name?.toLowerCase() || "").includes(
        query.toLowerCase()
      ) ||
      (item?.customer_phoneNo?.toString() || "").includes(
        query.toLowerCase()
      ) ||
      (item?.customer_email?.toString() || "").includes(query.toLowerCase()) ||
      (item?.customer_address?.toLowerCase() || "").includes(
        query.toLowerCase()
      )
    );
  });
  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  //  View Modal
  const handleView = (id) => {
     navigate(`/Admin/customer-details/${id}`);
  };
 
  // Status Toggle
  const handleToggleStatus = (id, checked) => {
    axios
      .post(
        `${BaseUrl}customers/status`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Customer Active!" : "Customer Inactive!");
        handleCustomerData();
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update status");
        }
      });
  };

  //  Edit Modal Handlers
  const handleEditOpen = (item) => {
    axios
      .post(
        `${BaseUrl}customers/view`,
        { id: item._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        const fullData = response.data.data;
        setEditData({
          id: fullData._id,
          name: fullData.name || "",
          email: fullData.email || "",
          phone: fullData.phone || "",
          address: fullData.address || "",
        });
        setViewEdit(true);
      })
      .catch((err) => console.error(err));
  };
  const handleEditClose = () => {
    setViewEdit(false);
    setEditData({
      id: "",
      name: "",
      email: "",
      phone: "",
      address: "",
    });
    setProfileImage(null);
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };
  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };
  //  Submit Update API
  const handleEditSubmit = () => {
    const formData = new FormData();
    formData.append("customerId", editData.id);
    formData.append("name", editData.name);
    formData.append("email", editData.email);
    formData.append("phone", editData.phone);
    formData.append("address", editData.address);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }
    axios
      .post(`${BaseUrl}customers/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Profile updated successfully!");
        handleEditClose();
        handleCustomerData();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update profile");
      });
  };
  // Delete Customer
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      axios
        .post(
          `${BaseUrl}customers/delete`,
          { id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          toast.success("Customer has been deleted");
          handleCustomerData();
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to delete customer");
        });
    }
  };
  const exportToExcel = () => {
    const exportData = filteredData.length ? filteredData : data;
    const filteredExportData = exportData.map(item => {
      const { profileImage, ...rest } = item; 
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "Customer.xlsx");
  };
  return (

    <div>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1b4339" }} style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}>
        Manage Customer
      </Typography>
      <div className="d-flex flex-row justify-content-between mx-1 mt-2 mb-2">
        <div>
          <TextField
            id="outlined-size-small"
            value={query}
            label="Search..."
            onChange={handleChangeQuery}
            variant="outlined"
            size="small"
          />
        </div>
        <div>
          <Button
            variant="contained"
            className="me-3 mb-3"
            onClick={exportToExcel}
            style={{ background: "linear-gradient(135deg, #e88d38 0%, #f59e0b 100%)", color: "#ffffff", borderRadius: "10px", fontWeight: 600, padding: "8px 22px", boxShadow: "0 4px 12px rgba(232, 141, 56, 0.3)" }}
          >
            Export
          </Button>
        </div>
      </div>
      {/* Display table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Phone No.</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>
                  <TableThumb
                    src={item.profileImage}
                    alt={item.name}
                    fallback={item.name || "C"}
                    rounded
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.address}</TableCell>
                <TableCell>
                  <Switch
                    checked={item.status === "active"}
                    onChange={(e) =>
                      handleToggleStatus(item._id, e.target.checked)
                    }
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <ActionGroup>
                    <ViewActionBtn onClick={() => handleView(item._id)} />
                    <DeleteActionBtn onClick={() => handleDelete(item._id)} />
                  </ActionGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
   
      {/*  Edit Modal */}
      <Dialog maxWidth="md" open={viewEdit} onClose={handleEditClose}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <div className="row">
            <div className="col-12 col-md-5 mb-2">
              <TextField
                label="Name"
                name="name"
                fullWidth
                size="small"
                className="mt-2"
                value={editData.name}
                onChange={handleEditChange}
              />
            </div>
            <div className="col-12 col-md-5 mb-2">
              <TextField
                label="Email"
                name="email"
                fullWidth
                size="small"
                className="mt-2"
                value={editData.email}
                onChange={handleEditChange}
              />
            </div>
            <div className="col-12 col-md-5 mb-2">
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                size="small"
                className="mt-2"
                value={editData.phone}
                onChange={handleEditChange}
              />
            </div>
            <div className="col-12 col-md-5 mb-2">
              <TextField
                label="Address"
                name="address"
                fullWidth
                size="small"
                className="mt-2"
                value={editData.address}
                onChange={handleEditChange}
              />
            </div>
            <div className="col-12 mb-3">
              <Typography variant="body2" sx={{ mb: 1 }}>
                Profile Image
              </Typography>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            <div className="col-12 text-end">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#1b4339",
                  "&:hover": { backgroundColor: "#e88d38" },
                }}
                onClick={handleEditSubmit}
              >
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Toast container */}
      <ToastContainer position="top-right"
        autoClose={800}
      />
    </div>
  );
};
export default CustomerSection;