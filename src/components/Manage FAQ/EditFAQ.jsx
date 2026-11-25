import React, { useState, useEffect } from "react";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { Box, Button, TextField, Typography, Card, Divider, Grid } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { useParams, useNavigate } from "react-router-dom";

const EditFAQ = () => {
   const token = localStorage.getItem("token");
  const [faqData, setFaqData] = useState({
    question: "",
    question_cn: "",
    answer: "",
    answer_cn: "",
  });
  const { id } = useParams();
  console.log("FAQ ID:", id);

  // Fetch FAQ data by ID
  const fetchFAQById = () => {
    axios.post(`${BaseUrl}faq/view`, { id }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    })
      .then((response) => {
        if (response.data.success) {
          const { question, question_cn, answer, answer_cn } = response.data.data;
          setFaqData({
            question,
            question_cn,
            answer,
            answer_cn,
          });
        } else {
          toast.error("Failed to fetch FAQ");
        }
      })
      .catch((error) => {
        console.error("Error fetching FAQ:", error);
        toast.error("Error fetching FAQ data");
      });
  };

  // Fetch the FAQ details when the component mounts
  useEffect(() => {
    fetchFAQById();
  }, [id]);

  // Handle input change for standard text fields (question fields)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFaqData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle CKEditor change for the answers
  const handleEditorChange = (event, editor, lang) => {
    const data = editor.getData();
    setFaqData((prev) => ({
      ...prev,
      [lang]: data,
    }));
  };

  // Handle form submission (update FAQ)
  const handleSubmit = () => {
    const { question, question_cn, answer, answer_cn } = faqData;
    if (!question.trim() || !question_cn.trim() || !answer.trim() || !answer_cn.trim()) {
      toast.error("All fields are required.");
      return;
    }
    const stripHTML = (html) => {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || "";
    };
    const payload = {
      id,
      question,
      question_cn,
      answer: stripHTML(answer),
      answer_cn: stripHTML(answer_cn)
    };

    // Update  FAQ 
    axios.post(`${BaseUrl}faq/update`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.data.success) {
          toast.success("FAQ updated successfully");
        } else {
          toast.error(response.data.message || "Failed to update FAQ");
        }
      })
      .catch((error) => {
        console.error("Error updating FAQ:", error.response?.data || error.message);
        toast.error(error.response?.data?.message || "Error updating FAQ");
      });
  };
  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: 2, marginTop: "0px", width: "100%" }}>
      <Card variant="outlined" sx={{ p: 3, width: "100%", maxWidth: 1000 }}>
        <Typography variant="h5" sx={{ mb: 2, color: "#1b4339", fontWeight: 700 }}>
          Edit FAQ
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {/* 1. Question - English */}
          <Grid item xs={12}>
            <div className="mb-2">
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Question - English</Typography>
              <TextField
                name="question"
                value={faqData.question}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter question in English"
                size="small"
              />
            </div>
          </Grid>
          {/* 2. Question - Chinese */}
          <Grid item xs={12}>
            <div className="mb-2">
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Question - Chinese </Typography>
              <TextField
                name="question_cn"
                value={faqData.question_cn}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter question in Chinese"
                size="small"
              />
            </div>
          </Grid>

          <Divider sx={{ my: 2, width: '100%', mx: 'auto' }} />

          {/* 3. Answer - English */}
          <Grid item xs={12}>
            <div className="mb-2">
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Answer - English</Typography>
              <CKEditor
                editor={ClassicEditor}
                data={faqData.answer}
                onChange={(event, editor) => handleEditorChange(event, editor, "answer")}
              />
            </div>
          </Grid>

          {/* 4. Answer - Chinese */}
          <Grid item xs={12}>
            <div className="mb-2">
              <Typography sx={{ fontWeight: 600, mb: 1 }}>Answer - Chinese</Typography>
              <CKEditor
                editor={ClassicEditor}
                data={faqData.answer_cn}
                onChange={(event, editor) => handleEditorChange(event, editor, "answer_cn")}
              />
            </div>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: "300px", padding: "11px", backgroundColor: "#1b4339" }}
                onClick={handleSubmit}
              >
                Update FAQ
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <ToastContainer autoClose={1000} />
    </Box>
  );
};

export default EditFAQ;
