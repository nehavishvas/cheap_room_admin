import React, { useState, useEffect } from "react";
import "./MainLayout.css";
import {
  LuMenu,
  LuLayoutDashboard,
  LuBuilding2,
  LuBedDouble,
  LuUsers,
  LuLayers,
  LuTag,
  LuSparkles,
  LuCalendarCheck,
  LuCalendarDays,
  LuHistory,
  LuCalendarX,
  LuUserCog,
  LuShieldCheck,
  LuMapPin,
  LuCreditCard,
  LuLandmark,
  LuRotateCcw,
  LuPercent,
  LuTicket,
  LuBarChart2,
  LuHelpCircle,
  LuBell,
  LuChevronDown,
  LuUser,
  LuKeyRound,
  LuLogOut,
} from "react-icons/lu";
import logoSm from "../Assests/favicon.png";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavLink, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Layout, Menu } from "antd";
import { BaseUrl } from "../features/Api/BaseUrl";
import axios from "axios";

const { Header, Sider, Content } = Layout;
const TABLET_BREAKPOINT = 1024;

const PAGE_TITLES = {
  "": "Dashboard",
  "manage-guesthouse": "Guesthouse Details",
  "guesthousedetail": "Guesthouse Details",
  "manage-guesthouse-Owners": "Guesthouse Owners",
  "ownerdetail": "Owner Details",
  "manage-room": "Manage Rooms",
  "roomdetail": "Room Details",
  "room-category": "Room Category",
  "room-bedtype": "Room Bed Type",
  "room-facilities": "Room Facilities",
  "all-bookings": "All Bookings",
  "all-bokking-detail": "Booking Details",
  "past-bookings": "Past Bookings",
  "past-booking-detail": "Past Booking Details",
  "cancelled-bookings": "Cancelled Bookings",
  "cancelled-booking-detail": "Cancelled Booking Details",
  "manage-customer": "Manage Customer",
  "customer-details": "Customer Details",
  "manage-manager": "Manage Manager",
  "manager-add": "Add Manager",
  "manager-update": "Update Manager",
  "manager-details": "Manager Details",
  "manage-supervisior": "Manage Supervisor",
  "supervisior-add": "Add Supervisor",
  "supervisior-update": "Update Supervisor",
  "supervisior-details": "Supervisor Details",
  "all-atolls": "Manage Atolls",
  "all-islands": "Manage Islands",
  "manage-payments": "Manage Payments",
  "payments-details": "Payment Details",
  "manage-payouts": "Manage Payouts",
  "manage-refund": "Manage Refunds",
  "manage-commission": "Manage Commission",
  "manage-promotions": "Manage Offers",
  "offer-details": "Offer Details",
  "manage-reports": "Manage Reports",
  "report-details": "Report Details",
  "manage-faq": "Manage FAQ",
  "faq-add": "Add FAQ",
  "faq-update": "Edit FAQ",
  "all-notifications": "Notifications",
  "My-Profile": "My Profile",
  "change-password": "Change Password",
};

const MainLayout = () => {
  const [nameValue, setNameValue] = useState("");
  const [imageValue, setImageValue] = useState("");
  const [isDrawerMode, setIsDrawerMode] = useState(
    typeof window !== "undefined" ? window.innerWidth <= TABLET_BREAKPOINT : false
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [data, setData] = useState("");
  const [selectedKey, setSelectedKey] = useState("");
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role"));
  const adminImage = localStorage.getItem("adminImage");
  const location = useLocation();
  const token = localStorage.getItem("token");
  const name = localStorage.getItem("name");
  const { state } = location;

  useEffect(() => {
    const handleResize = () => {
      const tabletOrMobile = window.innerWidth <= TABLET_BREAKPOINT;
      setIsDrawerMode(tabletOrMobile);
      if (!tabletOrMobile) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const signoutData = () => {
    localStorage.clear();
    navigate("/");
  };

  const getApi = () => {
    axios
      .post(
        `${BaseUrl}profile-view`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setData(response.data.data);
        setImgError(false);
      })
      .catch((error) => {
        console.log(error?.response?.data || error.message);
      });
  };

  const hasPermission = (permission) => permissions.includes(permission);
  const canSee = (permission) => role === "admin" || hasPermission(permission);

  const getPrimarySegment = () => {
    const normalized = location.pathname.replace(/^\/admin\/?/i, "");
    return normalized.split("/")[0] || "";
  };

  const getActiveKey = () => {
    const primary = getPrimarySegment();
    switch (primary) {
      case "":
        return "";
      case "manage-guesthouse":
      case "guesthousedetail":
      case "manage-room":
      case "roomdetail":
        return "manage-guesthouse";
      case "manage-guesthouse-Owners":
      case "ownerdetail":
        return "manage-guesthouse-Owners";
      case "all-bookings":
      case "all-bokking-detail":
        return "all-bookings";
      case "past-bookings":
      case "past-booking-detail":
        return "past-bookings";
      case "cancelled-bookings":
      case "cancelled-booking-detail":
        return "cancelled-bookings";
      case "manage-customer":
      case "customer-details":
        return "manage-customer";
      case "manage-manager":
      case "manager-add":
      case "manager-update":
      case "manager-details":
        return "manage-manager";
      case "manage-supervisior":
      case "supervisior-add":
      case "supervisior-update":
      case "supervisior-details":
        return "manage-supervisior";
      case "all-atolls":
      case "all-islands":
        return "all-atolls";
      case "manage-payments":
      case "payments-details":
        return "manage-payments";
      case "manage-promotions":
      case "offer-details":
        return "manage-promotions";
      case "manage-reports":
      case "report-details":
        return "manage-reports";
      case "manage-faq":
      case "faq-add":
      case "faq-update":
        return "manage-faq";
      default:
        return primary;
    }
  };

  const checkPermissionForRoute = (pathname) => {
    const pathMap = {
      "/Admin": true,
      "/admin": true,
      "/admin/My-Profile": true,
      "/admin/change-password": true,
      "/Admin/manage-guesthouse": hasPermission("Manage Guesthouse"),
      "/Admin/manage-guesthouse-Owners": hasPermission("Manage Guesthouse"),
      "/Admin/manage-room": hasPermission("Manage Rooms"),
      "/Admin/room-category": hasPermission("Room Types"),
      "/Admin/room-bedtype": hasPermission("Room Types"),
      "/Admin/room-facilities": hasPermission("Room Types"),
      "/Admin/all-bookings": hasPermission("Manage Bookings"),
      "/Admin/past-bookings": hasPermission("Manage Bookings"),
      "/Admin/cancelled-bookings": hasPermission("Manage Bookings"),
      "/Admin/manage-customer": hasPermission("Manage Customer"),
      "/Admin/manage-manager": hasPermission("Manage Manager"),
      "/Admin/manage-supervisior": hasPermission("Manage Supervisior"),
      "/Admin/all-atolls": hasPermission("Manage All Atolls"),
      "/Admin/manage-payments": hasPermission("Manage Payments"),
      "/Admin/manage-payouts": hasPermission("Manage Payouts"),
      "/Admin/manage-refund": hasPermission("Manage Refunds"),
      "/Admin/manage-commission": hasPermission("Manage Commission"),
      "/Admin/manage-promotions": hasPermission("Manage Offers"),
      "/Admin/manage-reports": hasPermission("Manage Reports"),
      "/Admin/manage-faq": hasPermission("Manage FAQ"),
      "/Admin/surveillance-system": hasPermission("Manage Content"),
      "/Admin/attendance-system": hasPermission("Manage Content"),
    };

    if (role === "admin") return true;
    if (pathMap[pathname] !== undefined) {
      return pathMap[pathname] === true;
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments[0]?.toLowerCase() === "admin") {
      const primarySegment = segments[1];
      if (
        primarySegment === "all-bokking-detail" ||
        primarySegment === "past-booking-detail" ||
        primarySegment === "cancelled-booking-detail"
      ) {
        return hasPermission("Manage Bookings");
      }
      if (
        primarySegment === "guesthousedetail" ||
        primarySegment === "ownerdetail" ||
        primarySegment === "manage-room"
      ) {
        return hasPermission("Manage Guesthouse");
      }
      if (primarySegment === "roomdetail") return hasPermission("Manage Rooms");
      if (primarySegment === "customer-details") return hasPermission("Manage Customer");
      if (primarySegment === "all-islands") return hasPermission("Manage All Atolls");
      if (
        primarySegment === "manager-add" ||
        primarySegment === "manager-update" ||
        primarySegment === "manager-details"
      ) {
        return hasPermission("Manage Manager");
      }
      if (
        primarySegment === "supervisior-add" ||
        primarySegment === "supervisior-update" ||
        primarySegment === "supervisior-details"
      ) {
        return hasPermission("Manage Supervisior");
      }
      if (primarySegment === "payments-details") return hasPermission("Manage Payments");
      if (primarySegment === "offer-details") return hasPermission("Manage Offers");
      if (primarySegment === "report-details") return hasPermission("Manage Reports");
    }

    return false;
  };

  useEffect(() => {
    getApi();
    window.addEventListener("profileUpdated", getApi);
    setSelectedKey(getActiveKey());

    return () => {
      window.removeEventListener("profileUpdated", getApi);
    };
  }, []);

  useEffect(() => {
    if (name) {
      setNameValue(name);
    } else {
      localStorage.setItem("namee", state?.dataValue?.name || "");
      setNameValue(state?.dataValue?.name || "");
    }
    if (adminImage) {
      setImageValue(adminImage);
    } else {
      localStorage.setItem("adminImagee", state?.dataValue?.adminImage || "");
      setImageValue(state?.dataValue?.adminImage || "");
    }
  }, [nameValue, imageValue, state]);

  useEffect(() => {
    setSelectedKey(getActiveKey());
  }, [location.pathname]);

  useEffect(() => {
    const storedPermissions = JSON.parse(localStorage.getItem("permissions"));
    if (storedPermissions) {
      setPermissions(storedPermissions);
    }
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    if (permissions.length > 0 || role === "admin") {
      const isAuthorized = checkPermissionForRoute(location.pathname);
      if (!isAuthorized) {
        console.warn(`Unauthorized access attempt to: ${location.pathname}`);
        navigate("/admin", { replace: true });
      }
    }
  }, [location.pathname, permissions, role, navigate]);

  const handleMenuClick = ({ key }) => {
    if (key === "signout") {
      signoutData();
    } else {
      setSelectedKey(key);
      navigate(key ? `/admin/${key}` : "/admin");
    }
    if (isDrawerMode) {
      setDrawerOpen(false);
    }
  };

  const displayName = data?.name || nameValue || "Admin";
  const avatarSrc = data?.adminImage || imageValue;
  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  const pageTitle = PAGE_TITLES[getPrimarySegment()] || "Admin Panel";

  return (
    <Layout className="main-app-layout">
      {isDrawerMode && drawerOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sider
        trigger={null}
        width={256}
        className={`app-sider ${
          isDrawerMode && drawerOpen ? "mobile-sider-open" : ""
        }`}
      >
        <div className="sidebar-logo-container">
          <div
            className="sidebar-logo-link"
            onClick={() => {
              navigate("/admin");
              if (isDrawerMode) setDrawerOpen(false);
            }}
          >
            <div className="sidebar-logo-icon-wrap">
              <img src={logoSm} className="sidebar-logo-icon" alt="Cheap Rooms" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">
                Cheap<span>Rooms</span>
              </span>
              <span className="sidebar-brand-tagline">STAY | BOOK | MANAGE</span>
            </div>
          </div>
        </div>

        <div className="sidebar-menu-scroll">
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
          >
            <Menu.Item key="" icon={<LuLayoutDashboard />}>
              Dashboard
            </Menu.Item>

            {canSee("Manage Guesthouse") && (
              <Menu.SubMenu
                key="guesthouse"
                icon={<LuBuilding2 />}
                title="Manage Guesthouse"
              >
                <Menu.Item key="manage-guesthouse" icon={<LuBedDouble />}>
                  Guesthouse Details
                </Menu.Item>
                <Menu.Item key="manage-guesthouse-Owners" icon={<LuUsers />}>
                  Guesthouse Owners
                </Menu.Item>
              </Menu.SubMenu>
            )}

            {canSee("Room Types") && (
              <Menu.SubMenu
                key="manage-roomtype"
                icon={<LuLayers />}
                title="Room Types"
              >
                <Menu.Item key="room-category" icon={<LuTag />}>
                  Room Category
                </Menu.Item>
                <Menu.Item key="room-bedtype" icon={<LuBedDouble />}>
                  Room Bed Type
                </Menu.Item>
                <Menu.Item key="room-facilities" icon={<LuSparkles />}>
                  Room Facilities
                </Menu.Item>
              </Menu.SubMenu>
            )}

            {canSee("Manage Bookings") && (
              <Menu.SubMenu
                key="manage-booking"
                icon={<LuCalendarCheck />}
                title="Manage Bookings"
              >
                <Menu.Item key="all-bookings" icon={<LuCalendarDays />}>
                  All Bookings
                </Menu.Item>
                <Menu.Item key="past-bookings" icon={<LuHistory />}>
                  Past Bookings
                </Menu.Item>
                <Menu.Item key="cancelled-bookings" icon={<LuCalendarX />}>
                  Cancelled Bookings
                </Menu.Item>
              </Menu.SubMenu>
            )}

            {canSee("Manage Customer") && (
              <Menu.Item key="manage-customer" icon={<LuUsers />}>
                Manage Customer
              </Menu.Item>
            )}

            {canSee("Manage Manager") && (
              <Menu.Item key="manage-manager" icon={<LuUserCog />}>
                Manage Manager
              </Menu.Item>
            )}

            {canSee("Manage Supervisior") && (
              <Menu.Item key="manage-supervisior" icon={<LuShieldCheck />}>
                Manage Supervisor
              </Menu.Item>
            )}

            {canSee("Manage All Atolls") && (
              <Menu.Item key="all-atolls" icon={<LuMapPin />}>
                Manage All Atolls
              </Menu.Item>
            )}

            {canSee("Manage Payments") && (
              <Menu.Item key="manage-payments" icon={<LuCreditCard />}>
                Manage Payments
              </Menu.Item>
            )}

            {canSee("Manage Payouts") && (
              <Menu.Item key="manage-payouts" icon={<LuLandmark />}>
                Manage Payouts
              </Menu.Item>
            )}

            {canSee("Manage Refunds") && (
              <Menu.Item key="manage-refund" icon={<LuRotateCcw />}>
                Manage Refunds
              </Menu.Item>
            )}

            {canSee("Manage Commission") && (
              <Menu.Item key="manage-commission" icon={<LuPercent />}>
                Manage Commission
              </Menu.Item>
            )}

            {canSee("Manage Offers") && (
              <Menu.Item key="manage-promotions" icon={<LuTicket />}>
                Manage Offers
              </Menu.Item>
            )}

            {canSee("Manage Reports") && (
              <Menu.Item key="manage-reports" icon={<LuBarChart2 />}>
                Manage Reports
              </Menu.Item>
            )}

            {(canSee("Manage FAQ") || hasPermission("Manage Reports")) && (
              <Menu.Item key="manage-faq" icon={<LuHelpCircle />}>
                Manage FAQ
              </Menu.Item>
            )}
          </Menu>
        </div>
      </Sider>

      <Layout className="site-layout">
        <Header className="app-header">
          <div className="header-left">
            <button
              type="button"
              className="header-toggle-btn"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-label="Open navigation menu"
            >
              <LuMenu />
            </button>

            <div className="header-breadcrumb">
              <span className="header-breadcrumb-brand">Cheap Rooms</span>
              <span className="header-breadcrumb-sep">/</span>
              <span className="header-breadcrumb-page">{pageTitle}</span>
            </div>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="header-icon-btn"
              onClick={() => navigate("/admin/all-notifications")}
              aria-label="Notifications"
              title="Notifications"
            >
              <LuBell style={{ fontSize: "18px" }} />
            </button>

            <div className="dropdown">
              <button
                type="button"
                className="header-profile-trigger"
                id="profileDropdownMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <div className="header-avatar-wrap">
                  {avatarSrc && !imgError ? (
                    <img
                      className="header-avatar"
                      src={avatarSrc}
                      alt={displayName}
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="header-avatar-fallback">{initials}</div>
                  )}
                  <span className="header-avatar-status" />
                </div>

                <div className="header-user-meta">
                  <span className="header-user-name">{displayName}</span>
                  {role && <span className="header-user-role">{role}</span>}
                </div>

                <LuChevronDown style={{ fontSize: "15px", color: "#5d746e" }} />
              </button>

              <ul
                className="dropdown-menu dropdown-menu-end profile-dropdown-menu"
                aria-labelledby="profileDropdownMenu"
              >
                <li className="profile-dropdown-header">
                  <div className="profile-dropdown-name">{displayName}</div>
                  {role && <div className="profile-dropdown-role">{role}</div>}
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <NavLink
                    to="/admin/My-Profile"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedKey("My-Profile");
                      navigate("/admin/My-Profile");
                    }}
                  >
                    <LuUser className="dropdown-item-icon" />
                    <span>My Profile</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/admin/change-password"
                    className="dropdown-item"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedKey("change-password");
                      navigate("/admin/change-password");
                    }}
                  >
                    <LuKeyRound className="dropdown-item-icon" />
                    <span>Change Password</span>
                  </NavLink>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button
                    type="button"
                    className="dropdown-item dropdown-item-danger"
                    onClick={signoutData}
                  >
                    <LuLogOut className="dropdown-item-icon" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </Header>

        <Content className="app-content">
          <ToastContainer
            position="top-right"
            autoClose={1500}
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

        <p className="app-footer">
          Copyright © {new Date().getFullYear()} Cheap Rooms MV. All rights reserved.
        </p>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
