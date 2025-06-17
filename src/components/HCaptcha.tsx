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
    const [isMobile, setIsMobile] = useState(false);

    // Use your actual site key
    const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || 'd0222e48-af26-46ca-882c-6c2e3406e4c4';

    useEffect(() => {
      // Check if device is mobile
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useImperativeHandle(ref, () => ({
      resetCaptcha: () => {
        if (captchaRef.current) {
          captchaRef.current.resetCaptcha();
        }
      },
      execute: () => {
        if (captchaRef.current) {
          captchaRef.current.execute();
        }
      }
    }));

    const handleVerify = (token: string) => {
      onVerify(token);
    };

    const handleError = (error: any) => {
      console.error('hCaptcha error:', error);
      if (onError) {
        onError(error);
      }
    };

    const handleExpire = () => {
      if (onExpire) {
        onExpire();
      }
    };

    const handleLoad = () => {
      setIsLoaded(true);
    };

    // Determine size based on screen size
    const captchaSize = isMobile ? 'compact' : size;

    return (
      <div className="flex flex-col items-center justify-center my-4">
        <div className="w-full flex justify-center">
          <div className="transform scale-100 origin-center">
            <HCaptcha
              ref={captchaRef}
              sitekey={siteKey}
              onVerify={handleVerify}
              onError={handleError}
              onExpire={handleExpire}
              onLoad={handleLoad}
              size={captchaSize}
              theme={theme}
            />
          </div>
        </div>
        
        {!isLoaded && (
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

export default HCaptcha;