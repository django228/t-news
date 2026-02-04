import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  @ApiResponse({ status: 200, description: 'List of all posts' })
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':postId')
  @ApiOperation({ summary: 'Get post by ID' })
  @ApiResponse({ status: 200, description: 'Post details' })
  async findOne(@Param('postId') postId: string) {
    return this.postsService.findOne(postId);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 204, description: 'Post deleted' })
  remove(@Param('postId') postId: string, @CurrentUser() user: any) {
    this.postsService.remove(postId, user.id);
  }

  @Post(':postId/likes')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Like a post' })
  @ApiResponse({ status: 201, description: 'Post liked' })
  async like(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.postsService.like(postId, user.id);
  }

  @Delete(':postId/likes')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiResponse({ status: 204, description: 'Post unliked' })
  async unlike(@Param('postId') postId: string, @CurrentUser() user: any) {
    return this.postsService.unlike(postId, user.id);
  }
}

