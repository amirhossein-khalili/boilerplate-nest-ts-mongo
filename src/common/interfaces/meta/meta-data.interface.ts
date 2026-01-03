export interface IUserMeta {
  id: string;

  phone: string;
}

export interface IMessage {
  type: MessageType; // Message type (info, error, etc.)
  code?: string; // Optional code, useful for error codes or specific identifiers
  message: string; // The content of the message
  timestamp: number; // When the message was created
  correlationId?: string; // Optional: can be used to link messages across systems
}

enum MessageType {
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

  httpHeaders?: Record<string, string>;

  pagination?: {
    limit?: number;
    offset?: number;
    total?: number;
  };

  user: IUserMeta;

  messages?: IMessage[];
}
