import { useEffect, useRef } from 'react';
import { skyPhase } from '../utils/format';

const PALETTES = {
  light: {
    day: {
      clear: ['#7ec8ff', '#ffd9a8', '#f6f1e8'],
      partly: ['#9fd0f2', '#f3e0c6', '#f5f0e8'],
      cloudy: ['#c5d0db', '#dde3ea', '#ece8e2'],
      fog: ['#d9e0e6', '#e7e6e2', '#f1efe9'],
      drizzle: ['#a9bdd0', '#d4dde6', '#e8e4dc'],
      rain: ['#7f97ab', '#c3ced8', '#e2ddd6'],
      snow: ['#e7f1fa', '#f7f5f2', '#f4efe8'],
      thunder: ['#5c5772', '#b7b4c6', '#ddd8d2'],
    },
    night: {
      clear: ['#24345c', '#6d7ea8', '#e7e2d8'],
      partly: ['#2a3a60', '#7d88a8', '#e6e1d8'],
      cloudy: ['#3a4458', '#8b93a3', '#e4e0d8'],
      fog: ['#4a5160', '#9aa0aa', '#e6e3dc'],
      drizzle: ['#2c3a4e', '#6d7d90', '#e0dcd6'],
      rain: ['#1e2c3e', '#5c6e82', '#d9d5cf'],
      snow: ['#44546c', '#c5d0de', '#eeeae4'],
      thunder: ['#241c38', '#5c5278', '#d5d0ca'],
    },
  },
  dark: {
    day: {
      clear: ['#1a4f86', '#e39a62', '#101820'],
      partly: ['#1e466e', '#c98a62', '#121a24'],
      cloudy: ['#2a3a4c', '#4d5d70', '#141b26'],
      fog: ['#3a4654', '#6a7380', '#161c26'],
      drizzle: ['#1c3348', '#3e556c', '#121820'],
      rain: ['#152838', '#2c4258', '#0e141c'],
      snow: ['#4e6278', '#d5e0ea', '#161c28'],
      thunder: ['#2a2044', '#6a5878', '#120e18'],
    },
    night: {
      clear: ['#070a12', '#162038', '#0a0d16'],
      partly: ['#080c16', '#1a2740', '#0b0e16'],
      cloudy: ['#0c121c', '#1c2636', '#0c1018'],
      fog: ['#141820', '#2a303a', '#10141c'],
      drizzle: ['#0b121c', '#1a2838', '#0a0e14'],
      rain: ['#081018', '#152232', '#080c12'],
      snow: ['#121820', '#2a3648', '#0e1218'],
      thunder: ['#100818', '#241433', '#0a0812'],
    },
  },
};

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function lerpHex(from, to, amount) {
  const start = hexToRgb(from);
  const end = hexToRgb(to);
  const mixed = start.map((channel, index) => Math.round(channel + (end[index] - channel) * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function rgba(hex, alpha) {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function paletteFor(theme, phase, scene) {
  const group = PALETTES[theme]?.[phase] || PALETTES.light.day;
  const sky = group[scene] || group.cloudy;
  let glow = theme === 'dark' ? (phase === 'day' ? '#ffc27a' : '#c9d6ff') : phase === 'day' ? '#ffd27a' : '#d5def8';
  if (scene === 'thunder') glow = theme === 'dark' ? '#b9a6e6' : '#d9d2ea';
  if (scene === 'snow') glow = '#f7fbff';
  if (scene === 'rain' || scene === 'drizzle') glow = theme === 'dark' ? '#8fb4d6' : '#c5d5e4';
  return { sky, glow, cloud: theme === 'dark' ? '#c5d0de' : '#ffffff' };
}

function lerpPalette(current, target, amount) {
  return {
    sky: current.sky.map((color, index) => lerpHex(color, target.sky[index], amount)),
    glow: lerpHex(current.glow, target.glow, amount),
    cloud: lerpHex(current.cloud, target.cloud, amount),
  };
}

function paletteDistance(current, target) {
  const left = [...current.sky, current.glow, current.cloud];
  const right = [...target.sky, target.glow, target.cloud];
  return left.reduce((sum, color, index) => {
    const a = hexToRgb(color);
    const b = hexToRgb(right[index]);
    return sum + Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
  }, 0);
}

function weightsFor(scene) {
  switch (scene) {
    case 'clear':
      return { rain: 0, snow: 0, cloud: 0.12, fog: 0 };
    case 'partly':
      return { rain: 0, snow: 0, cloud: 0.48, fog: 0 };
    case 'cloudy':
      return { rain: 0, snow: 0, cloud: 0.88, fog: 0.08 };
    case 'fog':
      return { rain: 0, snow: 0, cloud: 0.35, fog: 0.95 };
    case 'drizzle':
      return { rain: 0.42, snow: 0, cloud: 0.72, fog: 0.16 };
    case 'rain':
      return { rain: 1, snow: 0, cloud: 0.82, fog: 0.1 };
    case 'snow':
      return { rain: 0, snow: 1, cloud: 0.55, fog: 0.12 };
    case 'thunder':
      return { rain: 0.85, snow: 0, cloud: 0.92, fog: 0.05 };
    default:
      return { rain: 0, snow: 0, cloud: 0.4, fog: 0 };
  }
}

function bodyAlpha(scene) {
  if (scene === 'clear') return 1;
  if (scene === 'partly') return 0.9;
  if (scene === 'snow') return 0.5;
  if (scene === 'fog') return 0.22;
  if (scene === 'cloudy') return 0.18;
  return 0.08;
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, 78 * scale, 26 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 46 * scale, y + 6 * scale, 42 * scale, 22 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x - 44 * scale, y + 8 * scale, 38 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 8 * scale, y - 16 * scale, 34 * scale, 22 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawOrb(ctx, x, y, radius, core, glow, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const halo = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 4);
  halo.addColorStop(0, rgba(glow, 0.9));
  halo.addColorStop(0.22, rgba(glow, 0.28));
  halo.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function makePool(count, factory) {
  return Array.from({ length: count }, factory);
}

export default function Atmosphere({ scene = 'clear', theme = 'light', sunrise, sunset, utcOffset = 0, cloud = 0 }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ scene, theme, sunrise, sunset, utcOffset, cloud });
  const kickRef = useRef(() => {});

  useEffect(() => {
    stateRef.current = { scene, theme, sunrise, sunset, utcOffset, cloud };
    kickRef.current();
  }, [scene, theme, sunrise, sunset, utcOffset, cloud]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const rain = makePool(120, () => ({
      x: Math.random(),
      y: Math.random(),
      len: 14 + Math.random() * 18,
      speed: 0.014 + Math.random() * 0.02,
      seed: Math.random(),
    }));
    const snow = makePool(80, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.1 + Math.random() * 2.2,
      speed: 0.0014 + Math.random() * 0.0024,
      phase: Math.random() * Math.PI * 2,
      seed: Math.random(),
    }));
    const stars = makePool(80, () => ({
      x: Math.random(),
      y: Math.random() * 0.72,
      r: 0.4 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      base: 0.35 + Math.random() * 0.65,
    }));
    const clouds = makePool(6, (_, index) => ({
      x: Math.random(),
      y: 0.08 + Math.random() * 0.26,
      s: 0.75 + (index % 3) * 0.28,
      speed: 0.00012 + index * 0.00005,
    }));

    const shown = { rain: 0, snow: 0, cloud: 0.2, fog: 0, stars: 0, body: 1 };
    let palette = null;
    let bolt = 0;
    let flicker = 0;
    let raf = 0;
    let running = false;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = media.matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      const state = stateRef.current;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const phaseInfo = skyPhase(Date.now(), state.sunrise, state.sunset, state.utcOffset);
      const phase = state.sunrise ? phaseInfo.phase : 'day';
      const amount = state.sunrise ? phaseInfo.amount : 0.42;
      const target = paletteFor(state.theme, phase, state.scene);
      const step = reduced ? 1 : 0.035;
      palette = palette ? lerpPalette(palette, target, step) : target;

      const desired = weightsFor(state.scene);
      const cloudBoost = Math.min(0.25, (state.cloud || 0) / 400);
      desired.cloud = Math.min(1, desired.cloud + cloudBoost);
      Object.keys(shown).forEach((key) => {
        if (key === 'stars' || key === 'body') return;
        shown[key] += ((desired[key] ?? 0) - shown[key]) * step;
      });
      const starTarget = phase === 'night' ? (state.theme === 'dark' ? 1 : 0.4) : 0;
      shown.stars += (starTarget - shown.stars) * step;
      shown.body += (bodyAlpha(state.scene) - shown.body) * step;

      if (!reduced) {
        rain.forEach((drop) => {
          drop.y += drop.speed;
          drop.x -= 0.0012;
          if (drop.y > 1.08) {
            drop.y = -0.08;
            drop.x = Math.random();
          }
        });
        snow.forEach((flake) => {
          flake.y += flake.speed;
          if (flake.y > 1.05) {
            flake.y = -0.05;
            flake.x = Math.random();
          }
        });
        clouds.forEach((cloudPuff) => {
          cloudPuff.x += cloudPuff.speed;
          if (cloudPuff.x > 1.35) cloudPuff.x = -0.35;
        });
        if (state.scene === 'thunder' && Math.random() < 0.004) {
          bolt = 1;
          flicker = 10;
        }
        if (flicker > 0) {
          flicker -= 1;
          if (flicker === 0) bolt = Math.max(bolt, 0.65);
        }
        bolt *= 0.86;
      }

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, palette.sky[0]);
      sky.addColorStop(0.52, palette.sky[1]);
      sky.addColorStop(1, palette.sky[2]);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const drift = reduced ? 0 : Math.min(window.scrollY, 700) * 0.045;

      if (phase === 'night' && (state.scene === 'clear' || state.scene === 'partly')) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.lineCap = 'round';
        for (let ribbon = 0; ribbon < 3; ribbon += 1) {
          ctx.beginPath();
          const yBase = height * (0.16 + ribbon * 0.07) - drift * 0.35;
          for (let x = 0; x <= width; x += 14) {
            const wave = Math.sin(x / 150 + time / 1700 + ribbon * 1.3) * (16 + ribbon * 8);
            const y = yBase + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = ribbon === 1 ? 'rgba(142, 217, 207, 0.22)' : 'rgba(186, 164, 236, 0.18)';
          ctx.lineWidth = 16 - ribbon * 3;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (shown.stars > 0.03) {
        stars.forEach((star) => {
          const twinkle = reduced ? 0.8 : 0.45 + 0.55 * Math.abs(Math.sin(time / 700 + star.phase));
          ctx.globalAlpha = star.base * shown.stars * twinkle;
          ctx.fillStyle = state.theme === 'dark' ? '#ffffff' : '#f7f4ff';
          ctx.beginPath();
          ctx.arc(star.x * width, star.y * height - drift, star.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      const lift = phase === 'day' ? 0.46 : 0.3;
      const orbX = width * (0.14 + 0.72 * amount);
      const orbY = height * 0.78 - Math.sin(Math.max(0, Math.min(1, amount)) * Math.PI) * height * lift;
      const edge = phase === 'day' ? Math.min(1, Math.min(amount, 1 - amount) / 0.08) : 0.85;
      const radius = Math.max(16, Math.min(width, height) * 0.032);
      drawOrb(
        ctx,
        orbX,
        orbY,
        radius,
        phase === 'day' ? '#fff6e4' : '#f3f0e8',
        palette.glow,
        Math.max(0, shown.body) * edge,
      );

      if (shown.cloud > 0.03) {
        ctx.save();
        ctx.globalAlpha = shown.cloud * (state.theme === 'dark' ? 0.22 : 0.58);
        clouds.forEach((cloudPuff) => {
          drawCloud(ctx, cloudPuff.x * width, cloudPuff.y * height - drift * 0.55, cloudPuff.s, palette.cloud);
        });
        ctx.restore();
      }

      if (shown.fog > 0.03) {
        for (let band = 0; band < 4; band += 1) {
          const y = height * (0.32 + band * 0.12) + (reduced ? 0 : Math.sin(time / 2800 + band) * 10);
          const mist = ctx.createLinearGradient(0, y - 36, 0, y + 36);
          const alpha = shown.fog * (state.theme === 'dark' ? 0.08 : 0.16);
          mist.addColorStop(0, 'rgba(255,255,255,0)');
          mist.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
          mist.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = mist;
          ctx.fillRect(0, y - 36, width, 72);
        }
      }

      if (shown.rain > 0.03) {
        ctx.strokeStyle = state.theme === 'dark' ? 'rgba(214,228,242,0.45)' : 'rgba(62, 86, 110, 0.38)';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        rain.forEach((drop) => {
          if (drop.seed > shown.rain) return;
          const x = drop.x * width;
          const y = drop.y * height;
          ctx.moveTo(x, y);
          ctx.lineTo(x - 7, y + drop.len);
        });
        ctx.stroke();
      }

      if (shown.snow > 0.03) {
        snow.forEach((flake) => {
          if (flake.seed > shown.snow) return;
          const sway = reduced ? 0 : Math.sin(time / 900 + flake.phase) * 12;
          ctx.globalAlpha = 0.75 * shown.snow;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(flake.x * width + sway, flake.y * height, flake.r, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      if (bolt > 0.04 && state.scene === 'thunder') {
        ctx.fillStyle = `rgba(255,255,255,${bolt * 0.28})`;
        ctx.fillRect(0, 0, width, height);
      }

      const vignette = ctx.createRadialGradient(width / 2, height * 0.42, width * 0.2, width / 2, height * 0.45, width * 0.78);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, state.theme === 'dark' ? 'rgba(0,0,0,0.38)' : 'rgba(70,46,24,0.12)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      const veil = ctx.createLinearGradient(0, height * 0.58, 0, height);
      veil.addColorStop(0, 'rgba(0,0,0,0)');
      veil.addColorStop(1, state.theme === 'dark' ? 'rgba(7,11,20,0.5)' : 'rgba(244,239,230,0.38)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, height * 0.58, width, height * 0.42);

      return reduced && paletteDistance(palette, target) < 4 && bolt < 0.04;
    };

    const loop = (time) => {
      running = true;
      const idle = draw(time);
      if (idle) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (!running) raf = requestAnimationFrame(loop);
    };
    kickRef.current = kick;

    const onResize = () => {
      resize();
      kick();
    };
    const onReduce = () => {
      reduced = media.matches;
      kick();
    };
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else {
        kick();
      }
    };

    resize();
    kick();
    const onScroll = () => kick();

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    media.addEventListener('change', onReduce);

    return () => {
      cancelAnimationFrame(raf);
      running = false;
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      media.removeEventListener('change', onReduce);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
}
