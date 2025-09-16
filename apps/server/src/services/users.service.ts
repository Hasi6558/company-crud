import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateuserDto } from 'src/dto/create-user.dto';
import { User } from 'src/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
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
}
