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
export const background = 'transparent';

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
  console.log('dddddddd: ', x);
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
          alert(`clicked: ${JSON.stringify(node.data.name)} / height: ${node.height} / depth: ${node.depth} / root?: ${isRoot} / parent?: ${isParent}`);
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
  // console.log('WHAT IS PROBLEMATIC RAW TREEE? ', rawTree);
  rawTree.children.map((child: any) => child !== undefined);
  const data = useMemo(() => hierarchy(rawTree), [rawTree]);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  const [currName, setCurrName] = React.useState("");

  return width < 10 ? null : (
    <>
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