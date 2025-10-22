import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "3m",
  thresholds: {
    http_req_duration: ["p(95)<30000"],
  },
};

const file = open("./data/large-file.txt", "b");

export default function () {
  const url = "http://nginx:80/process";

  const formData = {
    file: http.file(file, "large-file.txt", "text/plain"),
  };

  const res = http.post(url, formData, { timeout: "30s" });

  check(res, { "status is 202": (r) => r.status === 202 });

  sleep(1);
}
