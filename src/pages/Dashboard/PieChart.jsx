import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { BaseUrl } from "../../features/Api/BaseUrl";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


const COLORS = ["#134e45", "#eb943d", "#e06d53"]; // Bookings, Revenue, Cancellations


const VISUAL_PROPORTIONS = {
  bookings: 0.15,
  revenue: 0.75,
  cancellations: 0.10
};

export default function ReportsPieChart() {
  const [chartData, setChartData] = useState([]);

  const [chartMetrics, setChartMetrics] = useState({ bookings: 0, revenue: 0, cancellations: 0 });
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const token = localStorage.getItem("token");


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };


  const FinalCustomTooltip = ({ active, payload }) => {
    if (active && chartMetrics) {

      const { bookings, revenue, cancellations } = chartMetrics;

      return (
        <div style={{
          backgroundColor: '#ffffffcc',
          border: `1px solid ${payload && payload.length > 0 ? payload[0].color : '#ccc'}`,
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <p style={{ fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
            Revenue Distribution
          </p>
          {/* Bookings */}
          <p style={{ color: COLORS[0], margin: '4px 0' }}>
            Bookings Count: <strong style={{ float: 'right', marginLeft: '20px' }}>{bookings.toLocaleString()}</strong>
          </p>
          {/* Revenue */}
          <p style={{ color: COLORS[1], margin: '4px 0' }}>
            Revenue Amount: <strong style={{ float: 'right', marginLeft: '20px' }}>{revenue.toLocaleString()}</strong>
          </p>
          {/* Cancellations */}
          <p style={{ color: COLORS[2], margin: '4px 0' }}>
            Cancellations Count: <strong style={{ float: 'right', marginLeft: '20px' }}>{cancellations.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };


  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Please log in again!",
      });
      return;
    }

    const fetchReportData = async () => {
      setLoading(true);
      try {

        // Prepare the request body with date filters
        const requestBody = {};
        if (startDate) {
          requestBody.startDate = formatDate(startDate);
        }
        if (endDate) {
          requestBody.endDate = formatDate(endDate);
        }

        const response = await axios.post(
          `${BaseUrl}revenue-distribution`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const resData = response.data;

        if (resData.success && resData.data) {
          const apiData = resData.data;

          const actualBookings = apiData.bookings || 0;
          const actualRevenue = apiData.revenue || 0;
          const actualCancellations = apiData.cancellations || 0;


          setChartMetrics({
            bookings: actualBookings,
            revenue: actualRevenue,
            cancellations: actualCancellations
          });

          const totalActualValue = actualBookings + actualRevenue + actualCancellations;

          let dataForChart;

          if (totalActualValue > 0) {


            const proportionalBookings = Math.round(totalActualValue * VISUAL_PROPORTIONS.bookings);
            const proportionalRevenue = Math.round(totalActualValue * VISUAL_PROPORTIONS.revenue);
            const proportionalCancellations = Math.round(totalActualValue * VISUAL_PROPORTIONS.cancellations);

            dataForChart = [
              { name: "Bookings Count", value: proportionalBookings },
              { name: "Revenue Amount", value: proportionalRevenue },
              { name: "Cancellations Count", value: proportionalCancellations },
            ];

          } else {
            dataForChart = [];
          }

          setChartData(dataForChart);

        } else {
          throw new Error("Invalid data structure received from API.");
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: error.response?.data?.message || error.message || "Failed to load revenue distribution data!",
        });
        setChartData([]);
        setChartMetrics({ bookings: 0, revenue: 0, cancellations: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [token, startDate, endDate]);

  // Handlers for date input changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };


  if (loading) return <p className="p-6">Loading revenue distribution data...</p>;

  if (!chartData || chartData.length === 0) {
    return <p className="p-6">No distribution data available for the selected period (or all metrics are zero).</p>;
  }

  // If all values are 0, display a message
  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  if (totalValue === 0) {
    return <p className="p-6">All metrics (Bookings, Revenue, Cancellations) are zero for the selected period.</p>;
  }


  return (
    <div className="p-6">
      <h4
        className="mb-4 mt-1"
        style={{ fontSize: "22px", fontWeight: "bold", color: "#0a2d27" }}
      >
        Revenue Distribution
      </h4>

      {/* --- Date Filter Section --- */}
      <div className="mb-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        {/* Start Date and End Date Fields */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <label
            htmlFor="startDate"
            style={{
              fontSize: "15px",
              fontWeight: "600",
              marginRight: "5px",
              color: "#0a2d27",
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
            className="date-picker"
            style={{
              marginRight: "20px",
              fontSize: "15px",
              padding: "6px 10px",
              border: "1px solid #d4e0dc",
              borderRadius: "8px",
            }}
          />
          <label
            htmlFor="endDate"
            style={{
              fontSize: "15px",
              fontWeight: "600",
              marginRight: "5px",
              color: "#0a2d27",
            }}
          >
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
            className="date-picker"
            style={{
              fontSize: "15px",
              padding: "6px 10px",
              border: "1px solid #d4e0dc",
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Export Button */}
        <button
          variant="contained"
        
          style={{
            fontSize: "15px",
            fontWeight: "600",
            padding: "8px 20px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#e88d38",
            color: "#ffffff",
            cursor: "pointer",
            marginRight: "15px",
            boxShadow: "0 4px 12px rgba(232, 141, 56, 0.25)",
           
          }}
          // onClick={handleExportClick}  
        >
          Export
        </button>
      </div>

      {/* --- Date Filter Section End --- */}


      <ResponsiveContainer width="100%" height={395}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => {

              let colorIndex = 0;
              if (entry.name === "Bookings Count") colorIndex = 0;
              else if (entry.name === "Revenue Amount") colorIndex = 1;
              else if (entry.name === "Cancellations Count") colorIndex = 2;

              return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />;
            })}
          </Pie>

          <Tooltip content={<FinalCustomTooltip chartMetrics={chartMetrics} />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
        </PieChart>
      </ResponsiveContainer>
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}