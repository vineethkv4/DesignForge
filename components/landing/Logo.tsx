interface LogoProps {
  size?: number;
}

export function Logo({ size = 30 }: LogoProps) {
  return (
    <div
      className="df-logo-gem landing-logo-gem"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 15 15" fill="none" style={{ width: size * 0.5 }}>
        <path
          d="M7.5 1.5L13 4.8V10.2L7.5 13.5L2 10.2V4.8L7.5 1.5Z"
          stroke="white"
          strokeWidth="1.3"
        />
        <circle cx="7.5" cy="7.5" r="2" fill="white" />
      </svg>
    </div>
  );
}
