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
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
// import EditIcon from "@mui/icons-material/Edit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import KingBedOutlinedIcon from '@mui/icons-material/KingBedOutlined';
import Slider from "react-slick";
import Switch from "@mui/material/Switch";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  ActionGroup,
  ViewActionBtn,
  DeleteActionBtn,
  RoomsActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const GuestHouseDetails = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewEdit, setViewEdit] = useState(false);
  const token = localStorage.getItem("token");
  const pageSize = 5;
  const navigate = useNavigate();

  //fetch Guesthouse List
  const handleGuestHouse = () => {
    axios
      .post(`${BaseUrl}guesthouses/list`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => console.error(error));
  };

  // Fetch initial data
  useEffect(() => {
    handleGuestHouse();
  }, []);

  const handleChangeQuery = (e) => {
    setQuery(e.target.value);
  };

  const filteredData = data.filter((item) => {
    return (
      (item?.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.address?.toLowerCase() || "").includes(
        query.toLocaleLowerCase()
      ) ||
      (item?.contactNumber?.toLowerCase() || "").includes(
        query.toLowerCase()
      ) ||
      (item?.description?.toLowerCase() || "").includes(query.toLowerCase())
    );
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // const handleEditOpen = () => setViewEdit(true);
  const handleEditClose = () => setViewEdit(false);

  //handle View Particular Action
  const handleView = (guesthouseId) => {
    navigate(`/Admin/guesthousedetail/${guesthouseId}`);
  };

  // view room bi id 

  const handleViewRoom = (guesthouseId) => {
    navigate(`/Admin/manage-room/${guesthouseId}`);
  }

  // change status
  const handleToggleStatus = (id, checked) => {
    axios
      .post(
        `${BaseUrl}guesthouses/status`, { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(
          checked ? "Guesthouse Activated!" : "Guesthouse Deactivated!"
        );
        handleGuestHouse();
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update status");
        }
      });
  };

  // Delete Guesthouse  by id
  const handleDelete = async (guesthouseId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Guesthouse !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}guesthouses/delete`,
            { guesthouseId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Guesthouse  deleted successfully!");
            handleGuestHouse();
          })
          .catch((error) => {
            if (error.response && error.response.data && error.response.data.message) {
              toast.error(error.response.data.message);
            } else {
              toast.error("Failed to delete guesthouse");
            }
          });
      }
    });
  };

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { guestHouseImage, ...rest } = item;
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "guesthouses_data.xlsx");
  };
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1b4339" }} style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}>
        Manage Guesthouse
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
            style={{ backgroundColor: "#1b4339", color: "#ffffff" }}
          >
            Export
          </Button>
        </div>
      </div>
      {/* Display table */}
      <TableContainer component={Paper}>
        <Table   >
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>Photo</TableCell>
              <TableCell>Guesthouse Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone No.</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>View Rooms</TableCell>
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
                    src={Array.isArray(item.guestHouseImage) ? item.guestHouseImage[0] : ""}
                    alt={item.name}
                    fallback={item.name || "G"}
                  />
                </TableCell>
                <TableCell title={item.name}>
                  <span>
                    {item.name?.length > 26
                      ? item.name.slice(0, 26) + "..."
                      : item.name}
                  </span>
                </TableCell>

                <TableCell title={item.address}>
                  <span style={{ color: "#5d746e" }}>
                    {item.address?.length > 26
                      ? item.address.slice(0, 26) + "..."
                      : item.address}
                  </span>
                </TableCell>
                <TableCell>{item.contactNumber}</TableCell>
                <TableCell>
                  <span style={{ fontWeight: 600, color: "#0e2f2c" }}>
                    ${item.price}
                  </span>
                </TableCell>
                <TableCell>
                  <RoomsActionBtn onClick={() => handleViewRoom(item._id)} />
                </TableCell>
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
      <Dialog open={viewEdit} onClose={handleEditClose}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <div className="row">
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Name"
                name="name"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Phone"
                name="Phone"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Description"
                name="description"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="City"
                name="city"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="State"
                name="state"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Address"
                name="address"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Longitude"
                name="Longitude"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField
                label="Lattitude"
                name="lattitude"
                fullWidth
                size="small"
                className="mt-2"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer
        position="top-right"
        autoClose={800} />
    </>
  );
};
export default GuestHouseDetails;
