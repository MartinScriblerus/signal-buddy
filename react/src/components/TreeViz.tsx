import React, { useMemo, useContext, useEffect } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { TreeContext } from './CreateChuck';

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
  treeContext?: TreeContext;
}

type HierarchyNode = HierarchyPointNode<TreeNode>; // let Array<any> for now

function RootNode(props: { node: { node: HierarchyPointNode<TreeNode> }, getNode: any}) {
  let {node, getNode} = props;

  if (node.node.data.name !== "T") {
    getNode(node.node.data.name);
  }
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

function ParentNode( props: {node: {node: HierarchyPointNode<TreeNode>}, getNode: any}) {
  const { node, getNode } = props
  
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;

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
            getNode(JSON.stringify(node.node.data.name));
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
};

/** Handles rendering Root, Parent, and other Nodes. */
function Node( x: NodeType) {
  const { node, getLatestTreeSettings } = x;
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = !!node.children;

  const getNode = (node: HierarchyNode) => {
    getLatestTreeSettings(node);
  }; 

  if (isRoot) return <RootNode node={{ node: node }} getNode={getNode} />;
  if (isParent) return <ParentNode node={{ node: node }} getNode={getNode} />;
  
  return (
    <Group top={node.x} left={node.y}>
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
          getLatestTreeSettings(JSON.stringify(node.data.name));
          // setChildSettingHook(JSON.stringify(node.data.name));
          alert(`clicked: ${JSON.stringify(node.data.name)}`);
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
  TreeContext: React.Context<any>;
  getLatestTreeSettings: any;
};



export default function Example2({ width, height, margin = defaultMargin, rawTree, TreeContext, getLatestTreeSettings }: TreeProps) {
  const data = useMemo(() => hierarchy(rawTree), []);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  return width < 10 ? null : (
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
              <Node key={`node-${i}`} node={node} getLatestTreeSettings={getLatestTreeSettings} />
            ))}
          </Group>
        )}
      </Tree>
    </svg>
  );
}