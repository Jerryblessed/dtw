import { FC, useCallback, useState } from "react";
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import * as util from '../utils/util';

// ─── CONFIG ──────────────────────────────────────────────────────────

import dotenv from 'dotenv';
dotenv.config();  // Loads environment variables from .env file

// testing mode only. Dont use in production
const AZURE_OPENAI_BASE = "https://thisisoajo.openai.azure.com";
const AZURE_OPENAI_MODEL = "gpt-4o";
const AZURE_OPENAI_KEY = "9I4UEJweVUdih04Uv8AXcAxs5H8jSQRfwaugcSQYHcI882wSpFvqJQQJ99BAACL93NaXJ3w3AAABACOGkv4f";
const AZURE_OPENAI_VERSION = "2023-06-01-preview";
const SYSTEM_PROMPT = "Guide in writing carrier driven prompt not more than 4 words or so.";

interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface WriteTweetProps {
    getAllTweets: (wallet: AnchorWallet | undefined) => void,
    walletPubkey: PublicKey,
    profilePubkey: PublicKey,
    displayName: string,
    handle: string,
    tweetCount: number,
};

export const WriteTweet: FC<WriteTweetProps> = (props: WriteTweetProps) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

    const [message, setMessage] = useState('');
    const [moderationError, setModerationError] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [loadingChat, setLoadingChat] = useState(false);

    // Check content via Azure OpenAI moderation
    const guardMessage = async (input: string): Promise<boolean> => {
        try {
            const res = await fetch(
                `${AZURE_OPENAI_BASE}/openai/moderations?api-version=${AZURE_OPENAI_VERSION}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': AZURE_OPENAI_KEY
                    },
                    body: JSON.stringify({ input })
                }
            );
            const data = await res.json();
            const flagged = data.results?.[0]?.flagged;
            return !flagged;
        } catch {
            // On error, allow message
            return true;
        }
    };

    const onClickPublishTweet = useCallback(async (msg: string) => {
        setModerationError('');
        if (!msg.trim()) return;
        const ok = await guardMessage(msg);
        if (!ok) {
            setMessage('');
            setModerationError('Your message contains inappropriate content. Please write something aligned with office world, a bright future, SDGs, and uplifting others.');
            return;
        }
        const tx = await util.createTweetTransaction(wallet, msg);
        await connection.confirmTransaction(await sendTransaction(tx, connection));
        props.getAllTweets(wallet);
    }, [wallet, props, connection, sendTransaction]);

    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;
        const userMsg: Message = { role: 'user', content: chatInput };
        const newMsgs = [...chatMessages, userMsg];
        setChatMessages(newMsgs);
        setChatInput('');
        setLoadingChat(true);
        try {
            const res = await fetch(
                `${AZURE_OPENAI_BASE}/openai/deployments/${AZURE_OPENAI_MODEL}/chat/completions?api-version=${AZURE_OPENAI_VERSION}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': AZURE_OPENAI_KEY
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            ...newMsgs
                        ],
                        max_tokens: 500,
                        temperature: 0.7
                    })
                }
            );
            const data = await res.json();
            const assistantMsg: Message = {
                role: 'assistant',
                content: data.choices[0].message.content
            };
            setChatMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('Error:', error);
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
        } finally {
            setLoadingChat(false);
        }
    };

    return (
        <div className="text-sm border-2 rounded-lg border-[#74a8fc] px-6 py-2 my-6 bg-[#1f1f1f]">
            <p>
                <span className="text-[#a3a3a3] text-sm">
                    {props.walletPubkey.toString().substring(0, 32)}...
                </span>
            </p>
            <p className="text-xl mb-2">
                <span className="text-[#29d688]">
                    {props.displayName}
                </span>
                <span className="ml-10 text-[#74a8fc]">
                    {props.handle}
                </span>
            </p>
            <input
                className="w-96 h-8 text-black px-4 rounded-md"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button
                className="text-md text-black border-2 rounded-lg border-[#6e6e6e] px-6 py-1 mt-2 ml-4 bg-[#29d688]"
                onClick={() => onClickPublishTweet(message)}
            >
                Publish
            </button>
            {moderationError && (
                <p className="text-red-500 mt-2">{moderationError}</p>
            )}

            {/* AI Bot Toggle */}
            <button
                className="ml-4 mt-2 p-2 rounded-full bg-[#ffa500] text-white"
                onClick={() => setShowChat(prev => !prev)}
                title="AIbot"
            >
                🤖
            </button>

            {/* Chat Interface */}
            {showChat && (
                <div className="mt-4 p-4 border rounded-lg bg-white text-black max-w-md">
                    <h2 className="text-lg font-bold mb-2">DTW AI Agent</h2>
                    <div className="h-64 overflow-y-auto mb-2 border p-2">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={msg.role === 'user' ? 'text-right mb-1' : 'text-left mb-1'}>
                                <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-200' : 'bg-gray-200'}`}>
                                    {msg.content}
                                </span>
                            </div>
                        ))}
                        {loadingChat && <p className="italic text-gray-500">AI is typing...</p>}
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            placeholder="Ask me about lung health..."
                            className="flex-grow border rounded-l-lg p-2 outline-none"
                            disabled={loadingChat}
                        />
                        <button
                            onClick={sendChatMessage}
                            className="bg-blue-600 text-white px-4 rounded-r-lg disabled:opacity-50"
                            disabled={loadingChat}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
