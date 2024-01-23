export default function stream(source) {
  return typeof source.read === "function" ? source : source.getReader();
}
