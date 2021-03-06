import { DataType, Operator, Output, Parameter } from '..';
import { GraphNode } from '../../graph';
import { Expr } from '../../render/Expr';
import ShaderAssembly from '../../render/ShaderAssembly';

class Bricks extends Operator {
  public readonly outputs: Output[] = [{
    id: 'out',
    name: 'Out',
    type: DataType.FLOAT,
  }];
  public readonly params: Parameter[] = [
    {
      id: 'count_x',
      name: 'Count X',
      type: DataType.INTEGER,
      min: 1,
      max: 16,
      default: 2,
    },
    {
      id: 'count_y',
      name: 'Count Y',
      type: DataType.INTEGER,
      min: 1,
      max: 16,
      default: 4,
    },
    {
      id: 'spacing_x',
      name: 'Spacing X',
      type: DataType.FLOAT,
      min: 0,
      max: .5,
      default: .025,
    },
    {
      id: 'spacing_y',
      name: 'Spacing Y',
      type: DataType.FLOAT,
      min: 0,
      max: .5,
      default: .05,
    },
    {
      id: 'blur_x',
      name: 'Blur X',
      type: DataType.FLOAT,
      min: 0,
      max: .5,
      default: .1,
    },
    {
      id: 'blur_y',
      name: 'Blur Y',
      type: DataType.FLOAT,
      min: 0,
      max: .5,
      default: .2,
    },
    {
      id: 'offset_x',
      name: 'Offset X',
      type: DataType.FLOAT,
      min: 0,
      max: .5,
    },
    {
      id: 'offset_y',
      name: 'Offset Y',
      type: DataType.FLOAT,
      min: 0,
      max: .5,
    },
    {
      id: 'stagger',
      name: 'Stagger',
      type: DataType.FLOAT,
      min: 0,
      max: 1,
      default: .5,
    },
    {
      id: 'corner',
      name: 'Corner Shape',
      type: DataType.INTEGER,
      enumVals: [
        { name: 'Square', value: 0 },
        { name: 'Mitered', value: 1 },
        { name: 'Rounded', value: 2 },
      ],
      default: 0,
    },
  ];
  public readonly description = `
Generates a pattern consisting of alternating rows of bricks.
* **Count X** is the number of bricks along the x-axis.
* **Count Y** is the number of bricks along the y-axis.
* **Spacing X** is the horizontal space between bricks.
* **Spacing Y** is the vertical space between bricks.
* **Blur X** controls the softness of the brick edges in the x direction.
* **Blur Y** controls the softness of the brick edges in the y direction.
* **Offset X** shifts the entire pattern along the X-axis.
* **Offset Y** shifts the entire pattern along the y-axis.
* **Stagger** controls how much the even rows of bricks should be offset relative to the odd rows.
* **Corner** controls the style of the corners (square, round or mitered).
`;

  constructor() {
    super('pattern', 'Bricks', 'pattern_bricks');
  }

  public readOutputValue(
      assembly: ShaderAssembly,
      node: GraphNode,
      output: string,
      uv: Expr): Expr {
    if (assembly.start(node)) {
      assembly.declareUniforms(this, node.id, this.params);
      assembly.addCommon('steppers.glsl', require('./shaders/steppers.glsl'));
      assembly.addCommon('bricks.glsl', require('./shaders/bricks.glsl'));
      assembly.finish(node);
    }

    const args = [
      uv,
      ...this.params.map(param => assembly.uniform(node, param.id)),
    ];
    return assembly.call('bricks', args, DataType.FLOAT);
  }
}

export default new Bricks();
