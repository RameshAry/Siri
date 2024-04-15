"use client";
import Image from "next/image";
import activeAssistantIcon from "@/img/active.gif";
import notActiveAssistantIcon from "@/img/notactive.png";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export const mimeType = "audio/webm";

function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const { pending } = useFormStatus();
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });

        setPermission(true);
        setStream(streamData);
      } catch (e: any) {
        alert(e.message);
      }
    } else {
      alert("The MediaRecorder API is not available on yur browser");
    }
  };

  const startRecording = async () => {
    if (stream === null || pending) return;
    setRecordingStatus("recording");

    //   create a new recording instance using the stream
    const media = new MediaRecorder(stream, { mimeType });

    mediaRecorder.current = media;
    mediaRecorder.current.start();

    let localAudioChunk: Blob[] = [];

    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunk.push(event.data);
    };
    setAudioChunks(localAudioChunk);
  };

  const stopRecording = async () => {
    if (mediaRecorder.current === null || pending) return;

    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType });
      //   const audioUrl = URL.createObjectURL(audioBlob);
      uploadAudio(audioBlob);
      setAudioChunks([]);
    };
  };

  // hooks
  useEffect(() => {
    getMicrophonePermission();
  }, []);

  return (
    <div className="flex flex-center justify-center text-white">
      {!permission && (
        <button onClick={getMicrophonePermission}>Get Microphone</button>
      )}

      {pending && (
        <Image
          src={activeAssistantIcon}
          height={350}
          width={350}
          alt="Recording"
          className="assistant grayscale"
          priority
        />
      )}

      {permission && recordingStatus === "inactive" && !pending && (
        <Image
          src={notActiveAssistantIcon}
          height={350}
          width={350}
          alt="Not Recording"
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
          onClick={startRecording}
          priority={true}
        />
      )}

      {recordingStatus === "recording" && (
        <Image
          src={activeAssistantIcon}
          height={350}
          width={350}
          alt="Recording"
          className="assistant cursor-pointer hover:scale-110 duration-150 transition-all ease-in-out"
          priority
          onClick={stopRecording}
        />
      )}
    </div>
  );
}

export default Recorder;
