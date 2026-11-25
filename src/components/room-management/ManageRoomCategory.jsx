import React, { useState, useEffect } from 'react'
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
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Switch from "@mui/material/Switch";
import "slick-carousel/slick/slick.css";
import EditIcon from "@mui/icons-material/Edit";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import {
  ActionGroup,
  EditActionBtn,
  DeleteActionBtn,
  TablePagination,
} from "../shared/TableComponents";

const ManageRoomCategory = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryCN, setNewCategoryCN] = useState("");
  // const [description, setDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCategoryCN, setEditCategoryCN] = useState("");

  // const [editDescription, setEditDescription] = useState("");
  const [roomCatId, setRoomCatId] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const token = localStorage.getItem("token");
  const pageSize = 7;

  // Fetch room category list
  const RoomCategory = () => {
    axios
      .post(
        `${BaseUrl}roomCategory/list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    RoomCategory();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  const filteredData = data.filter((item) => {
    return (
      (item?.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.name_cn?.toLowerCase() || "").includes(query.toLowerCase())

    );
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



  // 1. Add Category
  const handleAddCategory = () => {
    axios
      .post(
        `${BaseUrl}roomCategory/add`,
        { name: newCategory , name_cn:  newCategoryCN},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        toast.success("Category added successfully!");
        RoomCategory();
        setNewCategory("");
        setOpenAddModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to Add Room category");
        }

      });
  };

  // 2. Update Category
  const handleUpdateCategory = () => {
    axios
      .post(
        `${BaseUrl}roomCategory/edit`,
        { roomCatId: roomCatId, name: editCategory , name_cn: editCategoryCN },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success("Category updated successfully!");
        RoomCategory();
        setOpenEditModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update Room Category");
        }

      });
  };


  // Handle status toggle
  const handleStatusChange = (roomCatId, checked) => {
    axios
      .post(
        `${BaseUrl}roomCategory/status`,
        { roomCatId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Category Active!" : "Category Inactive!");
        RoomCategory();
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to update status");
      });
  };

  // delete room category by id
  const handleDelete = async (roomCatId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the room category!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}roomCategory/delete`,
            { roomCatId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Room category  has been deleted.");
            RoomCategory();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete Room category.");
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
        XLSX.writeFile(workbook, "Customer.xlsx");
      };



  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Room Category
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
          {/* Add Button */}
          <Button
            variant="contained"
            onClick={() => setOpenAddModal(true)}
            style={{
              backgroundColor: "#1b4339",
              color: "#ffffff",
              marginRight: "14px",
              height: "40px",

              fontSize: "14px",
            }}
          >
            <AddIcon style={{ marginRight: "6px", height: "21px" }} />  Add Room Category
          </Button>

          {/* Export Button */}
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
        <Table >
          <TableHead >
            <TableRow >
              <TableCell >SR No.</TableCell>
              <TableCell>English Name</TableCell>
              <TableCell>Chinese Name </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.name_cn}</TableCell>
                <TableCell>
                  <Switch
                    checked={item.status === "active"}
                    onChange={(e) => handleStatusChange(item._id, e.target.checked)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <ActionGroup>
                    <EditActionBtn
                      onClick={() => {
                        setRoomCatId(item._id);
                        setEditCategoryCN(item.name_cn);
                        setEditCategory(item.name);
                        setOpenEditModal(true);
                      }}
                    />
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

      {/* Add Category Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            height: 300,
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
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Add Room Category</Typography>
          <TextField
            fullWidth
            label="Category Name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />
          <TextField
            fullWidth
            label="Category Name in Chinese"
            value={newCategoryCN}
            onChange={(e) => setNewCategoryCN(e.target.value)}
            variant="outlined"
            margin="normal"
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddCategory}
            sx={{ marginTop: 1 }}
          >
            Add Category
          </Button>
        </Box>
      </Modal>

      {/* Edit Category Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            height: 300,
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
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>
            Update Room Category
          </Typography>

          <TextField
            fullWidth
            label="Category Name"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />
          <TextField
            fullWidth
            label="Category Name in Chinese"
            value={editCategoryCN}
            onChange={(e) => setEditCategoryCN(e.target.value)}
            variant="outlined"
            margin="normal"
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdateCategory}
            sx={{ marginTop: 1 }}
          >
            Update Room Category
          </Button>
        </Box>
      </Modal>



      <ToastContainer position="top-right"
        autoClose={800}
      />
    </>
  );
}

export default ManageRoomCategory