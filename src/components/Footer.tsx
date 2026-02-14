export function Footer() {
  return (
    <box flexDirection="row" paddingX={1} marginBottom={1}>
      <text fg="#444444">Help:</text>
      <text fg="#666666" marginLeft={1}>/help</text>
      <text fg="#333333" marginLeft={1}>│ </text>
      <text fg="#444444">Clear:</text>
      <text fg="#666666" marginLeft={1}>/clear</text>
      <text fg="#333333" marginLeft={1}>│ </text>
      <text fg="#444444">Models:</text>
      <text fg="#666666" marginLeft={1}>/models</text>
      <text fg="#333333" marginLeft={1}>│ </text>
      <text fg="#444444">Console:</text>
      <text fg="#666666" marginLeft={1}>`</text>
      <text fg="#333333" marginLeft={1}>│ </text>
      <text fg="#444444">Exit:</text>
      <text fg="#666666" marginLeft={1}>/exit, /quit, or /q</text>
    </box>
  );
}
