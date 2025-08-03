import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { numQuestions, topic, customPrompt } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Google Gemini API key' }, { status: 500 });
  }

  // If customPrompt is provided, use it, otherwise build the default prompt
  const prompt = customPrompt && customPrompt.trim().length > 0
    ? customPrompt.trim() + ". Return the result as a JSON array with fields: id, question, options, correctAnswer."
    : `Generate ${numQuestions} multiple choice questions on the topic "${topic}". Each question should have 4 options and specify the correct answer. Return the result as a JSON array with fields: id, question, options, correctAnswer.`;

  // Gemini API endpoint and payload (matching working curl)
  const geminiPayload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  // Log the request payload to Gemini for debugging
  console.log('Gemini request:', geminiPayload);

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': apiKey,
    },
    body: JSON.stringify(geminiPayload),
  });

  // Check response status before parsing
  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = '[Body not available]';
    }
    console.error('Gemini API error:', response.status, errorText);
    return NextResponse.json({ error: `Gemini API error: ${response.status}`, raw: errorText }, { status: response.status });
  }

  let data;
  let content;
  try {
    data = await response.json();
    // Extract the text from the response
    content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    // Remove code block markers if present
    if (content?.startsWith('```json')) {
      content = content.replace(/^```json\n?|```$/g, '').trim();
    } else if (content?.startsWith('```')) {
      content = content.replace(/^```\n?|```$/g, '').trim();
    }
  } catch (err) {
    let text = '';
    try {
      text = await response.clone().text();
    } catch (e) {
      text = '[Body not available]';
    }
    console.error('Gemini raw response (not JSON):', text);
    return NextResponse.json({ error: 'Failed to parse Gemini response as JSON', raw: text }, { status: 500 });
  }

  // Log the raw output from Gemini for debugging
  console.log('Raw Gemini output:', content);

  let questions;
  try {
    questions = JSON.parse(content);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to parse questions from Gemini', raw: content }, { status: 500 });
  }

  return NextResponse.json({ questions });
}
