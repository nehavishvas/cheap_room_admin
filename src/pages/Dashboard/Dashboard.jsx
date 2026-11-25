import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { BaseUrl } from "../../features/Api/BaseUrl";
import axios from "axios";
import CountUp from "react-countup";
import BarChart from "./Barchart";
import { useNavigate } from "react-router-dom";

// Clean minimal outline icons
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";

const Dashboard = () => {
  const [dashData, setDashData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const getDash = () => {
    setRefreshing(true);
    axios
      .post(
        `${BaseUrl}dashboard`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        setDashData(response.data.data || {});
      })
      .catch((error) => console.error(error))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    getDash();
  }, []);

  const stats = [
    {
      key: "bookings",
      title: "Total Bookings",
      value: dashData?.totalBookings || 0,
      badge: "Live Stays",
      hint: "across all guesthouses",
      icon: <EventAvailableOutlinedIcon fontSize="small" />,
      route: "all-bookings",
      cardClass: "card-bookings",
      iconClass: "icon-bookings",
      badgeClass: "badge-bookings",
    },
    {
      key: "revenue",
      title: "Total Revenue",
      value: dashData?.totalRevenue || 0,
      badge: "Earnings",
      hint: "gross platform volume",
      icon: <AccountBalanceWalletOutlinedIcon fontSize="small" />,
      route: "manage-payments",
      cardClass: "card-revenue",
      iconClass: "icon-revenue",
      badgeClass: "badge-revenue",
    },
    {
      key: "commission",
      title: "Total Commission",
      value: dashData?.totalCommission || 0,
      badge: "Net Share",
      hint: "platform earnings",
      icon: <PaidOutlinedIcon fontSize="small" />,
      route: "manage-commission",
      cardClass: "card-commission",
      iconClass: "icon-commission",
      badgeClass: "badge-commission",
    },
    {
      key: "guesthouses",
      title: "Total Guesthouses",
      value: dashData?.totalGuesthouses || 0,
      badge: "Properties",
      hint: "active listings",
      icon: <ApartmentOutlinedIcon fontSize="small" />,
      route: "manage-guesthouse",
      cardClass: "card-guesthouses",
      iconClass: "icon-guesthouses",
      badgeClass: "badge-guesthouses",
    },
    {
      key: "customers",
      title: "Total Customers",
      value: dashData?.totalCustomers || 0,
      badge: "Registered",
      hint: "verified guest accounts",
      icon: <PeopleOutlineOutlinedIcon fontSize="small" />,
      route: "manage-customer",
      cardClass: "card-customers",
      iconClass: "icon-customers",
      badgeClass: "badge-customers",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Warm Cream Overview Hero Card */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-eyebrow">
          <AutoAwesomeOutlinedIcon style={{ fontSize: "15px" }} />
          <span>Cheap Rooms Maldives Network</span>
        </div>
        <h2 className="dashboard-hero-title">Admin Overview &amp; Operations Center</h2>
        <p className="dashboard-hero-subtitle">
          Live booking telemetry, platform revenue, commission tracking, and guesthouse property management.
        </p>
        <button
          type="button"
          className="dashboard-refresh-btn"
          onClick={getDash}
          disabled={refreshing}
        >
          <SyncOutlinedIcon
            style={{ fontSize: "15px" }}
            className={refreshing ? "spin-icon" : ""}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh Metrics"}</span>
        </button>
      </div>

      {/* Responsive Pastel KPI Cards */}
      <div className="cards">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className={`dashboard-card ${stat.cardClass}`}
            onClick={() => navigate(stat.route)}
          >
            <div className="card-top">
              <span className="card-name">{stat.title}</span>
              <span className={`card-outline-icon ${stat.iconClass}`}>{stat.icon}</span>
            </div>

            <div className="number">
              <CountUp end={stat.value} separator="," duration={0.8} />
            </div>

            <div className="card-bottom">
              <span className={`card-badge ${stat.badgeClass}`}>
                <TrendingUpOutlinedIcon style={{ fontSize: "13px" }} />
                <span>{stat.badge}</span>
              </span>
              <span className="card-hint">{stat.hint}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart Section */}
      <div className="chart-card-wrapper">
        <BarChart />
      </div>
    </div>
  );
};

export default Dashboard;
