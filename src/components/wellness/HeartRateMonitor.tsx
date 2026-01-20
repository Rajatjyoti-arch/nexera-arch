import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Camera,
  CameraOff,
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  RefreshCw,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  extractRgbFromRoi,
  extractRppgChrom,
  estimateHeartRate,
  calculateBrightness,
  isLightingGood,
} from '@/lib/rppg';
import {
  useHeartRateStats,
  useSaveHeartRateReading,
  getHeartRateZone,
} from '@/hooks/useHeartRate';

const FPS = 30;
const MEASURE_DURATION = 10; // seconds
const MEASURE_FRAMES = MEASURE_DURATION * FPS;

type MeasurementStatus = 'idle' | 'preparing' | 'measuring' | 'complete' | 'error';

interface FaceDetectionResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function HeartRateMonitor() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<MeasurementStatus>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState<{ bpm: number; confidence: string } | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  
  const rgbBufferRef = useRef<{ r: number; g: number; b: number }[]>([]);
  const frameCountRef = useRef(0);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  
  const { data: stats } = useHeartRateStats();
  const saveReading = useSaveHeartRateReading();
  
  // Simple face detection using skin color detection
  const detectFace = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number): FaceDetectionResult | null => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Find skin-colored pixels
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let skinPixels = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Simple skin color detection in RGB
        const isSkin = r > 95 && g > 40 && b > 20 &&
          r > g && r > b &&
          Math.abs(r - g) > 15 &&
          r - g > 15;
        
        if (isSkin) {
          skinPixels++;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // Check if enough skin pixels found
    const faceWidth = maxX - minX;
    const faceHeight = maxY - minY;
    const faceArea = faceWidth * faceHeight;
    
    if (skinPixels > faceArea * 0.3 && faceWidth > 50 && faceHeight > 50) {
      return {
        x: minX,
        y: minY,
        width: faceWidth,
        height: faceHeight,
      };
    }
    
    return null;
  }, []);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        streamRef.current = stream;
        setCameraActive(true);
        setFeedback('Position your face in the center');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setFeedback('Camera access denied. Please allow camera permissions.');
      setStatus('error');
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setCameraActive(false);
    setStatus('idle');
    setProgress(0);
    setFaceDetected(false);
    rgbBufferRef.current = [];
    frameCountRef.current = 0;
  };
  
  const startMeasurement = () => {
    setStatus('preparing');
    setProgress(0);
    setResult(null);
    rgbBufferRef.current = [];
    frameCountRef.current = 0;
    setFeedback('Detecting face... Hold still');
    
    setTimeout(() => {
      setStatus('measuring');
      setFeedback('Measuring... Keep still and breathe normally');
      captureFrames();
    }, 1000);
  };
  
  const captureFrames = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || status !== 'measuring') return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const processFrame = () => {
      if (!video || !canvas || status !== 'measuring') return;
      
      ctx.drawImage(video, 0, 0);
      
      // Detect face
      const face = detectFace(ctx, canvas.width, canvas.height);
      
      if (face) {
        setFaceDetected(true);
        
        // Extract forehead region (upper 1/3 of face, center 1/3 width)
        const roiX = face.x + face.width * 0.33;
        const roiY = face.y + face.height * 0.1;
        const roiWidth = face.width * 0.33;
        const roiHeight = face.height * 0.25;
        
        const roiData = ctx.getImageData(roiX, roiY, roiWidth, roiHeight);
        
        // Check lighting
        const brightness = calculateBrightness(roiData);
        if (!isLightingGood(brightness)) {
          setFeedback('Adjust lighting - too dark or too bright');
        } else {
          setFeedback('Measuring... Keep still');
        }
        
        // Extract RGB values
        const rgb = extractRgbFromRoi(roiData);
        rgbBufferRef.current.push(rgb);
        frameCountRef.current++;
        
        // Update progress
        const progressPercent = Math.min(100, (frameCountRef.current / MEASURE_FRAMES) * 100);
        setProgress(progressPercent);
        
        // Check if measurement complete
        if (frameCountRef.current >= MEASURE_FRAMES) {
          // Process signal
          const signal = extractRppgChrom(rgbBufferRef.current);
          const hrResult = estimateHeartRate(signal, FPS);
          
          if (hrResult.valid) {
            setResult({ bpm: hrResult.bpm, confidence: hrResult.confidence });
            setStatus('complete');
            setFeedback(`Heart rate: ${hrResult.bpm} BPM`);
          } else {
            setStatus('error');
            setFeedback('Could not detect pulse. Try again with better lighting.');
          }
          return;
        }
      } else {
        setFaceDetected(false);
        setFeedback('Face not detected - look at the camera');
      }
      
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };
    
    processFrame();
  }, [status, detectFace]);
  
  useEffect(() => {
    if (status === 'measuring') {
      captureFrames();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [status, captureFrames]);
  
  const handleSaveReading = async () => {
    if (!result) return;
    
    await saveReading.mutateAsync({
      bpm: result.bpm,
      measurement_method: 'webcam',
      signal_quality: result.confidence,
    });
  };
  
  const zone = result ? getHeartRateZone(result.bpm) : null;
  
  return (
    <section className="space-y-6">
      <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-3">
        <Heart className="w-4 h-4" />
        Heart Rate Monitor
      </h2>
      
      <div className="premium-card card-rose p-6 space-y-6">
        {/* Camera View */}
        <div className="relative aspect-video bg-black/50 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            className={cn(
              'w-full h-full object-cover transform scale-x-[-1]',
              !cameraActive && 'hidden'
            )}
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
                <Camera className="w-10 h-10 text-rose-500" />
              </div>
              <p className="text-sm text-foreground/70 text-center max-w-xs">
                Use your webcam to measure heart rate using rPPG technology
              </p>
              <Button
                onClick={startCamera}
                className="bg-rose-500 hover:bg-rose-600 text-black font-bold"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            </div>
          )}
          
          {cameraActive && (
            <>
              {/* Face detection overlay */}
              <div className={cn(
                'absolute inset-0 border-4 rounded-xl transition-colors',
                faceDetected ? 'border-emerald-500' : 'border-amber-500',
                status === 'complete' && 'border-rose-500'
              )} />
              
              {/* Status indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full animate-pulse',
                  status === 'measuring' ? 'bg-emerald-500' : 'bg-rose-500'
                )} />
                <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">
                  {status === 'measuring' ? 'MEASURING' : status === 'complete' ? 'COMPLETE' : 'READY'}
                </span>
              </div>
              
              {/* Feedback */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-3">
                  <p className="text-xs text-white font-medium text-center">{feedback}</p>
                  {status === 'measuring' && (
                    <Progress value={progress} className="mt-2 h-2" />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Result Display */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Heart className="w-12 h-12 text-rose-500 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-rose-500">{result.bpm}</p>
                    <p className="text-xs text-foreground/70 uppercase tracking-widest">BPM</p>
                  </div>
                </div>
                
                {zone && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs uppercase tracking-widest',
                      zone.color === 'green' && 'border-emerald-500 text-emerald-500',
                      zone.color === 'blue' && 'border-blue-500 text-blue-500',
                      zone.color === 'yellow' && 'border-amber-500 text-amber-500',
                      zone.color === 'orange' && 'border-orange-500 text-orange-500',
                      zone.color === 'red' && 'border-red-500 text-red-500'
                    )}
                  >
                    {zone.zone}
                  </Badge>
                )}
              </div>
              
              {zone && (
                <p className="text-sm text-foreground/70">{zone.description}</p>
              )}
              
              <div className="flex items-center gap-2 text-xs text-foreground/60">
                <Activity className="w-3 h-3" />
                <span>Signal quality: {result.confidence}</span>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveReading}
                  disabled={saveReading.isPending}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-black font-bold"
                >
                  {saveReading.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Reading
                </Button>
                <Button
                  onClick={startMeasurement}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Controls */}
        {cameraActive && status !== 'complete' && (
          <div className="flex gap-2">
            <Button
              onClick={startMeasurement}
              disabled={status === 'measuring' || status === 'preparing'}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-black font-bold"
            >
              {status === 'measuring' || status === 'preparing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Measuring...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Measure Heart Rate
                </>
              )}
            </Button>
            <Button
              onClick={stopCamera}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              <CameraOff className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {/* Stats Summary */}
        {stats && stats.readingsCount > 0 && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest mb-3">
              Weekly Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.averageBpm}</p>
                <p className="text-[9px] text-foreground/60 uppercase tracking-widest">Avg BPM</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.minBpm}-{stats.maxBpm}</p>
                <p className="text-[9px] text-foreground/60 uppercase tracking-widest">Range</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{stats.readingsCount}</p>
                <p className="text-[9px] text-foreground/60 uppercase tracking-widest">Readings</p>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-[9px] text-center text-foreground/50 uppercase tracking-widest">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          For informational purposes only • Not a medical device
        </p>
      </div>
    </section>
  );
}
