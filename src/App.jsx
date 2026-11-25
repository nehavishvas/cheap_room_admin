import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login";
import Forgotpassword from "./pages/Forgotpassword";
import MainLayout from "./components/MainLayout";
import ChangePassword from "./pages/ChangePassword";
import Protected from "./pages/Protected";
import ResetPassword from "./pages/ResetPassword";
import PageNotFound from "./pages/PageNotFound";
import OtpGenerate from "./pages/OtpGenrate";
import MyProfile from "./components/MY profile/MyProfile";
// import EngineerSection from "./components/Engineer Section/EngineerSection";
// import EnquirySection from "./components/Enquiry Section/EnquirySection";
import CustomerSection from "./components/Customer Section/CustomerSection";
// import ServiceSection from "./components/Service Section/ServiceSection";
// import SurveillanceSystem from "./components/ServicesPages/SurveillanceSystem";
// import AttendanceSystem from "./components/ServicesPages/AttendanceSystem";
// import SecuritySystem from "./components/ServicesPages/SecuritySystem";
// import AccessSystem from "./components/ServicesPages/AccessSystem";
// import OfficeSystem from "./components/ServicesPages/OfficeSystem";
// import HomeSystem from "./components/ServicesPages/HomeSystem";
// import WhyChoose from "./components/Home Section/WhyChoose";
// import ContactForm from "./components/Contact Section/ContactForm";
// import ContactDetails from "./components/Contact Section/ContactDetails";
// import DetailsContact from "./components/Contact Section/DetailsContact";
// import AboutSection from "./components/About Section/AboutSection";
// import AboutTeam from "./components/About Section/AboutTeam";
import GuestHouseDetails from "./components/guestHouse/GuestHouseDetails";
import ManageProperties from "./components/guestHouse/ManageProperties";
import BookingManagement from "./components/booking-management/BookingManagement";

// import CustomerManagement from "./components/customer-management/CustomerManagement";
import RoomManagement from "./components/room-management/RoomManagement";
import ManageBadType from "./components/room-management/ManageBadType";
import ManageFacilities from "./components/room-management/ManageFacilities";
import ManageRoomCategory from "./components/room-management/ManageRoomCategory"
import ManagePayment from "./components/payment-commission/ManagePayment";
import ManagePromotions from "./components/manage-promotion/ManagePromotions";
import ManageNotifications from "./components/content-management/Manage-Notifications";
import ManageReports from "./components/manage-reports/ManageReports";
import GuestHouseOwner from "./components/guestHouse/GuestHouseOwner";
import UpcomingBooking from "./components/booking-management/UpcomingBooking";
import PastBooking from "./components/booking-management/PastBooking";
import CancelledBooking from "./components/booking-management/CancelledBooking";
import ManageAtolls from "./components/Attols and islands/ManageAttols";
import ManageIslands from "./components/Attols and islands/ManageIslands";
import GuestHouseDeatilPage from "./components/guestHouse/GuestHouseDeatilPage";
import OwnerDetailPage from "./components/guestHouse/OwnerDetailPage";
import RoomDetailPage from "./components/room-management/RoomDetailsPage";
import AllBookingDetail from "./components/booking-management/AllBookingDetail";
import PastBookingDetail from "./components/booking-management/PastBookingDetail";
import CancelledBookingDetail from "./components/booking-management/CancelledBookingDetail";
import CustomerDetails from "./components/Customer Section/CustomerDetails";
import PaymentDetails from "./components/payment-commission/PaymentDetails";
import OfferDetails from "./components/manage-promotion/OfferDetails";
import ReportDetails from "./components/manage-reports/ReportDetails";
import ManagePayouts from "./components/payment-commission/ManagePayouts";
import ManageSupervisior from "./components/Manage SubAdmins/ManageSupervisior";
import ManageManager from "./components/Manage SubAdmins/ManageManager";
import SupervisorDetails from "./components/Manage SubAdmins/SupervisorDetails";
import ManagerDetails from "./components/Manage SubAdmins/ManagerDetails";
import ManagerAdd from "./components/Manage SubAdmins/AddManagerPage";
import SupervisorAdd from "./components/Manage SubAdmins/AddSupervisorPage";
import UpdateSupervisor from "./components/Manage SubAdmins/UpdateSupervisor"
import UpdateManager from "./components/Manage SubAdmins/UpdateManager";
import ManageFAQ from "./components/Manage FAQ/ManageFAQ";
import AddFAQ from "./components/Manage FAQ/AddFAQ";
import EditFAQ from "./components/Manage FAQ/EditFAQ";
import ManageRefund from "./components/payment-commission/ManageRefund";
import ManageCommission from "./components/payment-commission/ManageCommission";
function App() {
  console.log("date:25=11-2026,time:05:40");
  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<Forgotpassword />} />
        <Route path="/otp-generate" element={<OtpGenerate />} />
        <Route path="/admin" element={<Protected Component={MainLayout} />}>
          <Route index element={<Dashboard />} />
          <Route path="manage-guesthouse" element={<GuestHouseDetails />} />
          <Route path="manage-properties" element={<ManageProperties />} />
          <Route
            path="manage-guesthouse-Owners"
            element={<GuestHouseOwner />}
          />
          <Route path="all-bookings" element={<BookingManagement />} />
          <Route
            path="upcoming-bookings"
            element={<UpcomingBooking />}
          />

          <Route
            path="past-bookings"
            element={<PastBooking />}
          />

          <Route
            path="cancelled-bookings"
            element={<CancelledBooking />}
          />

          <Route path="manage-room/:guesthouseId" element={<RoomManagement />} />
          <Route
            path="room-category"
            element={<ManageRoomCategory />}
          />

          <Route
            path="room-bedtype"
            element={<ManageBadType />}
          />

          <Route
            path="room-facilities"
            element={<ManageFacilities />}
          />
          <Route path="all-atolls" element={<ManageAtolls />} />
          <Route path="all-islands/:name/:name_cn/:atollId" element={<ManageIslands />} />

          <Route path="manage-customer" element={<CustomerSection />} />
          <Route path="customer-details/:id" element={<CustomerDetails />} />


          <Route path="guesthousedetail/:guesthouseId" element={<GuestHouseDeatilPage />} />
          <Route path="ownerdetail/:guestHouseOwnerId" element={<OwnerDetailPage />} />

          <Route path="roomdetail/:roomId" element={<RoomDetailPage />} />

          <Route path="all-bokking-detail/:bookingId" element={<AllBookingDetail />} />
          <Route path="past-booking-detail/:bookingId" element={<PastBookingDetail />} />
          <Route path="cancelled-booking-detail/:bookingId" element={<CancelledBookingDetail />} />



          <Route path="manage-payments" element={<ManagePayment />} />
          <Route path="payments-details/:paymentId" element={<PaymentDetails />} />


          <Route path="manage-promotions" element={<ManagePromotions />} />
          <Route path="offer-details/:id" element={<OfferDetails />} />

          <Route path="all-notifications" element={<ManageNotifications />} />
          <Route path="manage-refund" element={<ManageRefund />} />
          <Route path="manage-commission" element={<ManageCommission />} />


          <Route path="manage-supervisior" element={<ManageSupervisior />} />
          <Route path="supervisior-add" element={<SupervisorAdd />} />
          <Route path="supervisior-update/:userId" element={<UpdateSupervisor />} />
          <Route path="supervisior-details/:role/:userId" element={<SupervisorDetails />} />

          <Route path="manage-manager" element={<ManageManager />} />
          <Route path="manager-add" element={<ManagerAdd />} />
          <Route path="manager-update/:userId" element={<UpdateManager />} />
          <Route path="manager-details/:role/:userId" element={<ManagerDetails />} />

          <Route path="manage-payouts" element={<ManagePayouts />} />
          <Route path="manage-reports" element={<ManageReports />} />
          <Route path="report-details/:reportId" element={<ReportDetails />} />

          <Route path="manage-faq" element={<ManageFAQ />} />
          <Route path="faq-add" element={<AddFAQ />} />
          <Route path="faq-update/:id" element={<EditFAQ />} />

          <Route path="change-password" element={<ChangePassword />} />
          <Route path="My-Profile" element={<MyProfile />} />
          {/* <Route path="engineer-section" element={<EngineerSection />} />
          <Route path="enquiry-section" element={<EnquirySection />} />
          <Route path="service-section" element={<ServiceSection />} /> */}
          {/* <Route path="assign-enquiry" element={<AssignEnquiry />} /> */}
          {/* <Route path="surveillance-system" element={<SurveillanceSystem />} />
          <Route path="attendance-system" element={<AttendanceSystem />} />
          <Route path="security-system" element={<SecuritySystem />} />
          <Route path="access-system" element={<AccessSystem />} />
          <Route path="office-system" element={<OfficeSystem />} />
          <Route path="home-system" element={<HomeSystem />} />
          <Route path="why-choose" element={<WhyChoose />} />
          <Route path="contact-form" element={<ContactForm />} />
          <Route path="contact-details" element={<ContactDetails />} />
          <Route path="details-contact" element={<DetailsContact />} />
          <Route path="about-section" element={<AboutSection />} />
          <Route path="about-team" element={<AboutTeam />} /> */}
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
