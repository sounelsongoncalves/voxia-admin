
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Create a Supabase client with the SERVICE ROLE KEY to manage users
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Get the user ID from the request body
        const { userId } = await req.json();

        if (!userId) {
            throw new Error('User ID is required');
        }

        // Check if the requester is an admin (Owner)
        // We can verify the JWT from the Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: requestUser }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !requestUser) {
            throw new Error('Unauthorized');
        }

        // Verify if the requester is an owner in the public.admins table
        const { data: adminData, error: adminError } = await supabaseAdmin
            .from('admins')
            .select('role')
            .eq('id', requestUser.id)
            .single();

        if (adminError || !adminData || adminData.role !== 'owner') {
            throw new Error('Permission denied. Only owners can delete users.');
        }

        // Delete the user from Supabase Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (deleteError) {
            throw deleteError;
        }

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
