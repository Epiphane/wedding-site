import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, OneToOne, OneToMany, PrimaryColumn, FindOptionsWhere, Unique, ILike } from "typeorm"
import RSVP from "./rsvp"
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsPhoneNumber, IsString, ValidateIf } from "class-validator"
import Sticker from "./sticker"

@Entity()
@Unique(['firstName', 'lastName'])
export default class Guest extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsString()
  firstName: string

  @Column()
  @IsString()
  lastName: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  gender: string

  @Column({ default: '' })
  @IsString()
  lodgingOptions: string = '';

  @Column()
  @IsEmail()
  @ValidateIf((o, value) => value !== null && value !== undefined && value !== '')
  email: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  phone: string

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

  @Column({ default: false })
  @IsBoolean()
  plusOneAllowed: boolean = false;

  @Column({ default: false })
  @IsBoolean()
  saveTheDateSent: boolean = false;

  @Column({ default: false })
  @IsBoolean()
  inviteSent: boolean = false;

  @Column({ nullable: true })
  @IsNumber()
  @IsOptional()
  partnerId: number | null;

  @OneToOne(() => Guest, (other) => other.partner)
  @JoinColumn()
  partner: Guest;

  @OneToOne(() => RSVP, { eager: true, cascade: true, })
  @JoinColumn()
  response: RSVP

  @OneToMany(() => Sticker, (sticker) => sticker.owner, { lazy: true })
  @JoinColumn()
  stickers: Promise<Sticker[]>;

  static async findByName(name: string): Promise<Guest | null> {
    const [firstName, lastName] = name.trim().split(' ');
    let options = { firstName: ILike(firstName) } as FindOptionsWhere<Guest>;
    if (lastName) {
      options.lastName = ILike(lastName);
    }

    const [guests, count] = await Guest.findAndCount({
      where: options,
      relations: {
        partner: true,
      }
    });
    if (count === 1) {
      return guests[0];
    }

    if (count > 1) {
      throw new Error('Multiple guests have the same first name');
    }

    return null;
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
