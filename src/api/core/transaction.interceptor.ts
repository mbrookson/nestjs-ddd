import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { Observable, from, lastValueFrom } from 'rxjs';
import { UnitOfWorkProvider } from 'src/infrastructure/unit-of-work.provider';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(private readonly unitOfWork: UnitOfWorkProvider) {}

  intercept(
    _context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return from(
      this.unitOfWork.begin(() => {
        return lastValueFrom(next.handle());
      }),
    );
  }
}

export const UseTransactionScope = () =>
  UseInterceptors(TransactionInterceptor);
