import Axios from 'axios';
import bind from 'bind-decorator';
import { action } from 'mobx';
import { Component, h } from 'preact';
import { ChangeType, Graph, GraphNode } from '../../graph';
import { Parameter } from '../../operators';
import Renderer from '../../render/Renderer';

interface Props {
  parameter: Parameter;
  node: GraphNode;
  graph: Graph;
}

interface State {
  imageName: string;
}

/** Property editor for RGBA colors. */
export default class ImageProperty extends Component<Props, State> {
  private fileEl: HTMLInputElement;

  constructor() {
    super();
    this.state = {
      imageName: null,
    };
  }

  public componentWillMount() {
    const { parameter, node } = this.props;
    const url = node.paramValues.get(parameter.id);
    if (url) {
      Axios.head(url).then(resp => {
        const name = resp.headers['x-amz-meta-name'];
        if (name) {
          this.setState({ imageName: name });
        } else if (name) {
          this.setState({ imageName: null });
        }
      });
    }
  }

  public render({ parameter, node }: Props, { imageName }: State) {
    return (
      <section className="image-property">
        <input
            ref={(el: HTMLInputElement) => { this.fileEl = el; }}
            type="file"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={this.onFileChanged}
        />
        <button onClick={this.onClick}>
          <span className="name">{parameter.name}:&nbsp;</span>
          <span className="value">{imageName}</span>
        </button>
      </section>
    );
  }

  @bind
  private onClick(e: MouseEvent) {
    e.preventDefault();
    this.fileEl.click();
  }

  @action.bound
  private onFileChanged(e: any) {
    const { parameter, node, graph } = this.props;
    const renderer: Renderer = this.context.renderer;
    if (this.fileEl.files.length > 0) {
      const file = this.fileEl.files[0];
      const formData = new FormData();
      formData.append('attachment', file);
      Axios.post('/api/images', formData).then(resp => {
        renderer.loadTexture(resp.data.url, texture => {
          node.glResources.textures.set(parameter.id, texture);
          node.paramValues.set(parameter.id, resp.data.url);
          graph.modified = true;
          node.notifyChange(ChangeType.PARAM_VALUE_CHANGED);
        });
      });
    } else {
      node.paramValues.set(parameter.id, null);
      graph.modified = true;
      node.notifyChange(ChangeType.PARAM_VALUE_CHANGED);
    }
  }
}
