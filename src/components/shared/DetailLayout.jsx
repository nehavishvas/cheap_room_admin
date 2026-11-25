import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import { LuArrowLeft } from "react-icons/lu";
import { StatusBadge } from "./TableComponents";

export const formatDateValue = (val) => {
  if (!val) return "NA";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "NA";
  return d.toLocaleDateString();
};

export const DetailPageHeader = ({ title, subtitle, status, onBack }) => {
  const navigate = useNavigate();
  return (
    <div className="detail-header-bar">
      <div className="detail-header-left">
        <button
          type="button"
          className="detail-back-btn"
          onClick={onBack || (() => navigate(-1))}
        >
          <LuArrowLeft />
          <span>Back</span>
        </button>
        <div>
          <h4 className="detail-page-title">{title}</h4>
          {subtitle && <p className="detail-page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {status && <StatusBadge status={status} />}
    </div>
  );
};

export const DetailMediaCard = ({
  images = [],
  singleImage,
  title = "",
  subtitle = "",
  fallbackText = "C",
  isAvatar = false,
}) => {
  const [imgErr, setImgErr] = useState(false);
  const validImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const letter = (fallbackText || title || "C").toString().charAt(0).toUpperCase();

  if (isAvatar) {
    return (
      <div className="detail-profile-banner">
        <div className="detail-profile-avatar-wrap">
          {singleImage && !imgErr ? (
            <img
              src={singleImage}
              alt={title}
              className="detail-profile-avatar"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="detail-profile-avatar-fallback">{letter}</div>
          )}
        </div>
        <div className="detail-profile-meta">
          <h5 className="detail-profile-name">{title || "NA"}</h5>
          {subtitle && <p className="detail-profile-sub">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="detail-media-card">
      {validImages.length > 0 ? (
        validImages.length > 1 ? (
          <Slider dots infinite speed={450} slidesToShow={1} slidesToScroll={1} arrows>
            {validImages.map((img, idx) => (
              <div key={idx}>
                <img src={img} alt={`${title} ${idx + 1}`} className="detail-media-img" />
              </div>
            ))}
          </Slider>
        ) : (
          <img src={validImages[0]} alt={title} className="detail-media-img" />
        )
      ) : singleImage && !imgErr ? (
        <img
          src={singleImage}
          alt={title}
          className="detail-media-img"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div className="detail-media-fallback">{letter}</div>
      )}
    </div>
  );
};

export const DetailSectionCard = ({ title, icon, children }) => (
  <div className="detail-section-card">
    <div className="detail-section-head">
      {icon && <span className="detail-section-icon">{icon}</span>}
      <h5 className="detail-section-title">{title}</h5>
    </div>
    <div className="detail-section-body">{children}</div>
  </div>
);

export const DetailGrid = ({ columns = 2, children }) => (
  <div className={`detail-fields-grid cols-${columns}`}>{children}</div>
);

export const DetailField = ({ label, value, fullWidth = false, badge = false }) => {
  const display = value !== undefined && value !== null && value !== "" ? value : "NA";
  return (
    <div className={`detail-field ${fullWidth ? "is-full" : ""}`}>
      <span className="detail-field-label">{label}</span>
      {badge && display !== "NA" ? (
        <div>
          <StatusBadge status={display} />
        </div>
      ) : (
        <div className="detail-field-value">{display}</div>
      )}
    </div>
  );
};

export const DetailChips = ({ label, items = [], emptyText = "None" }) => (
  <div className="detail-field is-full">
    <span className="detail-field-label">{label}</span>
    {Array.isArray(items) && items.length > 0 ? (
      <div className="detail-chips-wrap">
        {items.map((item, idx) => (
          <span key={idx} className="detail-chip">
            {typeof item === "object" ? item.name || item.label : item}
          </span>
        ))}
      </div>
    ) : (
      <div className="detail-field-value">{emptyText}</div>
    )}
  </div>
);
