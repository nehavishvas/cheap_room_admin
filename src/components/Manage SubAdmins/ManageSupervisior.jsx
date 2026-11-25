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
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Switch from "@mui/material/Switch";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const pageSize = 5;

import {
  ActionGroup,
  ViewActionBtn,
  EditActionBtn,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const ManageSupervisior = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const handleSupervisiorData = (role) => {
    axios
      .post(`${baseUrl}users/list`, { role }, {
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
    handleSupervisiorData("Supervisor");
  }, []);
  const handleChangeQuery = (e) => {
    setQuery(e.target.value);
  };
  const filteredData = data.filter((item) => {
    return (
      (item?.role?.toLowerCase() || "").includes(
        query.toLowerCase()
      ) ||
      (item?.name?.toLowerCase() || "").includes(
        query.toLowerCase()
      ) ||
      (item?.email?.toString() || "").includes(
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


  // Status Toggle
  const handleToggleStatus = (userId, role, checked) => {
    const status = checked ? 'active' : 'inactive';
    const requestBody = {
      userId,
      role,
    };
    axios
      .post(
        `${BaseUrl}users/status`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Supervisor Active!" : "Supervisor Inactive!");
        handleSupervisiorData("Supervisor");
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update status");
        }
      });
  };


  // Delete Customer
  const handleDelete = async (userId, role) => {
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
          `${BaseUrl}users/delete`,
          { userId, role: "Supervisor" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {

          toast.success("supervisor has been deleted");
          handleSupervisiorData("Supervisor");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to delete supervisor");
        });
    }
  };

  //  View Page
  const handleView = (userId, role) => {
    navigate(`/Admin/supervisior-details/${role}/${userId}`);
  };

  // Add Page
  const handleAddManagerClick = () => {
    navigate("/Admin/supervisior-add");
  };

  // Edit Page
  const handleEditManagerClick = (userId) => {
    navigate(`/Admin/supervisior-update/${userId}`);
  };

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { adminImage, ...rest } = item;
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "Supervisior.xlsx");
  };
  return (

    <div>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1b4339" }} style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}>
        Manage Supervisior
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
        <div className="d-flex flex-row ">
          <Button
            variant="contained"
            onClick={handleAddManagerClick}
            style={{
              backgroundColor: "#1b4339",
              color: "#ffffff",
              marginRight: "10px",
              height: "40px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            <AddIcon style={{ marginRight: "8px" }} /> Add Supervisor
          </Button>
          <Button
            variant="contained"
            className="me-3 mb-3"
            onClick={exportToExcel}
            style={{
              backgroundColor: "#1b4339",
              color: "#ffffff",
              height: "40px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
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
                    src={item.adminImage}
                    alt={item.name}
                    fallback={item.name || "S"}
                    rounded
                  />
                </TableCell>
                <TableCell>{item.name || "NA"}</TableCell>
                <TableCell>{item.email || "NA"}</TableCell>
                <TableCell>{item.phone || "NA"}</TableCell>
                <TableCell>
                  <Switch
                    checked={item.status === "Active"}
                    onChange={(e) =>
                      handleToggleStatus(item._id, "Supervisor", e.target.checked)
                    }
                    color="primary"
                  />
                </TableCell>

                <TableCell>
                  <ActionGroup>
                    <ViewActionBtn onClick={() => handleView(item._id, item.role)} />
                    <EditActionBtn onClick={() => handleEditManagerClick(item._id)} />
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
      {/* Toast container */}
      <ToastContainer position="top-right"
        autoClose={800}
      />
    </div >
  );
};
export default ManageSupervisior;