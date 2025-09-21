import React, { useState, useEffect, useRef } from 'react';
import { useGameContext } from '../game/GameContext';
import { AiOutlineCloseCircle, AiOutlineSound } from 'react-icons/ai';
import { BiMicrophone, BiLoaderAlt } from 'react-icons/bi';
import { FaStop } from 'react-icons/fa';
import API_CONFIG from '../config/apiConfig';

export default function CantonseseNPCDialog({ npc, onClose }) {
  const audioRef = useRef(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentPhrase, setPhraseIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showTranslation, setShowTranslation] = useState(false);
  const [xp, setXp] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const { addPlayerXp } = useGameContext();

  // Define NPC-specific lessons
  const npcLessons = {
    'tea-master': [
      {
        title: "Basic Greetings",
        phrases: [
          {
            cantonese: "nei5 hou2",
            chinese: "你好",
            english: "Hello",
            audio: "/audio/cantonese/nei5_hou2.mp3"
          },
          {
            cantonese: "zou2 san4",
            chinese: "早晨",
            english: "Good morning",
            audio: "/audio/cantonese/zou2_san4.mp3"
          },
          {
            cantonese: "m4 goi1",
            chinese: "唔該",
            english: "Please/Excuse me",
            audio: "/audio/cantonese/m4_goi1.mp3"
          },
          {
            cantonese: "do1 ze6",
            chinese: "多謝",
            english: "Thank you",
            audio: "/audio/cantonese/do1_ze6.mp3"
          },
          {
            cantonese: "hou2 yi3 kin3",
            chinese: "好意見",
            english: "Nice to meet you",
            audio: "/audio/cantonese/hou2_yi3_kin3.mp3"
          }
        ]
      },
      {
        title: "Tea Culture",
        phrases: [
          {
            cantonese: "jat1 bui1 caa4",
            chinese: "一杯茶",
            english: "A cup of tea",
            audio: "/audio/cantonese/jat1_bui1_caa4.mp3"
          },
          {
            cantonese: "ho2 caa4",
            chinese: "好茶",
            english: "Good tea",
            audio: "/audio/cantonese/ho2_caa4.mp3"
          },
          {
            cantonese: "ngo5 soeng2 jam2 caa4",
            chinese: "我想飲茶",
            english: "I would like to drink tea",
            audio: "/audio/cantonese/ngo5_soeng2_jam2_caa4.mp3"
          },
          {
            cantonese: "gam3 dim2 aa3",
            chinese: "點添",
            english: "How about it?",
            audio: "/audio/cantonese/gam3_dim2_aa3.mp3"
          }
        ]
      }
    ],
    'dim-sum-chef': [
      {
        title: "Dim Sum Dishes",
        phrases: [
          {
            cantonese: "haa1 gaau2",
            chinese: "蝦餃",
            english: "Shrimp dumpling",
            audio: "/audio/cantonese/haa1_gaau2.mp3"
          },
          {
            cantonese: "siu1 maai5",
            chinese: "燒賣",
            english: "Pork dumpling",
            audio: "/audio/cantonese/siu1_maai5.mp3"
          },
          {
            cantonese: "caa4 siu1 baau1",
            chinese: "叉燒包",
            english: "BBQ pork bun",
            audio: "/audio/cantonese/caa4_siu1_baau1.mp3"
          },
          {
            cantonese: "daai6 gwo2",
            chinese: "大粿",
            english: "Rice noodle roll",
            audio: "/audio/cantonese/daai6_gwo2.mp3"
          }
        ]
      },
      {
        title: "Ordering Food",
        phrases: [
          {
            cantonese: "ngo5 seung2 maai5",
            chinese: "我想買",
            english: "I would like to buy",
            audio: "/audio/cantonese/ngo5_seung2_maai5.mp3"
          },
          {
            cantonese: "gei2 do1 cin2",
            chinese: "幾多錢",
            english: "How much does it cost?",
            audio: "/audio/cantonese/gei2_do1_cin2.mp3"
          },
          {
            cantonese: "ngo5 seung2 sik6",
            chinese: "我想食",
            english: "I want to eat",
            audio: "/audio/cantonese/ngo5_seung2_sik6.mp3"
          },
          {
            cantonese: "hou2 sik6",
            chinese: "好食",
            english: "Delicious",
            audio: "/audio/cantonese/hou2_sik6.mp3"
          }
        ]
      }
    ],
    'tea-server': [
      {
        title: "Tea Types",
        phrases: [
          {
            cantonese: "loeng4 caa4",
            chinese: "涼茶",
            english: "Herbal tea",
            audio: "/audio/cantonese/loeng4_caa4.mp3"
          },
          {
            cantonese: "pou3 lei4",
            chinese: "普洱",
            english: "Pu'er tea",
            audio: "/audio/cantonese/pou3_lei4.mp3"
          },
          {
            cantonese: "wung4 caa4",
            chinese: "黃茶",
            english: "Yellow tea",
            audio: "/audio/cantonese/wung4_caa4.mp3"
          },
          {
            cantonese: "hung4 caa4",
            chinese: "紅茶",
            english: "Black tea",
            audio: "/audio/cantonese/hung4_caa4.mp3"
          }
        ]
      },
      {
        title: "Restaurant Phrases",
        phrases: [
          {
            cantonese: "m4 goi1 bong1 ngo5",
            chinese: "唔該幫我",
            english: "Please help me",
            audio: "/audio/cantonese/m4_goi1_bong1_ngo5.mp3"
          },
          {
            cantonese: "gei2 do1 jan4",
            chinese: "幾多人",
            english: "How many people?",
            audio: "/audio/cantonese/gei2_do1_jan4.mp3"
          },
          {
            cantonese: "maai4 daan1",
            chinese: "埋單",
            english: "Bill please",
            audio: "/audio/cantonese/maai4_daan1.mp3"
          },
          {
            cantonese: "jau5 mou5 wai2",
            chinese: "有冇位",
            english: "Do you have a table?",
            audio: "/audio/cantonese/jau5_mou5_wai2.mp3"
          }
        ]
      }
    ],
    // Default lessons for any NPC that doesn't have specific lessons
    'default': [
      {
        title: "Basic Greetings",
        phrases: [
          {
            cantonese: "nei5 hou2",
            chinese: "你好",
            english: "Hello",
            audio: "/audio/cantonese/nei5_hou2.mp3"
          },
          {
            cantonese: "zou2 san4",
            chinese: "早晨",
            english: "Good morning",
            audio: "/audio/cantonese/zou2_san4.mp3"
          },
          {
            cantonese: "m4 goi1",
            chinese: "唔該",
            english: "Please/Excuse me",
            audio: "/audio/cantonese/m4_goi1.mp3"
          },
          {
            cantonese: "do1 ze6",
            chinese: "多謝",
            english: "Thank you",
            audio: "/audio/cantonese/do1_ze6.mp3"
          },
          {
            cantonese: "hou2 yi3 kin3",
            chinese: "好意見",
            english: "Nice to meet you",
            audio: "/audio/cantonese/hou2_yi3_kin3.mp3"
          }
        ]
      },
      {
        title: "Ordering Food",
        phrases: [
          {
            cantonese: "ngo5 seung2 maai5",
            chinese: "我想買",
            english: "I would like to buy",
            audio: "/audio/cantonese/ngo5_seung2_maai5.mp3"
          },
          {
            cantonese: "gei2 do1 cin2",
            chinese: "幾多錢",
            english: "How much does it cost?",
            audio: "/audio/cantonese/gei2_do1_cin2.mp3"
          },
          {
            cantonese: "ngo5 seung2 sik6",
            chinese: "我想食",
            english: "I want to eat",
            audio: "/audio/cantonese/ngo5_seung2_sik6.mp3"
          },
          {
            cantonese: "hou2 sik6",
            chinese: "好食",
            english: "Delicious",
            audio: "/audio/cantonese/hou2_sik6.mp3"
          }
        ]
      }
    ]
  };

  useEffect(() => {
    // Get the lessons for this specific NPC or use default if not found
    const lessonsForNpc = npcLessons[npc.id] || npcLessons['default'];
    setCurrentLesson(lessonsForNpc[0]);
  }, [npc.id]);

  // Initialize speech recognition
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setAudioStream(stream);
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
    }

    return () => {
      // Clean up microphone access when component unmounts
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const playAudio = async (text, language = 'yue-HK') => {
    try {
      setIsProcessing(true);
      
      // Choose appropriate voice based on language
      let voiceId = 'Hiujin'; // Cantonese female voice
      
      if (language === 'cmn-CN') {
        voiceId = 'Zhiyu'; // Mandarin female voice
      } else if (language === 'ms-MY') {
        voiceId = 'Kendra'; // No specific Malaysian voice, using neutral voice
      }
      
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voiceId: voiceId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (error) {
      console.error('Error playing audio with API:', error);
      
      // Try browser's built-in TTS as fallback
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to find a voice that matches the language
        const voices = window.speechSynthesis.getVoices();
        const languageCode = language.split('-')[0]; // Extract main language code (e.g., 'yue' from 'yue-HK')
        
        // Find a matching voice or use default
        const voice = voices.find(v => v.lang.startsWith(languageCode)) || 
                      voices.find(v => v.lang.includes('zh')) || // Try any Chinese voice as fallback for Cantonese
                      voices[0]; // Use default voice as last resort
          
        if (voice) {
          utterance.voice = voice;
        }
        
        window.speechSynthesis.speak(utterance);
      } catch (speechError) {
        console.error('Fallback speech synthesis failed:', speechError);
        // Final fallback - show an alert with the text
        alert(`Cannot play audio. Text: ${text}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!audioStream) {
      console.error('No audio stream available');
      return;
    }

    setIsListening(true);
    setTranscriptText('');

    const recorder = new MediaRecorder(audioStream, {
      mimeType: 'audio/webm',
      audioBitsPerSecond: 16000
    });
    setMediaRecorder(recorder);

    const allChunks = [];
    setAudioChunks(allChunks);

    // Collect audio chunks without live transcription interference
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        allChunks.push(e.data);
        
        // Show simple recording indicator instead of inaccurate live transcription
        setTranscriptText('🎤 Recording... speak now');
      }
    };

    recorder.onstop = async () => {
      setIsListening(false);
      setIsProcessing(true);

      try {
        // Create final audio blob from all chunks
        const finalAudioBlob = new Blob(allChunks, { type: 'audio/webm' });
        console.log('Final audio blob size:', finalAudioBlob.size);

        // Show processing state
        setTranscriptText('Processing your speech...');

        // Send complete audio for accurate transcription
        const formData = new FormData();
        formData.append('audio', finalAudioBlob, 'final-speech.webm');
        formData.append('languageCode', 'zh-HK');
        
        // Add context about what the user is trying to say
        if (currentLesson && currentLesson.phrases && currentLesson.phrases[currentPhrase]) {
          const currentPhraseObj = currentLesson.phrases[currentPhrase];
          formData.append('expectedPhrase', JSON.stringify({
            chinese: currentPhraseObj.chinese,
            cantonese: currentPhraseObj.cantonese,
            english: currentPhraseObj.english
          }));
        }

        const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/speech-to-text`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe speech');
        }

        const { jobName, isMock } = await response.json();
        console.log('Transcription job started:', { jobName, isMock });

        // Wait for final transcription to complete
        const transcriptionResult = await checkTranscriptionStatus(jobName, isMock);

        // Only check pronunciation after we have the accurate final transcript
        console.log('Using transcription result for pronunciation check:', transcriptionResult);
        
        // Small delay to ensure transcript is properly set
        setTimeout(async () => {
          await checkPronunciation(transcriptionResult);
        }, 500);

      } catch (error) {
        console.error('Error during final transcription:', error);
        setTranscriptText('Error processing transcription');
        setIsProcessing(false);
      }
    };

    // Start recording - collect chunks but don't do live transcription
    recorder.start(1000); // Still use time slicing for better audio quality
  };

  const stopListening = () => {
    if (mediaRecorder && isListening) {
      mediaRecorder.stop();
    }
  };

  const checkTranscriptionStatus = async (jobName, isMock = false) => {
    const maxAttempts = isMock ? 3 : 30; // Shorter wait for mock jobs
    const delay = isMock ? 1000 : 2000; // 1s for mock, 2s for real jobs

    console.log(`Starting transcription status check for job: ${jobName}, isMock: ${isMock}`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const url = isMock
          ? `${API_CONFIG.API_BASE_URL}/api/speech-to-text/job/${jobName}?isMock=true`
          : `${API_CONFIG.API_BASE_URL}/api/speech-to-text/job/${jobName}`;

        const response = await fetch(url);
        const result = await response.json();

        console.log(`Transcription attempt ${attempt + 1}:`, result);

        if (result.TranscriptionJob && result.TranscriptionJob.TranscriptionJobStatus === 'COMPLETED') {
          let transcript = null;
          let detectedLang = null;
          
          // Extract detected language from the result
          if (result.detectedLanguage) {
            detectedLang = result.detectedLanguage;
          }
          
          // Handle our intelligent transcription response format
          if (result.results && result.results.transcripts) {
            // Our backend returns: { results: { transcripts: "你好" } }
            if (typeof result.results.transcripts === 'string') {
              transcript = result.results.transcripts;
            } else if (Array.isArray(result.results.transcripts) && result.results.transcripts.length > 0) {
              // Handle array format: { results: { transcripts: [{ transcript: "你好" }] } }
              transcript = result.results.transcripts[0]?.transcript || result.results.transcripts[0];
            }
          }
          
          // Fallback: Try direct transcript field
          if (!transcript && result.transcript) {
            transcript = result.transcript;
          }
          
          // Fallback: Try original AWS format (legacy compatibility)
          if (!transcript && result.TranscriptionJob.Transcript) {
            if (result.TranscriptionJob.Transcript.results?.transcripts?.[0]?.transcript) {
              transcript = result.TranscriptionJob.Transcript.results.transcripts[0].transcript;
            }
          }
          
          // Fallback: Try message format
          if (!transcript && result.message && result.transcription) {
            transcript = result.transcription;
          }

          const finalTranscript = transcript || 'No transcription available';
          const finalDetectedLanguage = detectedLang || 'unknown';
          
          console.log('Final transcript extracted:', finalTranscript);
          console.log('Detected language:', finalDetectedLanguage);
          console.log('From result structure:', JSON.stringify(result, null, 2));
          
          setTranscriptText(finalTranscript);
          setDetectedLanguage(finalDetectedLanguage);
          setIsProcessing(false);
          
          return {
            transcript: finalTranscript,
            detectedLanguage: finalDetectedLanguage
          };
          
        } else if (result.TranscriptionJob && result.TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
          console.error('Transcription job failed:', result.TranscriptionJob.FailureReason);
          setTranscriptText('Transcription failed');
          setDetectedLanguage('unknown');
          setIsProcessing(false);
          return {
            transcript: 'Transcription failed',
            detectedLanguage: 'unknown'
          };
        }

        // Check for direct transcription response (for mock responses)
        if (result.message && result.transcription) {
          console.log('Direct transcription response:', result.transcription);
          const detectedLang = result.detectedLanguage || 'unknown';
          setTranscriptText(result.transcription);
          setDetectedLanguage(detectedLang);
          setIsProcessing(false);
          return {
            transcript: result.transcription,
            detectedLanguage: detectedLang
          };
        }

        // Wait before next attempt
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Transcription polling attempt ${attempt + 1} failed:`, error);
        if (attempt === maxAttempts - 1) {
          setTranscriptText('Error checking transcription status');
          setDetectedLanguage('unknown');
          setIsProcessing(false);
          return {
            transcript: 'Error checking transcription status',
            detectedLanguage: 'unknown'
          };
        }
      }
    }

    const timeoutMessage = 'Transcription timeout - please try again';
    setTranscriptText(timeoutMessage);
    setDetectedLanguage('unknown');
    setIsProcessing(false);
    return {
      transcript: timeoutMessage,
      detectedLanguage: 'unknown'
    };
  };

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson);
    setPhraseIndex(0);
    setFeedback('');
    setShowTranslation(false);
    setTranscriptText('');
    setUserInput('');
  };

  const handleNextPhrase = () => {
    if (currentPhrase < currentLesson.phrases.length - 1) {
      setPhraseIndex(currentPhrase + 1);
      setFeedback('');
      setShowTranslation(false);
      setTranscriptText('');
      setUserInput('');
    }
  };

  const handlePreviousPhrase = () => {
    if (currentPhrase > 0) {
      setPhraseIndex(currentPhrase - 1);
      setFeedback('');
      setShowTranslation(false);
      setTranscriptText('');
      setUserInput('');
    }
  };

  const checkPronunciation = async (transcriptionResult = null) => {
    const currentPhraseObj = currentLesson.phrases[currentPhrase];
    
    // Get the actual transcribed text and detected language
    let userSaid = '';
    let actualDetectedLanguage = 'unknown';
    
    if (transcriptionResult) {
      userSaid = transcriptionResult.transcript || '';
      actualDetectedLanguage = transcriptionResult.detectedLanguage || 'unknown';
    } else {
      // Fallback to component state
      userSaid = transcriptText || userInput;
      actualDetectedLanguage = detectedLanguage || 'unknown';
    }
    
    userSaid = userSaid.toLowerCase().trim();
    
    if (!userSaid) {
      setFeedback('Please speak or type something first.');
      return;
    }
    
    console.log('Checking pronunciation with:', {
      userSaid,
      actualDetectedLanguage,
      expected: currentPhraseObj
    });
    
    setIsProcessing(true);
    
    try {
      // Use Bedrock for more sophisticated language analysis
      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/check-pronunciation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expected: {
            cantonese: currentPhraseObj.cantonese,
            chinese: currentPhraseObj.chinese,
            english: currentPhraseObj.english
          },
          actual: userSaid,
          language: 'cantonese', // Keep the context language
          detectedLanguage: actualDetectedLanguage // Pass the actual detected language
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to check pronunciation');
      }
      
      const data = await response.json();
      
      // Parse the model's assessment
      const { score, feedback: modelFeedback } = data;
      
      if (score > 0.7) {
        setFeedback(`Great job! ${modelFeedback || 'Your pronunciation sounds good.'}`);
        const earnedXp = Math.round(score * 15); // Up to 15 XP based on quality
        setXp(prevXp => prevXp + earnedXp);
        addPlayerXp(earnedXp);
      } else if (score > 0.4) {
        setFeedback(`Good try! ${modelFeedback || 'Keep practicing for better pronunciation.'}`);
        const earnedXp = 5;
        setXp(prevXp => prevXp + earnedXp);
        addPlayerXp(earnedXp);
      } else {
        setFeedback(`Try again! ${modelFeedback || 'Listen carefully to the pronunciation.'}`);
      }
    } catch (error) {
      console.error('Error checking pronunciation with backend API:', error);
      
      // Use basic string matching as fallback
      const userWords = userSaid.toLowerCase().split(/\s+/);
      const expectedCantonese = currentPhraseObj.cantonese.toLowerCase().split(/\s+/);
      const expectedEnglish = currentPhraseObj.english.toLowerCase().split(/\s+/);
      
      // Count matching words
      let cantoneseMatches = 0;
      let englishMatches = 0;
      
      // Check for Cantonese matches
      userWords.forEach(word => {
        if (expectedCantonese.some(expected => 
          expected === word || 
          expected.includes(word) ||
          word.includes(expected)
        )) {
          cantoneseMatches++;
        }
      });
      
      // Check for English matches
      userWords.forEach(word => {
        if (expectedEnglish.some(expected => 
          expected === word || 
          expected.includes(word) ||
          word.includes(expected)
        )) {
          englishMatches++;
        }
      });
      
      // Calculate match percentage
      const cantoneseMatchPct = expectedCantonese.length > 0 ? cantoneseMatches / expectedCantonese.length : 0;
      const englishMatchPct = expectedEnglish.length > 0 ? englishMatches / expectedEnglish.length : 0;
      const bestMatchPct = Math.max(cantoneseMatchPct, englishMatchPct);
      
      if (bestMatchPct >= 0.7) {
        setFeedback('Great job! Your pronunciation sounds good.');
        const earnedXp = 10;
        setXp(prevXp => prevXp + earnedXp);
        addPlayerXp(earnedXp);
      } else if (bestMatchPct >= 0.3) {
        setFeedback('Good try! Keep practicing for better pronunciation.');
        const earnedXp = 5;
        setXp(prevXp => prevXp + earnedXp);
        addPlayerXp(earnedXp);
      } else {
        setFeedback('Try again! Listen carefully to the pronunciation.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!currentLesson) return null;

  // Get lessons to display in the UI
  const lessonsToShow = npcLessons[npc.id] || npcLessons['default'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <audio ref={audioRef} className="hidden" />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Learning with {npc.name}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <AiOutlineCloseCircle size={24} />
          </button>
        </div>
        
        <div className="flex mb-4 overflow-x-auto pb-2">
          {lessonsToShow.map((lesson, index) => (
            <button
              key={index}
              onClick={() => handleLessonSelect(lesson)}
              className={`px-4 py-2 rounded-full mr-2 whitespace-nowrap ${
                currentLesson === lesson
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {lesson.title}
            </button>
          ))}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">{currentLesson.title}</h3>
            <span className="text-green-600 font-medium">XP: {xp}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="text-2xl font-bold mr-2">
                {currentLesson.phrases[currentPhrase].chinese}
              </span>
              <button
                onClick={() => playAudio(currentLesson.phrases[currentPhrase].chinese, 'yue-HK')}
                disabled={isProcessing}
                className={`p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? <BiLoaderAlt size={20} className="animate-spin" /> : <AiOutlineSound size={20} />}
              </button>
            </div>
            
            <div className="text-lg mb-1">
              {currentLesson.phrases[currentPhrase].cantonese} 
              <span className="text-gray-500 ml-2">(romanization)</span>
            </div>
            
            {showTranslation && (
              <div className="text-lg text-gray-600">
                {currentLesson.phrases[currentPhrase].english}
              </div>
            )}
            
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-blue-500 hover:underline mt-1"
            >
              {showTranslation ? 'Hide translation' : 'Show translation'}
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <span className="mr-2">Your response:</span>
              <div className="flex space-x-2">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    disabled={isProcessing}
                    className={`p-2 rounded-full bg-blue-500 text-white ${
                      isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                  >
                    <BiMicrophone size={20} />
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    <FaStop size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="border rounded p-2 min-h-[50px] mb-2">
              {isProcessing ? (
                <div className="flex items-center justify-center text-gray-500">
                  <BiLoaderAlt size={20} className="animate-spin mr-2" />
                  Processing...
                </div>
              ) : transcriptText || userInput ? (
                <span>{transcriptText || userInput}</span>
              ) : (
                <span className="text-gray-400">Speak or type your answer...</span>
              )}
            </div>
            
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Or type your answer here"
              className="w-full p-2 border rounded mb-2"
            />
            
            {feedback && (
              <div className={`p-2 rounded ${
                feedback.includes('Great') ? 'bg-green-100 text-green-800' : 
                feedback.includes('Good') ? 'bg-blue-100 text-blue-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {feedback}
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePreviousPhrase}
              disabled={currentPhrase === 0 || isProcessing}
              className={`px-4 py-2 rounded ${
                currentPhrase === 0 || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={() => checkPronunciation()}
              disabled={isProcessing}
              className={`px-4 py-2 bg-green-500 text-white rounded ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
              }`}
            >
              {isProcessing ? <BiLoaderAlt size={20} className="animate-spin" /> : 'Check'}
            </button>
            
            <button
              onClick={handleNextPhrase}
              disabled={currentPhrase === currentLesson.phrases.length - 1 || isProcessing}
              className={`px-4 py-2 rounded ${
                currentPhrase === currentLesson.phrases.length - 1 || isProcessing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}