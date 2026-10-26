import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JL</Text>
        </View>
        <Text style={styles.userName}>Janusz Lewandowski</Text>
        <Text style={styles.userEmail}>janusz.lewandowski@spotly.io</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>Kierowca & Gospodarz</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Uwierzytelnianie i Bezpieczeństwo</Text>

        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>🍎</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Apple Sign-In</Text>
            <Text style={styles.menuSub}>Połączono z kontem Apple ID</Text>
          </View>
          <Text style={styles.connectedBadge}>Połączono</Text>
        </View>

        <View style={styles.menuItem}>
          <Text style={styles.menuIcon}>🌐</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Google Sign-In</Text>
            <Text style={styles.menuSub}>Połączone z adresem Gmail</Text>
          </View>
          <Text style={styles.connectedBadge}>Połączono</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Ustawienia aplikacji</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>💳</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Metody płatności</Text>
            <Text style={styles.menuSub}>Karty testowe, BLIK</Text>
          </View>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🔔</Text>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Powiadomienia i opóźnienia</Text>
            <Text style={styles.menuSub}>Alerty o końcu czasu parkowania</Text>
          </View>
          <Text style={styles.arrow}>➔</Text>
        </TouchableOpacity>
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
  menuIcon: {
    fontSize: 22,
    marginRight: 12,
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
  arrow: {
    fontSize: 14,
    color: '#9ca3af',
  },
});
