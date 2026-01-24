import geoip from 'geoip-lite';
import cache from './lru';

export type GeoResult = {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    lat?: number;
    lon?: number;
} | null;

let GetIPInfo = (ipAddress: string): GeoResult => {

    let geo = geoip.lookup(ipAddress);

    if (!geo) {
        return null;
    }

    const normalize = (v?: string) =>
        v && v.length > 0 ? v : undefined;

    let result : GeoResult = {
        country: normalize(geo.country),
        region: normalize(geo.region),
        city: normalize(geo.city),
        timezone: normalize(geo.timezone),
        lat: geo.ll?.[0] ?? undefined,
        lon: geo.ll?.[1] ?? undefined,
    };
    return result;
}


const geoLookupIp = (ipAddress: string): GeoResult => {
    ipAddress = ipAddress.replace(/^::ffff:/, "");
    let cacheKey = `geoip-${ipAddress}`;

    let cached = cache.get(cacheKey);
    if (cached !== undefined) {
        return cached;
    }

    let geoInfo = GetIPInfo(ipAddress);
    if (geoInfo) {
        cache.set(cacheKey, geoInfo);
    }
    
    return geoInfo;
}

export default geoLookupIp;

