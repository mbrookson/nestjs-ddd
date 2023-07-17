import type { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import util from 'util';
import { Event } from './event';

export type ImperativeTransaction = {
  id: string;
  tx: Prisma.TransactionClient;
  rollback: () => Promise<void>;
};

function traceLog(message: string) {
  if (process.env.LOG_LEVEL === 'verbose') {
    // eslint-disable-next-line no-console
    console.debug(message);
  }
}

/**
 * Imperative interface to transactions.
 * Enables being able to rollback a transaction from outside of the transaction callback.
 * Workaround for https://github.com/prisma/prisma/issues/12458
 * Can eventually be replaced when Prisma Client Extensions become available (https://github.com/prisma/prisma/issues/12458#issuecomment-1233503358)
 */
export async function imperativeTransaction(
  prismaClient: PrismaClient,
  transactionOpts?: Parameters<PrismaClient['$transaction']>[1],
): Promise<ImperativeTransaction> {
  const rollbackStartEvent = Event();
  const rollbackDoneEvent = Event();
  const rollbackError = new Error('rollback');
  const tx = await new Promise<Prisma.TransactionClient>((resolve) => {
    traceLog('Starting new test transaction...');
    prismaClient
      .$transaction(async (tx) => {
        traceLog('Started new test transaction.');
        resolve(tx);
        await rollbackStartEvent.wait();
        traceLog('Rolling back test transaction...');
        throw rollbackError;
      }, transactionOpts)
      .catch((error: unknown) => {
        if (error !== rollbackError)
          traceLog(`Unexpected error in transaction: ${util.inspect(error)}`);
      })
      .finally(() => {
        traceLog('Rolled back test transaction.');
        rollbackDoneEvent.set();
      });
  });

  const rollback = async () => {
    rollbackStartEvent.set();
    await rollbackDoneEvent.wait();
  };

  return { id: randomUUID(), tx, rollback };
}
