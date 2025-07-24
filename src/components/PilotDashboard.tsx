import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  AlertTriangle, 
  Clock,
  Settings,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PilotDashboardProps {
  onBack: () => void;
}

const PilotDashboard = ({ onBack }: PilotDashboardProps) => {
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    observersNeeded: 1,
    requirements: ""
  });
  const { toast } = useToast();

  const handleCreateEvent = () => {
    toast({
      title: "Événement créé !",
      description: "Votre vol est publié et visible par les observateurs.",
    });
    setShowCreateEvent(false);
    setEventData({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      observersNeeded: 1,
      requirements: ""
    });
  };

  const activateSOSMode = () => {
    toast({
      title: "🚨 SOS Observateur activé !",
      description: "Notification envoyée aux observateurs proches.",
      variant: "default"
    });
  };

  // Mock data pour les événements
  const upcomingEvents = [
    {
      id: 1,
      title: "Vol de reconnaissance - Carrière de Fontainebleau",
      date: "2024-01-15",
      time: "14:00",
      location: "Carrière de Fontainebleau",
      observersConfirmed: 2,
      observersNeeded: 2,
      status: "confirmed"
    },
    {
      id: 2,
      title: "Session freestyle urbain",
      date: "2024-01-18",
      time: "16:30",
      location: "Parc de Sceaux",
      observersConfirmed: 1,
      observersNeeded: 2,
      status: "pending"
    }
  ];

  if (showCreateEvent) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Créer un événement de vol</h1>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
              Retour
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <Label htmlFor="title">Titre de l'événement</Label>
                <Input
                  id="title"
                  placeholder="Ex: Vol de reconnaissance, Session freestyle..."
                  value={eventData.title}
                  onChange={(e) => setEventData({...eventData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    type="time"
                    value={eventData.time}
                    onChange={(e) => setEventData({...eventData, time: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  placeholder="Nom du lieu ou adresse"
                  value={eventData.location}
                  onChange={(e) => setEventData({...eventData, location: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="description">Description du vol</Label>
                <Textarea
                  id="description"
                  placeholder="Type de vol, objectifs, niveau de difficulté..."
                  rows={4}
                  value={eventData.description}
                  onChange={(e) => setEventData({...eventData, description: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="observers">Nombre d'observateurs requis</Label>
                <Input
                  id="observers"
                  type="number"
                  min="1"
                  max="5"
                  value={eventData.observersNeeded}
                  onChange={(e) => setEventData({...eventData, observersNeeded: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Exigences particulières</Label>
                <Textarea
                  id="requirements"
                  placeholder="Ex: Majeur requis, connaissance des règles FPV..."
                  rows={3}
                  value={eventData.requirements}
                  onChange={(e) => setEventData({...eventData, requirements: e.target.value})}
                />
              </div>

              <Button onClick={handleCreateEvent} className="w-full" size="lg">
                Publier l'événement
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Dashboard Télépilote
            </h1>
            <p className="text-primary-foreground/80">
              Gérez vos vols et trouvez des observateurs
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="emergency" onClick={activateSOSMode}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              SOS Observateur
            </Button>
            <Button variant="outline" onClick={onBack}>
              <Settings className="h-4 w-4 mr-2" />
              Profil
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Actions rapides */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-drone transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Créer un vol</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Planifiez votre prochaine session
              </p>
              <Button onClick={() => setShowCreateEvent(true)} className="w-full">
                Nouveau vol
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-drone transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-success p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Mes observateurs</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Historique et favoris
              </p>
              <Button variant="success" className="w-full">
                Voir la liste
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-drone transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="bg-gradient-emergency p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-emergency-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Mode SOS</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Trouvez un observateur maintenant
              </p>
              <Button variant="emergency" onClick={activateSOSMode} className="w-full">
                Activer SOS
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Événements à venir */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vos prochains vols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                      {event.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                    </Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {event.date} à {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {event.observersConfirmed}/{event.observersNeeded} observateurs
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Voir détails
                    </Button>
                    <Button variant="outline" size="sm">
                      Messages
                    </Button>
                    {event.status !== 'confirmed' && (
                      <Button variant="success" size="sm">
                        Promouvoir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PilotDashboard;