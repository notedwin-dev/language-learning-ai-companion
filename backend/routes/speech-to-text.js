import express from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import ffmpeg from 'fluent-ffmpeg';

// AWS SDK v3 Transcribe clients
import { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, '../../.env')
});

const router = express.Router();

// Function to extract detected language from transcription results
const extractDetectedLanguage = (transcriptionResult, job) => {
  // Try multiple sources for the detected language
  let detectedLanguage = 'unknown';
  
  // First, try the transcription result (where AWS puts the auto-detected language)
  if (transcriptionResult?.results?.language_code) {
    detectedLanguage = transcriptionResult.results.language_code;
  }
  // Fallback to job-level language identification
  else if (job.IdentifiedLanguageScore && job.IdentifiedLanguageScore.length > 0) {
    detectedLanguage = job.IdentifiedLanguageScore[0].LanguageCode;
  }
  // Final fallback to job language code
  else if (job.LanguageCode) {
    detectedLanguage = job.LanguageCode;
  }
  
  console.log('Extracted detected language:', detectedLanguage);
  if (transcriptionResult?.results?.language_identification) {
    console.log('Language identification scores:', transcriptionResult.results.language_identification.slice(0, 3));
  }
  
  return detectedLanguage;
};

// Configure AWS clients
let transcribeClient, s3Client;

const hasAWSCredentials = (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) || 
                          (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

if (hasAWSCredentials) {
  const awsConfig = {
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY
    }
  };

  transcribeClient = new TranscribeClient(awsConfig);
  s3Client = new S3Client(awsConfig);
  console.log('AWS Transcribe and S3 clients initialized successfully');
} else {
  console.error('AWS credentials not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION environment variables.');
  process.exit(1);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `audio-${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

// Route to start a transcription job
router.post('/', upload.single('audio'), async (req, res) => {
  try {
    const audioFile = req.file;
    
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Generate a unique job name
    const jobName = `transcription-job-${uuidv4()}`;
    
    console.log('Starting AWS Transcribe job with auto language detection:', jobName);
    console.log('Audio file:', audioFile.originalname, 'Size:', audioFile.size);
    
    // Convert WebM to WAV for AWS Transcribe compatibility
    const wavPath = path.join(__dirname, '../uploads', `${jobName}.wav`);
    
    await new Promise((resolve, reject) => {
      ffmpeg(audioFile.path)
        .toFormat('wav')
        .audioCodec('pcm_s16le')
        .audioChannels(1)
        .audioFrequency(16000)
        .on('end', () => {
          console.log('Audio conversion completed');
          resolve();
        })
        .on('error', (err) => {
          console.error('Audio conversion failed:', err);
          reject(err);
        })
        .save(wavPath);
    });

    // Upload audio to S3
    const bucketName = process.env.AWS_S3_BUCKET;
    if (!bucketName) {
      throw new Error('AWS_S3_BUCKET environment variable not set');
    }

    const s3Key = `audio/${jobName}.wav`;
    const audioBuffer = fs.readFileSync(wavPath);
    
    const uploadParams = {
      Bucket: bucketName,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: 'audio/wav'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));
    console.log('Audio uploaded to S3:', s3Key);

    // Start AWS Transcribe job with automatic language detection
    const transcribeParams = {
      TranscriptionJobName: jobName,
      IdentifyLanguage: true,
      LanguageOptions: [
        'en-US', 'zh-CN', 'zh-TW', 'zh-HK', 'ja-JP', 'ko-KR', 
        'es-ES', 'es-US', 'fr-FR', 'de-DE', 'it-IT', 'pt-BR',
        'ru-RU', 'ar-SA', 'hi-IN', 'th-TH', 'vi-VN', 'ms-MY'
      ],
      Media: {
        MediaFileUri: `s3://${bucketName}/${s3Key}`
      },
      OutputBucketName: bucketName,
      OutputKey: `transcriptions/${jobName}/`,
      Settings: {
        ShowSpeakerLabels: false
      }
    };

    const command = new StartTranscriptionJobCommand(transcribeParams);
    const response = await transcribeClient.send(command);
    
    console.log('AWS Transcribe job started successfully:', response.TranscriptionJob.TranscriptionJobName);

    // Clean up temporary files
    fs.unlinkSync(audioFile.path);
    fs.unlinkSync(wavPath);
    
    res.status(200).json({ 
      message: 'AWS Transcribe job started successfully',
      jobName: jobName,
      isMock: false,
      transcriptionJobStatus: response.TranscriptionJob.TranscriptionJobStatus
    });
    
  } catch (error) {
    console.error('Error starting AWS Transcribe job:', error);
    
    // Clean up temporary files
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to start transcription job',
      details: error.message 
    });
  }
});

// Route to check the status of a transcription job
router.get('/status/:jobName', async (req, res) => {
  try {
    const jobName = req.params.jobName;
    
    console.log('Checking AWS Transcribe job status:', jobName);
    
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    console.log('Job status:', job.TranscriptionJobStatus);

    if (job.TranscriptionJobStatus === 'COMPLETED') {
      // Download transcription result from S3
      const bucketName = process.env.AWS_S3_BUCKET;
      
      // Check if transcript file URI exists
      if (!job.Transcript || !job.Transcript.TranscriptFileUri) {
        console.error('No transcript file URI found in completed job');
        return res.status(500).json({
          error: 'Transcription completed but no transcript file found',
          TranscriptionJob: job,
          isMock: false
        });
      }
      
      const transcriptUri = job.Transcript.TranscriptFileUri;
      
      console.log('Full transcript URI:', transcriptUri);
      
      // Extract the S3 key from the URI - handle different S3 URL formats
      let s3Key;
      if (transcriptUri.includes('.amazonaws.com/')) {
        // Handle format: https://bucket-name.s3.region.amazonaws.com/path/to/file
        // or: https://s3.region.amazonaws.com/bucket-name/path/to/file
        const urlParts = new URL(transcriptUri);
        if (urlParts.hostname.startsWith(bucketName + '.')) {
          // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file
          s3Key = urlParts.pathname.substring(1); // Remove leading slash
        } else {
          // Format: https://s3.region.amazonaws.com/bucket-name/path/to/file
          s3Key = urlParts.pathname.substring(bucketName.length + 2); // Remove /bucket-name/
        }
      } else {
        // Fallback: assume the URI is already just the key
        s3Key = transcriptUri;
      }
      
      console.log('Extracted S3 key:', s3Key);
      
      console.log('Downloading transcription from S3 using credentials:', s3Key);
      
      try {
        // Download transcription result directly from S3 using our credentials
        const getObjectParams = {
          Bucket: bucketName,
          Key: s3Key
        };
        
        const getObjectCommand = new GetObjectCommand(getObjectParams);
        const s3Response = await s3Client.send(getObjectCommand);
        
        // Convert the stream to string
        const streamToString = (stream) => {
          return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          });
        };
        
        const transcriptionText = await streamToString(s3Response.Body);
        const transcriptionResult = JSON.parse(transcriptionText);
        
        // Extract detected language from AWS response (auto language detection)
        const detectedLanguage = extractDetectedLanguage(transcriptionResult, job);
        
        res.status(200).json({
          TranscriptionJob: {
            TranscriptionJobStatus: 'COMPLETED'
          },
          results: transcriptionResult.results,
          detectedLanguage: detectedLanguage,
          isMock: false
        });
      } catch (fetchError) {
        console.error('Error downloading transcription result from S3:', fetchError);
        res.status(500).json({
          error: 'Failed to download transcription result from S3',
          details: fetchError.message,
          TranscriptionJob: job,
          isMock: false
        });
      }
    } else if (job.TranscriptionJobStatus === 'FAILED') {
      res.status(500).json({
        TranscriptionJob: job,
        error: job.FailureReason,
        isMock: false
      });
    } else {
      // Still in progress
      res.status(200).json({
        TranscriptionJob: job,
        isMock: false
      });
    }
  } catch (error) {
    console.error('Error checking transcription job status:', error);
    res.status(500).json({ 
      error: 'Failed to check transcription job status',
      details: error.message 
    });
  }
});

// Alternative route path that the frontend expects (/job/ instead of /status/)
router.get('/job/:jobName', async (req, res) => {
  try {
    const jobName = req.params.jobName;
    
    console.log('Checking AWS Transcribe job status via /job/ endpoint:', jobName);
    
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    console.log('Job status:', job.TranscriptionJobStatus);

    if (job.TranscriptionJobStatus === 'COMPLETED') {
      // Download transcription result from S3
      const bucketName = process.env.AWS_S3_BUCKET;
      
      // Check if transcript file URI exists
      if (!job.Transcript || !job.Transcript.TranscriptFileUri) {
        console.error('No transcript file URI found in completed job');
        return res.status(500).json({
          error: 'Transcription completed but no transcript file found',
          TranscriptionJob: job,
          isMock: false
        });
      }
      
      const transcriptUri = job.Transcript.TranscriptFileUri;
      
      console.log('Full transcript URI:', transcriptUri);
      
      // Extract the S3 key from the URI - handle different S3 URL formats
      let s3Key;
      if (transcriptUri.includes('.amazonaws.com/')) {
        // Handle format: https://bucket-name.s3.region.amazonaws.com/path/to/file
        // or: https://s3.region.amazonaws.com/bucket-name/path/to/file
        const urlParts = new URL(transcriptUri);
        if (urlParts.hostname.startsWith(bucketName + '.')) {
          // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file
          s3Key = urlParts.pathname.substring(1); // Remove leading slash
        } else {
          // Format: https://s3.region.amazonaws.com/bucket-name/path/to/file
          s3Key = urlParts.pathname.substring(bucketName.length + 2); // Remove /bucket-name/
        }
      } else {
        // Fallback: assume the URI is already just the key
        s3Key = transcriptUri;
      }
      
      console.log('Extracted S3 key:', s3Key);
      
      console.log('Downloading transcription from S3 using credentials:', s3Key);
      
      try {
        // Download transcription result directly from S3 using our credentials
        const getObjectParams = {
          Bucket: bucketName,
          Key: s3Key
        };
        
        const getObjectCommand = new GetObjectCommand(getObjectParams);
        const s3Response = await s3Client.send(getObjectCommand);
        
        // Convert the stream to string
        const streamToString = (stream) => {
          return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          });
        };
        
        const transcriptionText = await streamToString(s3Response.Body);
        const transcriptionResult = JSON.parse(transcriptionText);
        
        // Extract detected language from AWS response (auto language detection)
        const detectedLanguage = extractDetectedLanguage(transcriptionResult, job);
        
        res.status(200).json({
          TranscriptionJob: {
            TranscriptionJobStatus: 'COMPLETED'
          },
          results: transcriptionResult.results,
          detectedLanguage: detectedLanguage,
          isMock: false
        });
      } catch (fetchError) {
        console.error('Error fetching transcription result:', fetchError);
        res.status(500).json({
          error: 'Failed to download transcription result',
          details: fetchError.message,
          TranscriptionJob: job,
          isMock: false
        });
      }
    } else if (job.TranscriptionJobStatus === 'FAILED') {
      res.status(500).json({
        TranscriptionJob: job,
        error: job.FailureReason,
        isMock: false
      });
    } else {
      // Still in progress
      res.status(200).json({
        TranscriptionJob: job,
        isMock: false
      });
    }
  } catch (error) {
    console.error('Error checking transcription job status via /job/ endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to check transcription job status',
      details: error.message 
    });
  }
});

// Route for signed URL endpoint that the frontend expects (ScenarioEngine.tsx)
router.get('/job/:jobName/signed-url', async (req, res) => {
  try {
    const jobName = req.params.jobName;
    
    console.log('Getting transcription result for:', jobName);
    
    const command = new GetTranscriptionJobCommand({
      TranscriptionJobName: jobName
    });

    const response = await transcribeClient.send(command);
    const job = response.TranscriptionJob;

    if (job.TranscriptionJobStatus === 'COMPLETED') {
      // Download transcription result from S3 using credentials
      const bucketName = process.env.AWS_S3_BUCKET;
      const transcriptUri = job.Transcript.TranscriptFileUri;
      
      console.log('Full transcript URI:', transcriptUri);
      
      // Extract the S3 key from the URI - handle different S3 URL formats
      let s3Key;
      if (transcriptUri.includes('.amazonaws.com/')) {
        // Handle format: https://bucket-name.s3.region.amazonaws.com/path/to/file
        // or: https://s3.region.amazonaws.com/bucket-name/path/to/file
        const urlParts = new URL(transcriptUri);
        if (urlParts.hostname.startsWith(bucketName + '.')) {
          // Format: https://bucket-name.s3.region.amazonaws.com/path/to/file
          s3Key = urlParts.pathname.substring(1); // Remove leading slash
        } else {
          // Format: https://s3.region.amazonaws.com/bucket-name/path/to/file
          s3Key = urlParts.pathname.substring(bucketName.length + 2); // Remove /bucket-name/
        }
      } else {
        // Fallback: assume the URI is already just the key
        s3Key = transcriptUri;
      }
      
      console.log('Extracted S3 key:', s3Key);
      
      console.log('Downloading transcription from S3 using credentials:', s3Key);
      
      try {
        // Download transcription result directly from S3 using our credentials
        const getObjectParams = {
          Bucket: bucketName,
          Key: s3Key
        };
        
        const getObjectCommand = new GetObjectCommand(getObjectParams);
        const s3Response = await s3Client.send(getObjectCommand);
        
        // Convert the stream to string
        const streamToString = (stream) => {
          return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('error', reject);
            stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
          });
        };
        
        const transcriptionText = await streamToString(s3Response.Body);
        const transcriptionResult = JSON.parse(transcriptionText);
        
        const transcript = transcriptionResult.results?.transcripts?.[0]?.transcript || '';
        
        // Extract detected language from AWS response (auto language detection)
        const detectedLanguage = extractDetectedLanguage(transcriptionResult, job);

        return res.status(200).json({
          transcript: transcript,
          detectedLanguage: detectedLanguage,
          results: {
            transcripts: transcript,
            detectedLanguage: detectedLanguage
          },
          isMock: false
        });
      } catch (s3Error) {
        console.error('Error downloading transcription from S3:', s3Error);
        return res.status(500).json({
          error: 'Failed to download transcription result from S3',
          details: s3Error.message,
          isMock: false
        });
      }
    } else {
      // Job not completed yet
      res.status(202).json({ 
        transcript: '',
        detectedLanguage: 'unknown',
        results: {
          transcripts: '',
          detectedLanguage: 'unknown'
        },
        isMock: false,
        status: job.TranscriptionJobStatus,
        message: 'Transcription still in progress'
      });
    }
    
  } catch (error) {
    console.error('Error getting transcription result:', error);
    res.status(500).json({ 
      error: 'Failed to get transcription result',
      details: error.message 
    });
  }
});

export default router;