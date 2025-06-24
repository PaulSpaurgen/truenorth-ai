import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateResponse(message: string, context: string) {
  console.log("message", message);
  console.log("context", context);
  // console.log("openai", openai);
  try {
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: message,
  });
  
  console.log(response.output_text);

    return response.output_text;
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
} 