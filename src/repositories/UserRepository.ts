import { injectable } from "tsyringe";
import { Repository } from "typeorm";
import { AppDataSource } from "../config/ormConfig";
import { User } from "../models/User";
import { IUserRepository } from "../interfaces/IUserRepository";

@injectable()
export class UserRepository implements IUserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.repository.create(userData);
        return await this.repository.save(user);
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.repository.findOneBy({ id });
    }
}