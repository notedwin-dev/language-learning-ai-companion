// express app
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// AWS SDK clients
import bedrockPkg from '@aws-sdk/client-bedrock';
const { BedrockClient, InvokeModelCommand } = bedrockPkg;
import pollyPkg from '@aws-sdk/client-polly';
const { PollyClient, SynthesizeSpeechCommand } = pollyPkg;
import transcribePkg from '@aws-sdk/client-transcribe';
const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = transcribePkg;
import { v4 as uuidv4 } from 'uuid';
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

const bedrockClient = new BedrockClient({
    region: awsRegion,
    credentials: credentials
});

const pollyClient = new PollyClient({
    region: awsRegion,
    credentials: credentials
});

const transcribeClient = new TranscribeClient({
    region: awsRegion,
    credentials: credentials
});

// Use route files
app.use('/api/speech-to-text', speechToTextRoutes);
app.use('/api/text-to-speech', textToSpeechRoutes);
app.use('/api/check-pronunciation', checkPronunciationRoutes);

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