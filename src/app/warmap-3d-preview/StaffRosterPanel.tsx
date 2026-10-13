"use client";

import * as React from "react";
import { useShallow } from "zustand/react/shallow";
import { useWarMapStore } from "./WarMap3DCanvas";
import styles from "./StaffRosterPanel.module.css";

interface StaffMember {
  id: string;
  role: string;
  name: string;
  subtitle: string;
  status: "ONLINE" | "DEEP FOCUS" | "STANDBY";
  currentTask: string;
  taskProgress: number;
  avatarInitial: string;
  roleColor: string;
}

const STAFF_ROSTER: StaffMember[] = [
  { id: "staff-1", role: "LOGISTICS", name: "KAEL", subtitle: "AI Logistics", status: "ONLINE", currentTask: "Supply chain optimization", taskProgress: 78, avatarInitial: "K", roleColor: "#2ECC71" },
  { id: "staff-2", role: "STRATEGY", name: "ZARA", subtitle: "AI Tactical", status: "DEEP FOCUS", currentTask: "Threat pattern recognition", taskProgress: 45, avatarInitial: "Z", roleColor: "#FFB347" },
  { id: "staff-3", role: "TRAINING", name: "REX", subtitle: "AI Training", status: "STANDBY", currentTask: "Combat readiness drills", taskProgress: 12, avatarInitial: "R", roleColor: "#4DD8E8" },
];

const statusConfig = {
  ONLINE: { label: "ONLINE", color: "#2ECC71", className: "statusOnline" },
  "DEEP FOCUS": { label: "DEEP FOCUS", color: "#FFB347", className: "statusDeepFocus" },
  STANDBY: { label: "STANDBY", color: "#4DD8E8", className: "statusStandby" },
} as const;

// Memoized staff card
const StaffCard = React.memo(function StaffCard({ staff, isHovered, onHover, isSelected }: {
  staff: StaffMember;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
  isSelected: boolean;
}) {
  const status = statusConfig[staff.status];

  const cardClass = isSelected
    ? styles.staffCardSelected
    : isHovered
    ? styles.staffCardHovered
    : styles.staffCard;

  return (
    <div
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cardClass}
    >
      <div className={styles.staffCardInner}>
        <div
          className={styles.avatar}
          style={{
            background: `linear-gradient(135deg, ${staff.roleColor}22, ${staff.roleColor}08)`,
            border: `1px solid ${staff.roleColor}44`,
            color: staff.roleColor,
          }}
        >{staff.avatarInitial}</div>
        <div className={styles.staffInfo}>
          <div className={styles.staffNameRow}>
            <div className={styles.staffName}>{staff.name}</div>
            <div className={styles.staffRole}>{staff.role}</div>
          </div>
          <div className={styles.staffSubtitle}>{staff.subtitle}</div>
          <div className={styles.statusRow}>
            <div className={`${styles.statusBadge} ${styles[status.className]}`}>{status.label}</div>
            <div className={styles.taskProgressBar}>
              <div
                className={styles.taskProgressFill}
                style={{
                  width: `${staff.taskProgress}%`,
                  background: `linear-gradient(90deg, ${staff.roleColor}, ${staff.roleColor}88)`,
                  boxShadow: `0 0 6px ${staff.roleColor}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized corner notches
const StaffCornerNotches = React.memo(function StaffCornerNotches() {
  return (
    <>
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchTopRight}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomLeft}`} />
      <div className={`${styles.cornerNotch} ${styles.cornerNotchBottomRight}`} />
    </>
  );
});

// Memoized header
const StaffHeader = React.memo(function StaffHeader() {
  return (
    <div className={styles.header}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div className={styles.headerIcon}>◆</div>
        <div className={styles.headerTitleBlock}>
          <div className={styles.headerTitle}>STAFF ROSTER</div>
          <div className={styles.headerSubtitle}>TACTICAL PERSONNEL</div>
        </div>
      </div>
      <div className={styles.headerCount}>3 ACTIVE</div>
    </div>
  );
});

export const StaffRosterPanel = React.memo(function StaffRosterPanel() {
  const selectedNodeId = useWarMapStore(useShallow((s) => s.selectedNodeId));
  const setSelectedNode = useWarMapStore(useShallow((s) => s.setSelectedNode));
  const setHoveredNode = useWarMapStore(useShallow((s) => s.setHoveredNode));
  const [hoveredStaff, setHoveredStaff] = React.useState<string | null>(null);

  return (
    <aside className={styles.aside}>
      <StaffCornerNotches />
      <StaffHeader />
      <div className={styles.list}>
        {STAFF_ROSTER.map((staff) => (
          <StaffCard
            key={staff.id}
            staff={staff}
            isHovered={hoveredStaff === staff.id}
            onHover={(hovered) => setHoveredStaff(hovered ? staff.id : null)}
            isSelected={selectedNodeId === staff.id}
          />
        ))}
      </div>
    </aside>
  );
});