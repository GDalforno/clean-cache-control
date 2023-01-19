export class CachePolicy {
    private static maxAgeInDays = 3

    private constructor() {}

    static validate(timeStamp: Date, date: Date): boolean {
        const maxAge = new Date(timeStamp)
        maxAge.setDate(maxAge.getDate() + CachePolicy.maxAgeInDays)
        return maxAge > date
    }
}