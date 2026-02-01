import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, FindOptionsWhere, Unique, ILike, ManyToOne, OneToMany } from "typeorm"
import { IsEmail, IsOptional, IsString, ValidateIf } from "class-validator"
import Guest from "./guest"
import Sticker from "./sticker"

@Entity()
@Unique(['firstName', 'lastName'])
export default class Person extends BaseEntity {
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
  @ValidateIf((o, value) => value !== null && value !== undefined && value !== '')
  email: string

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  phone: string

  @ManyToOne(() => Guest, guest => guest.people, {
    nullable: false,
    orphanedRowAction: 'delete',
  })
  guest: Guest;

  @OneToMany(() => Sticker, (sticker) => sticker.owner, { lazy: true })
  @JoinColumn()
  stickers: Promise<Sticker[]>;

  static async findByName(name: string): Promise<Person | null> {
    const [firstName, lastName] = name.trim().split(' ');
    let options = { firstName: ILike(firstName) } as FindOptionsWhere<Person>;
    if (lastName) {
      options.lastName = ILike(lastName);
    }

    const [person, count] = await Person.findAndCount({
      where: options,
      relations: {
        guest: true
      }
    });
    if (count === 1) {
      return person[0];
    }

    if (count > 1) {
      throw new Error('Multiple guests have the same first name');
    }

    return null;
  }

  static async findByNameOrFail(name: string): Promise<Person> {
    const person = await Person.findByName(name);
    if (!person) {
      throw new Error('Person not found');
    }

    return person;
  }

  toJSON() {
    const { ...rest } = this as any;
    return { ...rest };
  }
}
