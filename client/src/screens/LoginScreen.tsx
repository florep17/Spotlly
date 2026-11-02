import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Pressable,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { authService } from '../services/api/authService';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

const parkingBackground = require('../../assets/parking_bg.jpg');

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // Animation values initialized via state factory
  const [entranceAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(30));
  const [buttonScale] = useState(() => new Animated.Value(1));
  const [googleScale] = useState(() => new Animated.Value(1));
  const [logoScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(entranceAnim, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceAnim, slideAnim]);

  const handlePressInButton = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 0.95,
      speed: 50,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOutButton = (scaleVar: Animated.Value) => {
    Animated.spring(scaleVar, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const handleLogoTap = () => {
    Animated.sequence([
      Animated.timing(logoScale, { toValue: 1.15, duration: 120, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, friction: 3, tension: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleEmailLogin = async () => {
    Keyboard.dismiss();
    setErrorMessage(null);

    const userEmail = email.trim() || 'kierowca@spotly.io';
    setIsLoading(true);

    try {
      await authService.loginWithEmail(userEmail, password);
      onLoginSuccess(userEmail);
    } catch {
      setErrorMessage('Nie udało się zalogować. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      await authService.loginWithGoogle('mock_google_id_token');
      onLoginSuccess('google.user@spotly.io');
    } catch {
      onLoginSuccess('google.user@spotly.io');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <ImageBackground
          source={parkingBackground}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          {/* Subtle gradient overlay to enhance readability */}
          <View style={styles.overlay} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            {/* Top Branding Section */}
            <Animated.View
              style={[
                styles.topSection,
                {
                  opacity: entranceAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <Pressable onPress={handleLogoTap}>
                <Animated.View
                  style={[styles.brandIconWrapper, { transform: [{ scale: logoScale }] }]}
                >
                  <View style={styles.brandIcon}>
                    <Text style={styles.brandIconText}>S</Text>
                  </View>
                </Animated.View>
              </Pressable>

              <Text style={styles.appName}>Spotly</Text>
              <View style={styles.taglineBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color="#10b981"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.tagline}>P2P Parking Sharing</Text>
              </View>
            </Animated.View>

            {/* Bottom Form Card with Elevation & Glass styling */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: entranceAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View>
                  <Text style={styles.welcomeText}>Witaj w Spotly</Text>
                  <Text style={styles.instructionText}>
                    Zaloguj się, aby znaleźć lub udostępnić miejsce
                  </Text>
                </View>
                <View style={styles.spotIndicator}>
                  <Text style={styles.spotIndicatorDot}>●</Text>
                  <Text style={styles.spotIndicatorText}>Live</Text>
                </View>
              </View>

              {errorMessage && (
                <View style={styles.errorBox}>
                  <Feather
                    name="alert-circle"
                    size={14}
                    color="#ef4444"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Email Input with Glow on Focus */}
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'email' && styles.inputContainerFocused,
                ]}
              >
                <Feather
                  name="mail"
                  size={18}
                  color={focusedField === 'email' ? '#1b5e3a' : '#9ca3af'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Adres e-mail"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input with Glow on Focus */}
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && styles.inputContainerFocused,
                ]}
              >
                <Feather
                  name="lock"
                  size={18}
                  color={focusedField === 'password' ? '#1b5e3a' : '#9ca3af'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Hasło"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={8}
                >
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={18}
                    color={focusedField === 'password' ? '#1b5e3a' : '#9ca3af'}
                  />
                </Pressable>
              </View>

              {/* Primary Action Button with Spring Physical Press Animation */}
              <Pressable
                onPressIn={() => handlePressInButton(buttonScale)}
                onPressOut={() => handlePressOutButton(buttonScale)}
                onPress={handleEmailLogin}
                disabled={isLoading}
              >
                <Animated.View
                  style={[
                    styles.primaryButton,
                    isLoading && styles.buttonDisabled,
                    { transform: [{ scale: buttonScale }] },
                  ]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Feather name="log-in" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryButtonText}>Zaloguj się przez Email</Text>
                    </>
                  )}
                </Animated.View>
              </Pressable>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>LUB</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Secondary Google Button with Spring Press Animation */}
              <Pressable
                onPressIn={() => handlePressInButton(googleScale)}
                onPressOut={() => handlePressOutButton(googleScale)}
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Animated.View
                  style={[styles.googleButton, { transform: [{ scale: googleScale }] }]}
                >
                  <Ionicons
                    name="logo-google"
                    size={18}
                    color="#db4437"
                    style={{ marginRight: 10 }}
                  />
                  <Text style={styles.googleButtonText}>Kontynuuj z Google</Text>
                </Animated.View>
              </Pressable>

              {/* Quick bypass demo link */}
              <Pressable
                style={styles.demoLink}
                onPress={() => onLoginSuccess('demo.kierowca@spotly.io')}
                hitSlop={6}
              >
                <Text style={styles.demoLinkText}>Wejdź jako gość testowy ➔</Text>
              </Pressable>
            </Animated.View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f1d',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 15, 29, 0.48)',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 26,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 6,
  },
  brandIconWrapper: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
    marginBottom: 10,
  },
  brandIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#1b5e3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '900',
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.8,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  tagline: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 22,
    elevation: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  instructionText: {
    fontSize: 13,
    color: '#6b7280',
    maxWidth: 240,
  },
  spotIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  spotIndicatorDot: {
    color: '#10b981',
    fontSize: 10,
    marginRight: 4,
  },
  spotIndicatorText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '800',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
  },
  inputContainerFocused: {
    borderColor: '#10b981',
    backgroundColor: '#ffffff',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
  eyeButton: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: '#1b5e3a',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#1b5e3a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 0.8,
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 15,
    fontWeight: '600',
  },
  demoLink: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 4,
  },
  demoLinkText: {
    fontSize: 13,
    color: '#1b5e3a',
    fontWeight: '700',
  },
});
