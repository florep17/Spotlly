import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { authService } from '../services/api/authService';

interface LoginScreenProps {
  onLoginSuccess: (email: string) => void;
}

const loginBackground = require('../../assets/login_bg.jpg');

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        <ImageBackground source={loginBackground} style={styles.backgroundImage} resizeMode="cover">
          {/* Subtle dark gradient overlay */}
          <View style={styles.overlay} />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardContainer}
          >
            {/* Top Branding Section */}
            <View style={styles.topSection}>
              <View style={styles.brandIconWrapper}>
                <View style={styles.brandIcon}>
                  <Text style={styles.brandIconText}>S</Text>
                </View>
              </View>

              <Text style={styles.appName}>Spotly</Text>
              <Text style={styles.tagline}>Współdzielenie prywatnych miejsc parkingowych</Text>
            </View>

            {/* Bottom Glass Card Form */}
            <View style={styles.formCard}>
              <Text style={styles.welcomeText}>Witaj ponownie</Text>
              <Text style={styles.instructionText}>
                Zaloguj się, aby rezerwować lub udostępniać miejsca
              </Text>

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

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Feather name="mail" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Adres e-mail"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Feather name="lock" size={18} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Hasło"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Primary Action Button: Login with Email */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleEmailLogin}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Feather name="log-in" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={styles.primaryButtonText}>Zaloguj się przez Email</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>LUB</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Secondary Button: Google Login */}
              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="logo-google"
                  size={18}
                  color="#db4437"
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.googleButtonText}>Kontynuuj z Google</Text>
              </TouchableOpacity>

              {/* Quick bypass demo link */}
              <TouchableOpacity
                style={styles.demoLink}
                onPress={() => onLoginSuccess('demo.kierowca@spotly.io')}
                activeOpacity={0.7}
              >
                <Text style={styles.demoLinkText}>Wejdź jako gość testowy ➔</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 28,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  brandIconWrapper: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  brandIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#1b5e3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  brandIconText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
  },
  appName: {
    fontSize: 34,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
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
    marginBottom: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    fontWeight: '500',
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
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
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
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
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
    fontSize: 12,
    color: '#1b5e3a',
    fontWeight: '700',
  },
});
