import { Module } from "@nestjs/common";
import { RedisCacheService } from "./redis.service";
import { CacheService } from "./cache.service";

@Module({
  imports: [],
  providers: [
    RedisCacheService,
    {
      provide: CacheService,
      useClass: RedisCacheService,
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
