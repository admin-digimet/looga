import { useCallback, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronDown, Zap } from 'lucide-react-native';

import { ScanFrame } from '@/components/scan/ScanFrame';
import { CounterRow } from '@/components/scan/CounterRow';
import { ScanResultOverlay } from '@/components/scan/ScanResultOverlay';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useScanStore } from '@/lib/store/scanStore';
import { triggerFeedback } from '@/lib/feedback';
import { useVerifyScan } from '@/hooks/useScan';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { lookupTicketOffline, markTicketUsedOffline } from '@/lib/offline/cache';
import { enqueueOfflineScan } from '@/lib/offline/queue';
import { storage } from '@/lib/store/mmkv';
import type { ScanResult } from '@/types/scan';

const SCANNER_NAME_KEY = 'scanner_name';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const isScanning = useRef(false);

  const {
    activeEvent,
    scanCount,
    refusedCount,
    isOffline,
    pendingSyncCount,
    addScanRecord,
  } = useScanStore();
  const verifyScan = useVerifyScan(activeEvent?.id ?? '');

  // Surveillance connectivité + sync auto
  useOfflineSync(activeEvent?.id);

  const handleDismiss = useCallback(() => {
    setScanResult(null);
    setTimeout(() => {
      isScanning.current = false;
    }, 300);
  }, []);

  const handleOfflineScan = useCallback(
    (data: string) => {
      if (!activeEvent) return;

      const result = lookupTicketOffline(data, activeEvent.id);
      setScanResult(result);

      const feedbackStatus = result.status === 'already_used' ? 'used' : result.status;
      triggerFeedback(feedbackStatus);

      // Si valide, marquer comme utilisé localement et enqueuer pour sync
      if (result.status === 'valid') {
        markTicketUsedOffline(data, activeEvent.id);
        const scannerName = storage.getString(SCANNER_NAME_KEY) ?? '';
        enqueueOfflineScan({
          qrValue: data,
          eventId: activeEvent.id,
          scannerName,
          scannedAt: new Date().toISOString(),
          status: 'valid',
        });
      }

      // Toujours ajouter à l'historique local (valid, already_used, invalid)
      addScanRecord({
        id: `offline-${Date.now()}`,
        ticketId: result.ticketId ?? '',
        attendeeName: result.attendeeName ?? 'Participant',
        ticketType: result.ticketType ?? '',
        status: result.status,
        scannedAt: new Date().toISOString(),
      });
    },
    [activeEvent, addScanRecord]
  );

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (isScanning.current || !activeEvent) return;
      isScanning.current = true;

      verifyScan.mutate(data, {
        onSuccess: (result) => {
          setScanResult(result);
          const feedbackStatus = result.status === 'already_used' ? 'used' : result.status;
          triggerFeedback(feedbackStatus);
        },
        onError: () => {
          // Erreur réseau → fallback offline
          handleOfflineScan(data);
        },
      });
    },
    [activeEvent, verifyScan, handleOfflineScan]
  );

  // Pas d'événement actif
  if (!activeEvent) {
    return (
      <SafeAreaView style={styles.noEventRoot}>
        <Text style={styles.noEventTitle}>Aucun événement sélectionné</Text>
        <Text style={styles.noEventText}>
          Choisis un événement pour commencer à scanner.
        </Text>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={() => router.navigate('/(main)/event' as any)}
        >
          <Text style={styles.selectBtnText}>Choisir un événement</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Permission caméra
  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.noEventRoot}>
        <Text style={styles.noEventTitle}>Accès caméra requis</Text>
        <Text style={styles.noEventText}>
          Looga Scan a besoin de ta caméra pour lire les QR codes.
        </Text>
        <TouchableOpacity style={styles.selectBtn} onPress={requestPermission}>
          <Text style={styles.selectBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      {/* Caméra plein écran */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanResult ? undefined : handleBarcodeScanned}
      />

      {/* Overlay sombre (haut) */}
      <View style={styles.topOverlay}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <View style={styles.eventChip}>
              <Text style={styles.eventChipText} numberOfLines={1}>
                {activeEvent.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => router.navigate('/(main)/event' as any)}
            >
              <ChevronDown size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.changeBtnText}>Changer</Text>
            </TouchableOpacity>
          </View>

          {/* Bannière offline */}
          {isOffline && (
            <View style={styles.offlineBanner}>
              <Zap size={12} color={Colors.warning} />
              <Text style={styles.offlineText} numberOfLines={1} adjustsFontSizeToFit>
                Mode hors-ligne{pendingSyncCount > 0
                  ? ` · ${pendingSyncCount} scan${pendingSyncCount > 1 ? 's' : ''} en attente`
                  : ''}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* Cadre de visée centré */}
      <View style={styles.frameArea} pointerEvents="none">
        <ScanFrame />
        <Text style={styles.hint}>Placez le QR code dans le cadre</Text>
      </View>

      {/* Overlay bas avec compteur + actions rapides */}
      <View style={[styles.bottomOverlay, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <CounterRow
          validCount={scanCount}
          totalTickets={activeEvent.ticketsSold}
          refusedCount={refusedCount}
        />
      </View>

      {/* Résultat du scan */}
      {scanResult && (
        <ScanResultOverlay result={scanResult} onDismiss={handleDismiss} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  eventChip: {
    flex: 1,
    marginRight: 10,
  },
  eventChipText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 100,
  },
  changeBtnText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },

  // Bannière offline
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,184,0,0.15)',
    borderRadius: 100,
  },
  offlineText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.warning,
  },

  frameArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingTop: 20,
    alignItems: 'center',
    gap: 16,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 100,
  },
  quickBtnText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.8)',
  },

  // No event / no permission
  noEventRoot: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  noEventTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  noEventText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectBtn: {
    marginTop: 8,
    backgroundColor: Colors.orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  selectBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#fff',
  },
});
