import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { PostsService } from '../posts/posts.service';
import { CreatePostDto } from '../posts/dto/create-post.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details' })
  findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User updated' })
  update(@Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto, @CurrentUser() currentUser: any) {
    if (currentUser.id !== userId) {
      throw new Error('Unauthorized');
    }
    return this.usersService.update(userId, updateUserDto);
  }

  @Post(':userId/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatars',
      filename: (req, file, cb) => {
        const userId = req.params.userId;
        const ext = extname(file.originalname);
        cb(null, `${userId}${ext}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  async uploadAvatar(@Param('userId') userId: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() currentUser: any) {
    if (currentUser.id !== userId) {
      throw new Error('Unauthorized');
    }
    const avatarUrl = `/uploads/avatars/${file.filename}`;
    return this.usersService.update(userId, { avatar: avatarUrl });
  }

  @Get(':userId/posts')
  @ApiOperation({ summary: 'Get all posts by user' })
  @ApiResponse({ status: 200, description: "List of user's posts" })
  async getUserPosts(@Param('userId') userId: string) {
    return this.postsService.findByUserId(userId);
  }

  @Post(':userId/posts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created' })
  async createPost(@Param('userId') userId: string, @Body() createPostDto: CreatePostDto, @CurrentUser() currentUser: any) {
    if (currentUser.id !== userId) {
      throw new Error('Unauthorized');
    }
    return this.postsService.create(userId, createPostDto);
  }

  @Post(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed' })
  async follow(@Param('userId') userId: string, @CurrentUser() currentUser: any) {
    return this.usersService.follow(currentUser.id, userId);
  }

  @Delete(':userId/follow')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 204, description: 'User unfollowed' })
  async unfollow(@Param('userId') userId: string, @CurrentUser() currentUser: any) {
    return this.usersService.unfollow(currentUser.id, userId);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'Get list of users being followed' })
  @ApiResponse({ status: 200, description: 'List of followed users' })
  async getFollowing(@Param('userId') userId: string) {
    return this.usersService.getFollowing(userId);
  }
}
