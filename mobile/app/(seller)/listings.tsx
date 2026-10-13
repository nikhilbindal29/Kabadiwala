import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { sellerService } from '../../src/services/sellerService';

export default function SellerListingsScreen() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  const loadListings = async () => {
    try {
      const res = await sellerService.getListings();
      setListings(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const filteredListings = activeTab === 'ALL'
    ? listings
    : listings.filter((l) => l.status === activeTab);

  if (loading) return <LoadingSpinner message="Fetching your listings..." />;

  return (
    <View style={styles.container}>
      {/* Status Filter Tabs */}
      <View style={styles.filterRow}>
        {['ALL', 'ACTIVE', 'RESERVED', 'SOLD', 'CANCELLED'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterChip, activeTab === tab && styles.filterChipActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.filterText, activeTab === tab && styles.filterTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadListings(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Listings Found"
            description="You have not published any items in this category."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleArea}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.categoryBadge}>{item.material_category}</Text>
              </View>
              <Badge label={item.status} status={item.status} />
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>
                Quantity: <Text style={styles.bold}>{item.quantity} {item.unit}</Text>
              </Text>
              <Text style={styles.detailText}>
                Weight: <Text style={styles.bold}>{item.estimated_weight_kg} kg</Text>
              </Text>
            </View>

            {!!item.price_expectation && (
              <Text style={styles.priceText}>
                Expected: ₹{item.price_expectation}
              </Text>
            )}

            {!!item.city && (
              <Text style={styles.locationText}>
                📍 {item.locality ? `${item.locality}, ` : ''}{item.city}
              </Text>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.textInverse,
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
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  categoryBadge: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  bold: {
    fontWeight: '700',
    color: Colors.text,
  },
  priceText: {
    fontSize: 14,
    color: Colors.primaryDark,
    fontWeight: '700',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
});

