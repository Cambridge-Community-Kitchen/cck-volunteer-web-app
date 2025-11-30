import Head                    from 'next/head';
import { useRouter }           from 'next/router';
import { useEffect, useState } from 'react';
import Header                  from '@/components/header';
import styles                  from '../styles/Home.module.css';
import EventDetails            from '@/components/event/event';

/**
 * The app's event page, i.e., the '/event' path
 */
const EventPage = () => {
  let baseUrl;

  if (typeof window !== 'undefined') {
    const getUrl = window.location;

    baseUrl = `${ getUrl.protocol  }//${  getUrl.host }`;
  }

  const { query, isReady }              = useRouter();
  const [ queryValues, setQueryValues ] = useState(query);

  useEffect(() => {
    if (isReady) {
      setQueryValues(query);
    }
  }, [ query, isReady ]);

  const { date } = queryValues;

  return (
    <>
      <Head>
        <title>CCK - Deliveries</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Header />
        <EventDetails date={date} basePath={baseUrl} />
      </main>
    </>
  );
};

export default EventPage;
