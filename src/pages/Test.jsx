import './Test.css';

const BLOCKS_COUNT = 40;
const COLOR_LIGHT_BG = '#ffffff';
const COLOR_DARK_BG = '#181818';
const COLOR_LIGHT_TEXT = '#ffffff';
const COLOR_DARK_TEXT = '#000000';

export default function Test() {
  const blocks = Array.from({ length: BLOCKS_COUNT }, (_, index) => {
    const isEven = index % 2 === 0;
    const color = isEven ? COLOR_LIGHT_BG : COLOR_DARK_BG;
    const textColor = isEven ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT;
    const label = isEven ? `WHITE BLOCK ${index + 1}` : `DARK BLOCK ${index + 1}`;

    return {
      id: index,
      color,
      textColor,
      label,
    };
  });

  return (
    <div className="test-container">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="test-block"
          style={{
            background: block.color,
            color: block.textColor,
          }}
        >
          {block.label}
        </div>
      ))}
    </div>
  );
}
