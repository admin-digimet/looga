import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { CheckCircle2 } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { Artist } from '@/types/event';

interface ArtistSearchCardProps {
  artist: Artist;
  onFollow?: () => void;
}

// Carte artiste dans les résultats de recherche
// Photo ronde + nom + badge vérifié + bouton Suivre
export function ArtistSearchCard({ artist, onFollow }: ArtistSearchCardProps) {
  return (
    <View style={styles.card}>
      {/* Photo ronde */}
      <Image
        source={artist.image ? { uri: artist.image } : undefined}
        style={styles.photo}
        contentFit="cover"
        transition={200}
      />

      {/* Nom + badge vérifié */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{artist.name}</Text>
          <CheckCircle2 size={14} color={Colors.orange} />
        </View>
        <Text style={styles.sub}>Artiste</Text>
      </View>

      {/* Bouton Suivre */}
      <TouchableOpacity style={styles.followBtn} onPress={onFollow} activeOpacity={0.8}>
        <Text style={styles.followText}>Suivre</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 12,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface2,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.base,
    color: Colors.text,
    flexShrink: 1,
  },
  sub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  followBtn: {
    borderWidth: 1,
    borderColor: Colors.orange,
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  followText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.orange,
  },
});
