import { useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  phonePrefix?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  light?: boolean;
  variant?: 'default' | 'flat';
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  phonePrefix = false,
  autoCapitalize = 'none',
  light = false,
  variant = 'default',
}: InputProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  const isFlat = variant === 'flat';
  const iconColor = light ? Colors.authBorder : Colors.textMuted;

  return (
    <View style={styles.container}>
      {!isFlat && label ? (
        <Text style={[styles.label, light && styles.labelLight]}>{label}</Text>
      ) : null}
      <View style={[
        styles.inputRow,
        isFlat && styles.inputRowFlat,
        light && styles.inputRowLight,
        error ? styles.inputRowError : null,
      ]}>
        {phonePrefix && (
          <View style={styles.prefix}>
            <Text style={styles.prefixText}>+225</Text>
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            isFlat && styles.inputFlat,
            light && styles.inputLight,
            phonePrefix && styles.inputWithPrefix,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={light ? Colors.authBorder : Colors.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete="off"
          textContentType={secureTextEntry ? 'password' : 'none'}
          spellCheck={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden((h) => !h)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {hidden ? (
              <Eye size={18} color={iconColor} />
            ) : (
              <EyeOff size={18} color={iconColor} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  labelLight: {
    color: Colors.authText,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputRowFlat: {
    borderRadius: 12,
  },
  inputRowLight: {
    backgroundColor: Colors.authSurface,
    borderColor: Colors.authBorder,
  },
  inputRowError: {
    borderColor: Colors.error,
  },
  prefix: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  prefixText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.textMuted,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  inputFlat: {
    paddingVertical: 18,
    fontSize: 16,
  },
  inputLight: {
    color: Colors.authText,
  },
  inputWithPrefix: {
    paddingLeft: 12,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  error: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
});
