"use client";
import transcript from "@/actions/transcript";
import Messages from "@/components/Messages";
import Recorder, { mimeType } from "@/components/Recorder";
import { SettingsIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";

const initialState = {
  sender: "",
  response: "",
  id: "",
};

export type Message = { sender: string; response: string; id: string };

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [state, formAction] = useFormState(transcript, initialState);
  const [messages, setMessages] = useState<Message[]>([]);

  const uploadAudio = (blob: Blob) => {
    const file = new File([blob], "audio.webm", { type: mimeType });

    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;

      // simulate a click & submit the form
      if (submitButtonRef.current) {
        submitButtonRef.current?.click();
      }
    }
  };

  useEffect(() => {
    if (state.response && state.sender) {
      setMessages((messages) => [
        {
          sender: state.sender || "",
          response: state.response || "",
          id: state.id || "",
        },
        ...messages,
      ]);
    }
  }, [state]);

  console.log(messages);

  return (
    <main className="bg-black h-screen overflow-y-auto">
      {/* Header */}
      <header className="flex justify-between fixed top-0 text-white w-full  p-5">
        <Image
          src={"https://i.imgur.com/MCHWJZS.png"}
          width={50}
          height={50}
          alt="Logo"
          className="object-contain"
        />

        <SettingsIcon
          size={40}
          className="p-2 m-2 rounded-full cursor-pointer bg-purple-600 text-black transition-all ease-in-out duration-150 hover:bg-purple-700 hover:text-white"
        />
      </header>

      <form action={formAction} className="flex flex-col bg-black ">
        <div className="flex-1 bg-gradient-to-b from-purple-500 to-black">
          <Messages messages={messages} />
        </div>
        {/* hidden field */}
        <input type="file" name="audio" hidden ref={fileRef} />
        <button type="submit" hidden ref={submitButtonRef}></button>

        <div className="fixed bottom-0 w-full overflow-hidden bg-black rounded-t-3xl ">
          {/* Recorder */}
          <Recorder uploadAudio={uploadAudio} />

          <div className="">{/* Voice Syntheser - output */}</div>
        </div>
      </form>
    </main>
  );
}
