import React, { useEffect, useRef, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  isShooting: boolean;
  shootingSpeed?: number;
  trail?: { x: number; y: number; opacity: number }[];
}

const NightSkyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);
  const animationRef = useRef<number>();

  // Initialize stars
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      
      // Regular twinkling stars
      for (let i = 0; i < 200; i++) {
        newStars.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.7,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          isShooting: false,
        });
      }

      // Shooting stars
      for (let i = 200; i < 210; i++) {
        newStars.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight * 0.3,
          size: Math.random() * 1.5 + 1,
          opacity: 0.8,
          twinkleSpeed: 0,
          isShooting: true,
          shootingSpeed: Math.random() * 2 + 1,
          trail: [],
        });
      }

      setStars(newStars);
    };

    generateStars();
    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);
  }, []);

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      setStars(prevStars => 
        prevStars.map(star => {
          if (star.isShooting) {
            // Update shooting star
            const newStar = { ...star };
            newStar.x += newStar.shootingSpeed! * 0.5;
            newStar.y += newStar.shootingSpeed! * 0.3;

            // Add to trail
            if (!newStar.trail) newStar.trail = [];
            newStar.trail.push({ x: newStar.x, y: newStar.y, opacity: newStar.opacity });
            if (newStar.trail.length > 15) {
              newStar.trail.shift();
            }

            // Reset if off screen
            if (newStar.x > canvas.width + 50 || newStar.y > canvas.height + 50) {
              newStar.x = -50;
              newStar.y = Math.random() * canvas.height * 0.3;
              newStar.trail = [];
            }

            return newStar;
          } else {
            // Update twinkling star
            return {
              ...star,
              opacity: Math.sin(Date.now() * star.twinkleSpeed) * 0.3 + 0.7,
            };
          }
        })
      );

      // Draw stars
      stars.forEach(star => {
        if (star.isShooting && star.trail) {
          // Draw shooting star trail
          star.trail.forEach((point, index) => {
            const trailOpacity = (index / star.trail!.length) * point.opacity * 0.6;
            const gradient = ctx.createRadialGradient(
              point.x, point.y, 0,
              point.x, point.y, star.size * 2
            );
            gradient.addColorStop(0, `rgba(200, 220, 255, ${trailOpacity})`);
            gradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(point.x, point.y, star.size * (index / star.trail!.length + 0.5), 0, Math.PI * 2);
            ctx.fill();
          });
        }

        // Draw star
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 3
        );
        
        if (star.isShooting) {
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.opacity * 0.8})`);
          gradient.addColorStop(1, `rgba(150, 180, 255, 0)`);
        } else {
          gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
          gradient.addColorStop(0.5, `rgba(200, 220, 255, ${star.opacity * 0.6})`);
          gradient.addColorStop(1, `rgba(180, 200, 255, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stars]);

  return (
    <div className="fixed inset-0 -z-10">
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(75, 0, 130, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 80%, rgba(25, 25, 112, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, 
              #0a0a1a 0%, 
              #1a1a3a 25%, 
              #2a2a5a 50%, 
              #1a1a3a 75%, 
              #0a0a1a 100%
            )
          `
        }}
      />

      {/* Nebula Effects */}
      <div 
        className="absolute inset-0 opacity-30 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
          background: `
            radial-gradient(ellipse 800px 400px at 20% 30%, rgba(138, 43, 226, 0.1) 0%, transparent 70%),
            radial-gradient(ellipse 600px 300px at 80% 70%, rgba(72, 61, 139, 0.1) 0%, transparent 70%)
          `
        }}
      />

      {/* Moon */}
      <div 
        className="absolute transition-transform duration-1000 ease-out"
        style={{
          top: '15%',
          right: '20%',
          transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
        }}
      >
        {/* Moon Glow */}
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-gradient-radial from-blue-200/20 via-blue-300/10 to-transparent blur-xl scale-150" />
        
        {/* Moon Body */}
        <div className="relative w-32 h-32 rounded-full bg-gradient-radial from-gray-100 via-blue-100 to-gray-300 shadow-2xl">
          {/* Moon Craters */}
          <div className="absolute top-6 left-8 w-3 h-3 rounded-full bg-gray-400/30" />
          <div className="absolute top-12 right-6 w-2 h-2 rounded-full bg-gray-400/20" />
          <div className="absolute bottom-8 left-12 w-4 h-4 rounded-full bg-gray-400/25" />
        </div>
      </div>

      {/* Clouds */}
      <div 
        className="absolute inset-0 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
        }}
      >
        <div className="absolute top-1/4 left-1/3 w-96 h-24 rounded-full bg-gradient-to-r from-transparent via-blue-200/5 to-transparent blur-sm" />
        <div className="absolute top-1/3 right-1/4 w-80 h-20 rounded-full bg-gradient-to-l from-transparent via-purple-200/5 to-transparent blur-sm" />
      </div>

      {/* Animated Stars Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
        }}
      />

      {/* Mountain Silhouette */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
          background: `
            linear-gradient(to top, rgba(10, 10, 26, 0.9) 0%, transparent 100%),
            polygon(0% 100%, 15% 60%, 25% 80%, 40% 40%, 55% 70%, 70% 30%, 85% 65%, 100% 45%, 100% 100%)
          `,
          clipPath: 'polygon(0% 100%, 15% 60%, 25% 80%, 40% 40%, 55% 70%, 70% 30%, 85% 65%, 100% 45%, 100% 100%)',
        }}
      />

      {/* Water Reflection */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          background: `
            linear-gradient(to bottom, 
              rgba(100, 150, 255, 0.1) 0%, 
              rgba(50, 100, 200, 0.05) 50%, 
              rgba(20, 50, 150, 0.02) 100%
            )
          `,
        }}
      >
        {/* Moonlight Reflection */}
        <div className="absolute top-0 right-1/4 w-2 h-full bg-gradient-to-b from-blue-200/20 to-transparent blur-sm" />
      </div>
    </div>
  );
};

export default NightSkyBackground;