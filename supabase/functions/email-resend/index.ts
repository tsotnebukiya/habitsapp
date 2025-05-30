import { Resend } from 'https://esm.sh/resend@3.2.0';
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

interface FeedbackRequest {
  message: string;
  deviceInfo?: {
    platform: string;
    version: string | number;
    device: string;
  };
  appVersion?: string;
  userId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Parse request body
    const { message, deviceInfo, appVersion, userId }: FeedbackRequest =
      await req.json();

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Extract user info from JWT token
    const token = authHeader.replace('Bearer ', '');
    let user: { id: string; email?: string } | null = null;

    try {
      // Decode JWT payload (basic validation - in production you'd want proper verification)
      const payload = JSON.parse(atob(token.split('.')[1]));
      user = {
        id: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      throw new Error('Invalid token format');
    }

    if (!user || !user.id) {
      throw new Error('Invalid authentication');
    }

    // Use userId from request body if available, otherwise fall back to JWT
    const finalUserId = userId || user.id;

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const resend = new Resend(resendApiKey);

    const emailPayload = {
      from: 'feedback@viraldevelopmentllc.com', // Fixed: proper email format
      to: 'tsotnebukiya@viraldevelopmentllc.com', // Fixed: removed trailing slash
      subject: `App Feedback from ${user.email || 'Anonymous User'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New App Feedback
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
            <h3 style="margin: 0 0 15px 0; color: #555;">Message:</h3>
            <p style="margin: 0; line-height: 1.6; font-size: 16px; white-space: pre-wrap;">${message.trim()}</p>
          </div>
          
          <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; font-size: 14px; color: #666;">
            <h4 style="margin: 0 0 15px 0; color: #333;">User Details:</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Email:</td>
                <td style="padding: 5px 0;">${user.email || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">User ID:</td>
                <td style="padding: 5px 0; font-family: monospace; font-size: 12px;">${finalUserId}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">App Version:</td>
                <td style="padding: 5px 0;">${appVersion || 'Unknown'}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Platform:</td>
                <td style="padding: 5px 0;">${
                  deviceInfo?.platform || 'Unknown'
                }</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Device:</td>
                <td style="padding: 5px 0;">${
                  deviceInfo?.device || 'Unknown'
                }</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">OS Version:</td>
                <td style="padding: 5px 0;">${
                  deviceInfo?.version || 'Unknown'
                }</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; font-weight: bold;">Submitted:</td>
                <td style="padding: 5px 0;">${new Date().toLocaleString(
                  'en-US',
                  {
                    timeZone: 'UTC',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZoneName: 'short',
                  }
                )}</td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; font-size: 12px; color: #1565c0;">
            <strong>Note:</strong> This feedback was sent automatically from your mobile app.
          </div>
        </div>
      `,
    };

    const { data: emailResult, error: emailError } = await resend.emails.send(
      emailPayload
    );

    if (emailError) {
      console.error('Resend API error:', emailError);
      throw new Error(
        `Failed to send email: ${emailError.message || 'Unknown error'}`
      );
    }

    console.log('Email sent successfully:', emailResult?.id);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResult?.id,
        message: 'Feedback sent successfully',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: unknown) {
    console.error('Feedback submission error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return new Response(
      JSON.stringify({
        error: errorMessage,
        success: false,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
