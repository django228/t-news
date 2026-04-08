import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';
import { FeedItemType } from './feed-item.type';
import { HomePageStatsType } from './home-page-stats.type';

@ObjectType()
export class HomePageType {
  @Field(() => UserType)
  me: UserType;

  @Field(() => [FeedItemType])
  feed: FeedItemType[];

  @Field(() => [UserType])
  suggestions: UserType[];

  @Field(() => HomePageStatsType)
  stats: HomePageStatsType;
}
