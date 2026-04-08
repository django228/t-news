import { Args, Context, Int, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { PostsService } from '../../posts/posts.service';
import { CommentsService } from '../../comments/comments.service';
import { FeedService } from '../../feed/feed.service';
import { SearchService } from '../../search/search.service';
import { PostType } from '../types/post.type';
import { UserType } from '../types/user.type';
import { CommentType } from '../types/comment.type';
import { GqlJwtAuthGuard } from '../guards/gql-jwt-auth.guard';
import { FeedItemType } from '../types/feed-item.type';
import { HomePageType } from '../types/home-page.type';
import { MonitoringService } from '../../monitoring/monitoring.service';

@Resolver()
export class QueryResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private readonly feedService: FeedService,
    private readonly searchService: SearchService,
    private readonly monitoringService: MonitoringService,
  ) {}

  @Query(() => [UserType])
  async users(): Promise<UserType[]> {
    return this.usersService.findAll();
  }

  @Query(() => UserType)
  async user(@Args('id') id: string): Promise<UserType> {
    return this.usersService.findOne(id);
  }

  @Query(() => [PostType])
  async posts(): Promise<PostType[]> {
    const posts = await this.postsService.findAll();
    return posts.map(p => this.normalizePost(p));
  }

  @Query(() => PostType)
  async post(@Args('id') id: string): Promise<PostType> {
    const post = await this.postsService.findOne(id);
    return this.normalizePost(post);
  }

  @Query(() => [CommentType])
  async comments(@Args('postId') postId: string): Promise<CommentType[]> {
    return this.commentsService.findByPostId(postId);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [PostType])
  async feed(@Context() ctx: any): Promise<PostType[]> {
    const userId = ctx.req.user.id;
    const posts = await this.feedService.getFeed(userId);
    return posts.map(p => this.normalizePost(p));
  }

  @Query(() => [UserType])
  async searchUsers(@Args('query') query: string): Promise<UserType[]> {
    return this.searchService.search(query, 'users') as any;
  }

  @Query(() => [PostType])
  async searchPosts(@Args('query') query: string): Promise<PostType[]> {
    const posts = await this.searchService.search(query, 'posts') as any[];
    return posts.map(p => this.normalizePost(p));
  }

  @Query(() => [FeedItemType])
  async publicFeedLite(
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<FeedItemType[]> {
    return this.postsService.getPublicFeedLite(limit ?? 20);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => [FeedItemType])
  async personalizedFeed(
    @Context() ctx: any,
    @Args('limit', { nullable: true, type: () => Int }) limit?: number,
  ): Promise<FeedItemType[]> {
    const userId = ctx.req.user.id;
    return this.postsService.getPersonalizedFeed(userId, limit ?? 20);
  }

  @UseGuards(GqlJwtAuthGuard)
  @Query(() => HomePageType)
  async homePage(
    @Context() ctx: any,
    @Args('feedLimit', { nullable: true, type: () => Int }) feedLimit?: number,
    @Args('suggestionsLimit', { nullable: true, type: () => Int }) suggestionsLimit?: number,
  ): Promise<HomePageType> {
    const userId = ctx.req.user.id;
    const [me, feed, suggestions, stats] = await Promise.all([
      this.usersService.findOne(userId),
      this.postsService.getPersonalizedFeed(userId, feedLimit ?? 20),
      this.usersService.getSuggestedUsers(userId, suggestionsLimit ?? 5),
      this.monitoringService.getHomePageStatsSnapshot(),
    ]);
    return { me, feed, suggestions, stats };
  }

  private normalizePost(post: any): PostType {
    const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : 0;
    return { ...post, likesCount, commentsCount };
  }
}

