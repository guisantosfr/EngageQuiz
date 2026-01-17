import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class SessionsService {
    constructor(private readonly prisma: PrismaService) { }

}