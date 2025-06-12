"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../../data-source");
const User_1 = require("../../entities/User");
class UserService {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.findById = async (id) => {
            return this.userRepository.findOneBy({ id });
        };
        this.updateUser = async (id, userData) => {
            await this.userRepository.update(id, userData);
            const updatedUser = await this.userRepository.findOneBy({ id });
            if (!updatedUser) {
                throw new Error('User not found after update');
            }
            return updatedUser;
        };
        this.deleteUser = async (id) => {
            const result = await this.userRepository.delete(id);
            if (result.affected === 0) {
                throw new Error('User not found or could not be deleted');
            }
        };
    }
}
exports.UserService = UserService;
