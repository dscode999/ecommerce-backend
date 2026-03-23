import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";

dotenv.config();

/**
 * `mongodb+srv://` uses DNS SRV lookups. On some networks (ISP, router, corporate)
 * the resolver returns ECONNREFUSED for `_mongodb._tcp.*.mongodb.net`.
 * Using public DNS before connecting often fixes it.
 * If it still fails, set `MONGO_URI_STANDARD` in `.env` to Atlas’s **standard**
 * connection string (`mongodb://host1:27017,host2:27017,...`) — it does not use SRV.
 */
function prepareDnsForMongoSrv(uri) {
  if (process.env.MONGO_SKIP_DNS_FIX === "true") return;
  if (!uri || !uri.startsWith("mongodb+srv://")) return;

  try {
    dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
    if (typeof dns.setDefaultResultOrder === "function") {
      dns.setDefaultResultOrder("ipv4first");
    }
  } catch (e) {
    console.warn("MongoDB DNS preparation skipped:", e?.message || e);
  }
}

export const connectDB = async () => {
  const uri =
    (process.env.MONGO_URI_STANDARD || process.env.MONGO_URI || "").trim();

  if (!uri) {
    console.error("Missing MONGO_URI (or MONGO_URI_STANDARD) in environment.");
    return;
  }

  prepareDnsForMongoSrv(uri);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("MongoDB is connected succesfully");
  } catch (error) {
    console.log(error);
    console.log("MongoDB are failed connections");

    if (uri.startsWith("mongodb+srv://")) {
      console.log(
        "Tip: querySrv / DNS errors? In Atlas → Connect → Drivers, copy the " +
          "Standard connection string (mongodb://...) and set MONGO_URI_STANDARD in .env, " +
          "or ensure outbound DNS (port 53) is allowed."
      );
    }
  }
};
