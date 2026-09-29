import assert from "node:assert/strict";
import test from "node:test";
import { resolveSiteOrigin } from "../src/lib/site-origin.ts";
import { contactSchema } from "../src/lib/contact-submission.ts";
import { errorMessage } from "../src/lib/error-message.ts";

test("production origins reject missing, local, insecure and non-origin values", () => {
  for (const value of [
    undefined,
    "",
    " ",
    "http://church.example",
    "https://localhost",
    "https://localhost.",
    "https://127.0.0.1",
    "https://[::1]",
    "https://site.localhost",
    "https://church.example/path",
    "https://church.example/?q=1",
    "https://church.example/#a",
    "https://user:password@church.example",
    "not a URL",
  ]) {
    assert.throws(() => resolveSiteOrigin(value, true));
  }
});

test("public origins normalize and localhost is development-only", () => {
  assert.equal(resolveSiteOrigin(" https://church.example/ ", true), "https://church.example");
  assert.equal(resolveSiteOrigin(undefined, false), "http://localhost:5173");
});

test("contact validation trims real fields and rejects missing/oversized inputs", () => {
  const input = {
    name: " Test visitor ",
    email: "visitor@example.invalid",
    phone: "",
    subject: " Inquiry ",
    message: " Please contact me. ",
  };
  assert.equal(contactSchema.parse(input).name, "Test visitor");
  for (const change of [
    { name: " " },
    { email: "invalid" },
    { subject: "" },
    { message: " " },
    { message: "x".repeat(4001) },
    { phone: "x".repeat(41) },
  ]) {
    assert.equal(contactSchema.safeParse({ ...input, ...change }).success, false);
  }
});

test("unknown thrown values have a safe fallback and typed messages are retained", () => {
  assert.equal(errorMessage(null, "Failed"), "Failed");
  assert.equal(errorMessage({ message: 123 }, "Failed"), "Failed");
  assert.equal(errorMessage(new Error("Upload failed")), "Upload failed");
  assert.equal(errorMessage({ message: "Database request failed" }), "Database request failed");
});
