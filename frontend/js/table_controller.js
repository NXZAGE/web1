const TABLE_PROPS = {
  cols: 4,
  table_class: "log-table",
  tr_class: "log-tr",
  td_class: "log-td",
  col_titles: ["(x, y, r)", "result", "exec_time", "timestamp"],
};

function generateTable() {
  const container = document.getElementById("log-table-container");
  container.innerHTML = "";
  const table = document.createElement("table");
  table.classList.add(TABLE_PROPS.table_class);
  table.id = 'log-table';
  table.appendChild(_createTableHeader());
  const logs = getLogs();
  for(let i = 0; i < logs.length; ++i) {
    const raw = _createRaw(logs[i]);
    table.appendChild(raw);
  }
  container.appendChild(table);
  console.log('table inited');
}

function appendLog(log) {
  const table = document.getElementById('log-table');
  table.appendChild(_createRaw(log));
}

// returns table-header tr whish is ready to be pushed to DOM
function _createTableHeader() {
  const header = document.createElement('tr');
  header.classList.add(TABLE_PROPS.tr_class);
  for (let i = 0; i < TABLE_PROPS.cols; ++i) {
    const td = document.createElement('td');
    td.classList.add(TABLE_PROPS.td_class);
    td.textContent = TABLE_PROPS.col_titles[i];
    header.appendChild(td);
  }
  return header;
}

function _createRaw(log) {
  const raw = document.createElement('tr');
  raw.classList.add(TABLE_PROPS.tr_class);
  raw.appendChild(_createCell(log.params));
  raw.appendChild(_createCell(log.result));
  raw.appendChild(_createCell(log.exec_time));
  raw.appendChild(_createCell(log.timestamp));
  return raw;
}

function _createCell(value) {
  const cell = document.createElement('td');
  cell.classList.add(TABLE_PROPS.td_class);
  cell.textContent = value;
  return cell;
} 

function getLogs() {
  const savedLogs = localStorage.getItem("logs");
  return savedLogs ? JSON.parse(savedLogs) : [];
}

function putLog(params, result, executionTime, timestamp) {
  const logs = getLogs();
  logs.push({
    "params": params,
    "result": result,
    "exec_time": executionTime,
    "timestamp": timestamp,
  });
  localStorage.setItem("logs", JSON.stringify(logs));
}

generateTable();