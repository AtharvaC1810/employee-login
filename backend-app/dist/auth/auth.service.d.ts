import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/user-role.enum';
export declare class AuthService {
    private readonly userRepository;
    private readonly jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
    }>;
    validateUser(email: string, password: string): Promise<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
    } | null>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            name: string;
            email: string;
            role: UserRole;
        };
    }>;
}
