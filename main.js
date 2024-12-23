// Mock graph
const nodes = new vis.DataSet([
    { id: 1 },
    { id: 2 },
    { id: 3 },
    { id: 4 },
    { id: 5 }
]);
const edges = new vis.DataSet([
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 2, to: 5 }
]);

const container = document.getElementById('network');

const data = {
    nodes: nodes,
    edges: edges
};

const options = {
    physics: false,
    interaction: {
      zoomView: false,
      dragNodes: true,
      dragView: true,
      selectable: true,
      hover: true
    },
    edges: {
        smooth: false
    },
    nodes: {
        shape: 'dot', // Make all nodes circles
        size: 20, // Set size for all nodes
        color: {
            border: '#02051f',
            background: '#b0b0d1',
            highlight: {
                border: '#161630',
                background: '#526fc4'
            }
        },
        borderWidth: 2 // Set border width
    },
    manipulation: {
      enabled: true
    }
};

// Create the network
const network = new vis.Network(container, data, options);

let selectedNodes = [];

// Adiciona/Remove arestas
network.on("click", function(params) {
    if (params.nodes.length === 1) {
        const clickedNodeId = params.nodes[0];

        // Add the clicked node to the selectedNodes array
        selectedNodes.push(clickedNodeId);

        // If two nodes are selected, create an edge between them
        if (selectedNodes.length === 2) {
            const fromNode = selectedNodes[0];
            const toNode = selectedNodes[1];

            // Check if the IDs are different
            if (fromNode !== toNode) {
                const existingEdge = edges.get({
                    filter: function(edge){
                        return (edge.from === fromNode && edge.to === toNode) ||
                               (edge.from === toNode && edge.to === fromNode);
                    }
                });

                if(existingEdge.length === 0){
                    edges.add({ from: fromNode, to: toNode });
                }
                else{
                    edges.remove(existingEdge);
                }
            }
            // Clicked on the same node, must remove it
            else{
                const connectedEdges = network.getConnectedEdges(clickedNodeId); 
                edges.remove(connectedEdges);
                nodes.remove(clickedNodeId);
            }
            // Clear the selected nodes array for the next edge addition
            selectedNodes = [];
        }
    }
});

// Snap nodes to grid
document.getElementById('snapToGridBtn').addEventListener('click', function() {
    const positions = network.getPositions();
    nodes.forEach(node => {
        const { x, y } = positions[node.id];

        const scale = 100;
        const snappedX = Math.round(x / scale) * scale;
        const snappedY = Math.round(y / scale) * scale;

        // Update the node position
        nodes.update({ id: node.id, x: snappedX, y: snappedY });
    });
});

// Adiciona novos nós com posição aleatória
let nodeId = 6;
document.getElementById('addNodeBtn').addEventListener('click', function() {
    // Posições aleatórias dentro de um intervalo
    const randomX = Math.floor(Math.random() * (container.clientWidth/2 - 500));
    const randomY = Math.floor(Math.random() * (container.clientHeight/2 - 250));

    // Adiciona um novo nó com a posição gerada
    nodes.add({ id: nodeId, x: randomX, y: randomY });
    nodeId++;
});

// Popup Stuff
const modal = document.getElementById("popup");
const openPopupBtn = document.getElementById("popupBtn");
const popupText = document.getElementById("popupText");

// When the user clicks the button, open the modal
openPopupBtn.onclick = function() {
  modal.style.display = "flex";

  let latexText = '\\begin{tikzpicture}[scale=2.2]\n';
  latexText += '\n';

  latexText += '\\tikzstyle{vert} = [circle, draw, inner sep=5pt]\n';
  latexText += '\n';

  const positions = network.getPositions();
  for (const [nodeId, position] of Object.entries(positions)) {
      latexText += `\t\\node[vert] (${nodeId}) at (${position.x/200}, ${-position.y/200}) {};\n`;
  }
  latexText += '\n';

  const allEdges = edges.get();
  allEdges.forEach(edge => {
      latexText += `\t\\draw (${edge.from}) -- (${edge.to});\n`;
  });
  latexText += '\n';

  latexText += '\\end{tikzpicture}\n';

  let formattedText = latexText
    .replace(/\n/g, "<br>")
    .replace(/\t/g, "");

  popupText.innerHTML = formattedText;
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
