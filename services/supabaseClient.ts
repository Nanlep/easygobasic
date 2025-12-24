
import { createClient } from '@supabase/supabase-js';

// Credentials provided for local testing
const supabaseUrl = process.env.SUPABASE_URL || 'https://ypjqyifatilmupapiiek.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwanF5aWZhdGlsbXVwYXBpaWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDk0OTUsImV4cCI6MjA4MTkyNTQ5NX0.mGF3l5hXS26HEe-fV5OadVd97ShMPAnud8D__ZAaU2k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
