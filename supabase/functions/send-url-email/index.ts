import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { urlId, email, link, type } = await req.json()

    // Validate required fields
    if (!email || !link) {
      throw new Error('Email and link are required.')
    }

    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY')
    
    let typeName = '送付URL'
    if (type === 'slots') typeName = '枠出し画面'
    if (type === 'materials') typeName = '素材ダウンロード・リライトUP画面'
    if (type === 'recordings') typeName = '同録UP画面'

    const subject = `【Pudding / Tacos】${typeName} のご案内`
    const textContent = `
担当者様

以下の専用URLより、システムへアクセスしてください。

■ ${typeName}
${link}

※このURLはゲスト専用です。他の方への共有はお控えください。
※ご不明点がございましたら、担当者までお問い合わせください。

-------------------------------------
Pudding / Tacos 自動送信メール
-------------------------------------
`

    if (!sendgridApiKey) {
      // Mock mode: If API key is not set, just log and return success
      console.log('--- MOCK EMAIL SENDING ---')
      console.log(`To: ${email}`)
      console.log(`Subject: ${subject}`)
      console.log(`Body: ${textContent}`)
      console.log('--------------------------')

      return new Response(
        JSON.stringify({ success: true, message: 'Mock email sent successfully (No API Key configured)' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Actual SendGrid API call
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: 'noreply@pudding-tacos-demo.com', name: 'Pudding/Tacos System' },
        subject: subject,
        content: [{ type: 'text/plain', value: textContent }],
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      throw new Error(`SendGrid API error: ${errorText}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully via SendGrid' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
