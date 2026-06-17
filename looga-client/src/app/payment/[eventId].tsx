import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Lock, Minus, Plus } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';

import { Button } from '@/components/ui/Button';
import { useEvent } from '@/hooks/useEvents';
import { initPayment, initFreeTicket, getTicketByReference } from '@/lib/api/payment';
import { useTicketStore } from '@/lib/store/ticketStore';
import { storage } from '@/lib/store/mmkv';
import { Colors } from '@/constants/colors';
import { LOOGA_WEBSITE_URL } from '@/constants/links';
import { Fonts, FontSize } from '@/constants/typography';
import { formatPrice } from '@/lib/utils/formatters';
import type { LocalTicket } from '@/types/ticket';
import type { TicketType } from '@/types/event';

type Step = 1 | 2;

const STEP_TITLES: Record<Step, string> = {
  1: 'Choisis ton billet',
  2: 'Vérifie et confirme',
};

// Frais de service 2% (spec) — doit correspondre EXACTEMENT au montant débité
// par l'Edge Function /payment/init (base + Math.round(base * 0.02)).
const SERVICE_FEE_RATE = 0.02;
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60_000;
const PAYMENT_REF_STORAGE_KEY = 'looga_last_payment_ref';
const GENIUS_BASE_URL = 'https://pay.genius.ci';

export default function PaymentScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);
  const { addTicket } = useTicketStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentError, setPaymentError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const initPaymentMutation = useMutation({
    mutationFn: initPayment,
  });

  const initFreeMutation = useMutation({
    mutationFn: initFreeTicket,
  });

  // ── Pré-chauffage Chrome Custom Tabs (Android uniquement) ──
  // warmUp = bind le service, mayInitWithUrl = DNS+TLS+HTML pré-fetch
  // sur https://pay.genius.ci → l'ouverture du checkout est quasi-instantanée
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let cancelled = false;
    (async () => {
      try {
        await WebBrowser.warmUpAsync();
        if (cancelled) return;
        await WebBrowser.mayInitWithUrlAsync(GENIUS_BASE_URL);
      } catch {
        // pas critique, on continue sans pré-chauffage
      }
    })();
    return () => {
      cancelled = true;
      WebBrowser.coolDownAsync().catch(() => {});
    };
  }, []);

  function handleBack() {
    if (step === 1) {
      router.back();
    } else {
      setStep(1);
      setPaymentError('');
    }
  }

  function handleStep1Continue() {
    if (!selectedType) return;
    setStep(2);
  }

  async function pollTicket(reference: string): Promise<LocalTicket | null> {
    const start = Date.now();
    while (Date.now() - start < POLL_TIMEOUT_MS) {
      try {
        const ticket = await getTicketByReference(reference);
        if (ticket && ticket.status !== 'pending' && ticket.status !== 'cancelled') {
          return {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            eventId: ticket.eventId,
            eventName: ticket.eventName,
            eventDate: ticket.eventDate,
            eventTime: ticket.eventTime,
            eventLocation: ticket.eventLocation,
            eventCategory: ticket.eventCategory,
            eventImage: ticket.eventImage,
            qrValue: ticket.qrCode,
            status: 'valid',
          };
        }
      } catch (err) {
        if (__DEV__) console.warn('[PAYMENT] poll error', err);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    return null;
  }

  async function handleConfirmFree() {
    if (!selectedType || !event) return;
    setPaymentError('');
    setIsProcessing(true);
    try {
      const result = await initFreeMutation.mutateAsync({
        eventId,
        ticketTypeId: selectedType.id,
        quantity,
      });
      addTicket({
        id: result.ticketId,
        ticketNumber: result.ticketNumber,
        eventId,
        eventName: event.name,
        eventDate: event.date,
        eventTime: event.time,
        eventLocation: event.location,
        eventCategory: event.category,
        eventImage: event.image,
        qrValue: result.qrCode,
        status: 'valid',
      });
      router.replace('/(tabs)/tickets');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setPaymentError(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleConfirmPaid() {
    if (!selectedType || !event) return;
    setPaymentError('');
    setIsProcessing(true);

    try {
      // 1. Init paiement → reçoit checkoutUrl + reference
      const { checkoutUrl, reference } = await initPaymentMutation.mutateAsync({
        eventId,
        ticketTypeId: selectedType.id,
        quantity,
      });

      // 2. Persist reference (fallback si l'URL de retour ne la contient pas)
      if (reference) storage.set(PAYMENT_REF_STORAGE_KEY, reference);

      // 3. Ouvre Genius Pay en in-app browser, attend retour sur /payment/success ou /payment/error
      const result = await WebBrowser.openAuthSessionAsync(
        checkoutUrl,
        `${LOOGA_WEBSITE_URL}/payment/`,
        { showInRecents: false }
      );

      // 4. Gestion du retour
      if (result.type === 'cancel' || result.type === 'dismiss') {
        setPaymentError('Paiement annulé. Tu peux réessayer.');
        setIsProcessing(false);
        return;
      }

      if (result.type === 'success' && result.url) {
        if (result.url.includes('/payment/error')) {
          setPaymentError("Le paiement n'a pas abouti. Réessaie ou contacte le support.");
          setIsProcessing(false);
          return;
        }

        // 5. Polling sur le ticket — il sera marqué `valid` quand le webhook arrive
        const refFromUrl = new URL(result.url).searchParams.get('reference') ?? reference;
        const localTicket = await pollTicket(refFromUrl);

        if (localTicket) {
          addTicket(localTicket);
          router.replace('/(tabs)/tickets');
        } else {
          Alert.alert(
            'Paiement en cours de traitement',
            "Ton paiement a été reçu, mais la confirmation prend plus de temps que prévu. Ton billet apparaîtra dans 'Mes billets' dès que c'est validé.",
            [{ text: 'OK', onPress: () => router.replace('/(tabs)/tickets') }]
          );
        }
        return;
      }

      // 6. Cas inattendu
      setPaymentError('Réponse inattendue. Réessaie.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setPaymentError(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading || !event) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator color={Colors.orange} size="large" />
      </SafeAreaView>
    );
  }

  const subtotal = (selectedType?.price ?? 0) * quantity;
  const serviceFee = subtotal > 0 ? Math.round(subtotal * SERVICE_FEE_RATE) : 0;
  const total = subtotal + serviceFee;
  const isFree = subtotal === 0;
  const stickyBottom = insets.bottom || 16;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>Étape {step}/2</Text>
          <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>
          {step === 1 && (
            <Text style={styles.stepSubtitle}>Accès garanti à l&apos;événement</Text>
          )}
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 100 + stickyBottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Étape 1 : Sélection billet ── */}
        {step === 1 && (
          <View style={styles.section}>
            {/* Bannière urgence — stock faible */}
            {(() => {
              const available = event.ticketTypes
                .filter((t) => !t.soldOut && t.stock > 0)
                .reduce((sum, t) => sum + t.stock, 0);
              if (available <= 0 || available >= 100) return null;
              const almostGone = available <= 20;
              return (
                <View style={[styles.urgencyBanner, almostGone && styles.urgencyBannerRed]}>
                  <Text style={styles.urgencyIcon}>{almostGone ? '🔥' : '⚠️'}</Text>
                  <Text style={[styles.urgencyText, almostGone && styles.urgencyTextRed]}>
                    {almostGone
                      ? `Bientôt épuisé — Plus que ${available} place${available > 1 ? 's' : ''}`
                      : `Plus que ${available} places disponibles`}
                  </Text>
                </View>
              );
            })()}

            {event.ticketTypes.map((type) => (
              <TicketTypeRow
                key={type.id}
                type={type}
                selected={selectedType?.id === type.id}
                onSelect={() => {
                  setSelectedType(type);
                  setQuantity(1);
                }}
              />
            ))}

            {selectedType && (
              <View style={styles.quantityWrapper}>
                <Text style={styles.quantityLabel}>Quantité</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus size={18} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.qtyNumber}>{quantity}</Text>
                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      quantity >= selectedType.stock && styles.qtyBtnDisabled,
                    ]}
                    onPress={() => setQuantity((q) => Math.min(Math.max(selectedType.stock, 10), q + 1))}
                    disabled={quantity >= Math.max(selectedType.stock, 10)}
                  >
                    <Plus size={18} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Étape 2 : Récapitulatif ── */}
        {step === 2 && (
          <View style={styles.section}>
            {/* Récap billet */}
            <View style={styles.recapCard}>
              <Text style={styles.recapEventName} numberOfLines={2}>{event.name}</Text>
              <View style={styles.recapDivider} />

              <RecapLine
                label={`${selectedType?.name ?? ''} × ${quantity}`}
                value={isFree ? 'Gratuit' : formatPrice(subtotal)}
              />
              {!isFree && (
                <RecapLine label="Frais de service (2%)" value={formatPrice(serviceFee)} muted />
              )}

              <View style={styles.recapDivider} />
              <View style={styles.recapTotalRow}>
                <Text style={styles.recapTotalLabel}>Total</Text>
                <Text style={styles.recapTotalValue}>
                  {isFree ? 'Gratuit' : formatPrice(total)}
                </Text>
              </View>

              <View style={styles.recapGuarantee}>
                <Text style={styles.recapGuaranteeText}>✔ Entrée garantie</Text>
              </View>
            </View>

            {/* Info paiement (sauf si gratuit) */}
            {!isFree && (
              <View style={styles.methodCard}>
                <Text style={styles.methodChipText}>
                  Paiement sécurisé par{' '}
                  <Text style={styles.methodChipAccent}>Genius Pay</Text>
                </Text>
                <Text style={styles.methodHint}>
                  Tu choisiras ton mode de paiement (MTN, Orange, Wave ou carte) sur la page de paiement sécurisée.
                </Text>
              </View>
            )}

            <View style={styles.confirmTrust}>
              <PayTrustItem label="Paiement sécurisé" />
              <PayTrustItem label="Billet envoyé immédiatement après paiement" />
            </View>

            {paymentError ? (
              <Text style={styles.paymentError}>{paymentError}</Text>
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Footer sticky */}
      <View style={[styles.footer, { paddingBottom: stickyBottom }]}>
        {step === 1 && (
          <>
            <Button
              label="Continuer"
              onPress={handleStep1Continue}
              disabled={!selectedType}
            />
            <Text style={styles.footerTrustText}>
              ✔ Paiement sécurisé  ·  ✔ Billet envoyé instantanément
            </Text>
          </>
        )}
        {step === 2 && (
          <>
            <Button
              label={
                isProcessing
                  ? isFree ? 'Création…' : 'Préparation du paiement…'
                  : isFree
                  ? 'Obtenir le billet gratuit'
                  : `Payer ${formatPrice(total)}`
              }
              leftIcon={!isProcessing && !isFree ? <Lock size={15} color="#FFFFFF" /> : undefined}
              onPress={isFree ? handleConfirmFree : handleConfirmPaid}
              disabled={isProcessing}
            />
            <View style={styles.footerBrandingRow}>
              <Lock size={11} color={Colors.textMuted} />
              <Text style={styles.footerBranding}>Transaction sécurisée par Looga</Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Sous-composants ──

function TicketTypeRow({
  type,
  selected,
  onSelect,
}: {
  type: TicketType;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.ticketRow,
        selected && styles.ticketRowSelected,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
      disabled={type.soldOut}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.ticketInfo}>
        <Text style={[styles.ticketName, type.soldOut && styles.textDisabled]}>
          {type.name}
        </Text>
        {type.description ? (
          <Text style={styles.ticketDesc}>{type.description}</Text>
        ) : null}
        {type.advantages ? (
          <Text style={styles.ticketAdvantage}>{type.advantages}</Text>
        ) : null}
      </View>
      <View style={styles.ticketRight}>
        {type.soldOut ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutBadgeText}>Complet</Text>
          </View>
        ) : (
          <Text style={[styles.ticketPrice, type.soldOut && styles.textDisabled]}>
            {type.price === 0 ? 'Gratuit' : formatPrice(type.price)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

function PayTrustItem({ label }: { label: string }) {
  return (
    <View style={styles.payTrustItem}>
      <Check size={12} color={Colors.success} strokeWidth={2.5} />
      <Text style={styles.payTrustText}>{label}</Text>
    </View>
  );
}

function RecapLine({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.recapLine}>
      <Text style={[styles.recapLineLabel, muted && styles.recapLineMuted]}>{label}</Text>
      <Text style={[styles.recapLineValue, muted && styles.recapLineMuted]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  stepTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  stepSubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 40,
  },
  scroll: {
    flex: 1,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  payTrustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payTrustText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  methodCard: {
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  methodChipText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  methodChipAccent: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.text,
  },
  methodHint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  recapGuarantee: {
    backgroundColor: `${Colors.success}0C`,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  recapGuaranteeText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  confirmTrust: {
    gap: 8,
    marginTop: 4,
  },
  footerTrustText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  footerBrandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerBranding: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.warning}18`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.warning}40`,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  urgencyBannerRed: {
    backgroundColor: `${Colors.orange}12`,
    borderColor: `${Colors.orange}35`,
  },
  urgencyIcon: {
    fontSize: 15,
  },
  urgencyText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  urgencyTextRed: {
    color: Colors.orange,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 12,
  },
  ticketRowSelected: {
    borderColor: Colors.orange,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.orange,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.orange,
  },
  ticketInfo: {
    flex: 1,
    gap: 2,
  },
  ticketName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  ticketDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  ticketAdvantage: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.violetLight,
  },
  ticketRight: {
    alignItems: 'flex-end',
  },
  ticketPrice: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    color: Colors.orange,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
  soldOutBadge: {
    backgroundColor: `${Colors.error}22`,
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  soldOutBadgeText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  quantityWrapper: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  quantityLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyNumber: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.text,
    minWidth: 32,
    textAlign: 'center',
  },
  recapCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  recapEventName: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  recapDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  recapLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLineLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  recapLineValue: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  recapLineMuted: {
    color: Colors.textMuted,
  },
  recapTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapTotalLabel: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  recapTotalValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.orange,
  },
  paymentError: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
