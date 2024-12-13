export default function Worker_fn() {
  return new Worker(__webpack_public_path__ + "bundle.worker.js");
}
