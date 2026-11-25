import React, { useEffect, useState } from "react";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import "../../Component/Table.css";
import {
  Box,
  Modal,
  Typography,
  Card,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
} from "@mui/material";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PersonIcon from "@mui/icons-material/Person";
import BedIcon from "@mui/icons-material/Bed";
import Slider from "react-slick";
import Switch from "@mui/material/Switch";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const GuestHouseDetails = () => {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewEdit, setViewEdit] = useState(false);
  const [viewData, setViewData] = useState("");
  const token = localStorage.getItem("token");
  const pageSize = 6;

  const handleGuestHouse = () => {
    axios
      .post(
        `${BaseUrl}guesthouses/list`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((response) => setData(response.data.data))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    handleGuestHouse();
  }, []);

  const handleChangeQuery = (e) => setQuery(e.target.value);

  const filteredData = data.filter((item) => {
    return (
      (item?.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.address?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.contactNumber?.toLowerCase() || "").includes(query.toLowerCase()) ||
      (item?.description?.toLowerCase() || "").includes(query.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleViewOpen = () => setViewOpen(true);
  const handleViewClose = () => setViewOpen(false);
  const handleEditOpen = () => setViewEdit(true);
  const handleEditClose = () => setViewEdit(false);

  const handleView = (guesthouseId) => {
    axios
      .post(
        `${BaseUrl}guesthouses/view`,
        { guesthouseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setViewData(response.data.data);
        handleViewOpen();
      })
      .catch((error) => console.error(error));
  };

  const handleToggleStatus = (id, checked) => {
    axios
      .post(
        `${BaseUrl}guesthouses/status`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success(checked ? "Guesthouse Activated!" : "Guesthouse Deactivated!");
        handleGuestHouse();
      })
      .catch(() => toast.error("Failed to update status"));
  };

  const handleDelete = (id) => {
    toast.info(
      <div>
        <p>Are you sure you want to delete this guesthouse?</p>
        <div className="d-flex justify-content-end mt-2">
          <button
            className="btn btn-danger btn-sm me-2"
            onClick={() => confirmDelete(id)}
          >
            Yes
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => toast.dismiss()}>
            No
          </button>
        </div>
      </div>,
      { autoClose: false }
    );
  };

  const confirmDelete = (id) => {
    toast.dismiss();
    axios
      .post(
        `${BaseUrl}guesthouses/delete`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        toast.success("Guesthouse deleted successfully!");
        handleGuestHouse();
      })
      .catch(() => toast.error("Failed to delete guesthouse"));
  };

  return (
    <>
      <div className="my-profile-area">
        <div className="profile-form-content add-recruiters-btn-postion">
          <h3>Guesthouse List</h3>

          <div className="profile-form">
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="top-space-search-reslute">
                  <div className="tab-content px-2 md:!px-4">
                    <div className="parentProduceSearch">
                      <div className="entries">
                        <small>show</small>{" "}
                        <select
                          value={pageSize}
                          onChange={(e) => console.log("Change page size")}
                        >
                          <option value="6">6</option>
                          <option value="10">10</option>
                          <option value="25">25</option>
                        </select>{" "}
                        <small>entries</small>
                      </div>
                      <div className="table-search-box-info">
                        <input
                          type="search"
                          placeholder="search"
                          value={query}
                          onChange={handleChangeQuery}
                        />
                      </div>
                    </div>

                    <div className="tab-pane active" id="header" role="tabpanel">
                      <div
                        id="datatable_wrapper"
                        className="information_dataTables dataTables_wrapper dt-bootstrap4 table-responsive"
                      >
                        <table
                          id="example"
                          className="display table table-bordered borderTerpProduce"
                          style={{ width: "100%" }}
                        >
                          <thead>
                            <tr>
                              <th>S.No</th>
                              <th>Image</th>
                              <th>Guesthouse Name</th>
                              <th>Address</th>
                              <th>Phone No.</th>
                              <th>Price</th>
                              <th>Status</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedData.length > 0 ? (
                              paginatedData.map((item, index) => (
                                <tr className="rowCursorPointer" key={item._id}>
                                  <td>{startIndex + index + 1}</td>
                                  <td>
                                    <div className="recruiterImg-info">
                                      <img
                                        width={60}
                                        height={50}
                                        style={{
                                          borderRadius: "8px",
                                          objectFit: "cover",
                                        }}
                                        alt={item.name}
                                        src={
                                          Array.isArray(item.guestHouseImage) &&
                                          item.guestHouseImage.length > 0
                                            ? item.guestHouseImage[0]
                                            : "/fallback.jpg"
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>{item.name}</td>
                                  <td>{item.address}</td>
                                  <td>{item.contactNumber}</td>
                                  <td>${item.price}</td>
                                  <td>
                                    <div className="recruiter-status-info">
                                      <div className="form-check form-switch">
                                        <input
                                          className="form-check-input"
                                          role="switch"
                                          type="checkbox"
                                          checked={item.status === "active"}
                                          onChange={(e) =>
                                            handleToggleStatus(
                                              item._id,
                                              e.target.checked
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="action-icon-info">
                                      <i>
                                        <RemoveRedEyeOutlinedIcon
                                          onClick={() => handleView(item._id)}
                                        />
                                      </i>
                                      <i>
                                        <EditIcon onClick={() => handleEditOpen(item)} />
                                      </i>
                                      <i>
                                        <DeleteIcon
                                          onClick={() => handleDelete(item._id)}
                                        />
                                      </i>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="8" style={{ textAlign: "center" }}>
                                  No guesthouses found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 mx-3 text-center">
                      <button
                        disabled={currentPage === 1}
                        className="p-1 rounded pagePre btn btn-outline-dark me-2"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <SkipPreviousIcon />
                      </button>
                      <span>{`Page ${currentPage} of ${totalPages}`}</span>
                      <button
                        disabled={currentPage === totalPages}
                        className="p-1 rounded pageNext btn btn-outline-dark ms-2"
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <SkipNextIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal open={viewOpen} onClose={handleViewClose}>
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
            p: 3,
            overflowY: "scroll",
            borderRadius: "10px",
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
            Guesthouse Details
          </Typography>

          {Array.isArray(viewData?.guestHouseImage) &&
            viewData.guestHouseImage.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Slider arrows infinite>
                  {viewData.guestHouseImage.map((img, idx) => (
                    <div key={idx}>
                      <img
                        src={img}
                        alt={`Guesthouse ${idx}`}
                        style={{
                          width: "100%",
                          maxHeight: "250px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                    </div>
                  ))}
                </Slider>
              </Box>
            )}

          <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: "#1b4339" }}>
              <PersonIcon /> Owner Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Name:</strong> {viewData?.ownerDetails?.name}</Typography>
            <Typography><strong>Email:</strong> {viewData?.ownerDetails?.email}</Typography>
            <Typography><strong>Phone:</strong> {viewData?.ownerDetails?.phone}</Typography>
          </Card>

          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: "#1b4339" }}>
              <BedIcon /> Guesthouse Info
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography><strong>Name:</strong> {viewData?.name}</Typography>
            <Typography><strong>Phone:</strong> {viewData?.contactNumber}</Typography>
            <Typography><strong>Address:</strong> {viewData?.address}</Typography>
            <Typography><strong>Atolls:</strong> {viewData?.atolls}</Typography>
            <Typography><strong>Islands:</strong> {viewData?.islands}</Typography>
            <Typography><strong>Stars:</strong> {viewData?.stars}</Typography>
            <Typography><strong>Price:</strong> {viewData?.price}</Typography>
            <Typography><strong>Description:</strong> {viewData?.description}</Typography>
            <Typography><strong>Facilities:</strong></Typography>
            <ul>
              {viewData?.facilities?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <Typography><strong>Status:</strong> {viewData?.status}</Typography>
            <Typography><strong>Cleaning Fee:</strong> {viewData?.cleaningFee}</Typography>
            <Typography><strong>Tax Percent:</strong> {viewData?.taxPercent}</Typography>
          </Card>

          <Box textAlign="right" mt={3}>
            <Button
              variant="contained"
              onClick={handleViewClose}
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

      {/* Edit Dialog */}
      <Dialog open={viewEdit} onClose={handleEditClose}>
        <DialogTitle>Update Profile</DialogTitle>
        <DialogContent>
          <div className="row">
            <div className="col-12 col-md-6 mb-2">
              <TextField label="Name" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="Phone" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="Description" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="City" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="State" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="Address" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="Longitude" fullWidth size="small" />
            </div>
            <div className="col-12 col-md-6 mb-2">
              <TextField label="Latitude" fullWidth size="small" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ToastContainer position="top-right" />
    </>
  );
};

export default GuestHouseDetails;


















