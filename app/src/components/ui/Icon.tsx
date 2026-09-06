import type { HTMLAttributes } from 'react';

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  size?: number;
}

/** Material Symbols Rounded — the only icon system used anywhere in this app. */
export function Icon({ name, size = 20, className = '', style, ...rest }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded select-none ${className}`}
      style={{ fontSize: size, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {name}
    </span>
  );
}
