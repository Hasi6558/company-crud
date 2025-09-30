import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
    return this.repo.find({
      relations: ['role'],
    });
  }

  findOne(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }
  async create(dto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

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

  async searchUsers(searchTerm?: string): Promise<User[]> {
    const queryBuilder = this.repo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    if (searchTerm && searchTerm.trim()) {
      queryBuilder.where('LOWER(user.fullName) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTerm.trim()}%`,
      });
    }

    return queryBuilder.orderBy('user.fullName', 'ASC').getMany();
  }

  async findOneWithPermissions(id: string): Promise<User | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['role'], // Changed from 'roles' to 'role'
    });
  }
  async update(id: string, dto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.repo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check if email is being updated and if it already exists
    if (dto.email !== undefined && dto.email !== user.email) {
      const existingUser = await this.findByEmail(dto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email is already registered');
      }
    }

    if (dto.roleId) {
      const role = await this.roleRepo.findOne({
        where: { id: dto.roleId },
      });
      if (!role) {
        throw new NotFoundException(`Role with ID ${dto.roleId} not found`);
      }
      user.role = role; // Update the single role
    }

    if (dto.email !== undefined) {
      user.email = dto.email;
    }
    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    return this.repo.save(user);
  }
}
