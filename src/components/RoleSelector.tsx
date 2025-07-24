import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, Eye, Radio } from "lucide-react";

interface RoleSelectorProps {
  onRoleSelect: (role: 'pilot' | 'observer') => void;
}

const RoleSelector = ({ onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-background/10 p-4 rounded-full animate-drone-pulse">
              <Radio className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-primary-foreground mb-4">
            FPV Observer Connect
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            La plateforme qui connecte les télépilotes FPV avec leurs observateurs pour des vols sécurisés
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card className="bg-background/95 backdrop-blur-sm shadow-elevation hover:shadow-drone transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-sky p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Plane className="h-12 w-12 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Je suis Télépilote
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Créez des événements de vol, trouvez des observateurs qualifiés et coordonnez vos sessions FPV en toute sécurité.
              </p>
              <Button 
                variant="pilot" 
                size="lg" 
                className="w-full text-lg py-6"
                onClick={() => onRoleSelect('pilot')}
              >
                Accéder comme Télépilote
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background/95 backdrop-blur-sm shadow-elevation hover:shadow-drone transition-all duration-300 transform hover:-translate-y-2">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-primary p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Eye className="h-12 w-12 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Je suis Observateur
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Rejoignez des sessions de vol, aidez les télépilotes et découvrez l'univers passionnant du FPV.
              </p>
              <Button 
                variant="observer" 
                size="lg" 
                className="w-full text-lg py-6"
                onClick={() => onRoleSelect('observer')}
              >
                Accéder comme Observateur
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-primary-foreground/60 text-sm">
            Vous pouvez changer de rôle à tout moment dans votre profil
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;