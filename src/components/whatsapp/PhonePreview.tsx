import React from "react";
import { Phone, MoreVertical, FileText, Link, PhoneCall, Reply, CheckCheck, Play } from "lucide-react";

interface PhonePreviewProps {
  sender?: string;
  mediaType?: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO";
  mediaUrl?: string;
  fileName?: string;
  bodyText?: string;
  variableValues?: Record<string, string>;
  buttons?: Array<{ type: string; text?: string; url?: string }>;
}

export default function PhonePreview({
  sender = "WhatsApp",
  mediaType = "TEXT",
  mediaUrl = "",
  fileName = "",
  bodyText = "",
  variableValues = {},
  buttons = [],
}: PhonePreviewProps) {
  
  const renderMessage = () => {
    if (!bodyText) {
      return <span className="italic text-slate-400">Type your message...</span>;
    }

    let text = bodyText;
    Object.entries(variableValues).forEach(([key, value]) => {
      if (value) {
        text = text.replaceAll(`{{${key}}}`, `__VAR__${value}__ENDVAR__`);
      }
    });

    const parts = text.split(/(__VAR__.*?__ENDVAR__)/);
    return parts.map((part, index) => {
      if (part.startsWith("__VAR__")) {
        const val = part.replace("__VAR__", "").replace("__ENDVAR__", "");
        return (
          <span key={index} className="rounded bg-green-100 text-green-700 px-1 py-0.5 font-medium text-sm">
            {val}
          </span>
        );
      }
      return part.split("\n").map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i !== part.split("\n").length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  const getMediaComponent = () => {
    if (!mediaUrl && mediaType !== "TEXT") {
      return (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-slate-100 mb-2">
          <span className="text-sm text-slate-400">No media URL</span>
        </div>
      );
    }
    
    if (mediaType === "IMAGE") {
      return <img src={mediaUrl} alt="Preview" className="mb-2 rounded-lg w-full object-cover" />;
    }
    if (mediaType === "VIDEO") {
      return (
        <div className="relative mb-2 aspect-video w-full rounded-lg bg-black flex items-center justify-center">
          <Play className="h-10 w-10 text-white/70" />
        </div>
      );
    }
    if (mediaType === "DOCUMENT") {
      return (
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-black/5 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
            <FileText size={20} />
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{fileName || "document.pdf"}</p>
            <p className="text-xs text-slate-500 text-opacity-80">PDF Document</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto w-[320px] shrink-0 overflow-hidden rounded-[2.5rem] border-[8px] border-slate-900 bg-slate-50 dark:bg-slate-950 shadow-2xl relative">
      <div className="absolute top-0 left-1/2 h-6 w-32 -translate-x-1/2 rounded-b-3xl bg-slate-900 z-10" />
      
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 pt-8 text-white">
        <div className="h-10 w-10 shrink-0 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
          {sender.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="truncate font-medium">{sender}</h4>
          <p className="text-xs text-white/70">Online</p>
        </div>
        <Phone size={18} className="shrink-0 cursor-not-allowed" />
        <MoreVertical size={18} className="shrink-0 cursor-not-allowed" />
      </div>

      {/* Chat Area */}
      <div className="relative h-[480px] bg-[#efeae2] p-4 flex flex-col justify-end" 
           style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'cover' }}>
        
        {/* Chat Bubble */}
        <div className="relative self-start max-w-[85%] rounded-lg rounded-tl-none bg-white p-2 shadow-sm text-[15px] leading-snug">
          {getMediaComponent()}
          <div className="whitespace-pre-wrap text-slate-800 break-words">
            {renderMessage()}
          </div>
          
          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="text-[10px] text-slate-500">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <CheckCheck size={14} className="text-blue-500" />
          </div>
        </div>
        
        {/* Buttons */}
        {buttons.length > 0 && (
          <div className="mt-2 flex w-full flex-col gap-1 max-w-[85%] self-start">
            {buttons.map((btn, idx) => (
              <div key={idx} className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white p-2.5 text-sm font-medium text-[#00a884] shadow-sm">
                {btn.type === "URL" ? <Link size={16} /> : btn.type === "PHONE_NUMBER" ? <PhoneCall size={16} /> : <Reply size={16} />}
                {btn.text || btn.type}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
