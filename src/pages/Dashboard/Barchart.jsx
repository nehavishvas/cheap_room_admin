import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BaseUrl } from "../../features/Api/BaseUrl";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const compactFormat = (val) => {
  if (typeof val !== "number") return val;
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(val);
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2eae7",
        borderRadius: "12px",
        padding: "10px 14px",
        boxShadow: "0 10px 26px rgba(14, 47, 44, 0.10)",
        minWidth: "160px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#0e2f2c",
          marginBottom: "6px",
          borderBottom: "1px solid #eef3f1",
          paddingBottom: "4px",
        }}
      >
        {label}
      </div>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "12.5px",
            marginTop: "4px",
            color: "#3f5852",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: entry.color || "#134e45",
                display: "inline-block",
              }}
            />
            {entry.name}
          </span>
          <strong style={{ color: "#0e2f2c" }}>
            {Number(entry.value || 0).toLocaleString()}
          </strong>
        </div>
      ))}
    </div>
  );
};

export default function ReportsChart() {
  const [data, setData] = useState([]);
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

  useEffect(() => {
    if (!token) {
      toast.error("Authentication Error: Please log in again!");
      setLoading(false);
      return;
    }

    const fetchReportData = async () => {
      setLoading(true);
      try {
        const requestBody = {};
        if (startDate) requestBody.startDate = formatDate(startDate);
        if (endDate) requestBody.endDate = formatDate(endDate);

        const response = await axios.post(`${BaseUrl}report`, requestBody, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const resData = response.data;

        if (resData.success && Array.isArray(resData.data)) {
          setData(resData.data);
        } else if (
          resData.success &&
          typeof resData.data === "object" &&
          resData.data !== null &&
          !Array.isArray(resData.data)
        ) {
          const singleReport = {
            month: `${requestBody.startDate || "Start"} – ${
              requestBody.endDate || "End"
            }`,
            bookings: resData.data.bookings || 0,
            cancellations: resData.data.cancellations || 0,
            revenue: resData.data.revenue || 0,
          };
          setData([singleReport]);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to load report data!"
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [token, startDate, endDate]);

  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        bookings: acc.bookings + Number(item.bookings || 0),
        revenue: acc.revenue + Number(item.revenue || 0),
        cancellations: acc.cancellations + Number(item.cancellations || 0),
      }),
      { bookings: 0, revenue: 0, cancellations: 0 }
    );
  }, [data]);

  const exportToExcel = () => {
    if (data.length === 0) {
      toast.warn("No data to export!");
      return;
    }

    const dataToExport = data.map((item) => {
      const { profileImage, ...rest } = item;
      return rest;
    });

    const headers = Object.keys(dataToExport[0]).join(",");
    const csvRows = dataToExport
      .map((row) =>
        Object.values(row)
          .map((value) => {
            const safeValue =
              typeof value === "string" &&
              (value.includes(",") || value.includes("\n") || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            return safeValue;
          })
          .join(",")
      )
      .join("\n");

    const csvContent = headers + "\n" + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "Dashboard_Report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "22px 24px" }}>
      {/* Header & Filter Toolbar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "18px",
          borderBottom: "1px solid #eef3f1",
          paddingBottom: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h4
              style={{
                color: "#0e2f2c",
                fontWeight: 700,
                fontSize: "17px",
                margin: 0,
                letterSpacing: "-0.2px",
              }}
            >
              Analytics &amp; Performance Overview
            </h4>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                padding: "2px 9px",
                borderRadius: "999px",
                background: "#eef7f3",
                color: "#134e45",
              }}
            >
              Live API
            </span>
          </div>
          <span
            style={{
              fontSize: "12.5px",
              color: "#5d746e",
              fontWeight: 400,
              display: "block",
              marginTop: "3px",
            }}
          >
            Revenue trajectory alongside bookings and cancellation volume
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              htmlFor="startDate"
              style={{ fontSize: "12.5px", fontWeight: 600, color: "#3f5852", margin: 0 }}
            >
              From
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                fontSize: "13px",
                padding: "6px 10px",
                background: "#ffffff",
                border: "1px solid #dbe4e0",
                borderRadius: "8px",
                color: "#16302c",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              htmlFor="endDate"
              style={{ fontSize: "12.5px", fontWeight: 600, color: "#3f5852", margin: 0 }}
            >
              To
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                fontSize: "13px",
                padding: "6px 10px",
                background: "#ffffff",
                border: "1px solid #dbe4e0",
                borderRadius: "8px",
                color: "#16302c",
                outline: "none",
              }}
            />
          </div>

          <button
            type="button"
            onClick={exportToExcel}
            style={{
              fontSize: "13px",
              fontWeight: 600,
              padding: "7px 14px",
              border: "none",
              borderRadius: "8px",
              background: "#0e2f2c",
              color: "#ffffff",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#eb943d")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0e2f2c")}
          >
            <i className="fas fa-file-download" style={{ fontSize: "12.5px" }}></i>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Period Summary Strip */}
      {!loading && data.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#f4faf7",
              border: "1px solid #d7ebe3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#3f5852", fontWeight: 500 }}>
              Period Bookings
            </span>
            <strong style={{ color: "#134e45", fontSize: "15px" }}>
              {totals.bookings.toLocaleString()}
            </strong>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#fef9f1",
              border: "1px solid #f5e2c6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#3f5852", fontWeight: 500 }}>
              Period Revenue
            </span>
            <strong style={{ color: "#b45d0e", fontSize: "15px" }}>
              {totals.revenue.toLocaleString()}
            </strong>
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: "#fff6f5",
              border: "1px solid #f4d7d3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "12.5px", color: "#3f5852", fontWeight: 500 }}>
              Cancellations
            </span>
            <strong style={{ color: "#c0392b", fontSize: "15px" }}>
              {totals.cancellations.toLocaleString()}
            </strong>
          </div>
        </div>
      )}

      {/* Charts Area */}
      {loading ? (
        <div style={{ padding: "80px 20px", textAlign: "center", color: "#5d746e" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>
            Loading report analytics...
          </p>
        </div>
      ) : data.length === 0 ? (
        <div style={{ padding: "80px 20px", textAlign: "center", color: "#5d746e" }}>
          <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>
            No report data available for the selected date range.
          </p>
        </div>
      ) : (
        <div className="analytics-charts-grid">
          {/* Panel 1: Revenue Trend (Smooth Area Chart or Bar if 1 point) */}
          <div className="analytics-subpanel">
            <div className="analytics-subpanel-title">Revenue Trend</div>
            <ResponsiveContainer width="100%" height={290}>
              {data.length > 1 ? (
                <AreaChart
                  data={data}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eb943d" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#eb943d" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#5d746e" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#5d746e" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={compactFormat}
                    width={46}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#eb943d"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueAreaFill)"
                    activeDot={{ r: 5, fill: "#eb943d", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5d746e" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#5d746e" }} axisLine={false} tickLine={false} tickFormatter={compactFormat} width={46} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#eb943d" barSize={38} radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Panel 2: Bookings vs Cancellations */}
          <div className="analytics-subpanel">
            <div className="analytics-subpanel-title">Bookings &amp; Cancellations</div>
            <ResponsiveContainer width="100%" height={290}>
              <BarChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                barGap={6}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf2f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#5d746e" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#5d746e" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={compactFormat}
                  width={36}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(19, 78, 69, 0.04)" }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingTop: "8px", fontSize: "12.5px", fontWeight: 500 }}
                />
                <Bar
                  dataKey="bookings"
                  name="Bookings"
                  fill="#134e45"
                  barSize={16}
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="cancellations"
                  name="Cancellations"
                  fill="#e06d53"
                  barSize={16}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
