import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCENE_WIDTH = Math.min(SCREEN_WIDTH, 420);

// Coordinates calculation for enlarged cars (38x68) & bays (56x90)
const CAR_WIDTH = 38;
const CAR_HEIGHT = 68;

const BAY_Y = 12;
const ROAD_Y = 175;
const OFF_LEFT = -80;
const OFF_RIGHT = SCENE_WIDTH + 80;

// Center bay coordinates
const CENTER_X = SCENE_WIDTH / 2;
const BAY2_X = CENTER_X - CAR_WIDTH / 2; // Bay 2 (Spotly VIP Center)
const BAY1_X = BAY2_X - 116; // Bay 1 (Left)
const BAY3_X = BAY2_X + 116; // Bay 3 (Right)

interface CarProps {
  color: string;
  roofColor?: string;
  isReversing?: boolean;
  headlightsOn?: boolean;
}

const CarModel: React.FC<CarProps> = ({
  color,
  roofColor = '#0b1329',
  isReversing = false,
  headlightsOn = true,
}) => {
  return (
    <View style={[styles.carContainer, { backgroundColor: color }]}>
      {/* Front Headlights & Light Cones */}
      {headlightsOn && (
        <>
          <View style={[styles.headlightGlow, styles.headlightGlowLeft]} />
          <View style={[styles.headlightGlow, styles.headlightGlowRight]} />
          <View style={[styles.headlightBeam, styles.headlightBeamLeft]} />
          <View style={[styles.headlightBeam, styles.headlightBeamRight]} />
        </>
      )}

      {/* Front Windshield */}
      <View style={[styles.windshield, { backgroundColor: roofColor }]} />

      {/* Sunroof / Cabin Roof */}
      <View style={[styles.cabinRoof, { backgroundColor: roofColor }]}>
        <View style={styles.roofHighlight} />
      </View>

      {/* Rear Window */}
      <View style={[styles.rearWindow, { backgroundColor: roofColor }]} />

      {/* Side Mirrors */}
      <View style={[styles.mirror, styles.mirrorLeft, { backgroundColor: color }]} />
      <View style={[styles.mirror, styles.mirrorRight, { backgroundColor: color }]} />

      {/* Tail Lights */}
      <View style={[styles.tailLight, styles.tailLightLeft, isReversing && styles.reverseLight]} />
      <View style={[styles.tailLight, styles.tailLightRight, isReversing && styles.reverseLight]} />
    </View>
  );
};

export const ParkingAnimationScene: React.FC = () => {
  // Car 2 (Starts in Bay 2, then departs)
  const [car2X] = useState(() => new Animated.Value(BAY2_X));
  const [car2Y] = useState(() => new Animated.Value(BAY_Y));
  const [car2Rot] = useState(() => new Animated.Value(0)); // 0 = facing bay (up), 1 = facing right
  const [car2Rev] = useState(() => new Animated.Value(0));

  // Car 3 (Arrives in Bay 3, then later departs)
  const [car3X] = useState(() => new Animated.Value(OFF_LEFT));
  const [car3Y] = useState(() => new Animated.Value(ROAD_Y));
  const [car3Rot] = useState(() => new Animated.Value(1)); // 1 = facing right
  const [car3Rev] = useState(() => new Animated.Value(0));

  // Car 4 (Arrives to take Bay 2 after Car 2 departs)
  const [car4X] = useState(() => new Animated.Value(OFF_LEFT));
  const [car4Y] = useState(() => new Animated.Value(ROAD_Y));
  const [car4Rot] = useState(() => new Animated.Value(1)); // 1 = facing right

  // Sensor state: 0 = Green (free), 1 = Red (occupied)
  const [spot2State] = useState(() => new Animated.Value(1)); // Bay 2 initially occupied
  const [spot3State] = useState(() => new Animated.Value(0)); // Bay 3 initially free

  // Timer helper value for native delay steps
  const [delayTimer] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let isMounted = true;

    const pause = (duration: number) => {
      delayTimer.setValue(0);
      return Animated.timing(delayTimer, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      });
    };

    const runMasterLoop = () => {
      if (!isMounted) return;

      // Reset values to initial positions
      car2X.setValue(BAY2_X);
      car2Y.setValue(BAY_Y);
      car2Rot.setValue(0);
      car2Rev.setValue(0);

      car3X.setValue(OFF_LEFT);
      car3Y.setValue(ROAD_Y);
      car3Rot.setValue(1);
      car3Rev.setValue(0);

      car4X.setValue(OFF_LEFT);
      car4Y.setValue(ROAD_Y);
      car4Rot.setValue(1);

      spot2State.setValue(1);
      spot3State.setValue(0);

      Animated.sequence([
        // STEP 1: Car 3 enters from left, drives to Bay 3, turns & parks
        Animated.timing(car3X, {
          toValue: BAY3_X,
          duration: 1500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(car3Rot, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(car3Y, {
            toValue: BAY_Y,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(spot3State, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),

        pause(900),

        // STEP 2: Car 2 (resident) departs Bay 2
        Animated.timing(car2Rev, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(car2Y, {
          toValue: ROAD_Y,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(car2Rev, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(car2Rot, {
            toValue: 1, // turn right
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          // Spot 2 becomes GREEN (free for next driver!)
          Animated.timing(spot2State, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(car2X, {
          toValue: OFF_RIGHT,
          duration: 1200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),

        pause(700),

        // STEP 3: Car 4 arrives to take the newly freed Bay 2!
        Animated.timing(car4X, {
          toValue: BAY2_X,
          duration: 1400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(car4Rot, {
          toValue: 0,
          duration: 400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(car4Y, {
            toValue: BAY_Y,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(spot2State, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),

        pause(1000),

        // STEP 4: Car 3 leaves Bay 3 to reopen spot
        Animated.timing(car3Rev, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(car3Y, {
          toValue: ROAD_Y,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(car3Rev, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(car3Rot, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(spot3State, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(car3X, {
          toValue: OFF_RIGHT,
          duration: 1100,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),

        pause(800),
      ]).start(({ finished }) => {
        if (finished && isMounted) {
          runMasterLoop();
        }
      });
    };

    runMasterLoop();

    return () => {
      isMounted = false;
      car2X.stopAnimation();
      car2Y.stopAnimation();
      car3X.stopAnimation();
      car3Y.stopAnimation();
      car4X.stopAnimation();
      car4Y.stopAnimation();
    };
  }, [
    car2X,
    car2Y,
    car2Rot,
    car2Rev,
    car3X,
    car3Y,
    car3Rot,
    car3Rev,
    car4X,
    car4Y,
    car4Rot,
    spot2State,
    spot3State,
    delayTimer,
  ]);

  const car2RotateStr = car2Rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const car3RotateStr = car3Rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const car4RotateStr = car4Rot.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={styles.sceneWrapper}>
      <View style={styles.asphaltFloor}>
        {/* Subtle grid line */}
        <View style={styles.ambientGridLine} />

        {/* 3 Minimalist Parking Bays (NO TEXT clutter) */}
        <View style={styles.baysRow}>
          {/* BAY 1 (Left - Resident Stall) */}
          <View style={[styles.parkingBay, { left: BAY1_X - 9 }]}>
            <View style={styles.sensorRow}>
              <View style={[styles.sensorLed, styles.sensorRed]} />
            </View>
            <View style={styles.bayStallMarks}>
              <View style={styles.cornerTickTL} />
              <View style={styles.cornerTickTR} />
            </View>
          </View>

          {/* BAY 2 (Center - Spotly Bay) */}
          <View style={[styles.parkingBay, styles.spotlyBay, { left: BAY2_X - 9 }]}>
            <View style={styles.sensorRow}>
              {/* Dynamic Sensor LED */}
              <Animated.View
                style={[
                  styles.sensorLed,
                  styles.sensorGreen,
                  {
                    opacity: spot2State.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.sensorLed,
                  styles.sensorRed,
                  {
                    position: 'absolute',
                    opacity: spot2State.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.bayStallMarks}>
              <View style={[styles.cornerTickTL, styles.cornerSpotly]} />
              <View style={[styles.cornerTickTR, styles.cornerSpotly]} />
            </View>
          </View>

          {/* BAY 3 (Right - Guest Bay) */}
          <View style={[styles.parkingBay, { left: BAY3_X - 9 }]}>
            <View style={styles.sensorRow}>
              <Animated.View
                style={[
                  styles.sensorLed,
                  styles.sensorGreen,
                  {
                    opacity: spot3State.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.sensorLed,
                  styles.sensorRed,
                  {
                    position: 'absolute',
                    opacity: spot3State.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ]}
              />
            </View>
            <View style={styles.bayStallMarks}>
              <View style={styles.cornerTickTL} />
              <View style={styles.cornerTickTR} />
            </View>
          </View>
        </View>

        {/* Driving Road (Expands down seamlessly to white card) */}
        <View style={styles.roadTrack}>
          {/* Dashed Center Markings */}
          <View style={styles.dashedLineRow}>
            {Array.from({ length: 14 }).map((_, idx) => (
              <View key={`dash-${idx}`} style={styles.roadDash} />
            ))}
          </View>
        </View>

        {/* STATIC CAR 1: Parked in Bay 1 (Clean Pearl White) */}
        <View style={[styles.carPosition, { left: BAY1_X, top: BAY_Y }]}>
          <CarModel color="#f8fafc" roofColor="#0f172a" headlightsOn={false} />
        </View>

        {/* DYNAMIC CAR 2: Departs from Bay 2 (Midnight Slate) */}
        <Animated.View
          style={[
            styles.carPosition,
            {
              transform: [{ translateX: car2X }, { translateY: car2Y }, { rotate: car2RotateStr }],
            },
          ]}
        >
          <CarModel color="#334155" roofColor="#020617" headlightsOn={true} isReversing={false} />
        </Animated.View>

        {/* DYNAMIC CAR 3: Arrives in Bay 3 (Spotly Emerald EV) */}
        <Animated.View
          style={[
            styles.carPosition,
            {
              transform: [{ translateX: car3X }, { translateY: car3Y }, { rotate: car3RotateStr }],
            },
          ]}
        >
          <CarModel color="#059669" roofColor="#064e3b" headlightsOn={true} isReversing={false} />
        </Animated.View>

        {/* DYNAMIC CAR 4: Takes the newly freed Bay 2 (Graphite Gray) */}
        <Animated.View
          style={[
            styles.carPosition,
            {
              transform: [{ translateX: car4X }, { translateY: car4Y }, { rotate: car4RotateStr }],
            },
          ]}
        >
          <CarModel color="#64748b" roofColor="#090d16" headlightsOn={true} isReversing={false} />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sceneWrapper: {
    width: '100%',
    height: 290,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#070b14',
  },
  asphaltFloor: {
    width: SCENE_WIDTH,
    height: 290,
    backgroundColor: '#070b14',
    position: 'relative',
  },
  ambientGridLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  baysRow: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 100,
  },
  parkingBay: {
    position: 'absolute',
    top: 0,
    width: 56,
    height: 90,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderTopWidth: 1.5,
    borderColor: '#26334d',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    alignItems: 'center',
    paddingTop: 4,
  },
  spotlyBay: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    shadowColor: '#10b981',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 10,
    marginTop: 1,
  },
  sensorLed: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sensorGreen: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  sensorRed: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  bayStallMarks: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    right: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cornerTickTL: {
    width: 5,
    height: 5,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#3b4a6b',
  },
  cornerTickTR: {
    width: 5,
    height: 5,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#3b4a6b',
  },
  cornerSpotly: {
    borderColor: '#10b981',
  },
  roadTrack: {
    position: 'absolute',
    top: 116,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0f1c',
    borderTopWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    paddingBottom: 24, // road extends right behind the top curve of formCard
  },
  dashedLineRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  roadDash: {
    width: 16,
    height: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 1,
  },
  carPosition: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
  },
  carContainer: {
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    borderRadius: 9,
    shadowColor: '#000000',
    shadowOpacity: 0.7,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    alignItems: 'center',
    position: 'relative',
  },
  headlightGlow: {
    position: 'absolute',
    top: 1,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fef08a',
    shadowColor: '#fef08a',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  headlightGlowLeft: {
    left: 3,
  },
  headlightGlowRight: {
    right: 3,
  },
  headlightBeam: {
    position: 'absolute',
    top: -32,
    width: 12,
    height: 32,
    backgroundColor: 'rgba(254, 240, 138, 0.2)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headlightBeamLeft: {
    left: 1,
    transform: [{ rotate: '-6deg' }],
  },
  headlightBeamRight: {
    right: 1,
    transform: [{ rotate: '6deg' }],
  },
  windshield: {
    position: 'absolute',
    top: 12,
    width: 27,
    height: 11,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  cabinRoof: {
    position: 'absolute',
    top: 23,
    width: 24,
    height: 22,
    borderRadius: 3,
  },
  roofHighlight: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  rearWindow: {
    position: 'absolute',
    top: 45,
    width: 24,
    height: 9,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  mirror: {
    position: 'absolute',
    top: 17,
    width: 3.5,
    height: 7,
    borderRadius: 1.5,
  },
  mirrorLeft: {
    left: -2.5,
  },
  mirrorRight: {
    right: -2.5,
  },
  tailLight: {
    position: 'absolute',
    bottom: 1.5,
    width: 5,
    height: 3.5,
    backgroundColor: '#ef4444',
    borderRadius: 1.5,
    shadowColor: '#ef4444',
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  tailLightLeft: {
    left: 4,
  },
  tailLightRight: {
    right: 4,
  },
  reverseLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
  },
});
