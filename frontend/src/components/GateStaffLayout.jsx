import { useAuth } from "../context/AuthContext";
import StaffShell from "./StaffShell";

/** Wraps children in StaffShell when the signed-in user is staff (admin / technician). */
const GateStaffLayout = ({ children }) => {
  const { isStaff } = useAuth();
  if (isStaff) {
    return <StaffShell>{children}</StaffShell>;
  }
  return children;
};

export default GateStaffLayout;
