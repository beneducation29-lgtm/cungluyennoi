/**
 * Audio Waveform Service
 * Uses transient Web Audio API (AudioContext + AnalyserNode) purely for real-time visual feedback.
 * CRITICAL PRIVACY RULE: NEVER records, saves, buffers, or uploads any audio data.
 * All streams and audio contexts are immediately stopped and closed when listening ends.
 */

class AudioWaveformService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private isActive = false;

  public async startVisualizer(onVolumeChange: (volume: number, frequencies: number[]) => void): Promise<boolean> {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.stopVisualizer();

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.mediaStream = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;

      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyser);

      this.isActive = true;
      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const update = () => {
        if (!this.isActive || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);

        // Calculate average volume (0.0 to 1.0)
        let sum = 0;
        const freqs: number[] = [];
        const sampleCount = 8;
        const step = Math.floor(dataArray.length / sampleCount);

        for (let i = 0; i < sampleCount; i++) {
          const val = dataArray[i * step] || 0;
          freqs.push(val / 255);
          sum += val;
        }

        const avg = sum / (dataArray.length * 255);
        onVolumeChange(Math.min(1, avg * 1.8), freqs);

        this.animationFrameId = requestAnimationFrame(update);
      };

      update();
      return true;
    } catch (err) {
      console.warn("Waveform audio visualizer not accessible or permission denied:", err);
      this.stopVisualizer();
      return false;
    }
  }

  public stopVisualizer() {
    this.isActive = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {
        console.warn("Error disconnecting sourceNode:", e);
      }
      this.sourceNode = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch (e) {
        console.warn("Error disconnecting analyser:", e);
      }
      this.analyser = null;
    }

    // Stop all media stream tracks to shut off microphone indicator LED immediately
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping audio track:", e);
        }
      });
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close();
      } catch (e) {
        console.warn("Error closing AudioContext:", e);
      }
      this.audioContext = null;
    }
  }

  public isRunning(): boolean {
    return this.isActive;
  }
}

export const audioWaveformService = new AudioWaveformService();
