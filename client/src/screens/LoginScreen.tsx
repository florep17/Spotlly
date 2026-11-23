import { ThemeColors, useThemedStyles, useThemeColors } from '../theme/theme';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { authService } from '../services/api/authService';
import { ParkingAnimationScene } from '../components/ParkingAnimationScene';

interface LoginScreenProps {
  onLoginSuccess: (email: string, nickname?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'nickname' | 'email' | 'password' | null>(null);

  // Animation values initialized via state factory
  const [entranceAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(20));
  const [buttonScale] = useState(() => new Animated.Value(1));
  const [logoScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(entranceAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();
  }, [entranceAnim, slideAnim]);

  // Press animation helpers
  const handlePressInButton = (scaleVal: Animated.Value) => {
    Animated.spring(scaleVal, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOutButton = (scaleVal: Animated.Value) => {
    Animated.spring(scaleVal, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleLogoTap = () => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1.15,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedNick = nickname.trim();

    if (!trimmedEmail) {
      setErrorMessage('Wprowadź adres e-mail.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Wprowadź hasło dostępu.');
      return;
    }

    if (authMode === 'register') {
      if (!trimmedNick || trimmedNick.length < 2) {
        setErrorMessage('Podaj nick (minimum 2 znaki).');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Hasło musi mieć co najmniej 6 znaków.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const response =
        authMode === 'register'
          ? await authService.register(trimmedEmail, password, trimmedNick)
          : await authService.loginWithEmail(trimmedEmail, password);

      onLoginSuccess(response.user.email, response.user.nickname || response.user.first_name);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message || 'Błąd uwierzytelniania.');
      } else {
        setErrorMessage('Błąd uwierzytelniania. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        automaticallyAdjustKeyboardInsets={true}
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
          {/* Clean Spotly Brand */}
          <View style={styles.brandRow}>
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
          </View>

          {/* Seamless Animated Parking Simulation Area */}
          <View style={styles.parkingSceneContainer}>
            <ParkingAnimationScene />
          </View>
        </Animated.View>

        {/* Bottom Form Card (Anchored smoothly with no gap) */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: entranceAnim,
            },
          ]}
        >
          {/* Mode Toggle: Logowanie vs Rejestracja */}
          <View style={styles.tabSelector}>
            <Pressable
              style={[styles.tabItem, authMode === 'login' && styles.tabItemActive]}
              onPress={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabItemText, authMode === 'login' && styles.tabItemTextActive]}>
                Logowanie
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tabItem, authMode === 'register' && styles.tabItemActive]}
              onPress={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
            >
              <Text
                style={[styles.tabItemText, authMode === 'register' && styles.tabItemTextActive]}
              >
                Rejestracja
              </Text>
            </Pressable>
          </View>

          <View style={styles.cardHeader}>
            <Text style={styles.welcomeText}>
              {authMode === 'register' ? 'Dołącz do Spotly' : 'Witaj w Spotly'}
            </Text>
            <Text style={styles.instructionText}>
              {authMode === 'register'
                ? 'Wprowadź dane, aby utworzyć konto w systemie'
                : 'Zaloguj się, aby znaleźć lub udostępnić miejsce'}
            </Text>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={14} color={colors.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {authMode === 'register' && (
            <View
              style={[
                styles.inputContainer,
                focusedField === 'nickname' && styles.inputContainerFocused,
              ]}
            >
              <Feather
                name="user"
                size={18}
                color={focusedField === 'nickname' ? colors.accent : colors.placeholder}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Nick / Nazwa użytkownika *"
                placeholderTextColor={colors.placeholder}
                value={nickname}
                onFocus={() => setFocusedField('nickname')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(val) => {
                  setNickname(val);
                  setErrorMessage(null);
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />
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
              color={focusedField === 'email' ? colors.accent : colors.placeholder}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Adres e-mail *"
              placeholderTextColor={colors.placeholder}
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
              color={focusedField === 'password' ? colors.accent : colors.placeholder}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder={authMode === 'register' ? 'Hasło (min. 6 znaków) *' : 'Hasło *'}
              placeholderTextColor={colors.placeholder}
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
                color={focusedField === 'password' ? colors.accent : colors.placeholder}
              />
            </Pressable>
          </View>

          {/* Primary Action Button with Spring Physical Press Animation */}
          <Pressable
            onPressIn={() => handlePressInButton(buttonScale)}
            onPressOut={() => handlePressOutButton(buttonScale)}
            onPress={handleSubmit}
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
                  <Feather
                    name={authMode === 'register' ? 'user-plus' : 'log-in'}
                    size={18}
                    color="#ffffff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.primaryButtonText}>
                    {authMode === 'register'
                      ? 'Zarejestruj się w Spotly'
                      : 'Zaloguj się przez Email'}
                  </Text>
                </>
              )}
            </Animated.View>
          </Pressable>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 46,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  brandIconWrapper: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    marginRight: 10,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '900',
  },
  appName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.6,
  },
  parkingSceneContainer: {
    width: '100%',
    height: 290,
    overflow: 'hidden',
  },
  formCard: {
    flex: 1,
    minHeight: 510,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
    marginTop: -16, // Seamless overlap onto the bottom of the road
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: colors.controlSurface,
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.subdued,
  },
  tabItemTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  cardHeader: {
    marginBottom: 14,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 3,
    letterSpacing: -0.4,
  },
  instructionText: {
    fontSize: 12.5,
    color: colors.muted,
    lineHeight: 17,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorSurface,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 11,
  },
  inputContainerFocused: {
    borderColor: '#10b981',
    backgroundColor: colors.surface,
  },
  inputIcon: {
    marginRight: 10,
    pointerEvents: 'none',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 6,
  },
  primaryButton: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: colors.placeholder,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    height: 46,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  googleButtonText: {
    color: colors.label,
    fontSize: 14,
    fontWeight: '600',
  },
  demoLink: {
    alignSelf: 'center',
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  demoLinkText: {
    color: colors.success,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
