import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'OK',
      message: 'NestJS API is running successfully 🚀',
    };
  }
}
