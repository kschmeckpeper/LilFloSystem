import React, { useEffect, useReducer } from "react";
import * as ROSLIB from "roslib";
import { basicBlock, wrapStyle } from "../styleDefs/styles";
import Gauge from "react-svg-gauge";

const statsLength = 20;
const gaugeW = 90;
const gaugeH = 65;
const gaugeF = (n: number): string => {
  return n.toFixed(2).toString();
};

const gaugeFdb = (n: number): string => {
  return n.toFixed(2).toString() + " dBm";
};

interface CPUutilMsg {
  percent_utilization: number;
}
interface HDDutilMsg {
  percent_free: number;
}
interface MEMutilMsg {
  percent_used: number;
}
interface NETstatsMsg {
  link_quality: number;
  signal_strength: number;
}

interface SystemMonitorProps {
  ros: ROSLIB.Ros | null;
  connected: boolean;
}

function reducer(state: number[], newVal: number): number[] {
  return [newVal].concat(state).slice(0, statsLength - 1);
}

const SystemMonitor: React.FunctionComponent<SystemMonitorProps> = ({
  ros,
  connected
}) => {
  const [cpu, setCpu] = useReducer(reducer, []);
  const [mem, setMem] = useReducer(reducer, []);
  const [hdd, setHdd] = useReducer(reducer, []);
  const [netQ, setNetQ] = useReducer(reducer, []);
  const [netS, setNetS] = useReducer(reducer, []);

  useEffect(() => {
    if (!connected) return;

    const cpuListener = new ROSLIB.Topic({
      ros: ros as ROSLIB.Ros,
      name: "cpu_stats",
      messageType: "system_monitor/CPUutil"
    });
    cpuListener.subscribe(msg => {
      setCpu((msg as CPUutilMsg).percent_utilization);
    });

    const memListener = new ROSLIB.Topic({
      ros: ros as ROSLIB.Ros,
      name: "mem_stats",
      messageType: "system_monitor/MEMutil"
    });
    memListener.subscribe(msg => {
      setMem((msg as MEMutilMsg).percent_used);
    });
    console.log("subscribed to memory utilization topic");

    const hddListener = new ROSLIB.Topic({
      ros: ros as ROSLIB.Ros,
      name: "hdd_stats",
      messageType: "system_monitor/HDDutil"
    });
    hddListener.subscribe(msg => {
      setHdd((msg as HDDutilMsg).percent_free);
    });
    console.log("subscribed to hard drive stats topic");

    const netListener = new ROSLIB.Topic({
      ros: ros as ROSLIB.Ros,
      name: "net_stats",
      messageType: "system_monitor/NETstats"
    });
    netListener.subscribe(msg => {
      setNetQ((msg as NETstatsMsg).link_quality);
      setNetS((msg as NETstatsMsg).signal_strength);
    });
    console.log("subscribed to network stats topic");
  }, [connected, ros]);

  return (
    <div>
      <h2>System Stats</h2>
      <div
        style={Object.assign(
          { maxHeight: "250px", flexWrap: "wrap" },
          wrapStyle
        )}
      >
        <div>
          <Gauge
            value={cpu[0]}
            width={gaugeW}
            height={gaugeH}
            label="CPU Utilization"
            valueFormatter={gaugeF}
            minMaxLabelStyle={{ visibility: "hidden" }}
          />
        </div>

        <div>
          <Gauge
            value={mem[0]}
            width={gaugeW}
            height={gaugeH}
            label="Memory Utilization"
            valueFormatter={gaugeF}
            minMaxLabelStyle={{ visibility: "hidden" }}
          />
        </div>
        <div>
          <Gauge
            value={100 - hdd[0]}
            width={gaugeW}
            height={gaugeH}
            label="Hard Drive Utilization"
            valueFormatter={gaugeF}
            minMaxLabelStyle={{ visibility: "hidden" }}
          />
        </div>
        <div>
          <Gauge
            value={netQ[0]}
            width={gaugeW}
            height={gaugeH}
            label="Network Quality"
            valueFormatter={gaugeF}
            minMaxLabelStyle={{ visibility: "hidden" }}
          />
        </div>
        <div>
          <Gauge
            value={netS[0]}
            width={gaugeW}
            height={gaugeH}
            label="Network Strength"
            valueFormatter={gaugeFdb}
            min={-70} //https://codeyarns.com/2017/07/23/dbm-wireless-signal-strength/
            max={-20}
            minMaxLabelStyle={{ visibility: "hidden" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemMonitor;
