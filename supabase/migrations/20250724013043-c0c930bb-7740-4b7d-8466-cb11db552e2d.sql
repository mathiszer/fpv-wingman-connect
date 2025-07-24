-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('pilot', 'observer', 'both')),
  avatar_url TEXT,
  bio TEXT,
  experience_level TEXT,
  preferred_zones TEXT[],
  available BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flight_events table
CREATE TABLE public.flight_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  flight_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT NOT NULL,
  required_observers INTEGER DEFAULT 1,
  special_requirements TEXT,
  flight_type TEXT,
  difficulty_level TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create observer_requests table
CREATE TABLE public.observer_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.flight_events(id) ON DELETE CASCADE,
  observer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, observer_id)
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.flight_events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sos_alerts table
CREATE TABLE public.sos_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pilot_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_name TEXT,
  message TEXT,
  radius_km INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.flight_events(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, reviewer_id, reviewed_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flight_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for flight_events
CREATE POLICY "Flight events are viewable by everyone" 
ON public.flight_events FOR SELECT USING (true);

CREATE POLICY "Pilots can create flight events" 
ON public.flight_events FOR INSERT WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Pilots can update their own events" 
ON public.flight_events FOR UPDATE USING (auth.uid() = pilot_id);

CREATE POLICY "Pilots can delete their own events" 
ON public.flight_events FOR DELETE USING (auth.uid() = pilot_id);

-- Create policies for observer_requests
CREATE POLICY "Users can view requests for their events or their own requests" 
ON public.observer_requests FOR SELECT USING (
  auth.uid() = observer_id OR 
  auth.uid() = (SELECT pilot_id FROM public.flight_events WHERE id = event_id)
);

CREATE POLICY "Observers can create requests" 
ON public.observer_requests FOR INSERT WITH CHECK (auth.uid() = observer_id);

CREATE POLICY "Pilots can update requests for their events" 
ON public.observer_requests FOR UPDATE USING (
  auth.uid() = (SELECT pilot_id FROM public.flight_events WHERE id = event_id)
);

-- Create policies for messages
CREATE POLICY "Users can view messages for events they're involved in" 
ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR
  auth.uid() = (SELECT pilot_id FROM public.flight_events WHERE id = event_id) OR
  auth.uid() IN (
    SELECT observer_id FROM public.observer_requests 
    WHERE event_id = messages.event_id AND status = 'accepted'
  )
);

CREATE POLICY "Users can send messages to events they're involved in" 
ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND (
    auth.uid() = (SELECT pilot_id FROM public.flight_events WHERE id = event_id) OR
    auth.uid() IN (
      SELECT observer_id FROM public.observer_requests 
      WHERE event_id = messages.event_id AND status = 'accepted'
    )
  )
);

-- Create policies for sos_alerts
CREATE POLICY "SOS alerts are viewable by everyone" 
ON public.sos_alerts FOR SELECT USING (true);

CREATE POLICY "Pilots can create SOS alerts" 
ON public.sos_alerts FOR INSERT WITH CHECK (auth.uid() = pilot_id);

CREATE POLICY "Pilots can update their own SOS alerts" 
ON public.sos_alerts FOR UPDATE USING (auth.uid() = pilot_id);

-- Create policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for events they participated in" 
ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = reviewer_id AND (
    auth.uid() = (SELECT pilot_id FROM public.flight_events WHERE id = event_id) OR
    auth.uid() IN (
      SELECT observer_id FROM public.observer_requests 
      WHERE event_id = reviews.event_id AND status = 'accepted'
    )
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flight_events_updated_at
  BEFORE UPDATE ON public.flight_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_observer_requests_updated_at
  BEFORE UPDATE ON public.observer_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update user ratings
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2) 
      FROM public.reviews 
      WHERE reviewed_id = NEW.reviewed_id
    ),
    total_reviews = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE reviewed_id = NEW.reviewed_id
    )
  WHERE user_id = NEW.reviewed_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ratings when reviews are added
CREATE TRIGGER update_user_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();