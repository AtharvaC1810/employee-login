import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './user-role.enum';
export declare class UsersService {
    private userRepo;
    constructor(userRepo: Repository<User>);
    findAll(role?: UserRole): Promise<User[]>;
    findOne(id: number): Promise<any>;
    createByAdmin(dto: CreateUserDto): Promise<any>;
    createSelf(dto: CreateUserDto): Promise<any>;
    update(id: number, dto: UpdateUserDto): Promise<any>;
    remove(id: number): Promise<any>;
}
