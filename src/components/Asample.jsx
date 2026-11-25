import React, { useState, useEffect } from "react";
import "./MainLayout.css";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import logo from "../Assests/Mainlogo.png";
import logoSm from "../Assests/fav.png";
import { AiOutlineDashboard, AiOutlineUser } from "react-icons/ai";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavLink, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { Layout, Menu, theme } from "antd";
import { useNavigate } from "react-router-dom";
import { BaseUrl } from "../features/Api/BaseUrl";
import axios from "axios";
import CampaignIcon from "@mui/icons-material/Campaign";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import BedIcon from "@mui/icons-material/Bed";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeIcon from "@mui/icons-material/Home";
import CategoryIcon from "@mui/icons-material/Category";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventIcon from "@mui/icons-material/Event";
import HistoryIcon from "@mui/icons-material/History";
import TerrainIcon from "@mui/icons-material/Terrain";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CancelIcon from "@mui/icons-material/Cancel";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [data, setData] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role"));
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const signoutData = () => {
    localStorage.clear();
    navigate("/");
  };

  // Fetch user data (like profile)
  const getApi = () => {
    axios
      .post(`${BaseUrl}profile-view`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  };

  // Fetch permissions for the logged-in user
  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permissions"));
    if (storedPermissions) {
      setPermissions(storedPermissions);
    }
    setRole(localStorage.getItem("role"));
  }, []);

  // Function to check if the user has a specific permission
  const hasPermission = (permission) => {
    return permissions.includes(permission); // Check if permission exists
  };

  // Active key for highlighting the current menu item
  const getActiveKey = () => {
    const path = window.location.pathname;
    switch (path) {
      case "/Admin/manage-guesthouse":
        return "manage-guesthouse";
      case "/Admin/manage-room":
        return "manage-room";
      case "/Admin/manage-booking":
        return "manage-booking";
      default:
        return "";
    }
  };

  const menuStyle = {
    background: "#1b4339",
    color: "#fff",
    height: "100vh",
    overflowY: "auto",
  };

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          mode="inline"
          style={menuStyle}
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            setSelectedKey(key);
            navigate(`/Admin/${key}`);
          }}
        >
          {/* Dashboard - Always visible */}
          <Menu.Item key="dashboard" icon={<AiOutlineDashboard className="fs-4" />}>
            Dashboard
          </Menu.Item>

          {/* If role is Admin, show all sections */}
          {role === "admin" && (
            <>
              <Menu.SubMenu key="guesthouse" icon={<MiscellaneousServicesIcon className="fs-4" />} title="Manage Guesthouse">
                <Menu.Item key="manage-guesthouse" icon={<BedIcon className="fs-4" />}>
                  Guesthouse Details
                </Menu.Item>
                <Menu.Item key="manage-guesthouse-Owners" icon={<PeopleAltIcon className="fs-4" />}>
                  Guesthouse Owners
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu key="manage-room" icon={<ApartmentIcon className="fs-4" />} title="Manage Rooms">
                <Menu.Item key="manage-room" icon={<ApartmentIcon className="fs-4" />}>
                  All Rooms
                </Menu.Item>
                <Menu.Item key="room-category" icon={<CategoryIcon className="fs-4" />}>
                  Room Category
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.SubMenu key="manage-booking" icon={<EventAvailableIcon className="fs-4" />} title="Manage Bookings">
                <Menu.Item key="all-bookings" icon={<EventIcon className="fs-4" />}>
                  All Bookings
                </Menu.Item>
                <Menu.Item key="past-bookings" icon={<HistoryIcon className="fs-4" />}>
                  Past Bookings
                </Menu.Item>
              </Menu.SubMenu>

              <Menu.Item key="manage-manager" icon={<ManageAccountsIcon className="fs-4" />}>
                Manage Manager
              </Menu.Item>

              <Menu.Item key="manage-supervisor" icon={<SupervisorAccountIcon className="fs-4" />}>
                Manage Supervisor
              </Menu.Item>
            </>
          )}

          {/* For manager or supervisor, show based on permissions */}
          {role !== "admin" && (
            <>
              {hasPermission("Manage Guesthouse") && (
                <Menu.SubMenu key="guesthouse" icon={<MiscellaneousServicesIcon className="fs-4" />} title="Manage Guesthouse">
                  <Menu.Item key="manage-guesthouse" icon={<BedIcon className="fs-4" />}>
                    Guesthouse Details
                  </Menu.Item>
                  <Menu.Item key="manage-guesthouse-Owners" icon={<PeopleAltIcon className="fs-4" />}>
                    Guesthouse Owners
                  </Menu.Item>
                </Menu.SubMenu>
              )}

              {hasPermission("Manage Rooms") && (
                <Menu.SubMenu key="manage-room" icon={<ApartmentIcon className="fs-4" />} title="Manage Rooms">
                  <Menu.Item key="manage-room" icon={<ApartmentIcon className="fs-4" />}>
                    All Rooms
                  </Menu.Item>
                </Menu.SubMenu>
              )}

              {hasPermission("Manage Bookings") && (
                <Menu.SubMenu key="manage-booking" icon={<EventAvailableIcon className="fs-4" />} title="Manage Bookings">
                  <Menu.Item key="all-bookings" icon={<EventIcon className="fs-4" />}>
                    All Bookings
                  </Menu.Item>
                  <Menu.Item key="past-bookings" icon={<HistoryIcon className="fs-4" />}>
                    Past Bookings
                  </Menu.Item>
                </Menu.SubMenu>
              )}
            </>
          )}
        </Menu>
      </Sider>

      <Layout className="site-layout">
        <Header
          className="d-flex justify-content-between ps-1 pe-5"
          style={{ backgroundColor: "#fff", padding: 0, height: 70 }}
        >
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            className: "trigger",
            onClick: () => setCollapsed(!collapsed),
          })}
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            minHeight: 280,
            background: theme.useToken().colorBgContainer,
          }}
        >
          <ToastContainer
            position="top-right"
            autoClose={250}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
          />
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
