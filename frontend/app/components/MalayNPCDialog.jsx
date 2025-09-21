"use client";

import React, { useState, useEffect, useRef } from "react";
import API_CONFIG from '../config/apiConfig';

const MalayNPCDialog = ({ npc, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState("greeting");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  
  // Store feedback history for each lesson
  const [feedbackHistory, setFeedbackHistory] = useState({});
  const [attemptCount, setAttemptCount] = useState({});
  
  // Audio recording state
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Define lessons for different NPCs
  const getLessons = (npcId) => {
    const lessons = {
      "fruit-vendor": [
        {
          id: "morning-greeting",
          title: "Morning Market Greeting",
          phrase: "Selamat pagi, pakcik!",
          meaning: "Good morning, uncle!",
          pronunciation: "seh-lah-maht PAH-gee, PAHK-chik",
          context: "Respectful way to greet an older fruit vendor in the morning.",
        },
        {
          id: "fruit-inquiry",
          title: "Asking About Freshness",
          phrase: "Buah mangga ni fresh tak?",
          meaning: "Are these mangoes fresh?",
          pronunciation: "BOO-ah MAHNG-gah nee fresh tahk",
          context: "Important to check freshness when buying tropical fruits.",
        },
        {
          id: "price-negotiation",
          title: "Price Negotiation",
          phrase: "Lima ringgit boleh tak?",
          meaning: "Can you do five ringgit?",
          pronunciation: "LEE-mah RING-git BOH-leh tahk",
          context: "Direct but polite way to negotiate price at wet markets.",
        },
        {
          id: "fruit-selection",
          title: "Selecting Ripe Fruit",
          phrase: "Yang mana masak sikit?",
          meaning: "Which ones are a bit ripe?",
          pronunciation: "yahng MAH-nah MAH-sahk SEE-kit",
          context: "Asking for fruit that's ready to eat soon.",
        },
        {
          id: "bulk-buying",
          title: "Buying in Bulk",
          phrase: "Kalau beli banyak, ada diskaun tak?",
          meaning: "If I buy a lot, is there a discount?",
          pronunciation: "KAH-lau BEH-lee bahn-yahk, AH-dah dis-KAHN tahk",
          context: "Common practice to ask for bulk discounts at markets.",
        },
        {
          id: "payment-thanks",
          title: "Payment and Thanks",
          phrase: "Terima kasih, pakcik. Jumpa lagi!",
          meaning: "Thank you, uncle. See you again!",
          pronunciation: "teh-ree-mah KAH-see, PAHK-chik. JOOM-pah LAH-gee",
          context: "Polite way to end transaction and maintain relationship.",
        },
      ],
      "satay-man": [
        {
          id: "ordering-food",
          title: "Ordering Satay",
          phrase: "Saya nak sepuluh cucuk satay ayam",
          meaning: "I want ten sticks of chicken satay",
          pronunciation: "SAH-yah nahk seh-POO-looh CHOO-chook SAH-tay AH-yahm",
          context: "How to order satay at a street food stall.",
        },
        {
          id: "asking-spicy",
          title: "Asking About Spiciness",
          phrase: "Ada pedas tak?",
          meaning: "Is it spicy?",
          pronunciation: "AH-dah PEH-dahs tahk",
          context: "Important to ask if you're sensitive to spicy food.",
        },
        {
          id: "payment",
          title: "Making Payment",
          phrase: "Berapa semua sekali?",
          meaning: "How much for everything?",
          pronunciation: "beh-rah-pah seh-moo-ah seh-kah-lee",
          context: "Asking for the total bill.",
        },
      ],
      "clothes-seller": [
        {
          id: "shopping-greeting",
          title: "Shopping Greeting",
          phrase: "Nak cari apa?",
          meaning: "What are you looking for?",
          pronunciation: "nahk CHAH-ree AH-pah",
          context: "Common question from shopkeepers.",
        },
        {
          id: "size-inquiry",
          title: "Asking About Size",
          phrase: "Ada saiz besar tak?",
          meaning: "Do you have a larger size?",
          pronunciation: "AH-dah SAH-eez beh-SAHR tahk",
          context: "Useful when shopping for clothes.",
        },
        {
          id: "trying-on",
          title: "Trying On Clothes",
          phrase: "Boleh cuba tak?",
          meaning: "Can I try it on?",
          pronunciation: "BOH-leh CHOO-bah tahk",
          context: "Asking permission to try on clothes.",
        },
      ],
      "kopitiam-uncle": [
        {
          id: "kopitiam-greeting",
          title: "Kopitiam Greeting",
          phrase: "Pagi, uncle! Ada meja kosong tak?",
          meaning: "Morning, uncle! Is there an empty table?",
          pronunciation: "PAH-gee, uncle! AH-dah MEH-jah KOH-song tahk",
          context: "Typical greeting when entering a busy kopitiam.",
        },
        {
          id: "coffee-order",
          title: "Traditional Coffee Order",
          phrase: "Satu kopi-o kosong, kurang manis",
          meaning: "One black coffee with no sugar, less sweet",
          pronunciation: "SAH-too KOH-pee-oh KOH-song, KOO-rahng MAH-nees",
          context: "Specific way to order coffee exactly how you want it.",
        },
        {
          id: "egg-order",
          title: "Ordering Soft-Boiled Eggs",
          phrase: "Dua biji telur separuh masak",
          meaning: "Two soft-boiled eggs",
          pronunciation: "DOO-ah BEE-jee TEH-loor seh-pah-ROOH MAH-sahk",
          context: "Classic kopitiam breakfast - soft-boiled eggs with soy sauce.",
        },
        {
          id: "toast-preference",
          title: "Toast Customization",
          phrase: "Roti bakar kaya mentega, jangan gosong",
          meaning: "Kaya butter toast, don't burn it",
          pronunciation: "ROH-tee BAH-kahr KAH-yah men-TEH-gah, jah-NGAHN GOH-song",
          context: "Asking for perfectly toasted bread with kaya and butter.",
        },
        {
          id: "newspaper-chat",
          title: "Morning Small Talk",
          phrase: "Uncle, apa khabar hari ni?",
          meaning: "Uncle, how are things today?",
          pronunciation: "uncle, AH-pah KAH-bahr HAH-ree nee",
          context: "Friendly small talk while waiting for food - kopitiam culture.",
        },
        {
          id: "table-sharing",
          title: "Asking to Share Table",
          phrase: "Boleh duduk sini tak? Penuh lah",
          meaning: "Can I sit here? It's full elsewhere",
          pronunciation: "BOH-leh DOO-dook SEE-nee tahk? peh-NOOH lah",
          context: "Common practice to share tables in busy kopitiams.",
        },
        {
          id: "payment-casual",
          title: "Casual Payment",
          phrase: "Uncle, berapa semua? Saya bayar dulu",
          meaning: "Uncle, how much total? I'll pay first",
          pronunciation: "uncle, beh-rah-pah seh-moo-ah? SAH-yah BAH-yahr DOO-loo",
          context: "Informal but respectful way to ask for the bill and pay.",
        },
      ],
      "nasi-lemak-chef": [
        {
          id: "specialty-dish",
          title: "Asking About Specialty",
          phrase: "Apa keistimewaan nasi lemak di sini?",
          meaning: "What's special about the nasi lemak here?",
          pronunciation: "AH-pah kay-ees-tee-meh-wah-ahn NAH-see leh-MAHK dee SEE-nee",
          context: "Learning about local specialties.",
        },
        {
          id: "spice-level",
          title: "Spice Preference",
          phrase: "Saya tak suka pedas",
          meaning: "I don't like spicy food",
          pronunciation: "SAH-yah tahk SOO-kah PEH-dahs",
          context: "Important dietary preference to communicate.",
        },
        {
          id: "compliment-food",
          title: "Complimenting Food",
          phrase: "Sedap sangat!",
          meaning: "Very delicious!",
          pronunciation: "seh-DAHP SAH-ngaht",
          context: "Expressing appreciation for good food.",
        },
      ],
    };

    // Handle alternative NPC IDs that should use the same lessons
    const npcMapping = {
      "fruit-seller": "fruit-vendor",
      "fruit-stall-owner": "fruit-vendor", 
      "kopitiam-owner": "kopitiam-uncle",
      "coffee-shop-uncle": "kopitiam-uncle"
    };

    const mappedNpcId = npcMapping[npcId] || npcId;
    return lessons[mappedNpcId] || lessons["fruit-vendor"];
  };

  const currentLessons = getLessons(npc?.id);
  const currentLesson = currentLessons[lessonProgress];

  const startRecording = async () => {
    try {
      setIsRecording(true);
      setTranscript("");
      setFeedback("");
      setShowFeedback(false);
      setIsProcessing(false);
      
      // Reset audio chunks
      audioChunksRef.current = [];
      setAudioChunks([]);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      });

      mediaRecorderRef.current = recorder;
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        console.log('Recording stopped, processing transcription...');
        await processFinalTranscription();
        
        // Clean up media stream
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording - collect chunks but don't do live transcription
      recorder.start(1000); // Still use time slicing for better audio quality
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processFinalTranscription = async () => {
    try {
      if (audioChunksRef.current.length === 0) {
        console.warn('No audio chunks to process');
        setIsProcessing(false);
        return;
      }

      console.log('Creating final audio blob from', audioChunksRef.current.length, 'chunks');
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
      
      // Create FormData and append the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, `malay-pronunciation-${Date.now()}.webm`);
      
      // Add expected phrase data for pronunciation checking
      if (currentLesson) {
        formData.append('expectedPhrase', JSON.stringify({
          phrase: currentLesson.phrase,
          meaning: currentLesson.meaning,
          pronunciation: currentLesson.pronunciation
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
      setTranscript('Error processing transcription');
      setIsProcessing(false);
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
            setDetectedLanguage(detectedLang);
          }
          
          // Handle our intelligent transcription response format
          if (result.results && result.results.transcripts) {
            // Our backend returns: { results: { transcripts: "Selamat pagi" } }
            if (typeof result.results.transcripts === 'string') {
              transcript = result.results.transcripts;
            } else if (Array.isArray(result.results.transcripts) && result.results.transcripts.length > 0) {
              // Handle array format: { results: { transcripts: [{ transcript: "Selamat pagi" }] } }
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
          
          console.log('Final extracted transcript:', transcript);
          console.log('Final detected language:', detectedLang);
          
          if (transcript) {
            setTranscript(transcript);
            return {
              transcript,
              detectedLanguage: detectedLang,
              isCompleted: true
            };
          } else {
            console.warn('No transcript found in completed job');
            return null;
          }
        } else if (result.TranscriptionJob && result.TranscriptionJob.TranscriptionJobStatus === 'FAILED') {
          throw new Error(`Transcription failed: ${result.TranscriptionJob.FailureReason}`);
        }

        // Job still in progress, wait before next attempt
        if (attempt < maxAttempts - 1) {
          console.log(`Job still in progress, waiting ${delay}ms before next check...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Error checking transcription status (attempt ${attempt + 1}):`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        // Wait before retrying on error
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Transcription timeout - max attempts reached');
  };

  const checkPronunciation = async (transcriptionResult) => {
    try {
      console.log('Checking pronunciation with:', {
        transcript: transcriptionResult.transcript,
        expected: currentLesson.phrase,
        detectedLanguage: transcriptionResult.detectedLanguage
      });

      const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/check-pronunciation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expected: {
            phrase: currentLesson.phrase,
            meaning: currentLesson.meaning,
            pronunciation: currentLesson.pronunciation
          },
          actual: transcriptionResult.transcript,
          language: "malay",
          detectedLanguage: transcriptionResult.detectedLanguage
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check pronunciation");
      }

      const data = await response.json();
      
      // Store the feedback in history before displaying
      const lessonKey = `${lessonProgress}-${currentLesson.id}`;
      const currentAttempt = (attemptCount[lessonKey] || 0) + 1;
      
      // Store in feedback history
      setFeedbackHistory(prev => ({
        ...prev,
        [lessonKey]: {
          ...prev[lessonKey],
          [currentAttempt]: {
            transcript: transcriptionResult.transcript,
            detectedLanguage: transcriptionResult.detectedLanguage,
            feedback: data.feedback,
            score: data.score,
            timestamp: new Date().toLocaleTimeString(),
            attempt: currentAttempt
          }
        }
      }));
      
      // Update attempt count
      setAttemptCount(prev => ({
        ...prev,
        [lessonKey]: currentAttempt
      }));
      
      setFeedback(data.feedback);
      setShowFeedback(true);
      setIsProcessing(false);

      // DO NOT auto-advance - user must click Next manually
      // Removed: automatic progression logic
    } catch (error) {
      console.error("Error checking pronunciation:", error);
      setFeedback("Error checking pronunciation. Please try again.");
      setShowFeedback(true);
      setIsProcessing(false);
    }
  };

  const nextLesson = () => {
    if (lessonProgress < currentLessons.length - 1) {
      setLessonProgress(lessonProgress + 1);
      setTranscript("");
      setFeedback("");
      setShowFeedback(false);
      // Keep feedback history and attempt counts
    } else {
      setCurrentStep("completed");
    }
  };

  const previousLesson = () => {
    if (lessonProgress > 0) {
      setLessonProgress(lessonProgress - 1);
      setTranscript("");
      setFeedback("");
      setShowFeedback(false);
      // Keep feedback history and attempt counts
    }
  };

  const resetDialog = () => {
    setCurrentStep("greeting");
    setLessonProgress(0);
    setTranscript("");
    setFeedback("");
    setShowFeedback(false);
    setFeedbackHistory({});
    setAttemptCount({});
  };

  // Get current lesson's feedback history
  const getCurrentLessonHistory = () => {
    const lessonKey = `${lessonProgress}-${currentLesson?.id}`;
    return feedbackHistory[lessonKey] || {};
  };

  if (!isOpen || !npc) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">{npc.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {currentStep === "greeting" && (
          <div className="space-y-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <p className="text-gray-700 italic">"{npc.greeting}"</p>
            </div>
            <div className="text-center">
              <button
                onClick={() => setCurrentStep("lesson")}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Start Learning Malay!
              </button>
            </div>
          </div>
        )}

        {currentStep === "lesson" && currentLesson && (
          <div className="space-y-4">
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">{currentLesson.title}</h3>
              <div className="space-y-2">
                <p className="text-xl font-semibold text-blue-600">
                  {currentLesson.phrase}
                </p>
                <p className="text-gray-600">Meaning: {currentLesson.meaning}</p>
                <p className="text-gray-500 text-sm">
                  Pronunciation: {currentLesson.pronunciation}
                </p>
                <p className="text-gray-700 text-sm italic">
                  {currentLesson.context}
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Try pronouncing the phrase above:
              </p>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`px-6 py-3 rounded-full text-white font-semibold ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600"
                    : isProcessing
                    ? "bg-gray-400"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isRecording
                  ? "🎤 Recording... (tap to stop)"
                  : isProcessing
                  ? "Processing..."
                  : "🎤 Start Recording"}
              </button>

              {transcript && (
                <div className="bg-gray-100 p-3 rounded">
                  <p className="text-sm text-gray-600">You said:</p>
                  <p className="font-semibold">{transcript}</p>
                  {detectedLanguage && (
                    <p className="text-xs text-gray-500">
                      Detected: {detectedLanguage}
                    </p>
                  )}
                </div>
              )}

              {showFeedback && (
                <div className="bg-yellow-100 p-3 rounded">
                  <p className="text-sm font-medium">{feedback}</p>
                </div>
              )}

              {/* Feedback History Section */}
              {Object.keys(getCurrentLessonHistory()).length > 0 && (
                <div className="bg-gray-50 p-3 rounded">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Previous Attempts ({Object.keys(getCurrentLessonHistory()).length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.values(getCurrentLessonHistory())
                      .sort((a, b) => a.attempt - b.attempt)
                      .map((attempt, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium">Attempt {attempt.attempt}</span>
                          <span className="text-gray-500">{attempt.timestamp}</span>
                        </div>
                        {attempt.transcript && (
                          <p className="text-gray-600">Said: "{attempt.transcript}"</p>
                        )}
                        {attempt.detectedLanguage && (
                          <p className="text-gray-500">Detected: {attempt.detectedLanguage}</p>
                        )}
                        <p className="text-gray-700 mt-1">{attempt.feedback}</p>
                        {attempt.score && (
                          <p className="text-gray-600">Score: {Math.round(attempt.score * 100)}%</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={previousLesson}
                disabled={lessonProgress === 0}
                className="text-sm text-blue-500 hover:text-blue-700 disabled:text-gray-400"
              >
                ← Previous
              </button>
              
              <div className="flex items-center space-x-2">
                {showFeedback && (
                  <button
                    onClick={() => {
                      setTranscript("");
                      setFeedback("");
                      setShowFeedback(false);
                    }}
                    className="text-sm text-green-500 hover:text-green-700 px-2 py-1 rounded border border-green-300"
                  >
                    Try Again
                  </button>
                )}
                <span className="text-sm text-gray-500">
                  {lessonProgress + 1} / {currentLessons.length}
                </span>
              </div>
              
              <button
                onClick={nextLesson}
                disabled={lessonProgress === currentLessons.length - 1}
                className="text-sm text-blue-500 hover:text-blue-700 disabled:text-gray-400"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {currentStep === "completed" && (
          <div className="text-center space-y-4">
            <div className="bg-green-100 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Tahniah! Congratulations!
              </h3>
              <p className="text-gray-700">
                You've completed all lessons with {npc.name}! Your Malay is improving!
              </p>
            </div>
            <div className="space-x-3">
              <button
                onClick={resetDialog}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Practice Again
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MalayNPCDialog;