import { Injectable } from "@nestjs/common";
import { Model, Document } from "mongoose";
import { PaginatedResponse } from "../interfaces/paginate.interface";
import { IBaseRepository } from "./interfaces/base.repository.interface";

@Injectable()
export abstract class BaseRepository<T extends Document>
  implements IBaseRepository<T>
{
  protected readonly model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return createdEntity.save();
  }

  async findById(id: string): Promise<T> {
    return this.model.findById(id).exec();
  }

  async find(filter: any): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  async findOne(filter: any): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async update(id: string, updateDto: any): Promise<T> {
    return this.model.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async delete(id: string): Promise<T> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async paginate(
    page: number,
    pageSize: number
  ): Promise<PaginatedResponse<T>> {
    const totalDocs = await this.model.countDocuments().exec();
    const docs = await this.model
      .find()
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .exec();

    const totalPages = Math.ceil(totalDocs / pageSize);
    const hasNextPage = page * pageSize < totalDocs;
    const hasPrevPage = page > 1;
    const nextPage = hasNextPage ? Number(page) + 1 : null;
    const prevPage = hasPrevPage ? Number(page) - 1 : null;
    const currentPage = (Number(page) - 1) * Number(pageSize) + 1;

    return {
      docs,
      totalDocs,
      totalPages,
      page: Number(page),
      pageSize: Number(pageSize),
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
    };
  }
}
