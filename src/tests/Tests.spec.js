import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http, { request } from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const get3DAPIDuration = new Trend('GET_3D_API', true);
export const requestsSuccessRate = new Rate('SUCCESS_RATE');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '25s', target: 10 },
    { duration: '20s', target: 50 },
    { duration: '55s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '55s', target: 100 },
    { duration: '20s', target: 180 },
    { duration: '80s', target: 180 },
    { duration: '10s', target: 300 },
    { duration: '15s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl =
    'https://www.3dtelecom.com.br/wp-includes/js/dist/i18n.min.js?ver=5e580eb46a90c2b997e6';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.post(`${baseUrl}`, params);

  get3DAPIDuration.add(res.timings.duration);
  requestsSuccessRate.add(res.status === OK);

  check(res, {
    'GET_3D API - status 200': () => res.status === OK
  });
}
