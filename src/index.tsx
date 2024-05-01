import { serveStatic } from "@hono/node-server/serve-static";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { xmtpSupport, validateXMTPUser } from "./xmtp"; // Import XMTP middleware

// import { neynar } from 'frog/hubs'

export const app = new Frog({
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
});

app.use("/*", serveStatic({ root: "./public" }));

app.use("/", async (c, next) => {
  await next();
  c.header("x-message", "Only called for `/foo` and `/foo/bar` frames.");
});

// Use XMTP middleware
app.use(validateXMTPUser);
app.use(xmtpSupport);

app.frame("/", (c) => {
  console.log(c.var);
  const { buttonValue, inputText, status } = c;

  const fruit = inputText || buttonValue;
  return c.res({
    headers: {
      "Content-Type": "text/html",
      keywords: "frog, example", // Ensure this is the correct way to set headers in Hono
    },
    image: (
      <div
        style={{
          alignItems: "center",
          background:
            status === "response"
              ? "linear-gradient(to right, #432889, #17101F)"
              : "black",
          backgroundSize: "100% 100%",
          display: "flex",
          flexDirection: "column",
          flexWrap: "nowrap",
          height: "100%",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "white",
            fontSize: 60,
            fontStyle: "normal",
            letterSpacing: "-0.025em",
            lineHeight: 1.4,
            marginTop: 30,
            padding: "0 120px",
            whiteSpace: "pre-wrap",
          }}
        >
          {status === "response"
            ? `Nice choice.${fruit ? ` ${fruit.toUpperCase()}!!` : ""}`
            : "Welcome!"}
        </div>
      </div>
    ),
    intents: [
      <TextInput placeholder="Enter custom fruit..." />,
      <Button value="apples">Apples</Button>,
      <Button value="oranges">Oranges</Button>,
      <Button value="bananas">Bananas</Button>,
      status === "response" && <Button.Reset>Reset</Button.Reset>,
    ],
  });
});

devtools(app, { serveStatic });
