// Optimisations de performance pour les interactions tactiles
export const TOUCH_OPACITY = {
  fast: 0.3,
  normal: 0.5,
  slow: 0.7,
};

export const TOUCH_DELAY = {
  none: 0,
  fast: 50,
  normal: 100,
};

// Helper pour optimiser les props de TouchableOpacity
export const getOptimizedTouchProps = (opacity = TOUCH_OPACITY.fast) => ({
  activeOpacity: opacity,
  delayPressIn: TOUCH_DELAY.none,
});
