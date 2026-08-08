import RobotMovingLoader from "@/components/RobotMovingLoader";

export default function Loading() {
  return (
    <RobotMovingLoader
      fullScreen={true}
      label="Loading DSR Go Platform..."
      subtext="Connecting to Silver Oak Autonomous Robot Fleet..."
    />
  );
}
