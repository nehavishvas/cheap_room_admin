import React, { useState, useEffect } from 'react';
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
    Switch,
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { BaseUrl } from "../../features/Api/BaseUrl";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

// Function to truncate text to a specific length with "..."
const truncateText = (text, length = 30) => {
    if (text && text.length > length) {
        return text.slice(0, length) + "...";
    }
    return text;
};

// Function to remove HTML tags
const removeHtmlTags = (htmlContent) => {
    // Create a temporary DOM element to use the browser's built-in HTML parser
    const doc = new DOMParser().parseFromString(htmlContent, "text/html");
    return doc.body.textContent || "";
};

import {
  ActionGroup,
  EditActionBtn,
  DeleteActionBtn,
  TablePagination,
} from "../shared/TableComponents";

const ManageFAQ = () => {
    const [faqs, setFaqs] = useState([]);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const pageSize = 8;
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Fetch FAQ data from the API
    const fetchFAQs = () => {
        setLoading(true);
        axios.post(`${BaseUrl}faq/list`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.data.success) {
                    setFaqs(response.data.faqs);
                } else {
                    toast.error("Failed to fetch FAQs");
                }
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.error(error);
                toast.error("Error fetching FAQ data");
            });
    };

    useEffect(() => {
        fetchFAQs();
    }, []);

    const handleChangeQuery = (e) => setQuery(e.target.value);

    const filteredData = faqs.filter((item) => {
        return (
            (item?.question?.toLowerCase() || "").includes(query.toLowerCase()) ||
            (item?.status?.toLowerCase() || "").includes(query.toLowerCase())
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Toggle FAQ status between active and inactive
    const toggleStatus = (faqId, currentStatus) => {
        const newStatus = currentStatus === "Active" ? "Inactive" : "Active";

        axios.post(`${BaseUrl}faq/status`, {
            id: faqId,
            status: newStatus,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        })
            .then((response) => {
                if (response.data.success) {
                    const updatedFaqs = faqs.map(faq =>
                        faq._id === faqId ? { ...faq, status: newStatus } : faq
                    );
                    setFaqs(updatedFaqs);
                    toast.success(`FAQ status updated to ${newStatus}`);
                } else {
                    toast.error("Failed to update FAQ status");
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error("Error updating FAQ status");
            });
    };

    const handleEdit = (id) => {
        navigate(`/Admin/faq-update/${id}`);
    };

    const handleAddFaq = () => {
        navigate("/Admin/faq-add");
    };

    // Handle FAQ Deletion
    const handleDelete = async (faqId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the FAQ.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1b4339",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (result.isConfirmed) {
            axios.post(`${BaseUrl}faq/delete`, { id: faqId }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            })
                .then((response) => {
                    if (response.data.success) {
                        const updatedFaqs = faqs.filter(faq => faq._id !== faqId);
                        setFaqs(updatedFaqs);
                        toast.success("FAQ deleted successfully!");
                    } else {
                        toast.error("Failed to delete FAQ");
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Error deleting FAQ");
                });
        }
    };

    return (
        <div>
            <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: "bold", color: "#1b4339" }}
                style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
            >
                Manage FAQ
            </Typography>

            <div className="d-flex flex-row justify-content-between mx-1 mt-2 mb-2">
                <div>
                    <TextField
                        id="outlined-size-small"
                        value={query}
                        label="Search FAQ"
                        onChange={handleChangeQuery}
                        variant="outlined"
                        size="small"
                    />
                </div>

                <div className="d-flex flex-row ">
                    <Button
                        variant="contained"
                        onClick={handleAddFaq}
                        style={{
                            backgroundColor: "#1b4339",
                            color: "#ffffff",
                            marginRight: "10px",
                            height: "40px",
                            padding: "10px 20px",
                            fontSize: "14px",
                        }}
                    >
                        <AddIcon style={{ marginRight: "8px" }} /> Add FAQ
                    </Button>
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <Typography variant="h6" color="primary" align="center">
                    Loading FAQs...
                </Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>SR No.</TableCell>
                                <TableCell>Question</TableCell>
                                <TableCell>Answer</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedData.map((item, index) => (
                                <TableRow key={item._id}>
                                    <TableCell>{startIndex + index + 1}</TableCell>
                                    <TableCell>{truncateText(item.question)}</TableCell>
                                    <TableCell>{truncateText(removeHtmlTags(item.answer))}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={item.status === "Active"}
                                            onChange={() => toggleStatus(item._id, item.status)}
                                            inputProps={{ "aria-label": "controlled" }}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <ActionGroup>
                                            <EditActionBtn onClick={() => handleEdit(item._id)} />
                                            <DeleteActionBtn onClick={() => handleDelete(item._id)} />
                                        </ActionGroup>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            <ToastContainer position="top-right" autoClose={800} />
        </div>
    );
};

export default ManageFAQ;
