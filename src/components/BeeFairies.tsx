import type { CSSProperties } from 'react';

interface BeeSpriteSpec {
  id: string;
  top: string;
  left: string;
  size: number;
  variant: 'bee-flight-a' | 'bee-flight-b' | 'bee-flight-c';
  duration: string;
  delay: string;
  wingColor: string;
}

interface GlowParticleSpec {
  id: string;
  top: string;
  left: string;
  size: number;
  color: string;
  duration: string;
  delay: string;
}

const BEE_FAIRIES: BeeSpriteSpec[] = [
  {
    id: 'ilya-bee-1',
    top: '14%',
    left: '6%',
    size: 38,
    variant: 'bee-flight-a',
    duration: '24s',
    delay: '-3s',
    wingColor: '#FFF8E1',
  },
  {
    id: 'ilya-bee-2',
    top: '28%',
    left: '84%',
    size: 34,
    variant: 'bee-flight-b',
    duration: '27s',
    delay: '-7s',
    wingColor: '#FCE8EC',
  },
  {
    id: 'ilya-bee-3',
    top: '56%',
    left: '11%',
    size: 32,
    variant: 'bee-flight-c',
    duration: '21s',
    delay: '-11s',
    wingColor: '#E8F6FA',
  },
  {
    id: 'ilya-bee-4',
    top: '74%',
    left: '79%',
    size: 36,
    variant: 'bee-flight-b',
    duration: '26s',
    delay: '-4s',
    wingColor: '#FFF5D6',
  },
  {
    id: 'ilya-bee-5',
    top: '42%',
    left: '68%',
    size: 30,
    variant: 'bee-flight-a',
    duration: '23s',
    delay: '-9s',
    wingColor: '#F3EBFA',
  },
];

const MAGIC_FIREFLIES: GlowParticleSpec[] = [
  { id: 'ff-1', top: '12%', left: '22%', size: 8, color: '#F4BE6A', duration: '5.5s', delay: '0s' },
  { id: 'ff-2', top: '19%', left: '72%', size: 10, color: '#E89F3C', duration: '6.8s', delay: '-1.4s' },
  { id: 'ff-3', top: '34%', left: '16%', size: 7, color: '#E5989B', duration: '6.2s', delay: '-2.6s' },
  { id: 'ff-4', top: '44%', left: '89%', size: 9, color: '#F4BE6A', duration: '5.8s', delay: '-0.8s' },
  { id: 'ff-5', top: '53%', left: '42%', size: 6, color: '#9B7BB8', duration: '7.4s', delay: '-3.1s' },
  { id: 'ff-6', top: '64%', left: '8%', size: 9, color: '#7BA7BC', duration: '6.0s', delay: '-1.9s' },
  { id: 'ff-7', top: '71%', left: '58%', size: 8, color: '#F4BE6A', duration: '5.4s', delay: '-4.2s' },
  { id: 'ff-8', top: '82%', left: '29%', size: 10, color: '#E89F3C', duration: '7.1s', delay: '-2.0s' },
  { id: 'ff-9', top: '87%', left: '88%', size: 7, color: '#E5989B', duration: '6.5s', delay: '-3.7s' },
  { id: 'ff-10', top: '24%', left: '51%', size: 6, color: '#F7D27A', duration: '5.9s', delay: '-2.3s' },
];

function BeeFairySvg({ size, wingColor }: { size: number; wingColor: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_2px_8px_rgba(232,159,60,0.45)]"
    >
      {/* Golden fairy dust halo */}
      <circle cx="12" cy="27" r="2.2" fill="#F7D27A" opacity="0.85" />
      <circle cx="7" cy="24" r="1.4" fill="#F4BE6A" opacity="0.65" />

      {/* Fluttering translucent fairy wings */}
      <g className="bee-wing-flutter">
        <ellipse
          cx="22"
          cy="15"
          rx="7"
          ry="9.5"
          transform="rotate(-22 22 15)"
          fill={wingColor}
          fillOpacity="0.88"
          stroke="#E89F3C"
          strokeWidth="1"
        />
        <ellipse
          cx="29"
          cy="16"
          rx="5.5"
          ry="8"
          transform="rotate(18 29 16)"
          fill={wingColor}
          fillOpacity="0.82"
          stroke="#7BA7BC"
          strokeWidth="0.9"
        />
      </g>

      {/* Honeybee body */}
      <ellipse cx="26" cy="27" rx="9" ry="6.2" fill="#F4BE6A" stroke="#2D4F3E" strokeWidth="1.4" />
      {/* Stripes */}
      <path d="M22 21.6V32.4" stroke="#2D4F3E" strokeWidth="2.1" strokeLinecap="round" />
      <path d="M26.5 21V33" stroke="#2D4F3E" strokeWidth="2.1" strokeLinecap="round" />
      {/* Little smile & blush */}
      <circle cx="32.2" cy="25.5" r="1.1" fill="#24302A" />
      <circle cx="31.5" cy="28.2" r="1.3" fill="#E5989B" opacity="0.8" />
      {/* Crown / antennae */}
      <path d="M32 21.5C33.5 18 36 17.5 37 18.5" stroke="#2D4F3E" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="37.5" cy="18.6" r="1.3" fill="#E89F3C" />
    </svg>
  );
}

export function BeeFairies() {
  return (
    <div
      aria-hidden="true"
      className="ambient-magic-layer pointer-events-none fixed inset-0 z-30 overflow-hidden select-none"
    >
      {MAGIC_FIREFLIES.map((particle) => {
        const style = {
          top: particle.top,
          left: particle.left,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          backgroundColor: particle.color,
          boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          '--glow-duration': particle.duration,
          '--glow-delay': particle.delay,
        } as CSSProperties;

        return (
          <span
            key={particle.id}
            style={style}
            className="firefly-particle absolute rounded-full opacity-75"
          />
        );
      })}

      {BEE_FAIRIES.map((bee, idx) => {
        const style = {
          top: bee.top,
          left: bee.left,
          '--flight-duration': bee.duration,
          '--flight-delay': bee.delay,
        } as CSSProperties;

        return (
          <div
            key={bee.id}
            style={style}
            className={`${bee.variant} absolute ${idx >= 3 ? 'hidden sm:block' : 'block'} opacity-90`}
          >
            <BeeFairySvg size={bee.size} wingColor={bee.wingColor} />
          </div>
        );
      })}
    </div>
  );
}
