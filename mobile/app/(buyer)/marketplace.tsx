import React, { useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { buyerService } from '../../src/services/buyerService';

export default function BuyerMarketplaceScreen() {
  const router = useRouter();
  const [lots, setLots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');

  const loadMarketplace = async () => {
    try {
      const res = await buyerService.browseMarketplace({
        q: searchQuery.trim() || undefined,
        grade: selectedGrade === 'ALL' ? undefined : selectedGrade,
      });
      setLots(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, [selectedGrade]);

  const handleSearch = () => {
    setLoading(true);
    loadMarketplace();
  };

  if (loading && !refreshing) return <LoadingSpinner message="Searching marketplace lots..." />;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search materials, city, or stream..."
          placeholderTextColor="#ADB5BD"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => { setSearchQuery(''); loadMarketplace(); }}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Grade Filters */}
      <View style={styles.filterRow}>
        {['ALL', 'A', 'B', 'C', 'Mixed'].map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.filterChip, selectedGrade === g && styles.filterChipActive]}
            onPress={() => setSelectedGrade(g)}
          >
            <Text style={[styles.filterText, selectedGrade === g && styles.filterTextActive]}>
              {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={lots}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMarketplace(); }} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title="No Matching Lots"
            description="Try adjusting your search terms or grade filters."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleInfo}>
                <Text style={styles.categoryTitle}>{item.material_category}</Text>
                {!!item.subcategory && (
                  <Text style={styles.streamSubtitle}>{item.subcategory}</Text>
                )}
              </View>
              <Badge label={`Grade ${item.grade || 'Std'}`} status="ACTIVE" />
            </View>

            <View style={styles.metricGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricVal}>{item.weight_kg} kg</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Asking Price</Text>
                <Text style={styles.priceVal}>₹{item.asking_price}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.locationText}>📍 {item.city || 'India'}</Text>
              <Button
                title="Make Offer"
                size="small"
                onPress={() => router.push({
                  pathname: '/(buyer)/submit-offer',
                  params: { lotId: item.id, askingPrice: item.asking_price, weight: item.weight_kg },
                })}
              />
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 16,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
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
    marginBottom: 10,
  },
  titleInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  streamSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  priceVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});

