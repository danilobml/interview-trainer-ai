'use client'

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { vapi } from "@/lib/vapi.sdk";

import { cn } from "@/lib/utils";

export enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED"
}

interface SavedMessage {
    role: 'user' | 'system' | 'assistant';
    content: string;
}

const Agent = ({ userName, userId, type }: AgentProps) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessage[]>([]);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
        const onMessage = (message: Message) => {
            if(message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = {
                    role: message.role,
                    content: message.transcript,
                }
                setMessages((prev) => [...prev, newMessage])
            }
        }
        const onSpeachStart = () => setIsSpeaking(true);
        const onSpeachEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.error(error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on("message", onMessage);
        vapi.on('speech-start', onSpeachStart);
        vapi.on('speech-end', onSpeachEnd);
        vapi.on("error", onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off("message", onMessage);
            vapi.off('speech-start', onSpeachStart);
            vapi.off('speech-end', onSpeachEnd);
            vapi.off("error", onError);
        }
    }, [])
    
    useEffect(() => {
        if(callStatus === CallStatus.FINISHED) router.push("/");
    }, [messages, callStatus, type, userId])

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
                username: userName,
                userid: userId,
            }
        });
    }

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    }

    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : '';

    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED; 

    return (
        <>
            <div className="call-view">
                <div className="card-interviewer">
                    <div className="avatar">
                        <Image src="/ai-avatar.png" alt="ai-avatar" width={65} height={54} className="object-cover" />
                        {isSpeaking ? (<span className="animate-speak"></span>) : null}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>

                <div className="card-border">
                    <div className="card-content">
                        <Image src="/user-avatar.png" alt="user-avatar" width={540} height={540} className="rounded-full object-cover size-[120px]" />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {messages.length > 0 ? (
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={lastMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>{lastMessage}</p>
                    </div>
                </div>
            ) : null}
            <div className="w-full flex justify-center">
                {callStatus !== CallStatus.ACTIVE ? (
                    <button className="relative btn-call" onClick={handleCall}>
                        <span
                            className={cn(
                                "absolute animate-ping rounded-full opacity-75",
                                callStatus !== CallStatus.CONNECTING && 'hidden'
                            )}
                        />
                        <span>{isCallInactiveOrFinished ? "CALL" : ". . ."}</span>
                    </button>
                ) : (
                    <button className="btn-disconnect" onClick={handleDisconnect}>
                        End
                    </button>
                )}
            </div>  </>
    )
}

export default Agent;
