import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "3m",
};

const file = open("./data/large-file.txt", "b");

export default function () {
  const url = "http://producer:3000/process";

  const formData = {
    file: http.file(file, "large-file.txt", "text/plain"),
  };

  const res = http.post(url, formData);

  check(res, { "status is 202": (r) => r.status === 202 });

  sleep(1);
}
