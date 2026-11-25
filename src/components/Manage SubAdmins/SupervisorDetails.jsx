import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuShieldCheck } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailMediaCard,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  DetailChips,
} from "../shared/DetailLayout";

const SupervisorDetails = () => {
  const { userId, role } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}users/view`,
        { userId, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [userId, role, token]);

  const permissions = Array.isArray(viewData.permissions) ? viewData.permissions : [];

  return (
    <div className="detail-page">
      <DetailPageHeader
        title="Supervisor Details"
        subtitle="Supervisor account profile and assigned permissions"
        status={viewData?.status}
      />

      <DetailMediaCard
        isAvatar
        singleImage={viewData?.adminImage}
        title={viewData?.name || "Supervisor"}
        subtitle={viewData?.email || ""}
        fallbackText={viewData?.name || "S"}
      />

      <DetailSectionCard title="Supervisor Information" icon={<LuShieldCheck />}>
        <DetailGrid columns={2}>
          <DetailField label="Name" value={viewData?.name} />
          <DetailField label="Email" value={viewData?.email} />
          <DetailField label="Phone" value={viewData?.phone} />
          <DetailField label="Role" value={viewData?.role} />
          <DetailField label="Status" value={viewData?.status} badge />
          <DetailChips label="Permissions" items={permissions} emptyText="No permissions assigned." />
        </DetailGrid>
      </DetailSectionCard>
    </div>
  );
};

export default SupervisorDetails;
