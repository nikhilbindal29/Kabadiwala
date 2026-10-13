import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { collectorService } from '../../src/services/collectorService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function CollectorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await collectorService.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading collector dashboard..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.greeting}>Kabadiwala Portal 👋</Text>
          <Text style={styles.subGreeting}>{user?.business_name || user?.full_name}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push({ pathname: '/profile' })}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Colors.primary }]}>
            {data?.available_pickups_count || 0}
          </Text>
          <Text style={styles.metricLabel}>Nearby Pickups</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.scheduled_pickups_count || 0}</Text>
          <Text style={styles.metricLabel}>Scheduled</Text>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.inventory_lots_count || 0}</Text>
          <Text style={styles.metricLabel}>Stock Lots</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.total_inventory_weight_kg || 0} kg</Text>
          <Text style={styles.metricLabel}>Total Weight</Text>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Colors.info }]}>
            {data?.pending_offers_count || 0}
          </Text>
          <Text style={styles.metricLabel}>Buyer Offers</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Colors.primaryDark }]}>
            ₹{data?.total_earnings || 0}
          </Text>
          <Text style={styles.metricLabel}>Completed Sales</Text>
        </Card>
      </View>

      {/* Quick Action buttons */}
      <View style={styles.actionsRow}>
        <Button
          title="Browse Pickups"
          onPress={() => router.push('/(collector)/available-pickups')}
          style={styles.halfBtn}
        />
        <Button
          title="+ Create Lot"
          variant="secondary"
          onPress={() => router.push('/(collector)/create-lot')}
          style={styles.halfBtn}
        />
      </View>

      {/* Quick Compare Banner */}
      {data?.pending_offers_count > 0 && (
        <Card style={styles.compareBanner}>
          <View style={styles.compareRow}>
            <Ionicons name="git-compare" size={24} color={Colors.primary} />
            <View style={styles.compareInfo}>
              <Text style={styles.compareTitle}>
                {data.pending_offers_count} Buyer Offers Awaiting Review
              </Text>
              <Text style={styles.compareSub}>Compare gross offer vs net proceeds</Text>
            </View>
          </View>
          <Button
            title="Review & Compare Offers"
            size="small"
            onPress={() => router.push('/(collector)/offer-comparison')}
            style={styles.compareBtn}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subGreeting: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileBtn: {
    padding: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
  },
  halfBtn: {
    flex: 1,
  },
  compareBanner: {
    backgroundColor: '#E8F5E9',
    borderColor: Colors.primaryLight,
    padding: 16,
    marginTop: 6,
    marginBottom: 30,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareInfo: {
    marginLeft: 12,
    flex: 1,
  },
  compareTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  compareSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  compareBtn: {
    marginTop: 12,
  },
});

