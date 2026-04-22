import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ArrowLeft, Check, Lock, Minus, Plus, Smartphone } from 'lucide-react-native';

import { PaymentMethodCard } from '@/components/payment/PaymentMethodCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEvent } from '@/hooks/useEvents';
import { purchaseTicket } from '@/lib/api/tickets';
import { useTicketStore } from '@/lib/store/ticketStore';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { formatPrice } from '@/lib/utils/formatters';
import type { PaymentMethod, LocalTicket } from '@/types/ticket';
import type { TicketType } from '@/types/event';

type Step = 1 | 2 | 3;

const PAYMENT_METHODS: PaymentMethod[] = ['mtn_momo', 'orange_money', 'wave', 'card'];
const PHONE_METHODS: PaymentMethod[] = ['mtn_momo', 'orange_money', 'wave'];
const SERVICE_FEE_RATE = 0.05;

const STEP_TITLES: Record<Step, string> = {
  1: 'Choisis ton billet',
  2: 'Choisis ton paiement',
  3: 'Vérifie et confirme',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  mtn_momo:     'MTN MoMo',
  orange_money: 'Orange Money',
  wave:         'Wave',
  card:         'Carte bancaire',
};

export default function PaymentScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { data: event, isLoading } = useEvent(eventId);
  const { addTicket } = useTicketStore();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(1);
  const [selectedType, setSelectedType] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentError, setPaymentError] = useState('');

  const mutation = useMutation({
    mutationFn: purchaseTicket,
    onSuccess: (ticket) => {
      const local: LocalTicket = {
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
      addTicket(local);
      router.replace('/(tabs)/tickets');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          const msg = error.response.data?.message ?? 'Données invalides.';
          setPaymentError(msg);
        } else if (!error.response) {
          setPaymentError('Vérifie ta connexion internet.');
        } else {
          setPaymentError('Paiement échoué. Réessaie.');
        }
      } else {
        const msg = (error as Error).message ?? 'Une erreur est survenue.';
        console.error('[PAYMENT] erreur non-Axios:', msg);
        setPaymentError(msg);
      }
    },
  });

  function handleBack() {
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => (s - 1) as Step);
      setPaymentError('');
    }
  }

  function handleStep1Continue() {
    if (!selectedType) return;
    setStep(2);
  }

  function handleStep2Continue() {
    setStep(3);
  }

  function handleConfirm() {
    if (!selectedType || !event) return;
    setPaymentError('');
    mutation.mutate({
      eventId,
      ticketTypeId: selectedType.id,
      quantity,
      paymentMethod,
      phoneNumber: PHONE_METHODS.includes(paymentMethod) ? phoneNumber : undefined,
    });
  }

  if (isLoading || !event) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <ActivityIndicator color={Colors.orange} size="large" />
      </SafeAreaView>
    );
  }

  const subtotal = (selectedType?.price ?? 0) * quantity;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;
  const stickyBottom = insets.bottom || 16;

  return (
    // edges={['top']} — le bas est géré manuellement via insets.bottom dans le footer sticky
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.stepIndicator}>Étape {step}/3</Text>
          <Text style={styles.stepTitle}>{STEP_TITLES[step]}</Text>
          {step === 1 && (
            <Text style={styles.stepSubtitle}>Accès garanti à l'événement</Text>
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

        {/* ── Étape 2 : Mode de paiement ── */}
        {step === 2 && (
          <View style={styles.section}>
            {/* Récap billet en haut */}
            <View style={styles.step2Recap}>
              <Text style={styles.step2RecapTitle} numberOfLines={1}>{event.name}</Text>
              <View style={styles.step2RecapDivider} />
              <View style={styles.step2RecapRow}>
                <Text style={styles.step2RecapLabel}>
                  {selectedType?.name ?? ''} × {quantity}
                </Text>
                <Text style={styles.step2RecapValue}>{formatPrice(subtotal)}</Text>
              </View>
            </View>

            {/* Grille moyens de paiement */}
            <View style={styles.paymentGrid}>
              {PAYMENT_METHODS.map((method) => (
                <PaymentMethodCard
                  key={method}
                  method={method}
                  selected={paymentMethod === method}
                  onSelect={setPaymentMethod}
                />
              ))}
            </View>

            {/* Trust badges */}
            <View style={styles.payTrustRow}>
              <PayTrustItem label="Paiement sécurisé" />
              <PayTrustItem label="Billet envoyé instantanément" />
            </View>
          </View>
        )}

        {/* ── Étape 3 : Récapitulatif ── */}
        {step === 3 && (
          <View style={styles.section}>
            {/* Récap billet */}
            <View style={styles.recapCard}>
              <Text style={styles.recapEventName} numberOfLines={2}>{event.name}</Text>
              <View style={styles.recapDivider} />

              <RecapLine
                label={`${selectedType?.name ?? ''} × ${quantity}`}
                value={formatPrice(subtotal)}
              />
              <RecapLine label="Frais de service (5%)" value={formatPrice(serviceFee)} muted />

              <View style={styles.recapDivider} />
              <View style={styles.recapTotalRow}>
                <Text style={styles.recapTotalLabel}>Total à payer</Text>
                <Text style={styles.recapTotalValue}>{formatPrice(total)}</Text>
              </View>

              {/* Garantie entrée */}
              <View style={styles.recapGuarantee}>
                <Text style={styles.recapGuaranteeText}>✔ Entrée garantie</Text>
              </View>
            </View>

            {/* Mode sélectionné */}
            <View style={styles.methodCard}>
              <Text style={styles.methodChipText}>
                Paiement via{' '}
                <Text style={styles.methodChipAccent}>{METHOD_LABELS[paymentMethod]}</Text>
              </Text>
              {PHONE_METHODS.includes(paymentMethod) && (
                <View style={styles.methodHintRow}>
                  <Smartphone size={13} color={Colors.textMuted} />
                  <Text style={styles.methodHint}>Tu recevras une demande de confirmation</Text>
                </View>
              )}
            </View>

            {/* Numéro de téléphone si mobile money */}
            {PHONE_METHODS.includes(paymentMethod) && (
              <>
                <Input
                  label="Numéro de téléphone"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="07 00 00 00 00"
                  keyboardType="phone-pad"
                  phonePrefix
                />
                <View style={styles.phoneHintRow}>
                  <AlertTriangle size={13} color={Colors.warning} />
                  <Text style={styles.phoneHint}>Vérifie ton numéro avant de confirmer</Text>
                </View>
              </>
            )}

            {/* Trust avant le bouton */}
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
              label="Continuer vers le paiement"
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
            <Button label="Continuer vers la confirmation" onPress={handleStep2Continue} />
            <View style={styles.footerBrandingRow}>
              <Lock size={11} color={Colors.textMuted} />
              <Text style={styles.footerBranding}>Transaction sécurisée par Looga</Text>
            </View>
          </>
        )}
        {step === 3 && (
          <>
            <Button
              label={mutation.isPending ? 'Traitement...' : `Payer ${formatPrice(total)}`}
              leftIcon={<Lock size={15} color="#FFFFFF" />}
              onPress={handleConfirm}
              disabled={mutation.isPending}
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
            {formatPrice(type.price)}
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
  // Header
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
  // ── Step 2 recap ─────────────────────────────────────────────────────────
  step2Recap: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    gap: 10,
  },
  step2RecapTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  step2RecapDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  step2RecapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step2RecapLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  step2RecapValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.orange,
  },

  // ── Pay trust ────────────────────────────────────────────────────────────
  payTrustRow: {
    gap: 8,
    marginTop: 4,
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

  // ── Method card (step 3) ─────────────────────────────────────────────────
  methodCard: {
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  methodHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  methodHint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    flex: 1,
  },
  phoneHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: -4,
  },
  phoneHint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.warning,
    flex: 1,
  },

  // ── Recap guarantee ──────────────────────────────────────────────────────
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

  // ── Confirm trust ────────────────────────────────────────────────────────
  confirmTrust: {
    gap: 8,
    marginTop: 4,
  },

  // ── Footer trust / branding ──────────────────────────────────────────────
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

  // Urgency banner
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
  // Ticket rows
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
  ticketRowDisabled: {
    opacity: 0.5,
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
  // Quantity
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
  // Payment grid
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  // Recap
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
  // Method chip
  methodChip: {
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
  // Error
  paymentError: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 4,
  },
  // Footer
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
