// src/screens/DeliveryDashboardScreen.tsx
import React, { useMemo } from 'react';
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeliveryDashboard'>;
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  Open: '#3b82f6',
  Accepted: '#f59e0b',
  'Picked Up': '#8b5cf6',
  'In Transit': '#06b6d4',
  Delivered: '#10b981',
};

const STATUS_BG: Record<OrderStatus, string> = {
  Open: '#1e3a5f',
  Accepted: '#451a03',
  'Picked Up': '#2e1065',
  'In Transit': '#083344',
  Delivered: '#052e16',
};

export default function DeliveryDashboardScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const orders = useOrders();

  const myOrders = useMemo(() => {
    return orders.filter(
      o => o.assignedDriverId === user?.id || o.assignedDriverId === null
    );
  }, [orders, user]);

  const openOrders = myOrders.filter(o => o.status === 'Open');
  const myActiveOrders = orders.filter(
    o => o.assignedDriverId === user?.id && o.status !== 'Delivered'
  );
  const deliveredCount = orders.filter(
    o => o.assignedDriverId === user?.id && o.status === 'Delivered'
  ).length;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => navigation.replace('Login'),
      },
    ]);
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const isOpen = item.status === 'Open';
    const isMine = item.assignedDriverId === user?.id;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.customerName}>{item.customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_BG[item.status] }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.orderDivider} />

        <Text style={styles.addressLabel}>📍 Delivery Address</Text>
        <Text style={styles.addressText}>{item.address}</Text>

        <View style={styles.itemsRow}>
          <Text style={styles.itemsLabel}>Items: </Text>
          <Text style={styles.itemsText}>{item.items.join(', ')}</Text>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.amount}>₹{item.totalAmount.toLocaleString()}</Text>
          {isOpen && !isMine && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW ORDER</Text>
            </View>
          )}
          {isMine && item.status !== 'Delivered' && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>● ACTIVE</Text>
            </View>
          )}
          <Text style={styles.tapHint}>Tap to manage →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const displayOrders = [...myActiveOrders, ...openOrders].filter(
    (o, i, arr) => arr.findIndex(x => x.id === o.id) === i
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Delivery Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{openOrders.length}</Text>
          <Text style={styles.statLabel}>Open Orders</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#f59e0b' }]}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{myActiveOrders.length}</Text>
          <Text style={styles.statLabel}>My Active</Text>
        </View>
        <View style={[styles.statCard, { borderColor: '#10b981' }]}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{deliveredCount}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {/* List */}
      <Text style={styles.sectionTitle}>
        {displayOrders.length === 0 ? 'No orders available' : 'Available & Active Orders'}
      </Text>

      <FlatList
        data={displayOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>No orders right now.</Text>
            <Text style={styles.emptySubText}>Check back soon!</Text>
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

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#3b82f6' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2, textAlign: 'center' },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },

  orderCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: { fontSize: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.5 },
  customerName: { fontSize: 17, fontWeight: '700', color: '#f8fafc', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  orderDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 12,
  },
  addressLabel: { fontSize: 11, color: '#64748b', marginBottom: 4, fontWeight: '600' },
  addressText: { fontSize: 13, color: '#cbd5e1', marginBottom: 10, lineHeight: 18 },
  itemsRow: { flexDirection: 'row', marginBottom: 14, flexWrap: 'wrap' },
  itemsLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  itemsText: { fontSize: 12, color: '#94a3b8', flex: 1 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: { fontSize: 18, fontWeight: '800', color: '#f59e0b' },
  newBadge: {
    backgroundColor: '#1e3a5f',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  newBadgeText: { fontSize: 10, color: '#3b82f6', fontWeight: '700', letterSpacing: 0.5 },
  activeBadge: {
    backgroundColor: '#052e16',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 10, color: '#10b981', fontWeight: '700' },
  tapHint: { fontSize: 11, color: '#475569' },

  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  emptySubText: { fontSize: 13, color: '#64748b', marginTop: 6 },
});
