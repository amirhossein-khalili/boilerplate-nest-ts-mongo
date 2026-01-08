export interface IUserMeta {
  id: string;

  phone: string;
}

export interface IMessage {
  type: MessageType;

  code?: string;

  message: string;

  timestamp: number;

  correlationId?: string;
}

export enum MessageType {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  DEBUG = 'DEBUG',
}

export interface IMetaData {
  version: number;

  timestamp: number;

  requestId: string;

  correlationId: string;

  causationId: string;

  pagination?: {
    limit?: number;
    offset?: number;
    total?: number;
  };

  user?: IUserMeta;

  messages?: IMessage[];
}
