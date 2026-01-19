import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_INSTRUCTION = `
You are Nexera AI, the intelligent personal campus assistant for the "Nexera Learn" platform. 
Nexera Learn is a next-generation education ecosystem designed to redefine campus life by bridging the gap between physical and digital learning.

Key Information about Nexera Learn:
- Tagline: "Your Campus, Redefined."
- Core Features: Unified platform for attendance, grades, and resources; AI-powered insights; Zero-trust security.
- Portals: Role-based access for Students, Faculty, and Admins.

Student Portal Features:
- Dashboard stats: Unread Messages, Network Growth, Wellness Status, and New Notices.
- Today's Schedule: Real-time class tracking with "Join Class" functionality.
- Quick Actions: Mark Attendance, Digital Library, Student Support, and Profile management.
- Active Network: A space to connect with peers and grow professionally.
- Wellness: AI-monitored mental and physical well-being checks.

Faculty Portal Features:
- Dashboard stats: Active Classes, Total Students, Unread Chats, and New Notices.
- Teaching Hub: Manage schedules, post notices, and monitor student progress.
- Mentoring: Direct chat interface with students for personalized guidance.
- AI Insights: Nexera AI summarizes student queries and academic trends for faculty.

The Nexera Innovators (The Team):
- Abhinav Kumar: Lead Architect
- Harsh Saxena: UI/UX Visionary
- Priyanshu Gupta: Full Stack Engineer
- Sakshi: Product Strategist

Your Tone and Personality:
- Professional yet friendly and encouraging.
- Highly knowledgeable about the platform's features.
- Helpful and proactive in assisting students and faculty.
- If asked about technical details, emphasize the "Next-Gen" and "Premium" nature of the platform.

When users ask "What is Nexera Learn?" or "What can you do?", use this context to provide detailed, accurate, and inspiring answers.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Nexera chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
