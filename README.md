# Decentralized Testimonial Tweet (DTW)

[🌐 Goto Web3 app ](https://gibbon-clever-bream.ngrok-free.app/dtw)

[📈 Goto presentation slide ](https://docs.google.com/presentation/d/1HjA1pPfhq8lztDtjqDrUgsAL6qAkqzO8LnwLm3e8vDw/edit?usp=sharing)

DTW is a DApp Solana-powered dApp where users publish AI-verified testimonials in areas like Coding 💻, Fashion 👗, and Farming 🌾. An onboard AI agent screens for harmful content and suggests improvements. Approved posts are stored immutably on-chain, and users earn Solana testnet tokens for every like and retweet—promoting truth, skill growth, and real opportunity.



## Architecture Flow

```text
+---------------------+
|   🧑  User Wallet    |
| (Connect to DTW App)|
+---------+-----------+
          |
          v
+----------------------------+
| 🎁 Manual Token Airdrop    |  ← User clicks "Monthly Airdrop"
| (Once/month enforcement)   |
+------------+---------------+
             |
             v
+------------------------------+
| ✍️ Post / ❤️ Like / 🔁 Retweet |
| (Spend small tokens to act)  |
+-------------+----------------+
              |
              v
+-------------------------------------+
| 🤖 AI Agent Moderation              |
| - Azure OpenAI API                  |
| - Screens content for violations    |
| - Suggests improvements             |
+-----------------+-------------------+
                  |
                  v
     +-------------------------------+
     | ✅ Verified Content Approved  |
     |   + Stored on Solana Devnet   |
     |   + Engagement counters updated|
     +---------------+---------------+
                     |
                     v
     +-------------------------------+
     | 🏅 Badge Granted (Not Minted) |
     | - 1 badge per approved post   |
     +-------------------------------+

```
![Landing Page 1](https://github.com/Jerryblessed/dtw/blob/main/app_v2/public/screenshort/landing1.png?raw=true)
![Landing Page 2](https://github.com/Jerryblessed/dtw/blob/main/app_v2/public/screenshort/landing2.png?raw=true)
![Home Screen](https://github.com/Jerryblessed/dtw/blob/main/app_v2/public/screenshort/homescreen.png?raw=true)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Jerryblessed/dtw.git
cd dtw/app_v2

# Setup environment variables
cp .env.example .env  # or manually rename .env.example to .env

# Install dependencies
npm install

# Run in development mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

*For full details, see the source code and docs in the repository.*
