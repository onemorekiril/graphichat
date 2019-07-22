import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import {} from 'polished';
// import {} from 'lodash';

import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import Form from '../../common/Form/Form';
import formConfig from '../../common/Form/formConfig';
import SocialMedia from '../../common/SocialMedia/SocialMedia';
import RegFormStepper from './RegFormStepper';

import TopProgressLine from '../../common/TopProgressLine';

import { getSpacing } from '../../../styles';
import { mutationProps } from '../../propTypes';

const Wrapper = styled(Paper)`
  && {
    width: 100%;
    max-width: 375px;
    min-width: 320px;
    position: relative;
    padding: ${getSpacing(4)} ${getSpacing(3)};
    overflow: hidden;
  }
`;

const Header = styled(Typography)`
  && {
    width: 100%;
    position: relative;
  }
`;

const Footer = styled(Typography)`
  && {
    width: 100%;
    margin-top: ${getSpacing(2)};
  }
`;

const SignUp = ({
  steps,
  activeStep,
  completed,
  signUpAsyncValidationUsername,
  signUpAsyncValidationEmail,
  signUp,
  signUpCompletion,
  signUpBySocial,
}) => {
  return (
    <Wrapper elevation={8}>
      <TopProgressLine loading={signUp.result.loading || signUpCompletion.result.loading} />
      <Header variant="h1" color="primary" align="center" gutterBottom>
        <RegFormStepper activeStep={activeStep} steps={steps} />
      </Header>
      <Choose>
        <When condition={completed}>
          {'Your account had been successfuly completed.Check your email and confirm registration.'}
        </When>
        <When condition={activeStep === 0}>
          <Form
            {...formConfig('signUpStepOne')}
            mutation={signUp.mutation}
            result={signUp.result}
            submitButtonText="Confirm"
            asyncValidationFields={[{
              name: 'username',
              validation: signUpAsyncValidationUsername,
            }, {
              name: 'email',
              validation: signUpAsyncValidationEmail,
            }]}
          />
          <SocialMedia
            mutation={signUpBySocial.mutation}
            result={signUpBySocial.result}
            note="Sign Up with social media:"
          />
        </When>
        <When condition={activeStep === 1}>
          <Form
            {...formConfig('signUpStepTwo')}
            mutation={signUpCompletion.mutation}
            result={signUpCompletion.result}
            submitButtonText="Confirm"
          />
        </When>
        <Otherwise>
          {null}
        </Otherwise>
      </Choose>
      <Footer align="center">
        <Link to="/login">I already have a account</Link>
      </Footer>
    </Wrapper>
  );
};

SignUp.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeStep: PropTypes.number.isRequired,
  completed: PropTypes.bool.isRequired,
  signUpAsyncValidationUsername: PropTypes.shape(mutationProps).isRequired,
  signUpAsyncValidationEmail: PropTypes.shape(mutationProps).isRequired,
  signUp: PropTypes.shape(mutationProps).isRequired,
  signUpCompletion: PropTypes.shape(mutationProps).isRequired,
  signUpBySocial: PropTypes.shape(mutationProps).isRequired,
};

export default SignUp;
