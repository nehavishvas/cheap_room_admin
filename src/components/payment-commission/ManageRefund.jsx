import React, { useState, useEffect } from 'react';
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
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
// import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import {
  ActionGroup,
  DeleteActionBtn,
  TablePagination,
} from "../shared/TableComponents";

const ManageRefund = () => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // const [status, setStatus] = useState("");
    //   const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const pageSize = 8;

    // Fetch refund list
    const Refunds = () => {
        axios
            .post(
                `${BaseUrl}refunds`,
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
        Refunds();
    }, []);

    const handleChangeQuery = (e) => setQuery(e.target.value);
    const filteredData = data.filter((item) => {
        return (
            (item?.customerName?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.guesthouseName?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.paymentStatus?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.checkIn?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.checkOut?.toLowerCase() || "").includes(query.toLowerCase())
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

    const handleStatusChange = (paymentId, refundStatus) => {
        if (!["refunded", "refund_rejected"].includes(refundStatus)) {
            toast.error("Invalid status value");
            return;
        }
        axios
            .post(
                `${BaseUrl}refunds/status`,
                { paymentId, refundStatus: refundStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            .then(() => {
                toast.success(`${refundStatus} status updated!`);
                Refunds();
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {

                    toast.error(error.response.data.message);
                } else {
                    toast.error("Failed to update status");
                }
            });
    };
    // delete Refund  by id
    const handleDelete = async (paymentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the Report!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1b4339",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post(
                        `${BaseUrl}refunds/delete`,
                        { paymentId },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then(() => {
                        toast.success("Refund  has been deleted.");
                        Refunds();
                    })
                    .catch((error) => {
                        if (error.response && error.response.data && error.response.data.message) {
                            toast.error(error.response.data.message);
                        } else {
                            toast.error("Failed to  delete refund");
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
            const { issueImage, ...rest } = item;  // Remove image column
            return rest;
        });
        // Create the worksheet with filtered data
        const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");
        // Write to file
        XLSX.writeFile(workbook, "Refunds.xlsx");
    };
    return (
        <>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1b4339" }}
                style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
            >
                Manage Refunds
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
                            <TableCell>Customer Name</TableCell>
                            <TableCell>Guesthouse Name</TableCell>
                            <TableCell>Check In</TableCell>
                            <TableCell>Check Out</TableCell>
                            <TableCell>Paid Amount</TableCell>
                            <TableCell>Refund Type</TableCell>
                            <TableCell>Refund Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{startIndex + index + 1}</TableCell>
                                <TableCell>{item.customerName}</TableCell>
                                <TableCell>{item.guesthouseName}</TableCell>
                                <TableCell>{item.checkIn}</TableCell>
                                <TableCell>{item.checkOut}</TableCell>
                                <TableCell>{item.paidAmount}</TableCell>
                                <TableCell>{item.refundType}</TableCell>
                                <TableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={
                                                item.paymentStatus?.toLowerCase() === "refund_pending"
                                                    ? "Refund_pending"
                                                    : item.paymentStatus?.toLowerCase()
                                            }
                                            onChange={(e) => handleStatusChange(item.paymentId, e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="Refund_pending" disabled>Pending</MenuItem>
                                            <MenuItem value="refunded">Approved</MenuItem>
                                            <MenuItem value="refund_rejected">Rejected</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <ActionGroup>
                                        <DeleteActionBtn onClick={() => handleDelete(item.paymentId)} />
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
            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
}
export default ManageRefund;
