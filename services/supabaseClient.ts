import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pvidkmcedyylptjjbwpz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2aWRrbWNlZHl5bHB0ampid3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4OTQ3MzcsImV4cCI6MjA3OTQ3MDczN30._KjAwcFAC26CfkbzLgjVX7BnhouJ1RkJwluVtbfmWk4';

export const supabase = createClient(supabaseUrl, supabaseKey);