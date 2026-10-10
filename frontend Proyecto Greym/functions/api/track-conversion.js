export async function onRequestPost(context) {
    const { request, env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const PIXEL_ID = env.META_PIXEL_ID;
        const ACCESS_TOKEN = env.META_ACCESS_TOKEN;
        
        if (!PIXEL_ID || !ACCESS_TOKEN) {
            return new Response(JSON.stringify({ error: 'Faltan credenciales CAPI' }), { 
                status: 500, 
                headers: { 'Content-Type': 'application/json', ...corsHeaders } 
            });
        }

        const body = await request.json();
        
        const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
        const userAgent = body.userAgent || request.headers.get('User-Agent') || '';
        
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const eventData = [{
            event_name: body.eventName || 'Lead',
            event_time: currentTimestamp,
            action_source: 'website',
            event_source_url: body.eventUrl || request.url,
            user_data: {
                client_ip_address: clientIp,
                client_user_agent: userAgent,
                fbp: body.fbp || undefined,
                fbc: body.fbc || undefined
            },
            custom_data: {
                content_name: 'Penumbra - Greym & DJ Josniel',
                content_category: 'Music Smartlink',
                destination: body.destination 
            }
        }];

        const metaApiUrl = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events`;
        
        const capiRequest = fetch(`${metaApiUrl}?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: eventData })
        })
        .then(res => res.json())
        .then(data => {
            if(data.error) console.error('Meta CAPI Error:', data.error);
            else console.log('Meta CAPI Success:', data);
        })
        .catch(error => console.error('Worker Fetch Error:', error));

        context.waitUntil(capiRequest);

        return new Response(JSON.stringify({ success: true, edge_bypass: 'active' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Bad Request' }), { 
            status: 400,
            headers: corsHeaders
        });
    }
}
