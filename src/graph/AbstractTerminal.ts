import { GraphNode } from './GraphNode';
import { Terminal } from './Terminal';

export default class AbstractTerminal implements Terminal {
  public readonly node: GraphNode;
  public readonly id: string;
  public readonly x: number;
  public readonly y: number;
  public readonly name: string;
  public readonly output: boolean;

  constructor(node: GraphNode, name: string, id: string, x: number, y: number, output = false) {
    this.node = node;
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.output = output;
  }
}
