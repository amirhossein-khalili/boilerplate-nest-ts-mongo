import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy'; // Ensure the correct import
import { AuthService } from './services/auth.service';
import { UserModule } from '../users/user.module'; // Import the UserModule for user-related services
import { AuthController } from './controllers/auth.controller';
import { AUTH_SERVICE } from './utils/constraints';

@Module({
  imports: [
    UserModule,
    PassportModule, // Passport module for authentication handling
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret', // Secret for signing JWT tokens
      signOptions: { expiresIn: '7d' }, // Default expiration for JWT
    }),
  ],
  controllers: [AuthController], // Auth controller to handle auth routes
  providers: [
    { provide: AUTH_SERVICE, useClass: AuthService }, // Use AuthService for business logic
    JwtStrategy, // JWT strategy for authentication validation
  ],
  exports: [AUTH_SERVICE], // Export AUTH_SERVICE so it can be used in other modules
})
export class AuthModule {}
