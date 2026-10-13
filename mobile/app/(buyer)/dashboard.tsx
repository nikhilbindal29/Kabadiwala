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
import { buyerService } from '../../src/services/buyerService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function BuyerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await buyerService.getDashboard();
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

  if (loading) return <LoadingSpinner message="Loading buyer dashboard..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.greeting}>Bulk Buyer Portal 👋</Text>
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
            {data?.available_lots_count || 0}
          </Text>
          <Text style={styles.metricLabel}>Available Lots</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.pending_offers_count || 0}</Text>
          <Text style={styles.metricLabel}>Active Offers</Text>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Colors.info }]}>
            {data?.accepted_offers_count || 0}
          </Text>
          <Text style={styles.metricLabel}>Accepted Deals</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: Colors.primaryDark }]}>
            ₹{data?.total_spent || 0}
          </Text>
          <Text style={styles.metricLabel}>Total Purchases</Text>
        </Card>
      </View>

      <Button
        title="Explore Scrap Marketplace"
        onPress={() => router.push('/(buyer)/marketplace')}
        size="large"
        style={styles.actionBtn}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Purchases</Text>
        <TouchableOpacity onPress={() => router.push('/(buyer)/purchases')}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {(!data?.recent_orders || data.recent_orders.length === 0) ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No completed purchases yet. Browse active lots!</Text>
        </Card>
      ) : (
        data.recent_orders.map((item: any) => (
          <Card key={item.id} style={styles.orderCard}>
            <View style={styles.orderRow}>
              <View>
                <Text style={styles.orderTitle}>Order #{item.id.slice(0, 8)}</Text>
                <Text style={styles.orderSub}>
                  {item.quantity} {item.unit} • ₹{item.agreed_price}
                </Text>
              </View>
              <Text style={styles.statusText}>{item.status}</Text>
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
    fontSize: 24,
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
  orderCard: {
    marginBottom: 10,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  orderSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});

