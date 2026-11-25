import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Box,
  Modal,
  Typography,
  Card,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import PersonIcon from "@mui/icons-material/Person";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Switch from "@mui/material/Switch";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";


import {
  ActionGroup,
  ViewActionBtn,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const GuestHouseOwner = () => {
  const [data, setData] = useState([]);
  const [viewEdit, setViewEdit] = useState(false);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const pageSize = 5;
  //  Edit form states
  const [editData, setEditData] = useState({
    guestHouseOwnerId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState(null);
   const navigate = useNavigate();

  //  Fetch Owners
  const handleOwners = () => {
    axios
      .post(
        `${BaseUrl}guesthouse/owners/list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    handleOwners();
  }, []);

  // Search
  const handleChangeQuery = (e) => setQuery(e.target.value);

  const filteredData = data.filter((item) => {
    return (
      (item?.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.email?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.phone?.toLowerCase() || "").includes(query.toLowerCase())
    );
  });

  //  Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
  };

  //  View Modal
  const handleView = (guestHouseOwnerId) => {
    navigate(`/Admin/ownerdetail/${guestHouseOwnerId}`);
  };

  

  // Status Toggle
  const handleToggleStatus = (guestHouseOwnerId, checked) => {
    axios
      .post(
        `${BaseUrl}guesthouse/owners/status`,
        { guestHouseOwnerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Guesthouse Active!" : "Guesthouse Inactive!");
        handleOwners();
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
    setEditData({
      guestHouseOwnerId: item._id,
      name: item.name || "",
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
    });
    setViewEdit(true);
  };

  const handleEditClose = () => {
    setViewEdit(false);
    setEditData({
      guestHouseOwnerId: "",
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
    formData.append("guestHouseOwnerId", editData.guestHouseOwnerId);
    formData.append("name", editData.name);
    formData.append("email", editData.email);
    formData.append("phone", editData.phone);
    formData.append("address", editData.address);
    if (profileImage) {
      formData.append("profileImage", profileImage);
    }

    axios
      .post(`${BaseUrl}guesthouse/owners/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Profile updated successfully!");
        handleEditClose();
        handleOwners();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update profile");
      });
  };

  // Delete Guesthouse Owner by id
  const handleDelete = async (guesthouseOwnerId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Guesthouse Owner!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}guesthouse/owners/delete`,
            { guesthouseOwnerId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Guesthouse Owner deleted successfully!");
            handleOwners();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete Guesthouse Owner.");
          });
      }
    });
  };


  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { profileImage, ...rest } = item;  // Remove image column
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "guesthousesOwner_data.xlsx");
  };


  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1b4339" }} style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}>
        Manage Guesthouse Owners
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
            onClick={exportToExcel}
            variant="contained"
            className="me-3 mb-3"
            style={{ backgroundColor: "#1b4339", color: "#ffffff" }}
          >
            Export
          </Button>
        </div>
      </div>

      {/*  Table */}
      <TableContainer component={Paper} sx={{ maxHeight: "70vh", overflowY: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone No.</TableCell>
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
                    fallback={item.name || "O"}
                    rounded
                  />
                </TableCell>

                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.phone}</TableCell>
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
      <ToastContainer position="top-right"
        autoClose={800}
      />
    </>
  );
};
export default GuestHouseOwner;
