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

export default function SellerOrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      const res = await sellerService.getOrders();
      setOrders(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Orders Found"
            description="You don't have any orders or completed sales yet."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.orderId}>Order #{item.id.slice(0, 8)}</Text>
              <Badge label={item.status} status={item.status} />
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Agreed Price:</Text>
              <Text style={styles.priceVal}>₹{item.agreed_price}</Text>
            </View>

            <Text style={styles.qtyText}>
              Quantity: {item.quantity} {item.unit}
            </Text>

            <Text style={styles.dateText}>
              Updated: {new Date(item.updated_at || item.created_at).toLocaleDateString()}
            </Text>
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
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  qtyText: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});

