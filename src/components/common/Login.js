import React, { Component, createRef } from 'react';
// import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';
import { backgrounds } from 'polished';

import LoginForm from './LoginForm';
import bgImage from '../../assets/images/login-bg.jpg';

const Wrapper = styled(Grid)`
  flex: 1 auto;
  ${backgrounds(`url(${bgImage})`, 'center no-repeat')}
  background-size: cover;
`;

class Login extends Component {
  constructor(props) {
    super(props);

    this.ref = createRef();
  }


  render() {
    console.log(this.ref.current);

    return (
      <Wrapper
        ref={this.createRef}
        justify="center"
        alignItems="center"
        container
      >
        <LoginForm />
      </Wrapper>
    );
  }
}

export default Login;
