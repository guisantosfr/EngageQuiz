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
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GradientBackground from "@/components/GradientBackground";
import FontAwesome6 from "@react-native-vector-icons/fontawesome6";
import Toast from "react-native-toast-message";
import { useSessionStore } from "@/stores/useSessionStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiFetch } from "@/utils/api";

export default function JoinScreen() {
  const router = useRouter();
  const setJoinData = useSessionStore((state) => state.setJoinData);
  const { user, isAuthenticated, logout } = useAuthStore();

  const [nickname, setNickname] = useState<string>("");
  const [sessionCode, setSessionCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setNickname("");
      setSessionCode("");
      setLoading(false);
      setIsSidebarOpen(false);
      setIsConfirmModalOpen(false);
    }, [])
  );

  const CODE_LENGTH = 6;

  const handleJoin = async () => {
    if (!nickname || !sessionCode) {
      return Toast.show({
        type: "error",
        text1: "Por favor, preencha todos os campos.",
      });
    }

    if (sessionCode.length < CODE_LENGTH) {
      return Toast.show({
        type: "error",
        text1: "O código deve conter 6 dígitos",
      });
    }

    setLoading(true);
    try {
      const response = await apiFetch(`/sessions/${sessionCode}/join`, {
        method: "POST",
        body: JSON.stringify({
          nickname: nickname.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setLoading(false);

        setJoinData(data.session, data.player);

        Toast.show({
          type: "success",
          text1: "Conectado com sucesso!",
        });

        router.push("/lobby");
      } else {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: data.message,
        });
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Erro ao se conectar ao questionário.",
      });
    }
  };

  const handleLogout = async () => {
    setIsConfirmModalOpen(false);
    await logout();
    Toast.show({
      type: "success",
      text1: "Sessão encerrada com sucesso!",
    });
    router.replace("/login");
  };

  return (
    <GradientBackground>
      <SafeAreaView className="flex-1">
        {/* Top Header Bar com Botão Hambúrguer */}
        <View className="flex-row items-center justify-between px-6 pt-2 pb-2">
          <Pressable
            onPress={() => setIsSidebarOpen(true)}
            className="p-3 rounded-2xl bg-white/10 border border-white/20 active:bg-white/20"
            hitSlop={10}
          >
            <FontAwesome6 name="bars" iconStyle="solid" size={20} color="white" />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 items-center justify-center gap-6 px-6 py-6">
              <Text className="text-4xl font-bold text-white tracking-wide">
                EngageQuiz
              </Text>
              <Text className="text-lg text-white/80 text-center mb-4">
                Preencha os campos abaixo para se conectar a um questionário
              </Text>

              <View className="w-full">
                <Text className="text-sm text-white/70 mb-2 ml-1">
                  Apelido / Nickname
                </Text>
                <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                  <FontAwesome6
                    name="user"
                    iconStyle="solid"
                    size={18}
                    color="rgba(255,255,255,0.6)"
                  />
                  <TextInput
                    placeholder="Como gostaria de ser chamado?"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    className="flex-1 p-4 text-white text-base"
                    maxLength={20}
                    value={nickname}
                    onChangeText={setNickname}
                  />
                </View>
              </View>

              <View className="w-full">
                <Text className="text-sm text-white/70 mb-2 ml-1">
                  Código de Acesso (6 dígitos)
                </Text>
                <View className="flex-row items-center bg-white/10 rounded-2xl border border-white/20 px-4">
                  <FontAwesome6
                    name="hashtag"
                    iconStyle="solid"
                    size={18}
                    color="rgba(255,255,255,0.6)"
                  />
                  <TextInput
                    placeholder="Digite o PIN de 6 dígitos"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    className="flex-1 p-4 text-white text-base tracking-widest"
                    maxLength={6}
                    keyboardType="numeric"
                    value={sessionCode}
                    onChangeText={setSessionCode}
                  />
                </View>
              </View>

              <Pressable
                className={`w-full mt-4 p-4 rounded-2xl ${
                  loading ? "bg-blue-600/50" : "bg-blue-600 active:bg-blue-700"
                }`}
                style={styles.button}
                onPress={handleJoin}
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
                    {loading ? "Conectando..." : "Conectar"}
                  </Text>
                </View>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Modal da Sidebar / Menu Lateral */}
        <Modal
          visible={isSidebarOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsSidebarOpen(false)}
        >
          <View className="flex-1 flex-row">
            <View className="w-4/5 max-w-xs bg-slate-900 h-full p-6 justify-between border-r border-white/10 shadow-2xl">
              <View className="gap-6 pt-8">
                {/* Cabeçalho do Menu */}
                <View className="flex-row items-center justify-between pb-4 border-b border-white/10">
                  <Text className="text-xl font-bold text-white">Menu</Text>
                  <Pressable
                    onPress={() => setIsSidebarOpen(false)}
                    className="p-2"
                    hitSlop={10}
                  >
                    <FontAwesome6
                      name="xmark"
                      iconStyle="solid"
                      size={20}
                      color="white"
                    />
                  </Pressable>
                </View>

                {/* Cartão de Informação do Usuário */}
                <View className="bg-white/5 p-4 rounded-2xl border border-white/10 gap-2">
                  <Text className="text-xs text-white/50 uppercase font-semibold tracking-wider">
                    {isAuthenticated ? "Logado como" : "Visitante"}
                  </Text>
                  <Text className="text-lg font-bold text-white">
                    {isAuthenticated
                      ? user?.name || user?.email
                      : "Não autenticado"}
                  </Text>
                  {isAuthenticated && user?.email && (
                    <Text className="text-sm text-white/60">{user.email}</Text>
                  )}
                </View>

                {/* Botões do Menu */}
                {isAuthenticated ? (
                  <Pressable
                    onPress={() => {
                      setIsSidebarOpen(false);
                      setIsConfirmModalOpen(true);
                    }}
                    className="flex-row items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 active:bg-red-500/20 mt-2"
                  >
                    <FontAwesome6
                      name="right-from-bracket"
                      iconStyle="solid"
                      size={18}
                      color="#ef4444"
                    />
                    <Text className="text-red-400 font-semibold text-base">
                      Sair da conta
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      setIsSidebarOpen(false);
                      router.push("/login");
                    }}
                    className="flex-row items-center gap-3 p-4 rounded-2xl bg-blue-600/20 border border-blue-500/30 active:bg-blue-600/30 mt-2"
                  >
                    <FontAwesome6
                      name="right-to-bracket"
                      iconStyle="solid"
                      size={18}
                      color="#60a5fa"
                    />
                    <Text className="text-blue-400 font-semibold text-base">
                      Fazer Login
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Backdrop Clicável para Fechar o Menu */}
            <Pressable
              className="flex-1 bg-black/60"
              onPress={() => setIsSidebarOpen(false)}
            />
          </View>
        </Modal>

        {/* Modal de Confirmação de Logout */}
        <Modal
          visible={isConfirmModalOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsConfirmModalOpen(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/70 px-6">
            <View className="w-full max-w-sm bg-slate-900 p-6 rounded-3xl border border-white/10 items-center gap-4">
              <View className="w-14 h-14 rounded-full bg-red-500/20 items-center justify-center border border-red-500/30">
                <FontAwesome6
                  name="right-from-bracket"
                  iconStyle="solid"
                  size={24}
                  color="#ef4444"
                />
              </View>

              <Text className="text-xl font-bold text-white text-center">
                Confirmar Saída
              </Text>
              <Text className="text-base text-white/70 text-center">
                Deseja realmente sair da sua conta?
              </Text>

              <View className="flex-row gap-3 w-full mt-2">
                <Pressable
                  onPress={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/10 border border-white/20 active:bg-white/20 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleLogout}
                  className="flex-1 py-3.5 rounded-2xl bg-red-600 active:bg-red-700 items-center shadow-lg"
                >
                  <Text className="text-white font-bold text-base">Sair</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
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