import RobotMovingLoader from "@/components/RobotMovingLoader";

export default function DashboardLoading() {
  return (
    <RobotMovingLoader
      label="Loading Dashboard..."
      subtext="Fetching live telemetry, active missions, and fleet data..."
    />
  );
}
