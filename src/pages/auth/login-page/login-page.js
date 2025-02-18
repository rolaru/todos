import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';

import { ActionsContext } from './../../../common/store/store';

import PageHeader from './../../../components/page-header/page-header';
import AuthForm from './../../../components/auth-form/auth-form';
import LoadingSpinner from './../../../components/loading-spinner/loading-spinner';

import { getFromStorage, saveToStorage } from './../../../helpers/local-storage-helper';
import { decodeJwtToken } from './../../../helpers/auth-helper';

import authValidators from '../../../validators/auth-validators';

import { LOGIN } from './../auth.gql';

import './login-page.css';

const LoginPage = () => {
  const { login } = useContext(ActionsContext);

  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  
  const [
    gqlLogin,
    {
      loading,
      error: loginError
    }
  ] = useMutation(LOGIN);

  useEffect(() => {
    // Redirect the user in case he is already logged in 
    if (getFromStorage('token')) {
      navigate('/', { replace: true });
    }
  }, []);

  const onFormSubmit = async (formValue) => {
    try {
      const formErrors = authValidators.validateForm(formValue);
      const hasErrors = Object.values(formErrors).filter(error => !!error).length > 0;

      setErrors(formErrors);

      if (hasErrors) {
        return;
      }

      const response = await gqlLogin({
        variables: formValue
      });

      const token = response?.data?.login;

      if (token) {
        const { id, email, fullName } = decodeJwtToken(token);
        login({ id, email, fullName });
        saveToStorage('token', token);
        navigate('/', { replace: true });
      }
    } catch(error) {
      // TODO: Treat errors here
    }
  };

  return (
    <div className="page page--centered login-page">
      <LoadingSpinner isVisible={loading} />
      <PageHeader title="Welcome back!" subtitle="Login to continue." />
      {loginError && <div className="error">Invalid email or password.</div>}
      <AuthForm
        classes="login-page__form"
        submitButtonText="Log In"
        errors={errors}
        onSubmit={onFormSubmit}
      >
        <Link
          className="link login-page__register-link"
          to="/auth/register"
        >
          Don’t have an account? Sign up.
        </Link>
      </AuthForm>
    </div>
  );
};

export default LoginPage;