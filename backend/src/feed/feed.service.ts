import { Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class FeedService {
  constructor(
    private postsService: PostsService,
    private usersService: UsersService,
  ) {}

  async getFeed(userId: string) {
    const following = await this.usersService.getFollowing(userId);
    const followingIds = following.map(u => u.id);
    if (followingIds.length === 0) {
      return this.postsService.findAll();
    }
    const posts = await this.postsService.getFeed(followingIds);
    return posts.map(post => ({
      ...post,
      user: post.user || { id: post.userId, username: 'User' }
    }));
  }
}

