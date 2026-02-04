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
      const users = await this.usersService.findAll();
      const lowerQuery = query.toLowerCase();
      return users.filter(u => u.username.toLowerCase().includes(lowerQuery));
    } else {
      return this.postsService.search(query);
    }
  }
}

