import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Req, Query } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddFielEmployeeDto } from './dto/add-field-employee.dto';
import { CreateTaskDto } from './dto/create-task-.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { KpiDto } from './dto/kpi.dto';
import { Employee } from './employee.schema';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @Get()
  getEmployees(@Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.getEmployees(tenantId);
  }

  @Post()
  createEmployee(@Body() createEmployeeDto: CreateEmployeeDto, @Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.createEmployee(createEmployeeDto, tenantId);
  }

  @Post('add-field')
  async addField(@Body() addFieldDto: AddFielEmployeeDto, @Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.addFieldEmployee(addFieldDto, tenantId);
  }

  @Put(':id')
  updateEmployee(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.updateEmployee(id, updateEmployeeDto, tenantId);
  }

  @Delete(':id')
  async deleteEmployee(@Req() req, @Param('id') id: string): Promise<{ message: string }> {
    const tenantId = req['tenantId'];
    return this.employeesService.deleteEmployee(id, tenantId);
  }

  //<-------------------------------------- Tasks ----------------------------------------->
  @Post(':id/tasks')
  async createTask(
    @Param('id') employeeId: string,
    @Body() createTaskDto: CreateTaskDto,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.addTaskToEmployee(employeeId, createTaskDto, tenantId);
  }

  @Get(':id/tasks')
  async getTasks(
    @Param('id') employeeId: string,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.getTasksOfEmployee(employeeId, tenantId);
  }

  @Put(':id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.updateTask(id, taskId, updateTaskDto, tenantId);
  }

  @Delete(':id/tasks/:taskId')
  async deleteTask(
    @Param('id') employeeId: string,
    @Param('taskId') taskId: string,
    @Req() req
  ): Promise<{ message: string }> {
    const tenantId = req['tenantId'];
    return this.employeesService.deleteTask(employeeId, taskId, tenantId);
  }

  //<-------------------------------------- TaskLogs ----------------------------------------->
  @Post(':employeeId/task/:taskId/tasklogs')
  addTaskLogToTask(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Body() taskLogDto: any,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.addTaskLogToTask(employeeId, taskId, taskLogDto, tenantId);
  }

  @Get(':employeeId/task/:taskId/tasklogs')
  getTasksLogsToTaskId(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.getTasksLogsToTask(employeeId, taskId, tenantId);
  }

  @Get(':employeeId/tasks/:taskId/tasklog-keys')
  async getTaskLogKeys(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Req() req
  ): Promise<string[]> {
    const tenantId = req['tenantId'];
    return this.employeesService.getTaskLogKeys(employeeId, taskId, tenantId);
  }

  //<-------------------------------------- KPI's ----------------------------------------->
  @Post('department/:department/tasks')
  addTaskToDepartment(@Param('department') department: string, @Body() taskDto: CreateTaskDto, @Req() req) {
    const tenantId = req['tenantId'];
    return this.employeesService.addTaskToDepartment(department, taskDto, tenantId);
  }

  @Post(':employeeId/tasks/:taskId/kpis')
  addKpiToTask(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Body() kpiDto: KpiDto,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.addKPItoTask(employeeId, taskId, kpiDto, tenantId);
  }

  @Get(':employeeId/tasks/:taskId/tasklogs')
  async getTaskLogValues(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Query('key') key: string,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return await this.employeesService.getSpecificTaskLogValues(employeeId, taskId, key, tenantId);
  }


  @Get(':employeeId/tasks/:taskId/kpis')
  async getKPIsForTask(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.getKPIsForTask(employeeId, taskId, tenantId);
  }
  
  @Get(':employeeId/tasks/:taskId/kpis/:kpiId')
  async getKPIbyID(
    @Param('employeeId') employeeId: string,
    @Param('taskId') taskId: string,
    @Param('kpiId') kpiId: string,
    @Req() req
  ) {
    const tenantId = req['tenantId'];
    return this.employeesService.getKPIbyID(employeeId, taskId, kpiId, tenantId);
  }
}

