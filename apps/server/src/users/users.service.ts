import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateuserDto } from './create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll(): Promise<User[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.repo.findOneBy({ id });
  }
  create(dto: CreateuserDto): Promise<User> {
    const user = this.repo.create(dto);
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
      relations: ['roles', 'roles.permissions'],
    });
  }
}
