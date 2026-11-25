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
  Card,
  Divider,
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PersonIcon from "@mui/icons-material/Person";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";

import {
  ActionGroup,
  ViewActionBtn,
  TableThumb,
  StatusBadge,
  TablePagination,
} from "../shared/TableComponents";

const UpcomingBookings = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const token = localStorage.getItem("token");
  const pageSize = 10;

  //  Fetch upcoming bookings
  const fetchUpcomingBookings = async () => {
    try {
      const res = await axios.post(
        `${BaseUrl}bookings/list/upcoming`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching upcoming bookings:", err);
    }
  };

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  //  View single booking details
  const handleView = async (bookingId) => {
    try {
      const res = await axios.post(
        `${BaseUrl}bookings/view`,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setViewData(res.data?.data || {});
      setViewOpen(true);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    }
  };

  //  Search logic
  const handleChangeQuery = (e) => setQuery(e.target.value);

  const filteredData = data.filter((item) =>
    item?.guestHouseName?.toLowerCase().includes(query.toLowerCase())
  );

  //  Pagination logic
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#1b4339" }} style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}>
        Upcoming Bookings
      </Typography>
      {/*  Search and Export */}
      <div className="d-flex flex-row justify-content-between mx-1 mt-2 mb-2">
        <TextField
          label="Search by Guesthouse"
          value={query}
          onChange={handleChangeQuery}
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          className="me-3 mb-3"
          sx={{ backgroundColor: "#1b4339", color: "#fff" }}
        >
          Export
        </Button>
      </div>

      {/*  Table */}
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
                  <TableCell>{item.guestHouseName}</TableCell>
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
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No upcoming bookings found.
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

      {/*  Modal (View Details) */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "55%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: "10px",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2}>
            Booking Details
          </Typography>

          {/* Booking Info */}
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: "#1b4339" }}>
              <BookmarkIcon /> Booking Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ mb: 1.5 }}>
              <strong>Guesthouse:</strong> {viewData?.guestHouseName || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Address:</strong> {viewData?.guestHouseAddress || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Check In:</strong>{" "}
              {viewData?.checkIn ? new Date(viewData.checkIn).toLocaleDateString() : "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Check Out:</strong>{" "}
              {viewData?.checkOut ? new Date(viewData.checkOut).toLocaleDateString() : "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Guests:</strong> {viewData?.guest || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Rooms:</strong> {viewData?.room || "N/A"}
            </Typography>
             <Typography sx={{ mb: 1.5 }}>
              <strong>Room Type:</strong> {viewData?.roomType || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Amount:</strong> ₹{viewData?.amount || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Discount:</strong> {viewData?.discount || "0"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Cleaning Fee:</strong> {viewData?.cleaningFee || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Tax:</strong> {viewData?.taxAmount || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Final Amount:</strong> ₹{viewData?.finalAmount || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: "#1b4339", fontWeight: 600 }}>
                {viewData?.status || "N/A"}
              </span>
            </Typography>
          </Card> 

          {/* Customer Details */}
          <Card variant="outlined" sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: "#1b4339" }}>
              <PersonIcon /> Payment Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography sx={{ mb: 1.5 }}>
              <strong>Name:</strong> {viewData?.paymentDetails?.customerName || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Contact:</strong> {viewData?.paymentDetails?.customerContact || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Method:</strong> {viewData?.paymentDetails?.paymentMethod || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Status:</strong> {viewData?.paymentDetails?.paymentStatus || "N/A"}
            </Typography>
            <Typography sx={{ mb: 1.5 }}>
              <strong>Date:</strong>{" "}
              {viewData?.paymentDetails?.paymentDate
                ? new Date(viewData.paymentDetails.paymentDate).toLocaleDateString()
                : "N/A"}
            </Typography>
          </Card>

          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              onClick={() => setViewOpen(false)}
              sx={{
                backgroundColor: "#1b4339",
                "&:hover": { backgroundColor: "#e88d38" },
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

    </>
  );
};

export default UpcomingBookings;
