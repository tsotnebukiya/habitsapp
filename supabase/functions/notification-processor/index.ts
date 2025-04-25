// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const BATCH_SIZE = 599; // Maximum safe batch size for Expo
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'MessageTooBig' | 'MessageRateExceeded';
  };
}

interface NotificationUpdate {
  id: string;
  processed: boolean;
  processed_at: string;
  sent_at?: string;
  error?: string;
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. Fetch all unprocessed notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*, users!inner(push_token)')
      .eq('processed', false)
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (fetchError) throw fetchError;
    if (!notifications?.length) {
      return new Response('No notifications to process', { status: 200 });
    }

    // 2. Process in batches
    const batches = [];
    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      batches.push(notifications.slice(i, i + BATCH_SIZE));
    }

    // 3. Track all results
    const allUpdates: NotificationUpdate[] = [];
    const invalidTokens = new Set<string>();
    let processedCount = 0;
    let failedCount = 0;

    // 4. Process each batch - ONLY SEND NOTIFICATIONS
    for (const batch of batches) {
      const messages = batch.map((notification: any) => ({
        to: notification.users.push_token!,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: 'default',
        badge: notification.badge || undefined,
        channelId: 'default',
      }));

      // Send to Expo
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        throw new Error(
          `Expo push failed: ${response.status} ${response.statusText}`
        );
      }

      const { data: tickets } = (await response.json()) as {
        data: ExpoPushTicket[];
      };

      // Track results without updating DB yet
      for (let i = 0; i < batch.length; i++) {
        const notification = batch[i];
        const ticket = tickets[i];

        const update: NotificationUpdate = {
          id: notification.id,
          processed: true,
          processed_at: new Date().toISOString(),
        };

        if (ticket.status === 'ok') {
          update.sent_at = new Date().toISOString();
          processedCount++;
        } else {
          if (ticket.details?.error === 'DeviceNotRegistered') {
            invalidTokens.add(notification.user_id);
          }
          update.error = ticket.message;
          failedCount++;
        }

        allUpdates.push(update);
      }
    }

    // 5. Bulk update all notifications at once
    if (allUpdates.length > 0) {
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ processed: true })
        .in(
          'id',
          allUpdates.map((u) => u.id)
        );

      if (updateError) throw updateError;
    }

    // 6. Clear invalid tokens in one operation
    if (invalidTokens.size > 0) {
      const { error: tokenError } = await supabase
        .from('users')
        .update({ push_token: null })
        .in('id', Array.from(invalidTokens));

      if (tokenError) throw tokenError;
    }

    return new Response(
      JSON.stringify({
        total: notifications.length,
        processed: processedCount,
        failed: failedCount,
        invalid_tokens: Array.from(invalidTokens),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
