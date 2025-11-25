import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, OneToOne, OneToMany, PrimaryColumn, FindOptionsWhere, Unique, ILike } from "typeorm"
import RSVP from "./rsvp"
import { IsEmail, IsString } from "class-validator"
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

  @Column()
  @IsEmail()
  email: string

  @OneToOne(() => RSVP, { eager: true, cascade: true, })
  @JoinColumn()
  response: RSVP

  @OneToMany(() => Sticker, (sticker) => sticker.owner, { eager: true })
  @JoinColumn()
  stickers: Sticker[];

  static async findByName(name: string): Promise<Guest | null> {
    const [firstName, lastName] = name.trim().split(' ');
    let options = { firstName: ILike(firstName) } as FindOptionsWhere<Guest>;
    if (lastName) {
      options.lastName = ILike(lastName);
    }

    const [guests, count] = await Guest.findAndCountBy(options);
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
}
