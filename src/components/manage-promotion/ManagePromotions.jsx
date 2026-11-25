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
  MenuItem, Select, InputLabel, FormControl,
  Box,
  Modal,
  Typography,
  Card,
  Switch,
} from "@mui/material";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";


const formatApiDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  // Date object se 'YYYY-MM-DD' format generate karna
  return date.toISOString().split('T')[0];
};

import {
  ActionGroup,
  ViewActionBtn,
  EditActionBtn,
  DeleteActionBtn,
  TableThumb,
  TablePagination,
} from "../shared/TableComponents";

const ManagePromotions = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [addPromoOpen, setAddPromoOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "",
    discountValue: "",
    startDate: "",
    endDate: "",
    promoImage: null,
  });

  const token = localStorage.getItem("token");
  const pageSize = 7;

  // Fetch All Promo Codes
  const handlePromoCodes = () => {
    axios
      .post(
        `${BaseUrl}promos/list`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setData(response.data.data || []);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to fetch promo codes");
      });
  };

  useEffect(() => {
    handlePromoCodes();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  // Filter Promo Codes
  const filteredData = data.filter((item) => {
    return (
      (item?.code?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.discountType?.toLowerCase() || "").includes(query.toLowerCase()) ||
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

  // View Modal - Fetch promo details
  const handleViewOpen = (id) => {
    navigate(`/Admin/offer-details/${id}`);

  };

  const [editPromo, setEditPromo] = useState({
    id: "",
    code: "",
    discountType: "",
    discountValue: "",
    startDate: "",
    endDate: "",
    promoImage: null,
  });
  const [editPromoOpen, setEditPromoOpen] = useState(false);

  // Open Edit Modal
  const handleEditOpen = (promo) => {
    setEditPromo({
      id: promo._id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      startDate: formatApiDate(promo.startDate),
      endDate: formatApiDate(promo.endDate),
      promoImage: null,
    });
    setEditPromoOpen(true);
  };

  // Handle changes in input fields in the edit form
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditPromo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle file change for edit modal
  const handleEditImageChange = (e) => {
    setEditPromo((prevState) => ({
      ...prevState,
      promoImage: e.target.files[0],
    }));
  };



  // Update Promo
  const handleUpdatePromo = () => {
    const formData = new FormData();


    if (!editPromo.id) {
      toast.error("Error: Promo ID is missing for update.");
      setEditPromoOpen(false);
      return;
    }

    // Append form data fields
    formData.append('id', editPromo.id);
    formData.append('code', editPromo.code);
    formData.append('discountType', editPromo.discountType);

    const sanitizedDiscountValue = String(editPromo.discountValue).trim();

    if (sanitizedDiscountValue === "" || isNaN(sanitizedDiscountValue)) {
      toast.error("Please enter a valid Discount Value.");
      return;
    }

    formData.append('discountValue', sanitizedDiscountValue);

    formData.append('startDate', editPromo.startDate);
    formData.append('endDate', editPromo.endDate);

    // Append promo image file if it exists
    if (editPromo.promoImage) {
      formData.append('promoImage', editPromo.promoImage);
    }

    // Send the FormData
    axios
      .post(
        `${BaseUrl}promos/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,

          },
        }
      )
      .then((response) => {
        toast.success("Promo code updated successfully!");
        handlePromoCodes();
        setEditPromoOpen(false);
      })
      .catch((error) => {
        if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to update Promo code (Internal Server Error)");
        }
        setEditPromoOpen(false);
      });
  };

  //  Toggle Status
  const handleToggleStatus = (promoId, checked) => {
    axios
      .post(
        `${BaseUrl}promos/status`,
        { promoId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Offer Activated!" : "Offer Deactivated!");
        handlePromoCodes();
      })
      .catch((error) => {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);
        } else {

          toast.error("Failed to update status");
        }

      });
  };


  // Delete Promo Code
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the Offer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1b4339",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .post(
            `${BaseUrl}promos/delete`,
            { id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
          .then(() => {
            toast.success("Offer has been deleted.");
            handlePromoCodes();
          })
          .catch((error) => {
            console.error(error);
            toast.error("Failed to delete Offer.");
          });
      }
    });
  };

  // Add Promo function
  const handleAddPromo = () => {
    const formData = new FormData();

    // Append form data fields
    formData.append('code', newPromo.code);
    formData.append('discountType', newPromo.discountType);
    formData.append('discountValue', newPromo.discountValue);
    formData.append('startDate', newPromo.startDate);
    formData.append('endDate', newPromo.endDate);

    // If promo image exists, append it
    if (newPromo.promoImage) {
      formData.append('promoImage', newPromo.promoImage);
    }

    axios
      .post(
        `${BaseUrl}promos/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      .then((response) => {
        toast.success("Offer added successfully!");
        handlePromoCodes();
        setAddPromoOpen(false);
        setNewPromo({
          code: "",
          discountType: "",
          discountValue: "",
          startDate: "",
          endDate: "",
          promoImage: null,
        });
      })
      .catch((error) => {

        if (error.response) {

          const errorMessage = error.response.data?.message || "Failed to add Offer";
          toast.error(errorMessage);
        } else if (error.request) {

          toast.error("Network error, please try again later");
        } else {

          toast.error("An unexpected error occurred");
        }
        setAddPromoOpen(false);
      });
  };




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle file change for add modal
  const handleAddImageChange = (e) => {
    setNewPromo((prevState) => ({
      ...prevState,
      promoImage: e.target.files[0],
    }));
  };

  const exportToExcel = () => {
    // Filter out the image columns before exporting
    const exportData = filteredData.length ? filteredData : data;

    // Assuming image URLs are in a column called "image"
    const filteredExportData = exportData.map(item => {
      const { promoImage, ...rest } = item;  // Remove image column
      return rest;
    });

    // Create the worksheet with filtered data
    const worksheet = XLSX.utils.json_to_sheet(filteredExportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guesthouses");

    // Write to file
    XLSX.writeFile(workbook, "Promotions.xlsx");
  };

  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#1b4339" }}
        style={{ fontSize: "30px", marginTop: "-6px", marginBottom: "10px" }}
      >
        Manage Offers
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
          {/* Add Promo Button */}
          <Button
            variant="contained"
            onClick={() => setAddPromoOpen(true)}
            style={{
              backgroundColor: "#1b4339",
              color: "#ffffff",
              marginRight: "10px",
              height: "40px",
              padding: "10px 20px",
              fontSize: "14px",
            }}
          >
            Add Offer
          </Button>

          {/* Export Button */}
          <Button
            onClick={exportToExcel}
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
              <TableCell>Photo</TableCell>
              <TableCell>Promo Code</TableCell>
              <TableCell>Discount Type</TableCell>
              <TableCell>Discount Value</TableCell>
              <TableCell>Valid From</TableCell>
              <TableCell>Valid Till</TableCell>
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
                    src={item.promoImage}
                    alt={item.code}
                    fallback={item.code || "C"}
                  />
                </TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>
                  {item.discountType.charAt(0).toUpperCase() + item.discountType.slice(1)}
                </TableCell>
                <TableCell>{item.discountValue}</TableCell>
                <TableCell>
                  {item.startDate
                    ? new Date(item.startDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {item.endDate
                    ? new Date(item.endDate).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={item.status === "active"}
                    onChange={(e) =>
                      handleToggleStatus(item._id, e.target.checked)}
                    color="primary"
                  />
                </TableCell>

                <TableCell>
                  <ActionGroup>
                    <ViewActionBtn onClick={() => handleViewOpen(item._id)} />
                    <EditActionBtn onClick={() => handleEditOpen(item)} />
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

      {/* Add Promo Modal */}
      <Modal open={addPromoOpen} onClose={() => setAddPromoOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "scroll",
            overflowX: "hidden",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            Add Promo Code
          </Typography>

          <Card variant="outlined" sx={{ p: 2 }}>
            <TextField
              label="Promo Code"
              fullWidth
              margin="normal"
              name="code"
              value={newPromo.code}
              onChange={handleInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="discount-type-label">Discount Type</InputLabel>
              <Select
                labelId="discount-type-label"
                label="Discount Type"
                name="discountType"
                value={newPromo.discountType}
                onChange={handleInputChange}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>

              </Select>
            </FormControl>
            <TextField
              label="Discount Value "
              fullWidth
              margin="normal"
              name="discountValue"
              type="number"
              value={newPromo.discountValue}
              onChange={handleInputChange}
              inputProps={{ min: 1, max: 100 }}

            />
            <TextField
              label="Valid From"
              fullWidth
              margin="normal"
              type="date"
              name="startDate"
              value={newPromo.startDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Valid Till"
              fullWidth
              margin="normal"
              type="date"
              name="endDate"
              value={newPromo.endDate}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="file"
              fullWidth
              margin="normal"
              name="promoImage"
              onChange={handleAddImageChange}
              InputLabelProps={{ shrink: true }}
            />

          </Card>

          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleAddPromo}
              style={{ backgroundColor: "#1b4339", color: "#ffffff" }}
            >
              Add Offer
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit Promo Modal */}
      <Modal open={editPromoOpen} onClose={() => setEditPromoOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            overflowY: "scroll",
            overflowX: "hidden",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            Update Promo Code
          </Typography>

          <Card variant="outlined" sx={{ p: 2 }}>
            <TextField
              label="Promo Code"
              fullWidth
              margin="normal"
              name="code"
              value={editPromo.code}
              onChange={handleEditInputChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="discount-type-label">Discount Type</InputLabel>
              <Select
                labelId="discount-type-label"
                label="Discount Type"
                name="discountType"
                value={editPromo.discountType}
                onChange={handleEditInputChange}
              >
                <MenuItem value="percentage">Percentage</MenuItem>
                <MenuItem value="flat">Flat</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Discount Value"
              fullWidth
              margin="normal"
              name="discountValue"
              type="number" // Added type number
              value={editPromo.discountValue}
              onChange={handleEditInputChange}
            />
            <TextField
              label="Valid from"
              fullWidth
              margin="normal"
              type="date"
              name="startDate"
              value={editPromo.startDate}
              onChange={handleEditInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Valid till"
              fullWidth
              margin="normal"
              type="date"
              name="endDate"
              value={editPromo.endDate}
              onChange={handleEditInputChange}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              type="file"
              fullWidth
              margin="normal"
              name="promoImage"
              onChange={handleEditImageChange}
              InputLabelProps={{ shrink: true }}
            />

          </Card>

          <Box sx={{ mt: 3, textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleUpdatePromo}
              style={{ backgroundColor: "#1b4339", color: "#ffffff" }}
            >
              Update Promo
            </Button>
          </Box>
        </Box>
      </Modal>


      <ToastContainer position="top-right"
        autoClose={800}
      />
    </>
  );
};

export default ManagePromotions;