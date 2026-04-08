import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';
import { FeedModule } from '../feed/feed.module';
import { SearchModule } from '../search/search.module';
import { MonitoringModule } from '../monitoring/monitoring.module';
import { QueryResolver } from './resolvers/query.resolver';
import { MutationResolver } from './resolvers/mutation.resolver';
import { GqlJwtAuthGuard } from './guards/gql-jwt-auth.guard';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      sortSchema: true,
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    UsersModule,
    PostsModule,
    CommentsModule,
    FeedModule,
    SearchModule,
    MonitoringModule,
  ],
  providers: [QueryResolver, MutationResolver, GqlJwtAuthGuard],
})
export class GraphqlAppModule {}

