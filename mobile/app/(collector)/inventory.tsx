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
import { collectorService } from '../../src/services/collectorService';

export default function CollectorInventoryScreen() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadInventory = async () => {
    try {
      const res = await collectorService.getInventory();
      setInventory(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  if (loading) return <LoadingSpinner message="Loading stock inventory..." />;

  return (
    <View style={styles.container}>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadInventory(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Inventory Lots"
            description="You don't have any material lots in stock. Create a lot or complete a pickup to stock inventory."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleInfo}>
                <Text style={styles.category}>{item.material_category}</Text>
                {!!item.subcategory && (
                  <Text style={styles.subcategory}>{item.subcategory}</Text>
                )}
              </View>
              <Badge label={item.status} status={item.status} />
            </View>

            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricVal}>{item.weight_kg} kg</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Grade</Text>
                <Text style={styles.metricVal}>{item.grade || 'Standard'}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Asking Price</Text>
                <Text style={styles.priceVal}>₹{item.asking_price}</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Text style={styles.cityText}>📍 {item.city || 'Local'}</Text>
              <Text style={styles.conditionText}>Condition: {item.condition}</Text>
            </View>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleInfo: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  subcategory: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  priceVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cityText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  conditionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

