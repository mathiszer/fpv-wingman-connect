import { useState, useEffect } from "react";
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
  Star,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Map from "@/components/Map";

interface PilotDashboardProps {
  onBack: () => void;
}

interface FlightEvent {
  id: string;
  title: string;
  description: string;
  flight_date: string;
  start_time: string;
  end_time: string;
  latitude: number;
  longitude: number;
  location_name: string;
  required_observers: number;
  special_requirements: string;
  flight_type: string;
  difficulty_level: string;
  status: string;
  created_at: string;
}

const PilotDashboard = ({ onBack }: PilotDashboardProps) => {
  const { user, profile } = useAuth();
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [events, setEvents] = useState<FlightEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    flight_date: "",
    start_time: "",
    end_time: "",
    latitude: 0,
    longitude: 0,
    location_name: "",
    required_observers: 1,
    special_requirements: "",
    flight_type: "",
    difficulty_level: "Débutant"
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_events')
        .select('*')
        .eq('pilot_id', user?.id)
        .order('flight_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des événements');
    }
  };

  const handleCreateEvent = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('flight_events')
        .insert({
          pilot_id: user.id,
          title: eventData.title,
          description: eventData.description,
          flight_date: eventData.flight_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          location_name: eventData.location_name,
          required_observers: eventData.required_observers,
          special_requirements: eventData.special_requirements,
          flight_type: eventData.flight_type,
          difficulty_level: eventData.difficulty_level,
        });

      if (error) throw error;

      toast.success("Événement créé avec succès !");
      setShowCreateEvent(false);
      setEventData({
        title: "",
        description: "",
        flight_date: "",
        start_time: "",
        end_time: "",
        latitude: 0,
        longitude: 0,
        location_name: "",
        required_observers: 1,
        special_requirements: "",
        flight_type: "",
        difficulty_level: "Débutant"
      });
      fetchEvents();
    } catch (error: any) {
      toast.error('Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const activateSOSMode = async () => {
    if (!user) return;
    
    try {
      // Get user's current location
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        
        const { error } = await supabase
          .from('sos_alerts')
          .insert({
            pilot_id: user.id,
            latitude,
            longitude,
            message: "Besoin urgent d'un observateur !",
            radius_km: 10
          });

        if (error) throw error;

        toast.success("🚨 SOS Observateur activé ! Notification envoyée aux observateurs proches.");
      }, () => {
        toast.error("Impossible d'obtenir votre position. Veuillez activer la géolocalisation.");
      });
    } catch (error: any) {
      toast.error('Erreur lors de l\'activation du mode SOS');
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setEventData({
      ...eventData,
      latitude: lat,
      longitude: lng,
      location_name: address
    });
    toast.success("Position sélectionnée !");
  };

  if (showCreateEvent) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Créer un événement de vol</h1>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
              Retour
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label htmlFor="title">Titre de l'événement</Label>
                  <Input
                    id="title"
                    value={eventData.title}
                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                    placeholder="Vol de reconnaissance..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={eventData.flight_date}
                      onChange={(e) => setEventData({...eventData, flight_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Heure de début</Label>
                    <Input
                      id="time"
                      type="time"
                      value={eventData.start_time}
                      onChange={(e) => setEventData({...eventData, start_time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="end_time">Heure de fin</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={eventData.end_time}
                    onChange={(e) => setEventData({...eventData, end_time: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Lieu sélectionné</Label>
                  <Input
                    id="location"
                    value={eventData.location_name}
                    readOnly
                    placeholder="Cliquez sur la carte pour sélectionner"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventData.description}
                    onChange={(e) => setEventData({...eventData, description: e.target.value})}
                    placeholder="Décrivez votre vol..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="observers">Observateurs requis</Label>
                    <Input
                      id="observers"
                      type="number"
                      min="1"
                      max="5"
                      value={eventData.required_observers}
                      onChange={(e) => setEventData({...eventData, required_observers: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type de vol</Label>
                    <Input
                      id="type"
                      value={eventData.flight_type}
                      onChange={(e) => setEventData({...eventData, flight_type: e.target.value})}
                      placeholder="Freestyle, Racing..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Exigences particulières</Label>
                  <Textarea
                    id="requirements"
                    value={eventData.special_requirements}
                    onChange={(e) => setEventData({...eventData, special_requirements: e.target.value})}
                    placeholder="Expérience requise, équipement..."
                  />
                </div>

                <Button 
                  onClick={handleCreateEvent} 
                  className="w-full"
                  disabled={loading || !eventData.title || !eventData.location_name}
                >
                  {loading ? "Création..." : "Créer l'événement"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sélectionner la position de vol</CardTitle>
              </CardHeader>
              <CardContent>
                <Map
                  height="500px"
                  onLocationSelect={handleLocationSelect}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Dashboard Télépilote
            </h1>
            <p className="text-primary-foreground/80">
              Bienvenue {profile?.display_name || 'Pilote'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Button>
            <Button variant="outline" size="sm" onClick={onBack}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20"
                onClick={() => setShowCreateEvent(true)}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nouveau Vol</h3>
              <p className="text-sm text-muted-foreground">
                Créer un événement de vol
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-secondary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Mes Observateurs</h3>
              <p className="text-sm text-muted-foreground">
                Gérer les observateurs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-destructive/20"
                onClick={activateSOSMode}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive-foreground" />
              </div>
              <h3 className="font-semibold mb-2">SOS Observateur</h3>
              <p className="text-sm text-muted-foreground">
                Besoin urgent d'aide
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Mes vols programmés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/50">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant={event.status === 'open' ? 'default' : 'secondary'}>
                        {event.status === 'open' ? 'Ouvert' : 'Complet'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(event.flight_date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.start_time} - {event.end_time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.location_name}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {event.required_observers} observateur(s) requis
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Voir détails
                        </Button>
                        <Button variant="outline" size="sm">
                          Promouvoir
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun vol programmé</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowCreateEvent(true)}
                >
                  Créer votre premier vol
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PilotDashboard;