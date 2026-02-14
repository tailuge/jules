export function Footer() {
  return (
    <box flexDirection="row" paddingX={1} marginBottom={1}>
      <text fg="#444444">Help: </text>
      <text fg="#666666">/help </text>
      <text fg="#444444" marginLeft={2}>
        Clear:{" "}
      </text>
      <text fg="#666666">/clear </text>
      <text fg="#444444" marginLeft={2}>
        Models:{" "}
      </text>
      <text fg="#666666">/models </text>
      <text fg="#444444" marginLeft={2}>
        Console:{" "}
      </text>
      <text fg="#666666">` </text>
      <text fg="#444444" marginLeft={2}>
        Exit:{" "}
      </text>
      <text fg="#666666">/exit</text>
    </box>
  );
}
