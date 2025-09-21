import express from 'express';
import { 
  BedrockRuntimeClient, 
  ConverseCommand, 
  InvokeModelCommand 
} from '@aws-sdk/client-bedrock-runtime';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.join(__dirname, '../../.env')
});

const router = express.Router();

// Configure AWS conditionally
let bedrockClient;

const hasAWSCredentials = (process.env.AWS_ACCESS_KEY && process.env.AWS_SECRET_KEY) || 
                          (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

if (hasAWSCredentials) {
  bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY
    }
  });
} else {
  console.warn('AWS credentials not configured. Bedrock client not initialized.');
}

// Route to check pronunciation
router.post('/', async (req, res) => {
  try {
    const { expected, actual, language, detectedLanguage } = req.body;
    
    if (!expected) {
      return res.status(400).json({ error: 'Expected phrase is required' });
    }
    
    // Debugging: Log the expected and actual values
    console.log('=== PRONUNCIATION CHECK DEBUG ===');
    console.log('Expected value:', JSON.stringify(expected, null, 2));
    console.log('Actual value (transcription result):', JSON.stringify(actual, null, 2));
    console.log('Expected language:', language);
    console.log('Detected language:', detectedLanguage);
    console.log('=====================================');
    
    // Handle empty transcript (often due to language mismatch)
    if (!actual || actual.trim() === '') {
      if (detectedLanguage && language && detectedLanguage !== language) {
        const normalizedExpected = normalizeLanguage(language);
        const normalizedDetected = normalizeLanguage(detectedLanguage);
        
        if (normalizedExpected !== normalizedDetected) {
          return res.status(200).json({
            score: 0.2,
            feedback: `Language mismatch! AWS detected ${detectedLanguage} but you're learning ${language}. The transcription was empty because you likely spoke ${language} but AWS expected ${detectedLanguage}. Try saying "${expected.phrase || expected.text || expected}" clearly in ${language}.`,
            languageMismatch: true,
            detectedLanguage: detectedLanguage,
            expectedLanguage: language
          });
        }
      }
      
      // Empty transcript without clear language mismatch
      return res.status(200).json({
        score: 0.1,
        feedback: `No speech detected or transcription was empty. Please speak clearly and try again. Expected phrase: "${expected.phrase || expected.text || expected}"`,
        emptyTranscript: true
      });
    }
    
    // Check for language mismatch with non-empty transcript
    if (detectedLanguage && language) {
      const isLanguageMismatch = checkLanguageMismatch(language, detectedLanguage, expected, actual);
      if (isLanguageMismatch) {
        return res.status(200).json({
          score: 0.3,
          feedback: `Language mismatch detected! You're learning ${language} but spoke in ${detectedLanguage}. Try saying "${expected.phrase || expected.chinese || expected.text}" in ${language}.`,
          languageMismatch: true,
          detectedLanguage: detectedLanguage,
          expectedLanguage: language
        });
      }
    }

    // Check if AWS credentials are configured for Bedrock
    if (!hasAWSCredentials || !bedrockClient) {
      console.warn('AWS credentials not configured. Using simple string comparison for pronunciation check.');
      const simpleScore = calculateSimpleScore(expected, actual, language);
      return res.status(200).json({
        score: simpleScore,
        feedback: simpleScore > 0.7 
          ? 'Good pronunciation! (Note: Using basic comparison - AWS AI not configured)' 
          : 'Keep practicing! (Note: Using basic comparison - AWS AI not configured)'
      });
    }
    
    // Use DeepSeek R1 inference profile instead of direct model access
    // Try multiple possible inference profile formats - prioritize the working ARN from playground
    const possibleModelIds = [
      'arn:aws:bedrock:us-east-1:335965711506:inference-profile/us.deepseek.r1-v1:0',  // Confirmed working ARN from playground
      'us.deepseek.r1-v1:0',  // Regional inference profile
      process.env.BEDROCK_MODEL_ID || 'deepseek.r1-v1:0'  // Fallback to env variable
    ];
    
    let modelResponse = null;
    let lastError = null; 
    
    // Create a prompt for DeepSeek R1
    const prompt = `You are an expert ${language} language teacher providing pronunciation feedback.

Expected phrase: "${expected.chinese || expected.text || expected}"
Romanization: "${expected.cantonese || expected.pronunciation || 'N/A'}"  
English: "${expected.english || expected.translation || 'N/A'}"

Student's transcribed speech: "${actual}"
Expected language: ${language}
Detected language: ${detectedLanguage || 'unknown'}

IMPORTANT CONTEXT:
- You are seeing a transcription, not hearing the actual audio
- The student is learning ${language} but may have spoken in ${detectedLanguage || 'unknown language'}
- If there's a language mismatch, focus your feedback on guiding them back to the target language
- Even if transcription matches perfectly, the student may have pronunciation issues (wrong tones, unclear sounds, etc.)
- Provide educational feedback that helps improve pronunciation regardless of transcription accuracy
- Focus on common ${language} pronunciation challenges for this phrase

Language mismatch handling:
- If detected language differs from expected: Provide gentle correction and encourage target language use
- If languages match: Focus on pronunciation quality, tones, and specific sound improvements
- Always be encouraging and educational

For scoring (be realistic about transcription limitations):
- 0.8-1.0: Correct language + good transcription (but remind about tone accuracy)
- 0.6-0.7: Correct language + partial match, provide specific guidance  
- 0.3-0.5: Language mismatch or significant pronunciation issues
- 0.0-0.2: Wrong language or very poor attempt

Respond ONLY in this JSON format (below is only for reference of structure, dont consider the score and feedback, you should generate your own based on the input):
{
  "score": 0.75,
  "feedback": "Good word recognition! For '${expected.chinese}' (${expected.cantonese}), focus on the tone pattern: [specific tone guidance]. Practice emphasizing the [specific sounds] more clearly."
}

Provide specific, actionable pronunciation tips for this phrase.`;

    // Debugging: Log the constructed prompt
    console.log('Constructed prompt for DeepSeek R1:', prompt);

    // DeepSeek R1 payload format - simplified structure for InvokeModelCommand
    const payload = {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,  // Increased from 1000 to allow full reasoning
      temperature: 0.3,  // Lower temperature for more consistent JSON output
      top_p: 0.9
    };

    // Try different model IDs until one works
    for (const modelId of possibleModelIds) {
      try {
        console.log(`Trying model ID: ${modelId}`);
        
        // Use InvokeModelCommand instead of ConverseCommand for DeepSeek R1
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

    // Parse the DeepSeek R1 model response
    const responseBody = JSON.parse(Buffer.from(modelResponse.body).toString('utf8'));
    console.log('DeepSeek R1 full response body:', responseBody);
    
    // DeepSeek R1 response format uses choices array with message content
    const modelOutput = responseBody.choices?.[0]?.message?.content || 
                       responseBody.outputText || 
                       responseBody.text || 
                       JSON.stringify(responseBody);

    console.log('DeepSeek R1 extracted content:', modelOutput);
    
    // Handle the case where content is null (reasoning was truncated)
    if (!modelOutput || modelOutput === 'null') {
      console.log('DeepSeek response was truncated. Using educational fallback scoring.');

      // Even for exact matches, don't give perfect scores since we can't assess actual pronunciation
      if (actual === expected.chinese) {
        return res.status(200).json({
          score: 0.8, // Conservative score since we can't assess actual pronunciation quality
          feedback: `Good! Your speech was recognized as "${actual}". Remember to focus on tone accuracy: ${expected.cantonese}. Practice the tone pattern to ensure clear pronunciation.`
        });
      } else {
        // Use simple scoring as fallback but cap it for educational purposes
        const simpleScore = Math.min(calculateSimpleScore(expected, actual, language), 0.7);
        return res.status(200).json({
          score: simpleScore,
          feedback: `Keep practicing! For "${expected.chinese}" (${expected.cantonese}), focus on clear pronunciation and proper tones. Try listening to native speakers.`
        });
      }
    }

    // Parse the response - check if it's already valid JSON
    try {
      const directParse = JSON.parse(modelOutput);
      if (typeof directParse.score === 'number' && typeof directParse.feedback === 'string') {
        return res.status(200).json(directParse);
      }
    } catch (e) {
      // Not direct JSON, continue with extraction
    }
    
    // Extract JSON from the response - look for complete JSON objects only
    // Use a more specific regex that ensures we get complete JSON
    const jsonMatches = modelOutput.match(/\{\s*"score"\s*:\s*[0-9.]+\s*,\s*"feedback"\s*:\s*"[^"]*"\s*\}/g);
    
    if (jsonMatches && jsonMatches.length > 0) {
      try {
        // Use the first complete match
        const jsonResponse = JSON.parse(jsonMatches[0]);
        // Validate the response has the expected fields
        if (typeof jsonResponse.score === 'number' && typeof jsonResponse.feedback === 'string') {
          return res.status(200).json(jsonResponse);
        }
      } catch (e) {
        console.error('Error parsing DeepSeek JSON:', e);
        console.log('Failed JSON string:', jsonMatches[0]);
      }
    }
    
    // Try to extract score and feedback from plain text if JSON parsing fails
    const scoreMatch = modelOutput.match(/score["\s]*:\s*([0-9.]+)/i);
    const feedbackMatch = modelOutput.match(/feedback["\s]*:\s*["']([^"']+)["']/i);
    
    if (scoreMatch && feedbackMatch) {
      const score = parseFloat(scoreMatch[1]);
      const feedback = feedbackMatch[1];
      return res.status(200).json({ score, feedback });
    }
    
    // Fallback if we couldn't parse any structured response
    const simpleScore = calculateSimpleScore(expected, actual, language);
    res.status(200).json({
      score: simpleScore,
      feedback: `AI analysis unavailable. Score based on text similarity: ${Math.round(simpleScore * 100)}%`
    });
    
  } catch (error) {
    console.error('Error checking pronunciation with DeepSeek R1:', error);
    
    // Provide detailed error information for debugging
    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code || 'Unknown'
    };
    
    console.log('Error details:', errorDetails);
    
    // Fallback response with simple comparison
    const simpleScore = calculateSimpleScore(req.body.expected, req.body.actual, req.body.language);
    res.status(200).json({
      score: simpleScore,
      feedback: `AI analysis failed (${error.message}). Score based on text similarity: ${Math.round(simpleScore * 100)}%`,
      fallback: true,
      errorType: errorDetails.name
    });
  }
});

// Normalize language codes for comparison
function normalizeLanguage(lang) {
  const langLower = lang.toLowerCase();
  
  // All Chinese variants (Cantonese, Mandarin, Traditional, Simplified)
  if (langLower.includes('zh') || 
      langLower.includes('yue') || 
      langLower.includes('cantonese') || 
      langLower.includes('mandarin') ||
      langLower.includes('chinese')) {
    return 'chinese';
  }
  
  // English variants
  if (langLower.includes('en') || langLower.includes('english')) {
    return 'english';
  }
  
  // Malay variants
  if (langLower.includes('ms') || langLower.includes('malay')) {
    return 'malay';
  }
  
  return langLower;
}

// Check for language mismatch between expected and detected language
function checkLanguageMismatch(expectedLang, detectedLang, expected, actual) {
  // If no detected language info, can't determine mismatch
  if (!detectedLang || detectedLang === 'unknown') return false;

  // Normalize language codes for comparison - use the standalone function
  // Use the standalone normalizeLanguage function
  const expectedNormalized = normalizeLanguage(expectedLang);
  const detectedNormalized = normalizeLanguage(detectedLang);
  
  console.log('Language mismatch check:', {
    expectedLang,
    detectedLang,
    expectedNormalized,
    detectedNormalized
  });

  // If languages don't match, check if it's a clear mismatch
  if (expectedNormalized !== detectedNormalized) {
    // Additional check: if user said English words when expecting Chinese
    if (expectedNormalized === 'chinese' && detectedNormalized === 'english') {
      // Check if actual response is mostly English words
      const englishWordPattern = /^[a-zA-Z\s!.,?]+$/;
      return englishWordPattern.test(actual.trim());
    }

    // Check if user said Chinese when expecting English
    if (expectedNormalized === 'english' && detectedNormalized === 'chinese') {
      // Check if actual response contains Chinese characters
      const chineseCharPattern = /[\u4e00-\u9fff]/;
      return chineseCharPattern.test(actual);
    }

    return true; // Default to mismatch if languages are different
  }

  return false; // No mismatch detected
}

// Simple fallback function to calculate a score based on string similarity
function calculateSimpleScore(expected, actual, language) {
  // If expected or actual are undefined, return 0
  if (!expected || !actual) return 0;
  
  // Handle different input formats
  let expectedTexts = [];
  if (typeof expected === 'string') {
    expectedTexts.push(expected);
  } else {
    // Add all possible expected formats
    if (expected.chinese) expectedTexts.push(expected.chinese);
    if (expected.cantonese) expectedTexts.push(expected.cantonese);
    if (expected.english) expectedTexts.push(expected.english);
    if (expected.text) expectedTexts.push(expected.text);
  }
  
  const actualText = actual.toString().toLowerCase().trim();
  
  // Check against all expected formats and take the best match
  let bestScore = 0;
  
  for (const expectedText of expectedTexts) {
    const expectedLower = expectedText.toLowerCase().trim();
    
    // If they're exactly the same, return perfect score
    if (expectedLower === actualText) {
      return 1.0;
    }
    
    // Check for partial matches first (more lenient)
    if (actualText.includes(expectedLower) || expectedLower.includes(actualText)) {
      bestScore = Math.max(bestScore, 0.8);
      continue;
    }
    
    // Calculate Levenshtein distance
    const distance = levenshteinDistance(expectedLower, actualText);
    const maxLength = Math.max(expectedLower.length, actualText.length);
    
    // Avoid division by zero
    if (maxLength === 0) continue;
    
    // Convert distance to similarity score (0 to 1)
    const similarity = Math.max(0, 1 - distance / maxLength);
    
    // Be more lenient for short phrases
    if (maxLength <= 3 && similarity > 0.5) {
      bestScore = Math.max(bestScore, 0.7);
    } else if (similarity > 0.6) {
      bestScore = Math.max(bestScore, similarity);
    }
  }
  
  // Special handling for common Cantonese phrases
  if (language === 'cantonese') {
    const cantoneseMatches = {
      '你好': ['hello', 'nei hou', 'nei5 hou2', '你好'],
      '早晨': ['morning', 'zou san', 'zou2 san4', '早晨', 'good morning'],
      '多謝': ['thank', 'do ze', 'do1 ze6', '多謝', 'thanks'],
      '唔該': ['please', 'm goi', 'm4 goi1', '唔該', 'excuse me']
    };
    
    for (const [chinese, variations] of Object.entries(cantoneseMatches)) {
      if (expectedTexts.some(t => t.includes(chinese))) {
        for (const variation of variations) {
          if (actualText.includes(variation.toLowerCase()) || variation.toLowerCase().includes(actualText)) {
            bestScore = Math.max(bestScore, 0.8);
          }
        }
      }
    }
  }
  
  return bestScore;
}

// Levenshtein distance calculation
function levenshteinDistance(a, b) {
  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
}

export default router;