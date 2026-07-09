import { Platform, Text, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';
const Animated = !isWeb ? require('react-native-reanimated').default : null;
const AnimatedText = !isWeb && Animated ? Animated.Text : Text;

export function HelloWave() {
  return (
    <AnimatedText style={styles.wave}>👋</AnimatedText>
  );
}

const styles = StyleSheet.create({
  wave: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
    ...(isWeb
      ? {
          animationName: {
            '50%': { transform: [{ rotate: '25deg' }] },
          },
          animationIterationCount: 4,
          animationDuration: '300ms',
        }
      : {}),
  },
});
