import { useEffect, useRef } from "react";

// Lightweight canvas confetti — no external lib needed
const COLORS = ["#c9a84c", "#f0d080", "#fff", "#a78bfa", "#34d399", "#f472b6", "#60a5fa"];
const SHAPES = ["circle", "rect", "star"];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

class Particle {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset(true);
  }
  reset(initial = false) {
    const cx = this.canvas.width / 2;
    this.x = cx + randomBetween(-60, 60);
    this.y = initial ? this.canvas.height / 2 : this.canvas.height / 2;
    const angle = randomBetween(-Math.PI * 1.1, -Math.PI * 0.1); // upward spread
    const speed = randomBetween(6, 18);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.gravity = randomBetween(0.25, 0.45);
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
    this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    this.size = randomBetween(6, 13);
    this.rotation = randomBetween(0, Math.PI * 2);
    this.rotSpeed = randomBetween(-0.15, 0.15);
    this.alpha = 1;
    this.decay = randomBetween(0.012, 0.022);
    this.alive = true;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.vx *= 0.99;
    this.rotation += this.rotSpeed;
    this.alpha -= this.decay;
    if (this.alpha <= 0) this.alive = false;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    if (this.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.shape === "rect") {
      ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    } else {
      // star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? this.size / 2 : this.size / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

const Confetti = ({ active, onDone }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // burst: 120 particles in 3 waves
    const particles = [];
    const burst = () => {
      for (let i = 0; i < 40; i++) particles.push(new Particle(canvas));
    };
    burst();
    setTimeout(burst, 120);
    setTimeout(burst, 260);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => { p.update(); p.draw(ctx); });
      // remove dead
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].alive) particles.splice(i, 1);
      }
      if (particles.length > 0) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onDone?.();
      }
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        pointerEvents: "none", width: "100%", height: "100%",
      }}
    />
  );
};

export default Confetti;
