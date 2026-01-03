import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './models/document.entity';
import { DocumentController } from './controllers/document.controller';
// import { DocumentService } from './services/document.service';
import { DocumentRepository } from './repositories/document.repository';
import {
  DOCUMENT_CONFIG,
  DOCUMENT_REPOSITORY,
  DOCUMENT_SERVICE,
} from '../common';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [
    // { provide: DOCUMENT_SERVICE, useClass: DocumentService },
    { provide: DOCUMENT_REPOSITORY, useClass: DocumentRepository },
  ],
  exports: [DOCUMENT_SERVICE, DOCUMENT_REPOSITORY, MongooseModule],
})
export class DocumentModule {
  static registerAsync(options: any): DynamicModule {
    return {
      module: DocumentModule,
      imports: options.imports,
      providers: [
        {
          provide: DOCUMENT_CONFIG,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
    };
  }
}
