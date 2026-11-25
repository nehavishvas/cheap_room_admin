import React, { useState } from "react";
import {
  LuEye,
  LuPencil,
  LuTrash2,
  LuBedDouble,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";

export const TableThumb = ({ src, alt = "", fallback = "?", rounded = false }) => {
  const [failed, setFailed] = useState(false);
  const letter = (fallback || alt || "?").toString().charAt(0).toUpperCase();

  if (!src || failed) {
    return (
      <div
        className={`table-thumb-fallback ${rounded ? "is-round" : ""}`}
        title={alt}
      >
        {letter}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`table-thumb-img ${rounded ? "is-round" : ""}`}
      onError={() => setFailed(true)}
    />
  );
};

export const StatusBadge = ({ status }) => {
  const raw = (status ?? "NA").toString().trim();
  const key = raw.toLowerCase();

  let tone = "neutral";
  if (
    [
      "active",
      "confirmed",
      "completed",
      "paid",
      "success",
      "approved",
      "resolved",
      "verified",
    ].includes(key)
  ) {
    tone = "success";
  } else if (["pending", "processing", "upcoming", "open", "in_progress"].includes(key)) {
    tone = "warning";
  } else if (
    ["cancelled", "canceled", "inactive", "failed", "rejected", "declined"].includes(key)
  ) {
    tone = "danger";
  }

  return <span className={`status-pill status-pill-${tone}`}>{raw}</span>;
};

export const ActionGroup = ({ children }) => (
  <div className="table-action-group">{children}</div>
);

export const ViewActionBtn = ({ onClick, title = "View Details" }) => (
  <button
    type="button"
    className="table-action-btn table-action-view"
    onClick={onClick}
    title={title}
    aria-label={title}
  >
    <LuEye />
  </button>
);

export const EditActionBtn = ({ onClick, title = "Edit" }) => (
  <button
    type="button"
    className="table-action-btn table-action-edit"
    onClick={onClick}
    title={title}
    aria-label={title}
  >
    <LuPencil />
  </button>
);

export const DeleteActionBtn = ({ onClick, title = "Delete" }) => (
  <button
    type="button"
    className="table-action-btn table-action-delete"
    onClick={onClick}
    title={title}
    aria-label={title}
  >
    <LuTrash2 />
  </button>
);

export const RoomsActionBtn = ({ onClick, title = "View Rooms", label = "Rooms" }) => (
  <button
    type="button"
    className="table-rooms-pill"
    onClick={onClick}
    title={title}
  >
    <LuBedDouble />
    <span>{label}</span>
  </button>
);

export const TablePagination = ({ currentPage, totalPages, onPageChange }) => {
  const safeTotal = Math.max(1, totalPages || 1);
  return (
    <div className="table-pagination-bar">
      <button
        type="button"
        disabled={currentPage <= 1}
        className="table-page-btn"
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <LuChevronLeft />
      </button>
      <span className="table-page-label">
        Page <strong>{currentPage}</strong> of <strong>{safeTotal}</strong>
      </span>
      <button
        type="button"
        disabled={currentPage >= safeTotal}
        className="table-page-btn"
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <LuChevronRight />
      </button>
    </div>
  );
};
