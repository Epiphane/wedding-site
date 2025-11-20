import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, OneToOne } from "typeorm"
import RSVP from "./rsvp"
import { IsEmail, IsString } from "class-validator"

@Entity()
export default class Guest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsString()
  name: string

  @Column()
  @IsEmail()
  email: string

  @OneToOne(() => RSVP)
  @JoinColumn()
  response: RSVP
}
