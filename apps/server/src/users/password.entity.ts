import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from './user.entity';

@Entity('password')
export class Password {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @OneToOne(() => User, (u) => u.password, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index({ unique: true })
  user: User;

  @RelationId((p: Password) => p.user)
  userId: string;

  @CreateDateColumn()
  createdAt: Date;
}
