import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HomePageStatsType {
  @Field(() => Int)
  usersInDb: number;

  @Field(() => Int)
  postsInDb: number;

  @Field(() => Int)
  totalRequests: number;

  @Field(() => Int)
  averageResponseTimeMs: number;
}
