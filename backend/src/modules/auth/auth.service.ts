import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { comparePasswords, hashPassword } from '../../common/utils/password';

export class AuthService {
  constructor(private userRepository: Repository<User>) {}


  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName'] 
    });

    if (!user) return null;

    const isValid = await comparePasswords(password, user.password);
    return isValid ? user : null;
  }

  async registerUser(registerDto: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const hashedPassword = await hashPassword(registerDto.password);
    const user = this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      isVerified: false
    });

    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
}

export default AuthService; // Ensure this is exported
