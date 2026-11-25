import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuBedDouble, LuBuilding2 } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailMediaCard,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  DetailChips,
} from "../shared/DetailLayout";

const RoomDetailPage = () => {
  const { roomId } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}rooms/view`,
        { roomId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [roomId, token]);

  return (
    <div className="detail-page">
      <DetailPageHeader
        title={viewData?.roomCategory || "Room Details"}
        subtitle={viewData?.guesthouse?.name || "Room configuration and rates"}
        status={viewData?.status}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <DetailMediaCard
            images={viewData?.photos}
            title={viewData?.roomCategory}
            fallbackText={viewData?.roomCategory || "R"}
          />
        </div>

        <div className="col-12 col-lg-7">
          <DetailSectionCard title="Guesthouse Details" icon={<LuBuilding2 />}>
            <DetailGrid columns={2}>
              <DetailField label="Guesthouse Name" value={viewData?.guesthouse?.name} />
              <DetailField label="Phone No" value={viewData?.guesthouse?.contactNumber} />
              <DetailField label="Address" value={viewData?.guesthouse?.address} fullWidth />
              <DetailField label="Description" value={viewData?.guesthouse?.description} fullWidth />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12">
          <DetailSectionCard title="Room Information" icon={<LuBedDouble />}>
            <DetailGrid columns={2}>
              <DetailField label="Room Category" value={viewData?.roomCategory} />
              <DetailField label="Bed Type" value={viewData?.bedType} />
              <DetailField label="Price Per Night" value={viewData?.pricePerNight} />
              <DetailField label="Price Weekly" value={viewData?.priceWeekly} />
              <DetailField label="Price Monthly" value={viewData?.priceMonthly} />
              <DetailField label="Capacity" value={viewData?.capacity} />
              <DetailField label="Status" value={viewData?.status} badge />
              <DetailField label="Description" value={viewData?.description} fullWidth />
              <DetailChips label="Facilities" items={viewData?.facilities} />
            </DetailGrid>
          </DetailSectionCard>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
