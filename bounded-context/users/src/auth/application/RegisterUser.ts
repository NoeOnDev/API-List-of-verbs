import { UserRepository } from "../../users/domain/UserRepository";
import { ContactRepository } from "../../contacts/domain/ContactRepository";
import { User } from "../../users/domain/User";
import { HashService } from "../domain/services/HashService";
import { UserCreatedEvent } from "../domain/events/UserCreatedEvent";

export class RegisterUser {
  constructor(
    private userRepository: UserRepository,
    private contactRepository: ContactRepository,
    private hashService: HashService,
    private eventPublisher: (event: UserCreatedEvent) => Promise<void>
  ) {}

  async execute(
    contactId: string,
    username: string,
    password: string
  ): Promise<void> {
    const contact = await this.contactRepository.findById(contactId);
    if (!contact || contact.getStatus() !== "LEAD") {
      throw new Error("Contact not found or already registered as user");
    }

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) throw new Error("Username already exists");

    const hashedPassword = await this.hashService.hash(password);
    const user = new User(username, hashedPassword, contact);
    await this.userRepository.save(user);

    const event = new UserCreatedEvent(
      user.getId(),
      user.getEmail(),
      user.getPhone()
    );
    await this.eventPublisher(event);
  }
}
