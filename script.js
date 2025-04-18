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
  