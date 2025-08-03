import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class LogActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(
    userId: number,
    targetType: string,
    targetId: number,
    action: string,
  ) {
    return this.prisma.activityLog.create({
      data: {
        userId,
        targetType,
        targetId,
        action,
      },
    });
  }
}