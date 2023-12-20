import { jwtVerify }   from 'jose';
import { NextSeo }     from 'next-seo';
import Hero            from '@/components/hero';
import LayoutContainer from '@/components/layout-container';

/**
 * The app's home page, i.e., the '/' path
 */
const Home = props => (
    <>
      <NextSeo
        title="Cambridge Community Kitchen"
        description="We are a food solidarity collective tackling food poverty in Cambridge"
        openGraph={{
          title       : 'Cambridge Community Kitchen',
          description :
            'We are a food solidarity collective tackling food poverty in Cambridge',
          images : [ { url: 'https://cckitchen.uk/cck-preview.png' } ],
          url    : 'https://cckitchen.uk',
        }}
      />
      <LayoutContainer>
        <Hero user={props.authenticatedUser}/>
      </LayoutContainer>
    </>
);

/**
 * Fetches the user info from the JWT
 */
export async function getServerSideProps(context) {
  const verified = await jwtVerify(
    context.req.cookies.AuthJWT,
    new TextEncoder().encode(process.env.JWT_SS)
  );

  return {
    props: {
      authenticatedUser: verified.payload,
    },
  };
}

export default Home;
