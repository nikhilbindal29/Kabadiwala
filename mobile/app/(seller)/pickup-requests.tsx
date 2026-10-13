import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { sellerService } from '../../src/services/sellerService';

export default function SellerPickupRequestsScreen() {
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPickups = async () => {
    try {
      const res = await sellerService.getPickupRequests();
      setPickups(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPickups();
  }, []);

  if (loading) return <LoadingSpinner message="Loading pickup requests..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={pickups}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPickups(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Pickup Requests"
            description="You have not scheduled any scrap pickups yet."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.pickupId}>Pickup #{item.id.slice(0, 8)}</Text>
              <Badge label={item.status} status={item.status} />
            </View>

            <Text style={styles.address}>📍 {item.pickup_address}</Text>

            {!!item.scheduled_at && (
              <Text style={styles.scheduledTime}>
                Requested Time: {item.scheduled_at}
              </Text>
            )}

            {!!item.actual_weight_kg && (
              <Text style={styles.weight}>
                Collected Weight: <Text style={styles.bold}>{item.actual_weight_kg} kg</Text>
              </Text>
            )}

            {!!item.collection_notes && (
              <Text style={styles.notes}>Notes: {item.collection_notes}</Text>
            )}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  address: {
    fontSize: 14,
    color: Colors.text,
    marginVertical: 4,
  },
  scheduledTime: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  weight: {
    fontSize: 14,
    color: Colors.primaryDark,
    marginTop: 6,
  },
  bold: {
    fontWeight: '700',
  },
  notes: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
});

