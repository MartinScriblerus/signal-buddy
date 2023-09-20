import React, { useMemo, useContext, useEffect } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { Box, Button } from '@mui/material';
import { raw } from 'body-parser';

const peach = '#fd9b93';
const pink = '#fe6e9e';
const blue = '#03c0dc';
const green = '#26deb0';
const plum = '#71248e';
const lightpurple = '#374469';
const white = '#ffffff';
export const background = '#272b4d';

interface TreeNode {
  name: string;
  children?: this[];
  currPosData?: any;
}

type HierarchyNode = HierarchyPointNode<TreeNode>; // let Array<any> for now

function RootNode(props: { node: { node: HierarchyPointNode<TreeNode> }, getNode: any, currPosData: any }) {
  let {node, getNode} = props;

  if (node.node.data.name !== "T") {
    console.log('what is node? ', node.node);
    getNode(node.node);
  }

  useEffect(() => {
    console.log('currPosData in root node: ', props.currPosData);
  }, [props.currPosData]);

  return (
    <Group top={node.node.x} left={node.node.y}>
      <circle r={12} fill="url('#lg')" />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily="Arial"
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={plum}
      >
        {node.node.data.name}
      </text>
    </Group>
  );
}

function ParentNode( props: {node: {node: HierarchyPointNode<TreeNode>}, getNode: any, currPosData: any }) {
  const { node, getNode, currPosData } = props
  
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;
  console.log("????? node: ", node);
  useEffect(() => {
    console.log('currPosData in parent node: ', currPosData);
  }, [currPosData]);

  return (
      <Group top={node.node.x} left={node.node.y}>
        <rect
          height={height}
          width={width}
          y={centerY}
          x={centerX}
          fill={background}
          stroke={blue}
          strokeWidth={1}
          onClick={() => {
            getNode(node.node);          
            alert(`clicked: ${JSON.stringify(node.node.data.name)}`);

          }}
        />
        <text
          dy=".33em"
          fontSize={9}
          fontFamily="Arial"
          textAnchor="middle"
          style={{ pointerEvents: 'none' }}
          fill={white}
        >
          {node.node.data.name}
        </text>
      </Group>
  );
}

type NodeType = {
  node: HierarchyNode;
  getLatestTreeSettings: any;
  currPosData: any; 
};

/** Handles rendering Root, Parent, and other Nodes. */
function Node( x: NodeType) {
  const [selectedNode, setSelectedNode] = React.useState<string>("");
  const { node, getLatestTreeSettings, currPosData } = x;
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = !!node.children;
  console.log('xxxxxxxx: ', x);
  const getNode = (node: HierarchyNode) => {
    return getLatestTreeSettings(node);
  };

  React.useEffect(() => {
    if(selectedNode.indexOf('Inst') !== -1) {
      console.log("There's a Inst in that!");
    }
  }, [selectedNode])

  if (isRoot) return <RootNode node={{ node: node }} getNode={getNode} currPosData={currPosData} />;
  if (isParent) return <ParentNode node={{ node: node }} getNode={getNode} currPosData={currPosData}  />;

  return (
    <Group key={selectedNode} top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={background}
        stroke={green}
        strokeWidth={1}
        strokeDasharray="2,2"
        strokeOpacity={0.6}
        rx={10}
        onClick={() => {
          setSelectedNode(JSON.stringify(node.data.name));
          getLatestTreeSettings(node);
          alert(`clicked: ${JSON.stringify(node.data.name)} / depth: ${node.depth} / root?: ${isRoot} / parent?: ${isParent}`);
        }}
      />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily="Arial"
        textAnchor="middle"
        fill={green}
        style={{ pointerEvents: 'none' }}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

const defaultMargin = { top: 10, left: 80, right: 80, bottom: 10 };

export type TreeProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  rawTree: TreeNode;
  handleUpdateRawTree: any;
  currPosData: any;
  getLatestTreeSettings: any;
  handleAddStep: any;
};

export default function Example2({ width, height, margin = defaultMargin, rawTree, handleUpdateRawTree, currPosData, getLatestTreeSettings, handleAddStep }: TreeProps) {
  const data = useMemo(() => hierarchy(rawTree), [rawTree]);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  const [currName, setCurrName] = React.useState("");
  console.log('CURR POS DATA (where we need it): ', currPosData);
  console.log('CURR TTTT?Reee DATA (where we need it): ', rawTree);
  
  useEffect(() => {
    console.log("GOT CURR POS DATA: ", currPosData);
    console.log("GOT LATEST TREE SETTINGS: ", getLatestTreeSettings);
    // console.log("GOT CURR RAW TREE: ", rawTree);
  }, [currPosData]);
  
  // const handleAddStep = () => {
  //   const name = prompt('What is the name of your new node?');
  //   setCurrName(name);
  //   handleUpdateRawTree(name);
  //   // console.log('nodeName: ', nodeName);
  //   ///rawTree.children.push({name: `${nodeName}_par`, children: [{name: `${nodeName}`}]});
  //   // console.log("WHAT IS THAT RAWTREE ARRAY??? ", rawTree);
  //   console.log("WHAT IS CURR POS ARRAY??? ", currPosData);    
  //   // rawTree.children.push({name: "Inst_2", children:[{name: "FX_2"}, {name: "Pat_2"}]});
  // };
  // const handleRemoveStep = () => {
  //   currPosData.data.children.splice(-1);
  // };

  const handleAddEffect = () => {
    rawTree.children.push({name: "Inst_2", children:[{name: "FX_2"}, {name: "Pat_2"}]});
  };
  const handleRemoveEffect = () => {
    rawTree.children.splice(-1);
  };
  const handleAddPattern = () => {
    rawTree.children.push({name: "Inst_2", children:[{name: "FX_2"}, {name: "Pat_2"}]});
  };
  const handleRemovePattern = () => {
    rawTree.children.splice(-1);
  };
  const handleAddInstrument = () => {
    rawTree.children.push({name: "Inst_2", children:[{name: "FX_2"}, {name: "Pat_2"}]});
  };
  const handleRemoveInstrument = () => {
    rawTree.children.splice(-1);
  };

  return width < 10 ? null : (
    <>

    {/* <Box sx={{position: "absolute"}}>
      {/* <Button onClick={handleAddInstrument}>Add Instrument</Button>
      <Button onClick={handleRemoveInstrument}>Remove Instrument</Button>
      <Button onClick={handleRemoveEffect}>Remove Effect</Button>
      <Button onClick={handleAddPattern}>Add Pattern</Button>
      <Button onClick={handleRemovePattern}>Remove Pattern</Button>
      <Button onClick={handleAddStep}>Add Step</Button>
      <Button onClick={handleRemoveStep}>Remove Step / File</Button>
    </Box> */}

    <svg width={width} height={height}>
      <LinearGradient id="lg" from={peach} to={pink} />
      <rect width={width} height={height} rx={14} fill={background} />
      <Tree<TreeNode> root={data} size={[yMax, xMax]}>
        {(tree) => (
          <Group top={margin.top} left={margin.left}>
            {tree.links().map((link, i) => (
              <LinkHorizontal
                key={`link-${i}`}
                data={link}
                stroke={lightpurple}
                strokeWidth="1"
                fill="none"
              />
            ))}
            {tree.descendants().map((node, i) => (
              <Node key={`node-${i}-${currName}`} node={node} getLatestTreeSettings={getLatestTreeSettings} currPosData={currPosData} />
            ))}
          </Group>
        )}
      </Tree>
    </svg>

    </>
  );
}