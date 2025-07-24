import { useState, useEffect } from "react";
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
  Eye,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Map from "@/components/Map";

interface ObserverDashboardProps {
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
  pilot_id: string;
  profiles?: {
    display_name: string;
    rating: number;
  };
}

interface SOSAlert {
  id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  message: string;
  radius_km: number;
  created_at: string;
  profiles?: {
    display_name: string;
  };
}

const ObserverDashboard = ({ onBack }: ObserverDashboardProps) => {
  const { user, profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<FlightEvent[]>([]);
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchSOSAlerts();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('flight_events')
        .select(`
          *,
          profiles:pilot_id (
            display_name,
            rating
          )
        `)
        .eq('status', 'open')
        .gte('flight_date', new Date().toISOString().split('T')[0])
        .order('flight_date', { ascending: true });

      if (error) throw error;
      setEvents((data as any) || []);
    } catch (error: any) {
      toast.error('Erreur lors du chargement des événements');
    }
  };

  const fetchSOSAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('sos_alerts')
        .select(`
          *,
          profiles:pilot_id (
            display_name
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSOSAlerts((data as any) || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des alertes SOS:', error);
    }
  };

  const requestToJoin = async (eventId: string, eventTitle: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('observer_requests')
        .insert({
          event_id: eventId,
          observer_id: user.id,
          message: "Je souhaite participer en tant qu'observateur"
        });

      if (error) throw error;

      toast.success(`Demande envoyée pour "${eventTitle}" !`);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        toast.error('Vous avez déjà envoyé une demande pour cet événement');
      } else {
        toast.error('Erreur lors de l\'envoi de la demande');
      }
    }
  };

  const respondToSOS = async (alertId: string) => {
    if (!user) return;

    try {
      // Here you could implement logic to contact the pilot
      toast.success("Réponse SOS envoyée ! Le pilote sera notifié de votre disponibilité.");
    } catch (error: any) {
      toast.error('Erreur lors de la réponse SOS');
    }
  };

  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.profiles?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mapEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    latitude: event.latitude,
    longitude: event.longitude,
    location_name: event.location_name,
    pilot_name: event.profiles?.display_name,
    flight_date: event.flight_date,
    start_time: event.start_time
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary-foreground">
              Dashboard Observateur
            </h1>
            <p className="text-primary-foreground/80">
              Bienvenue {profile?.display_name || 'Observateur'}
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
        {/* SOS Alerts */}
        {sosAlerts.length > 0 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                🚨 Alertes SOS Urgentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sosAlerts.map((alert) => (
                  <div key={alert.id} className="border border-destructive/20 rounded-lg p-4 bg-card">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-destructive">
                          {alert.profiles?.display_name} a besoin d'aide !
                        </p>
                        <p className="text-sm">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.location_name} • Rayon: {alert.radius_km}km • 
                          {new Date(alert.created_at).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => respondToSOS(alert.id)}>
                        Répondre
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, lieu ou pilote..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={showMap ? "default" : "outline"}
                  onClick={() => setShowMap(!showMap)}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Carte
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map View */}
        {showMap && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Événements sur la carte</CardTitle>
            </CardHeader>
            <CardContent>
              <Map
                events={mapEvents}
                selectedEvent={selectedEvent}
                onEventSelect={setSelectedEvent}
                height="400px"
              />
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-primary">{filteredEvents.length}</div>
              <p className="text-sm text-muted-foreground">Vols disponibles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-secondary">
                {filteredEvents.filter(e => e.flight_date === new Date().toISOString().split('T')[0]).length}
              </div>
              <p className="text-sm text-muted-foreground">Vols aujourd'hui</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-accent">{sosAlerts.length}</div>
              <p className="text-sm text-muted-foreground">Alertes urgentes</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Vols disponibles pour observation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors ${
                      selectedEvent === event.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium">{event.profiles?.display_name || 'Pilote anonyme'}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{event.profiles?.rating?.toFixed(1) || '0.0'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{event.flight_type || 'Vol standard'}</Badge>
                        <Badge variant="secondary">{event.difficulty_level}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(event.flight_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{event.start_time} - {event.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location_name}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                    {event.special_requirements && (
                      <div className="bg-muted/50 rounded p-2 mb-3">
                        <p className="text-sm"><strong>Exigences:</strong> {event.special_requirements}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {event.required_observers} observateur(s) recherché(s)
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event.id);
                            setShowMap(true);
                          }}
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          Voir sur carte
                        </Button>
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            requestToJoin(event.id, event.title);
                          }}
                        >
                          Observer ce vol
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Aucun vol trouvé pour cette recherche' : 'Aucun vol disponible pour le moment'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ObserverDashboard;