import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, OneToOne, OneToMany, PrimaryColumn, FindOptionsWhere, Unique, ILike } from "typeorm"
import RSVP from "./rsvp"
import { IsBoolean, IsEmail, IsPhoneNumber, IsString } from "class-validator"
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
  gender: string

  @Column({ default: '' })
  @IsString()
  lodgingOptions: string

  @Column()
  @IsEmail()
  email: string

  @Column({ nullable: true })
  @IsPhoneNumber()
  phone: string

  @Column({ nullable: true })
  @IsString()
  address: string

  @Column({ default: false })
  @IsBoolean()
  plusOneAllowed: boolean;

  @Column({ default: false })
  @IsBoolean()
  saveTheDateSent: boolean;

  @Column({ default: false })
  @IsBoolean()
  inviteSent: boolean;

  @Column({ nullable: true })
  partnerId: number;

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
    const { partnerId, ...rest } = this as any;
    return { ...rest };
  }
}
