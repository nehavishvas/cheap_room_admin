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

const ManagePayouts = () => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    // const [status, setStatus] = useState("");
    //   const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const pageSize = 8;


    // Fetch Payout list
    const Payouts = () => {
        axios
            .post(
                `${BaseUrl}payOuts`,
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
                console.log("Payout data:", response.data.data);
            })
            .catch((error) => console.error(error));
    };
    useEffect(() => {
        Payouts();
    }, []);
    const handleChangeQuery = (e) => setQuery(e.target.value);
    const filteredData = data.filter((item) => {
        return (
            (item?.payoutId?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.guesthouseName?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.status?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.requestedDate?.toLowerCase() || "").includes(query.toLowerCase())
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

    // Handle status change from dropdown
    const handleStatusChange = (payoutId, status) => {
        if (!["Approved", "Rejected"].includes(status)) {
            toast.error("Invalid status value");
            return;
        }
        axios
            .post(
                `${BaseUrl}payOuts/status`,
                { payoutId, status: status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            .then(() => {
                toast.success(`${status} status updated!`);
                Payouts();
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.message) {

                    toast.error(error.response.data.message);
                } else {
                    toast.error("Failed to update status");
                }
            });
    };
    // delete Payouts  by id
    const handleDelete = async (payoutId) => {
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
                        `${BaseUrl}payOuts/delete`,
                        { payoutId },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then(() => {
                        toast.success("Payout  has been deleted.");
                        Payouts();
                    })
                    .catch((error) => {
                        console.error(error);
                        toast.error("Failed to delete Payout.");
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
        XLSX.writeFile(workbook, "Payouts.xlsx");
    };
    return (
        <>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1b4339" }}
                style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
            >
                Manage Payouts
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
                            <TableCell>Payout Id</TableCell>
                            <TableCell>Guesthouse Name</TableCell>
                            <TableCell>Phone No</TableCell>
                            <TableCell>Currency Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Requested Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{startIndex + index + 1}</TableCell>
                                <TableCell>{item.payoutId}</TableCell>
                                <TableCell>{item.guesthouseName}</TableCell>
                                <TableCell>{item.guesthousePhone}</TableCell>
                                <TableCell>{item.paymentCurrency}</TableCell>
                                <TableCell>{item.amount}</TableCell>
                                <TableCell>{item.requestedDate || "NA"}</TableCell>
                                <TableCell>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={item.status}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Rejected">Rejected</MenuItem>
                                            <MenuItem value="Approved">Approved </MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <ActionGroup>
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
            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
}
export default ManagePayouts;
