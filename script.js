k =  20;
function addRow() {
  const table = document.querySelector("#edges-table tbody");
  const newRow = document.createElement("tr");

  newRow.innerHTML = `
  <td>${k++}</td>
  <td><input type="number" min="1" /></td>
    <td><input type="number" min="1" /></td>
      <td><button class="delete-btn" onclick="deleteRow(this)">🗑️</button></td>
    `;

  table.appendChild(newRow);
}


function deleteRow(button) {
  const row = button.parentElement.parentElement;
  row.parentElement.removeChild(row);
  k--;
  drawGraph();
}

function drawGraph() {
  const rows = document.querySelectorAll("#edges-table tbody tr");
  const edgesData = [];
  const nodeSet = new Set();

  rows.forEach((row, index) => {
    const inputs = row.querySelectorAll("input");
    const from = parseInt(inputs[0].value);
    const to = parseInt(inputs[1].value);

    if (!isNaN(from) && !isNaN(to)) {
      edgesData.push({ from, to, label: `${index + 1}` });
      nodeSet.add(from);
      nodeSet.add(to);
    }
  });

  const nodes = Array.from(nodeSet).map(id => ({
    id,
    label: `${id}`
  }));

  const edges = edgesData.map(edge => ({
    from: edge.from,
    to: edge.to,
    arrows: 'to',
    label: edge.label,
    font: { align: 'middle' }
  }));

  const container = document.getElementById('graph-container');
  const data = { nodes, edges };

  const options = {
    nodes: {
      shape: 'circle',
      color: '#79B4B7',
      font: { color: '#fff', size: 18 }
    },
    edges: {
      color: '#444',
      arrows: { to: { enabled: true, scaleFactor: 1 } },
      smooth: { type: 'cubicBezier', forceDirection: 'horizontal', roundness: 0.4 },
      font: {
        color: 'black',
        strokeWidth: 0,
        size: 14
      }
    },
    physics: {
      enabled: true,
      solver: 'forceAtlas2Based'
    }
  };

  new vis.Network(container, data, options);
}

function deleteLargestCycle() {
  const rows = document.querySelectorAll("#edges-table tbody tr");
  const edges = [];
  const edgeElements = [];

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    if (inputs.length >= 2) {
      const from = parseInt(inputs[0].value);
      const to = parseInt(inputs[1].value);
      if (!isNaN(from) && !isNaN(to)) {
        edges.push([from, to]);
        edgeElements.push({ from, to, element: row });
      }
    }
  });

  const graph = buildGraph(edges);
  const allCycles = [];

  for (let startNode of graph.keys()) {
    const visited = new Set();
    dfs(graph, startNode, startNode, visited, [], allCycles);
  }

  const uniqueCycles = filterUniqueCycles(allCycles);
  if (uniqueCycles.length === 0) {
    alert("Циклы не найдены.");
    return;
  }

  const largestCycle = uniqueCycles.reduce((max, cycle) =>
    cycle.length > max.length ? cycle : max
  );

  const cycleEdges = [];
  for (let i = 0; i < largestCycle.length - 1; i++) {
    cycleEdges.push([largestCycle[i], largestCycle[i + 1]]);
  }

  // Удаляем рёбра из DOM (таблицы)
  cycleEdges.forEach(([from, to]) => {
    for (let i = 0; i < edgeElements.length; i++) {
      const edge = edgeElements[i];
      if (
        (edge.from === from && edge.to === to) ||
        (edge.from === to && edge.to === from)
      ) {
        edge.element.remove();
        edgeElements.splice(i, 1); // Удалим из массива, чтобы не проверять повторно
        break;
      }
    }
  });

  // Перенумеровываем строки и пересчитываем k
  const newRows = document.querySelectorAll("#edges-table tbody tr");
  newRows.forEach((row, index) => {
    row.cells[0].innerText = index + 1;
  });

  k = newRows.length + 1;

  drawGraph();
}

// Строим граф
function buildGraph(edges) {
  const graph = new Map();
  edges.forEach(([from, to]) => {
    if (!graph.has(from)) graph.set(from, []);
    if (!graph.has(to)) graph.set(to, []);
    graph.get(from).push(to);
    graph.get(to).push(from); // если граф ориентированный — убери эту строку
  });
  return graph;
}

// DFS для поиска всех циклов
function dfs(graph, current, target, visited, path, cycles) {
  visited.add(current);
  path.push(current);

  for (let neighbor of graph.get(current)) {
    if (neighbor === target && path.length > 2) {
      cycles.push([...path, target]); // нашли цикл
    } else if (!visited.has(neighbor)) {
      dfs(graph, neighbor, target, new Set(visited), [...path], cycles);
    }
  }
}

// Убираем дубликаты циклов
function filterUniqueCycles(cycles) {
  const seen = new Set();
  const unique = [];

  for (let cycle of cycles) {
    const norm = normalizeCycle(cycle);
    const key = norm.join("-");
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(norm);
    }
  }

  return unique;
}

function normalizeCycle(cycle) {
  const minIndex = cycle.reduce((minIdx, val, idx, arr) => val < arr[minIdx] ? idx : minIdx, 0);
  const rotated = [...cycle.slice(minIndex), ...cycle.slice(0, minIndex)];
  return rotated;
}


function getAdjacencyMatrix(edges) {
  // Найдём максимальный номер вершины
  let maxNode = 0;
  edges.forEach(([from, to]) => {
    maxNode = Math.max(maxNode, from, to);
  });

  // Инициализируем матрицу нулями
  const matrix = Array.from({ length: maxNode }, () =>
    Array(maxNode + 1).fill(0)
  );

  // Заполняем матрицу: для неориентированного графа [from][to] и [to][from]
  edges.forEach(([from, to]) => {
    matrix[from - 1][to - 1] = 1;
    matrix[to - 1][from - 1] = 1;
  });

  return matrix;
}

function showCyclesExceptLargest() {
  const rows = document.querySelectorAll("#edges-table tbody tr");
  const edges = [];

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    if (inputs.length >= 2) {
      const from = parseInt(inputs[0].value);
      const to = parseInt(inputs[1].value);
      if (!isNaN(from) && !isNaN(to)) {
        edges.push([from, to]);
      }
    }
  });

  const graph = buildGraph(edges);
  const allCycles = [];

  for (let startNode of graph.keys()) {
    const visited = new Set();
    dfs(graph, startNode, startNode, visited, [], allCycles);
  }

  const uniqueCycles = filterUniqueCycles(allCycles);
  const outputDiv = document.getElementById("cycles-list");

  if (uniqueCycles.length === 0) {
    outputDiv.innerHTML = "<em>Циклов не найдено.</em>";
    return;
  }

  const largest = uniqueCycles.reduce((max, cycle) => cycle.length > max.length ? cycle : max, []);
  const filtered = uniqueCycles.filter(cycle => cycle.join() !== largest.join());

  if (filtered.length === 0) {
    outputDiv.innerHTML = "<em>Других циклов, кроме самого большого, не найдено.</em>";
    return;
  }

  // 🔥 Удалим дубликаты окончательно по нормализованному виду
  const seen = new Set();
  const uniqueDisplay = [];

  for (let cycle of filtered) {
    const key = normalizeCycle(cycle).join("-");
    if (!seen.has(key)) {
      seen.add(key);
      uniqueDisplay.push(cycle);
    }
  }

  outputDiv.innerHTML = uniqueDisplay
    .map((cycle, idx) => `Цикл ${idx + 1}: [${cycle.join(" → ")}]`)
    .join("<br>");
}

function normalizeCycle(cycle) {
  const path = cycle.slice(0, -1);
  const rotations = path.map((_, i) => path.slice(i).concat(path.slice(0, i)));
  const reversed = rotations.map(r => [...r].reverse());
  const all = rotations.concat(reversed);
  all.sort((a, b) => a.join(',').localeCompare(b.join(',')));
  const canonical = all[0];
  return [...canonical, canonical[0]];
}
