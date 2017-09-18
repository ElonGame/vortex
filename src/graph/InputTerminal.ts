import { observable } from 'mobx';
import Connection from './Connection';
import Node from './Node';
import Terminal from './Terminal';

export default class InputTerminal implements Terminal {
  public readonly node: Node;
  public readonly x: number;
  public readonly y: number;

  // Single input connections
  @observable public connections?: Connection = null;

  constructor(node: Node) {
    this.node = node;
    this.x = 0;
    this.y = 0;
  }
}
