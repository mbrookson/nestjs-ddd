import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CLS_ID, ClsServiceManager } from 'nestjs-cls';
import { UnitOfWorkProvider } from './unit-of-work.provider';

/**
 * Wraps the decorated method in its own CLS context and database transaction.
 * @see UnitOfWorkProvider
 */
export function UseUnitOfWork() {
  const injectUnitOfWork = Inject(UnitOfWorkProvider);
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    injectUnitOfWork(target, 'unitOfWork');
    const original = descriptor.value;
    if (typeof original !== 'function') {
      throw new Error(
        `The @UseUnitOfWork decorator can be only used on functions, but ${propertyKey.toString()} is not a function.`,
      );
    }

    descriptor.value = async function (...args: any) {
      const unitOfWork = this.unitOfWork as UnitOfWorkProvider;
      const cls = ClsServiceManager.getClsService();
      return cls.run(async () => {
        cls.setIfUndefined(CLS_ID, randomUUID());
        return unitOfWork.begin(() => {
          return original.apply(this, args);
        });
      });
    };
  };
}
