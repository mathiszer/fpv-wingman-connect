import { useState } from "react";
import RoleSelector from "@/components/RoleSelector";
import PilotDashboard from "@/components/PilotDashboard";
import ObserverDashboard from "@/components/ObserverDashboard";

type UserRole = 'pilot' | 'observer' | null;

const Index = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);

  const handleRoleSelect = (role: 'pilot' | 'observer') => {
    setUserRole(role);
  };

  const handleBackToSelection = () => {
    setUserRole(null);
  };

  if (userRole === 'pilot') {
    return <PilotDashboard onBack={handleBackToSelection} />;
  }

  if (userRole === 'observer') {
    return <ObserverDashboard onBack={handleBackToSelection} />;
  }

  return <RoleSelector onRoleSelect={handleRoleSelect} />;
};

export default Index;
