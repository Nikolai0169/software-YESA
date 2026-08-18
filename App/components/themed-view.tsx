import { View, Text, type ViewProps } from 'react-native';
import { Children } from 'react';
import type { ReactNode } from 'react';

import { useThemeColor } from '../hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, children, ...otherProps }: ThemedViewProps & { children?: ReactNode }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Normalize children: if a primitive string/number is passed directly to a View,
  // React Native throws "Text strings must be rendered within a <Text> component".
  // To be defensive (and avoid creating new files), wrap primitive children
  // automatically in a Text so legacy usages don't crash.
  const normalizeChildren = (ch: ReactNode) => {
    if (ch === null || ch === undefined) return ch;
    if (typeof ch === 'string' || typeof ch === 'number') return <Text>{String(ch)}</Text>;
    if (Array.isArray(ch)) {
      return Children.toArray(ch).map((c) => (
        typeof c === 'string' || typeof c === 'number' ? <Text key={String(c)}>{String(c)}</Text> : c
      ));
    }
    return ch;
  };

  return (
    <View style={[{ backgroundColor }, style]} {...otherProps}>
      {normalizeChildren(children)}
    </View>
  );
}
