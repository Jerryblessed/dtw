// File: components/SolanaTwitter.tsx
import React, { FC, useCallback, useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import useTwitterAccountStore from "../stores/useProfileStore";
import useTweetsStore, { TweetType } from "../stores/useTweetStore";
import { WriteTweet } from './WriteTweet';
import { Tweet } from "./Tweet";
import * as util from '../utils/util';

interface Category {
    key: string;
    label: string;
    icon: string;
    keywords: string[];
}

// Helper to extract email from handle
const extractEmail = (fullHandle: string) => {
    const parts = fullHandle.split('+');
    return parts.length > 2 ? parts[parts.length - 1] : '';
};

export const SolanaTwitter: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

const { tweets, getAllTweets } = useTweetsStore();
const { profile, getProfile } = useTwitterAccountStore();
const { getUserSOLBalance } = useUserSOLBalanceStore();

// Account creation state
const [displayName, setName] = useState("");
const [baseHandle, setBaseHandle] = useState("");
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [email, setEmail] = useState("");

// Tweet composition categories
const [tweetCats, setTweetCats] = useState<string[]>([]);

// Tweet caching and loading
const [localTweets, setLocalTweets] = useState<TweetType[]>([]);
const [loading, setLoading] = useState(true);

const categories: Category[] = [
    { key: 'electrical', label: 'Electrical', icon: '⚡️', keywords: ['quantum', 'power'] },
    { key: 'mechanical', label: 'Mechanical', icon: '⚙️', keywords: ['project', 'Upwork'] },
    { key: 'farming', label: 'Farming', icon: '🌾', keywords: ['farm', 'farming'] },
    { key: 'coding', label: 'Coding', icon: '💻', keywords: ['processing', 'certificate'] },
    { key: 'fashion', label: 'Fashion', icon: '👗', keywords: ['project', 'design'] },
    { key: 'construction', label: 'Construction', icon: '🚧', keywords: ['build', 'site'] },
];

// on mount: load cache, then fetch chain data
useEffect(() => {
    const cached = localStorage.getItem("tweetsCache");
    if (cached) {
        const parsed: TweetType[] = JSON.parse(cached).map((t: any) => ({
            ...t,
            tweetPubkey: new PublicKey(t.tweetPubkey),
            profilePubkey: new PublicKey(t.profilePubkey),
            walletPubkey: new PublicKey(t.walletPubkey),
        }));
        setLocalTweets(parsed);
        setLoading(false);
    }
    getAllTweets(wallet);
}, [wallet, getAllTweets]);

// sync chain → cache, converting any string keys
useEffect(() => {
    if (tweets.length > 0) {
        const converted = tweets.map(t => ({
            ...t,
            tweetPubkey: typeof t.tweetPubkey === 'string' ? new PublicKey(t.tweetPubkey) : t.tweetPubkey,
            profilePubkey: typeof t.profilePubkey === 'string' ? new PublicKey(t.profilePubkey) : t.profilePubkey,
            walletPubkey: typeof t.walletPubkey === 'string' ? new PublicKey(t.walletPubkey) : t.walletPubkey,
        }));
        setLocalTweets(converted);
        localStorage.setItem("tweetsCache", JSON.stringify(converted));
        setLoading(false);
    }
}, [tweets]);

// ensure tweets list updates after a new tweet is posted
useEffect(() => {
    // whenever tweet count changes, refetch
    getAllTweets(wallet);
}, [tweets.length, wallet, getAllTweets]);

// load profile & balance
useEffect(() => {
    getProfile(wallet);
    if (publicKey) getUserSOLBalance(publicKey, connection);
}, [wallet, publicKey, connection, getProfile, getUserSOLBalance]);

// create account
const onClickCreateAccount = useCallback(async () => {
    const handle = baseHandle.startsWith('@') ? baseHandle : `@${ baseHandle } `;
    const abbrevs = selectedCategories.map(k => k.slice(0, 4));
    const fullHandle = `${ handle } +${ abbrevs.join(',') } +${ email } `;
    const tx = await util.createProfileTransaction(wallet, fullHandle, displayName);
    await connection.confirmTransaction(await sendTransaction(tx, connection));
    getProfile(wallet);
}, [baseHandle, selectedCategories, email, displayName, wallet, connection, sendTransaction, getProfile]);

// filter cached tweets by selected tweet categories
const filteredTweets = localTweets.filter(t => {
    if (tweetCats.length === 0) return true;
    const parts = t.handle.split('+');
    if (parts.length < 2) return false;
    const tags = parts[1].split(',');
    return tweetCats.some(cat => tags.includes(cat.slice(0, 4)));
});

return (
    <div className="p-4 max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl font-bold text-center text-white">Welcome to DTW</h1>

        {publicKey ? (
            profile ? (
                <>
                    {/* Tweet category selection */}
                    <div className="space-y-2">
                        <p className="font-semibold text-white">Select Tweet Category:</p>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => {
                                const sel = tweetCats.includes(cat.key);
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => setTweetCats(sel ? tweetCats.filter(k => k !== cat.key) : [...tweetCats, cat.key])}
                                        className={`px - 3 py - 1 rounded - full border ${ sel ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800' } `}
                                    >
                                        {cat.icon} {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Write Tweet */}
                    <WriteTweet
                        tweetCategories={tweetCats}
                        getAllTweets={getAllTweets}
                        walletPubkey={profile.walletPubkey}
                        profilePubkey={profile.profilePublishkey}
                        displayName={profile.displayName}
                        handle={profile.handle}
                        tweetCount={profile.tweetCount}
                        email={extractEmail(profile.handle)}
                    />

                    {/* Loading / Cache indicator */}
                    {loading && (
                        <div className="text-center text-white">Be patient while we fetch chain data…</div>
                    )}

                    {/* Tweet list */}
                    <div className="space-y-4">
                        {filteredTweets.map((t, i) => (
                            <div key={i}>
                                <Tweet {...t} getAllTweets={getAllTweets} />
                                <button
                                    onClick={() => alert(`Email: ${ extractEmail(t.handle) } `)}
                                    className="text-xs text-blue-500 underline mt-1"
                                >
                                    View Email
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                // Account Creation Form
                <div className="space-y-4 text-black">
                    <div>
                        <label className="block mb-1">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-black"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Handle (@username)</label>
                        <input
                            type="text"
                            value={baseHandle}
                            onChange={e => setBaseHandle(e.target.value.replace(/^@/, ''))}
                            placeholder="without @"
                            className="w-full px-3 py-2 border rounded text-black"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Select ≥3 Categories</label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => {
                                const sel = selectedCategories.includes(cat.key);
                                return (
                                    <button
                                        key={cat.key}
                                        onClick={() => setSelectedCategories(sel ? selectedCategories.filter(k => k !== cat.key) : [...selectedCategories, cat.key])}
                                        className={`p - 2 border rounded - lg flex items - center space - x - 1 ${ sel ? 'bg-purple-600 text-white' : 'bg-gray-100 text-black' } `}
                                    >
                                        {cat.icon}<span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedCategories.length < 3 && (
                            <p className="text-red-500 text-sm mt-1">Pick at least 3</p>
                        )}
                    </div>
                    <div>
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded text-black"
                        />
                    </div>
                    <button
                        onClick={onClickCreateAccount}
                        disabled={!displayName || !baseHandle || selectedCategories.length < 3 || !/\S+@\S+\.\S+/.test(email)}
                        className="w-full py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                    >
                        Create Account
                    </button>
                </div>
            )
        ) : (
            <div className="text-center py-6 bg-gray-800 text-white rounded-lg">
                Connect your wallet to log in/sign up!
            </div>
        )}
    </div>
);

};
