import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import axios from "axios";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../features/Api/BaseUrl";
import { baseurlImage } from "../features/Imageurl";

const defaultState = {
  full_name: "",
  email: "",
  Profile_image: "",
};

const MyProfile = () => {
  const [error, setError] = useState({
    errors: {},
    isError: false,
  });
  const adminId = localStorage.getItem("id");
  const navigate = useNavigate();
  const [state, setState] = useState(defaultState);
  const [selectedImage, setSelectedImage] = useState("");

  // Fetch admin profile details
  const adminProfile = () => {
    axios
      .get(`${baseUrl}getadmin/${adminId}`) 
      .then((response) => {
        const { full_name, email, Profile_image } = response.data.Details;
        setState((prevData) => ({
          ...prevData,
          full_name,
          email,
          Profile_image,
        }));
        localStorage.setItem("name", full_name);
        localStorage.setItem("image", Profile_image);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    adminProfile();
  }, []);

  // Handle image selection
  const imageFunction = (event) => {
    setSelectedImage(event.target.files[0]);
    setState({ ...state, Profile_image: event.target.files[0].name });
  }
  // Handle text field changes
  const submitData = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  // Submit updated data
  const submitFormData = () => {
    const bodyFormData = new FormData();
    if (selectedImage) {
      const file = new File([selectedImage], state.Profile_image, {
        type: "image/jpeg",
      });
      bodyFormData.append("Profile_image", file);
    }
    bodyFormData.append("full_name", state.full_name); // Correct key for full_name
    bodyFormData.append("email", state.email);

    axios
      .put(`${baseUrl}updateAdmin/${adminId}`, bodyFormData) // Using PUT method
      .then((response) => {
        console.log(response);
        Swal.fire("Profile updated successfully!", "", "success");
        navigate("/admin", { state: { dataValue: state } });
        adminProfile(); // Refresh profile data after update
      })
      .catch((error) => {
        console.log(error);
        setError({
          errors: error,
          isError: true,
        });
      });
  };
  return (
    <>
      <div className=" bg-white m-0 p-0 ">
        <div className="row">
          <div className="col-md-3 border-right">
            <div className="d-flex flex-column align-items-center text-center p-3 py-5">
            {selectedImage ? (
                <img
                  alt="not found"
                  className="rounded-circle mt-5"
                  width="150px"
                  height="150px"
                  src={URL.createObjectURL(selectedImage)}
                />
              ) : (
                <img
                  alt="not found"
                  className="rounded-circle mt-5"
                  width="150px"
                  src={`${baseurlImage}${state?.Profile_image}`}
                  defaultState={state.Profile_image}
                />
              )}

              <div style={{ marginStart: "10px" }}>
              <input
                  style={{ margin: "5px 0px 0px 50px" }}
                  className="mb-2  w-100 hidden "
                  type="file"
                  name="image"
                  onChange={imageFunction}
                />
              </div>
            </div>
          </div>
          <div className="col-md-9 border-right">
            <div className="p-3 py-5">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="text-right " style={{ color: "#000000" }}>
                  My Profile
                </h4>
              </div>
              <div className="form-outline mb-4 col-12">
              <TextField
                  fullWidth
                  label="Full Name"
                  id="fullWidth"
                  autoComplete="off"
                  onChange={submitData}
                  name="full_name"
                  value={state.full_name}
                />
              </div>
              <div className="form-outline mb-4 col-12">
              <TextField
                  fullWidth
                  label="Email"
                  id="fullWidth"
                  autoComplete="off"
                  onChange={submitData}
                  name="email"
                  value={state.email}
                />
              </div>
              <div className="mt-3 text-center">
              <button
                  type="button"
                  className="btn btn-primary"
                  onClick={submitFormData}
                >
                  Update
                  <ArrowRightAltIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default MyProfile;
