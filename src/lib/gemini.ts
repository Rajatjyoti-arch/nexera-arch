import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

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

export const getGeminiResponse = async (
    prompt: string,
    history: { role: "user" | "model"; parts: { text: string }[] }[] = [],
    customSystemInstruction?: string
) => {
    if (!API_KEY) {
        throw new Error("Gemini API Key is required. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            systemInstruction: customSystemInstruction || SYSTEM_INSTRUCTION
        });

        // Gemini requires history to start with a 'user' message
        const validHistory = history.length > 0 && history[0].role === "model"
            ? history.slice(1)
            : history;

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 2000,
                temperature: 0.9,
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error("❌ GEMINI API ERROR:", error);
        console.error("Error details:", {
            message: error?.message,
            status: error?.status,
            statusText: error?.statusText,
            response: error?.response
        });

        // Re-throw the actual error so we can see it
        throw error;
    }
};
