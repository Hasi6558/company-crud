import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { AuthGuard } from './auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const tokenData = this.authService.signToken(user);

    // Return token in response body instead of setting cookie
    return {
      message: 'Login successful',
      accessToken: tokenData.accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  @Post('logout')
  logout() {
    // With JWT tokens, logout is handled client-side by removing the token
    // Optionally, you could implement token blacklisting here if needed
    return { message: 'Logout successful' };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return { user: req.user };
  }
}
