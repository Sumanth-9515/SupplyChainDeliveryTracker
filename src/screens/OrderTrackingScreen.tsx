// src/screens/OrderTrackingScreen.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';
import { useOrder } from '../hooks/useStore';
import { OrderStatus } from '../store/AppStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OrderTracking'>;
  route: RouteProp<RootStackParamList, 'OrderTracking'>;
};

const STATUS_STEPS: OrderStatus[] = ['Open', 'Accepted', 'Picked Up', 'In Transit', 'Delivered'];

const STATUS_COLOR: Record<OrderStatus, string> = {
  Open: '#3b82f6',
  Accepted: '#f59e0b',
  'Picked Up': '#8b5cf6',
  'In Transit': '#06b6d4',
  Delivered: '#10b981',
};

export default function OrderTrackingScreen({ navigation, route }: Props) {
  const order = useOrder(route.params.orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Order not found.</Text>
      </SafeAreaView>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const isTracking = order.driverLocation && order.status !== 'Delivered';

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Order Tracking</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Status Hero */}
        <View style={[styles.heroCard, { borderColor: STATUS_COLOR[order.status] }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroId}>{order.id}</Text>
              <Text style={styles.heroCustomer}>{order.customerName}</Text>
            </View>
            <View style={[styles.heroBadge, { backgroundColor: STATUS_COLOR[order.status] + '22' }]}>
              <Text style={[styles.heroBadgeText, { color: STATUS_COLOR[order.status] }]}>
                {order.status}
              </Text>
            </View>
          </View>
          <Text style={styles.heroAddress}>📍 {order.address}</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroAmount}>₹{order.totalAmount.toLocaleString()}</Text>
            {order.assignedDriverId ? (
              <Text style={styles.driverAssigned}>🛵 Driver: {order.assignedDriverId}</Text>
            ) : (
              <Text style={styles.noDriver}>⏳ Awaiting driver</Text>
            )}
          </View>
        </View>

        {/* Live Tracking Map-like card */}
        {isTracking ? (
          <View style={styles.mapCard}>
            <View style={styles.mapHeader}>
              <View style={styles.liveIndicator}>
                <View style={styles.livePulse} />
                <Text style={styles.liveLabel}>LIVE TRACKING</Text>
              </View>
              <Text style={styles.mapUpdated}>
                Updated: {formatTime(order.driverLocation!.updatedAt)}
              </Text>
            </View>

            {/* Simulated map grid */}
            <View style={styles.mapGrid}>
              {Array.from({ length: 6 }).map((_, row) =>
                Array.from({ length: 8 }).map((_, col) => (
                  <View key={`${row}-${col}`} style={styles.mapCell} />
                ))
              )}
              {/* Driver pin */}
              <View style={styles.driverPin}>
                <View style={styles.driverPinInner}>
                  <Text style={styles.driverPinIcon}>🚚</Text>
                </View>
              </View>
              {/* Destination pin */}
              <View style={styles.destinationPin}>
                <Text style={styles.destinationPinIcon}>📍</Text>
              </View>
            </View>

            <View style={styles.coordsRow}>
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>LATITUDE</Text>
                <Text style={styles.coordValue}>
                  {order.driverLocation!.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.coordDivider} />
              <View style={styles.coordBox}>
                <Text style={styles.coordLabel}>LONGITUDE</Text>
                <Text style={styles.coordValue}>
                  {order.driverLocation!.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        ) : order.status === 'Delivered' ? (
          <View style={styles.deliveredCard}>
            <Text style={styles.deliveredEmoji}>✅</Text>
            <Text style={styles.deliveredTitle}>Delivered!</Text>
            <Text style={styles.deliveredSub}>Order successfully delivered to customer.</Text>
          </View>
        ) : (
          <View style={styles.waitingCard}>
            <Text style={styles.waitingEmoji}>⏳</Text>
            <Text style={styles.waitingTitle}>Tracking not started</Text>
            <Text style={styles.waitingSub}>Tracking begins after driver picks up the order.</Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ORDER PROGRESS</Text>
          <View style={styles.progressCard}>
            {STATUS_STEPS.map((step, idx) => {
              const done = idx <= currentStepIndex;
              const active = idx === currentStepIndex;
              const color = done ? STATUS_COLOR[step] : '#334155';
              return (
                <View key={step} style={styles.progressRow}>
                  <View style={styles.progressLeft}>
                    <View style={[styles.progressDot, { borderColor: color, backgroundColor: done ? color + '33' : '#1e293b' }]}>
                      {done && (
                        <Text style={[styles.progressCheck, { color }]}>
                          {active ? '●' : '✓'}
                        </Text>
                      )}
                    </View>
                    {idx < STATUS_STEPS.length - 1 && (
                      <View style={[styles.progressLine, done && idx < currentStepIndex && { backgroundColor: STATUS_COLOR[step] }]} />
                    )}
                  </View>
                  <Text style={[styles.progressLabel, active && { color: '#f8fafc', fontWeight: '700' }, !done && { color: '#334155' }]}>
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TIMELINE ({order.timeline.length} events)</Text>
          <View style={styles.timelineCard}>
            {order.timeline.map((entry, i) => (
              <View key={i} style={[styles.timelineRow, i < order.timeline.length - 1 && styles.timelineRowBorder]}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineStatus}>{entry.status}</Text>
                  <Text style={styles.timelineTime}>{formatTime(entry.time)}</Text>
                  {entry.location && (
                    <Text style={styles.timelineLoc}>
                      📍 Lat: {entry.location.lat.toFixed(4)} · Lng: {entry.location.lng.toFixed(4)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ORDER ITEMS</Text>
          <View style={styles.itemsCard}>
            {order.items.map((item, i) => (
              <View key={i} style={[styles.itemRow, i < order.items.length - 1 && styles.itemRowBorder]}>
                <Text style={styles.itemIndex}>{i + 1}</Text>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  errorText: { color: '#f8fafc', textAlign: 'center', marginTop: 40 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backText: { fontSize: 15, color: '#f59e0b', fontWeight: '600' },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },

  scroll: { paddingHorizontal: 20, paddingTop: 4 },

  heroCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroId: { fontSize: 12, color: '#64748b', fontWeight: '600', letterSpacing: 0.5 },
  heroCustomer: { fontSize: 18, fontWeight: '800', color: '#f8fafc', marginTop: 2 },
  heroBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  heroBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  heroAddress: { fontSize: 12, color: '#94a3b8', marginBottom: 12, lineHeight: 17 },
  heroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroAmount: { fontSize: 20, fontWeight: '800', color: '#f59e0b' },
  driverAssigned: { fontSize: 12, color: '#f59e0b' },
  noDriver: { fontSize: 12, color: '#64748b' },

  mapCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  liveLabel: { fontSize: 12, fontWeight: '700', color: '#10b981', letterSpacing: 0.8 },
  mapUpdated: { fontSize: 11, color: '#64748b' },

  mapGrid: {
    height: 160,
    backgroundColor: '#0f172a',
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    flexWrap: 'wrap',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'relative',
  },
  mapCell: {
    width: '12.5%',
    height: '16.66%',
    borderWidth: 0.5,
    borderColor: '#1e293b',
  },
  driverPin: {
    position: 'absolute',
    top: '30%',
    left: '40%',
    alignItems: 'center',
  },
  driverPinInner: {
    backgroundColor: '#f59e0b',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  driverPinIcon: { fontSize: 18 },
  destinationPin: {
    position: 'absolute',
    bottom: '20%',
    right: '20%',
  },
  destinationPinIcon: { fontSize: 24 },

  coordsRow: {
    flexDirection: 'row',
    margin: 12,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  coordBox: { flex: 1, padding: 12, alignItems: 'center' },
  coordDivider: { width: 1, backgroundColor: '#1e293b' },
  coordLabel: { fontSize: 9, color: '#475569', fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  coordValue: { fontSize: 13, color: '#06b6d4', fontWeight: '600' },

  deliveredCard: {
    backgroundColor: '#052e16',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  deliveredEmoji: { fontSize: 40, marginBottom: 10 },
  deliveredTitle: { fontSize: 22, fontWeight: '800', color: '#10b981', marginBottom: 6 },
  deliveredSub: { fontSize: 13, color: '#065f46', textAlign: 'center' },

  waitingCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  waitingEmoji: { fontSize: 36, marginBottom: 10 },
  waitingTitle: { fontSize: 18, fontWeight: '700', color: '#94a3b8', marginBottom: 6 },
  waitingSub: { fontSize: 12, color: '#64748b', textAlign: 'center' },

  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 1,
    marginBottom: 10,
  },

  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressRow: { flexDirection: 'row', alignItems: 'flex-start', minHeight: 36 },
  progressLeft: { alignItems: 'center', width: 26 },
  progressDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCheck: { fontSize: 9, fontWeight: '800' },
  progressLine: { width: 2, flex: 1, backgroundColor: '#334155', marginVertical: 2 },
  progressLabel: { fontSize: 13, color: '#64748b', paddingLeft: 12, paddingTop: 2, flex: 1 },

  timelineCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timelineRow: { flexDirection: 'row', paddingVertical: 10 },
  timelineRowBorder: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
    marginTop: 5,
    marginRight: 12,
  },
  timelineBody: { flex: 1 },
  timelineStatus: { fontSize: 14, fontWeight: '700', color: '#f8fafc' },
  timelineTime: { fontSize: 11, color: '#64748b', marginTop: 2 },
  timelineLoc: { fontSize: 11, color: '#8b5cf6', marginTop: 3 },

  itemsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#334155' },
  itemIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#334155',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
    marginRight: 12,
  },
  itemText: { fontSize: 14, color: '#cbd5e1', flex: 1 },
});
