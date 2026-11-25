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
import AddIcon from "@mui/icons-material/Add";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

import {
  ActionGroup,
  EditActionBtn,
  DeleteActionBtn,
  TablePagination,
} from "../shared/TableComponents";

const ManageIslands = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newIslandName, setNewIslandName] = useState("");
  const [newIslandNameCN, setNewIslandNameCN] = useState("");
  const [editIslandName, setEditIslandName] = useState("");
  const [editIslandNameCN, setEditIslandNameCN] = useState("");
  const [editIslandId, setEditIslandId] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);


  const { atollId, name, name_cn } = useParams();
  const token = localStorage.getItem("token");
  const pageSize = 7;

  // Fetch islands list
  const handleIslands = () => {
    axios
      .post(
        `${BaseUrl}atolls/islands`,
        { atollId },
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
    if (atollId) {
      handleIslands();
    }
  }, [atollId]);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  // Filter islands based on search query
  const filteredData = data.filter((item) =>
    item?.name?.toLowerCase().includes(query.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 1. Add Island
  const handleAddIsland = () => {
    axios
      .post(
        `${BaseUrl}atolls/islands/add`,
        { name: newIslandName, name_cn: newIslandNameCN, atollId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        toast.success("Island added successfully!");
        handleIslands();
        setNewIslandName("");
        setOpenAddModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to Add island");
        }

      });
  };

  // 2. Update Island
  const handleUpdateIsland = () => {
    axios
      .post(
        `${BaseUrl}atolls/islands/update`,
        { islandId: editIslandId, name: editIslandName, name_cn: editIslandNameCN },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success("Island updated successfully!");
        handleIslands();
        setOpenEditModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update island");
        }

      });
  };

  // toggle change status
  const handleToggleStatus = (islandId, checked) => {
    axios
      .post(
        `${BaseUrl}atolls/islands/status`,
        { islandId },
        {

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Island Active!" : "Island Inactive!");
        handleIslands();
        setOpenEditModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update status");
        }

      });
  };


  // 3. Delete Island
  const handleDeleteIsland = (islandId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Island!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}atolls/islands/delete`,
            { islandId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Island deleted successfully!");
            handleIslands();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete island");
          });
      }
    });
  }

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { guestHouseImage, ...rest } = item;  // Remove image column
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "island_data.xlsx");
  };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Island of :   <strong> {name} ({name_cn})</strong>
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
        <div className="d-flex flex-row">
          <Button
            variant="contained"
            onClick={() => setOpenAddModal(true)}
            style={{
              backgroundColor: "#1b4339",
              color: "#ffffff",
              marginRight: "10px",
              height: "40px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            <AddIcon style={{ marginRight: "8px" }} /> Add Island
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

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>English Name</TableCell>
              <TableCell>Chinese Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>

            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={item.atollId}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.name_cn}</TableCell>
                {/* Status Toggle Column */}
                <TableCell>
                  <Switch
                    checked={item.status === "active"}
                    onChange={(e) => handleToggleStatus(item.id, e.target.checked)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <ActionGroup>
                    <EditActionBtn
                      onClick={() => {
                        setEditIslandId(item.id);
                        setEditIslandName(item.name);
                        setEditIslandNameCN(item.name_cn);
                        setOpenEditModal(true);
                      }}
                    />
                    <DeleteActionBtn onClick={() => handleDeleteIsland(item.id)} />
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

      {/* Add Island Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 480,
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
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Add Island</Typography>
          <TextField
            fullWidth
            label="Island Name"
            value={newIslandName}
            onChange={(e) => setNewIslandName(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />

          <TextField
            fullWidth
            label="Island Name in Chinese"
            value={newIslandNameCN}
            onChange={(e) => setNewIslandNameCN(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddIsland}
            sx={{ marginTop: 1 }}
          >
            Add Island
          </Button>
        </Box>
      </Modal>

      {/* Edit Island Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 480,
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
            Update Island
          </Typography>

          <TextField
            fullWidth
            label="Island Name"
            value={editIslandName}
            onChange={(e) => setEditIslandName(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />

          <TextField
            fullWidth
            label="Island Name in Chinese"
            value={editIslandNameCN}
            onChange={(e) => setEditIslandNameCN(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdateIsland}
            sx={{ marginTop: 1 }}
          >
            Update Island
          </Button>
        </Box>
      </Modal>

      <ToastContainer
        position="top-right"
        autoClose={800}

      />
    </>
  );
};

export default ManageIslands;





















