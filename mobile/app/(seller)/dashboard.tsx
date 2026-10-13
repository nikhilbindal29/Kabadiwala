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
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { sellerService } from '../../src/services/sellerService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function SellerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await sellerService.getDashboard();
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

  if (loading) return <LoadingSpinner message="Loading seller dashboard..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.full_name || 'Seller'} 👋</Text>
          <Text style={styles.subGreeting}>Manage e-waste pickups & sales</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push({ pathname: '/profile' })}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Metrics Grid */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.active_listings_count || 0}</Text>
          <Text style={styles.metricLabel}>Active Items</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.pending_pickups_count || 0}</Text>
          <Text style={styles.metricLabel}>Pending Pickups</Text>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.completed_sales_count || 0}</Text>
          <Text style={styles.metricLabel}>Sold Items</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Colors.primary }]}>
            ₹{data?.total_earnings || 0}
          </Text>
          <Text style={styles.metricLabel}>Total Earnings</Text>
        </Card>
      </View>

      {/* Quick Action */}
      <Button
        title="+ List New Scrap Item"
        onPress={() => router.push('/(seller)/create-listing')}
        style={styles.actionBtn}
      />

      {/* Recent Listings */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Listings</Text>
        <TouchableOpacity onPress={() => router.push('/(seller)/listings')}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {(!data?.recent_listings || data.recent_listings.length === 0) ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No listings yet. Post your first e-waste item!</Text>
        </Card>
      ) : (
        data.recent_listings.map((item: any) => (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemSub}>
                  {item.quantity} {item.unit} • Approx {item.estimated_weight_kg} kg
                </Text>
              </View>
              <Badge label={item.status} status={item.status} />
            </View>
          </Card>
        ))
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
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionBtn: {
    marginVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  itemCard: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  itemSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});

