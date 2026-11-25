import React, { useEffect, useState, useCallback } from "react";
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
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { LuBuilding2, LuDownload, LuPencil, LuX } from "react-icons/lu";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  ActionGroup,
  ViewActionBtn,
  EditActionBtn,
  DeleteActionBtn,
  StatusBadge,
  TablePagination,
} from "../shared/TableComponents";
import { formatDateValue } from "../shared/DetailLayout";

const DEFAULT_FORM = {
  propertyTypeId: "",
  nameEn: "",
  nameZh: "",
  slug: "",
  status: true,
};

const PAGE_LIMIT = 10;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  "Content-Type": "application/json",
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

/**
 * Shared form body for Add and Edit Property Type dialogs.
 */
const PropertyTypeFormFields = ({ form, errors, onChange, onStatusChange }) => (
  <div className="d-flex flex-column gap-3 pt-2">
    <div>
      <TextField
        label="English Name *"
        name="nameEn"
        placeholder="e.g. Resorts"
        value={form.nameEn}
        onChange={onChange}
        error={Boolean(errors.nameEn)}
        helperText={errors.nameEn || ""}
        fullWidth
        size="small"
      />
    </div>

    <div>
      <TextField
        label="Chinese Name *"
        name="nameZh"
        placeholder="e.g. 度假村"
        value={form.nameZh}
        onChange={onChange}
        error={Boolean(errors.nameZh)}
        helperText={errors.nameZh || ""}
        fullWidth
        size="small"
      />
    </div>

    <div>
      <TextField
        label="Slug (Optional)"
        name="slug"
        placeholder="e.g. resorts (auto-generated if empty)"
        value={form.slug}
        onChange={onChange}
        helperText="Lowercase unique identifier. Leave blank to auto-generate."
        fullWidth
        size="small"
      />
    </div>

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderRadius: "10px",
        background: "#f8fbfa",
        border: "1px solid #e2eae7",
      }}
    >
      <div>
        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0e2f2c" }}>
          Active Status
        </div>
        <div style={{ fontSize: "12px", color: "#5d746e" }}>
          Enable or disable this property type across listings
        </div>
      </div>
      <Switch
        checked={Boolean(form.status)}
        onChange={(e) => onStatusChange(e.target.checked)}
        color="primary"
      />
    </div>
  </div>
);

const dialogHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 22px",
  borderBottom: "1px solid #eef3f1",
  backgroundColor: "#fafcfb",
};

const dialogTitleWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const dialogIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "9px",
  background: "#eaf3ef",
  color: "#133e39",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "17px",
};

const ManageProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search, filter & backend pagination state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Dialog states
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [formState, setFormState] = useState(DEFAULT_FORM);
  const [formErrors, setFormErrors] = useState({});

  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Debounce search query so we don't call API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setCurrentPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch Property Types list (backend search, filter & pagination)
  const fetchPropertyTypes = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        search: debouncedQuery,
        page: currentPage,
        limit: PAGE_LIMIT,
      };

      if (statusFilter !== "all") {
        payload.status = statusFilter === "active";
      }

      const response = await axios.post(`${BaseUrl}propertyType/list`, payload, {
        headers: getAuthHeaders(),
      });

      const res = response.data;
      setData(Array.isArray(res?.data) ? res.data : []);
      setTotalPages(Math.max(1, Number(res?.totalPages) || 1));
      setTotalCount(Number(res?.total) || 0);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch property types"));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, currentPage, statusFilter]);

  useEffect(() => {
    fetchPropertyTypes();
  }, [fetchPropertyTypes]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Form field handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFormStatusChange = (checked) => {
    setFormState((prev) => ({ ...prev, status: checked }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formState.nameEn.trim()) {
      errors.nameEn = "English name is required";
    }
    if (!formState.nameZh.trim()) {
      errors.nameZh = "Chinese name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open & Submit Add Dialog
  const handleOpenAdd = () => {
    setFormState(DEFAULT_FORM);
    setFormErrors({});
    setAddOpen(true);
  };

  const handleCloseAdd = () => {
    if (submitting) return;
    setAddOpen(false);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: {
        en: formState.nameEn.trim(),
        zh: formState.nameZh.trim(),
      },
      status: Boolean(formState.status),
    };

    if (formState.slug.trim()) {
      payload.slug = formState.slug.trim().toLowerCase();
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${BaseUrl}propertyType/add`, payload, {
        headers: getAuthHeaders(),
      });
      toast.success(response?.data?.message || "Property type added successfully!");
      setAddOpen(false);
      setFormState(DEFAULT_FORM);
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchPropertyTypes();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to add property type"));
    } finally {
      setSubmitting(false);
    }
  };

  // Open & Submit Edit Dialog
  const handleOpenEdit = (item) => {
    setFormState({
      propertyTypeId: item._id,
      nameEn: item?.name?.en || "",
      nameZh: item?.name?.zh || "",
      slug: item?.slug || "",
      status: Boolean(item?.status),
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (submitting) return;
    setEditOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      propertyTypeId: formState.propertyTypeId,
      name: {
        en: formState.nameEn.trim(),
        zh: formState.nameZh.trim(),
      },
      status: Boolean(formState.status),
    };

    if (formState.slug.trim()) {
      payload.slug = formState.slug.trim().toLowerCase();
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${BaseUrl}propertyType/update`, payload, {
        headers: getAuthHeaders(),
      });
      toast.success(response?.data?.message || "Property type updated successfully!");
      setEditOpen(false);
      fetchPropertyTypes();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update property type"));
    } finally {
      setSubmitting(false);
    }
  };

  // View Property Type Details (by ID API)
  const handleView = async (propertyTypeId) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewData(null);
    try {
      const response = await axios.post(
        `${BaseUrl}propertyType/view`,
        { propertyTypeId },
        { headers: getAuthHeaders() }
      );
      setViewData(response?.data?.data || null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to fetch property type details"));
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // Toggle Status (Active / Inactive)
  const handleToggleStatus = async (propertyTypeId, checked) => {
    try {
      const response = await axios.post(
        `${BaseUrl}propertyType/status`,
        { propertyTypeId, status: checked },
        { headers: getAuthHeaders() }
      );
      toast.success(
        response?.data?.message ||
          (checked ? "Property type activated!" : "Property type deactivated!")
      );
      fetchPropertyTypes();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update status"));
    }
  };

  // Delete Property Type
  const handleDelete = (propertyTypeId, label) => {
    Swal.fire({
      title: "Are you sure?",
      text: `This action will permanently delete "${label || "this property type"}"!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#133e39",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const response = await axios.post(
          `${BaseUrl}propertyType/delete`,
          { propertyTypeId },
          { headers: getAuthHeaders() }
        );
        toast.success(response?.data?.message || "Property type deleted successfully!");
        if (data.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchPropertyTypes();
        }
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to delete property type"));
      }
    });
  };

  // Export current page data to Excel
  const exportToExcel = () => {
    if (!data.length) {
      toast.info("No data available to export");
      return;
    }

    const exportRows = data.map((item, idx) => ({
      "SR No.": (currentPage - 1) * PAGE_LIMIT + idx + 1,
      "English Name": item?.name?.en || "",
      "Chinese Name": item?.name?.zh || "",
      Slug: item?.slug || "",
      Status: item?.status ? "Active" : "Inactive",
      "Created At": formatDateValue(item?.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Property Types");
    XLSX.writeFile(workbook, "property_types.xlsx");
  };

  const startIndex = (currentPage - 1) * PAGE_LIMIT;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Manage Property Types
      </Typography>

      {/* Toolbar: Search, Status Filter, Add & Export */}
      <div className="d-flex flex-row justify-content-between mx-1 mt-2 mb-2 flex-wrap">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <TextField
            id="property-type-search"
            value={query}
            label="Search English or Chinese name..."
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="property-status-filter-label">Status</InputLabel>
            <Select
              labelId="property-status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="contained"
            onClick={handleOpenAdd}
            startIcon={<AddIcon />}
            sx={{ height: "40px", px: 2.2 }}
          >
            Add Property Type
          </Button>

          <Button
            variant="outlined"
            onClick={exportToExcel}
            startIcon={<LuDownload style={{ fontSize: "15px" }} />}
            sx={{
              height: "40px",
              px: 2,
              borderRadius: "10px",
              borderColor: "#dbe4e0",
              color: "#133e39",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#133e39",
                backgroundColor: "#f3f8f6",
              },
            }}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Property Types Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>SR No.</TableCell>
              <TableCell>English Name</TableCell>
              <TableCell>Chinese Name</TableCell>
              {/* <TableCell>Slug</TableCell> */}
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={26} sx={{ color: "#133e39" }} />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <TableRow key={item._id || index}>
                  <TableCell>{startIndex + index + 1}</TableCell>
                  <TableCell title={item?.name?.en}>
                    <span style={{ fontWeight: 600, color: "#0e2f2c" }}>
                      {item?.name?.en || "NA"}
                    </span>
                  </TableCell>
                  <TableCell title={item?.name?.zh}>
                    {item?.name?.zh || "NA"}
                  </TableCell>
                  {/* <TableCell title={item?.slug}>
                    <span
                      style={{
                        fontSize: "12.5px",
                        padding: "3px 9px",
                        borderRadius: "6px",
                        background: "#f3f8f6",
                        border: "1px solid #e2eae7",
                        color: "#3f5852",
                        fontFamily: "monospace",
                      }}
                    >
                      {item?.slug || "NA"}
                    </span>
                  </TableCell> */}
                  <TableCell>
                    <Switch
                      checked={Boolean(item?.status)}
                      onChange={(e) =>
                        handleToggleStatus(item._id, e.target.checked)
                      }
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <ActionGroup>
                      <ViewActionBtn onClick={() => handleView(item._id)} />
                      <EditActionBtn onClick={() => handleOpenEdit(item)} />
                      <DeleteActionBtn
                        onClick={() => handleDelete(item._id, item?.name?.en)}
                      />
                    </ActionGroup>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "#5d746e" }}>
                  No property types found.
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

      {totalCount > 0 && (
        <div
          style={{
            textAlign: "center",
            fontSize: "12.5px",
            color: "#5d746e",
            marginTop: "6px",
          }}
        >
          Showing {data.length} of {totalCount} property types
        </div>
      )}

      {/* Add Property Type Dialog */}
      <Dialog open={addOpen} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 0 }}>
          <div style={dialogHeaderStyle}>
            <div style={dialogTitleWrapStyle}>
              <span style={dialogIconStyle}>
                <LuBuilding2 />
              </span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0e2f2c" }}>
                  Add Property Type
                </div>
                <div style={{ fontSize: "12px", color: "#5d746e", fontWeight: 400 }}>
                  Create a new property category in English and Chinese
                </div>
              </div>
            </div>
            <IconButton onClick={handleCloseAdd} size="small" aria-label="Close">
              <LuX />
            </IconButton>
          </div>
        </DialogTitle>

        <form onSubmit={handleAddSubmit}>
          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <PropertyTypeFormFields
              form={formState}
              errors={formErrors}
              onChange={handleFormChange}
              onStatusChange={handleFormStatusChange}
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid #eef3f1",
              backgroundColor: "#fafcfb",
              gap: 1,
            }}
          >
            <Button
              onClick={handleCloseAdd}
              disabled={submitting}
              sx={{
                color: "#4f6862",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ minWidth: 140 }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add Property Type"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Property Type Dialog */}
      <Dialog open={editOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ p: 0 }}>
          <div style={dialogHeaderStyle}>
            <div style={dialogTitleWrapStyle}>
              <span
                style={{
                  ...dialogIconStyle,
                  background: "#fef3e2",
                  color: "#d97e26",
                }}
              >
                <LuPencil />
              </span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0e2f2c" }}>
                  Update Property Type
                </div>
                <div style={{ fontSize: "12px", color: "#5d746e", fontWeight: 400 }}>
                  Edit English/Chinese name, slug, or active status
                </div>
              </div>
            </div>
            <IconButton onClick={handleCloseEdit} size="small" aria-label="Close">
              <LuX />
            </IconButton>
          </div>
        </DialogTitle>

        <form onSubmit={handleEditSubmit}>
          <DialogContent sx={{ px: 3, py: 2.5 }}>
            <PropertyTypeFormFields
              form={formState}
              errors={formErrors}
              onChange={handleFormChange}
              onStatusChange={handleFormStatusChange}
            />
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid #eef3f1",
              backgroundColor: "#fafcfb",
              gap: 1,
            }}
          >
            <Button
              onClick={handleCloseEdit}
              disabled={submitting}
              sx={{
                color: "#4f6862",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              sx={{ minWidth: 140 }}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Property Type Dialog */}
      <Dialog
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ p: 0 }}>
          <div style={dialogHeaderStyle}>
            <div style={dialogTitleWrapStyle}>
              <span style={dialogIconStyle}>
                <LuBuilding2 />
              </span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0e2f2c" }}>
                  Property Type Details
                </div>
                <div style={{ fontSize: "12px", color: "#5d746e", fontWeight: 400 }}>
                  {viewData?.name?.en || "Property type configuration"}
                </div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              {viewData && (
                <StatusBadge status={viewData.status ? "Active" : "Inactive"} />
              )}
              <IconButton
                onClick={() => setViewOpen(false)}
                size="small"
                aria-label="Close"
              >
                <LuX />
              </IconButton>
            </div>
          </div>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2.5 }}>
          {viewLoading ? (
            <div className="d-flex justify-content-center py-4">
              <CircularProgress size={28} sx={{ color: "#133e39" }} />
            </div>
          ) : viewData ? (
            <div className="detail-fields-grid cols-2">
              <div className="detail-field">
                <span className="detail-field-label">English Name</span>
                <div className="detail-field-value">{viewData?.name?.en || "NA"}</div>
              </div>

              <div className="detail-field">
                <span className="detail-field-label">Chinese Name</span>
                <div className="detail-field-value">{viewData?.name?.zh || "NA"}</div>
              </div>

              {/* <div className="detail-field">
                <span className="detail-field-label">Slug</span>
                <div className="detail-field-value" style={{ fontFamily: "monospace" }}>
                  {viewData?.slug || "NA"}
                </div>
              </div> */}

              <div className="detail-field">
                <span className="detail-field-label">Status</span>
                <div className="pt-1">
                  <StatusBadge status={viewData?.status ? "Active" : "Inactive"} />
                </div>
              </div>

              <div className="detail-field">
                <span className="detail-field-label">Created Date</span>
                <div className="detail-field-value">
                  {formatDateValue(viewData?.createdAt)}
                </div>
              </div>

              <div className="detail-field">
                <span className="detail-field-label">Last Updated</span>
                <div className="detail-field-value">
                  {formatDateValue(viewData?.updatedAt)}
                </div>
              </div>

              {/* <div className="detail-field is-full">
                <span className="detail-field-label">Property Type ID</span>
                <div className="detail-field-value" style={{ fontFamily: "monospace" }}>
                  {viewData?._id || "NA"}
                </div>
              </div> */}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#5d746e", padding: "16px 0" }}>
              No details found.
            </div>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #eef3f1",
            backgroundColor: "#fafcfb",
            gap: 1,
          }}
        >
          {viewData && (
            <Button
              variant="outlined"
              onClick={() => {
                setViewOpen(false);
                handleOpenEdit(viewData);
              }}
              sx={{
                borderRadius: "10px",
                borderColor: "#dbe4e0",
                color: "#133e39",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Edit
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => setViewOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageProperties;
