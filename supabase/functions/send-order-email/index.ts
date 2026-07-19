import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

interface OrderData {
  id: string
  name: string
  email: string
  phone: string
  service: string
  deadline: string
  notes: string
  venmo_handle: string
  source_link: string
  selected_colors: string[]
  file_names: string[]
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const order: OrderData = await req.json()

    const colorsList = order.selected_colors && order.selected_colors.length > 0
      ? order.selected_colors.join(", ")
      : "Not specified"

    const filesList = order.file_names && order.file_names.length > 0
      ? order.file_names.join(", ")
      : "No files uploaded"

    const emailHtml = `
      <div style="font-family: Georgia, serif; color: #f5efe4; background: #090909; padding: 2rem;">
        <div style="max-width: 600px; margin: 0 auto; background: #1a140d; border: 1px solid rgba(216, 166, 58, 0.35); border-radius: 0.5rem; padding: 2rem;">
          
          <h1 style="color: #f5d47d; text-align: center; border-bottom: 2px solid #d8a63a; padding-bottom: 1rem;">
            🛡️ New Order Received
          </h1>

          <section style="margin: 1.5rem 0;">
            <h2 style="color: #d8a63a; font-size: 1.1rem; margin-top: 0;">Customer Information</h2>
            <p><strong>Name:</strong> ${order.name}</p>
            <p><strong>Email:</strong> <a href="mailto:${order.email}" style="color: #f5d47d;">${order.email}</a></p>
            <p><strong>Phone:</strong> ${order.phone || "Not provided"}</p>
          </section>

          <section style="margin: 1.5rem 0;">
            <h2 style="color: #d8a63a; font-size: 1.1rem; margin-top: 0;">Order Details</h2>
            <p><strong>Service Type:</strong> ${order.service}</p>
            <p><strong>Desired Deadline:</strong> ${order.deadline || "Not specified"}</p>
            <p><strong>Colors Selected:</strong> ${colorsList}</p>
            <p><strong>Files:</strong> ${filesList}</p>
            ${order.source_link ? `<p><strong>Source Link:</strong> <a href="${order.source_link}" style="color: #f5d47d;">${order.source_link}</a></p>` : ""}
          </section>

          ${order.notes ? `
            <section style="margin: 1.5rem 0; background: rgba(138, 29, 29, 0.2); padding: 1rem; border-radius: 0.5rem; border-left: 3px solid #d8a63a;">
              <h2 style="color: #d8a63a; font-size: 1.1rem; margin-top: 0;">Customer Notes</h2>
              <p style="white-space: pre-wrap;">${order.notes}</p>
            </section>
          ` : ""}

          <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(216, 166, 58, 0.35); text-align: center; color: #b5a98d; font-size: 0.9rem;">
            <p>Order ID: ${order.id}</p>
            <p>Respond to ${order.email} with pricing and timeline details.</p>
          </div>

        </div>
      </div>
    `

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kloak 3D Prints <onboarding@resend.dev>",
        to: "mjolnariclan@gmail.com",
        reply_to: order.email,
        subject: `New Order from ${order.name} - ${order.service}`,
        html: emailHtml,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("Resend error:", data)
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true, email_id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
