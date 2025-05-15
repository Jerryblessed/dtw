// File: pages/_app.tsx
import "../styles/globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

import { AppProps } from 'next/app';
import Head from 'next/head';
import React, { FC, useState, useEffect } from 'react';
import { ContextProvider } from '../contexts/ContextProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Static Earth + animated nodes & connecting lines
const EarthLogo: FC = () => (
  <svg viewBox="0 0 200 200" className="w-40 h-40 mb-4">
    <circle cx="100" cy="100" r="80" fill="#1f0536" />
    <path d="M60,70 C80,60 120,60 140,80 C130,100 90,110 70,90 Z" fill="#5e3c8c" />
    {[
      { x: 130, y: 60, delay: '0s' },
      { x: 60, y: 120, delay: '0.5s' },
      { x: 150, y: 140, delay: '1s' },
    ].map((n, i) => (
      <circle key={i} cx={n.x} cy={n.y} r="5" fill="#fff">
        <animate
          attributeName="r"
          values="5;8;5"
          dur="2s"
          repeatCount="indefinite"
          begin={n.delay}
        />
      </circle>
    ))}
    <line
      x1="130" y1="60" x2="60" y2="120"
      stroke="#fff" strokeWidth="1" opacity="0.6"
      className="line-anim-1"
    />
    <line
      x1="60" y1="120" x2="150" y2="140"
      stroke="#fff" strokeWidth="1" opacity="0.6"
      className="line-anim-2"
    />
  </svg>
);

// Rotating testimonials
const testimonials = [
  { name: 'Bob', text: '"Final project complete 🎉"' },
  { name: 'Joe', text: '"Admitted to Oxford 🎓"' },
  { name: 'Mary', text: '"Landed Upwork project 🤝"' },
  { name: 'Collins', text: '"Earned Python certificate 🎓"' },
];


const FEATURES = ['🔗 Solana-blockchain', '✅AI-Verified', '🌐 RPC-based', '🪙SOL support'];

const LandingPage: FC = () => {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showCoin, setShowCoin] = useState(false);
  const [coinMap] = useState<boolean[]>(() =>
    testimonials.map(() => Math.random() < 0.6) // ~60% chance
  );

  useEffect(() => {
    // Initial coin pop if needed
    if (coinMap[0]) {
      setTimeout(() => { setShowCoin(true); setTimeout(() => setShowCoin(false), 2000); }, 1000);
    }
    // Cycle testimonials
    const cycle = setInterval(() => {
      setVisible(false);
      setShowCoin(false);
      setTimeout(() => {
        const next = (idx + 1) % testimonials.length;
        setIdx(next);
        setVisible(true);
        if (coinMap[next]) {
          setTimeout(() => { setShowCoin(true); setTimeout(() => setShowCoin(false), 2000); }, 800);
        }
      }, 1500);
    }, 8000);
    return () => clearInterval(cycle);
  }, [idx, coinMap]);

  const { name, text } = testimonials[idx];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen">
      {/* Left: animated bg + content */}
      <div className="hidden md:flex items-center justify-center animated-bg relative">
        <div className="text-center p-8 space-y-6">
          <EarthLogo />
          <h1 className="text-4xl font-bold text-white">Decentralized Testimonial Tweet</h1>
          <h2 className="text-2xl font-semibold text-purple-200">(DTW)</h2>
          <p className="text-lg text-white">{FEATURES.join(' • ')}</p>
          <div
            className={`mx-auto max-w-md text-3xl text-white italic transition-opacity duration-1500 ${visible ? 'opacity-100' : 'opacity-0'
              }`}
          >
            <strong>{name}:</strong> {text}
          </div>
        </div>
        {showCoin && (
          <div className="absolute bottom-32 right-1/2 transform translate-x-1/2 text-xl text-yellow-300 animate-coin">
            +0.2 SOL 🪙
          </div>
        )}
      </div>

      {/* Right: wallet connect */}
      <div className="flex items-center justify-center bg-white">
        <div className="max-w-sm w-full p-6 text-center space-y-5">
          <h2 className="text-2xl font-semibold">Welcome to DTW</h2>
          <WalletMultiButton className="w-full py-2 rounded-lg text-lg" />
        </div>
      </div>

      {/* Global CSS */}
      <style jsx global>{`
        @keyframes bgCycle {
          0%, 20%   { background-image: linear-gradient(135deg, #1f0536, #5e3c8c); }
          40%       { background-image: linear-gradient(135deg, #000, #2c003e); }
          60%       { background-image: linear-gradient(135deg, #701a75, #d946ef); }
          80%,100%  { background-image: linear-gradient(135deg, #1f0536, #5e3c8c); }
        }
        .animated-bg {
          animation: bgCycle 60s ease-in-out infinite;
          background-size: 400% 400%;
        }
        .line-anim-1 {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw1 4s ease-in-out infinite;
        }
        .line-anim-2 {
          stroke-dasharray: 70;
          stroke-dashoffset: 70;
          animation: draw2 5s ease-in-out infinite;
        }
        @keyframes draw1 { to { stroke-dashoffset: 0; } }
        @keyframes draw2 { to { stroke-dashoffset: 0; } }
        .animate-coin {
          animation: floatUp 2s ease-out forwards;
        }
        @keyframes floatUp {
          0%   { opacity: 0; transform: translate(-50%, 20px) scale(0.8); }
          20%  { opacity: 1; transform: translate(-50%, -20px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -60px) scale(0.8); }
        }
      `}</style>
    </div>
  );
};

const WalletGate: FC<AppProps> = ({ Component, pageProps }) => {
  const { connected } = useWallet();
  if (!connected) return <LandingPage />;
  return (
    <div className="flex flex-col h-screen">
      <Head><title>DTW</title></Head>
      <Notifications />
      <AppBar />
      <ContentContainer>
        <Component {...pageProps} />
      </ContentContainer>
      <Footer />
    </div>
  );
};

const App: FC<AppProps> = props => (
  <ContextProvider>
    <WalletGate {...props} />
  </ContextProvider>
);

export default App;
