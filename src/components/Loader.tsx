import { View, ActivityIndicator, Text, StyleSheet } from "react-native"
import { colors, typography } from "../styles"

interface LoaderProps {
  message?: string
}

export function Loader({ message }: LoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: "center",
  },
})
