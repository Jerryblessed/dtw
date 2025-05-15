import { FC, useCallback, useEffect, useState } from "react";
import {
    AnchorWallet,
    useAnchorWallet,
    useConnection,
    useWallet
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
    createLikeTransaction,
    createRetweetTransaction,
    getLike,
    getRetweet,
} from '../utils/util';

interface TweetProps {
    getAllTweets: (wallet: AnchorWallet) => void;
    walletPubkey: PublicKey;
    profilePubkey: PublicKey;
    tweetPubkey: PublicKey;
    displayName: string;
    handle: string;
    message: string;
    likeCount: number;
    retweetCount: number;
    tweetLiked: boolean;
    tweetRetweeted: boolean;
};

export const Tweet: FC<TweetProps> = (props: TweetProps) => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const wallet = useAnchorWallet();

const [tweetRetweeted, setTweetRetweeted] = useState<boolean>(props.tweetRetweeted);
const [tweetLiked, setTweetLiked] = useState<boolean>(props.tweetLiked);

async function getTweetLiked(wallet: AnchorWallet, tweetPubkey: PublicKey) {
    try {
        const like = await getLike(wallet, tweetPubkey);
        return like ? true : false;
    } catch {
        return false;
    }
}

async function getTweetRetweeted(wallet: AnchorWallet, tweetPubkey: PublicKey) {
    try {
        const retweet = await getRetweet(wallet, tweetPubkey);
        return retweet ? true : false;
    } catch {
        return false;
    }
}

const onClickRetweetTweet = useCallback(async () => {
    if (!tweetRetweeted) {
        const tx = await createRetweetTransaction(wallet, props.tweetPubkey);
        await connection.confirmTransaction(
            await sendTransaction(tx, connection)
        );
        props.getAllTweets(wallet);
        setTweetRetweeted(
            await getTweetRetweeted(wallet, props.tweetPubkey)
        );
    }
}, [wallet, props.tweetPubkey, tweetRetweeted]);

const onClickLikeTweet = useCallback(async () => {
    if (!tweetLiked) {
        const tx = await createLikeTransaction(wallet, props.tweetPubkey);
        await connection.confirmTransaction(
            await sendTransaction(tx, connection)
        );
        props.getAllTweets(wallet);
        setTweetLiked(
            await getTweetLiked(wallet, props.tweetPubkey)
        );
    }
}, [tweetLiked]);

    const msg = props.message.toLowerCase();
    let imageSrc = '/badges/default.png'; // default badge fallback

    if (msg.includes('electrical') || msg.includes('electronics') || msg.includes('circuit')) {
        imageSrc = '/badges/badge_electrical_sdxl.jpg';
    } else if (msg.includes('fashion')) {
        imageSrc = '/badges/badge_fashion_sdxl.jpg';
    } else if (msg.includes('coding') || msg.includes('aptech')) {
        imageSrc = '/badges/badge_coding_sdxl.jpg';
    } else if (msg.includes('construction') || msg.includes('site') || msg.includes('stone') || msg.includes('bricks')) {
        imageSrc = '/badges/badge_construction_sdxl.jpg';
    } else if (msg.includes('farm') || msg.includes('agriculture') || msg.includes('crop')) {
        imageSrc = '/badges/badge_farming_sdxl.jpg';
    } else if (msg.includes('restaurant') || msg.includes('chef') || msg.includes('resturant') || msg.includes('food') || msg.includes('restuarant')) {
        imageSrc = '/badges/badge_restaurant_sdxl.jpg';
    }


return (
    <div className="text-sm border-2 rounded-lg border-[#6e6e6e] px-6 py-4 mt-4 bg-[#1f1f1f]">
        <p className="text-[#a3a3a3] text-sm truncate">
            {props.walletPubkey.toString().substring(0, 32)}...
        </p>

        <p className="text-lg mt-2">
            <span className="text-[#29d688]">{props.displayName}</span>
            <span className="ml-4 text-[#74a8fc]">{props.handle}</span>
        </p>

        {/* Centralized image */}
        <div className="flex justify-center my-4">
            <div className="w-40 h-40">
                <img
                    src={imageSrc}
                    alt="tweet"
                    className="w-full h-full object-contain rounded"
                />
            </div>
        </div>

        <p className="my-2 text-lg text-center">{props.message}</p>

        <p className="text-center">
            <span className="cursor-pointer text-[#29d688]" onClick={onClickRetweetTweet}>
                🔁
            </span>
            <span className="ml-2 text-[#29d688]">{props.retweetCount}</span>

            <span className="ml-6 cursor-pointer text-[#de6fd8]" onClick={onClickLikeTweet}>
                💖
            </span>
            <span className="ml-2 text-[#de6fd8]">{props.likeCount}</span>
        </p>
    </div>
);

};
