import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontWeight, fontSize } from '@presentation/theme';
import { getTelemetry } from '@di/container';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

interface Props {
  children: React.ReactNode;
  /**
   * Custom fallback UI. Jika tidak disediakan, pakai default fallback.
   */
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  /**
   * Callback dipanggil setelah reset — berguna untuk invalidate query cache
   * atau navigate ke screen lain.
   */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// ─── Default Fallback UI ──────────────────────────────────────────────────────

const DefaultFallback: React.FC<ErrorBoundaryFallbackProps> = ({ error, resetError }) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>⚠️</Text>
    <Text style={styles.title}>Terjadi Kesalahan</Text>
    <Text style={styles.body}>
      Aplikasi mengalami error yang tidak terduga. Silakan coba muat ulang.
    </Text>
    {__DEV__ ? (
      <Text style={styles.devError} numberOfLines={6}>
        {error.message}
      </Text>
    ) : null}
    <TouchableOpacity style={styles.button} onPress={resetError} activeOpacity={0.8}>
      <Text style={styles.buttonLabel}>Muat Ulang</Text>
    </TouchableOpacity>
  </View>
);

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    getTelemetry().captureException(error, {
      componentStack: info.componentStack ?? undefined,
    });

    if (__DEV__) {
      console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null }, () => {
      this.props.onReset?.();
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback ?? DefaultFallback;
      return (
        <FallbackComponent error={this.state.error} resetError={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

// ─── ScreenErrorBoundary ──────────────────────────────────────────────────────
// Convenience wrapper untuk screen-level boundary.
// Pakai ini di navigator untuk wrap setiap tab/stack screen.

interface ScreenErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export const ScreenErrorBoundary: React.FC<ScreenErrorBoundaryProps> = ({
  children,
  onReset,
}) => (
  <ErrorBoundary onReset={onReset}>
    {children}
  </ErrorBoundary>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface.background,
    padding: spacing[6],
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing[4],
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  body: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing[5],
  },
  devError: {
    fontSize: fontSize.xs,
    color: colors.danger.main,
    backgroundColor: colors.danger.light,
    padding: spacing[3],
    borderRadius: 8,
    marginBottom: spacing[4],
    width: '100%',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semiBold,
    color: colors.neutral[0],
  },
});
