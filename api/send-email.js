// api/send-email.js — RawCore Trading Email API
// Handles: waitlist confirmation + welcome emails via Resend
// Env var required: RESEND_API_KEY

export const config = { runtime: 'edge' };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = 'RawCore Trading <hello@rawcoretrading.com>';

// Template IDs from Resend
const TEMPLATES = {
  waitlist: '709d915a-13c0-4447-a1f1-06f60b7a6aa5',
  welcome:  '22cf098a-eb83-42e4-89d5-3029f44dcb6f',
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: corsHeaders,
    });
  }

  try {
    const { action, email, name } = await req.json();

    if (!email || !action) {
      return new Response(JSON.stringify({ error: 'Missing email or action' }), {
        status: 400, headers: corsHeaders,
      });
    }

    const templateId = TEMPLATES[action];
    if (!templateId) {
      return new Response(JSON.stringify({ error: 'Unknown action: ' + action }), {
        status: 400, headers: corsHeaders,
      });
    }

    const displayName = name || email.split('@')[0];

    const payload = {
      from: FROM,
      to: [email],
      template_id: templateId,
      data: {
        name: displayName,
        email: email,
      },
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ error: data.message || 'Send failed' }), {
        status: res.status, headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: corsHeaders,
    });

  } catch (err) {
    console.error('send-email error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
}
