import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
        <Ionicons
          name={activeTab === 'search' ? 'map' : 'map-outline'}
          size={22}
          color={activeTab === 'search' ? '#1b5e3a' : '#6b7280'}
        />
        <Text style={[styles.tabLabel, activeTab === 'search' && styles.activeLabel]}>Szukaj</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('reservations')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'reservations' ? 'calendar' : 'calendar-outline'}
          size={22}
          color={activeTab === 'reservations' ? '#1b5e3a' : '#6b7280'}
        />
        <Text style={[styles.tabLabel, activeTab === 'reservations' && styles.activeLabel]}>
          Rezerwacje
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('add')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'add' ? 'add-circle' : 'add-circle-outline'}
          size={24}
          color={activeTab === 'add' ? '#1b5e3a' : '#6b7280'}
        />
        <Text style={[styles.tabLabel, activeTab === 'add' && styles.activeLabel]}>Dodaj</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('account')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'account' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'account' ? '#1b5e3a' : '#6b7280'}
        />
        <Text style={[styles.tabLabel, activeTab === 'account' && styles.activeLabel]}>Konto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 3,
  },
  activeLabel: {
    color: '#1b5e3a',
    fontWeight: '700',
  },
});
