import React from 'react';
import GoogleLogin from 'react-google-login';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import red from '@material-ui/core/colors/red';

import Social from './Social';
import SocialButton from './SocialButton';

const Google = ({ loading, mutation }) => (
  <Social social="google" color={red[500]}>
    <GoogleLogin
      scope="email profile"
      clientId={process.env.GOOGLE_APP_ID}
      onSuccess={({ profileObj: { googleId, email } }) => mutation({
        variables: {
          social: 'google',
          profile: {
            id: googleId,
            email,
          },
        },
      })}
      render={({ onClick }) => (
        <SocialButton loading={loading} onClick={onClick} icon={faGoogle} />
      )}
    />
  </Social>
);

export default Google;