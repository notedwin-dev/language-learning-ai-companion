import express from 'express';
import { 
  PollyClient, 
  SynthesizeSpeechCommand 
} from '@aws-sdk/client-polly';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.join(__dirname, '../../.env')
});

const router = express.Router();

// Configure AWS conditionally
let pollyClient;

const hasAWSCredentials = (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) || 
                          (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

if (hasAWSCredentials) {
  pollyClient = new PollyClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY,
    }
  });
} else {
  console.warn('AWS credentials not configured. Polly client not initialized.');
}

// Route to synthesize speech
router.post('/', async (req, res) => {
  try {
    const { text, voiceId, engine, outputFormat } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    // Check if AWS credentials are properly configured
    if (!hasAWSCredentials || !pollyClient) {
      console.warn('AWS credentials not fully configured. Using fallback audio response.');
      
      try {
        // Create a placeholder audio file for development
        const fallbackAudioPath = path.join(__dirname, '../assets/fallback-audio.mp3');
        
        // If we have a fallback audio file, send it
        if (fs.existsSync(fallbackAudioPath)) {
          const audioBuffer = fs.readFileSync(fallbackAudioPath);
          res.set({
            'Content-Type': 'audio/mp3',
            'Content-Length': audioBuffer.length,
          });
          return res.send(audioBuffer);
        } else {
          // Otherwise send a JSON response indicating fallback
          return res.status(200).json({ 
            message: 'AWS Polly not configured. No fallback audio available.',
            isFallback: true
          });
        }
      } catch (error) {
        console.error('Error using fallback audio:', error);
        return res.status(200).json({ 
          message: 'AWS Polly not configured. Error loading fallback audio.',
          isFallback: true,
          error: error.message
        });
      }
    }
    
    // Default parameters
    const params = {
      Text: text,
      OutputFormat: outputFormat || 'mp3',
      VoiceId: voiceId || 'Joanna',
      Engine: engine || 'neural' // 'standard' or 'neural'
    };
    
    // Use Polly to synthesize speech
    const command = new SynthesizeSpeechCommand(params);
    const response = await pollyClient.send(command);
    
    // Check if we have audio stream
    if (response.AudioStream) {
      try {
        // For AWS SDK v3, AudioStream is already a readable stream
        const chunks = [];
        
        // Set up event listeners and collect data
        await new Promise((resolve, reject) => {
          response.AudioStream.on('data', (chunk) => chunks.push(chunk));
          response.AudioStream.on('end', resolve);
          response.AudioStream.on('error', reject);
        });
        
        const audioBuffer = Buffer.concat(chunks);
        
        // Set the appropriate headers
        res.set({
          'Content-Type': `audio/${params.OutputFormat}`,
          'Content-Length': audioBuffer.length,
        });
        
        // Send the audio buffer as the response
        return res.send(audioBuffer);
      } catch (streamError) {
        console.error('Error processing audio stream:', streamError);
        return res.status(500).json({ 
          error: 'Error processing audio stream', 
          details: streamError.message 
        });
      }
    } else {
      res.status(500).json({ error: 'No audio stream returned from Polly' });
    }
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    res.status(500).json({ 
      error: 'Failed to synthesize speech', 
      details: error.message 
    });
  }
});

export default router;