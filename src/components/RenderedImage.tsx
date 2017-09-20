import bind from 'bind-decorator';
import { Component, h } from 'preact';
import Node from '../graph/Node';
import Renderer from '../render/Renderer';

interface Props {
  node: Node;
  width: number;
  height: number;
}

export default class RenderedImage extends Component<Props, undefined> {
  private canvas: HTMLCanvasElement;

  public componentDidMount() {
    this.updateCanvas();
    this.props.node.watch(this.updateCanvas);
  }

  public componentWillUnmount() {
    this.props.node.unwatch(this.updateCanvas);
  }

  public render({ width, height }: Props) {
    return (
      <canvas
          className="rendered-image"
          width={width}
          height={height}
          ref={el => this.canvas = el as HTMLCanvasElement}
      />
    );
  }

  @bind
  private updateCanvas() {
    const { node, width, height } = this.props;
    const renderer: Renderer = this.context.renderer;
    const context = this.canvas.getContext('2d');
    renderer.render(node, width, height, context);
  }
}
