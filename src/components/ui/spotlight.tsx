import { ReactNode, useRef, useState, useEffect } from "react";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

export function Spotlight({ children, className }: SpotlightProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    setMousePosition({ x, y });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={"relative overflow-hidden rounded-2xl border border-border bg-card " + (className ?? "")}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 md:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary)/0.18), transparent 60%)`,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}


