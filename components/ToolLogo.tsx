'use client';

import { getLogoUrl } from '../data/toolDomains';

type Props = {
  slug: string;
  size?: number;
  className?: string;
};

export default function ToolLogo({ slug, size = 28, className = '' }: Props) {
  const logoUrl = getLogoUrl(slug);
  if (!logoUrl) return null;

  return (
    <img
      src={logoUrl}
      alt=""
      width={size}
      height={size}
      className={`rounded-md shrink-0 bg-white object-contain ${className}`}
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}