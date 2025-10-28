async function fetchQuerry(modelParams) {
  const params = _assemblyQuerryParams(modelParams);
  const response = await fetch("http://127.0.0.1:6828/fcgi-bin/lab1.jar", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.assembled,
  });
  const data = await response.json();
  if (response.ok) {
    handleSuccess(params.x, params.y, params.r, data);
  } else {
    handleError(response.status, response.statusText, data);
  }
}

function handleSuccess(x, y, r, res) {
  const log = {
    params: `(x=${x}, y=${y}, r=${r})`,
    result: res.hit,
    exec_time: res.execution_time,
    timestamp: res.timestamp,
  };
  putLog(log.params, log.result, log.exec_time, log.timestamp);
  appendLog(log);
  // TODO какое-то оповещение на страничке
  alert(res.hit ? "Hit!" : "Miss.");
}

function handleError(status, statusText, details) {
  console.log(`Error ${status}: ${statusText}`);
  alert(`Failed: ${details.error_message}`);
}

function _assemblyQuerryParams(modelParams) {
  x = modelParams.x;
  y = modelParams.y;
  r = modelParams.r;
  validate(x, y, r);
  const params = new URLSearchParams();
  params.append("x", x);
  params.append("y", y);
  params.append("r", r);
  return {
    assembled: params,
    x: x,
    y: y,
    r: r,
  };
}
