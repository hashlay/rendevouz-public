import React, { useState, useRef, useCallback } from 'react';
import { X, ScanFace, Upload, Camera, Download, Sparkles, CheckCircle2, ShieldAlert, FolderKey, QrCode } from 'lucide-react';
import Webcam from 'react-webcam';
import QRCode from 'react-qr-code';
import { useFestival } from '../context/FestivalContext';

interface FaceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaceScannerModal: React.FC<FaceScannerModalProps> = ({ isOpen, onClose }) => {
  const { runFaceRecognition, smilePhotos, gallery } = useFestival();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelectedImage(imageSrc);
      runAiScan(imageSrc);
    }
  }, [webcamRef]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setSelectedImage(dataUrl);
        runAiScan(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiScan = (imgUrl: string) => {
    setIsAnalyzing(true);
    setScanResults(null);
    setTimeout(() => {
      const results = runFaceRecognition(imgUrl);
      setScanResults(results);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleDemoFaceScan = (sampleUrl: string) => {
    setSelectedImage(sampleUrl);
    runAiScan(sampleUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto py-8" onClick={onClose}>
      <div className="relative w-full max-w-4xl bg-[#121214] border border-white/15 rounded-3xl shadow-2xl my-auto overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-red-950/60 via-[#121214] to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2B2B]/20 border border-[#FF2B2B]/40 flex items-center justify-center text-[#FF2B2B]">
              <ScanFace className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                <Sparkles className="w-3 h-3" /> AI Biometric Matcher
              </div>
              <h3 className="text-xl font-bold text-white tracking-wide">
                Public AI Face Recognition Photo Finder
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-white/5 border border-white/10 rounded-xl transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Instructions Box */}
          <div className="bg-gradient-to-r from-[#FF2B2B]/10 via-black to-black border border-[#FF2B2B]/30 rounded-2xl p-4 text-xs text-zinc-300 space-y-1">
            <span className="text-[#FF2B2B] font-bold text-sm block">How AI Face Finder Works:</span>
            <p>
              Upload or snap a selfie photo. Our AI algorithm extracts facial features and scans all festival crowd, stage, and award photos to retrieve all images where your face appears!
            </p>
          </div>

          {/* Upload Area / Image Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border-2 border-dashed border-white/20 hover:border-[#FF2B2B] rounded-2xl p-6 text-center bg-black/40 flex flex-col items-center justify-center gap-3 transition-colors">
              {selectedImage ? (
                <div className="space-y-3 w-full">
                  <img
                    src={selectedImage}
                    alt="Captured face"
                    className="w-full max-w-[200px] rounded-2xl object-cover mx-auto border-2 border-[#FF2B2B] shadow-xl"
                  />
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { setSelectedImage(null); setScanResults(null); }} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors">
                      Retake
                    </button>
                    <label className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors">
                      Upload
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div className="relative w-full rounded-2xl overflow-hidden border-2 border-white/10 aspect-square sm:aspect-auto">
                    {/* @ts-ignore */}
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "user" }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-[4px] border-[#FF2B2B]/30 m-4 rounded-xl pointer-events-none" />
                  </div>
                  <button onClick={capture} className="w-full py-3 bg-[#FF2B2B] hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#FF2B2B]/30 transition-all flex items-center justify-center gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Capture & Scan Face</span>
                  </button>
                  <div className="flex items-center gap-3 w-full">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-[10px] text-zinc-500 font-mono">OR</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                  <label className="w-full py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 border border-white/10">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo from Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Sample Demo Photos */}
              <div className="w-full pt-3 border-t border-white/10 text-[10px] text-zinc-400 font-mono text-center">
                <span>Or test with sample face:</span>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => handleDemoFaceScan('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded border border-white/15"
                  >
                    Sample 1
                  </button>
                  <button
                    onClick={() => handleDemoFaceScan('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80')}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded border border-white/15"
                  >
                    Sample 2
                  </button>
                </div>
              </div>
            </div>

            {/* Results / Scanning Display Area */}
            <div className="md:col-span-2 space-y-4">
              {isAnalyzing && (
                <div className="py-16 border border-white/10 rounded-2xl bg-black/60 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-4 border-[#FF2B2B] border-t-transparent animate-spin" />
                    <ScanFace className="w-10 h-10 text-[#FF2B2B] absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-sm font-bold text-white">AI Neural Face Scanner Running...</h5>
                    <p className="text-xs text-amber-300 font-mono animate-pulse">
                      Matching facial vector landmarks against festival image repository
                    </p>
                  </div>
                </div>
              )}

              {!isAnalyzing && !scanResults && !selectedImage && (
                <div className="py-16 border border-white/10 rounded-2xl bg-black/30 text-center text-zinc-400 text-xs p-6 flex flex-col items-center justify-center gap-2">
                  <ScanFace className="w-12 h-12 text-zinc-600 mb-1" />
                  <p className="font-bold text-zinc-300 text-sm">No Photo Uploaded Yet</p>
                  <p>Upload your facial photo on the left to start scanning for all matching photos across the festival!</p>
                </div>
              )}

              {!isAnalyzing && scanResults && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-xs">
                    <span className="font-bold font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Matches Found: {scanResults.matchCount} Photos Recognized
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">
                      Similarity: {scanResults.similarityScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {scanResults.matchedPhotos.map((photo: any) => (
                      <div
                        key={photo.id}
                        className="group bg-black/60 border border-white/10 hover:border-[#FF2B2B] rounded-2xl overflow-hidden transition-all duration-300"
                      >
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[9px] font-black font-mono px-2 py-0.5 rounded-full shadow">
                            98.8% MATCH
                          </div>
                        </div>

                        <div className="p-3 space-y-1">
                          <h6 className="text-xs font-bold text-white line-clamp-1">{photo.title}</h6>
                          <p className="text-[10px] text-zinc-400 font-mono">{photo.stage} • {photo.timestamp || photo.date}</p>

                          <a
                            href={photo.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 w-full py-1.5 bg-white/10 hover:bg-[#FF2B2B] text-white text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download High Resolution</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* SMILE Drive Access Section */}
              <div className="mt-6 pt-6 border-t border-white/10 w-full col-span-1 md:col-span-3">
                <div className="bg-gradient-to-r from-emerald-950/40 to-black border border-emerald-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5 justify-between">
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20">
                      <FolderKey className="w-3 h-3" /> SMILE DRIVE ACCESS
                    </div>
                    <h4 className="text-sm font-bold text-white">Full Festival Gallery Drive</h4>
                    <p className="text-xs text-zinc-400">
                      Scan the QR code or click below to access the complete Google Drive folder containing all uncompressed high-resolution festival photos.
                    </p>
                    <a href="https://drive.google.com/drive/folders/1PyLeWulSJqRPGFAk5Nb7copC1ZN7BRbL" target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">
                      Open Drive Link Directly &rarr;
                    </a>
                  </div>
                  <div className="bg-white p-2 rounded-xl shrink-0">
                    <QRCode value="https://drive.google.com/drive/folders/1PyLeWulSJqRPGFAk5Nb7copC1ZN7BRbL" size={90} level="M" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button type="button" onClick={onClose} className="w-full sm:hidden py-3 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-white/5 rounded-xl border border-white/10">Go Back</button>
        </div>
      </div>
    </div>
  );
};
