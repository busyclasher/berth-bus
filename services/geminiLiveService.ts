
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Type, FunctionDeclaration } from '@google/genai';

export class GeminiLiveSession {
  private ai: GoogleGenAI | null = null;
  private sessionPromise: Promise<any> | null = null;
  private nextStartTime = 0;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private outputNode: GainNode | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private stream: MediaStream | null = null;

  constructor() {}

  async start(callbacks: {
    onMessage?: (text: string, type: 'input' | 'output') => void;
    onClose?: () => void;
    onError?: (error: any) => void;
    onInitiateTapIn?: () => void;
  }) {
    // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.error("Microphone access denied", e);
      callbacks.onError?.(e);
      return;
    }

    const initiateTapInTool: FunctionDeclaration = {
      name: 'initiateTapIn',
      description: 'Initiates the tap-in process for the Bus Captain, opening the berth selection modal on the interface.',
      parameters: {
        type: Type.OBJECT,
        properties: {},
      },
    };

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          const source = this.inputAudioContext!.createMediaStreamSource(this.stream!);
          const scriptProcessor = this.inputAudioContext!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = this.createBlob(inputData);
            // Initiate sendRealtimeInput after live.connect call resolves.
            this.sessionPromise?.then((session) => {
              session.sendRealtimeInput({ media: pcmBlob });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(this.inputAudioContext!.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
              if (fc.name === 'initiateTapIn') {
                callbacks.onInitiateTapIn?.();
                this.sessionPromise?.then((session) => {
                  session.sendToolResponse({
                    functionResponses: {
                      id: fc.id,
                      name: fc.name,
                      response: { result: "Berth selection modal has been opened for the user." },
                    }
                  });
                });
              }
            }
          }

          if (message.serverContent?.outputTranscription) {
            callbacks.onMessage?.(message.serverContent.outputTranscription.text, 'output');
          }
          if (message.serverContent?.inputTranscription) {
            callbacks.onMessage?.(message.serverContent.inputTranscription.text, 'input');
          }

          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && this.outputAudioContext) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            const audioBuffer = await this.decodeAudioData(
              this.decode(base64Audio),
              this.outputAudioContext,
              24000,
              1
            );
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputNode!);
            source.addEventListener('ended', () => this.sources.delete(source));
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.sources.add(source);
          }

          if (message.serverContent?.interrupted) {
            this.sources.forEach(s => s.stop());
            this.sources.clear();
            this.nextStartTime = 0;
          }
        },
        onerror: (e: any) => callbacks.onError?.(e),
        onclose: () => callbacks.onClose?.(),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        inputAudioTranscription: {},
        tools: [{ functionDeclarations: [initiateTapInTool] }],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: `You are the PBMS Intelligent Operations Assistant for SBS Transit. 
        You assist Bus Captains (BC) and Operations Managers (OM) in managing real-time bus hub logistics.

        CORE SCENARIOS:
        1. BUS CAPTAIN ARRIVAL: When a BC mentions arriving at a berth, reaching the hub, or wanting to "tap in", execute the 'initiateTapIn' tool and say: "I've initiated the tap-in process. Please select your assigned berth on the screen to finalize your arrival."
        2. OM BOTTLENECKING: If an OM expresses concern about "bottlenecking", "congestion", "traffic", or "delays", provide a professional strategic summary. Advise them to:
           - Immediately check the "Berth Grid Layout" to assess current berth availability and identify long-dwell vehicles.
           - Analyze the "Turnaround Trends" chart to pinpoint service numbers that are exceeding target dwell times (e.g., above 20 minutes).
           - Consider dynamically adjusting "Layover Durations" to clear congestion during this peak period.
        3. GENERAL: Keep all communications concise, professional, and tailored for high-efficiency transit operations.`,
      },
    });
  }

  stop() {
    this.sessionPromise?.then(session => session.close());
    this.stream?.getTracks().forEach(track => track.stop());
    this.sources.forEach(s => s.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
  }

  private createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: this.encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}
