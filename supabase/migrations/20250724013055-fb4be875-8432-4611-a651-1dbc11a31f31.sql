-- Fix security warnings by adding search_path to functions
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.update_user_rating() SET search_path = '';