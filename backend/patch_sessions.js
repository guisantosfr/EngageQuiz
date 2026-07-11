const fs = require('fs');
const path = './src/sessions/sessions.service.ts';
let code = fs.readFileSync(path, 'utf8');

// 1. Add ForbiddenException import
if (!code.includes('ForbiddenException')) {
    code = code.replace(/import {([^}]+)} from "@nestjs\/common";/, (match, p1) => {
        return `import {${p1}, ForbiddenException } from "@nestjs/common";`;
    });
}

// 2. Add helpers at the top of the class
const helpers = `
    private async checkHostAccess(sessionId: string, userId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { quiz: { select: { userId: true } } }
        });
        if (!session || session.quiz.userId !== userId) {
            throw new ForbiddenException('Access denied or Session not found');
        }
        return session;
    }

    private async checkPlayerAccess(sessionId: string, playerId: string, userId: string) {
        const player = await this.prisma.player.findUnique({
            where: { id: playerId, sessionId }
        });
        if (!player || player.userId !== userId) {
            throw new ForbiddenException('Access denied or Player not found');
        }
        return player;
    }

    private async checkHostOrPlayerAccess(sessionId: string, userId: string) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { 
                quiz: { select: { userId: true } },
                players: { where: { userId } }
            }
        });
        if (!session) throw new NotFoundException('Session not found');
        if (session.quiz.userId !== userId && session.players.length === 0) {
            throw new ForbiddenException('Access denied');
        }
        return session;
    }
`;
code = code.replace(/private closedQuestions = new Map<string, Set<number>>\(\);\n\n    constructor\(/, `private closedQuestions = new Map<string, Set<number>>();\n${helpers}\n    constructor(`);

// 3. Update create
code = code.replace(/async create\(createSessionDto: CreateSessionDto\) \{/, `async create(createSessionDto: CreateSessionDto, userId: string) {`);
code = code.replace(/where: { id: quizId },/, `where: { id: quizId, userId },`);

// 4. Update join
code = code.replace(/async join\(code: string, joinSessionDto: JoinSessionDto\) \{/, `async join(code: string, joinSessionDto: JoinSessionDto, userId: string) {`);
code = code.replace(/sessionId: session\.id,\n                    nickname,\n                },/g, `sessionId: session.id,\n                    nickname,\n                    userId,\n                },`);

// 5. Update getSessionPlayers
code = code.replace(/async getSessionPlayers\(sessionId: string\) \{/, `async getSessionPlayers(sessionId: string, userId: string) {\n        await this.checkHostAccess(sessionId, userId);`);

// 6. Update cancel
code = code.replace(/async cancel\(sessionId: string\) \{/, `async cancel(sessionId: string, userId: string) {\n        await this.checkHostAccess(sessionId, userId);`);

// 7. Update removePlayer
code = code.replace(/async removePlayer\(sessionId: string, playerId: string, kicked: boolean = false\) \{/, `async removePlayer(sessionId: string, playerId: string, kicked: boolean = false, userId: string) {\n        if (kicked) {\n            await this.checkHostAccess(sessionId, userId);\n        } else {\n            await this.checkPlayerAccess(sessionId, playerId, userId);\n        }`);

// 8. Update getSessionPlayerData
code = code.replace(/async getSessionPlayerData\(sessionId: string, playerId: string\) \{/, `async getSessionPlayerData(sessionId: string, playerId: string, userId: string) {\n        await this.checkPlayerAccess(sessionId, playerId, userId);`);

// 9. Update getSessionFullData
code = code.replace(/async getSessionFullData\(sessionId: string, quizId: string\) \{/, `async getSessionFullData(sessionId: string, quizId: string, userId: string) {\n        await this.checkHostAccess(sessionId, userId);`);

// 10. Update start
code = code.replace(/async start\(sessionId: string\) \{/, `async start(sessionId: string, userId: string) {\n        await this.checkHostAccess(sessionId, userId);`);

// 11. Update nextQuestion
code = code.replace(/async nextQuestion\(sessionId: string\) \{/, `async nextQuestion(sessionId: string, userId: string) {\n        await this.checkHostAccess(sessionId, userId);`);

// 12. Update submitAnswer
code = code.replace(/async submitAnswer\(sessionId: string, questionId: string, submitAnswerDto: SubmitAnswerDto\) \{/, `async submitAnswer(sessionId: string, questionId: string, submitAnswerDto: SubmitAnswerDto, userId: string) {\n        await this.checkPlayerAccess(sessionId, submitAnswerDto.playerId, userId);`);

// 13. Update finish
code = code.replace(/async finish\(sessionId: string\) \{/, `async finish(sessionId: string, userId: string) {\n        await this.checkHostAccess(sessionId, userId);`);

// 14. Update getSessionResults
code = code.replace(/async getSessionResults\(sessionId: string\) \{/, `async getSessionResults(sessionId: string, userId: string) {\n        await this.checkHostOrPlayerAccess(sessionId, userId);`);
code = code.replace(/return this.getSessionResults\(sessionId\);/, `return this.getSessionResults(sessionId, userId);`); // In finish()
code = code.replace(/return this.finish\(sessionId\);/, `return this.finish(sessionId, userId);`); // In nextQuestion()

// 15. Update getPlayerResults
code = code.replace(/async getPlayerResults\(sessionId: string, playerId: string\) \{/, `async getPlayerResults(sessionId: string, playerId: string, userId: string) {\n        await this.checkHostOrPlayerAccess(sessionId, userId);`);

fs.writeFileSync(path, code);
console.log('sessions.service.ts patched');
