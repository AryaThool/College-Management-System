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
    const [hasError, setHasError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    // Your actual site key
    const siteKey = 'd0222e48-af26-46ca-882c-6c2e3406e4c4';

    useEffect(() => {
      // Check if device is mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
      // Reset error state when component mounts or retries
      setHasError(false);
      setIsLoaded(false);
    }, [retryCount]);

    useImperativeHandle(ref, () => ({
      resetCaptcha: () => {
        if (captchaRef.current) {
          try {
            captchaRef.current.resetCaptcha();
            setHasError(false);
          } catch (error) {
            console.error('Error resetting captcha:', error);
            setHasError(true);
          }
        }
      },
      execute: () => {
        if (captchaRef.current) {
          try {
            captchaRef.current.execute();
          } catch (error) {
            console.error('Error executing captcha:', error);
            setHasError(true);
          }
        }
      }
    }));

    const handleVerify = (token: string) => {
      console.log('hCaptcha verified successfully');
      setHasError(false);
      onVerify(token);
    };

    const handleError = (error: any) => {
      console.error('hCaptcha error:', error);
      setHasError(true);
      setIsLoaded(false);
      
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
      setHasError(false);
    };

    const handleRetry = () => {
      setRetryCount(prev => prev + 1);
      setHasError(false);
      setIsLoaded(false);
    };

    // Determine size based on screen size
    const captchaSize = isMobile ? 'compact' : size;

    if (hasError) {
      return (
        <div className="flex flex-col items-center justify-center my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center mb-3">
            <div className="text-red-600 font-medium mb-1">Security verification unavailable</div>
            <div className="text-sm text-red-500">
              Unable to load security verification. Please check your internet connection.
            </div>
          </div>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center my-4">
        <div className="w-full flex justify-center">
          <div className="transform scale-100 origin-center">
            <HCaptcha
              key={`hcaptcha-${retryCount}`} // Force re-render on retry
              ref={captchaRef}
              sitekey={siteKey}
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleExpire}
              onLoad={handleLoad}
              size={captchaSize}
              theme={theme}
              tabindex={0}
            />
          </div>
        </div>
        
        {!isLoaded && !hasError && (
          <div className="mt-3 text-center">
            <div className="inline-flex items-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-blue-700">Loading security verification...</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;