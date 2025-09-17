import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordsService } from 'src/users/passwords.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly passService: PasswordsService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plain: string) {
    const user = await this.userService.findByEmail(email);
    if (!user || !user.isActive) throw new UnauthorizedException('invalid credentials');

    const ok = await this.passService.verify(user.id, plain);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  signToken(user: { id: string; email: string; roles: { name: string }[] }) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r) => r.name) || [],
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
