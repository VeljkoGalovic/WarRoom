import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GoalsClient } from "./GoalsClient";

export default function GoalsPage() {
  return (
    <DashboardLayout>
      <GoalsClient />
    </DashboardLayout>
  );
}