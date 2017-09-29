import { DataType, Operator, Output, Parameter, ParameterType } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import Renderer, { ShaderResource } from '../../render/Renderer';
import ShaderAssembly from '../../render/ShaderAssembly';

interface Resources {
  shader: ShaderResource;
}

function removePragma(s: string): string {
  return s.replace(/#pragma.*/, '');
}

class Noise extends Operator {
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.SCALAR,
  }];

  public readonly params: Parameter[] = [
    {
      id: 'scale_x',
      name: 'Scale X',
      type: ParameterType.INTEGER,
      min: 1,
      max: 100,
      default: 1,
    },
    {
      id: 'scale_y',
      name: 'Scale Y',
      type: ParameterType.INTEGER,
      min: 1,
      max: 100,
      default: 1,
    },
    {
      id: 'offset_z',
      name: 'Z Offset',
      type: ParameterType.FLOAT,
      min: 0,
      max: 200,
      precision: 1,
      increment: 0.1,
      default: 0,
    },
    {
      id: 'scale_value',
      name: 'Value Scale',
      type: ParameterType.FLOAT,
      min: .01,
      max: 2,
      default: 0.7,
      precision: 2,
    },
    {
      id: 'start_band',
      name: 'Start Band',
      type: ParameterType.INTEGER,
      min: 1,
      max: 16,
      default: 1,
    },
    {
      id: 'end_band',
      name: 'End Band',
      type: ParameterType.INTEGER,
      min: 1,
      max: 16,
      default: 8,
    },
    {
      id: 'persistence',
      name: 'Persistence',
      type: ParameterType.FLOAT,
      min: 0,
      max: 1,
      default: 0.5,
      precision: 2,
    },
    {
      id: 'color',
      name: 'Color',
      type: ParameterType.COLOR_GRADIENT,
      max: 32,
      default: [
        {
          value: [0, 0, 0, 1],
          position: 0,
        },
        {
          value: [1, 1, 1, 1],
          position: 1,
        },
      ],
    },
  ];
  public readonly description = `
Generates a periodic Perlin noise texture.
`;

  private noise: string = removePragma(require('glsl-noise/periodic/3d.glsl'));

  constructor() {
    super('generator', 'Noise', 'pattern_noise');
  }

  // Render a node with the specified renderer.
  public render(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (!resources.shader) {
      resources.shader = renderer.compileShaderProgram(this.build(node));
    }

    renderer.executeShaderProgram(resources.shader, gl => {
      renderer.setShaderUniforms(
          this.params,
          resources.shader.program,
          node.paramValues,
          this.uniformPrefix(node.id));
    });
  }

  public readOutputValue(assembly: ShaderAssembly, node: GraphNode, out: string, uv: Expr): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('glsl-noise/periodic/3d.glsl', this.noise);
      assembly.addCommon('gradient-color.glsl', require('./shaders/gradient-color.glsl'));
      assembly.addCommon('periodic-noise.glsl', require('./shaders/periodic-noise.glsl'));
      assembly.finish(node);
    }

    const colorName = this.uniformName(node.id, 'color');
    const args = [
      uv,
      assembly.ident(this.uniformName(node.id, 'scale_x'), DataType.SCALAR),
      assembly.ident(this.uniformName(node.id, 'scale_y'), DataType.SCALAR),
      assembly.ident(this.uniformName(node.id, 'offset_z'), DataType.SCALAR),
      assembly.ident(this.uniformName(node.id, 'scale_value'), DataType.SCALAR),
      assembly.ident(this.uniformName(node.id, 'start_band'), DataType.SCALAR),
      assembly.ident(this.uniformName(node.id, 'end_band'), DataType.SCALAR),
      assembly.ident(this.uniformName(node.id, 'persistence'), DataType.SCALAR),
      assembly.ident(`${colorName}_colors`, DataType.OTHER),
      assembly.ident(`${colorName}_positions`, DataType.OTHER),
    ];
    return assembly.call('periodicNoise', args, DataType.RGBA);
  }

  // Release any GL resources we were holding on to.
  public cleanup(renderer: Renderer, node: GraphNode, resources: Resources) {
    if (resources.shader) {
      renderer.deleteShaderProgram(resources.shader);
      delete resources.shader;
    }
  }
}

export default new Noise();
