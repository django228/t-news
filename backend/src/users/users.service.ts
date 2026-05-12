import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async searchByUsername(query: string) {
    return this.prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async getFollowing(id: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    return follows.map(f => f.following);
  }

  async follow(userId: string, followId: string) {
    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followId,
        },
      },
      create: {
        followerId: userId,
        followingId: followId,
      },
      update: {},
    });
  }

  async unfollow(userId: string, followId: string) {
    await this.prisma.follow.deleteMany({
      where: {
        followerId: userId,
        followingId: followId,
      },
    });
  }

  async getSuggestedUsers(currentUserId: string, limit = 5) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const excludeIds = [currentUserId, ...following.map(f => f.followingId)];
    return this.prisma.user.findMany({
      where: { id: { notIn: excludeIds } },
      take: limit,
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
