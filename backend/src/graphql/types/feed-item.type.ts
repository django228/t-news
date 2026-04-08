import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FeedItemType {
  @Field()
  id: string;

  @Field()
  content: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field()
  authorId: string;

  @Field()
  authorUsername: string;

  @Field({ nullable: true })
  authorAvatar?: string;

  @Field(() => Int)
  likesCount: number;

  @Field(() => Int)
  commentsCount: number;

  @Field()
  hasLiked: boolean;

  @Field()
  isFollowingAuthor: boolean;
}
