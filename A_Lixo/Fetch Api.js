import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function SystemInfo() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const response = await fetch("http://10.0.0.163/api/system/info");
      const json = await response.json();
      setData(json);
      formatHashrate(data.hashRate);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };

  function formatHashrate(hashes) {
    if (hashes >= 1000) return (hashes / 1000).toFixed(2) + " TH/s";
    if (hashes <= 999) return hashes.toFixed(2) + " GH/s";
  }

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 4000);
    return () => clearInterval(intervalId);
  }, []);

  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Carregando informações do sistema...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Status: {data.stratumUser.replace("duducesc.", "")}
      </Text>

      <Text style={styles.subtitle}>Hash Rate</Text>
      <Text>Hashrate: {formatHashrate(data.hashRate)}</Text>
      <Text>
        Hashrate Esperado: {(data.expectedHashrate / 1000).toFixed(2)} TH/s
      </Text>

      <Text style={styles.subtitle}>Efficiency</Text>
      <Text> </Text>

      <Text style={styles.subtitle}>Best Difficulty</Text>
      <Text>All-tim best: {data.bestDiff}</Text>
      <Text>since reboot: {data.bestSessionDiff}</Text>

      <Text style={styles.subtitle}>Heat</Text>
      <Text>Temp ASIC: {data.temp.toFixed(1)} °C</Text>
      <Text>Temp VR: {data.vrTemp} °C</Text>
      <Text>
        Fan: {data.fanrpm} RPM = {data.fanspeed} %
      </Text>

      <Text style={styles.subtitle}>Power</Text>
      <Text>Potência Atual: {data.power.toFixed(1)} W</Text>
      <Text>Voltagem: {(data.voltage / 1000).toFixed(1)} V</Text>
      <Text>Frequency: {data.frequency} MHz</Text>
      <Text>ASIC Voltage: {(data.coreVoltageActual / 1000).toFixed(2)} V</Text>
      {/* <Text>Corrente: {(data.current / 1000).toFixed(2)} A</Text> */}

      {/* <Text>Modelo ASIC: {data.ASICModel}</Text>
      <Text>Contagem ASIC: {data.asicCount}</Text> 
      <Text>Versão Firmware: {data.version}</Text>
      <Text>Hostname: {data.hostname}</Text> */}

      <Text style={styles.subtitle}>Shares</Text>
      <Text>Shares Aceitos: {data.sharesAccepted}</Text>
      <Text>Shares Rejeitados: {data.sharesRejected}</Text>
      {/* {data.sharesRejectedReasons && data.sharesRejectedReasons.length > 0 && (
        <>
          <Text>Razões dos Rejeitados:</Text>
          {data.sharesRejectedReasons.map((reason, index) => (
            <Text key={index}>
              - {reason.message}: {reason.count}
            </Text>
          ))}
        </>
      )} */}

      <Text style={styles.subtitle}>Stratum</Text>
      <Text>Status Wi-Fi: {data.wifiStatus}</Text>
      <Text>{data.stratumURL}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
});
