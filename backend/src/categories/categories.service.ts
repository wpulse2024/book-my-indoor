import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<CategoryDocument> {
    const existing = await this.categoryModel.findOne({ title: dto.title });
    if (existing) throw new ConflictException(`Category '${dto.title}' already exists`);
    return this.categoryModel.create(dto);
  }

  findAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find().sort({ title: 1 }).lean().exec();
  }

  async findOne(id: string): Promise<CategoryDocument> {
    const cat = await this.categoryModel.findById(id).lean().exec();
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryDocument> {
    if (dto.title) {
      const conflict = await this.categoryModel.findOne({
        title: dto.title,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (conflict) throw new ConflictException(`Category '${dto.title}' already exists`);
    }
    const cat = await this.categoryModel
      .findByIdAndUpdate(id, dto, { new: true })
      .lean()
      .exec();
    if (!cat) throw new NotFoundException('Category not found');
    return cat;
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoryModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Category not found');
  }
}
