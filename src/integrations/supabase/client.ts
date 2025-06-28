
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ostnuphowzvtdebdbnwo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zdG51cGhvd3p2dGRlYmRibndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTY5NTQsImV4cCI6MjA2NjM3Mjk1NH0.V6k7MG0bvSP8BkrrVBpCqHtAnt7oDYDDXIaHaEAYme0'

export const supabase = createClient(supabaseUrl, supabaseKey)
