import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Project } from './entities/project.entity';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddMemberDto } from './dto/add-member.dto';

import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/enums/role.enum';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly repository: Repository<Project>,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateProjectDto, user: User) {
    const project = this.repository.create({
      ...dto,
      owner: user,
      members: [user],
    });

    return this.repository.save(project);
  }

  async findAll(user: User) {
    if (user.role === Role.ADMIN) {
      return this.repository.find();
    }

    return this.repository
      .createQueryBuilder('project')
      .leftJoin('project.members', 'member')
      .where('member.id = :id', {
        id: user.id,
      })
      .getMany();
  }

  async findOne(id: string, user: User) {
    const project = await this.repository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException();
    }

    this.checkAccess(project, user);

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, user: User) {
    const project = await this.findOne(id, user);

    Object.assign(project, dto);

    return this.repository.save(project);
  }

  async remove(id: string, user: User) {
    const project = await this.findOne(id, user);

    return this.repository.remove(project);
  }

  async addMember(projectId: string, dto: AddMemberDto) {
    const project = await this.repository.findOne({
      where: { id: projectId },
      relations: { members: true },
    });

    if (!project) {
      throw new NotFoundException();
    }

    const member = await this.usersService.findOne(dto.userId);

    const alreadyMember = project.members.some((m) => m.id === member.id);

    if (alreadyMember) {
      throw new BadRequestException('User is already a member.');
    }

    project.members.push(member);

    return this.repository.save(project);
  }

  async removeMember(projectId: string, userId: string) {
    const project = await this.repository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException();
    }

    project.members = project.members.filter((m) => m.id !== userId);

    return this.repository.save(project);
  }

  private checkAccess(project: Project, user: User) {
    if (user.role === Role.ADMIN) {
      return;
    }

    const hasAccess = project.members.some((m) => m.id === user.id);

    if (!hasAccess) {
      throw new ForbiddenException();
    }
  }
}
