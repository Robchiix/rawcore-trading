// api/send-email.js — RawCore Trading Email API
// Handles: waitlist confirmation + welcome emails via Resend
// Env var required: RESEND_API_KEY

export const config = { runtime: 'edge' };

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = 'RawCore Trading <hello@rawcoretrading.com>';

const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
};

// Gmail iOS uses [data-ogsc] selector — must use class-based overrides with !important
// Inline styles alone are not enough for Gmail iOS dark mode
const DARK_CSS = [
      'body,.email-bg{background-color:#030405 !important;}',
      '[data-ogsc] .td-dark{background-color:#030405 !important;}',
      '[data-ogsc] .td-hero{background-color:#0a1a0f !important;}',
      '[data-ogsc] .td-card{background-color:#0a1a0f !important;}',
      '[data-ogsc] .text-bright{color:#eaf2ff !important;}',
      '[data-ogsc] .text-green{color:#00ff88 !important;}',
      '[data-ogsc] .text-main{color:#c8d4e0 !important;}',
      '[data-ogsc] .text-dim{color:#3a6644 !important;}',
      '@media (prefers-color-scheme:dark){',
      '.td-dark{background-color:#030405 !important;}',
      '.td-hero{background-color:#0a1a0f !important;}',
      '.td-card{background-color:#0a1a0f !important;}',
      '.text-bright{color:#eaf2ff !important;}',
      '.text-green{color:#00ff88 !important;}',
      '.text-main{color:#c8d4e0 !important;}',
      '.text-dim{color:#3a6644 !important;}',
      '}',
    ].join('');

function waitlistHtml(name) {
      const css = DARK_CSS;
      return '<!DOCTYPE html>'
        + '<html lang="en" xmlns="http://www.w3.org/1999/xhtml">'
        + '<head>'
        + '<meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<meta name="color-scheme" content="dark light">'
        + '<meta name="supported-color-schemes" content="dark light">'
        + '<title>You\'re on the waitlist — RawCore Trading</title>'
        + '<style>' + css + '</style>'
        + '</head>'
        + '<body class="email-bg" style="margin:0;padding:0;background-color:#030405;">'
        + '<div style="display:none;max-height:0;overflow:hidden;">Your spot is locked in. When the doors open — you\'ll be first to know.</div>'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#030405" style="background-color:#030405;">'
        + '<tr><td class="td-dark email-bg" align="center" bgcolor="#030405" style="background-color:#030405;padding:40px 20px;">'
        + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#030405" style="max-width:600px;width:100%;background-color:#030405;">'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:16px 32px;border-bottom:2px solid #1a3d22;">'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        + '<td class="text-bright" style="font-family:\'Courier New\',monospace;font-size:13px;color:#eaf2ff;">&gt;_ RawCoreTrading</td>'
        + '<td align="right" class="text-green" style="font-family:\'Courier New\',monospace;font-size:10px;color:#00ff88;letter-spacing:0.15em;">WAITLIST CONFIRMED</td>'
        + '</tr></table></td></tr>'

    + '<tr><td class="td-hero" bgcolor="#0a1a0f" style="background-color:#0a1a0f;padding:48px 32px 32px;text-align:center;">'
        + '<p style="margin:0 0 12px;font-family:\'Courier New\',monospace;font-size:11px;color:#00ff88;letter-spacing:0.25em;">// ACCESS_REQUEST: CONFIRMED</p>'
        + '<p class="text-bright" style="margin:0;font-family:Georgia,serif;font-size:64px;font-weight:900;color:#eaf2ff;line-height:1;">YOU\'RE</p>'
        + '<p class="text-green" style="margin:0;font-family:Georgia,serif;font-size:64px;font-weight:900;color:#00ff88;line-height:1;">IN.</p>'
        + '<p class="text-dim" style="margin:12px 0 0;font-family:\'Courier New\',monospace;font-size:10px;color:#3a6644;letter-spacing:0.2em;">// RAWCORE STYLE</p>'
        + '</td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:32px 32px 0;">'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        + '<td class="td-card" bgcolor="#0a1a0f" style="background-color:#0a1a0f;border:1px solid #1a3d22;border-left:4px solid #00ff88;padding:20px 24px;">'
        + '<p style="margin:0 0 12px;font-family:\'Courier New\',monospace;font-size:9px;color:#00ff88;letter-spacing:0.25em;">// STATUS UPDATE</p>'
        + '<p class="text-main" style="margin:0;font-family:\'Courier New\',monospace;font-size:13px;color:#c8d4e0;line-height:1.8;">Hey ' + name + ',<br><br>Your spot is locked in.<br>When the doors open &#8212; you\'ll be first to know.<br><span class="text-green" style="color:#00ff88;">Stay raw.</span></p>'
        + '</td></tr></table></td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:32px 32px 0;">'
        + '<p class="text-dim" style="margin:0 0 16px;font-family:\'Courier New\',monospace;font-size:9px;color:#3a6644;letter-spacing:0.2em;">// WHY YOU\'RE HERE</p>'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;border-bottom:1px solid #0d1a10;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">//</span>&nbsp;&nbsp;Real trading knowledge &#8212; free for everyone</td></tr>'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;border-bottom:1px solid #0d1a10;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">//</span>&nbsp;&nbsp;Automated bots built in a garage, not a boardroom</td></tr>'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;border-bottom:1px solid #0d1a10;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">//</span>&nbsp;&nbsp;Transparent even when the bots lose</td></tr>'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">//</span>&nbsp;&nbsp;No gurus. No lambos. Just the core.</td></tr>'
        + '</table></td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:32px;text-align:center;">'
        + '<p class="text-dim" style="margin:0 0 8px;font-family:\'Courier New\',monospace;font-size:9px;color:#3a6644;letter-spacing:0.15em;">// NO SPAM &middot; NO COURSES &middot; JUST THE LAUNCH NOTIFICATION</p>'
        + '<p style="margin:0;font-family:\'Courier New\',monospace;font-size:9px;color:#1a3d22;">&copy; 2026 <a href="https://rawcoretrading.com" style="color:#00ff88;text-decoration:none;">rawcoretrading.com</a></p>'
        + '</td></tr>'

    + '</table></td></tr></table>'
        + '</body></html>';
}

function welcomeHtml(name) {
      const css = DARK_CSS;
      return '<!DOCTYPE html>'
        + '<html lang="en" xmlns="http://www.w3.org/1999/xhtml">'
        + '<head>'
        + '<meta charset="UTF-8">'
        + '<meta name="viewport" content="width=device-width,initial-scale=1">'
        + '<meta name="color-scheme" content="dark light">'
        + '<meta name="supported-color-schemes" content="dark light">'
        + '<title>Welcome to the Core — RawCore Trading</title>'
        + '<style>' + css + '</style>'
        + '</head>'
        + '<body class="email-bg" style="margin:0;padding:0;background-color:#030405;">'
        + '<div style="display:none;max-height:0;overflow:hidden;">You\'re in. Real trading, real systems, real community.</div>'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#030405" style="background-color:#030405;">'
        + '<tr><td class="td-dark email-bg" align="center" bgcolor="#030405" style="background-color:#030405;padding:40px 20px;">'
        + '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#030405" style="max-width:600px;width:100%;background-color:#030405;">'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:16px 32px;border-bottom:2px solid #1a3d22;">'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        + '<td class="text-bright" style="font-family:\'Courier New\',monospace;font-size:13px;color:#eaf2ff;">&gt;_ RawCoreTrading</td>'
        + '<td align="right" class="text-green" style="font-family:\'Courier New\',monospace;font-size:10px;color:#00ff88;letter-spacing:0.15em;">ACCESS_GRANTED</td>'
        + '</tr></table></td></tr>'

    + '<tr><td class="td-hero" bgcolor="#0a1a0f" style="background-color:#0a1a0f;padding:48px 32px 32px;text-align:center;">'
        + '<p style="margin:0 0 12px;font-family:\'Courier New\',monospace;font-size:11px;color:#00ff88;letter-spacing:0.25em;">// MEMBER_STATUS: ACTIVE</p>'
        + '<p class="text-bright" style="margin:0;font-family:Georgia,serif;font-size:52px;font-weight:900;color:#eaf2ff;line-height:1.1;">WELCOME</p>'
        + '<p class="text-bright" style="margin:0;font-family:Georgia,serif;font-size:52px;font-weight:900;color:#eaf2ff;line-height:1.1;">TO THE</p>'
        + '<p class="text-green" style="margin:0;font-family:Georgia,serif;font-size:52px;font-weight:900;color:#00ff88;line-height:1.1;">CORE.</p>'
        + '<p class="text-dim" style="margin:12px 0 0;font-family:\'Courier New\',monospace;font-size:10px;color:#3a6644;letter-spacing:0.2em;">// NO GURUS &middot; NO LAMBOS &middot; JUST THE CORE</p>'
        + '</td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:32px 32px 0;">'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
        + '<td class="td-card" bgcolor="#0a1a0f" style="background-color:#0a1a0f;border:1px solid #1a3d22;border-left:4px solid #00ff88;padding:20px 24px;">'
        + '<p style="margin:0 0 12px;font-family:\'Courier New\',monospace;font-size:9px;color:#00ff88;letter-spacing:0.25em;">// SYSTEM MESSAGE</p>'
        + '<p class="text-main" style="margin:0;font-family:\'Courier New\',monospace;font-size:13px;color:#c8d4e0;line-height:1.8;">Hey ' + name + ',<br><br>You\'re in. No fake signals, no rented lambos, no "10x your account in a week" nonsense.<br><br>Just real trading, real systems, and a community that actually knows what it\'s doing.</p>'
        + '</td></tr></table></td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:32px 32px 0;">'
        + '<p class="text-dim" style="margin:0 0 16px;font-family:\'Courier New\',monospace;font-size:9px;color:#3a6644;letter-spacing:0.2em;">// WHAT YOU\'VE GOT ACCESS TO</p>'
        + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;border-bottom:1px solid #0d1a10;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">&#8594;</span>&nbsp;&nbsp;Real trading knowledge &#8212; free for everyone</td></tr>'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;border-bottom:1px solid #0d1a10;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">&#8594;</span>&nbsp;&nbsp;Signal feed with full trade explanations</td></tr>'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;border-bottom:1px solid #0d1a10;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">&#8594;</span>&nbsp;&nbsp;Live community chat + AI trading assistant</td></tr>'
        + '<tr><td class="td-dark text-main" bgcolor="#030405" style="background-color:#030405;padding:10px 0;font-family:\'Courier New\',monospace;font-size:11px;color:#c8d4e0;"><span class="text-green" style="color:#00ff88;">&#8594;</span>&nbsp;&nbsp;Bot library, Core Credits and monthly pot</td></tr>'
        + '</table></td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:32px;text-align:center;">'
        + '<a href="https://rawcoretrading.com/member-dashboard" style="display:inline-block;background-color:#00ff88;color:#030405;font-family:\'Courier New\',monospace;font-size:12px;font-weight:700;letter-spacing:0.2em;padding:16px 40px;text-decoration:none;">ENTER THE CORE &#8594;</a>'
        + '</td></tr>'

    + '<tr><td class="td-dark" bgcolor="#030405" style="background-color:#030405;padding:0 32px 32px;text-align:center;">'
        + '<p class="text-dim" style="margin:0 0 8px;font-family:\'Courier New\',monospace;font-size:9px;color:#3a6644;letter-spacing:0.15em;">// Stay raw. Stay real.</p>'
        + '<p style="margin:0;font-family:\'Courier New\',monospace;font-size:9px;color:#1a3d22;">&copy; 2026 <a href="https://rawcoretrading.com" style="color:#00ff88;text-decoration:none;">rawcoretrading.com</a></p>'
        + '</td></tr>'

    + '</table></td></tr></table>'
        + '</body></html>';
}

export default async function handler(req) {
      if (req.method === 'OPTIONS') {
              return new Response(null, { status: 204, headers: corsHeaders });
      }
      if (req.method !== 'POST') {
              return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
      }
      try {
              const { action, email, name } = await req.json();
              if (!email || !action) {
                        return new Response(JSON.stringify({ error: 'Missing email or action' }), { status: 400, headers: corsHeaders });
              }
              const displayName = name || email.split('@')[0];
              let subject, html;
              if (action === 'waitlist') {
                        subject = "// You're on the waitlist — RawCore Trading";
                        html = waitlistHtml(displayName);
              } else if (action === 'welcome') {
                        subject = 'Welcome to the Core // RawCore Trading';
                        html = welcomeHtml(displayName);
              } else {
                        return new Response(JSON.stringify({ error: 'Unknown action: ' + action }), { status: 400, headers: corsHeaders });
              }
              const res = await fetch('https://api.resend.com/emails', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ from: FROM, to: [email], subject, html }),
              });
              const data = await res.json();
              if (!res.ok) {
                        console.error('Resend error:', data);
                        return new Response(JSON.stringify({ error: data.message || 'Send failed' }), { status: res.status, headers: corsHeaders });
              }
              return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200, headers: corsHeaders });
      } catch (err) {
              console.error('send-email error:', err);
              return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
      }
}
