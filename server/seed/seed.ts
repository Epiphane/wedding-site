import { Seeder } from "@jorgebodega/typeorm-seeding";
import { DataSource } from "typeorm";
import Guest from "../model/guest";

export default class DataSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const guests: Guest[] = [
      Guest.create({
        people: [
          { firstName: 'Thomas', lastName: 'Steinke', email: 'exyphnos@gmail.com' },
          { firstName: 'Liz', lastName: 'Petersen', email: 'lizziepetersen66@gmail.com' }
        ]
      }),
      Guest.create({ people: [{ firstName: 'Elliot', lastName: 'Fiske', email: 'elliotfiske@gmail.com' }] }),
    ];
    await dataSource.createEntityManager().save(guests);
  }
}
