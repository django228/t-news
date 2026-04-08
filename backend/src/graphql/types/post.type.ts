import { Field, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { CommentType } from './comment.type';
import { UserType } from './user.type';

@ObjectType()
export class PostType {
  @Field()
  id: string;

  @Field()
  userId: string;

  @Field()
  content: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;

  @Field(() => UserType, { nullable: true })
  user?: UserType;

  @Field(() => [String])
  likes: string[];

  @Field(() => [CommentType], { nullable: true })
  comments?: CommentType[];

  @Field(() => Int)
  likesCount: number;

  @Field(() => Int)
  commentsCount: number;
}

