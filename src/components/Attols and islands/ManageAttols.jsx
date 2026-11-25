import React, { useState, useEffect } from "react";
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

  Switch,
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  ActionGroup,
  ViewActionBtn,
  EditActionBtn,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const ManageAtolls = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const pageSize = 5;
  const [addAtollOpen, setAddAtollOpen] = useState(false);
  const [newAtoll, setNewAtoll] = useState({ name: "", image: null });
  const [newAtollCN, setNewAtollCN] = useState({ name_cn: "" });
  const [updateAtollOpen, setUpdateAtollOpen] = useState(false);
  const [updatedAtoll, setUpdatedAtoll] = useState({
    id: "",
    name: "",
    image: null,
  });
  const [updatedAtollCN, setUpdatedAtollCN] = useState({
    name_cn: "",
  });

  const navigate = useNavigate();

  // Fetch atolls list
  const handleAtoll = () => {
    axios
      .post(
        `${BaseUrl}atolls`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setData(response.data.data || []);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    handleAtoll();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  const filteredData = data.filter((item) => {
    return item?.name?.toLowerCase().includes(query.toLowerCase());
  });


  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ADD ATOLL
  const handleAddAtoll = () => {
    const formData = new FormData();
    formData.append("name", newAtoll.name);
    formData.append("name_cn", newAtollCN.name_cn);
    formData.append("atollImage", newAtoll.image);

    axios
      .post(`${BaseUrl}atolls/add`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Atoll added successfully!");
        handleAtoll();
        setAddAtollOpen(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
          setAddAtollOpen(false);
          setNewAtoll({ name: "", image: null });
          setNewAtollCN({ name_cn: "" });

        } else {

          toast.error("Failed to Add atoll");
        }

      });
  };

  // Handle input change for name and image
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAtoll((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle input change for name in chinese
  const handleInputChangeCN = (e) => {
    setNewAtollCN((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  // Handle file input for image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAtoll((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };

  // Delete atoll by id
  const handleDelete = async (atollId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the atoll!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}atolls/delete`,
            { atollId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Atoll deleted successfully!");
            handleAtoll();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete Atoll.");
          });
      }
    });
  };

  // UPDATE ATOLL 
  const handleUpdateAtoll = () => {
    const formData = new FormData();
    formData.append("atollId", updatedAtoll.id);
    formData.append("name", updatedAtoll.name);
    formData.append("name_cn", updatedAtollCN.name_cn);

    if (updatedAtoll.image) {
      formData.append("atollImage", updatedAtoll.image);
    }

    axios
      .post(`${BaseUrl}atolls/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() => {
        toast.success("Atoll updated successfully!");
        handleAtoll();
        setUpdateAtollOpen(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update Atoll");
        }

      });
  };


  // Handle status toggle
  const handleStatusChange = (atollId, checked) => {
    axios
      .post(
        `${BaseUrl}atolls/status`,
        { atollId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Atoll Active!" : "Atoll Inactive!");
        handleAtoll();
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update status");
        }

      });
  };

  // Handle input change for atoll name
  const handleInputChanges = (e) => {
    const { name, value } = e.target;
    setUpdatedAtoll((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle input change for atoll name in chinese
  const handleInputChangesCN = (e) => {
    setUpdatedAtollCN((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle file input change for atoll image
  const handleImageChanges = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdatedAtoll((prevState) => ({
        ...prevState,
        image: file,
      }));
    }
  };


  // Edit button click
  const handleEditClick = (item) => {
    setUpdatedAtoll({
      id: item.atollId,
      name: item.name,
      image: null,
    });
    setUpdatedAtollCN({
      name_cn: item.name_cn || "",
    });
    setUpdateAtollOpen(true);
  };



  // Navigate to view all islands
  const handleViewClick = (atollId, name, name_cn) => {
    navigate(`/Admin/all-islands/${name}/${name_cn}/${atollId}`);
  };

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { atollImage, ...rest } = item;  // Remove image column
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "Atoll_data.xlsx");
  };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Atolls
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
            onClick={() => setAddAtollOpen(true)}
            style={{
              backgroundColor: "#1b4339",
              color: "#ffffff",
              marginRight: "10px",
              height: "40px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            <AddIcon style={{ marginRight: "8px" }} /> Add Atoll
          </Button>
          <Button
            variant="contained"
            onClick={exportToExcel}

            className="me-3 mb-3"
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

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>English Name</TableCell>
              <TableCell>Chinese Name</TableCell>
              <TableCell>Total Islands</TableCell>
              <TableCell>View Island</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{startIndex + index + 1}</TableCell>

                {/* Image Column */}
                <TableCell>
                  <TableThumb
                    src={item.atollImage}
                    alt={item.name}
                    fallback={item.name || item.name_cn || "A"}
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.name_cn}</TableCell>
                <TableCell>{item.noofIsland || "0"}</TableCell>

                {/* View Island Column */}
                <TableCell>
                  <ViewActionBtn
                    title="View Islands"
                    onClick={() => handleViewClick(item.atollId, item.name, item.name_cn)}
                  />
                </TableCell>
                {/* Status Toggle Column */}
                <TableCell>
                  <Switch
                    checked={item.status === "active"}
                    onChange={(e) => handleStatusChange(item.atollId, e.target.checked)}
                    color="primary"
                  />
                </TableCell>

                {/* Actions Column */}
                <TableCell>
                  <ActionGroup>
                    <EditActionBtn onClick={() => handleEditClick(item)} />
                    <DeleteActionBtn onClick={() => handleDelete(item.atollId)} />
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

      {/* Add Atoll Modal */}
      <Modal open={addAtollOpen} onClose={() => setAddAtollOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 390,
            backgroundColor: "white",
            padding: 3,
            borderRadius: 4,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid',
            borderColor: '#147a8bff',
          }}
        >

          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
            Add Atoll
          </Typography>

          {/*English  Name Input */}
          <TextField
            label="Atoll Name"
            fullWidth
            margin="normal"
            name="name"
            value={newAtoll.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            InputLabelProps={{

            }}
          />

          {/*Chinese  Name Input */}
          <TextField
            label="Chinese Name"
            name="name_cn"
            fullWidth
            margin="normal"
            value={newAtollCN.name_cn}
            onChange={handleInputChangeCN}
            sx={{ mb: 2 }}
            InputLabelProps={{

            }}
          />
          {/* Image Input */}
          <Button variant="contained" component="label" sx={{ mt: 2, backgroundColor: '#2b9aadff', '&:hover': { backgroundColor: '#126d72' } }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>

          {newAtoll.image && (
            <Typography variant="body2" sx={{ mt: 0.5, color: '#147a8bff' }}>
              {newAtoll.image.name}
            </Typography>
          )}

          <Box sx={{ mt: 1.5, textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleAddAtoll}
              sx={{
                backgroundColor: '#147a8bff',
                color: "#ffffff",
                '&:hover': {
                  backgroundColor: '#126d72',
                }
              }}
            >
              Add Atoll
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Update Atoll Modal */}
      <Modal open={updateAtollOpen} onClose={() => setUpdateAtollOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 390,
            backgroundColor: "white",
            padding: 3,
            borderRadius: 4,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid',
            borderColor: '#147a8bff',
          }}
        >

          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
            Update Atoll
          </Typography>

          {/* English Name Input */}
          <TextField
            label="Atoll Name"
            fullWidth
            margin="normal"
            name="name"
            value={updatedAtoll.name}
            onChange={handleInputChanges}
            sx={{ mb: 2 }}
            InputLabelProps={{

            }}
          />

          {/* Chinese  Name Input */}
          <TextField
            label="Chinese Name"
            name="name_cn"
            fullWidth
            margin="normal"
            value={updatedAtollCN.name_cn}
            onChange={handleInputChangesCN}
            sx={{ mb: 2 }}
            InputLabelProps={{

            }}
          />
          {/* Image Input */}
          <Button variant="contained" component="label" sx={{ mt: 2, backgroundColor: '#2b9aadff', '&:hover': { backgroundColor: '#126d72' } }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChanges}
            />
          </Button>

          {updatedAtoll.image && (
            <Typography variant="body2" sx={{ mt: 0.5, color: '#147a8bff' }}>
              {updatedAtoll.image.name}
            </Typography>
          )}

          <Box sx={{ mt: 1.5, textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleUpdateAtoll}
              sx={{
                backgroundColor: '#147a8bff',
                color: "#ffffff",
                '&:hover': {
                  backgroundColor: '#126d72',
                }
              }}
            >
              Update Atoll
            </Button>
          </Box>
        </Box>
      </Modal>


      <ToastContainer position="top-right"
        autoClose={800}
      />
    </>
  );
};

export default ManageAtolls;

