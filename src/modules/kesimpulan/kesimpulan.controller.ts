import { Controller, Get, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { KesimpulanService } from './kesimpulan.service';
import { TypeUserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('kesimpulan')
@UseGuards(JwtAuthGuard, RolesGuard)
export class KesimpulanController {
    constructor(private readonly kesimpulanService: KesimpulanService) { }

    @Get('simpel')
    @Roles(TypeUserRole.DOSEN)
    async findSimple(
        @Req() req: any,
    ) {
        const dosenId = req.user.sub;
        return this.kesimpulanService.findById(dosenId, { includeDetails: false });
    }

    @Get(':id')
    @Roles(TypeUserRole.ADMIN, TypeUserRole.VALIDATOR)
    async findOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: any,
    ) {
        const role = req.user.roles;

        return this.kesimpulanService.findById(id, role);
    }

    @Get()
    @Roles(TypeUserRole.DOSEN)
    async find(
        @Req() req: any,
    ) {
        const dosenId = req.user.sub;
        const role = req.user.roles;

        return this.kesimpulanService.findById(dosenId, role);
    }
}
