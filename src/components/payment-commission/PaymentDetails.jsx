import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuBuilding2, LuUser, LuCalendarCheck, LuCreditCard } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  formatDateValue,
} from "../shared/DetailLayout";

const PaymentDetails = () => {
  const { paymentId } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}payments/details`,
        { paymentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [paymentId, token]);

  return (
    <div className="detail-page">
      <DetailPageHeader
        title="Payment Details"
        subtitle={viewData?.guesthouse?.name || "Transaction, booking, and customer breakdown"}
        status={viewData?.payment?.paymentStatus}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-8">
          <DetailSectionCard title="Guesthouse Info" icon={<LuBuilding2 />}>
            <DetailGrid columns={2}>
              <DetailField label="Name" value={viewData?.guesthouse?.name} />
              <DetailField label="Phone" value={viewData?.guesthouse?.contactNumber} />
              <DetailField label="Price" value={viewData?.guesthouse?.price} />
              <DetailField label="Tax Percent" value={viewData?.guesthouse?.taxPercent} />
              <DetailField label="Cleaning Fee" value={viewData?.guesthouse?.cleaningFee} />
              <DetailField label="Address" value={viewData?.guesthouse?.address} fullWidth />
              <DetailField label="Description" value={viewData?.guesthouse?.description} fullWidth />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12 col-lg-4">
          <DetailSectionCard title="Customer Details" icon={<LuUser />}>
            <DetailGrid columns={1}>
              <DetailField label="Customer Name" value={viewData?.customer?.name} />
              <DetailField label="Email" value={viewData?.customer?.email} />
              <DetailField label="Phone" value={viewData?.customer?.phone} />
              <DetailField label="Address" value={viewData?.customer?.address} />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12 col-lg-8">
          <DetailSectionCard title="Booking Details" icon={<LuCalendarCheck />}>
            <DetailGrid columns={2}>
              <DetailField label="Check In" value={formatDateValue(viewData?.booking?.checkIn)} />
              <DetailField label="Check Out" value={formatDateValue(viewData?.booking?.checkOut)} />
              <DetailField label="Nights" value={viewData?.booking?.nights} />
              <DetailField label="Amount" value={viewData?.booking?.amount} />
              <DetailField label="Cleaning Fee" value={viewData?.booking?.cleaningFee} />
              <DetailField label="Tax Amount" value={viewData?.booking?.taxAmount} />
              <DetailField label="Discount" value={viewData?.booking?.discount} />
              <DetailField label="Final Amount" value={viewData?.booking?.finalAmount} />
              <DetailField label="Status" value={viewData?.booking?.status} badge />
              <DetailField label="Reason" value={viewData?.booking?.reason} fullWidth />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12 col-lg-4">
          <DetailSectionCard title="Payment Breakdown" icon={<LuCreditCard />}>
            <DetailGrid columns={1}>
              <DetailField label="Amount" value={viewData?.payment?.amount} />
              <DetailField label="Admin Commission" value={viewData?.payment?.commissionAmount} />
              <DetailField label="Guesthouse Amount" value={viewData?.payment?.guesthouseAmount} />
              <DetailField label="Payment Method" value={viewData?.payment?.paymentMethod} />
              <DetailField label="Payment Status" value={viewData?.payment?.paymentStatus} badge />
            </DetailGrid>
          </DetailSectionCard>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
