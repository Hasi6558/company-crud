import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../roles/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }
  async create(dto: CreateUserDto): Promise<User> {
    const role = await this.roleRepo.findOne({
      where: { id: dto.roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
    }

    const user = this.repo.create({
      email: dto.email,
      fullName: dto.fullName,
      role: role, // Assign the single role
    });
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOneBy({ email });
  }

  async findOneWithPermissions(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['role'], // Changed from 'roles' to 'role'
    });
  }
}
