import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>DTW</title>
        <meta
          name="description"
          content="Decentralized testimonial Tweet"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
