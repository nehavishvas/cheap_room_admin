import React from "react";
import "./Login.css";
import logoSm from "../Assests/favicon.png";
import { LuCalendarCheck, LuBuilding2, LuBarChart2 } from "react-icons/lu";

const AuthShell = ({ title, subtitle, stepBadge, children }) => {
  return (
    <div className="auth-page-bg">
      <div className="auth-split-card">
        {/* Left Brand Panel */}
        <div className="auth-brand-panel">
          <div className="auth-brand-glow" />
          <div className="auth-brand-top">
            <div className="auth-brand-row">
              <div className="auth-brand-icon">
                <img src={logoSm} alt="Cheap Rooms" />
              </div>
              <div className="auth-brand-title">
                <div className="auth-brand-name">
                  Cheap<span>Rooms</span>
                </div>
                <div className="auth-brand-sub">Admin Portal</div>
              </div>
            </div>
          </div>

          <div className="auth-brand-body">
            <span className="auth-brand-pill">Maldives Hospitality Suite</span>
            <h1 className="auth-brand-headline">
              Manage guesthouses, bookings &amp; revenue in one place.
            </h1>
            <p className="auth-brand-desc">
              Streamlined operations center for island properties, room inventory, payouts, and guest experiences.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">
                  <LuCalendarCheck />
                </span>
                <span>Real-time booking &amp; check-in tracking</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">
                  <LuBuilding2 />
                </span>
                <span>Guesthouse, atoll &amp; room management</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">
                  <LuBarChart2 />
                </span>
                <span>Transparent payouts &amp; commission reports</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            © {new Date().getFullYear()} Cheap Rooms MV. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          {/* Compact Mobile Brand Header */}
          <div className="auth-mobile-brand">
            <div className="auth-mobile-icon">
              <img src={logoSm} alt="Cheap Rooms" />
            </div>
            <div>
              <div className="auth-mobile-name">
                Cheap<span>Rooms</span>
              </div>
              <div className="auth-mobile-sub">Admin Portal</div>
            </div>
          </div>

          <div className="auth-form-inner">
            {stepBadge && <span className="auth-step-badge">{stepBadge}</span>}
            <div className="auth-heading">
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
