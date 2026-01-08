import { CacheService } from "../cache.service";

export function CacheResult(ttl: number = 60): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey.toString()}:${JSON.stringify(args)}`;

      const cacheService = this.cacheService as CacheService;

      // Check if result is already in cache
      // let cachedResult;

      // cachedResult = await cacheService.get(cacheKey);

      // if (cachedResult) {
      //   return JSON.parse(cachedResult);
      // }

      // Call the original method
      const result = await originalMethod.apply(this, args);

      try {
        console.log("inja1");
        console.log(cacheKey, JSON.stringify(result), ttl);
        // Save the result in the cache
        await cacheService.set(cacheKey, JSON.stringify(result), ttl);
      } catch (err) {
        console.log("inja2");
        console.log(err);
      }
      return result;
    };

    return descriptor;
  };
}
