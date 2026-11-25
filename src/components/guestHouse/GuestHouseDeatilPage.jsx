import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuBuilding2, LuUser } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailMediaCard,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  DetailChips,
} from "../shared/DetailLayout";

const GuestHouseDetailPage = () => {
  const { guesthouseId } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}guesthouses/view`,
        { guesthouseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [guesthouseId, token]);

  return (
    <div className="detail-page">
      <DetailPageHeader
        title={viewData?.name || "Guesthouse Details"}
        subtitle={viewData?.address || "Property profile and owner information"}
        status={viewData?.status}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <DetailMediaCard
            images={viewData?.guestHouseImage}
            title={viewData?.name}
            fallbackText={viewData?.name || "G"}
          />
        </div>

        <div className="col-12 col-lg-7">
          <DetailSectionCard title="Owner Details" icon={<LuUser />}>
            <DetailGrid columns={2}>
              <DetailField label="Owner Name" value={viewData?.ownerDetails?.name} />
              <DetailField label="Owner Email" value={viewData?.ownerDetails?.email} />
              <DetailField label="Owner Phone" value={viewData?.ownerDetails?.phone} />
              <DetailField label="Status" value={viewData?.status} badge />
              <DetailField label="Ratings" value={viewData?.rating} />
              <DetailField label="Review Count" value={viewData?.reviewsCount} />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12">
          <DetailSectionCard title="Guesthouse Information" icon={<LuBuilding2 />}>
            <DetailGrid columns={2}>
              <DetailField label="Name" value={viewData?.name} />
              <DetailField label="Phone" value={viewData?.contactNumber} />
              <DetailField label="Atolls" value={viewData?.atolls?.name} />
              <DetailField label="Islands" value={viewData?.islands} />
              <DetailField label="Price" value={viewData?.price} />
              <DetailField label="Cleaning Fee" value={viewData?.cleaningFee} />
              <DetailField label="Tax Percent" value={viewData?.taxPercent} />
              <DetailField label="Comments" value={viewData?.reviewsText} />
              <DetailField label="Address" value={viewData?.address} fullWidth />
              <DetailField label="Description" value={viewData?.description} fullWidth />
              <DetailChips label="Facilities" items={viewData?.facilities} />
            </DetailGrid>
          </DetailSectionCard>
        </div>
      </div>
    </div>
  );
};

export default GuestHouseDetailPage;
