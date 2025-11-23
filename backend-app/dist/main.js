"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const allowedOrigins = [
        "http://localhost:5000",
        "http://localhost:5001",
        "http://localhost:5002",
        "http://localhost:4000",
        "http://localhost:4001",
        "http://localhost:4002"
    ];
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: 'GET,POST,PUT,PATCH,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    await app.listen(3000);
    console.log('🔥 Backend running on http://localhost:3000');
}
bootstrap();
//# sourceMappingURL=main.js.map