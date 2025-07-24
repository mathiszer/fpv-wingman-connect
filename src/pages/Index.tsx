import { useAuth } from '@/hooks/useAuth';
import Auth from '@/components/Auth';
import PilotDashboard from '@/components/PilotDashboard';
import ObserverDashboard from '@/components/ObserverDashboard';

const Index = () => {
  const { user, profile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth onSuccess={() => window.location.reload()} />;
  }

  if (profile.role === 'pilot') {
    return <PilotDashboard onBack={handleSignOut} />;
  }

  if (profile.role === 'observer') {
    return <ObserverDashboard onBack={handleSignOut} />;
  }

  // If role is 'both', could show a selector or default to pilot
  return <PilotDashboard onBack={handleSignOut} />;
};

export default Index;
