import { useEffect, useState } from "react";
import { getEventData } from "../api";
import Image from "next/image";

const getIndexByChar = chars => chars.split('').reduce(
  (acc, c, i) => Object.assign(acc, {[c]:i}), {}
)
const codingChars = '23456789CFGHJMPQRVWX'
const codingCharsByPosition = [
  '56',
  '345',
  codingChars,
  codingChars
];

const codingIndexByPosition = codingCharsByPosition.map(getIndexByChar);

const SimpleRouteMap = ({ routes }) => {
  const [ WIDTH, HEIGHT ] = [ 1750, 1900 ];

  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(null);

  if (!routes?.length) {
    return <div>No map - poke the app!</div>
  }

  const selectRoute = routeIndex => {
    if (selectedRouteIndex === routeIndex) {
      setSelectedRouteIndex(null)
    } else {
      setSelectedRouteIndex(routeIndex)
    }
  }

  const toCoords = (plusCode) => {
    const [ Y, X, YY, XX ] = plusCode.split('').map(
      (char, i) => codingIndexByPosition[i][char]
    )

    return [
      (X + (XX)/20) * WIDTH / 3,
      (Y + (YY)/20) * HEIGHT / 2
    ]
  }

  const getHue = (routeIndex) => Math.floor(360 * routeIndex / routes.length);
  const getFill = (routeIndex) => (
    selectedRouteIndex === routeIndex
    ? `hsl(${getHue(routeIndex)}deg 100% 10%)`
    : `hsl(${getHue(routeIndex)}deg 80% 60%)`
  );

  const LegendItem = ({ routeName, routeIndex, dropCount, portionCount }) => {
    const hue = getHue(routeIndex);
    const fill = getFill(routeIndex);

    return <g
      onClick={() =>selectRoute(routeIndex)}
      transform={`translate(0,${(routeIndex - routes.length) * HEIGHT/40 })`}
    >
      <rect
        x={WIDTH/60}
        y={-HEIGHT/40}
        width={WIDTH/60}
        height={HEIGHT/40}
        fill={fill}
        opacity="0.5"
        onClick={()=>selectRoute(routeIndex)}
      />
      <rect
        x={WIDTH/30}
        y={-HEIGHT/40}
        width={WIDTH/5}
        height={HEIGHT/40}
        fill={`hsl(${hue}deg 90% 95%)`}
        opacity="0.75"
      />
      <text x={WIDTH/30 + 4} y={-HEIGHT/120}>
        <tspan style={{fontWeight: 'bold'}}>{routeName}</tspan>
        <tspan style={{fontSize: '0.8em'}}> ({portionCount} pots; {dropCount} drops)</tspan>
      </text>
      <rect
        x={WIDTH/30}
        y={-HEIGHT/40}
        width={WIDTH/5}
        height={HEIGHT/40}
        fill={`transparent`}
        opacity="0.01"
        onClick={()=>selectRoute(routeIndex)}
      />
    </g>
  }

  const Marker = ({ routeIndex }) => {
    const fill = getFill(routeIndex);

    return <rect
      x={0}
      y={-HEIGHT/40}
      width={WIDTH/60}
      height={HEIGHT/40}
      fill={fill}
      opacity="0.5"
      onClick={() => selectRoute(routeIndex)}
    />
  }

  const Location = ({ plusCode, children }) => {
    const [x, y] = toCoords(plusCode);

    return <g transform={`translate(${x}, -${y})`}>
      {children}
    </g>
  };

  return <div
    style={{
      position: "relative",
      width: WIDTH,
      height: HEIGHT,
      margin: "1em auto"
    }}
  >
    <Image
      alt="A map of Cambridge and surrounding area"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
      }}
      src="/cambridge-plus-codes.png"
      width={WIDTH}
      height={HEIGHT}
    />
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        backgroundColor: "transparent"
      }}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
    >
      {
        routes?.map(
          (route, routeIndex) => (
            <g key={route.name} transform={`translate(0 ${HEIGHT})`}>
              <LegendItem
                routeName={route.name}
                routeIndex={routeIndex}
                dropCount={route.dropCount}
                portionCount={route.portionCount}
              />
              {
                route?.plusCodes?.map(
                  plusCode => (
                    <Location key={plusCode} plusCode={plusCode}>
                      <Marker routeIndex={routeIndex} />
                    </Location>
                  )
                )
              }
            </g>
          )
        )
      }
    </svg>
  </div>
}

const EventDetails = ({ date, basePath }) => {
  const [ isLoading, setIsLoading ] = useState(null);
  const [ eventData, setEventData ] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getEventData({ basePath, date }).then((response) => {
      response.json().then((data) => {
        setEventData(data);
        setIsLoading(false);
      });
    });
  }, [ basePath, date ]);

  return isLoading ? <div>Loading...</div> : <SimpleRouteMap routes={eventData?.routes}/>;
}

export default EventDetails;