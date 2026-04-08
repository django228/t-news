import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType()
export class CommentType {
  @Field()
  id: string;

  @Field()
  postId: string;

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
}

