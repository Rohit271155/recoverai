import React, { useEffect, useRef } from 'react';

export const GalaxyBackground = () => {
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

    // Smooth Mouse Parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let currentMouseX = width / 2;
    let currentMouseY = height / 2;

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate 180 stars across 3 parallax depth layers
    const starCount = 180;
    const stars = Array.from({ length: starCount }, () => {
      const depth = Math.random(); // 0 (far) to 1 (near)
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        depth: depth,
        size: depth * 1.8 + 0.4,
        baseAlpha: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.4 + 0.1,
        speedX: (Math.random() - 0.5) * 0.08 * (depth + 0.2),
        speedY: (Math.random() - 0.5) * 0.08 * (depth + 0.2),
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseAngle: Math.random() * Math.PI * 2,
        isBright: Math.random() > 0.92,
      };
    });

    // Orbital particles travelling along concentric rings
    const ringParticles = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 250 + 200,
      speed: (Math.random() * 0.002 + 0.0008) * (Math.random() > 0.5 ? 1 : -1),
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#10B981' : '#3B82F6',
    }));

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Mouse lerp
      currentMouseX += (mouseX - currentMouseX) * 0.03;
      currentMouseY += (mouseY - currentMouseY) * 0.03;
      const offsetX = (currentMouseX - width / 2) * 0.03;
      const offsetY = (currentMouseY - height / 2) * 0.03;

      // 1. Deep Space Base Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#06080E');
      bgGrad.addColorStop(0.5, '#0B0E17');
      bgGrad.addColorStop(1, '#06080E');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Atmospheric Nebula Clouds (Stark Blue & Emerald)
      const nebula1X = width * 0.25 + offsetX * 0.4;
      const nebula1Y = height * 0.3 + offsetY * 0.4;
      const grad1 = ctx.createRadialGradient(nebula1X, nebula1Y, 50, nebula1X, nebula1Y, width * 0.45);
      grad1.addColorStop(0, 'rgba(59, 130, 246, 0.06)');
      grad1.addColorStop(0.5, 'rgba(139, 92, 246, 0.025)');
      grad1.addColorStop(1, 'rgba(6, 8, 14, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const nebula2X = width * 0.75 + offsetX * 0.6;
      const nebula2Y = height * 0.6 + offsetY * 0.6;
      const grad2 = ctx.createRadialGradient(nebula2X, nebula2Y, 60, nebula2X, nebula2Y, width * 0.5);
      grad2.addColorStop(0, 'rgba(16, 185, 129, 0.05)');
      grad2.addColorStop(0.6, 'rgba(59, 130, 246, 0.02)');
      grad2.addColorStop(1, 'rgba(6, 8, 14, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // 3. Faint Orbital Scanning Arcs & Rings
      rotationAngle += 0.0006;
      const centerX = width * 0.5 + offsetX * 0.5;
      const centerY = height * 0.35 + offsetY * 0.5;

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationAngle);

      // Outer Orbital Ring 1
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.42, height * 0.22, -Math.PI / 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.stroke();

      // Outer Orbital Ring 2 (Emerald)
      ctx.beginPath();
      ctx.ellipse(0, 0, width * 0.55, height * 0.3, Math.PI / 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 16]);
      ctx.stroke();

      ctx.restore();

      // 4. Ring Particles Travelling along Paths
      ringParticles.forEach((rp) => {
        rp.angle += rp.speed;
        const px = centerX + Math.cos(rp.angle) * rp.radius;
        const py = centerY + Math.sin(rp.angle) * (rp.radius * 0.5);

        ctx.beginPath();
        ctx.arc(px, py, rp.size, 0, Math.PI * 2);
        ctx.fillStyle = rp.color;
        ctx.shadowColor = rp.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 5. 3D Stars Across 3 Parallax Layers
      stars.forEach((s) => {
        s.x += s.speedX;
        s.y += s.speedY;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        s.pulseAngle += s.pulseSpeed;
        s.alpha = s.baseAlpha + Math.sin(s.pulseAngle) * 0.15;
        s.alpha = Math.max(0.04, Math.min(0.7, s.alpha));

        const px = s.x + offsetX * (s.depth * 1.5);
        const py = s.y + offsetY * (s.depth * 1.5);

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.isBright
          ? `rgba(167, 243, 208, ${s.alpha * 1.2})`
          : `rgba(226, 232, 240, ${s.alpha})`;
        ctx.fill();

        // Cross Flare for Bright Stars
        if (s.isBright && s.alpha > 0.4) {
          ctx.strokeStyle = `rgba(52, 211, 153, ${s.alpha * 0.5})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(px - 4, py);
          ctx.lineTo(px + 4, py);
          ctx.moveTo(px, py - 4);
          ctx.lineTo(px, py + 4);
          ctx.stroke();
        }
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

export default GalaxyBackground;
