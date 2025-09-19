import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. "admin", "manager", "user"

  @Column({ nullable: true })
  description: string;

  // Inverse side of Many-to-Many with Users
  @ManyToMany(() => User, (u) => u.roles)
  users: User[];

  @Column('simple-array', { nullable: true, default: () => "''" })
  permissions: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
