import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuTicket } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailMediaCard,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  formatDateValue,
} from "../shared/DetailLayout";

const OfferDetails = () => {
  const { id } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}promos/view`,
        { id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [id, token]);

  const discountType = viewData?.discountType
    ? viewData.discountType.charAt(0).toUpperCase() + viewData.discountType.slice(1)
    : "NA";

  return (
    <div className="detail-page">
      <DetailPageHeader
        title="Offer Details"
        subtitle={viewData?.code ? `Promo Code: ${viewData.code}` : "Promotional offer configuration"}
        status={viewData?.status}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <DetailMediaCard
            singleImage={viewData?.promoImage}
            title={viewData?.code}
            fallbackText={viewData?.code || "O"}
          />
        </div>

        <div className="col-12 col-lg-7">
          <DetailSectionCard title="Offer Information" icon={<LuTicket />}>
            <DetailGrid columns={2}>
              <DetailField label="Promo Code" value={viewData?.code} />
              <DetailField label="Discount Type" value={discountType} />
              <DetailField label="Discount Value" value={viewData?.discountValue} />
              <DetailField label="Status" value={viewData?.status} badge />
              <DetailField label="Valid From" value={formatDateValue(viewData?.startDate)} />
              <DetailField label="Valid Till" value={formatDateValue(viewData?.endDate)} />
            </DetailGrid>
          </DetailSectionCard>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;
