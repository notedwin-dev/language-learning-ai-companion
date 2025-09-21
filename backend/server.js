// express app
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// AWS SDK clients
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import multer from 'multer';

// Import routes
import speechToTextRoutes from './routes/speech-to-text.js';
import textToSpeechRoutes from './routes/text-to-speech.js';
import checkPronunciationRoutes from './routes/check-pronunciation.js';

const __filename = fileURLToPath(import.meta.url); // Get the current file path
const __dirname = path.dirname(__filename); // Get the current directory path
// Load environment variables from .env file
dotenv.config({
  path: path.join(__dirname, '../.env')
});

const app = express();
const port = process.env.PORT || 5000; // Changed to 5000 to match frontend config
app.use(bodyParser.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow NextJS dev server and production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const upload = multer({ dest: 'uploads/' }); // Set up multer for file uploads
const awsRegion = process.env.AWS_REGION || 'us-east-1'; // Default to us-east-1 if not set
const bedrockModelId = process.env.BEDROCK_MODEL_ID || 'deepseek.r1-v1:0'; // Default to deepseek.r1-v1:0 if not set

const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
};

const bedrockClient = new BedrockRuntimeClient({
    region: awsRegion,
    credentials: credentials
});

// Use route files
app.use('/api/speech-to-text', speechToTextRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);
app.use('/api/check-pronunciation', checkPronunciationRoutes);

// Endpoint to generate AI explanation for language learning
app.post('/api/generate-explanation', async (req, res) => {
  const { language, sentence, pronunciation, translation, culturalNote, context, npcDialogue, scenario } = req.body;

  if (!language || !sentence || !translation) {
    return res.status(400).json({ error: 'Language, sentence, and translation are required' });
  }

  try {
    // Create a comprehensive prompt for explanation
    const prompt = `You are a helpful language learning assistant. Provide a detailed explanation about this ${language} sentence in a conversational, educational tone.

Sentence: "${sentence}"
${pronunciation ? `Pronunciation: ${pronunciation}` : ''}
Translation: "${translation}"
${culturalNote ? `Cultural Context: ${culturalNote}` : ''}
Scenario: ${scenario} setting
Context: The speaker just responded to "${npcDialogue}" in a ${context}

Please explain:
1. The meaning and context of this sentence
2. When and how to use it appropriately
3. Any grammar patterns or key vocabulary
4. Cultural significance if applicable
5. Alternative ways to express the same idea

Keep the explanation informative but accessible, around 100-150 words. Write in the native language (${language}) if possible, otherwise in English.`;

    // Use inference profile approach like the pronunciation checking
    const possibleModelIds = [
      'arn:aws:bedrock:us-east-1:335965711506:inference-profile/us.deepseek.r1-v1:0',  // Confirmed working ARN from playground
      'us.deepseek.r1-v1:0',  // Regional inference profile
      process.env.BEDROCK_MODEL_ID || 'deepseek.r1-v1:0'  // Fallback to env variable
    ];
    
    let modelResponse = null;
    let lastError = null;

    // DeepSeek R1 payload format
    const payload = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9
    };

    // Try different model IDs until one works
    for (const modelId of possibleModelIds) {
      try {
        console.log(`Trying explanation generation with model ID: ${modelId}`);
        
        const command = new InvokeModelCommand({
          modelId: modelId,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify(payload)
        });

        const response = await bedrockClient.send(command);
        modelResponse = response;
        console.log(`Success with model ID: ${modelId}`);
        break; // Exit loop if successful
        
      } catch (modelError) {
        console.log(`Failed with model ID ${modelId}:`, modelError.message);
        lastError = modelError;
        
        // If this is the last attempt, we'll use the fallback
        if (modelId === possibleModelIds[possibleModelIds.length - 1]) {
          throw modelError;
        }
        
        // Continue to next model ID
        continue;
      }
    }

    if (!modelResponse) {
      throw lastError || new Error('All model IDs failed');
    }

    const responseBody = JSON.parse(new TextDecoder().decode(modelResponse.body));
    console.log('Full response body:', JSON.stringify(responseBody, null, 2));

    // Try multiple ways to extract the content
    let explanation = null;

    // DeepSeek R1 format: choices[0].message.content
    if (responseBody.choices?.[0]?.message?.content) {
      explanation = responseBody.choices[0].message.content;
      console.log('Found explanation in choices[0].message.content');
    }
    // Alternative formats
    else if (responseBody.content?.[0]?.text) {
      explanation = responseBody.content[0].text;
      console.log('Found explanation in content[0].text');
    }
    else if (responseBody.outputText) {
      explanation = responseBody.outputText;
      console.log('Found explanation in outputText');
    }
    else if (responseBody.text) {
      explanation = responseBody.text;
      console.log('Found explanation in text');
    }
    else {
      console.log('No explanation found in expected fields, using fallback');
      explanation = `This ${language} sentence "${sentence}" means "${translation}". It's commonly used in ${scenario} settings and is appropriate for this conversational context.`;
    }

    res.json({ explanation });
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({
      error: 'Error generating explanation',
      explanation: `This ${language} sentence "${sentence}" means "${translation}". It's commonly used in ${scenario} settings and is appropriate for this conversational context.`
    });
  }
});

// Endpoint to handle text input and return AI-generated response
app.post('/api/message', async (req, res) => {
    const userMessage = req.body.message;
    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        const command = new InvokeModelCommand({
            modelId: bedrockModelId,
            inputText: userMessage,
            maxTokens: 1000,
            temperature: 0.7,
            topP: 0.95,
            stopSequences: ['\n\n']
        });
        const response = await bedrockClient.send(command);
        const aiMessage = response.outputText || 'No response from model';
        res.json({ message: aiMessage });
    } catch (error) {
        console.error('Error invoking Bedrock model:', error);
        res.status(500).json({ error: 'Error invoking Bedrock model' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});