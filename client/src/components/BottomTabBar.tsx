import { ThemeColors, useThemedStyles, useThemeColors } from '../theme/theme';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type TabName = 'search' | 'reservations' | 'add' | 'account';

interface BottomTabBarProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  const styles = useThemedStyles(createStyles);
  const colors = useThemeColors();
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Szukaj"
        accessibilityState={{ selected: activeTab === 'search' }}
        onPress={() => onTabChange('search')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'search' ? 'map' : 'map-outline'}
          size={22}
          color={activeTab === 'search' ? colors.accent : colors.muted}
        />
        <Text style={[styles.tabLabel, activeTab === 'search' && styles.activeLabel]}>Szukaj</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Rezerwacje"
        accessibilityState={{ selected: activeTab === 'reservations' }}
        onPress={() => onTabChange('reservations')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'reservations' ? 'calendar' : 'calendar-outline'}
          size={22}
          color={activeTab === 'reservations' ? colors.accent : colors.muted}
        />
        <Text style={[styles.tabLabel, activeTab === 'reservations' && styles.activeLabel]}>
          Rezerwacje
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Dodaj"
        accessibilityState={{ selected: activeTab === 'add' }}
        onPress={() => onTabChange('add')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'add' ? 'add-circle' : 'add-circle-outline'}
          size={24}
          color={activeTab === 'add' ? colors.accent : colors.muted}
        />
        <Text style={[styles.tabLabel, activeTab === 'add' && styles.activeLabel]}>Dodaj</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Konto"
        accessibilityState={{ selected: activeTab === 'account' }}
        onPress={() => onTabChange('account')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === 'account' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'account' ? colors.accent : colors.muted}
        />
        <Text style={[styles.tabLabel, activeTab === 'account' && styles.activeLabel]}>Konto</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  tabBar: {
    height: 72,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.subtleBorder,
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
    color: colors.muted,
    marginTop: 3,
  },
  activeLabel: {
    color: colors.accent,
    fontWeight: '700',
  },
});
