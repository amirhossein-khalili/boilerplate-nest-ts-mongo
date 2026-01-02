import { Inject, Injectable } from '@nestjs/common';
import { IDocumentService } from '../interfaces/document.service.interface';
import { IDocumentRepository } from '../interfaces/document.repository.interface';
import { CreateDto } from '../dtos/create.dto';
import {
  DocumentNotFoundException,
  MetaNotProvidedException,
  StreamNotFoundException,
  UnauthorizedException,
} from '../exceptions';
import { DocumentFactory } from '../factories';
import { GetDocumentDto } from '../dtos';
import { Document } from '../models/document.entity';
import { IUserMeta } from '../../common/interfaces';

@Injectable()
export class DocumentService implements IDocumentService {
  constructor(
    @Inject('IDocumentRepository')
    private readonly repository: IDocumentRepository,
  ) {}

  async create(documentDto: CreateDto, userMeta: IUserMeta): Promise<any> {
    if (!userMeta) {
      throw new MetaNotProvidedException('Metadata is required.');
    }

    const document = DocumentFactory.createDocument(documentDto, userMeta);
    const fileId = await this.repository.create(document);
    const [info] = await this.repository.getInfo([fileId]);
    return [
      {
        fieldname: 'file',
        originalname: info?.filename,
        encoding: null,
        mimetype: info?.contentType,
        id: fileId,
        filename: info?.filename,
        metadata: null,
        bucketName: 'fs',
        chunkSize: null,
        size: Number(info?.filesize || 0),
        md5: null,
        uploadDate: info?.uploadDate,
        contentType: info?.contentType,
      },
    ];
  }

  async getDocument(
    documentDownloadDto: GetDocumentDto,
    userMeta: IUserMeta,
  ): Promise<Document> {
    let authorized: boolean = false;
    const infos = await this.repository.getInfo([documentDownloadDto?.id]);
    if (
      infos[0].metadata?.userId === userMeta.id ||
      userMeta.role === 'superAdmin'
    ) {
      authorized = true;
    }
    if (!authorized)
      throw new UnauthorizedException('you cant access this image');

    if (!infos || !Array.isArray(infos) || infos.length === 0 || !infos[0]) {
      throw new DocumentNotFoundException(documentDownloadDto.id);
    }
    const stream = this.repository.getStream(documentDownloadDto?.id);
    if (!stream) {
      throw new StreamNotFoundException(
        `Stream not found. id: ${documentDownloadDto?.id}`,
      );
    }
    return { ...infos[0], stream };
  }

  // @FailureCatch({
  //   domain: 'documents',
  //   service: 'com.chargoon.cloud.svc.documents',
  // })
  // async gatMultiDocumentAsBase64(
  //   documentDownloadDto: DocumentGetDto,
  //   meta: IMetadata,
  // ): Promise<IQueryResult> {
  //   const infos = await this.repository.getInfo(documentDownloadDto?.ids);
  //   if (
  //     infos.some(
  //       (info) => info.length >= process.env.MAX_FILE_SIZE_MULTI_DOWNLOAD,
  //     )
  //   ) {
  //     throw new MaximumSizeDetectedException(
  //       `At least one file is more than ${process.env.MAX_FILE_SIZE_MULTI_DOWNLOAD} bytes.`,
  //     );
  //   }
  //   for (const info of infos) {
  //     if (
  //       !isAwatAdmin &&
  //       infos[0]?.metadata?.domain !== Domains.managementCenter.name
  //     ) {
  //       if (
  //         !meta?.user?.organizations?.find(
  //           (organization) =>
  //             organization.id === info?.metadata?.organization?.id,
  //         )
  //       ) {
  //         throw new OrganizationMismatchException('Organization mismatch.');
  //       }
  //     }
  //   }
  //   const promises = [];
  //   for (let i = 0, N = documentDownloadDto?.ids.length; i < N; i += 1) {
  //     const info = infos.find(
  //       (inf) => inf._id.toString() === documentDownloadDto?.ids[i],
  //     );
  //     if (!info) {
  //       promises.push(Promise.resolve({ _id: documentDownloadDto?.ids[i] }));
  //     } else {
  //       promises.push(
  //         new Promise((resolve, reject) => {
  //           const stream = this.repository.getStream(
  //             documentDownloadDto?.ids[i],
  //           );
  //           const buf = [];
  //           stream.on('error', (error) => reject(error));
  //           stream.on('data', (data) => buf.push(data));
  //           stream.on('end', () => {
  //             const buffer = Buffer.concat(buf);
  //             stream.removeAllListeners();
  //             resolve({ base64: buffer.toString('base64'), ...info });
  //           });
  //         }),
  //       );
  //     }
  //   }
  //   const response = await Promise.all(promises);
  //   return {
  //     status: true,
  //     data: response,
  //     meta,
  //   };
  // }

  // @FailureCatch({
  //   domain: 'documents',
  //   service: 'com.chargoon.cloud.svc.documents',
  // })
  // async getUsedSpaceSize(
  //   spaceSizeDto: OrganizationSpaceSizeDto,
  //   meta: IMetadata,
  // ): Promise<IQueryResult> {
  //   const size = await this.repository.getUsedSpaceSizeInOrganization(
  //     spaceSizeDto.id,
  //     spaceSizeDto.domain,
  //   );
  //   return { status: true, data: { size }, meta };
  // }

  // @FailureCatch({
  //   domain: domainInfo().domain,
  //   service: domainInfo().service,
  // })
  // async getOrganizationDocuments(
  //   data: GetOrganizationDocumentsDto,
  //   meta: IMetadata,
  // ): Promise<IQueryResult> {
  //   if (
  //     !isOwner(meta.user.id, data.organizationId, meta) &&
  //     !hasAccess(
  //       resourcesDictionary.GET_ORGANIZATION_DOCUMENTS.id,
  //       meta,
  //       data.organizationId,
  //     )
  //   ) {
  //     throw new AccessDeniedException(
  //       `forbidden - trying to get documents for organization ${data.organizationId}`,
  //     );
  //   }
  //   const { data: documents, meta: responseMeta } = await this.queryBus.execute(
  //     new GetOrganizationDocuments(data, meta),
  //   );
  //   const linkedDocuments = await DocumentsEntitiesFetcher.decorate(
  //     documents,
  //     data.organizationId,
  //     meta,
  //     this.amqpConnection,
  //   );
  //   const decoratedDocuments: (OrganizationDocument & any)[] =
  //     await DocumentsDecorator.decorate(
  //       linkedDocuments,
  //       meta,
  //       this.amqpConnection,
  //       {
  //         requester: 1,
  //       },
  //     );
  //   return {
  //     status: true,
  //     data: decoratedDocuments,
  //     meta: {
  //       ...meta,
  //       pagination: {
  //         limit: meta?.pagination?.limit,
  //         offset: meta?.pagination?.offset,
  //         total: responseMeta?.pagination?.total,
  //       },
  //     },
  //   };
  // }
}
