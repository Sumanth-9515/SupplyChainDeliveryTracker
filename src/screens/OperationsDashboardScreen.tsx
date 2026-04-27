
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../hooks/useStore';
import { Order, OrderStatus } from '../store/AppStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OperationsDashboard'>;
};

type FilterType = 'All' | OrderStatus;

const STATUS_COLOR: Record<OrderStatus, string> = {
  Open: '#3b82f6',
  Accepted: '#f59e0b',
  'Picked Up': '#8b5cf6',
  'In Transit': '#06b6d4',
  Delivered: '#10b981',
};

const ALL_STATUSES: FilterType[] = ['All', 'Open', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'];

export default function OperationsDashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const orders = useOrders();
  const [filter, setFilter] = useState<FilterType>('All');

  const stats = useMemo(() => ({
    total: orders.length,
    open: orders.filter(o => o.status === 'Open').length,
    inProgress: orders.filter(o => ['Accepted', 'Picked Up', 'In Transit'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  }), [orders]);

  const filtered = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] }]} />
          <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={styles.address}>📍 {item.address}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.amount}>₹{item.totalAmount.toLocaleString()}</Text>
        {item.driverLocation ? (
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE TRACKING</Text>
          </View>
        ) : (
          <Text style={styles.noTracking}>No tracking yet</Text>
        )}
        {item.assignedDriverId && (
          <Text style={styles.driverLabel}>🛵 Driver Assigned</Text>
        )}
      </View>

      {item.driverLocation && (
        <View style={styles.locationBar}>
          <Text style={styles.locationBarText}>
            📡 {item.driverLocation.latitude.toFixed(4)}, {item.driverLocation.longitude.toFixed(4)}
            {'  '}·{'  '}Updated: {formatTime(item.driverLocation.updatedAt)}
          </Text>
        </View>
      )}

      <Text style={styles.viewDetail}>Tap to view full tracking →</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Operations 📊</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#3b82f6' }]}>
          <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.open}</Text>
          <Text style={styles.statLabel}>Open</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#f59e0b' }]}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#10b981' }]}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.delivered}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        data={ALL_STATUSES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Orders */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No orders match this filter.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#f8fafc' },
  subtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  logoutText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },

  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#8b5cf6' },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },

  filterList: { paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  filterChipTextActive: { color: '#0f172a' },

  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },

  orderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLeft: { flex: 1 },
  orderId: { fontSize: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.5 },
  customerName: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginTop: 2 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  address: { fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 17 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  amount: { fontSize: 16, fontWeight: '800', color: '#f59e0b' },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#052e16',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: { fontSize: 10, fontWeight: '700', color: '#10b981', letterSpacing: 0.5 },
  noTracking: { fontSize: 11, color: '#475569' },
  driverLabel: { fontSize: 11, color: '#f59e0b' },

  locationBar: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#06b6d4',
  },
  locationBarText: { fontSize: 11, color: '#06b6d4' },

  viewDetail: { fontSize: 11, color: '#475569', textAlign: 'right' },

  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, color: '#64748b' },
});
