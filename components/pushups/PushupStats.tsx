// components/pushups/PushupStats.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { usePushupStore } from '../../interfaces/pushup_store';
import Colors from '../../constants/Colors';
import { useTodaysPushups } from '../../hooks/usePushups';


const PushupStats: React.FC = () => {
  const getStreak = usePushupStore(state => state.getStreak);
  const getTotalPushups = usePushupStore(state => state.getTotalPushups);
  const todaysPushups = useTodaysPushups().totalCount;
  const currentStreak = getStreak();
  const lifetimeTotal = getTotalPushups();

  return (
    <View style={styles.container}>
      {/* Main Today's Pushups Card */}
      <View style={styles.mainCard}>
        <View style={styles.mainCardContent}>
          <View>
            <Text style={styles.mainCardLabel}>Today's Pushups</Text>
            <Text style={styles.mainCardValue}>{todaysPushups}</Text>
          </View>
          <View style={styles.mainCardIconContainer}>
            <FontAwesome6 
              name="dumbbell" 
              size={24} 
              color={Colors.shared.primary[500]} 
            />
          </View>
        </View>
      </View>

      {/* Secondary Stats Row */}
      <View style={styles.statsRow}>
        {/* Streak Card */}
        <View style={styles.statCard}>
          <View style={styles.statCardContent}>
            <View>
              <Text style={styles.statCardLabel}>Current Streak</Text>
              <Text style={styles.statCardValue}>{currentStreak}</Text>
              <Text style={styles.statCardUnit}>days</Text>
            </View>
            <View style={styles.statCardIconContainer}>
              <FontAwesome6 
                name="fire" 
                size={16} 
                color={Colors.shared.primary[500]} 
              />
            </View>
          </View>
        </View>

        {/* Total Pushups Card */}
        <View style={styles.statCard}>
          <View style={styles.statCardContent}>
            <View>
              <Text style={styles.statCardLabel}>Lifetime Total</Text>
              <Text style={styles.statCardValue}>{lifetimeTotal}</Text>
              <Text style={styles.statCardUnit}>pushups</Text>
            </View>
            <View style={styles.statCardIconContainer}>
              <FontAwesome6 
                name="trophy" 
                size={16} 
                color={Colors.shared.primary[500]} 
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  mainCard: {
    backgroundColor: Colors.light.background.paper,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shared.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mainCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainCardLabel: {
    fontSize: 18,
    color: Colors.light.text.secondary,
    marginBottom: 4,
  },
  mainCardValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.light.text.primary,
  },
  mainCardIconContainer: {
    backgroundColor: Colors.shared.primary[50],
    padding: 16,
    borderRadius: 50,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.background.paper,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shared.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardLabel: {
    fontSize: 14,
    color: Colors.light.text.secondary,
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text.primary,
  },
  statCardUnit: {
    fontSize: 12,
    color: Colors.light.text.secondary,
  },
  statCardIconContainer: {
    backgroundColor: Colors.shared.primary[50],
    padding: 8,
    borderRadius: 25,
  },
});

export default PushupStats;