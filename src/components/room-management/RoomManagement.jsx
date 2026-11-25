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
  Typography,
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import Slider from "react-slick";
import Switch from "@mui/material/Switch";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  ActionGroup,
  ViewActionBtn,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const RoomManagement = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const pageSize = 5;

  const {guesthouseId} = useParams() ;
  // Fetch room list
  const handleRooms = () => {
    axios
      .post(
        `${BaseUrl}guesthouse/rooms/list`,
        {guesthouseId},
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
    handleRooms();
  }, []);
  const handleChangeQuery = (e) => setQuery(e.target.value);
  const filteredData = data.filter((item) => {
    return (
      (item?.roomCategory?.toLowerCase() || "").includes(query.toLowerCase()) 
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
  // View Modal
  const handleView = (roomId) => {
    navigate(`/Admin/roomdetail/${roomId}`);
  };
  //  Toggle Status
  const handleToggleStatus = (roomId, checked) => {
    axios
      .post(
        `${BaseUrl}rooms/status`,
        { roomId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Room Activated!" : "Room Deactivated!");
        handleRooms();
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update status");
        }
      });
  };

  //  Delete Room 
  const handleDelete = async (roomId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the room!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}rooms/delete`,
            { roomId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Room has been deleted.");
            handleRooms();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete room.");
          });
      }
    });
  };

  const exportToExcel = () => {
    const exportData = filteredData.length ? filteredData : data;
    const filteredExportData = exportData.map(item => {
      const { profileImage, ...rest } = item;
      return rest;
    });
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");
    XLSX.writeFile(workbook, "AllRooms.xlsx");
  };
  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Rooms
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
            onClick={exportToExcel}
            className="me-3 mb-3"
            style={{ backgroundColor: "#1b4339", color: "#ffffff" }}
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
              <TableCell>Room Category</TableCell>
              <TableCell>Price Per Nigh</TableCell>
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
                    src={Array.isArray(item.photos) ? item.photos[0] : ""}
                    alt={item.roomCategory || "Room"}
                    fallback={item.guesthouseName || "R"}
                  />
                </TableCell>
                <TableCell title={item.roomCategory}>
                  {item.roomCategory?.length > 30
                    ? item.roomCategory.slice(0, 30) + "..."
                    : item.roomCategory}
                </TableCell>
                <TableCell>{item.pricePerNight}</TableCell>
                <TableCell>{item.contactNumber}</TableCell>
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
      <ToastContainer position="top-right"
        autoClose={800}
      />
    </>
  );
};
export default RoomManagement;
