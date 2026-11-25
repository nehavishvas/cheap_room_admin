import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BaseUrl } from "../../features/Api/BaseUrl";
import { LuFileWarning, LuUser, LuBuilding2 } from "react-icons/lu";
import {
  DetailPageHeader,
  DetailMediaCard,
  DetailSectionCard,
  DetailGrid,
  DetailField,
  formatDateValue,
} from "../shared/DetailLayout";

const ReportDetails = () => {
  const { reportId } = useParams();
  const [viewData, setViewData] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .post(
        `${BaseUrl}reports/view`,
        { reportId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => setViewData(response.data.data || {}))
      .catch((error) => console.error(error));
  }, [reportId, token]);

  return (
    <div className="detail-page">
      <DetailPageHeader
        title="Report Details"
        subtitle={viewData?.ticketId ? `Ticket #${viewData.ticketId}` : "Issue report breakdown"}
        status={viewData?.status}
      />

      <div className="row g-3">
        <div className="col-12 col-lg-5">
          <DetailMediaCard
            singleImage={viewData?.issueImage}
            title={viewData?.issueType}
            fallbackText={viewData?.issueType || "R"}
          />
        </div>

        <div className="col-12 col-lg-7">
          <DetailSectionCard title="Report Info" icon={<LuFileWarning />}>
            <DetailGrid columns={2}>
              <DetailField label="Ticket ID" value={viewData?.ticketId} />
              <DetailField label="Issue Type" value={viewData?.issueType} />
              <DetailField label="Date" value={formatDateValue(viewData?.createdAt)} />
              <DetailField label="Status" value={viewData?.status} badge />
              <DetailField label="Description" value={viewData?.description} fullWidth />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12 col-md-6">
          <DetailSectionCard title="Customer Info" icon={<LuUser />}>
            <DetailGrid columns={1}>
              <DetailField label="Customer Name" value={viewData?.customer?.name} />
              <DetailField label="Email" value={viewData?.customer?.email} />
              <DetailField label="Phone" value={viewData?.customer?.contactNumber} />
            </DetailGrid>
          </DetailSectionCard>
        </div>

        <div className="col-12 col-md-6">
          <DetailSectionCard title="Guesthouse Info" icon={<LuBuilding2 />}>
            <DetailGrid columns={1}>
              <DetailField label="Guesthouse Name" value={viewData?.guesthouse?.name} />
              <DetailField label="Phone" value={viewData?.guesthouse?.contactNumber} />
              <DetailField label="Address" value={viewData?.guesthouse?.address} />
            </DetailGrid>
          </DetailSectionCard>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
