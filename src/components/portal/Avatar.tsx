import * as React from 'react';

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';

/** Profile photo with a deterministic initials fallback. */
export function Avatar({ url, name, size = 40 }: { url?: string | null; name: string; size?: number }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={url} alt={name} width={size} height={size}
           className="shrink-0 rounded-full object-cover"
           style={{ width: size, height: size }} />
    );
  }
  return (
    <span aria-hidden="true"
          className="grid shrink-0 place-items-center rounded-full bg-ink font-display font-bold text-white"
          style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials(name)}
    </span>
  );
}
