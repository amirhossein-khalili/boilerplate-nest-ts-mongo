import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { ConfigService } from "@nestjs/config";
import { CacheService } from "./cache.service";

@Injectable()
export class RedisCacheService implements CacheService {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {
    const redisHost = this.configService.get<string>("redis.host");
    const redisPort = this.configService.get<number>("redis.port");
    const redisUsername = this.configService.get<string>("redis.username");
    const redisPassword = this.configService.get<string>("redis.password");

    // Correct way to instantiate Redis
    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort,
      //   username: redisUsername,
      password: redisPassword,
    });
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      // Set key with expiration time in seconds
      await this.redisClient.set(key, value, "EX", ttl);
    } else {
      // Set key without expiration time
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
