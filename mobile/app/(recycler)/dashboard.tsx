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
import { recyclerService } from '../../src/services/recyclerService';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RecyclerDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const res = await recyclerService.getDashboard();
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

  if (loading) return <LoadingSpinner message="Loading authorized recycler portal..." />;

  const isAuthorized = data?.is_authorized;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.greeting}>Recycler Facility 👋</Text>
          <Text style={styles.subGreeting}>{user?.business_name || user?.full_name}</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push({ pathname: '/profile' })}>
          <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Authorization Status Banner */}
      <Card style={[styles.authCard, isAuthorized ? styles.authCardVerified : styles.authCardUnverified]}>
        <View style={styles.authRow}>
          <Ionicons
            name={isAuthorized ? 'shield-checkmark' : 'warning-outline'}
            size={28}
            color={isAuthorized ? Colors.primary : Colors.warning}
          />
          <View style={styles.authInfo}>
            <Text style={[styles.authTitle, isAuthorized ? styles.authTitleVerified : styles.authTitleUnverified]}>
              {isAuthorized ? 'Authorized Recycling Facility' : 'Unverified Facility Status'}
            </Text>
            <Text style={styles.authSub}>
              {isAuthorized
                ? 'Pollution Control Board compliance documents active and verified.'
                : 'Upload PCB authorization documents to receive verified buyer status.'}
            </Text>
          </View>
        </View>
        {!isAuthorized && (
          <Button
            title="Upload Compliance Docs"
            size="small"
            variant="outline"
            onPress={() => router.push('/(recycler)/verification')}
            style={styles.verifyBtn}
          />
        )}
      </Card>

      {/* Real Ecological Impact Derived from Completed Handovers */}
      <Card style={styles.impactCard}>
        <Text style={styles.impactTitle}>Real Environmental Impact (Completed Handovers)</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCol}>
            <Text style={styles.impactVal}>{data?.total_material_recycled_kg || 0} kg</Text>
            <Text style={styles.impactLabel}>Processed Weight</Text>
          </View>
          <View style={styles.impactCol}>
            <Text style={styles.impactVal}>{data?.impact_metrics?.co2_saved_kg || 0} kg</Text>
            <Text style={styles.impactLabel}>Est. CO₂ Avoided</Text>
          </View>
          <View style={styles.impactCol}>
            <Text style={styles.impactVal}>{data?.impact_metrics?.landfill_diverted_kg || 0} kg</Text>
            <Text style={styles.impactLabel}>Diverted from Landfill</Text>
          </View>
        </View>
        <Text style={styles.modeledNote}>* Metrics calculated strictly from confirmed receipt weights.</Text>
      </Card>

      {/* Operational Counters */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.available_materials_count || 0}</Text>
          <Text style={styles.metricLabel}>Available Streams</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.pending_offers_count || 0}</Text>
          <Text style={styles.metricLabel}>Pending Bids</Text>
        </Card>
      </View>

      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.pending_handovers_count || 0}</Text>
          <Text style={styles.metricLabel}>Inbound Handovers</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricValue}>{data?.documents_count || 0}</Text>
          <Text style={styles.metricLabel}>Active Licenses</Text>
        </Card>
      </View>

      <Button
        title="Browse Recyclable Streams"
        onPress={() => router.push('/(recycler)/material-marketplace')}
        size="large"
        style={styles.actionBtn}
      />
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
    marginBottom: 16,
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
  authCard: {
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
  },
  authCardVerified: {
    borderColor: Colors.primaryLight,
    backgroundColor: '#F4FAF6',
  },
  authCardUnverified: {
    borderColor: Colors.warning,
    backgroundColor: '#FFFBF0',
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  authTitleVerified: {
    color: Colors.primaryDark,
  },
  authTitleUnverified: {
    color: '#856404',
  },
  authSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  verifyBtn: {
    marginTop: 10,
  },
  impactCard: {
    backgroundColor: Colors.primaryDark,
    padding: 16,
    marginBottom: 14,
  },
  impactTitle: {
    color: '#D8F3DC',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactCol: {
    flex: 1,
    alignItems: 'center',
  },
  impactVal: {
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '800',
  },
  impactLabel: {
    color: '#B7E4C7',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  modeledNote: {
    color: '#95D5B2',
    fontSize: 10,
    marginTop: 12,
    fontStyle: 'italic',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  actionBtn: {
    marginVertical: 12,
    marginBottom: 30,
  },
});

