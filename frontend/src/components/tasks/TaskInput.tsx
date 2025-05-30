import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, Loader2, StopCircle } from 'lucide-react';
import { useTask } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TaskInput() {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { loading, createTask, createTaskFromAudio } = useTask();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [input]);

  // Cleanup MediaStream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    try {
      toast.promise(createTask(input.trim()), {
        loading: 'Creating task...',
        success: 'Task created successfully!',
        error: 'Failed to create task'
      });
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const startRecording = async () => {
    try {
      // Reset audio chunks at the start of recording
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
          sampleSize: 16,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop the stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        if (audioChunksRef.current.length === 0) {
          toast.error('No audio data recorded');
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        // Verify blob size
        if (audioBlob.size === 0) {
          toast.error('Recording failed: No audio data captured');
          return;
        }

        const audioFile = new File([audioBlob], 'recording.webm', { 
          type: 'audio/webm;codecs=opus',
          lastModified: Date.now()
        });

        try {
          await toast.promise(
            createTaskFromAudio(audioFile),
            {
              loading: 'Processing audio...',
              success: 'Task created from audio!',
              error: (err) => {
                console.error('Audio processing error:', err);
                return 'Failed to process audio. Please try again.';
              }
            }
          );
        } catch (error) {
          console.error('Failed to process audio:', error);
        } finally {
          // Clear the chunks for next recording
          audioChunksRef.current = [];
        }
      };

      // Start recording with 100ms timeslice to get frequent chunks
      recorder.start(100);
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('Failed to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      toast.info('Recording stopped');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2 w-full">
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          placeholder="Type your task in natural language..."
          value={input}
          onChange={handleInputChange}
          disabled={loading || isRecording}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          className={cn(
            "pr-24 min-h-[50px] max-h-[200px] overflow-y-auto resize-none",
            "bg-slate-900/50 border-slate-700/50 text-slate-100 placeholder:text-slate-500",
            "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30",
            "transition-all duration-200",
            "scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800",
            (loading || isRecording) && "opacity-50"
          )}
        />
        <div className="absolute right-2 top-2 flex items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled={loading}
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "h-8 w-8 hover:bg-slate-700/50",
              isRecording && "text-red-400 animate-pulse"
            )}
          >
            {isRecording ? (
              <StopCircle className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            variant="ghost"
            disabled={!input.trim() || loading || isRecording}
            className="h-8 w-8 hover:bg-slate-700/50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            ) : (
              <Send className="h-4 w-4 text-blue-400" />
            )}
          </Button>
        </div>
      </div>
    </form>
  );
} 