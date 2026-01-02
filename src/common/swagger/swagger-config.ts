import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SwaggerConfigOptions } from './interfaces/swaggerConfigOptions.interface';
import { ISwaggerServerUrl } from './interfaces/swaggerServerUrl.interface';

export function swaggerConfig(config: SwaggerConfigOptions): void {
  let serverUrls: ISwaggerServerUrl = { gateway: null, service: null };
  if (config.server) {
    switch (typeof config.server) {
      case 'string':
        serverUrls.gateway = config.server;
        break;
      case 'object':
        serverUrls = {
          gateway: config.server.gateway,
          service: config.server.service,
        };
        break;
      default:
        serverUrls.gateway = 'http://localhost:3006';
    }
  }
  const options = new DocumentBuilder()
    .setTitle(`Method Core - ${config.name.toUpperCase()} API`)
    .addBearerAuth()
    .setVersion('0.0.1');

  if (serverUrls?.gateway && serverUrls?.service) {
    options.addServer(serverUrls.gateway, 'Gateway');
    options.addServer(serverUrls.service, 'Service');
  } else if (serverUrls?.gateway && !serverUrls?.service) {
    options.addServer(serverUrls.gateway, 'Gateway');
  }

  const document = SwaggerModule.createDocument(config.app, options.build(), {
    include: [config.module],
  });
  SwaggerModule.setup(
    `/api/v1/${config.name}/docs`,
    config.app,
    document,
    config.opts,
  );
}
