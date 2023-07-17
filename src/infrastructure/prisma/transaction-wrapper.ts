import type { Prisma, PrismaClient } from '@prisma/client';
import type { ImperativeTransaction } from './imperative-transaction';
import { imperativeTransaction } from './imperative-transaction';

/**
 * Wraps a prisma client in a transaction.
 * Mostly copy-pasted from https://github.com/chax-at/transactional-prisma-testing/blob/main/src/prisma.testing.helper.ts
 */
export class TransactionWrapper<T extends PrismaClient> {
  private readonly proxyClient: T;
  private transaction: ImperativeTransaction | null = null;
  private savepointId = 0;

  constructor(private readonly prismaClient: T) {
    this.proxyClient = new Proxy(prismaClient, {
      get: (target, prop, receiver: unknown) => {
        const tx = this.transaction?.tx;
        if (typeof tx === 'undefined') {
          return Reflect.get(target, prop, receiver) as unknown;
        }
        if (prop === '$transaction') {
          return async (arg: unknown) => this.transactionProxyFunction(tx, arg);
        }
        const txHasProp = typeof Reflect.get(tx, prop) !== 'undefined';
        const target_ = txHasProp ? tx : prismaClient;
        return Reflect.get(target_, prop, receiver) as unknown;
      },
    });
  }

  /**
   * Returns a client that will always route requests to the current active transaction.
   * All other calls will be routed to the original given prismaClient.
   */
  public getProxyClient(): T {
    return this.proxyClient;
  }

  /**
   * Starts a new transaction.
   * Should be called before each test.
   */
  public async startNewTransaction(): Promise<void> {
    if (this.transaction) {
      throw new Error(
        `${this.rollbackCurrentTransaction.name} must be called before starting a new transaction`,
      );
    }
    this.transaction = await imperativeTransaction(
      this.prismaClient,
      // Let jest deal with tests that take too long
      { timeout: 60_000 },
    );
  }

  /**
   * Rolls back the currently active transaction.
   * Should be called after each test.
   */
  public async rollbackCurrentTransaction(): Promise<void> {
    if (!this.transaction) {
      throw new Error('No transaction currently active');
    }
    await this.transaction.rollback();
    this.transaction = null;
  }

  /**
   * Replacement for the original prismaClient.$transaction function that will work inside transactions and uses savepoints.
   */
  private async transactionProxyFunction(
    tx: Prisma.TransactionClient,
    args: unknown,
  ): Promise<unknown> {
    return this.wrapInSavepoint(tx, async () => {
      if (Array.isArray(args)) {
        // "Regular" transaction - list of queries that must be awaited
        const returnValue = [];
        for (const query of args) {
          // eslint-disable-next-line no-await-in-loop
          returnValue.push(await query);
        }
        return returnValue as unknown;
      }
      if (typeof args === 'function') {
        // Interactive transaction - callback function that gets the prisma transaction client as argument
        return args(tx) as unknown;
      }
      throw new Error('Invalid $transaction call.');
    });
  }

  /**
   * Wraps `func` in a savepoint.
   * Will automatically rollback the savepoint on error.
   */
  private async wrapInSavepoint<T>(
    tx: Prisma.TransactionClient,
    func: () => Promise<T>,
  ): Promise<T> {
    // TODO: This doesn't support parallel transactions.
    const savepointName = `${this.constructor.name}_${(this.savepointId += 1)}`;
    await tx.$executeRawUnsafe(`SAVEPOINT ${savepointName}`);
    let returnValue;
    try {
      returnValue = await func();
    } catch (err) {
      await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      throw err;
    }
    await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${savepointName}`);
    return returnValue;
  }
}
