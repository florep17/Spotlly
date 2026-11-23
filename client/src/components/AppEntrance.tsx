import React, { PropsWithChildren, useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform } from 'react-native';

export function AppEntrance({ children }: PropsWithChildren) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let mounted = true;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });

    const start = (reduceMotion: boolean) => {
      if (!mounted) return;
      if (reduceMotion) {
        progress.setValue(1);
      } else {
        animation.start();
      }
    };

    if (Platform.OS === 'web') {
      start(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
    } else {
      AccessibilityInfo.isReduceMotionEnabled().then(start, () => start(true));
    }

    return () => {
      mounted = false;
      animation.stop();
    };
  }, [progress]);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: progress,
        transform: [
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
        ],
      }}
    >
      {children}
    </Animated.View>
  );
}
