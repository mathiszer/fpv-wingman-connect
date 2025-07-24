import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  Filter,
  Calendar,
  Settings,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObserverDashboardProps {
  onBack: () => void;
}

const ObserverDashboard = ({ onBack }: ObserverDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    date: "",
    distance: "10",
    type: "all"
  });
  const { toast } = useToast();

  const requestToJoin = (eventId: number, eventTitle: string) => {
    toast({
      title: "Demande envoyée !",
      description: `Votre demande pour "${eventTitle}" a été transmise au télépilote.`,
    });
  };

  // Mock data pour les événements disponibles
  const availableEvents = [
    {
      id: 1,
      title: "Vol de reconnaissance - Carrière de Fontainebleau",
      pilot: "Marc Dubois",
      pilotRating: 4.8,
      date: "2024-01-15",
      time: "14:00",
      location: "Carrière de Fontainebleau",
      distance: "12 km",
      description: "Vol de reconnaissance pour inspection de terrain. Niveau débutant acceptable.",
      observersNeeded: 2,
      observersConfirmed: 0,
      type: "Reconnaissance",
      requirements: "Aucune exigence particulière",
      isUrgent: false
    },
    {
      id: 2,
      title: "Session freestyle urbain",
      pilot: "Sarah Martin",
      pilotRating: 4.9,
      date: "2024-01-18",
      time: "16:30",
      location: "Parc de Sceaux",
      distance: "8 km",
      description: "Session freestyle avec figures acrobatiques. Expérience recommandée.",
      observersNeeded: 2,
      observersConfirmed: 1,
      type: "Freestyle",
      requirements: "Expérience en observation FPV souhaitée",
      isUrgent: false
    },
    {
      id: 3,
      title: "🚨 Vol d'urgence - Besoin observateur maintenant !",
      pilot: "Thomas Leroy",
      pilotRating: 4.7,
      date: "Aujourd'hui",
      time: "Maintenant",
      location: "Bois de Vincennes",
      distance: "5 km",
      description: "Besoin urgent d'un observateur pour vol de test. Sur place dans 15 minutes.",
      observersNeeded: 1,
      observersConfirmed: 0,
      type: "Urgence",
      requirements: "Disponible immédiatement",
      isUrgent: true
    }
  ];

  const filteredEvents = availableEvents.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.pilot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Dashboard Observateur
            </h1>
            <p className="text-primary-foreground/80">
              Trouvez des vols à observer près de vous
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack}>
              <Settings className="h-4 w-4 mr-2" />
              Profil
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Recherche et filtres */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par lieu, télépilote ou type de vol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedFilters.date}
                  onChange={(e) => setSelectedFilters({...selectedFilters, date: e.target.value})}
                  className="w-auto"
                />
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">12</div>
              <div className="text-sm text-muted-foreground">Vols observés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-success">4.9</div>
              <div className="text-sm text-muted-foreground">Note moyenne</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-warning">{filteredEvents.length}</div>
              <div className="text-sm text-muted-foreground">Vols disponibles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emergency">1</div>
              <div className="text-sm text-muted-foreground">Vol urgent</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des événements */}
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className={`hover:shadow-drone transition-all duration-300 ${
                event.isUrgent ? 'border-emergency shadow-emergency' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      {event.isUrgent && (
                        <Badge variant="destructive" className="bg-emergency animate-emergency-glow">
                          URGENT
                        </Badge>
                      )}
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <span>Télépilote:</span>
                      <span className="font-medium text-foreground">{event.pilot}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="text-sm">{event.pilotRating}</span>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">{event.description}</p>
                    
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{event.date} à {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.observersConfirmed}/{event.observersNeeded} observateurs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-success" />
                        <span className="text-success">À {event.distance}</span>
                      </div>
                    </div>
                    
                    {event.requirements && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium">Exigences: </span>
                        <span className="text-sm text-muted-foreground">{event.requirements}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-6 flex flex-col gap-2">
                    <Button 
                      variant={event.isUrgent ? "emergency" : "default"}
                      onClick={() => requestToJoin(event.id, event.title)}
                      className="min-w-[140px]"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {event.isUrgent ? "Répondre SOS" : "Observer ce vol"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Voir sur carte
                    </Button>
                    <Button variant="ghost" size="sm">
                      Contacter pilote
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun vol trouvé</h3>
              <p className="text-muted-foreground">
                Essayez d'ajuster vos critères de recherche ou revenez plus tard.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ObserverDashboard;