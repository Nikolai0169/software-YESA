import React, { useState, useMemo } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

type Props = Omit<ImageProps, 'source'> & {
  sources: string[]; // URLs candidatas en orden de preferencia
  placeholder?: ImageSourcePropType;
};

export default function SmartImage({ sources = [], placeholder, style, ...rest }: Props) {
  const [index, setIndex] = useState(0);
  const uri = sources && sources[index];

  const source = useMemo(() => (uri ? { uri } : placeholder), [uri, placeholder]);

  const handleError = () => {
    if (index + 1 < sources.length) {
      setIndex((i) => i + 1);
    }
  };

  return (
    <Image
      source={source as any}
      onError={handleError}
      style={style}
      {...rest}
    />
  );
}
