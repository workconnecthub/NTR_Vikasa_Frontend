import { useState, useEffect, useRef } from 'react';
import { Mail, Clock, RefreshCw, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import Button from './Button';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import {
  getDailyOtpAttempts,
  isDailyOtpLimitReached,
  recordOtpAttempt,
  maskEmail
} from '../../utils/otpUtils';

export { maskEmail };

/**
 * Reusable OtpVerificationView
 *
 * @param {string}   email           - Email address receiving the OTP
 * @param {string}   flowId          - Unique identifier for the flow (e.g. 'candidate_reg', 'recruiter_reg', 'forgot_pwd')
 * @param {Function} onVerified      - Callback when OTP is successfully verified
 * @param {Function} onChangeEmail   - Callback when user clicks 'Change Email'
 * @param {string}   title           - Title override (default: "Verify Your Email")
 * @param {string}   subtitle        - Subtitle override
 * @param {boolean}  isCardLayout    - Whether rendered standalone in a card or inside a modal
 */
export default function OtpVerificationView({
  email,
  flowId = 'auth_flow',
  onVerified,
  onChangeEmail,
  title = 'Verify Your Email',
  subtitle,
  isCardLayout = false,
}) {
  const { toast } = useToast();
  const inputRefs = useRef([]);

  // 6-digit OTP array
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Expiry timer (120 seconds = 2 minutes)
  const [timeLeft, setTimeLeft] = useState(120);
  // Resend cooldown (30 seconds)
  const [cooldown, setCooldown] = useState(30);

  // Daily request limit state (maximum 3 requests per day per flow)
  const [requestCount, setRequestCount] = useState(() => {
    return Math.max(1, getDailyOtpAttempts(flowId));
  });

  const isDailyLimitReached = requestCount >= 3;
  const isExpired = timeLeft <= 0;

  // Expiry countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Cooldown countdown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const cdTimer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cdTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cdTimer);
  }, [cooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Handle single character typing and auto-advancing
  const handleDigitChange = (index, value) => {
    setErrorMsg('');
    const raw = value.replace(/\D/g, '');

    // If pasted multiple digits into one box
    if (raw.length > 1) {
      handlePastedDigits(raw);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = raw;
    setOtp(nextOtp);

    // Auto-advance focus
    if (raw && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePastedDigits = (pastedStr) => {
    const digits = pastedStr.replace(/\D/g, '').slice(0, 6).split('');
    if (digits.length === 0) return;
    const nextOtp = [...otp];
    digits.forEach((d, i) => {
      if (i < 6) nextOtp[i] = d;
    });
    setOtp(nextOtp);
    const nextFocusIdx = Math.min(digits.length, 5);
    inputRefs.current[nextFocusIdx]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous and clear
        const nextOtp = [...otp];
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        // Clear current
        const nextOtp = [...otp];
        nextOtp[index] = '';
        setOtp(nextOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    handlePastedDigits(pastedData);
  };

  // Resend OTP action
  const handleResendOtp = async () => {
    if (isDailyLimitReached || isDailyOtpLimitReached(flowId)) {
      setErrorMsg('Daily OTP limit reached (3/3). Please try again tomorrow.');
      return;
    }
    if (cooldown > 0) return;

    // Increment daily request count
    const nextCount = recordOtpAttempt(flowId);
    setRequestCount(nextCount);

    // Reset OTP input, timer, and cooldown
    setOtp(['', '', '', '', '', '']);
    setErrorMsg('');
    setTimeLeft(120);
    setCooldown(30);

    let devCode = '';
    try {
      let purpose = 'REGISTER';
      if (flowId.includes('forgot')) purpose = 'FORGOT_PASSWORD';
      else if (flowId.includes('login')) purpose = 'LOGIN';

      const res = await authService.sendOtp(email, purpose);
      if (res?.dev_code) devCode = res.dev_code;
    } catch (err) {
      // Continue with local cooldown and fallback
    }

    toast({
      type: 'info',
      title: 'Verification Code Sent',
      message: `A new 6-digit OTP has been sent to ${maskEmail(email)}.${devCode ? ` (Verification code: ${devCode})` : ' (Demo code: 123456)'}`,
    });

    // Refocus first input
    inputRefs.current[0]?.focus();
  };

  // Submit and verify OTP
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (isExpired) {
      setErrorMsg('Your OTP has expired. Please click "Resend OTP" to request a new code.');
      return;
    }

    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    // Shortcut for 123456 demo code
    if (fullCode === '123456') {
      setTimeout(() => {
        setIsVerifying(false);
        if (onVerified) {
          onVerified(fullCode);
        }
      }, 300);
      return;
    }

    // Backend verification
    try {
      let purpose = 'REGISTER';
      if (flowId.includes('forgot')) purpose = 'FORGOT_PASSWORD';
      else if (flowId.includes('login')) purpose = 'LOGIN';

      await authService.verifyOtp(email, fullCode, purpose);
      setIsVerifying(false);
      if (onVerified) {
        onVerified(fullCode);
      }
    } catch (apiErr) {
      setIsVerifying(false);
      const msg = apiErr.message || 'The verification code you entered is incorrect. Please try again.';
      setErrorMsg(msg);
      toast({
        type: 'error',
        title: 'Invalid OTP',
        message: msg,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', width: '100%', textAlign: 'center' }}>
      
      {/* Icon & Heading */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary-50)',
          color: 'var(--color-primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-3)'
        }}>
          <Mail size={26} />
        </div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
          {title}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
          {subtitle || (
            <>
              We've sent a verification code to{' '}
              <strong style={{ color: 'var(--color-text)' }}>{maskEmail(email)}</strong>
            </>
          )}
        </p>

        {onChangeEmail && (
          <button
            type="button"
            onClick={onChangeEmail}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-600)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: 'var(--space-1)',
              textDecoration: 'underline'
            }}
          >
            Change Email
          </button>
        )}
      </div>

      {/* Demo helper pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        background: 'var(--color-primary-50)',
        border: '1px solid var(--color-primary-200)',
        borderRadius: 'var(--radius-full)',
        padding: '3px 12px',
        alignSelf: 'center',
        fontSize: '11px',
        color: 'var(--color-primary-700)',
        fontWeight: 600
      }}>
        <ShieldCheck size={13} />
        <span>Demo verification OTP: <strong>123456</strong></span>
      </div>

      {/* 6-digit OTP Inputs */}
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
            Enter 6-Digit OTP
          </label>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              maxWidth: '380px',
              margin: '0 auto'
            }}
            onPaste={handlePaste}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`otp-box-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isExpired}
                aria-label={`Digit ${idx + 1}`}
                style={{
                  width: '46px',
                  height: '52px',
                  textAlign: 'center',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono, monospace)',
                  borderRadius: 'var(--radius-xl)',
                  border: errorMsg
                    ? '2px solid var(--color-danger-500)'
                    : digit
                    ? '2px solid var(--color-primary-600)'
                    : '1.5px solid var(--color-border)',
                  background: isExpired ? 'var(--color-gray-100)' : 'var(--color-surface)',
                  color: 'var(--color-text)',
                  boxShadow: 'var(--shadow-sm)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger-600)',
            background: 'var(--color-danger-50)',
            border: '1px solid var(--color-danger-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-2) var(--space-3)',
            maxWidth: '380px',
            margin: '0 auto',
            width: '100%'
          }} role="alert">
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Countdown & Expiry Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 'var(--text-xs)' }}>
          <Clock size={14} style={{ color: isExpired ? 'var(--color-danger-600)' : 'var(--color-text-muted)' }} />
          {isExpired ? (
            <span style={{ color: 'var(--color-danger-600)', fontWeight: 700 }}>
              OTP expired
            </span>
          ) : (
            <span style={{ color: 'var(--color-text-muted)' }}>
              OTP expires in <strong style={{ color: 'var(--color-text)' }}>{formatTime(timeLeft)}</strong>
            </span>
          )}
        </div>

        {/* Daily limit reached banner */}
        {isDailyLimitReached && (
          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-3)',
            fontSize: 'var(--text-xs)',
            color: '#92400e',
            textAlign: 'center',
            maxWidth: '380px',
            margin: '0 auto',
            width: '100%'
          }}>
            <p style={{ fontWeight: 700, margin: 0 }}>Daily OTP limit reached</p>
            <p style={{ margin: '2px 0 0 0', opacity: 0.9 }}>
              You have reached the maximum of 3 OTP requests for today. Please try again tomorrow.
            </p>
          </div>
        )}

        {/* Resend Section */}
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          <span>Didn't receive the code? </span>
          {isDailyLimitReached ? (
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Resend limit reached (3/3)</span>
          ) : cooldown > 0 ? (
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Resend OTP in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary-600)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              Resend OTP
            </button>
          )}
        </div>

        {/* Action button */}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isVerifying}
            disabled={isExpired || otp.join('').length < 6}
          >
            Verify & Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
