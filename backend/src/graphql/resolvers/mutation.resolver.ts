import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { CommentsService } from '../../comments/comments.service';
import { PostType } from '../types/post.type';
import { UserType } from '../types/user.type';
import { CommentType } from '../types/comment.type';
import { AuthPayloadType } from '../types/auth-payload.type';
import { GqlJwtAuthGuard } from '../guards/gql-jwt-auth.guard';

@Resolver()
export class MutationResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Mutation(() => AuthPayloadType)
  async login(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AuthPayloadType> {
    return this.authService.login(username, password);
  }

  @Mutation(() => AuthPayloadType)
  async register(
    @Args('username') username: string,
    @Args('password') password: string,
  ): Promise<AuthPayloadType> {
    await this.usersService.create({ username, password } as any);
    return this.authService.login(username, password);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => UserType)
  async updateMe(
    @Context() ctx: any,
    @Args('username', { nullable: true }) username?: string,
    @Args('bio', { nullable: true }) bio?: string,
    @Args('avatar', { nullable: true }) avatar?: string,
  ): Promise<UserType> {
    const userId = ctx.req.user.id;
    return this.usersService.update(userId, { username, bio, avatar } as any);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PostType)
  async createPost(
    @Context() ctx: any,
    @Args('content') content: string,
  ): Promise<PostType> {
    const userId = ctx.req.user.id;
    return this.postsService.create(userId, { content } as any);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async deletePost(
    @Context() ctx: any,
    @Args('postId') postId: string,
  ): Promise<boolean> {
    const userId = ctx.req.user.id;
    await this.postsService.remove(postId, userId);
    return true;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PostType)
  async like(
    @Context() ctx: any,
    @Args('postId') postId: string,
  ): Promise<PostType> {
    const userId = ctx.req.user.id;
    return this.postsService.like(postId, userId);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => PostType)
  async unlike(
    @Context() ctx: any,
    @Args('postId') postId: string,
  ): Promise<PostType> {
    const userId = ctx.req.user.id;
    return this.postsService.unlike(postId, userId);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => CommentType)
  async createComment(
    @Context() ctx: any,
    @Args('postId') postId: string,
    @Args('content') content: string,
  ): Promise<CommentType> {
    const userId = ctx.req.user.id;
    return this.commentsService.create(postId, userId, { content } as any);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async deleteComment(
    @Context() ctx: any,
    @Args('commentId') commentId: string,
  ): Promise<boolean> {
    const userId = ctx.req.user.id;
    await this.commentsService.remove(commentId, userId);
    return true;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async follow(
    @Context() ctx: any,
    @Args('userId') userIdToFollow: string,
  ): Promise<boolean> {
    const userId = ctx.req.user.id;
    await this.usersService.follow(userId, userIdToFollow);
    return true;
  }

  @UseGuards(GqlJwtAuthGuard)
  @Mutation(() => Boolean)
  async unfollow(
    @Context() ctx: any,
    @Args('userId') userIdToUnfollow: string,
  ): Promise<boolean> {
    const userId = ctx.req.user.id;
    await this.usersService.unfollow(userId, userIdToUnfollow);
    return true;
  }
}

