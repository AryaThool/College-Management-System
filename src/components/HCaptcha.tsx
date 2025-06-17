import React, { useRef, forwardRef, useImperativeHandle } from 'react';
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

    // Get the site key from environment variables
    // You'll need to add this to your .env file
    const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'; // Test key

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
      console.log('hCaptcha expired');
      if (onExpire) {
        onExpire();
      }
    };

    return (
      <div className="flex justify-center my-4">
        <HCaptcha
          ref={captchaRef}
          sitekey={siteKey}
          onVerify={handleVerify}
          onError={handleError}
          onExpire={handleExpire}
          size={size}
          theme={theme}
        />
      </div>
    );
  }
);

HCaptchaComponent.displayName = 'HCaptchaComponent';

export default HCaptchaComponent;