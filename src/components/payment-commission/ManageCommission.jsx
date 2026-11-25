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
    Box,
    Modal
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";


import {
  ActionGroup,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const ManageCommission = () => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    // const [viewData, setViewData] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [updateAtollOpen, setUpdateAtollOpen] = useState(false);
    const [updatedCommission, setUpdatedCommission] = useState({
        adminId: "",
        commissionPercent: ""
    });

    const token = localStorage.getItem("token");
    const adminId = localStorage.getItem("adminId");

    const pageSize = 5;

    // Fetch commission percent by adminId when the component mounts
    useEffect(() => {
        axios.post(
            `${BaseUrl}commissions/get`,
            { adminId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        )
            .then((response) => {

                if (response.data && response.data.percentage) {
                    setUpdatedCommission({
                        adminId: adminId,
                        commissionPercent: response.data.percentage || ""
                    });
                }
            })
            .catch((error) => console.error(error));
    }, [adminId, token]);

    // Fetch Commissions list
    const Commissions = () => {
        axios
            .post(
                `${BaseUrl}commissions`,
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
        Commissions();
    }, []);

    // Search filter
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

    // Delete Commission by ID
    const handleDelete = async (paymentId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the Commission!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1b4339",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post(
                        `${BaseUrl}commissions/delete`,
                        { paymentId },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then(() => {
                        toast.success("Commission has been deleted.");
                        Commissions();
                    })
                    .catch((error) => {
                        console.error(error);
                        toast.error("Failed to delete Commission.");
                    });
            }
        });
    };

    // Open update modal
    const handleOpenUpdateModal = () => {
        setUpdateAtollOpen(true);
    };

    // Close update modal
    const handleCloseUpdateModal = () => {
        setUpdateAtollOpen(false);
    };

    // Handle input changes in the modal form
    const handleInputChanges = (e) => {
        const { name, value } = e.target;
        setUpdatedCommission({
            ...updatedCommission,
            [name]: value
        });
    };

    // Update commission percent
    const handleUpdateCommission = () => {
        const { adminId, commissionPercent } = updatedCommission;

        if (!commissionPercent) {
            toast.error("Please fill in all fields.");
            return;
        }

        // Send the updated commission percent to the backend
        axios
            .post(
                `${BaseUrl}commissions/set`,
                { adminId, commissionPercent },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            )
            .then((response) => {
                toast.success("Commission updated successfully.");
                setUpdateAtollOpen(false);
                Commissions();
            })
            .catch((error) => {
                toast.error("Failed to update commission.");
                console.error(error);
            });
    };

    // Export data to Excel
    const exportToExcel = () => {
        const exportData = filteredData.length ? filteredData : data;
        const filteredExportData = exportData.map(item => {
            const { guesthouseImage, ...rest } = item;
            return rest;
        });
        const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");
        XLSX.writeFile(workbook, "Commission.xlsx");
    };

    return (
        <>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1b4339" }}
                style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
            >
                Manage Commission
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
                        onClick={handleOpenUpdateModal}
                        style={{
                            backgroundColor: "#1b4339",
                            color: "#ffffff",
                            marginRight: "10px",
                            height: "40px",
                            padding: "10px 20px",
                            fontSize: "14px",
                        }}
                    >
                        Set Commission
                    </Button>
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
                            <TableCell>Photo</TableCell>
                            <TableCell>Guesthouse Name</TableCell>
                            <TableCell>Owner Name</TableCell>
                            <TableCell>Check In</TableCell>
                            <TableCell>Check Out</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Commission %</TableCell>
                            <TableCell>Commission Amount</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{startIndex + index + 1}</TableCell>
                                <TableCell>
                                    <TableThumb
                                        src={item.guesthouseImage}
                                        alt={item.guesthouseName}
                                        fallback={item.guesthouseName || "C"}
                                    />
                                </TableCell>
                                <TableCell>{item.guesthouseName || "NA"}</TableCell>
                                <TableCell>{item.guesthouseOwnerName || "NA"}</TableCell>
                                <TableCell>{item.checkIn || "NA"}</TableCell>
                                <TableCell>{item.checkOut || "NA"}</TableCell>
                                <TableCell>{item.totalAmount || "NA"}</TableCell>
                                <TableCell>{item.commissionPercent !== undefined ? `${item.commissionPercent}%` : "NA"}</TableCell>
                                <TableCell>{item.commissionAmount || "NA"}</TableCell>
                                <TableCell>
                                    <ActionGroup>
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

            {/* Modal for updating commission */}
            <Modal open={updateAtollOpen} onClose={handleCloseUpdateModal}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 500,
                        height: 250,
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
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
                        Set Commission Percent
                    </Typography>

                    {/* Commission Percentage Input */}
                    <TextField
                        label="Commission Percentage"
                        fullWidth
                        type='number'
                        margin="normal"
                        name="commissionPercent"
                        value={updatedCommission.commissionPercent}
                        onChange={handleInputChanges}
                        sx={{ mb: 2 }}
                        inputProps={{ min: 0, max: 100 }}
                    />
                    <Box sx={{ mt: 1.5, textAlign: "right" }}>
                        <Button
                            variant="contained"
                            onClick={handleUpdateCommission}
                            sx={{
                                backgroundColor: '#147a8bff',
                                color: "#ffffff",
                                '&:hover': {
                                    backgroundColor: '#126d72',
                                }
                            }}
                        >
                            Set Commission
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <ToastContainer position="top-right" autoClose={1000} />
        </>
    );
};

export default ManageCommission;
