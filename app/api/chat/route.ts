import { google } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  // System prompt to make the AI helpful for task management
  const systemPrompt = `You are a helpful AI assistant integrated into a task management application. You can help users with:

1. Creating and organizing tasks
2. Setting priorities and due dates
3. Breaking down complex projects into smaller tasks
4. Providing productivity tips and suggestions
5. Helping with time management
6. Suggesting task categorization

Be concise, helpful, and focused on productivity and task management. When users ask about creating tasks, provide structured suggestions they can easily implement.

Current context: You're helping users manage their tasks in a CRUD task manager application.`

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: systemPrompt,
    messages,
    maxTokens: 500,
  })

  return result.toDataStreamResponse()
}
