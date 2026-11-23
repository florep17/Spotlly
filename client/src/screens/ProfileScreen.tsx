import { ThemeColors, useThemedStyles, useThemeColors } from '../theme/theme';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ProfileScreenProps {
  userEmail?: string;
  onLogout?: () => void;
  onOpenSettings: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userEmail, onLogout, onOpenSettings }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  const displayEmail = userEmail || '';
  const initials = displayEmail.slice(0, 2).toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userEmail}>{displayEmail}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Kierowca & Gospodarz</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Konto</Text>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.menuItem}
          onPress={onOpenSettings}
          activeOpacity={0.7}
        >
          <Feather name="settings" size={19} color={colors.accent} style={styles.menuIcon} />
          <Text style={[styles.menuTitle, styles.menuTextContainer]}>Ustawienia</Text>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </TouchableOpacity>

        {onLogout && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Wyloguj się"
            style={[styles.menuItem, styles.logoutItem]}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={19} color={colors.danger} style={styles.menuIcon} />
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Wyloguj się</Text>
              <Text style={styles.menuSub}>Zakończ bieżącą sesję</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtleBorder,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.accentSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentText,
  },
  menuSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutItem: {
    marginTop: 8,
    borderColor: colors.dangerTint,
    backgroundColor: colors.dangerSurface,
  },
  logoutText: {
    color: colors.danger,
  },
  menuIcon: {
    marginRight: 12,
    width: 22,
    textAlign: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  menuSub: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  connectedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
});
