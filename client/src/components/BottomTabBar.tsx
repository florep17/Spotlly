import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export type TabName = 'search' | 'reservations' | 'add' | 'account';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('search')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, activeTab === 'search' && styles.activeIcon]}>🗺️</Text>
        <Text style={[styles.tabLabel, activeTab === 'search' && styles.activeLabel]}>Szukaj</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('reservations')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, activeTab === 'reservations' && styles.activeIcon]}>📅</Text>
        <Text style={[styles.tabLabel, activeTab === 'reservations' && styles.activeLabel]}>
          Rezerwacje
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('add')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, activeTab === 'add' && styles.activeIcon]}>⊕</Text>
        <Text style={[styles.tabLabel, activeTab === 'add' && styles.activeLabel]}>Dodaj</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('account')}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabIcon, activeTab === 'account' && styles.activeIcon]}>👤</Text>
        <Text style={[styles.tabLabel, activeTab === 'account' && styles.activeLabel]}>Konto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
  activeLabel: {
    color: '#1b5e3a',
    fontWeight: '800',
  },
});
