import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

interface ProfileScreenProps {
  userEmail?: string;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ userEmail, onLogout }) => {
  const displayEmail = userEmail || 'janusz.lewandowski@spotly.io';
  const displayName = userEmail ? userEmail.split('@')[0] : 'Janusz Lewandowski';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{displayEmail}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Kierowca & Gospodarz</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Uwierzytelnianie i Bezpieczeństwo</Text>

        <View style={styles.menuItem}>
          <Ionicons name="logo-apple" size={20} color="#111827" style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Apple Sign-In</Text>
            <Text style={styles.menuSub}>Połączono z kontem Apple ID</Text>
          </View>
          <Text style={styles.connectedBadge}>Połączono</Text>
        </View>

        <View style={styles.menuItem}>
          <Ionicons name="logo-google" size={19} color="#db4437" style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Google Sign-In</Text>
            <Text style={styles.menuSub}>Połączone z adresem Gmail</Text>
          </View>
          <Text style={styles.connectedBadge}>Połączono</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Ustawienia aplikacji</Text>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <Feather name="credit-card" size={19} color="#4b5563" style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Metody płatności</Text>
            <Text style={styles.menuSub}>Karty testowe, BLIK</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <Feather name="bell" size={19} color="#4b5563" style={styles.menuIcon} />
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Powiadomienia i opóźnienia</Text>
            <Text style={styles.menuSub}>Alerty o końcu czasu parkowania</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9ca3af" />
        </TouchableOpacity>

        {onLogout && (
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Feather name="log-out" size={19} color="#ef4444" style={styles.menuIcon} />
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Wyloguj się</Text>
              <Text style={styles.menuSub}>Zakończ bieżącą sesję</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1b5e3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  menuSection: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoutItem: {
    marginTop: 8,
    borderColor: '#fee2e2',
    backgroundColor: '#fff5f5',
  },
  logoutText: {
    color: '#ef4444',
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
    color: '#111827',
  },
  menuSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  connectedBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
});
