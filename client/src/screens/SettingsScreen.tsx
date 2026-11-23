import React, { useEffect } from 'react';
import {
  BackHandler,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ThemeColors, useDarkMode, useThemeColors, useThemedStyles } from '../theme/theme';

interface SettingsScreenProps {
  userNickname: string;
  onBack: () => void;
  onDarkModeChange: (enabled: boolean) => void;
}

export function SettingsScreen({ userNickname, onBack, onDarkModeChange }: SettingsScreenProps) {
  const colors = useThemeColors();
  const darkMode = useDarkMode();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Wróć do konta"
          accessibilityRole="button"
          onPress={onBack}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={styles.title}>
          Ustawienia
        </Text>
      </View>
      <View style={styles.row}>
        <Feather name="user" size={20} color={colors.accent} />
        <Text style={styles.label}>Nazwa użytkownika</Text>
        <Text style={styles.value}>{userNickname || '—'}</Text>
      </View>
      <View style={styles.row}>
        <Feather name={darkMode ? 'moon' : 'sun'} size={20} color={colors.accent} />
        <Text style={styles.label}>Tryb ciemny</Text>
        <Switch
          accessibilityLabel="Tryb ciemny"
          value={darkMode}
          onValueChange={onDarkModeChange}
          trackColor={{ false: colors.strongBorder, true: colors.brand }}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: 48,
      paddingHorizontal: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.subtleBorder,
      gap: 8,
    },
    backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { color: colors.text, fontSize: 22, fontWeight: '800' },
    row: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    value: { color: colors.muted, fontSize: 14, flexShrink: 1 },
    label: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' },
  });
