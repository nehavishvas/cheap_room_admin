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
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import * as XLSX from "xlsx";

import {
  ActionGroup,
  ViewActionBtn,
  DeleteActionBtn,
  TableThumb,
  StatusBadge,
  TablePagination,
} from "../shared/TableComponents";

const BookingManagement = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const pageSize = 5;

  //  Fetch all cancelled bookings
  const handleBooking = async () => {
    try {
      const response = await axios.post(
        `${BaseUrl}bookings/list/cancelled`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setData(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching cancelled bookings:", error);
    }
  };

  useEffect(() => {
    handleBooking();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  //  Filter bookings by guesthouse name
  const filteredData = data.filter((item) =>
    item?.guestHouseName?.toLowerCase().includes(query.toLowerCase())
  );

  //  Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  //  Fetch specific booking details
  const handleView = async (bookingId) => {
    navigate(`/Admin/cancelled-booking-detail/${bookingId}`);
  };

  // deleteBooking  by id
  const handleDelete = async (bookingId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Booking!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}bookings/delete`,
            { bookingId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Booking  has been deleted.");
            handleBooking();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete Booking.");
          });
      }
    });
  };

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { guestHouseImg, ...rest } = item;  // Remove image column
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "Cancelled_booking.xlsx");
  };
  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1b4339" }} style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}>
        Cancelled  Bookings
      </Typography>
      {/*  Search + Export */}
      <div className="d-flex flex-row justify-content-between mx-1 mt-2 mb-2">
        <div>
          <TextField
            id="outlined-size-small"
            value={query}
            label="Search by Guesthouse"
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

      {/*  Cancelled Bookings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>Guesthouse Image</TableCell>
              <TableCell>Guesthouse Name</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Final Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell>
                    <TableThumb
                      src={item.guestHouseImg}
                      alt={item.guestHouseName}
                      fallback={item.guestHouseName || "B"}
                    />
                  </TableCell>
                  <TableCell title={item.guestHouseName}>
                    {item.guestHouseName?.length > 26
                      ? item.guestHouseName.slice(0, 26) + "..."
                      : item.guestHouseName}
                  </TableCell>
                  <TableCell>{new Date(item.checkIn).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(item.checkOut).toLocaleDateString()}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>{item.finalAmount}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <ActionGroup>
                      <ViewActionBtn onClick={() => handleView(item.id)} />
                      <DeleteActionBtn onClick={() => handleDelete(item.id)} />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No cancelled bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      <ToastContainer
        autoClose={800} />
    </>
  );
};
export default BookingManagement;
