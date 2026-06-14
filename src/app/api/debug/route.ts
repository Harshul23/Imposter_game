import { NextResponse } from "next/server";

export async function GET() {
  const envKeys = Object.keys(process.env);
  const matchedKeys = envKeys.filter(
    (key) =>
      key.includes("REDIS") ||
      key.includes("KV") ||
      key.includes("UPSTASH") ||
      key.includes("URL") ||
      key.includes("TOKEN")
  );

  // Return the list of keys and their value lengths (for security, DO NOT leak actual values)
  const debugData = matchedKeys.reduce((acc, key) => {
    acc[key] = {
      exists: true,
      length: process.env[key]?.length || 0,
      preview: process.env[key] ? process.env[key]!.substring(0, 8) + "..." : "empty"
    };
    return acc;
  }, {} as Record<string, any>);

  return NextResponse.json({
    message: "KV / Redis Environment Variable Debugger",
    variablesFound: debugData
  });
}
