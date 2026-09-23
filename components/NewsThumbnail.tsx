'use client';

import { useState } from 'react';

export default function NewsThumbnail({
  image,
  sourceLogo,
  alt,
  size = 'small',
}: {
  image?: string;
  sourceLogo: string;
  alt: string;
  size?: 'large' | 'small';
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = image && !imgFailed;

  const maxLogo = size === 'large' ? 'max-w-[120px] max-h-[120px]' : 'max-w-[56px] max-h-[56px]';

  if (showImage) {
    return (
      <img
        src={image}
        alt={alt}
        className="w-full h-full object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 flex items-center justify-center p-4">
      <img
        src={sourceLogo}
        alt={alt}
        className={`${maxLogo} object-contain opacity-90`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}