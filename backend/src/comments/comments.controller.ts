import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiResponse({ status: 200, description: 'List of comments' })
  async findByPost(@Param('postId') postId: string) {
    return this.commentsService.findByPostId(postId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: 201, description: 'Comment created' })
  async create(@Param('postId') postId: string, @Body() createCommentDto: CreateCommentDto, @CurrentUser() user: any) {
    return this.commentsService.create(postId, user.id, createCommentDto);
  }
}

@Controller('comments')
export class CommentsDeleteController {
  constructor(private readonly commentsService: CommentsService) {}

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 204, description: 'Comment deleted' })
  async remove(@Param('commentId') commentId: string, @CurrentUser() user: any) {
    await this.commentsService.remove(commentId, user.id);
  }
}

