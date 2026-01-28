import React, { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';

const constituencies = [
  { id: 'dhaka-8', name: 'ঢাকা-৮', nameEn: 'Dhaka-8' },
  { id: 'dhaka-9', name: 'ঢাকা-৯', nameEn: 'Dhaka-9' },
  { id: 'dhaka-15', name: 'ঢাকা-১৫', nameEn: 'Dhaka-15' }
];

// Real candidates for 2026 election
const candidates = {
  'dhaka-8': [
    'মির্জা আব্বাস (বিএনপি)',
    'নাসিরউদ্দিন পাটোয়ারী (এনসিপি)',
    'কেফায়েত উল্লাহ (ইসলামী আন্দোলন)',
    'মেঘনা আলম (গণ অধিকার পরিষদ)'
  ],
  'dhaka-9': [
    'হাবিবুর রশিদ হাবিব (বিএনপি)',
    'কবির আহমেদ (জামায়াত)',
    'জাবেদ রাসিন (এনসিপি)',
    'তাসনিম জারা (স্বতন্ত্র)',
    'কাজী আবুল খায়ের (জাতীয় পার্টি)',
    'শাহ ইফতেখার আহসান (ইসলামী আন্দোলন)'
  ],
  'dhaka-15': [
    'ড. শফিকুর রহমান (জামায়াত আমীর)',
    'শফিকুল ইসলাম খান (বিএনপি)',
    'শামসুল হক (জাতীয় পার্টি)',
    'এ কে এম শফিকুল ইসলাম (গণফোরাম)',
    'আশফাকুর রহমান (জাসদ)',
    'খান শোয়েব আমান উল্লাহ (জনতার দল)'
  ]
};

const verificationQuestions = [
  {
    question: 'বাংলাদেশের জাতীয় ফুল কী?',
    options: ['শাপলা', 'গোলাপ', 'বেলি', 'জবা'],
    correct: 0
  },
  {
    question: 'বাংলাদেশের রাজধানী কোথায়?',
    options: ['চট্টগ্রাম', 'ঢাকা', 'সিলেট', 'রাজশাহী'],
    correct: 1
  },
  {
    question: 'বাংলাদেশের স্বাধীনতা দিবস কবে?',
    options: ['২১শে ফেব্রুয়ারি', '১৬ই ডিসেম্বর', '২৬শে মার্চ', '৭ই মার্চ'],
    correct: 2
  }
];

// Simple browser fingerprinting
const generateFingerprint = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.textBaseline = 'top';
  ctx.font = '14px Arial';
  ctx.fillText('fingerprint', 2, 2);
  const canvasData = canvas.toDataURL();
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasData.slice(-50)
  };
  
  return btoa(JSON.stringify(fingerprint));
};

const ElectionPoll = () => {
  const [step, setStep] = useState('select'); // select, verify, vote, results, blocked
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [verificationQ, setVerificationQ] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votes, setVotes] = useState({});
  const [fingerprint, setFingerprint] = useState('');

  useEffect(() => {
    // Load votes from localStorage
    const savedVotes = localStorage.getItem('pollVotes');
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
    
    // Generate fingerprint
    const fp = generateFingerprint();
    setFingerprint(fp);
    
    // Check if already voted
    const voted = localStorage.getItem(`voted_${fp}`);
    if (voted) {
      setStep('blocked');
    }
  }, []);

  const selectConstituency = (constituency) => {
    setSelectedConstituency(constituency);
    const randomQ = verificationQuestions[Math.floor(Math.random() * verificationQuestions.length)];
    setVerificationQ(randomQ);
    setStep('verify');
    setError('');
  };

  const verifyAnswer = () => {
    if (selectedAnswer === verificationQ.correct) {
      setStep('vote');
      setError('');
    } else {
      setError('ভুল উত্তর। অনুগ্রহ করে আবার চেষ্টা করুন।');
      setSelectedAnswer(null);
    }
  };

  const submitVote = () => {
    if (!selectedCandidate) {
      setError('অনুগ্রহ করে একজন প্রার্থী নির্বাচন করুন');
      return;
    }

    // Update votes
    const newVotes = { ...votes };
    if (!newVotes[selectedConstituency.id]) {
      newVotes[selectedConstituency.id] = {};
    }
    newVotes[selectedConstituency.id][selectedCandidate] = 
      (newVotes[selectedConstituency.id][selectedCandidate] || 0) + 1;
    
    setVotes(newVotes);
    localStorage.setItem('pollVotes', JSON.stringify(newVotes));
    localStorage.setItem(`voted_${fingerprint}`, Date.now().toString());
    
    setStep('results');
  };

  const getTotalVotes = (constituencyId) => {
    if (!votes[constituencyId]) return 0;
    return Object.values(votes[constituencyId]).reduce((a, b) => a + b, 0);
  };

  const getPercentage = (constituencyId, candidate) => {
    const total = getTotalVotes(constituencyId);
    if (total === 0) return 0;
    return ((votes[constituencyId]?.[candidate] || 0) / total * 100).toFixed(1);
  };

  if (step === 'blocked') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">আপনি ইতিমধ্যে ভোট দিয়েছেন</h2>
          <p className="text-gray-600 mb-6">প্রতি ডিভাইস থেকে একবার মাত্র ভোট দেওয়া যাবে।</p>
          <button
            onClick={() => setStep('results')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            ফলাফল দেখুন
          </button>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
              বাংলাদেশ নির্বাচন জরিপ ২০২৬
            </h1>
            <p className="text-center text-gray-600 mb-8">আপনার মতামত জানান</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {constituencies.map(constituency => (
                <button
                  key={constituency.id}
                  onClick={() => selectConstituency(constituency)}
                  className="bg-gradient-to-br from-green-500 to-red-500 text-white p-6 rounded-lg hover:shadow-lg transition transform hover:scale-105"
                >
                  <h3 className="text-2xl font-bold mb-2">{constituency.name}</h3>
                  <p className="text-sm opacity-90">{constituency.nameEn}</p>
                  <div className="mt-4 text-sm">
                    মোট ভোট: {getTotalVotes(constituency.id)}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">সব এলাকার ফলাফল</h3>
            {constituencies.map(constituency => (
              <div key={constituency.id} className="mb-6 last:mb-0">
                <h4 className="font-bold text-gray-700 mb-2">{constituency.name}</h4>
                {getTotalVotes(constituency.id) === 0 ? (
                  <p className="text-gray-500 text-sm">এখনো কোনো ভোট পড়েনি</p>
                ) : (
                  candidates[constituency.id].map(candidate => (
                    <div key={candidate} className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{candidate}</span>
                        <span className="font-bold">
                          {getPercentage(constituency.id, candidate)}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${getPercentage(constituency.id, candidate)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">যাচাইকরণ</h2>
          <p className="text-gray-600 mb-6">{selectedConstituency.name}</p>
          
          <div className="mb-6">
            <p className="text-lg font-medium text-gray-700 mb-4">{verificationQ.question}</p>
            {verificationQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswer(index)}
                className={`w-full p-3 mb-2 rounded-lg border-2 transition ${
                  selectedAnswer === index
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('select')}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              বাতিল
            </button>
            <button
              onClick={verifyAnswer}
              disabled={selectedAnswer === null}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              এগিয়ে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'vote') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">আপনার পছন্দ নির্বাচন করুন</h2>
          <p className="text-gray-600 mb-6">{selectedConstituency.name}</p>
          
          <div className="mb-6">
            {candidates[selectedConstituency.id].map((candidate, index) => (
              <button
                key={index}
                onClick={() => setSelectedCandidate(candidate)}
                className={`w-full p-4 mb-3 rounded-lg border-2 transition flex items-center justify-between ${
                  selectedCandidate === candidate
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-green-400'
                }`}
              >
                <span className="text-lg">{candidate}</span>
                {selectedCandidate === candidate && <Check className="text-green-600" />}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setStep('verify')}
              className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition"
            >
              পিছনে
            </button>
            <button
              onClick={submitVote}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
            >
              ভোট জমা দিন
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-red-50 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">ধন্যবাদ!</h2>
            <p className="text-gray-600">আপনার ভোট সফলভাবে জমা হয়েছে</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-gray-700 mb-3">{selectedConstituency.name} - বর্তমান ফলাফল</h3>
            {candidates[selectedConstituency.id].map(candidate => (
              <div key={candidate} className="mb-3 last:mb-0">
                <div className="flex justify-between text-sm mb-1">
                  <span>{candidate}</span>
                  <span className="font-bold">
                    {getPercentage(selectedConstituency.id, candidate)}% 
                    ({votes[selectedConstituency.id]?.[candidate] || 0})
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${getPercentage(selectedConstituency.id, candidate)}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-3">
              মোট ভোট: {getTotalVotes(selectedConstituency.id)}
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          >
            সব ফলাফল দেখুন
          </button>
        </div>
      </div>
    );
  }
};

export default ElectionPoll;
