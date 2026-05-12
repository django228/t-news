import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PostsService } from '../posts/posts.service';

@Injectable()
export class SearchService {
  constructor(
    private usersService: UsersService,
    private postsService: PostsService,
  ) {}

  async search(query: string, type: 'users' | 'posts') {
    if (type === 'users') {
      return this.usersService.searchByUsername(query);
    }
    return this.postsService.search(query);
  }
}

