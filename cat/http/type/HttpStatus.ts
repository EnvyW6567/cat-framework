import { HTTP_STATUS } from '../entity/HttpStatus';

export type HttpStatus = keyof typeof HTTP_STATUS
export type HttpStatusDescription = (typeof HTTP_STATUS)[HttpStatus]
