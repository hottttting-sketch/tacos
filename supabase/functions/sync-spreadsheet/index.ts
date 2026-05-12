// supabase/functions/sync-spreadsheet/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { project_id, station_network, slots } = await req.json()

    console.log(`Syncing spreadsheet for project: ${project_id}, station: ${station_network}`)

    // 1. Delete existing slots for this project/station to refresh
    const { error: deleteError } = await supabaseClient
      .from('pudding.slots')
      .delete()
      .eq('project_id', project_id)
      .eq('station_network', station_network)

    if (deleteError) throw deleteError

    // 2. Insert new slots
    if (slots && slots.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('pudding.slots')
        .insert(slots.map((s: any) => ({
          project_id,
          station_network,
          broadcast_date: s.date,
          time_start: s.time_start,
          time_end: s.time_end,
          pub_type: s.pub_type,
          remarks: s.remarks
        })))

      if (insertError) throw insertError
    }

    return new Response(JSON.stringify({ success: true, message: 'Sync complete' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
