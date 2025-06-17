import React, { useRef, forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  size?: 'normal' | 'compact';
  theme?: 'light' | 'dark';
}

export interface HCaptchaRef {
  resetCaptcha: () => void;
  execute: () => void;
}

const HCaptchaComponent = forwardRef<HCaptchaRef, HCaptchaComponentProps>(
  ({ onVerify, onError, onExpire, size = 'normal', theme = 'light' }, ref) => {
    const captchaRef = useRef<HCaptcha>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Get the site key from environment variables
    const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001';

    useEffect(() => {
      console.log('hCaptcha Debug Info:');
      console.log('Site Key:', siteKey);
      console.log('Environment:', import.meta.env.MODE);
      console.log('All env vars:', import.meta.env);
      
      setDebugInfo(`Site Key: ${siteKey.substring(0, 8)}...`);
    }, [siteKey]);

    useImperativeHandle(ref, () => ({
      resetCaptcha: () => {
        console.log('Resetting hCaptcha');
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
      },
      execute: () => {
        console.log('Executing hCaptcha');
        if (captchaRef.current) {
          captchaRef.current.execute();
        }
      }
    }));

    const handleVerify = (token: string) => {
      console.log('hCaptcha verified successfully:', token.substring(0, 20) + '...');
      onVerify(token);
    };

    const handleError = (error: any) => {
      console.error('hCaptcha error:', error);
      setDebugInfo(`Error: ${error}`);
      if (onError) {
        onError(error);
      }
    };

    const handleExpire = () => {
      console.log('hCaptcha expired');
      if (onExpire) {
        onExpire();
      }
    };

    const handleLoad = () => {
      console.log('hCaptcha loaded successfully');
      setIsLoaded(true);
    };

    if (!siteKey || siteKey === 'your_hcaptcha_site_key_here') {
      return (
        <div className="flex flex-col items-center justify-center my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">⚠️ hCaptcha Configuration Error</p>
          <p className="text-red-500 text-xs mt-1">
            Please set VITE_HCAPTCHA_SITE_KEY in your .env file
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Using test key: 10000000-ffff-ffff-ffff-000000000001
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center my-4">
        <div className="mb-2">
          <HCaptcha
            ref={captchaRef}
            sitekey={siteKey}
            onVerify={handleVerify}
            onError={handleError}
            onExpire={handleExpire}
            onLoad={handleLoad}
            size={size}
            theme={theme}
          />
        </div>
        
        {/* Debug Information */}
        <div className="text-xs text-gray-500 text-center mt-2">
          <p>Debug: {debugInfo}</p>
          <p>Status: {isLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
          <p>Mode: {import.meta.env.MODE}</p>
        </div>
        
        {!isLoaded && (
          <div className="mt-2 text-xs text-gray-500">
            <p>If CAPTCHA doesn't load:</p>
            <ul className="list-disc list-inside text-left">
              <li>Check your internet connection</li>
              <li>Disable ad blockers</li>
              <li>Check browser console for errors</li>
            </ul>
          </div>
        )}
      </div>
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;