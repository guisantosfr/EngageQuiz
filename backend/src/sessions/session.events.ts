// Internal event names — emitted by SessionsService, handled by SessionsGateway

export const SESSION_EVENTS = {
    PLAYER_JOINED: 'session.player_joined',
    QUIZ_STARTED: 'session.quiz_started',
    ANSWER_RESULT: 'session.answer_result',
    PLAYER_ANSWERED: 'session.player_answered',
    QUESTION_CLOSED: 'session.question_closed',
    NEXT_QUESTION: 'session.next_question',
    SESSION_CANCELED: 'session.canceled',
    SESSION_FINISHED: 'session.finished',
    PLAYER_LEFT: 'session.player_left',
    PLAYER_KICKED: 'session.player_kicked',
    PLAYER_DISCONNECT: 'session.player_disconnect',
    SESSION_CLEANUP: 'session.cleanup',
} as const;

// ─── Payload Interfaces ───────────────────────────────────────────────

export interface QuizStartedPayload {
    sessionId: string;
    quizId: string;
    totalQuestions: number;
    totalPlayers: number;
    firstQuestion: {
        index: number;
        id: string;
        text: string;
        type: string;
        timeLimit: number;
        options: Array<{ id: string; text: string }>;
    };
    timestamp: string;
}

export interface AnswerResultPayload {
    playerId: string;
    sessionId: string;
    questionId: string;
    received: true;
    timestamp: string;
}

export interface PlayerAnsweredPayload {
    sessionId: string;
    questionId: string;
    playerId: string;
    playerNickname: string;
    answeredAt: string;
    totalAnswers: number;
    totalPlayers: number;
}

export interface QuestionClosedPayload {
    sessionId: string;
    questionId: string;
    questionIndex: number;
    reason: 'timeout' | 'all_answered';
    correctOptionId: string | null;
    stats: {
        totalAnswers: number;
        correctAnswers: number;
        optionBreakdown: Array<{
            optionId: string;
            text: string;
            count: number;
            percentage: number;
            isCorrect: boolean;
        }>;
    };
    timestamp: string;
}

export interface NextQuestionPayload {
    sessionId: string;
    question: {
        index: number;
        id: string;
        text: string;
        type: string;
        timeLimit: number;
        options: Array<{ id: string; text: string }>;
    };
    timestamp: string;
}

export interface SessionCanceledPayload {
    sessionId: string;
    timestamp: string;
}

export interface SessionFinishedPayload {
    sessionId: string;
    timestamp: string;
}

export interface PlayerLeftPayload {
    sessionId: string;
    player: { id: string; nickname: string };
    timestamp: string;
}

export interface PlayerKickedPayload {
    sessionId: string;
    player: { id: string; nickname: string };
    timestamp: string;
}

export interface PlayerDisconnectPayload {
    playerId: string;
}

export interface SessionCleanupPayload {
    sessionId: string;
}

export interface PlayerJoinedPayload {
    sessionId: string;
    player: { id: string; nickname: string; joinedAt: string };
    timestamp: string;
}
