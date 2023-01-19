import { LocalLoadPurchases } from '@/data/usecases'
import { mockPurchases, CacheStoreSpy, getCacheExpirationDate } from '@/data/tests'

type SutTypes = {
    sut: LocalLoadPurchases,
    cacheStore: CacheStoreSpy
}

const makeSut = (timeStamp = new Date()): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalLoadPurchases(cacheStore, timeStamp)
    return {
        sut, cacheStore
    }
}

describe('LocalSavePurchases', () => {
    test('Should not delete or insert cache on sut.init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.actions).toEqual([])
    })

    test('Should return empty list if load fails', async () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateFetchError()
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(purchases).toEqual([])
    })

    test('Should return a list of purchases if cache is valid', async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() + 1)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual(cacheStore.fetchResult.value)
    })

    test('Should have an empty list if cache is expired', async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() - 1)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    test('Should return an empty list if cache is on expiration date', async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    test('Should return an empty list if cache is empty', async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() + 1)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: []
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })
})
