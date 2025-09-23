import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Password } from './password.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordsService {
  constructor(
    @InjectRepository(Password) private readonly passRepo: Repository<Password>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async setInitialPassword(userId: string, plain: string) {
    // check the existing password
    console.log('Checking for existing password for userId:', userId);

    const existing = await this.passRepo.findOne({ where: { user: { id: userId } } });
    console.log('Existing password found:', existing);
    if (existing) {
      console.log('Existing password details:', {
        id: existing.id,
        userId: existing.user?.id,
        createdAt: existing.createdAt,
      });
      throw new ConflictException('Password already set for this user');
    }

    //check if user is exist
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User Not Found');

    const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '10'), 10);

    const salt = await bcrypt.genSalt(rounds);
    const passwordHash = await bcrypt.hash(plain, salt);

    const pwd = this.passRepo.create({ user, passwordHash });
    await this.passRepo.save(pwd);

    return { message: 'password created' };
  }

  async changePassword(userId: string, newPlain: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('user not Found');

    let pwd = await this.passRepo.findOne({ where: { user: { id: userId } } });
    const rounds = parseInt(this.configService.get('BCRYPT_ROUNDS', '10'), 10);

    const salt = await bcrypt.genSalt(rounds);
    const passwordHash = await bcrypt.hash(newPlain, salt);

    if (!pwd) {
      pwd = this.passRepo.create({ user, passwordHash });
    } else {
      pwd.passwordHash = passwordHash;
    }
    await this.passRepo.save(pwd);
    return { message: 'password updated' };
  }

  async verify(userId: string, plain: string): Promise<boolean> {
    const pwd = await this.passRepo.findOne({ where: { user: { id: userId } } });
    if (!pwd) return false;
    return bcrypt.compare(plain, pwd.passwordHash);
  }
}
