import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

export class HashPassword {
  static async generateHashPassword(
    password: string,
    salt: string = randomBytes(8).toString('hex'),
  ): Promise<string> {
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    return salt + '.' + hash.toString('hex');
  }

  static async comparePassword(
    storedHash: string,
    supplied: string,
  ): Promise<boolean> {
    if (!storedHash || !supplied) return false;
    const [salt] = storedHash.split('.');

    const suppliedHashedPassword = await this.generateHashPassword(
      supplied,
      salt,
    );

    if (storedHash === suppliedHashedPassword) {
      return true;
    }
    return false;
  }
}
