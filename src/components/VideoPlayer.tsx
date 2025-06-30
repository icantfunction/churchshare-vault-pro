
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Maximize, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerProps {
  fileId: string;
  fileName: string;
  compressionRatio?: number;
}

type Quality = '4k' | '1080p' | '720p' | '480p';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ fileId, fileName, compressionRatio }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<Quality>('720p');
  const [hlsUrl, setHlsUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const qualityOptions: { value: Quality; label: string; badge?: string }[] = [
    { value: '4k', label: '4K Ultra HD', badge: 'HEVC' },
    { value: '1080p', label: '1080p Full HD' },
    { value: '720p', label: '720p HD' },
    { value: '480p', label: '480p SD' }
  ];

  const loadVideoUrl = async (quality: Quality) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-signed-hls-url', {
        body: {
          fileId,
          quality
        }
      });

      if (error) throw error;

      setHlsUrl(data.hlsUrl);
      setCurrentQuality(quality);
    } catch (error) {
      console.error('Error loading video URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideoUrl(currentQuality);
  }, [fileId]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleQualityChange = (quality: Quality) => {
    const currentTime = videoRef.current?.currentTime || 0;
    loadVideoUrl(quality).then(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        if (isPlaying) {
          videoRef.current.play();
        }
      }
    });
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-0">
        <div className="relative bg-black rounded-t-lg overflow-hidden">
          <video
            ref={videoRef}
            src={hlsUrl}
            className="w-full aspect-video"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false}
            preload="metadata"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white">Loading...</div>
            </div>
          )}

          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Button
                  onClick={togglePlayPause}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Button
                    onClick={() => setShowSettings(!showSettings)}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[200px]">
                      <div className="text-sm font-medium mb-2">Quality</div>
                      <div className="space-y-1">
                        {qualityOptions.map((option) => (
                          <Button
                            key={option.value}
                            onClick={() => {
                              handleQualityChange(option.value);
                              setShowSettings(false);
                            }}
                            variant={currentQuality === option.value ? "secondary" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-white hover:bg-white/20"
                          >
                            <span className="flex items-center gap-2">
                              {option.label}
                              {option.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {option.badge}
                                </Badge>
                              )}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={toggleFullscreen}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{fileName}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentQuality.toUpperCase()}
              </Badge>
              {compressionRatio && (
                <Badge variant="secondary" className="text-xs">
                  {Math.round((1 - compressionRatio) * 100)}% compressed
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>4K HEVC → Multiple formats</span>
            <span>•</span>
            <span>CloudFront delivery</span>
            <span>•</span>
            <span>30-min signed URLs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoPlayer;
