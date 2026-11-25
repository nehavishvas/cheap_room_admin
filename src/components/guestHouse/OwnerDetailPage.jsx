import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuUser } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailMediaCard,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  formatDateValue,
} from "../shared/DetailLayout";

const OwnerDetailPage = () => {
  const { guestHouseOwnerId } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}guesthouse/owners/view`,
        { guestHouseOwnerId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [guestHouseOwnerId, token]);

  return (
    <div className="detail-page">
      <DetailPageHeader
        title="Guesthouse Owner Details"
        subtitle="Account and contact profile"
        status={viewData?.status}
      />

      <DetailMediaCard
        isAvatar
        singleImage={viewData?.profileImage}
        title={viewData?.name || "Guesthouse Owner"}
        subtitle={viewData?.email || ""}
        fallbackText={viewData?.name || "O"}
      />

      <DetailSectionCard title="Owner Information" icon={<LuUser />}>
        <DetailGrid columns={2}>
          <DetailField label="Name" value={viewData?.name} />
          <DetailField label="Email" value={viewData?.email} />
          <DetailField label="Phone" value={viewData?.phone} />
          <DetailField label="Status" value={viewData?.status} badge />
          <DetailField label="Created Date" value={formatDateValue(viewData?.createdAt)} />
          <DetailField label="Address" value={viewData?.address} fullWidth />
        </DetailGrid>
      </DetailSectionCard>
    </div>
  );
};

export default OwnerDetailPage;
