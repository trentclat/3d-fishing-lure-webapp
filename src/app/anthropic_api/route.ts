import { anthropic } from "@ai-sdk/anthropic";
import { convertToCoreMessages, streamText } from "ai";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    // Parse request body
    const { messages } = await req.json();
    
    console.log('Received messages:', JSON.stringify(messages, null, 2));
    
    // Input validation
    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages format:', messages);
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate message format
    for (const [index, message] of messages.entries()) {
      if (!message.role || !message.content) {
        console.error(`Invalid message at index ${index}:`, message);
        return new Response(
          JSON.stringify({ error: `Message at index ${index} must have role and content` }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (typeof message.content !== 'string') {
        console.error(`Invalid content type at index ${index}:`, typeof message.content);
        return new Response(
          JSON.stringify({ error: `Message content at index ${index} must be a string` }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      if (message.content.length > 4000) {
        console.error(`Message too long at index ${index}:`, message.content.length);
        return new Response(
          JSON.stringify({ error: `Message content at index ${index} must be under 4000 characters` }), 
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Claude response...');
    
    // Create Claude response with fishing/lure context
    const result = await streamText({
      model: anthropic("claude-3-haiku-20240307"),
      messages: convertToCoreMessages(messages),
      system: `You are Claude, an AI assistant specialized in fishing and lure design. You're integrated into a 3D lure visualization application. 

Your expertise includes:
- Fishing lure design and engineering
- Color schemes and patterns for different fishing conditions
- Fishing techniques and strategies
- Fish behavior and habitat preferences
- Water conditions and environmental factors
- Lure physics and hydrodynamics

When users ask about their lure, provide helpful, practical advice about fishing techniques, color effectiveness, target fish species, and optimal conditions for use. Be conversational but knowledgeable, and always relate your advice back to practical fishing applications.`,
      maxTokens: 1000,
    });

    console.log('Claude response created successfully');
    
    // Log what's actually being streamed for debugging
    const response = result.toDataStreamResponse();
    console.log('Response headers:', response.headers);
    
    return response;
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'Error';
    
    console.error('Claude API Error Details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    });
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get response from Claude',
        details: errorMessage 
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
