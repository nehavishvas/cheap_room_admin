import React, { useState } from "react";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { Box, Button, TextField, Typography, Card, Divider, Grid } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const AddFAQ = () => {
  const token = localStorage.getItem("token");
  const [faqData, setFaqData] = useState({
    question: "",
    question_cn: "",
    answer: "",
    answer_cn: "",
  });

  // Remove HTML tags before sending
  const stripHTML = (html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFaqData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (event, editor, lang) => {
    const data = editor.getData();
    setFaqData((prev) => ({
      ...prev,
      [lang]: data,
    }));
  };

  const handleSubmit = () => {
    const { question, question_cn, answer, answer_cn } = faqData;
    const cleanAnswer = stripHTML(answer).trim();
    const cleanAnswerCN = stripHTML(answer_cn).trim();

    if (!question.trim() || !question_cn.trim()) {
      toast.error("Questions cannot be empty.");
      return;
    }

    if (!cleanAnswer || cleanAnswer.length < 2) {
      toast.error("English Answer cannot be empty.");
      return;
    }

    if (!cleanAnswerCN || cleanAnswerCN.length < 2) {
      toast.error("Chinese Answer cannot be empty.");
      return;
    }

    const payload = {
      question,
      question_cn,
      answer: cleanAnswer,
      answer_cn: cleanAnswerCN,
    };

    // Add FAQ
    axios.post(`${BaseUrl}faq/add`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("ADD SUCCESS", res.data);
        toast.success("FAQ added successfully");
        setFaqData({ question: "", question_cn: "", answer: "", answer_cn: "" });
      })
      .catch((error) => {
        console.log("BACKEND ERROR => ", error.response?.data);
        toast.error(error.response?.data?.message || "Error adding FAQ");
      });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: 2, width: "100%" }}>
      <Card variant="outlined" sx={{ p: 3, width: "100%", maxWidth: 1000 }}>
        <Typography variant="h5" sx={{ mb: 2, color: "#1b4339", fontWeight: 700 }}>
          Add New FAQ (Multi-language)
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Question - English</Typography>
            <TextField
              name="question"
              value={faqData.question}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Question - Chinese</Typography>
            <TextField
              name="question_cn"
              value={faqData.question_cn}
              onChange={handleInputChange}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Answer - English</Typography>
            <CKEditor
              editor={ClassicEditor}
              data={faqData.answer}
              onChange={(e, editor) => handleEditorChange(e, editor, "answer")}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>Answer - Chinese</Typography>
            <CKEditor
              editor={ClassicEditor}
              data={faqData.answer_cn}
              onChange={(e, editor) => handleEditorChange(e, editor, "answer_cn")}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button
                variant="contained"
                style={{ width: "300px", backgroundColor: "#1b4339" }}
                onClick={handleSubmit}
              >
                Add FAQ
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <ToastContainer autoClose={1000} />
    </Box>
  );
};

export default AddFAQ;
