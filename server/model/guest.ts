import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, OneToOne, OneToMany, PrimaryColumn, FindOptionsWhere, Unique, ILike } from "typeorm"
import RSVP from "./rsvp"
import { Allow, IsBoolean, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString, ValidateIf } from "class-validator"
import Sticker from "./sticker"
import Person from "./person"

@Entity()
export default class Guest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ default: '' })
  @IsString()
  lodgingOptions: string = '';

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  address: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  city: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  state: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  zipCode: string

  @Column({ default: 0 })
  @IsNumber()
  additionalGuests: number = 0;

  @Column({ default: '' })
  @IsString()
  additionalGuestNames: string = '';

  @Column({ default: 0 })
  @IsNumber()
  children: number = 0;

  @Column({ default: '' })
  @IsString()
  @IsOptional()
  notes: string = '';

  @Column({ default: false })
  @IsBoolean()
  saveTheDateSent: boolean = false;

  @Column({ default: false })
  @IsBoolean()
  inviteSent: boolean = false;

  @OneToOne(() => RSVP, { eager: true, cascade: true, })
  @JoinColumn()
  response: RSVP

  @OneToMany(() => Person, (person) => person.guest, {
    cascade: true,
    eager: true,
  })
  @Allow()
  people: Person[];

  static async findByName(name: string): Promise<Guest | null> {
    const person = await Person.findByName(name);
    return person && person.guest;
  }

  static async findByNameOrFail(name: string): Promise<Guest> {
    const guest = await Guest.findByName(name);
    if (!guest) {
      throw new Error('Guest not found');
    }

    return guest;
  }

  toJSON() {
    const { ...rest } = this as any;
    return { ...rest };
  }
}
