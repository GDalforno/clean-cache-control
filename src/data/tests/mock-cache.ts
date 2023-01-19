import { CacheStore } from "@/data/protocols/cache"
import { SavePurchases } from "@/domain/usecases"

const maxAgeInDays = 3

export const getCacheExpirationDate = (timeStamp: Date): Date => {
    const maxCacheAge = new Date(timeStamp)
    maxCacheAge.setDate(timeStamp.getDate() - maxAgeInDays)
    return maxCacheAge
}

export class CacheStoreSpy implements CacheStore {
    actions: Array<CacheStoreSpy.Action> = []
    deleteKey: string = ''
    insertKey: string = ''
    fetchKey: String = ''
    insertValues: Array<SavePurchases.Params> = []
    fetchResult: any

    delete(key: string): void {
        this.actions.push(CacheStoreSpy.Action.delete)
        this.deleteKey = key
    }

    insert(key: string, value: any): void {
        this.actions.push(CacheStoreSpy.Action.insert)
        this.insertKey = key
        this.insertValues = value
    }

    fetch(key: String): any {
        this.actions.push(CacheStoreSpy.Action.fetch)
        this.fetchKey = key
        return this.fetchResult 
    }

    replace(key: string, value: any): void {
        this.delete(key)
        this.insert(key, value)
    }

    simulateDeleteError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'delete').mockImplementationOnce(() => {
            this.actions.push(CacheStoreSpy.Action.delete)
            throw new Error()
        })
    }

    simulateInsertError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'insert').mockImplementationOnce(() => {
            this.actions.push(CacheStoreSpy.Action.insert)
            throw new Error()
        })
    }

    simulateFetchError(): void {
        jest.spyOn(CacheStoreSpy.prototype, 'fetch').mockImplementationOnce(() => {
            this.actions.push(CacheStoreSpy.Action.fetch)
            throw new Error()
        })
    }
}

export namespace CacheStoreSpy {
    export enum Action {
        delete,
        insert,
        fetch
    }
}