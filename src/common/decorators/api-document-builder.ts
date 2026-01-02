import { getMetadataStorage } from 'class-validator';
import { ApiPropertyOptions } from '@nestjs/swagger';
import { DECORATORS } from '@nestjs/swagger/dist/constants';
import { ParamDecoratorEnhancer } from '@nestjs/common';

function propertyTypes(targetConstructor: any) {
  const metadataStorage = getMetadataStorage();
  const targetMetadatas = metadataStorage.getTargetValidationMetadatas(
    targetConstructor,
    undefined,
    false,
    false,
    undefined,
  );
  const groupedMetadatas = metadataStorage.groupByPropertyName(targetMetadatas);
  return Object.fromEntries(
    Object.entries(groupedMetadatas).map(([property, decorators]) => {
      const CM = decorators.map((decorator) =>
        metadataStorage
          .getTargetValidatorConstraints(decorator.constraintCls)
          .map((v) => v.name),
      );
      return [property, CM.flat()];
    }),
  );
}

export function apiDocumentBuilder(Target: any) {
  const targetInstance = new Target();
  const properties = Object.keys(propertyTypes(Target));

  const schemaProperties: { [key: string]: ApiPropertyOptions } = {};
  for (const propertyKey of properties) {
    schemaProperties[propertyKey] = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      targetInstance,
      propertyKey,
    );
  }
  return schemaProperties;
}

export const paramTypeEnhancer =
  (docLevel: string): ParamDecoratorEnhancer =>
  (
    target: Record<string, unknown>,
    propertyKey: string,
    parameterIndex: number,
  ): void => {
    const paramTypes = Reflect.getOwnMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    );
    const metaType = paramTypes[parameterIndex];

    const explicit =
      Reflect.getMetadata(DECORATORS.API_PARAMETERS, target[propertyKey]) ?? [];
    Reflect.defineMetadata(
      DECORATORS.API_PARAMETERS,
      [
        ...explicit,
        ...Object.entries(apiDocumentBuilder(metaType))
          .filter((k) => k[0] !== '__meta')
          .map((k) => ({
            ...k[1],
            in: docLevel,
            name: k[0],
          })),
      ],
      target[propertyKey],
    );
  };
