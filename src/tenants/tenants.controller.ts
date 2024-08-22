import { Body, Controller, Post, BadRequestException } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { Tenant } from "./tenant.schema";
import * as bcrypt from 'bcryptjs';

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService){}

    @Post()
    async createTenant(@Body() createTenantDto: CreateTenantDto): Promise<Tenant> {
        const { tenantId, password } = createTenantDto;

        // Verificar si el tenantId ya existe
        const existingTenant = await this.tenantsService.getTenantById(tenantId);
        if (existingTenant) {
            throw new BadRequestException(`Tenant with ID ${tenantId} already exists.`);
        }

        // Verificar la validez de la contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=])[A-Za-z\d@#$%^&+=]{8,}$/;
        if (!passwordRegex.test(password)) {
            throw new BadRequestException('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo tenant con la contraseña encriptada
        const newTenant = await this.tenantsService.createTenant({
            ...createTenantDto,
            password: hashedPassword,
        });

        return newTenant;
    }
}

