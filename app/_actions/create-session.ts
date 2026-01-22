'use server'

export async function createSession(quizId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ quizId })
    });

    if (!response.ok) {
      return { error: "Falha ao criar sessão." };
    }

    const data = await response.json();
    return { success: true, sessionId: data.id, quizId: data.quizId };

  } catch (error) {
    console.error("Erro na server action:", error);
    return { error: "Erro de conexão ao criar sessão." };
  }
}