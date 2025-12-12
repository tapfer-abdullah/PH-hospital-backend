import type { Server } from "http";
import app from "./app.ts";

const port = process.env.PORT || 5000;

async function main() {
  const server: Server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Base URL: ${process.env.BASE_URL}`);
  });
}

main();
