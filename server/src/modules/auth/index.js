import { GraphQLModule } from '@graphql-modules/core';
import { gql } from 'apollo-server-express';

import resolvers from './authResolvers';
import UserModule from '../user';

const AuthModule = new GraphQLModule({
  name: 'auth',
  imports: [UserModule],
  typeDefs: gql`
    type AuthPayload {
      token: String
      refreshToken: String
    }

    input SignInForm {
      username: String!
      password: String!
    }

    input SignUpForm {
      username: String!
      email: String!
      password: String!
    }

    input SignUpCompletionForm {
      firstName: String!
      lastName: String!
      gender: String
      birthday: String
    }

    input SocialProfile {
      id: ID!
      name: String!
    }

    input SocialUserProfile {
      email: String!
      firstName: String!
      lastName: String!
    }

    type AsyncValidationResult {
      field: String!
      valid: Boolean!
    }

    type Mutation {
      signIn(form: SignInForm!): AuthPayload
      signUp(form: SignUpForm!): Boolean
      signUpCompletion(form: SignUpCompletionForm): AuthPayload
      signUpAsyncValidation(field: String!, value: String!): AsyncValidationResult
      signInBySocial(social: SocialProfile!, profile: SocialUserProfile!): AuthPayload
      signUpBySocial(social: SocialProfile!, profile: SocialUserProfile!): AuthPayload
      signOut: User
    }
  `,
  resolvers,
  context: context => context,
});

export default AuthModule;
