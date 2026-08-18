import type { PropsWithChildren, ReactElement } from 'react';
import { Platform, ScrollView, View, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ThemedView } from '../components/themed-view';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useThemeColor } from '../hooks/use-theme-color';

const HEADER_HEIGHT = 250;
const isWeb = Platform.OS === 'web';

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

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
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
  }));

  const ScrollComponent = isWeb ? ScrollView : Animated.ScrollView;
  const HeaderComponent = isWeb ? View : Animated.View;

  return (
    <ScrollComponent
      onScroll={isWeb ? undefined : onScroll}
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}>
      <HeaderComponent
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          !isWeb && headerAnimatedStyle,
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
