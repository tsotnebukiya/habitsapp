import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import Database from '../../types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }
  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    // Create admin client with service role key and proper types
    const supabaseAdmin = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '');
    // Get user info from JWT using admin client
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(jwt);
    if (userError || !userData.user) {
      console.error('User authentication error:', userError);
      throw new Error('User not authenticated or invalid token');
    }
    const user = userData.user;
    console.log(`Starting deletion process for user: ${user.id}`);
    // Step 1: Check if user exists in public.users table
    const { data: publicUser, error: publicUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    if (publicUserError && publicUserError.code !== 'PGRST116') {
      console.error('Error checking public user:', publicUserError);
      throw new Error(`Error checking user data: ${publicUserError.message}`);
    }
    if (publicUser) {
      console.log(`Found user in public.users table: ${user.id}`);
      // Step 2: Delete user data from public schema (CASCADE will handle related tables)
      console.log('Deleting user from public.users table...');
      const { error: deletePublicError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id);
      if (deletePublicError) {
        console.error('Error deleting from public.users:', deletePublicError);
        throw new Error(
          `Failed to delete user data: ${deletePublicError.message}`
        );
      }
      console.log('Successfully deleted user from public.users table');
    } else {
      console.log(
        'User not found in public.users table, proceeding with auth deletion'
      );
    }
    // Step 3: Delete the user from auth.users
    console.log('Deleting user from auth.users...');
    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteAuthError) {
      console.error('Error deleting from auth.users:', deleteAuthError);
      throw new Error(`Failed to delete auth user: ${deleteAuthError.message}`);
    }
    console.log(`User deleted successfully from auth.users: ${user.id}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: 'User account deleted successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-user function:', error);
    // Log the full error details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An error occurred while deleting the user';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});
