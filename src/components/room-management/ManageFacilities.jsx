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

const ManageFacilities = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newFacility, setNewFacility] = useState("");
  const [editFacility, setFacility] = useState("");
  const [newFacilityCN, setNewFacilityCN] = useState("");
  const [editFacilityCN, setFacilityCN] = useState("");
  const [facilityId, setfacilityId] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  const token = localStorage.getItem("token");
  const pageSize = 7;

  // Fetch room Facility list
  const RoomFacilities = () => {
    axios
      .post(
        `${BaseUrl}facilities/list`,
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
    RoomFacilities();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  const filteredData = data.filter((item) => {
    return (
      (item?.name?.toLowerCase() || "").includes(query.toLowerCase()) 
      

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



  // 1. Add Facility
  const handleAddFacility = () => {
    axios
      .post(
        `${BaseUrl}facilities/add`,
        { name: newFacility , name_cn:  newFacilityCN},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        toast.success("Facility  added successfully!");
        RoomFacilities();
        setNewFacility("");
        setOpenAddModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to add Facility");
        }

      });
  };

  // 2. Update Facility
  const handleUpdateFacility = () => {
    axios
      .post(
        `${BaseUrl}facilities/update`,
        { facilityId: facilityId, name: editFacility , name_cn: editFacilityCN },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success("Facility updated successfully!");
        RoomFacilities();
        setOpenEditModal(false);
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to Update Facility");
        }

      });
  };


  // Handle status toggle
  const handleStatusChange = (facilityId, checked) => {
    axios
      .post(
        `${BaseUrl}facilities/status`,
        { facilityId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "facility Active!" : "facility Inactive!");
        RoomFacilities();
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update status");
        }

      });
  };

  // delete room category by id
  const handleDelete = async (facilityId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the facility!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}facilities/delete`,
            { facilityId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("facility  has been deleted.");
            RoomFacilities();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete facility.");
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
          XLSX.writeFile(workbook, "Room Facilities.xlsx");
        };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Room Facilities
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
            <AddIcon style={{ marginRight: "6px", height: "21px" }} />  Add Room Facilities
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
              <TableCell>Chinese Name</TableCell>
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
                    onChange={(e) => handleStatusChange(item.id, e.target.checked)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <ActionGroup>
                    <EditActionBtn
                      onClick={() => {
                        setfacilityId(item.id);
                        setFacility(item.name);
                        setFacilityCN(item.name_cn);
                        setOpenEditModal(true);
                      }}
                    />
                    <DeleteActionBtn onClick={() => handleDelete(item.id)} />
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

      {/* Add facilities Modal */}
      <Modal open={openAddModal} onClose={() => setOpenAddModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
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
          <Typography variant="h6" component="h2" sx={{ marginBottom: 2 }}>Add Facility</Typography>
          <TextField
            fullWidth
            label="Facility Name"
            value={newFacility}
            onChange={(e) => setNewFacility(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />
          <TextField
            fullWidth
            label="Facility Name in Chinese"
            value={newFacilityCN}
            onChange={(e) => setNewFacilityCN(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddFacility}
            sx={{ marginTop: 1 }}
          >
            Add Facility
          </Button>
        </Box>
      </Modal>

      {/* Edit facilities Modal */}
      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
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
            Update  Facility
          </Typography>

          <TextField
            fullWidth
            label="Facility Name"
            value={editFacility}
            onChange={(e) => setFacility(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />

           <TextField
            fullWidth
            label="Facility Name in Chinese"
            value={editFacilityCN}
            onChange={(e) => setFacilityCN(e.target.value)}
            variant="outlined"
            margin="normal"
            sx={{ marginBottom: 1 }}
          />
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdateFacility}
            sx={{ marginTop: 1 }}
          >
            Update Facility
          </Button>
        </Box>
      </Modal>



      <ToastContainer position="top-right"
        autoClose={800}
      />
    </>
  );
}

export default ManageFacilities