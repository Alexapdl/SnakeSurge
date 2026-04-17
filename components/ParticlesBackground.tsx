"use client";

import { useEffect } from "react";

export default function ParticlesBackground() {
  useEffect(() => {
    const container = document.getElementById("bgParticles");
    if (!container) return;
    container.innerHTML = "";
    const colors = ["#8b5cf6", "#06d6a0", "#f72585", "#4cc9f0", "#ffd60a"];
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.animationDuration = 8 + Math.random() * 15 + "s";
      particle.style.animationDelay = Math.random() * 10 + "s";
      particle.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      const size = 2 + Math.random() * 4 + "px";
      particle.style.width = size;
      particle.style.height = size;
      container.appendChild(particle);
    }
  }, []);

  return <div className="bg-particles" id="bgParticles" />;
}
