import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FileDocument = File & Document;

@Schema()
export class File {
  @Prop()
  objectName: string;

  @Prop()
  originalName: string;

  @Prop()
  userId: number;

  @Prop()
  serviceId: number;

  @Prop({ type: String, enum: ["clientResource", "client"] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: "Client" })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Resource" })
  resourceId: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
