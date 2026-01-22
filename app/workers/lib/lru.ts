import { LRUCache } from "lru-cache";
import type { GeoResult } from "./geolookupIp";

const cache = new LRUCache<string, GeoResult & {}>({
  max: 20_000,
  ttl: 1000 * 60 * 60
});


export default cache;