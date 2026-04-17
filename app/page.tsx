"use client";

import { useCallback, useState } from "react";
import Navbar from "@/components/Navbar";
import ParticlesBackground from "@/components/ParticlesBackground";
import HeroSection from "@/components/HeroSection";
import PrizePoolSection from "@/components/PrizePoolSection";
import GameSection from "@/components/GameSection";
import HowToPlaySection from "@/components/HowToPlaySection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  const [prizePool, setPrizePool] = useState(0);

  const handlePrizePoolChange = useCallback((v: number) => {
    setPrizePool(v);
  }, []);

  return (
    <>
      <ParticlesBackground />
      <Navbar />
      <main>
        <HeroSection />
        <PrizePoolSection prizePool={prizePool} />
        <GameSection onPrizePoolChange={handlePrizePoolChange} />
        <HowToPlaySection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
