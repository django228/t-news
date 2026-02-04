import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { PostsModule } from '../posts/posts.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PostsModule, UsersModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}

