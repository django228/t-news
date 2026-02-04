import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        userId,
        content: createPostDto.content,
      },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        comments: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    return {
      ...post,
      likes: post.likes.map(l => l.userId),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
    };
  }

  async findAll() {
    const posts = await this.prisma.post.findMany({
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        comments: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts.map(post => ({
      ...post,
      likes: post.likes.map(l => l.userId),
    }));
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        comments: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return {
      ...post,
      likes: post.likes.map(l => l.userId),
      likesCount: post.likes.length,
      commentsCount: post.comments.length,
    };
  }

  async findByUserId(userId: string) {
    const posts = await this.prisma.post.findMany({
      where: { userId },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        comments: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts.map(post => ({
      ...post,
      likes: post.likes.map(l => l.userId),
    }));
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    await this.prisma.post.delete({
      where: { id },
    });
  }

  async like(postId: string, userId: string) {
    try {
      await this.prisma.postLike.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (e) {
    }
    return this.findOne(postId);
  }

  async unlike(postId: string, userId: string) {
    await this.prisma.postLike.deleteMany({
      where: {
        postId,
        userId,
      },
    });
    return this.findOne(postId);
  }

  async getFeed(followingIds: string[]) {
    if (followingIds.length === 0) {
      return [];
    }
    const posts = await this.prisma.post.findMany({
      where: {
        userId: { in: followingIds },
      },
      include: {
        likes: true,
        comments: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return posts.map(post => ({
      ...post,
      likes: post.likes.map(l => l.userId),
    }));
  }

  async search(query: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
      include: {
        likes: {
          select: {
            userId: true,
          },
        },
        comments: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
    return posts.map(post => ({
      ...post,
      likes: post.likes.map(l => l.userId),
    }));
  }
}

