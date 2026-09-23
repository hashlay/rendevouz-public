import React, { useState } from 'react';
import { X, Calendar, AlertCircle, Camera, Loader2 } from 'lucide-react';
import { useFestival } from '../context/FestivalContext';
import { Logo } from './Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'participant';
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginUnified, eventSettings } = useFestival();
  const [chestNumber, setChestNumber] = useState('');
  const [dob, setDob] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const criteriaMode = eventSettings?.participantLoginCriteria || 'class';
  const classStart = eventSettings?.classRangeStart ?? 1;
  const classEnd = eventSettings?.classRangeEnd ?? 10;
  const availableClasses: string[] = eventSettings?.availableClasses || Array.from({ length: Math.max(1, classEnd - classStart + 1) }, (_, i) => `Class ${classStart + i}`);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsSigningIn(false);
      setErrorMsg('');
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user') || params.get('chest') || params.get('code');
      if (userParam) {
        setChestNumber(userParam);
      }
    } else {
      document.body.style.overflow = 'unset';
      setIsSigningIn(false);
      setErrorMsg('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setErrorMsg('');

    const trimmedChest = chestNumber.trim();
    const secVal = (criteriaMode === 'class' ? selectedClass : dob).trim();

    if (!trimmedChest) {
      setErrorMsg('Please enter your chest number.');
      return;
    }
    if (!secVal) {
      setErrorMsg(criteriaMode === 'class' ? 'Please select your class / grade.' : 'Please enter your date of birth.');
      return;
    }

    setIsSigningIn(true);
    try {
      const res = await loginUnified(trimmedChest, secVal);
      if (!res.success) {
        setErrorMsg(res.error || `No participant found for that chest number and ${criteriaMode === 'class' ? 'class' : 'date of birth'}.`);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while signing in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-10 bg-red-600" />

      {/* Main Card matching Reference Design */}
      <div
        className="relative w-full bg-[#1E1E20] border border-[#333338] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-5 mx-auto"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Header Bar */}
        <div className="flex items-center justify-between border-b border-[#333338] pb-3">
          <Logo size="md" showSubBadge={false} />
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Participant Portal Section Heading */}
        <div>
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase font-mono block">
            PARTICIPANT PORTAL
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5 mb-1 font-sans">
            Sign in
          </h2>
          <p className="text-zinc-400 text-xs leading-relaxed font-sans">
            Use the chest number on your badge and your {criteriaMode === 'class' ? 'class / grade' : 'date of birth'}.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
              CHEST NUMBER
            </label>
            <input
              type="text"
              placeholder="e.g. 2023JMF268"
              value={chestNumber}
              disabled={isSigningIn}
              onChange={(e) => setChestNumber(e.target.value)}
              className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            />
          </div>

          {criteriaMode === 'class' ? (
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                CLASS / GRADE
              </label>
              <select
                value={selectedClass}
                disabled={isSigningIn}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <option value="">Select Class</option>
                {availableClasses.map((cls, idx) => (
                  <option key={idx} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-zinc-300 uppercase tracking-widest mb-1.5 font-mono">
                DATE OF BIRTH
              </label>
              <div className="relative flex items-center">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dob}
                  disabled={isSigningIn}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#141416] border border-[#38383C] focus:border-[#DC2626] rounded-xl pl-4 pr-11 py-3 text-sm text-white font-mono placeholder:text-zinc-500 focus:outline-none transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="DD/MM/YYYY"
                />
                <Calendar
                  className="absolute right-4 w-5 h-5 text-zinc-500 cursor-pointer hover:text-white transition-colors"
                  onClick={() => {
                    if (isSigningIn) return;
                    try {
                      dateInputRef.current?.showPicker();
                    } catch (err) {
                      dateInputRef.current?.focus();
                    }
                  }}
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-[#DC2626] text-[13px] font-sans pt-1">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isSigningIn}
            className={`w-full py-3.5 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 select-none ${
              isSigningIn
                ? 'bg-[#EF4444]/80 opacity-80 cursor-not-allowed shadow-none'
                : 'bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.99] cursor-pointer shadow-red-950/40'
            }`}
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white shrink-0" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              <span>SIGN IN</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-zinc-400 text-[11px] font-medium text-left font-sans pt-1">
          Your details stay on your device and the official results service.
        </p>

      </div>
    </div>
  );
};
