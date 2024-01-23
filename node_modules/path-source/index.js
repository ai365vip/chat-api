import fetchPath from "./fetch";
import requestPath from "./request";

export default function path(path) {
  return (typeof fetch === "function" ? fetchPath : requestPath)(path);
}
