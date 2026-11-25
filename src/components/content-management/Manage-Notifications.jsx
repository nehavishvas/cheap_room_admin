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
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";

import {
  ActionGroup,
  DeleteActionBtn,
  TablePagination,
} from "../shared/TableComponents";

const ManageNotifications = () => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const token = localStorage.getItem("token");
    const pageSize = 7;

    // Fetch notifications list
    const handleNotif = () => {
        axios
            .post(
                `${BaseUrl}notifications/list`,
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
        handleNotif();
    }, []);

    const handleChangeQuery = (e) => setQuery(e.target.value);
    const filteredData = data.filter((item) => {
        return (
            (item?.title?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.message?.toLowerCase() || "").includes(query.toLowerCase())

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

    // delete notification by id
    const handleDelete = async (notificationId) => {
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
                        `${BaseUrl}notifications/delete`,
                        { notificationId },
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then(() => {
                        toast.success("Notification has been deleted.");
                        handleNotif();
                    })
                    .catch((error) => {
                        console.error(error);
                        toast.error("Failed to delete Notification.");
                    });
            }
        });
    };

    // delete all notifications 
    const handleAllDelete = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action will permanently delete the all notifications!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1b4339",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                axios
                    .post(
                        `${BaseUrl}notifications/delete-all`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then(() => {
                        toast.success("All Notification has been deleted.");
                        handleNotif();
                    })
                    .catch((error) => {
                        console.error(error);
                        toast.error("Failed to delete All Notification.");
                    });
            }
        });
    };
    return (
        <>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1b4339" }}
                style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
            >
                Manage Notifications
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
                    {/* Delete Button */}
                    <Button
                        variant="contained"
                        onClick={() => handleAllDelete()}
                        style={{
                            backgroundColor: "#1b4339",
                            color: "#ffffff",
                            marginRight: "14px",
                            height: "40px",

                            fontSize: "14px",
                        }}
                    >
                        <DeleteIcon style={{ marginRight: "6px", height: "21px" }} />  Delete All Notification
                    </Button>

                    {/* Export Button */}
                    <Button
                        variant="contained"
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
                            <TableCell>Title</TableCell>
                            <TableCell>Message </TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {paginatedData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{startIndex + index + 1}</TableCell>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>{item.message}</TableCell>
                                <TableCell>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>
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
            <ToastContainer />
        </>
    );
};
export default ManageNotifications;
