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

    test('Should delete cache if load fails', () => {
        const { sut, cacheStore } = makeSut()
        cacheStore.simulateFetchError()
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    test('Should have no side effect if load succeeds', async () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() + 1)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = { timeStamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
    })

    test('Should delete cache if it is expired', () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        timeStamp.setSeconds(timeStamp.getSeconds() - 1)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    test('Should delete cache if it is on expiration date', () => {
        const currentDate = new Date()
        const timeStamp = getCacheExpirationDate(currentDate)
        const { sut, cacheStore } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timeStamp,
            value: mockPurchases()
        }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
    })
})
