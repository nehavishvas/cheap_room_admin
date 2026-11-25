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
  Typography,
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import {
  ActionGroup,
  ViewActionBtn,
  DeleteActionBtn,
  StatusBadge,
  TablePagination,
} from "../shared/TableComponents";

const ManagePayment = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const pageSize = 8;

  // Fetch Payment list
  const Payments = () => {
    axios
      .post(
        `${BaseUrl}payments`,
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
    Payments();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);
  const filteredData = data.filter((item) => {
    return (
      (item?.guesthouse?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.customer?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.paymentStatus?.toLowerCase() || "").includes(query.toLowerCase())
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
  //  View Payment Deatils
  const handleView = (paymentId) => {
    navigate(`/Admin/payments-details/${paymentId}`);
  };


  // deleteBooking  by id
  const handleDelete = async (paymentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Payment!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}payments/delete`,
            { paymentId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Payment  has been deleted.");
            Payments();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete Payment.");
          });
      }
    });
  };

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { profileImage, ...rest } = item;
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "Payment.xlsx");
  };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Payments
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
              <TableCell> Guesthouse Name</TableCell>
              <TableCell>Customer Name</TableCell>
              <TableCell >Amount</TableCell>
              <TableCell >Payment Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{startIndex + index + 1}</TableCell>
                <TableCell title={item.guesthouse}>
                  {item.guesthouse?.length > 26
                    ? item.guesthouse.slice(0, 26) + "..."
                    : item.guesthouse}
                </TableCell>
                <TableCell>{item.customer}</TableCell>
                <TableCell>{item.amount}</TableCell>
                <TableCell>
                  <StatusBadge status={item.paymentStatus} />
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
}
export default ManagePayment