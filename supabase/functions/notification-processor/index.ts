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
  console.log('----------------------------------------');
  console.log('Starting notification processor');
  console.log('----------------------------------------');

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // 1. Fetch all unprocessed notifications
    console.log('\n1. Fetching unprocessed notifications...');
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*, users!inner(push_token)')
      .eq('processed', false)
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (fetchError) throw fetchError;
    if (!notifications?.length) {
      console.log('→ No notifications to process');
      return new Response('No notifications to process', { status: 200 });
    }

    console.log(`✓ Found ${notifications.length} unprocessed notifications`);

    // 2. Process in batches
    console.log(`\n2. Processing notifications in batches of ${BATCH_SIZE}...`);
    const batches = [];
    for (let i = 0; i < notifications.length; i += BATCH_SIZE) {
      batches.push(notifications.slice(i, i + BATCH_SIZE));
    }
    console.log(`✓ Created ${batches.length} batch(es)`);

    // 3. Track all results
    const allUpdates: NotificationUpdate[] = [];
    const invalidTokens = new Set<string>();
    let processedCount = 0;
    let failedCount = 0;

    // 4. Process each batch - ONLY SEND NOTIFICATIONS
    console.log('\n3. Processing batches...');
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\nProcessing batch ${i + 1}/${batches.length}...`);

      const messages = batch.map((notification: any) => ({
        to: notification.users.push_token!,
        title: notification.title,
        body: notification.body,
        sound: 'default',
        channelId: 'default',
      }));

      // Send to Expo
      console.log(`Sending ${messages.length} messages to Expo...`);
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
        },
        body: JSON.stringify(messages),
      });

      if (!response.ok) {
        console.error(
          '❌ Expo push failed:',
          response.status,
          response.statusText
        );
        throw new Error(
          `Expo push failed: ${response.status} ${response.statusText}`
        );
      }

      const { data: tickets } = (await response.json()) as {
        data: ExpoPushTicket[];
      };
      console.log('✓ Received response from Expo');

      // Track results without updating DB yet
      for (let j = 0; j < batch.length; j++) {
        const notification = batch[j];
        const ticket = tickets[j];

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
            console.log(
              `→ Invalid token found for user: ${notification.user_id}`
            );
          }
          update.error = ticket.message;
          failedCount++;
          console.log(`❌ Failed notification: ${ticket.message}`);
        }

        allUpdates.push(update);
      }
      console.log(
        `✓ Batch ${
          i + 1
        } complete: ${processedCount} sent, ${failedCount} failed`
      );
    }

    // 5. Bulk update all notifications at once
    if (allUpdates.length > 0) {
      console.log('\n4. Updating notification statuses...');
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ processed: true })
        .in(
          'id',
          allUpdates.map((u) => u.id)
        );

      if (updateError) {
        console.error('❌ Error updating notifications:', updateError);
        throw updateError;
      }
      console.log('✓ Successfully updated notification statuses');
    }

    // 6. Clear invalid tokens in one operation
    if (invalidTokens.size > 0) {
      console.log('\n5. Clearing invalid tokens...');
      const { error: tokenError } = await supabase
        .from('users')
        .update({ push_token: null })
        .in('id', Array.from(invalidTokens));

      if (tokenError) {
        console.error('❌ Error clearing invalid tokens:', tokenError);
        throw tokenError;
      }
      console.log(`✓ Cleared ${invalidTokens.size} invalid tokens`);
    }

    // Log summary
    console.log('\n----------------------------------------');
    console.log('Execution Summary:');
    console.log('----------------------------------------');
    console.log(`Total notifications: ${notifications.length}`);
    console.log(`Successfully processed: ${processedCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Invalid tokens found: ${invalidTokens.size}`);
    console.log(`Execution time: ${new Date().toISOString()}`);
    console.log('----------------------------------------');

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
    console.error('\n❌ Processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
