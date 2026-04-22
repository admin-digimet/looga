import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchIcon, CheckCircle, Clock } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useAttendees, useVerifyById } from '@/hooks/useScan';
import { useScanStore } from '@/lib/store/scanStore';
import type { Attendee } from '@/types/scan';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function AttendeeItem({
  attendee,
  onValidate,
  isValidating,
}: {
  attendee: Attendee;
  onValidate: () => void;
  isValidating: boolean;
}) {
  const isChecked = attendee.status === 'checked_in';

  return (
    <View style={styles.item}>
      {/* Infos */}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{attendee.name}</Text>
        <Text style={styles.itemEmail}>{attendee.email}</Text>
        <View style={styles.ticketBadge}>
          <Text style={styles.ticketBadgeText}>{attendee.ticketType}</Text>
        </View>
      </View>

      {/* Statut / bouton */}
      {isChecked ? (
        <View style={styles.checkedBadge}>
          <CheckCircle size={14} color={Colors.success} strokeWidth={2.5} />
          <Text style={styles.checkedText}>
            {attendee.checkedInAt ? formatTime(attendee.checkedInAt) : 'Entré'}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.validateBtn, isValidating && styles.validateBtnDisabled]}
          onPress={onValidate}
          disabled={isValidating}
        >
          {isValidating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.validateBtnText}>Valider</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { activeEvent } = useScanStore();
  const eventId = activeEvent?.id ?? '';

  const { data: attendees, isFetching } = useAttendees(eventId, query);
  const verifyById = useVerifyById(eventId);

  const handleValidate = useCallback(
    (attendee: Attendee) => {
      verifyById.mutate(attendee.ticketId);
    },
    [verifyById]
  );

  function handleCancel() {
    setQuery('');
    Keyboard.dismiss();
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.root} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

        <View style={styles.header}>
          <Text style={styles.title}>Recherche</Text>
          <Text style={styles.subtitle}>Par nom, e-mail ou n° de commande</Text>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <SearchIcon size={18} color={Colors.textMuted} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Rechercher un participant..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              clearButtonMode="while-editing"
            />
            {isFetching && <ActivityIndicator size="small" color={Colors.orange} />}
          </View>
          {query.length > 0 && (
            <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Résultats */}
        {!query || query.length < 2 ? (
          <View style={styles.center}>
            <Clock size={40} color={Colors.border} strokeWidth={1.5} />
            <Text style={styles.hintText}>Tape au moins 2 caractères pour chercher.</Text>
          </View>
        ) : !attendees || attendees.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.hintText}>Aucun participant trouvé.</Text>
          </View>
        ) : (
          <FlashList
            data={attendees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AttendeeItem
                attendee={item}
                onValidate={() => handleValidate(item)}
                isValidating={verifyById.isPending}
              />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cancelText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  listContent: {
    padding: 20,
  },
  separator: {
    height: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  itemEmail: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  ticketBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: 'rgba(255,92,26,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  ticketBadgeText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.orange,
  },
  validateBtn: {
    backgroundColor: Colors.orange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    minWidth: 72,
    alignItems: 'center',
  },
  validateBtnDisabled: {
    opacity: 0.6,
  },
  validateBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: '#fff',
  },
  checkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${Colors.success}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  checkedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  hintText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
