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

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setLoading(false);
    }, [])
  );

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return Toast.show({
        type: "error",
        text1: "Por favor, preencha todos os campos.",
      });
    }

    if (password.length < 6) {
      return Toast.show({
        type: "error",
        text1: "A senha deve ter no mínimo 6 caracteres.",
      });
    }

    if (password !== confirmPassword) {
      return Toast.show({
        type: "error",
        text1: "As senhas não coincidem.",
      });
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            role: "STUDENT",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await setAuth(data.user, data.accessToken, data.refreshToken);

        Toast.show({
          type: "success",
          text1: "Conta criada com sucesso!",
        });

        router.replace("/join");
      } else {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Erro ao realizar cadastro.";

        Toast.show({
          type: "error",
          text1: message,
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Ocorreu um erro ao tentar criar a conta. Tente novamente.",
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
          <View className="flex-1 items-center justify-center gap-4 px-6 py-10">
            {/* Cabeçalho */}
            <View className="items-center gap-2 mb-2">
              <Text className="text-4xl font-bold text-white tracking-wide">
                EngageQuiz
              </Text>
              <Text className="text-base text-white/80 text-center">
                Crie sua conta para começar a participar de questionários
              </Text>
            </View>

            {/* Campo Nome */}
            <View className="w-full">
              <Text className="text-sm text-white/70 mb-2 ml-1">Nome</Text>
              <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                <FontAwesome6
                  name="user"
                  iconStyle="solid"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
                <TextInput
                  placeholder="Seu nome completo"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="flex-1 p-4 text-white text-base"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
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
                  placeholder="No mínimo 6 caracteres"
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

            {/* Campo Confirmação de Senha */}
            <View className="w-full">
              <Text className="text-sm text-white/70 mb-2 ml-1">
                Confirmação de senha
              </Text>
              <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                <FontAwesome6
                  name="lock"
                  iconStyle="solid"
                  size={18}
                  color="rgba(255,255,255,0.6)"
                />
                <TextInput
                  placeholder="Repita a senha digitada"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  className="flex-1 p-4 text-white text-base"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={10}
                >
                  <FontAwesome6
                    name={showConfirmPassword ? "eye-slash" : "eye"}
                    iconStyle="solid"
                    size={18}
                    color="rgba(255,255,255,0.6)"
                  />
                </Pressable>
              </View>
            </View>

            {/* Botão Criar Conta */}
            <Pressable
              className={`w-full mt-2 p-4 rounded-2xl ${loading ? "bg-blue-600/50" : "bg-blue-600 active:bg-blue-700"
                }`}
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
            >
              <View className="flex-row items-center justify-center gap-3">
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <FontAwesome6
                    name="user-plus"
                    iconStyle="solid"
                    size={20}
                    color="white"
                  />
                )}
                <Text className="text-xl text-white font-bold">
                  {loading ? "Criando conta..." : "Criar conta"}
                </Text>
              </View>
            </Pressable>

            {/* Link para Login */}
            <View className="flex-row items-center justify-center mt-2">
              <Text className="text-white/70 text-base">
                Já possui uma conta?{" "}
              </Text>
              <Pressable onPress={() => router.replace("/login")}>
                <Text className="text-blue-400 font-bold text-base underline">
                  Entre
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
