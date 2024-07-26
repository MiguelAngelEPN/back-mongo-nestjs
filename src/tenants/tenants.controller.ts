import { Body, Controller, Post } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { CreateTenantDto } from "./dto/create-tenant.dto";
import { Tenant } from "./tenant.schema";

@Controller('tenants')
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService){}

    @Post()
    async createTenant(@Body() CreateTenantDto: CreateTenantDto): Promise<Tenant>{
        return this.tenantsService.createTenant(CreateTenantDto);
    }
}

