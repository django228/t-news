import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { FeedModule } from './feed/feed.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { MonitoringMiddleware } from './monitoring/monitoring.middleware';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [UsersModule, PostsModule, CommentsModule, AuthModule, SearchModule, FeedModule, MonitoringModule],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MonitoringMiddleware)
      .forRoutes('*');
  }
}

