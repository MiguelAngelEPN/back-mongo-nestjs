import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Model, Connection, Schema, Types } from 'mongoose';
import { Employee } from './employee.schema';
import { Task, TaskLog } from './employee.schema'; // Ajusta la ruta según tu proyecto

import { isValidObjectId } from 'mongoose';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { AddFielEmployeeDto } from './dto/add-field-employee.dto';
import { CreateTaskDto } from './dto/create-task-.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { KpiDto } from './dto/kpi.dto';
@Injectable()
export class EmployeesService {
  constructor(@Inject('EMPLOYEE_MODEL') private EmployeeModel: Model<Employee>,
    @Inject('TENANT_CONNECTION') private connection: Connection) { }

  private async getModelForTenant(tenantId: string): Promise<Model<Employee & Document>> {
    const modelName = `Employee_${tenantId}`;
    if (this.connection.models[modelName]) {
      return this.connection.models[modelName] as Model<Employee & Document>;
    }

    // Create a new schema based on the existing schema and add any additional properties
    const schema = new Schema(this.EmployeeModel.schema.obj as any, { strict: false });

    // Register and return the new model
    return this.connection.model<Employee & Document>(modelName, schema);
  }

  async getEmployees(tenantId: string) {
    const EmployeeModel = await this.getModelForTenant(tenantId);
    return EmployeeModel.find();
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto, tenantId: string): Promise<Employee> {
    const EmployeeModel = await this.getModelForTenant(tenantId);
    const createdEmployee = new EmployeeModel({
      ...createEmployeeDto,
      tenantId,
    });
    return createdEmployee.save();
  }

  async addFieldEmployee(addFieldDto: AddFielEmployeeDto, tenantId: string): Promise<{ message: string }> {
    const { fieldName, fieldType } = addFieldDto;

    const validTypes = ['string', 'number', 'boolean', 'date'];
    if (!validTypes.includes(fieldType)) {
      throw new BadRequestException('Invalid field type');
    }

    let defaultValue: any;
    switch (fieldType) {
      case 'string':
        defaultValue = '';
        break;
      case 'number':
        defaultValue = 0;
        break;
      case 'boolean':
        defaultValue = false;
      case 'date':
        defaultValue = new Date();
        break;
      default:
        throw new BadRequestException('Invalid field type');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);
    const schema = EmployeeModel.schema;
    schema.add({ [fieldName]: { type: fieldType, default: defaultValue } });

    await EmployeeModel.updateMany({ tenantId }, { $set: { [fieldName]: defaultValue } });

    return { message: `Field '${fieldName}' of type '${fieldType}' added successfully` };
  }

  async updateEmployee(id: string, updateEmployeeDto: UpdateEmployeeDto, tenantId: string): Promise<Employee> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const EmployeeModel = await this.getModelForTenant(tenantId)
    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      { _id: id, tenantId },
      { $set: updateEmployeeDto },
      { new: true }
    );
    if (!updatedEmployee) {
      throw new NotFoundException('Employee not found');
    }
    return updatedEmployee;
  }

  async deleteEmployee(id: string, tenantId: string): Promise<{ message: string }> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID');
    }
    const EmployeeModel = await this.getModelForTenant(tenantId);
    const deletedEmployee = await EmployeeModel.findByIdAndDelete({ _id: id, tenantId }).exec();

    if (!deletedEmployee) {
      throw new NotFoundException('Employee not found');
    }

    return { message: 'Employee successfully deleted' };
  }

  // <------------------------------------------------------ Tasks ------------------------------------>  

  async addTaskToEmployee(employeeId: string, createTaskDto: CreateTaskDto, tenantId: string) {
    const EmployeeModel = await this.getModelForTenant(tenantId);
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const updatedEmployee = await EmployeeModel.findOneAndUpdate(
      { _id: employeeId, tenantId },
      { $push: { tasks: createTaskDto } },
      { new: true, useFindAndModify: false }
    );

    if (!updatedEmployee) {
      throw new NotFoundException('Employee not found');
    }

    return updatedEmployee;
  }

  async getTasksOfEmployee(employeeId: string, tenantId: string) {
    const EmployeeModel = await this.getModelForTenant(tenantId);
    if (!Types.ObjectId.isValid(employeeId)) {
      throw new BadRequestException('Invalid employee ID');
    }

    const employee = await EmployeeModel.findOne({ _id: employeeId, tenantId });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee.tasks;
  }

  async updateTask(employeeId: string, taskId: string, updateTaskDto: UpdateTaskDto, tenantId: string): Promise<Employee> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid ID');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);
    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { $set: { 'tasks.$': updateTaskDto } },
      { new: true }
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    return employee;
  }

  async deleteTask(employeeId: string, taskId: string, tenantId: string): Promise<{ message: string }> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid ID');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);
    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: employeeId, tenantId },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    return { message: 'Task successfully deleted' };
  }

  //<-------------------------------------- TaskLogs ----------------------------------------->

  async getTasksLogsToTask(employeeId: string, taskId: string, tenantId: string): Promise<any[]> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid ID');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);

    // Find the employee and the specific task within the employee's tasks array
    const employee = await EmployeeModel.findOne(
      { _id: employeeId, tenantId, 'tasks._id': taskId },
      { 'tasks.$': 1 } // Only select the task that matches taskId
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    // Get the task
    const task = employee.tasks[0];

    // Return the tasklogs of the specific task
    return task.tasklogs;
  }

  async addTaskLogToTask(employeeId: string, taskId: string, tasklogDto: any, tenantId: string): Promise<Employee> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid ID');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);
    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { $push: { 'tasks.$.tasklogs': tasklogDto } },
      { new: true, useFindAndModify: false }
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    return employee;
  }


  async getSpecificTaskLogValues(
    employeeId: string, 
    taskId: string, 
    key: string, 
    tenantId: string
  ): Promise<{ values: any[], kpiPercentage: number, totalCount: number }> {
      if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
        throw new BadRequestException('Invalid ID');
      }
  
      const EmployeeModel = await this.getModelForTenant(tenantId);
  
      const employee = await EmployeeModel.findOne(
        { _id: employeeId, 'tasks._id': taskId, tenantId },
        { 'tasks.$': 1 }
      );
  
      if (!employee) {
        throw new NotFoundException('Employee or Task not found');
      }
  
      const task = employee.tasks[0];
      const taskLogs = task.tasklogs;
  
      if (!taskLogs || taskLogs.length === 0) {
        return { values: [], kpiPercentage: 0, totalCount: 0 };
      }
  
      const values = taskLogs.map((log) => log[key]).filter((value) => value !== undefined);
  
      // Para calcular el número de clientes únicos
      const uniqueValues = [...new Set(values)];
  
      // Supongamos que queremos usar el primer KPI para el cálculo
      const kpiTarget = task.kpis[0]?.target || 0;
  
      // Calcular el porcentaje de cumplimiento del KPI
      const kpiPercentage = kpiTarget ? (uniqueValues.length / kpiTarget) * 100 : 0;
  
      // Obtener el conteo total de registros en la columna
      const totalCount = values.length;
  
      return { values, kpiPercentage, totalCount };
    }
  

  async getTaskLogKeys(employeeId: string, taskId: string, tenantId: string): Promise<string[]> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid ID');
    }

    const EmployeeModel = await this.getModelForTenant(tenantId);

    const employee = await EmployeeModel.findOne(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { 'tasks.$': 1 }
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    const task = employee.tasks[0];
    const taskLogs = task.tasklogs;

    if (!taskLogs || taskLogs.length === 0) {
      throw new NotFoundException('No task logs found');
    }

    const firstTaskLog = taskLogs[0];

    // Comprobar si registerDate está presente
    if (!firstTaskLog.hasOwnProperty('registerDate')) {
      firstTaskLog.registerDate = new Date();
    }

    const validKeys = Object.keys(firstTaskLog).filter(key => {
      return ![
        '__parentArray',
        '__index',
        '$__parent',
        '$__',
        '_doc',
        '$isNew'
      ].includes(key);
    });

    return validKeys;
  }
  //<-------------------------------------- KPI's ----------------------------------------->

  async addTaskToDepartment(department: string, taskDto: CreateTaskDto, tenantId: string): Promise<{ message: string }> {
    const EmployeeModel = await this.getModelForTenant(tenantId);

    await EmployeeModel.updateMany(
      { department: department },
      { $push: { tasks: taskDto } }
    ).exec();

    return { message: `${department} employees updated with new task` };
  }

  async addKPItoTask(employeeId: string, taskId: string, kpiDto: KpiDto, tenantId: string): Promise<Employee> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid IDs');
    }

    // Calcula el número de días entre startDate y endDate
    const startDate = new Date(kpiDto.startDate);
    const endDate = new Date(kpiDto.endDate);
    const timeUnit = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)); // Días entre las fechas

    const EmployeeMModel = await this.getModelForTenant(tenantId);

    // Añadir el timeUnit calculado al KPI
    const kpiWithTimeUnit = {
      ...kpiDto,
      timeUnit,
    };

    const employee = await EmployeeMModel.findOneAndUpdate(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { $push: { 'tasks.$.kpis': kpiWithTimeUnit } },
      { new: true, useFindAndModify: false }
    );

    if (!employee) {
      throw new NotFoundException('Employee or Task not found');
    }

    return employee;
  }

  async getKPIsForTask(employeeId: string, taskId: string, tenantId: string): Promise<KpiDto[]> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid IDs');
    }

    const EmployeeMModel = await this.getModelForTenant(tenantId);
    const employee = await EmployeeMModel.findOne(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { 'tasks.$': 1 }
    );

    if (!employee || employee.tasks.length === 0) {
      throw new NotFoundException('Employee or Task not found');
    }

    return employee.tasks[0].kpis;
  }
  
  async getKPIbyID(employeeId: string, taskId: string, kpiId: string, tenantId: string): Promise<KpiDto> {
    if (!isValidObjectId(employeeId) || !isValidObjectId(taskId) || !isValidObjectId(kpiId)) {
      throw new BadRequestException('Invalid IDs');
    }
  
    const EmployeeModel = await this.getModelForTenant(tenantId);
    const employee = await EmployeeModel.findOne(
      { _id: employeeId, 'tasks._id': taskId, tenantId },
      { 'tasks.$': 1 } // Obtén solo el task correspondiente
    ).exec();
  
    if (!employee || !employee.tasks.length) {
      throw new NotFoundException('Employee or Task not found');
    }
  
    const task = employee.tasks[0];
    
    // Buscar el KPI en el array `kpis` usando la función `find`
    const kpi = task.kpis.find(kpi => kpi['_id'].toString() === kpiId);
  
    if (!kpi) {
      throw new NotFoundException('KPI not found');
    }
  
    return kpi;
  }
  
}