import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import GradientBackground from "@/components/GradientBackground";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Toast from "react-native-toast-message";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setLoading(false);
    }, [])
  );

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return Toast.show({
        type: "error",
        text1: "Por favor, preencha todos os campos.",
      });
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await setAuth(data.user, data.accessToken, data.refreshToken);

        Toast.show({
          type: "success",
          text1: "Login realizado com sucesso!",
        });

        router.replace("/join");
      } else {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Credenciais inválidas.";

        Toast.show({
          type: "error",
          text1: message,
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Ocorreu um erro ao tentar entrar. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center justify-center gap-5 px-6 py-10">
            {/* Cabeçalho */}
            <View className="items-center gap-2 mb-2">
              <Text className="text-4xl font-bold text-white tracking-wide">
                EngageQuiz
              </Text>
              <Text className="text-base text-white/80 text-center">
                Digite suas credenciais para acessar a plataforma
              </Text>
            </View>

            {/* Campo E-mail */}
            <View className="w-full">
              <Text className="text-sm text-white/70 mb-2 ml-1">E-mail</Text>
              <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                <FontAwesome6
                  name="envelope"
                  iconStyle="solid"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
                <TextInput
                  placeholder="seu@email.com"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="flex-1 p-4 text-white text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Campo Senha */}
            <View className="w-full">
              <Text className="text-sm text-white/70 mb-2 ml-1">Senha</Text>
              <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                <FontAwesome6
                  name="lock"
                  iconStyle="solid"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
                <TextInput
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="flex-1 p-4 text-white text-base"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                >
                  <FontAwesome6
                    name={showPassword ? "eye-slash" : "eye"}
                    iconStyle="solid"
                    size={18}
                    color="rgba(255,255,255,0.6)"
                  />
                </Pressable>
              </View>
            </View>

            {/* Botão Entrar */}
            <Pressable
              className={`w-full mt-2 p-4 rounded-2xl ${loading ? "bg-blue-600/50" : "bg-blue-600 active:bg-blue-700"
                }`}
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <View className="flex-row items-center justify-center gap-3">
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome6
                    name="right-to-bracket"
                    iconStyle="solid"
                    size={20}
                    color="white"
                  />
                )}
                <Text className="text-xl text-white font-bold">
                  {loading ? "Entrando..." : "Entrar"}
                </Text>
              </View>
            </Pressable>

            {/* Link para Cadastro */}
            <View className="flex-row items-center justify-center mt-4">
              <Text className="text-white/70 text-base">
                Ainda não tem conta?{" "}
              </Text>
              <Pressable onPress={() => router.replace("/register")}>
                <Text className="text-blue-400 font-bold text-base underline">
                  Cadastre-se
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  button: {
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
