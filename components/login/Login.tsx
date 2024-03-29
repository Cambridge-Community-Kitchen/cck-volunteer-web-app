import {
  Image,
  Button,
  Input,
  Heading,
  FormLabel,
  FormControl,
  Flex,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import { Formik, Form, Field } from 'formik';
import { useRouter }           from 'next/router';
import { useState }            from 'react';

import type React     from 'react';
import { requestOTP } from '@/components/api';
import styles         from './Login.module.scss';
import OTPModal       from './OTPModal';

/**
 * Displays a full-page login screen
 *
 * @returns {React.ReactElement} The login screen react component
 */
export default function Login(): React.ReactElement {
  const UserIdErrorMessage = Object.freeze({
    notFound     : 'Volunteer not found. Please try again or register below.',
    generalError : 'We are experiencing technical difficulties. Please try again later.',
  });

  const router = useRouter();

  const initialEmail = (typeof router.query.email !== 'undefined' ? router.query.email : '');

  const [ isLoading, setIsLoading ]                         = useState(false);
  const [ displayOTPEntry, setDisplayOTPEntry ]             = useState(false);
  const [ email, setEmail ]                                 = useState(initialEmail);
  const [ userEntryErrorMessage, setUserEntryErrorMessage ] = useState('');
  const [ debug, setDebug ]                                 = useState(false);

  const handleUserIdSubmit = async (emailToSubmit) => {
    setIsLoading(true);

    try {
      const res = await requestOTP({
        baseURL : router.basePath,
        email   : emailToSubmit,
      });

      if (res.status === 404) {
        setUserEntryErrorMessage(UserIdErrorMessage.notFound);
      } else if (res.status === 200) {
        const body = await res.json();

        if (body.result.includes('console')) {
          setDebug(true);
        }

        setEmail(emailToSubmit);
        setDisplayOTPEntry(true);
      }
    } catch (error) {
      // Our request failed for some reason.  Tell the user to try again later?
      // eslint-disable-next-line no-console
      console.log(error);
      setUserEntryErrorMessage(UserIdErrorMessage.generalError);
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPModalClose = () => setDisplayOTPEntry(false);

  const userEntryErrorContent = userEntryErrorMessage.length > 0
    ? <Alert status='error'>
      <AlertIcon />
      <AlertDescription>{userEntryErrorMessage}</AlertDescription>
    </Alert>
    :    null;

  const spinner = isLoading ? <Spinner size='xs' marginLeft="1em;"/> : null;

  const onEmailChange = (event) => {
    setEmail(event.target.value);
    setUserEntryErrorMessage('');
  };

  return (
    <div className={styles.login}>
      <OTPModal isOpen={displayOTPEntry} debug={debug} onClose={onOTPModalClose} email={email}/>

      <div className={styles.centerColumn}>
        <Image
          alt={'Hero Image'}
          fit="contain"
          align={'center'}
          src={'/cck-simple.png'}
          className={styles.logoHeader}
        />
        <Flex direction="column" className={styles.loginForm} boxShadow="lg">
          <Heading size='lg'>Volunteer sign in</Heading>
          {userEntryErrorContent}
          <Formik
            enableReinitialize
            initialValues={{
              email: initialEmail,
            }}
            onSubmit={async () => {
              await handleUserIdSubmit(email);
            }}
          >
          {() => (
            <Form>
              <Field name='email' type='email'>
                {({ field }) => (
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input {...field} value={email} type='email' onChange={onEmailChange}/>
                  </FormControl>
                )}
              </Field>
              <Button type='submit' colorScheme='orange' disabled={isLoading} className={styles.button}> Continue {spinner}</Button>
            </Form>
          )}
          </Formik>
        </Flex>
        <div className={styles.newVolunteer}>New to CCK?</div>
        <Button
          filter='auto'
          onClick={() => router.push(`/register?email=${  email }`)}
          colorScheme='blackAlpha'
          className={styles.volunteerButton}>
          Register to volunteer
        </Button>
      </div>
    </div>
  );
}
