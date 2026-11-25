import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuCalendarCheck, LuCreditCard } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  formatDateValue,
} from "../shared/DetailLayout";

const PastBookingDetail = () => {
  const { bookingId } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}bookings/view`,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [bookingId, token]);

  return (
    <div className="detail-page">
      <DetailPageHeader
        title="Past Booking Details"
        subtitle={viewData?.guestHouseName || "Completed stay summary and payment breakdown"}
        status={viewData?.status}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <DetailSectionCard title="Booking Information" icon={<LuCalendarCheck />}>
            <DetailGrid columns={2}>
              <DetailField label="Guesthouse" value={viewData?.guestHouseName} />
              <DetailField label="Room" value={viewData?.room} />
              <DetailField label="Room Type" value={viewData?.roomType?.join(", ")} />
              <DetailField label="Guest" value={viewData?.guest} />
              <DetailField label="Check In" value={formatDateValue(viewData?.checkIn)} />
              <DetailField label="Check Out" value={formatDateValue(viewData?.checkOut)} />
              <DetailField label="Amount" value={viewData?.amount} />
              <DetailField label="Cleaning Fee" value={viewData?.cleaningFee} />
              <DetailField label="Tax" value={viewData?.taxAmount} />
              <DetailField label="Discount" value={viewData?.discount} />
              <DetailField label="Final Amount" value={viewData?.finalAmount} />
              <DetailField label="Status" value={viewData?.status} badge />
              <DetailField label="Address" value={viewData?.guestHouseAddress} fullWidth />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12 col-lg-4">
          <DetailSectionCard title="Payment Information" icon={<LuCreditCard />}>
            <DetailGrid columns={1}>
              <DetailField label="Customer Name" value={viewData?.paymentDetails?.customerName} />
              <DetailField label="Phone No" value={viewData?.paymentDetails?.customerContact} />
              <DetailField label="Payment Method" value={viewData?.paymentDetails?.paymentMethod} />
              <DetailField label="Payment Status" value={viewData?.paymentDetails?.paymentStatus} badge />
              <DetailField label="Payment Date" value={formatDateValue(viewData?.paymentDetails?.paymentDate)} />
            </DetailGrid>
          </DetailSectionCard>
        </div>
      </div>
    </div>
  );
};

export default PastBookingDetail;
