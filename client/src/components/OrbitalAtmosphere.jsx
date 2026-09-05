import React, { useEffect, useRef } from 'react';

export const OrbitalAtmosphere = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse Parallax Targets
    let mouseX = width / 2;
    let mouseY = height / 2;
    let currentMouseX = width / 2;
    let currentMouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate ~45 faint drifting star particles
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.25 + 0.05,
      baseAlpha: Math.random() * 0.25 + 0.05,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseAngle: Math.random() * Math.PI * 2,
    }));

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      currentMouseX += (mouseX - currentMouseX) * 0.03;
      currentMouseY += (mouseY - currentMouseY) * 0.03;
      const offsetX = (currentMouseX - width / 2) * 0.025;
      const offsetY = (currentMouseY - height / 2) * 0.025;

      // 1. Render Soft Atmospheric Radial Glow
      const glowX = width * 0.5 + offsetX;
      const glowY = height * 0.3 + offsetY;
      const radGrad = ctx.createRadialGradient(glowX, glowY, 50, glowX, glowY, width * 0.65);
      radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.035)');
      radGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.015)');
      radGrad.addColorStop(1, 'rgba(11, 14, 20, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Render Faint Concentric Orbital Arcs
      rotationAngle += 0.0008;
      ctx.save();
      ctx.translate(width * 0.7 + offsetX * 0.5, height * 0.4 + offsetY * 0.5);
      ctx.rotate(rotationAngle);

      // Orbit Ring 1
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.35, height * 0.2, -Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 12]);
      ctx.stroke();

      // Orbit Ring 2
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.5, height * 0.3, Math.PI / 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.03)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 16]);
      ctx.stroke();

      ctx.restore();

      // 3. Render Drifting Star Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        p.pulseAngle += p.pulseSpeed;
        p.alpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.1;
        p.alpha = Math.max(0.02, Math.min(0.4, p.alpha));

        const px = p.x + offsetX * (p.size * 0.5);
        const py = p.y + offsetY * (p.size * 0.5);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    />
  );
};

export default OrbitalAtmosphere;
