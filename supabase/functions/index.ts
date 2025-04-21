import { Database } from '@/supabase/types';
import { createClient } from 'jsr:@supabase/supabase-js@2';

type Notification = Database['public']['Tables']['notifications']['Row'];

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: Notification;
  schema: 'public';
  old_record: null | Notification;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,∑
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();

    // Fetch the user's push token
    const { data, error } = await supabase
      .from('users')
      .select('push_token')
      .eq('id', payload.record.user_id)
      .single();

    if (error) {
      throw error;
    }

    if (!data?.push_token) {
      return new Response(
        JSON.stringify({ error: 'User has no push token registered' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Send push notification via Expo
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify({
        to: data.push_token,
        title: payload.record.title,
        subtitle: payload.record.subtitle,
        body: payload.record.body,
        sound: payload.record.sound || 'default',
        badge: payload.record.badge,
        data: payload.record.data || {},
      }),
    }).then((res) => res.json());

    return new Response(JSON.stringify(res), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
