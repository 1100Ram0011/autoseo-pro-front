import React, { useState, useEffect } from 'react';
import StepOneCurrentState from './StepOneCurrentState';
import StepTwoAction from './StepTwoAction';

export default function OnboardingWizard({ onComplete }) {
  // state options: 'idle', 'has_app', 'has_api', 'no_whatsapp'
  const [currentState, setCurrentState] = useState('idle');
  const [fbReady, setFbReady] = useState(false);

  useEffect(() => {
    const initFB = () => {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FB_APP_ID,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v25.0',
      });
      setFbReady(true);
    };

    if (window.FB) {
      initFB();
      return;
    }

    // Capture existing if any
    const existingInit = window.fbAsyncInit;
    window.fbAsyncInit = function() {
      initFB();
      if (typeof existingInit === 'function') {
        existingInit();
      }
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, []);

  // Back button functionality
  const handleBack = () => {
    setCurrentState('idle');
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-slate-500">
          Follow the guided steps to seamlessly connect your number.
        </p>
      </div>

      {currentState === 'idle' ? (
        <StepOneCurrentState onSelectState={setCurrentState} />
      ) : (
        <StepTwoAction 
          currentState={currentState} 
          onBack={handleBack} 
          onComplete={onComplete} 
          fbReady={fbReady}
        />
      )}
    </div>
  );
}
