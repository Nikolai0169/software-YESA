import type { PropsWithChildren, ReactElement } from 'react';
import { Platform, ScrollView, View, StyleSheet } from 'react-native';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useThemeColor } from '../hooks/use-theme-color';

const HEADER_HEIGHT = 250;
const isWeb = Platform.OS === 'web';

let Animated; 
let interpolate;
let useAnimatedScrollHandler;
let useAnimatedStyle;
let useSharedValue;

if (!isWeb) {
  ({ default: Animated, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } = require('react-native-reanimated'));
}

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';

  const scrollY = !isWeb ? useSharedValue(0) : null;
  const onScroll = !isWeb
    ? useAnimatedScrollHandler((event) => {
        scrollY.value = event.contentOffset.y;
      })
    : undefined;

  const headerAnimatedStyle = !isWeb
    ? useAnimatedStyle(() => ({
        transform: [
          {
            translateY: interpolate(
              scrollY.value,
              [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
              [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
            ),
          },
          {
            scale: interpolate(scrollY.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
          },
        ],
      }))
    : null;

  const ScrollComponent = isWeb ? ScrollView : Animated.ScrollView;
  const HeaderComponent = isWeb ? View : Animated.View;

  return (
    <ScrollComponent
      onScroll={onScroll}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}>
      <HeaderComponent
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </HeaderComponent>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </ScrollComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
