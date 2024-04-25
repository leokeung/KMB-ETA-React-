import { useState, useEffect } from "react";

const App = () => {
  const [routeInput, setRouteInput] = useState("");
  const [message, setMessage] = useState("");
  const [directions, setDirections] = useState([]);
  const [stops, setStops] = useState([]);

  const handleClick = async () => {
    try {
      const route = routeInput.toUpperCase().trim();
      setMessage("Loading...");

      const routeListAPI = "https://data.etabus.gov.hk/v1/transport/kmb/route/";
      const res = await fetch(routeListAPI);
      const routeList = await res.json();

      if (routeList.data.findIndex((el) => el.route === route) < 0) {
        setMessage("此路線不存在");
      } else {
        setMessage("選擇前往方向:");
        const directions = routeList.data
          .filter((el) => el.route === route)
          .map((el) => ({
            bound: el.bound,
            routeStart: el.orig_tc,
            routeEnd: el.dest_tc,
          }));
        setDirections(directions);
      }
    } catch (err) {
      setMessage("路線資料暫時無法讀取");
    }
    setMessage("");
  };

  const handleDirectionClick = async (bound) => {
    try {
      setMessage("Loading...");

      let boundParam = bound;
      if (boundParam === "I") {
        boundParam = "inbound";
      } else if (boundParam === "O") {
        boundParam = "outbound";
      }

      const stopListAPI = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${routeInput}/${boundParam}/1`;
      const res = await fetch(stopListAPI);
      const stopList = await res.json();

      const stops = [];
      for (let j = 0; j < stopList.data.length; j++) {
        const stopNameID = stopList.data[j].stop;

        const stopNameAPI = `https://data.etabus.gov.hk/v1/transport/kmb/stop/${stopNameID}`;
        const res2 = await fetch(stopNameAPI);
        const stopNameData = await res2.json();

        const etaAPI = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopNameID}/${routeInput}/1`;
        const res3 = await fetch(etaAPI);
        const etaData = await res3.json();
        const time = etaData.data[0].eta.substring(11, 16);

        stops.push({
          stopName: stopNameData.data.name_tc,
          time: time,
        });
      }

      setStops(stops);
    } catch (err) {
      setMessage("路線資料暫時無法讀取");
    }
    setMessage("");
  };

  return (
    <div>
      <p>KMB</p>
      <input
        type="text"
        id="routeInsert"
        value={routeInput}
        onChange={(e) => setRouteInput(e.target.value)}
      />
      <button id="searchBtn" onClick={handleClick}>
        Search
      </button>
      {message && <div className="message">{message}</div>}
      <div id="directionContainer">
        {directions.map((direction, index) => (
          <button
            key={index}
            className="direction"
            onClick={() => handleDirectionClick(direction.bound)}
          >
            {`${direction.routeStart} => ${direction.routeEnd}`}
          </button>
        ))}
      </div>
      <div id="stopContainer">
        {stops.map((stop, index) => (
          <div key={index} className="stop">
            #{index + 1} 車站: {stop.stopName} 到站時間: {stop.time}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
