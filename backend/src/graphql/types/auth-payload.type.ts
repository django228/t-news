import { Field, ObjectType } from '@nestjs/graphql';
import { UserType } from './user.type';

@ObjectType()
export class AuthPayloadType {
  @Field()
  access_token: string;

  @Field(() => UserType)
  user: UserType;
}

